import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json(
        { success: false, error: 'versionId 필요' },
        { status: 400 }
      );
    }

    // CASCADE로 연결된 seo_pages도 함께 삭제됨
    const { error } = await supabase
      .from('seo_page_versions')
      .delete()
      .eq('id', versionId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}

