import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 환경변수가 없으면 더미 클라이언트 생성 (에러 방지)
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 환경변수 설정 여부 확인
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// 타입 정의
export interface Host {
  id: string;
  domain: string;
  name: string | null;
  sitemap_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoPage {
  id: string;
  host: string;
  path: string;
  query_key: string | null;
  version_id: string | null;  // SEO 페이지 버전 ID
  
  // SEO 설정
  h1_selector: string | null;
  title: string | null;
  description: string | null;
  json_ld: object | null;
  canonical: string | null;
  
  // 자동 분석 결과
  auto_h1: string | null;
  auto_title: string | null;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitemapScan {
  id: string;
  host: string;
  name: string | null;
  url_count: number;
  created_at: string;
}

export interface SeoPageVersion {
  id: string;
  host: string;
  name: string;
  description: string | null;
  is_active: boolean;
  source_scan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SitemapEntry {
  id: string;
  host: string;
  scan_id: string | null;
  loc: string;
  lastmod: string | null;
  priority: number | null;
  crawled_at: string;
}
