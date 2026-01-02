import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { host, entries } = await request.json();

    if (!host || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ success: false, error: 'host와 entries 배열 필요' }, { status: 400 });
    }

    // URL에서 path 추출
    const pages = entries.map((url: string) => {
      const urlObj = new URL(url);
      return {
        host,
        path: urlObj.pathname,
        query_key: urlObj.search || null,
        is_active: true,
      };
    });

    // upsert (이미 있으면 무시)
    const { error } = await supabase
      .from('seo_pages')
      .upsert(pages, { 
        onConflict: 'host,path',
        ignoreDuplicates: true 
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: pages.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

