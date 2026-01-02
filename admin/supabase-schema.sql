-- ============================================
-- KETHcompany SEO Admin Schema
-- 기존 seo_pages 테이블이 있는 경우 실행
-- ============================================

-- 1. hosts 테이블 생성 (새로 생성)
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT,
  sitemap_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. sitemap_scans 테이블 (스캔 버전 관리)
CREATE TABLE IF NOT EXISTS sitemap_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  url_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. sitemap_entries 테이블 (스캔 결과)
CREATE TABLE IF NOT EXISTS sitemap_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  scan_id UUID REFERENCES sitemap_scans(id) ON DELETE CASCADE,
  loc TEXT NOT NULL,
  lastmod TIMESTAMPTZ,
  priority DECIMAL(2,1),
  crawled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host, scan_id, loc)
);

-- 4. 기존 seo_pages 테이블에 컬럼 추가
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS h1_selector TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS json_ld JSONB;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS canonical TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS query_key TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS auto_h1 TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS auto_title TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hosts_domain ON hosts(domain);
CREATE INDEX IF NOT EXISTS idx_seo_pages_host ON seo_pages(host);
CREATE INDEX IF NOT EXISTS idx_seo_pages_host_path ON seo_pages(host, path);
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_host ON sitemap_entries(host);
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_scan_id ON sitemap_entries(scan_id);
CREATE INDEX IF NOT EXISTS idx_sitemap_scans_host ON sitemap_scans(host);

-- ============================================
-- 기존 sitemap_entries에 scan_id 컬럼 추가 (이미 테이블이 있는 경우)
-- ============================================
ALTER TABLE sitemap_entries ADD COLUMN IF NOT EXISTS scan_id UUID REFERENCES sitemap_scans(id) ON DELETE CASCADE;

-- ============================================
-- RLS 정책 (필요시)
-- ============================================
-- ALTER TABLE seo_pages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sitemap_entries DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sitemap_scans DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE hosts DISABLE ROW LEVEL SECURITY;
