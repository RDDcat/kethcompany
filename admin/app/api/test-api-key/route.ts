import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ success: false, error: 'provider와 apiKey 필요' });
    }

    if (provider === 'openai') {
      return await testOpenAI(apiKey);
    }

    if (provider === 'claude') {
      return await testClaude(apiKey);
    }

    return NextResponse.json({ success: false, error: '알 수 없는 provider' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}

async function testOpenAI(apiKey: string) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "OK" only.' }],
        max_tokens: 5,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ 
        success: true, 
        message: '✓ OpenAI API 키가 유효합니다!',
        model: data.model,
      });
    }

    const errorData = await res.json().catch(() => ({}));
    
    if (res.status === 401) {
      return NextResponse.json({ 
        success: false, 
        error: 'API 키가 유효하지 않습니다. 키를 확인해주세요.' 
      });
    }
    
    if (res.status === 429) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate Limit 초과. 잠시 후 다시 시도하거나 결제 정보를 확인하세요.' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: `API 오류 (${res.status}): ${errorData.error?.message || '알 수 없는 오류'}` 
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: `연결 실패: ${String(e)}` });
  }
}

async function testClaude(apiKey: string) {
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
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Say "OK" only.' }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ 
        success: true, 
        message: '✓ Claude API 키가 유효합니다!',
        model: data.model,
      });
    }

    const errorData = await res.json().catch(() => ({}));
    
    if (res.status === 401) {
      return NextResponse.json({ 
        success: false, 
        error: 'API 키가 유효하지 않습니다. 키를 확인해주세요.' 
      });
    }
    
    if (res.status === 429) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate Limit 초과. 잠시 후 다시 시도하세요.' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: `API 오류 (${res.status}): ${errorData.error?.message || '알 수 없는 오류'}` 
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: `연결 실패: ${String(e)}` });
  }
}

