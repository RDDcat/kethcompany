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

-- 2. sitemap_entries 테이블 생성 (새로 생성)
CREATE TABLE IF NOT EXISTS sitemap_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  loc TEXT NOT NULL,
  lastmod TIMESTAMPTZ,
  priority DECIMAL(2,1),
  crawled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host, loc)
);

-- 3. 기존 seo_pages 테이블에 컬럼 추가
-- (이미 존재하는 컬럼은 에러 발생하므로 하나씩 실행하거나, 없는 것만 실행)

-- h1 변환 대상 CSS selector
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS h1_selector TEXT;

-- meta description
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS description TEXT;

-- JSON-LD 구조화 데이터
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS json_ld JSONB;

-- canonical URL
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS canonical TEXT;

-- 쿼리 파라미터 조합 (예: "no=43")
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS query_key TEXT;

-- 자동 분석 결과 (참고용)
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS auto_h1 TEXT;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS auto_title TEXT;

-- 활성화 여부
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 타임스탬프 (없으면 추가)
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hosts_domain ON hosts(domain);
CREATE INDEX IF NOT EXISTS idx_seo_pages_host ON seo_pages(host);
CREATE INDEX IF NOT EXISTS idx_seo_pages_host_path ON seo_pages(host, path);
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_host ON sitemap_entries(host);

-- ============================================
-- 완료! 
-- hosts: 도메인 관리
-- seo_pages: 페이지별 SEO 설정 (기존 + 확장)
-- sitemap_entries: 사이트맵 크롤링 결과
-- ============================================
