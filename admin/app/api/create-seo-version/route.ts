import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { host, name, description, scanId, entries } = await request.json();

    if (!host || !name || !entries || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'host, name, entries 필요' },
        { status: 400 }
      );
    }

    // 1. 버전 생성
    const { data: versionData, error: versionError } = await supabase
      .from('seo_page_versions')
      .insert({
        host,
        name,
        description: description || null,
        is_active: false,
        source_scan_id: scanId || null,
      })
      .select()
      .single();

    if (versionError || !versionData) {
      return NextResponse.json(
        { success: false, error: versionError?.message || '버전 생성 실패' },
        { status: 500 }
      );
    }

    const versionId = versionData.id;

    // 핵심 파라미터만 추출하여 정규화된 path 생성
    function normalizePath(urlStr: string): string | null {
      try {
        const url = new URL(urlStr);
        const pathname = url.pathname;
        const params = url.searchParams;
        
        // 핵심 파라미터 목록 (순서 유지)
        const keyParams = ["id", "no"];
        
        const normalized = new URLSearchParams();
        for (const key of keyParams) {
          if (params.has(key)) {
            normalized.set(key, params.get(key)!);
          }
        }
        
        const queryStr = normalized.toString();
        return queryStr ? pathname + "?" + queryStr : pathname;
      } catch {
        return null;
      }
    }

    // 2. SEO 페이지 생성 (각 URL에 대해, 정규화된 path 사용)
    const seenPaths = new Set<string>();
    const pages = entries.map((loc: string) => {
      const normalizedPath = normalizePath(loc);
      if (!normalizedPath) return null;
      
      // 중복 제거
      if (seenPaths.has(normalizedPath)) return null;
      seenPaths.add(normalizedPath);
      
      return {
        host,
        path: normalizedPath,
        version_id: versionId,
        title: null,
        h1_selector: null,
        description: null,
        json_ld: null,
        canonical: null,
        is_active: true,
      };
    }).filter(Boolean);

    if (pages.length === 0) {
      // 버전 삭제
      await supabase.from('seo_page_versions').delete().eq('id', versionId);
      return NextResponse.json(
        { success: false, error: '유효한 URL이 없습니다' },
        { status: 400 }
      );
    }

    const { error: pagesError } = await supabase
      .from('seo_pages')
      .insert(pages);

    if (pagesError) {
      // 버전 삭제
      await supabase.from('seo_page_versions').delete().eq('id', versionId);
      return NextResponse.json(
        { success: false, error: pagesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      versionId,
      count: pages.length,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}

