import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as iconv from 'iconv-lite';

type AiModel = 'heuristic' | 'openai' | 'claude';

interface GenerateRequest {
  versionId: string;
  host: string;
  pageIds: string[]; // 선택된 페이지 ID들 (비어있으면 전체)
  fields: {
    title: boolean;
    description: boolean;
    json_ld: boolean;
    canonical: boolean;
    h1_selector: boolean;
  };
  model: AiModel;
  apiKey?: string; // 클라이언트에서 전달된 API 키
}

export async function POST(request: NextRequest) {
  const body: GenerateRequest = await request.json();
  const { versionId, host, pageIds, fields, model = 'heuristic', apiKey } = body;

  // 디버깅 로그
  console.log('=== AI Generate SEO (Streaming) ===');
  console.log('Model:', model);
  console.log('API Key received:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');

  // API 키 결정
  const openaiKey = model === 'openai' ? (apiKey || process.env.OPENAI_API_KEY) : process.env.OPENAI_API_KEY;
  const claudeKey = model === 'claude' ? (apiKey || process.env.ANTHROPIC_API_KEY) : process.env.ANTHROPIC_API_KEY;

  // 스트리밍 응답 생성
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // 헬퍼 함수: 이벤트 전송
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 유효성 검사
        if (!versionId || !host) {
          sendEvent({ type: 'error', error: 'versionId, host 필요' });
          controller.close();
          return;
        }

        if (!fields.title && !fields.description && !fields.json_ld && !fields.canonical && !fields.h1_selector) {
          sendEvent({ type: 'error', error: '적용할 필드를 선택하세요' });
          controller.close();
          return;
        }

        // 대상 페이지 조회
        let query = supabase
          .from('seo_pages')
          .select('*')
          .eq('version_id', versionId);

        if (pageIds && pageIds.length > 0) {
          query = query.in('id', pageIds);
        }

        const { data: pages, error: pagesError } = await query;

        if (pagesError || !pages) {
          sendEvent({ type: 'error', error: pagesError?.message || '페이지 조회 실패' });
          controller.close();
          return;
        }

        const total = pages.length;
        sendEvent({ type: 'init', total, model });

        // 결과 저장용
        const results: { pageId: string; path: string; status: 'success' | 'error'; message?: string; model?: string }[] = [];
        let usedModel = model;

        // 딜레이 함수
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // 각 페이지 처리
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          console.log(`Processing page ${i + 1}/${pages.length}: ${page.path}`);
          
          // 진행 상황 전송
          sendEvent({ type: 'progress', current: i + 1, total, path: page.path });
          
          // Rate Limit 방지 딜레이
          if (model !== 'heuristic' && i > 0) {
            await delay(500);
          }

          try {
            // 1. 페이지 크롤링 (HTTPS 먼저 시도, 실패하면 HTTP로 폴백)
            let fullUrl = `https://${host}${page.path}`;
            let fetchResult = await fetchPageContent(fullUrl);

            // HTTPS 실패 시 HTTP로 재시도
            if (!fetchResult.html) {
              console.log(`HTTPS failed, trying HTTP for ${page.path}`);
              fullUrl = `http://${host}${page.path}`;
              fetchResult = await fetchPageContent(fullUrl);
            }

            if (!fetchResult.html) {
              results.push({ pageId: page.id, path: page.path, status: 'error', message: `페이지 로드 실패: ${fetchResult.error || '알 수 없는 오류'}`, model: usedModel });
              continue;
            }
            
            const pageContent = fetchResult.html;

            // 2. AI로 SEO 데이터 생성
            const seoData = await generateSeoWithModel(
              pageContent,
              fullUrl,
              fields,
              model,
              openaiKey,
              claudeKey
            );

            if (!seoData || seoData.error) {
              results.push({ 
                pageId: page.id, 
                path: page.path, 
                status: 'error', 
                message: seoData?.error || 'AI 생성 실패', 
                model: seoData?.usedModel || usedModel 
              });
              continue;
            }

            usedModel = seoData.usedModel || model;

            // 3. DB 업데이트
            const updateData: Record<string, unknown> = {
              updated_at: new Date().toISOString(),
            };

            if (fields.title && seoData.title) updateData.title = seoData.title;
            if (fields.description && seoData.description) updateData.description = seoData.description;
            if (fields.json_ld && seoData.json_ld) updateData.json_ld = seoData.json_ld;
            if (fields.canonical && seoData.canonical) updateData.canonical = seoData.canonical;
            if (fields.h1_selector && seoData.h1_selector) updateData.h1_selector = seoData.h1_selector;

            const { error: updateError } = await supabase
              .from('seo_pages')
              .update(updateData)
              .eq('id', page.id);

            if (updateError) {
              results.push({ pageId: page.id, path: page.path, status: 'error', message: updateError.message, model: usedModel });
            } else {
              results.push({ pageId: page.id, path: page.path, status: 'success', model: usedModel });
            }
          } catch (e) {
            results.push({ pageId: page.id, path: page.path, status: 'error', message: String(e), model: usedModel });
          }
        }

        const successCount = results.filter(r => r.status === 'success').length;
        const errorCount = results.filter(r => r.status === 'error').length;

        // AI 생성 완료 플래그 업데이트 (시도만 해도 검토 가능하게)
        console.log('Updating ai_generated flag for version:', versionId);
        const { error: flagError } = await supabase
          .from('seo_page_versions')
          .update({
            ai_generated: true,
            ai_generated_at: new Date().toISOString(),
          })
          .eq('id', versionId);
        
        if (flagError) {
          console.error('Failed to update ai_generated flag:', flagError.message);
        } else {
          console.log('ai_generated flag updated successfully');
        }

        // 완료 이벤트 전송
        sendEvent({ 
          type: 'complete', 
          success: true,
          total,
          successCount,
          errorCount,
          model: usedModel,
          results,
        });
      } catch (e) {
        sendEvent({ type: 'error', error: String(e) });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// 페이지 HTML 가져오기 (인코딩 자동 감지)
async function fetchPageContent(url: string): Promise<{ html: string | null; error?: string }> {
  try {
    console.log(`Fetching page: ${url}`);
    
    // SSL 검증 우회를 위해 https 모듈 사용
    const https = await import('https');
    const http = await import('http');
    const { URL } = await import('url');
    
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const { buffer, contentType } = await new Promise<{ buffer: Buffer; contentType: string }>((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Host': parsedUrl.hostname,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
        rejectUnauthorized: false, // SSL 검증 우회
        timeout: 15000,
      };
      
      const req = client.request(options, (res) => {
        // 리다이렉트 처리
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).toString();
          console.log(`Redirecting to: ${redirectUrl}`);
          fetchPageContent(redirectUrl).then(result => {
            if (result.html) {
              resolve({ buffer: Buffer.from(result.html, 'utf8'), contentType: 'text/html; charset=utf-8' });
            } else {
              reject(new Error(result.error || 'Redirect failed'));
            }
          }).catch(reject);
          return;
        }
        
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        const chunks: Buffer[] = [];
        const ct = res.headers['content-type'] || '';
        
        res.on('data', (chunk: Buffer) => { chunks.push(chunk); });
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, contentType: ct });
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
    
    // 인코딩 감지 및 디코딩
    const html = decodeHtml(buffer, contentType);
    
    console.log(`Page loaded: ${html.length} chars`);
    
    if (html.length < 100) {
      return { html: null, error: '페이지 내용이 너무 짧음' };
    }
    
    return { html };
  } catch (e) {
    const error = e as Error & { cause?: Error };
    let errorMessage = error.message || String(e);
    
    // 더 자세한 에러 정보 추출
    if (error.cause) {
      errorMessage += ` (원인: ${error.cause.message || error.cause})`;
    }
    
    // 일반적인 에러 유형 설명
    if (errorMessage.includes('ENOTFOUND')) {
      errorMessage = `DNS 조회 실패 - 도메인을 찾을 수 없음`;
    } else if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = `연결 거부됨 - 서버가 응답하지 않음`;
    } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('aborted')) {
      errorMessage = `타임아웃 - 서버 응답이 너무 느림`;
    } else if (errorMessage.includes('CERT') || errorMessage.includes('SSL')) {
      errorMessage = `SSL 인증서 오류`;
    }
    
    console.error(`Fetch error for ${url}:`, errorMessage, error.cause || '');
    return { html: null, error: errorMessage };
  }
}

// HTML 버퍼를 문자열로 디코딩 (인코딩 자동 감지)
function decodeHtml(buffer: Buffer, contentType: string): string {
  // 1. Content-Type 헤더에서 charset 확인
  let charset = extractCharset(contentType);
  
  // 2. 헤더에 없으면 HTML meta 태그에서 확인 (일단 latin1로 읽어서 확인)
  if (!charset) {
    const tempHtml = buffer.toString('latin1');
    charset = detectCharsetFromHtml(tempHtml);
  }
  
  // 3. 인코딩 이름 정규화
  charset = normalizeCharset(charset || 'utf-8');
  
  console.log(`Detected charset: ${charset}`);
  
  // 4. iconv-lite로 디코딩
  let result: string;
  if (iconv.encodingExists(charset)) {
    result = iconv.decode(buffer, charset);
  } else {
    console.log(`Unsupported charset ${charset}, falling back to utf-8`);
    result = buffer.toString('utf8');
  }
  
  // 5. 깨진 문자 감지 (replacement character가 많으면 EUC-KR로 재시도)
  const brokenCharCount = (result.match(/\uFFFD/g) || []).length;
  if (brokenCharCount > 5 && charset !== 'euc-kr') {
    console.log(`Detected ${brokenCharCount} broken chars, retrying with EUC-KR`);
    const eucKrResult = iconv.decode(buffer, 'euc-kr');
    const eucKrBrokenCount = (eucKrResult.match(/\uFFFD/g) || []).length;
    
    // EUC-KR이 더 나으면 사용
    if (eucKrBrokenCount < brokenCharCount) {
      console.log(`EUC-KR has fewer broken chars (${eucKrBrokenCount} vs ${brokenCharCount}), using EUC-KR`);
      return eucKrResult;
    }
  }
  
  return result;
}

// Content-Type 헤더에서 charset 추출
function extractCharset(contentType: string): string | null {
  const match = contentType.match(/charset=([^\s;]+)/i);
  return match ? match[1].replace(/["']/g, '') : null;
}

// HTML meta 태그에서 charset 감지
function detectCharsetFromHtml(html: string): string | null {
  // <meta charset="...">
  let match = html.match(/<meta\s+charset=["']?([^"'\s>]+)/i);
  if (match) return match[1];
  
  // <meta http-equiv="Content-Type" content="...; charset=...">
  match = html.match(/<meta[^>]+content=["'][^"']*charset=([^"'\s;]+)/i);
  if (match) return match[1];
  
  // <meta http-equiv="Content-Type" content="..."
  match = html.match(/<meta[^>]+http-equiv=["']?Content-Type["']?[^>]+content=["'][^"']*charset=([^"'\s;]+)/i);
  if (match) return match[1];
  
  return null;
}

// 인코딩 이름 정규화
function normalizeCharset(charset: string): string {
  const lower = charset.toLowerCase().replace(/[_-]/g, '');
  
  const mapping: Record<string, string> = {
    'euckr': 'euc-kr',
    'eucjp': 'euc-jp',
    'gb2312': 'gb2312',
    'gbk': 'gbk',
    'big5': 'big5',
    'shiftjis': 'shift_jis',
    'sjis': 'shift_jis',
    'iso88591': 'iso-8859-1',
    'latin1': 'iso-8859-1',
    'utf8': 'utf-8',
    'utf16': 'utf-16',
    'ksc5601': 'euc-kr',
    'ksc56011987': 'euc-kr',
    'ksksc56011987': 'euc-kr',
    'windows949': 'euc-kr',
    'cp949': 'euc-kr',
  };
  
  return mapping[lower] || charset;
}

// 모델별 SEO 데이터 생성 (선택한 모델만 사용, 폴백 없음)
async function generateSeoWithModel(
  html: string,
  url: string,
  fields: GenerateRequest['fields'],
  model: AiModel,
  openaiKey?: string,
  claudeKey?: string
): Promise<{
  title?: string;
  description?: string;
  json_ld?: object;
  canonical?: string;
  h1_selector?: string;
  usedModel?: string;
  error?: string;
} | null> {
  // HTML에서 텍스트 추출 (간략화)
  const textContent = extractTextContent(html);
  const existingTitle = extractExistingTitle(html);
  const existingH1 = extractExistingH1(html);
  const possibleH1Selectors = findPossibleH1Selectors(html);

  // 휴리스틱 모델 선택 시
  if (model === 'heuristic') {
    const result = generateWithHeuristics(html, url, fields, existingTitle, existingH1, possibleH1Selectors);
    return result ? { ...result, usedModel: 'heuristic' } : { error: '휴리스틱 생성 실패' };
  }

  // OpenAI 모델 선택 시
  if (model === 'openai') {
    if (!openaiKey) {
      return { error: 'OpenAI API 키가 없음' };
    }
    const result = await generateWithOpenAI(textContent, url, fields, existingTitle, existingH1, possibleH1Selectors, openaiKey);
    if (!result) return { error: 'OpenAI 응답 없음' };
    if (result.error) return { error: result.error, usedModel: 'openai' };
    return { ...result, usedModel: 'openai' };
  }

  // Claude 모델 선택 시
  if (model === 'claude') {
    if (!claudeKey) {
      return { error: 'Claude API 키가 없음' };
    }
    const result = await generateWithClaude(textContent, url, fields, existingTitle, existingH1, possibleH1Selectors, claudeKey);
    if (!result) return { error: 'Claude 응답 없음' };
    if (result.error) return { error: result.error, usedModel: 'claude' };
    return { ...result, usedModel: 'claude' };
  }

  return { error: '알 수 없는 모델' };
}

// SEO 프롬프트 생성
function buildSeoPrompt(
  textContent: string,
  url: string,
  fields: GenerateRequest['fields'],
  existingTitle: string,
  existingH1: string,
  possibleH1Selectors: string[]
): string {
  const fieldsToGenerate = [];
  if (fields.title) fieldsToGenerate.push('title (60자 이내)');
  if (fields.description) fieldsToGenerate.push('description (160자 이내)');
  if (fields.json_ld) fieldsToGenerate.push('json_ld (Schema.org FAQPage 또는 WebPage 형식)');
  if (fields.canonical) fieldsToGenerate.push('canonical URL');
  if (fields.h1_selector) fieldsToGenerate.push(`h1_selector (사용 가능한 셀렉터: ${possibleH1Selectors.join(', ')})`);

  return `다음 웹페이지 콘텐츠를 분석하여 SEO 메타데이터를 생성해주세요.

URL: ${url}
기존 title: ${existingTitle || '없음'}
기존 h1: ${existingH1 || '없음'}

페이지 콘텐츠 (일부):
${textContent.substring(0, 3000)}

생성할 필드: ${fieldsToGenerate.join(', ')}

응답은 반드시 JSON 형식으로만 해주세요:
{
  ${fields.title ? '"title": "생성된 제목",' : ''}
  ${fields.description ? '"description": "생성된 설명",' : ''}
  ${fields.json_ld ? '"json_ld": { ... Schema.org 객체 ... },' : ''}
  ${fields.canonical ? '"canonical": "정규 URL",' : ''}
  ${fields.h1_selector ? '"h1_selector": "CSS 셀렉터"' : ''}
}`;
}

// OpenAI API 호출
async function generateWithOpenAI(
  textContent: string,
  url: string,
  fields: GenerateRequest['fields'],
  existingTitle: string,
  existingH1: string,
  possibleH1Selectors: string[],
  apiKey: string
): Promise<{
  title?: string;
  description?: string;
  json_ld?: object;
  canonical?: string;
  h1_selector?: string;
  error?: string;
} | null> {
  const prompt = buildSeoPrompt(textContent, url, fields, existingTitle, existingH1, possibleH1Selectors);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'SEO 전문가로서 웹페이지 메타데이터를 생성합니다. 반드시 유효한 JSON만 응답합니다.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('OpenAI API Error:', res.status, errorData);
      return { error: `OpenAI API 오류 (${res.status}): ${errorData.error?.message || '알 수 없는 오류'}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return null;

    // JSON 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

// Claude API 호출
async function generateWithClaude(
  textContent: string,
  url: string,
  fields: GenerateRequest['fields'],
  existingTitle: string,
  existingH1: string,
  possibleH1Selectors: string[],
  apiKey: string
): Promise<{
  title?: string;
  description?: string;
  json_ld?: object;
  canonical?: string;
  h1_selector?: string;
  error?: string;
} | null> {
  const prompt = buildSeoPrompt(textContent, url, fields, existingTitle, existingH1, possibleH1Selectors);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: 'SEO 전문가로서 웹페이지 메타데이터를 생성합니다. 반드시 유효한 JSON만 응답합니다.',
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Claude API Error:', res.status, errorData);
      return { error: `Claude API 오류 (${res.status}): ${errorData.error?.message || '알 수 없는 오류'}` };
    }

    const data = await res.json();
    const content = data.content?.[0]?.text;

    if (!content) return { error: 'Claude 응답이 비어있음' };

    // JSON 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: 'JSON 파싱 실패' };

    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { error: `Claude 호출 실패: ${String(e)}` };
  }
}

// 휴리스틱 기반 생성 (OpenAI 없을 때)
function generateWithHeuristics(
  html: string,
  url: string,
  fields: GenerateRequest['fields'],
  existingTitle: string,
  existingH1: string,
  possibleH1Selectors: string[]
): {
  title?: string;
  description?: string;
  json_ld?: object;
  canonical?: string;
  h1_selector?: string;
} {
  const result: {
    title?: string;
    description?: string;
    json_ld?: object;
    canonical?: string;
    h1_selector?: string;
  } = {};

  // Title: 기존 h1이 있으면 사용, 없으면 기존 title 사용
  if (fields.title) {
    result.title = existingH1 || existingTitle || 'Page Title';
    // 60자 제한
    if (result.title.length > 60) {
      result.title = result.title.substring(0, 57) + '...';
    }
  }

  // Description: 페이지에서 첫 문단 추출
  if (fields.description) {
    const textContent = extractTextContent(html);
    const sentences = textContent.split(/[.!?]/).filter(s => s.trim().length > 20);
    result.description = sentences.slice(0, 2).join('. ').substring(0, 160);
    if (!result.description) {
      result.description = existingTitle || existingH1 || 'Page description';
    }
  }

  // Canonical: 현재 URL 정규화
  if (fields.canonical) {
    try {
      const urlObj = new URL(url);
      // 핵심 파라미터만 유지
      const normalized = new URLSearchParams();
      ['id', 'no'].forEach(key => {
        if (urlObj.searchParams.has(key)) {
          normalized.set(key, urlObj.searchParams.get(key)!);
        }
      });
      result.canonical = urlObj.origin + urlObj.pathname + (normalized.toString() ? '?' + normalized.toString() : '');
    } catch {
      result.canonical = url;
    }
  }

  // H1 Selector: 가장 적절한 셀렉터 선택
  if (fields.h1_selector && possibleH1Selectors.length > 0) {
    // 우선순위: data-seo-heading > .post-title > #title > 첫 번째
    const priority = ['[data-seo-heading]', '.post-title', '#post-title', '.title', '#title'];
    result.h1_selector = priority.find(s => possibleH1Selectors.includes(s)) || possibleH1Selectors[0];
  }

  // JSON-LD: 기본 WebPage 스키마
  if (fields.json_ld) {
    result.json_ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': result.title || existingTitle || existingH1,
      'description': result.description || '',
      'url': result.canonical || url,
    };
  }

  return result;
}

// HTML에서 텍스트 추출
function extractTextContent(html: string): string {
  // 스크립트, 스타일 태그 제거
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  // 태그 제거
  text = text.replace(/<[^>]+>/g, ' ');
  // 공백 정리
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// 기존 title 태그 추출
function extractExistingTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '';
}

// 기존 h1 태그 추출
function extractExistingH1(html: string): string {
  const match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  return match ? match[1].trim() : '';
}

// h1으로 사용 가능한 셀렉터 찾기
function findPossibleH1Selectors(html: string): string[] {
  const selectors: string[] = [];
  
  // data-seo-heading 속성 찾기
  if (html.includes('data-seo-heading')) {
    selectors.push('[data-seo-heading]');
  }

  // 일반적인 제목 패턴 찾기
  const patterns = [
    { regex: /class=["'][^"']*post-title[^"']*["']/i, selector: '.post-title' },
    { regex: /class=["'][^"']*page-title[^"']*["']/i, selector: '.page-title' },
    { regex: /class=["'][^"']*entry-title[^"']*["']/i, selector: '.entry-title' },
    { regex: /class=["'][^"']*article-title[^"']*["']/i, selector: '.article-title' },
    { regex: /class=["'][^"']*main-title[^"']*["']/i, selector: '.main-title' },
    { regex: /id=["']post-title["']/i, selector: '#post-title' },
    { regex: /id=["']title["']/i, selector: '#title' },
    { regex: /<h1[^>]*>/i, selector: 'h1' },
    { regex: /<h2[^>]*>/i, selector: 'h2' },
  ];

  patterns.forEach(({ regex, selector }) => {
    if (regex.test(html) && !selectors.includes(selector)) {
      selectors.push(selector);
    }
  });

  return selectors;
}

