import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { scanId } = await request.json();

    if (!scanId) {
      return NextResponse.json({ success: false, error: 'scanId 필요' }, { status: 400 });
    }

    // CASCADE로 sitemap_entries도 자동 삭제됨
    const { error } = await supabase
      .from('sitemap_scans')
      .delete()
      .eq('id', scanId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

