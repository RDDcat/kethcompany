import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // 간단한 XML 파싱 (정규식 사용)
    const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g);
    const entries: Array<{
      host: string;
      scan_id: string;
      loc: string;
      lastmod: string | null;
      priority: number | null;
    }> = [];

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

    for (const match of urlMatches) {
      const urlBlock = match[1];
      
      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
      const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);

      if (locMatch) {
        // &amp; -> & 변환
        const loc = locMatch[1].trim().replace(/&amp;/g, '&');
        entries.push({
          host,
          scan_id: scanId,
          loc,
          lastmod: lastmodMatch ? lastmodMatch[1].trim() : null,
          priority: priorityMatch ? parseFloat(priorityMatch[1]) : null,
        });
      }
    }

    if (entries.length === 0) {
      // 스캔 기록 삭제
      await supabase.from('sitemap_scans').delete().eq('id', scanId);
      return NextResponse.json({ success: false, error: 'URL을 찾을 수 없음' }, { status: 400 });
    }

    // 새 데이터 삽입
    const { error } = await supabase.from('sitemap_entries').insert(entries);

    if (error) {
      // 스캔 기록 삭제
      await supabase.from('sitemap_scans').delete().eq('id', scanId);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
