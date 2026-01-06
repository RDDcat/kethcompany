import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { host, versionId } = await request.json();

    if (!host || !versionId) {
      return NextResponse.json(
        { success: false, error: 'host와 versionId 필요' },
        { status: 400 }
      );
    }

    // 1. 해당 호스트의 모든 버전 비활성화
    const { error: deactivateError } = await supabase
      .from('seo_page_versions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('host', host);

    if (deactivateError) {
      return NextResponse.json(
        { success: false, error: deactivateError.message },
        { status: 500 }
      );
    }

    // 2. 선택한 버전만 활성화
    const { error: activateError } = await supabase
      .from('seo_page_versions')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', versionId);

    if (activateError) {
      return NextResponse.json(
        { success: false, error: activateError.message },
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


