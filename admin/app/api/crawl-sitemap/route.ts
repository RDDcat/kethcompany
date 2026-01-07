import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 단일 sitemap XML에서 URL 추출
async function parseSitemap(xml: string): Promise<Array<{ loc: string; lastmod: string | null; priority: number | null }>> {
  const entries: Array<{ loc: string; lastmod: string | null; priority: number | null }> = [];
  
  const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g);
  
  for (const match of urlMatches) {
    const urlBlock = match[1];
    
    const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
    const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
    const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);

    if (locMatch) {
      // &amp; -> & 변환
      const loc = locMatch[1].trim().replace(/&amp;/g, '&');
      entries.push({
        loc,
        lastmod: lastmodMatch ? lastmodMatch[1].trim() : null,
        priority: priorityMatch ? parseFloat(priorityMatch[1]) : null,
      });
    }
  }
  
  return entries;
}

// Sitemap index에서 하위 sitemap URL 추출
function parseSitemapIndex(xml: string): string[] {
  const sitemaps: string[] = [];
  const matches = xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g);
  
  for (const match of matches) {
    const locMatch = match[1].match(/<loc>(.*?)<\/loc>/);
    if (locMatch) {
      sitemaps.push(locMatch[1].trim().replace(/&amp;/g, '&'));
    }
  }
  
  return sitemaps;
}

export async function POST(request: NextRequest) {
  try {
    const { host, sitemapUrl, scanName } = await request.json();

    if (!host || !sitemapUrl) {
      return NextResponse.json({ success: false, error: 'host와 sitemapUrl 필요' }, { status: 400 });
    }

    // 사이트맵 XML 가져오기
    const res = await fetch(sitemapUrl);
    if (!res.ok) {
      return NextResponse.json({ success: false, error: '사이트맵 가져오기 실패' }, { status: 400 });
    }

    const xml = await res.text();

    // 먼저 스캔 기록 생성
    const { data: scanData, error: scanError } = await supabase
      .from('sitemap_scans')
      .insert({ host, name: scanName || null, url_count: 0 })
      .select()
      .single();

    if (scanError || !scanData) {
      return NextResponse.json({ success: false, error: scanError?.message || '스캔 생성 실패' }, { status: 500 });
    }

    const scanId = scanData.id;

    const entries: Array<{
      host: string;
      scan_id: string;
      loc: string;
      lastmod: string | null;
      priority: number | null;
    }> = [];

    // Sitemap Index인지 확인 (<sitemapindex> 태그 존재)
    const isSitemapIndex = xml.includes('<sitemapindex');

    if (isSitemapIndex) {
      // Sitemap Index: 각 하위 sitemap을 크롤링
      const sitemapUrls = parseSitemapIndex(xml);
      console.log(`Sitemap Index detected. Found ${sitemapUrls.length} sub-sitemaps.`);

      for (const subUrl of sitemapUrls) {
        try {
          console.log(`Fetching sub-sitemap: ${subUrl}`);
          const subRes = await fetch(subUrl);
          if (subRes.ok) {
            const subXml = await subRes.text();
            const subEntries = await parseSitemap(subXml);
            
            for (const entry of subEntries) {
              entries.push({
                host,
                scan_id: scanId,
                ...entry,
              });
            }
            console.log(`Found ${subEntries.length} URLs in ${subUrl}`);
          }
        } catch (e) {
          console.error(`Failed to fetch ${subUrl}:`, e);
        }
      }
    } else {
      // 일반 Sitemap
      const urlEntries = await parseSitemap(xml);
      
      for (const entry of urlEntries) {
        entries.push({
          host,
          scan_id: scanId,
          ...entry,
        });
      }
    }

    if (entries.length === 0) {
      // 스캔 기록 삭제
      await supabase.from('sitemap_scans').delete().eq('id', scanId);
      return NextResponse.json({ success: false, error: 'URL을 찾을 수 없음' }, { status: 400 });
    }

    // 새 데이터 삽입 (배치로 나눠서)
    const batchSize = 500;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const { error } = await supabase.from('sitemap_entries').insert(batch);
      
      if (error) {
        console.error(`Batch insert error at ${i}:`, error.message);
        // 스캔 기록 삭제
        await supabase.from('sitemap_scans').delete().eq('id', scanId);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    // 스캔 기록 업데이트 (URL 개수)
    await supabase
      .from('sitemap_scans')
      .update({ url_count: entries.length })
      .eq('id', scanId);

    return NextResponse.json({ success: true, count: entries.length, scanId });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
