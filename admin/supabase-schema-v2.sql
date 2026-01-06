-- ============================================
-- KETHcompany SEO Admin Schema V2
-- 버전 관리 기능 추가
-- ============================================

-- 1. hosts 테이블
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT,
  sitemap_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. sitemap_scans 테이블 (이름 추가)
CREATE TABLE IF NOT EXISTS sitemap_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  name TEXT,  -- 스캔 이름 (예: "2024-01 스캔")
  url_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. sitemap_entries 테이블
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

-- 4. seo_page_versions 테이블 (SEO 페이지 버전 관리)
CREATE TABLE IF NOT EXISTS seo_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  name TEXT NOT NULL,  -- 버전 이름 (예: "v1.0", "테스트 버전")
  description TEXT,
  is_active BOOLEAN DEFAULT false,  -- Workers가 이 버전을 사용할지
  source_scan_id UUID REFERENCES sitemap_scans(id),  -- 어떤 스캔에서 생성됐는지
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. seo_pages 테이블 (버전별 SEO 설정)
-- 기존 테이블 구조 유지하면서 version_id 추가
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES seo_page_versions(id) ON DELETE CASCADE;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS h1_selector TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS json_ld JSONB;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS canonical TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS query_key TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. 인덱스
CREATE INDEX IF NOT EXISTS idx_seo_pages_version_id ON seo_pages(version_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_host_path ON seo_pages(host, path);
CREATE INDEX IF NOT EXISTS idx_seo_page_versions_host ON seo_page_versions(host);
CREATE INDEX IF NOT EXISTS idx_seo_page_versions_active ON seo_page_versions(host, is_active);
CREATE INDEX IF NOT EXISTS idx_sitemap_scans_host ON sitemap_scans(host);
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_scan_id ON sitemap_entries(scan_id);

-- 7. RLS 비활성화 (개발용)
ALTER TABLE hosts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_scans DISABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- sitemap_scans에 name 컬럼 추가 (기존 테이블용)
-- ============================================
ALTER TABLE sitemap_scans ADD COLUMN IF NOT EXISTS name TEXT;

-- ============================================
-- Workers 조회용 뷰 (활성 버전의 SEO 설정만)
-- ============================================
CREATE OR REPLACE VIEW active_seo_pages AS
SELECT 
  sp.host,
  sp.path,
  sp.title,
  sp.h1_selector,
  sp.description,
  sp.json_ld,
  sp.canonical
FROM seo_pages sp
JOIN seo_page_versions spv ON sp.version_id = spv.id
WHERE spv.is_active = true;


