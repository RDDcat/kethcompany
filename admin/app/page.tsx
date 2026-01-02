import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getStats() {
  if (!isSupabaseConfigured) {
    return { hostsCount: 0, pagesCount: 0 };
  }
  
  const [hostsRes, pagesRes] = await Promise.all([
    supabase.from('hosts').select('*', { count: 'exact', head: true }),
    supabase.from('seo_pages').select('*', { count: 'exact', head: true }),
  ]);
  
  return {
    hostsCount: hostsRes.count || 0,
    pagesCount: pagesRes.count || 0,
  };
}

export default async function Dashboard() {
  let stats = { hostsCount: 0, pagesCount: 0 };
  
  try {
    stats = await getStats();
  } catch (e) {
    // Supabase 연결 실패 시 기본값 사용
  }

  return (
    <div>
      <h1 style={styles.title}>대시보드</h1>

      {!isSupabaseConfigured && (
        <div style={styles.warning}>
          ⚠️ Supabase가 설정되지 않았습니다. <code style={styles.code}>.env.local</code> 파일을 확인해주세요.
        </div>
      )}
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.hostsCount}</div>
          <div style={styles.statLabel}>등록된 호스트</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.pagesCount}</div>
          <div style={styles.statLabel}>SEO 설정된 페이지</div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>빠른 시작</h2>
        <ol style={styles.list}>
          <li>호스트 관리에서 도메인을 등록하세요</li>
          <li>사이트맵 크롤링으로 페이지 목록을 가져오세요</li>
          <li>페이지별 SEO 설정을 진행하세요</li>
        </ol>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 30,
    color: '#fff',
  },
  warning: {
    background: '#422006',
    border: '1px solid #854d0e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    color: '#fbbf24',
    fontSize: 14,
  },
  code: {
    background: '#252525',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 24,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 700,
    color: '#3b82f6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  section: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    color: '#fff',
  },
  list: {
    margin: 0,
    paddingLeft: 20,
    color: '#a0a0a0',
  },
};
