import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { host, sitemapUrl } = await request.json();

    if (!host || !sitemapUrl) {
      return NextResponse.json({ success: false, error: 'host와 sitemapUrl 필요' }, { status: 400 });
    }

    // 사이트맵 XML 가져오기
    const res = await fetch(sitemapUrl);
    if (!res.ok) {
      return NextResponse.json({ success: false, error: '사이트맵 가져오기 실패' }, { status: 400 });
    }

    const xml = await res.text();

    // 간단한 XML 파싱 (정규식 사용)
    const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g);
    const entries: Array<{
      host: string;
      loc: string;
      lastmod: string | null;
      priority: number | null;
    }> = [];

    for (const match of urlMatches) {
      const urlBlock = match[1];
      
      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
      const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);

      if (locMatch) {
        entries.push({
          host,
          loc: locMatch[1].trim(),
          lastmod: lastmodMatch ? lastmodMatch[1].trim() : null,
          priority: priorityMatch ? parseFloat(priorityMatch[1]) : null,
        });
      }
    }

    if (entries.length === 0) {
      return NextResponse.json({ success: false, error: 'URL을 찾을 수 없음' }, { status: 400 });
    }

    // 기존 데이터 삭제
    await supabase.from('sitemap_entries').delete().eq('host', host);

    // 새 데이터 삽입
    const { error } = await supabase.from('sitemap_entries').insert(entries);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: entries.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

