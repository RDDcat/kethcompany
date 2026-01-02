'use client';

import { useState, useEffect } from 'react';
import { supabase, type Host, type SitemapEntry } from '@/lib/supabase';

export default function SitemapPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlLog, setCrawlLog] = useState<string[]>([]);

  useEffect(() => {
    fetchHosts();
  }, []);

  async function fetchHosts() {
    const { data } = await supabase.from('hosts').select('*').order('domain');
    if (data) {
      setHosts(data);
      if (data.length > 0) {
        setSelectedHost(data[0]);
        fetchEntries(data[0].domain);
      }
    }
    setLoading(false);
  }

  async function fetchEntries(host: string) {
    const { data } = await supabase
      .from('sitemap_entries')
      .select('*')
      .eq('host', host)
      .order('loc');
    
    if (data) {
      setEntries(data);
    }
  }

  async function handleCrawl() {
    if (!selectedHost?.sitemap_url) {
      alert('사이트맵 URL이 설정되지 않았습니다.');
      return;
    }

    setCrawling(true);
    setCrawlLog(['크롤링 시작...']);

    try {
      // API 라우트 호출
      const res = await fetch('/api/crawl-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost.domain,
          sitemapUrl: selectedHost.sitemap_url,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setCrawlLog(prev => [...prev, `완료! ${result.count}개 URL 등록됨`]);
        fetchEntries(selectedHost.domain);
      } else {
        setCrawlLog(prev => [...prev, `오류: ${result.error}`]);
      }
    } catch (e) {
      setCrawlLog(prev => [...prev, `오류: ${e}`]);
    }

    setCrawling(false);
  }

  async function handleRegisterPages() {
    if (entries.length === 0) {
      alert('등록할 항목이 없습니다.');
      return;
    }

    setCrawlLog(['페이지 등록 시작...']);

    try {
      const res = await fetch('/api/register-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost?.domain,
          entries: entries.map(e => e.loc),
        }),
      });

      const result = await res.json();

      if (result.success) {
        setCrawlLog(prev => [...prev, `완료! ${result.count}개 페이지 등록됨`]);
      } else {
        setCrawlLog(prev => [...prev, `오류: ${result.error}`]);
      }
    } catch (e) {
      setCrawlLog(prev => [...prev, `오류: ${e}`]);
    }
  }

  return (
    <div>
      <h1 style={styles.title}>사이트맵 크롤링</h1>

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>호스트 선택:</label>
        <select
          value={selectedHost?.domain || ''}
          onChange={e => {
            const host = hosts.find(h => h.domain === e.target.value);
            setSelectedHost(host || null);
            if (host) fetchEntries(host.domain);
          }}
          style={styles.select}
        >
          {hosts.map(host => (
            <option key={host.id} value={host.domain}>{host.domain}</option>
          ))}
        </select>
      </div>

      {selectedHost && (
        <div style={styles.infoCard}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>사이트맵 URL:</span>
            <span style={styles.infoValue}>
              {selectedHost.sitemap_url || '(설정되지 않음)'}
            </span>
          </div>
          <div style={styles.buttons}>
            <button
              style={styles.crawlBtn}
              onClick={handleCrawl}
              disabled={crawling || !selectedHost.sitemap_url}
            >
              {crawling ? '크롤링 중...' : '사이트맵 크롤링'}
            </button>
            <button
              style={styles.registerBtn}
              onClick={handleRegisterPages}
              disabled={entries.length === 0}
            >
              seo_pages 테이블에 등록
            </button>
          </div>
        </div>
      )}

      {crawlLog.length > 0 && (
        <div style={styles.logBox}>
          {crawlLog.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>로딩 중...</p>
      ) : entries.length === 0 ? (
        <p style={styles.empty}>크롤링된 URL이 없습니다.</p>
      ) : (
        <div style={styles.entriesSection}>
          <h2 style={styles.sectionTitle}>
            크롤링된 URL ({entries.length}개)
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>URL</th>
                <th style={styles.th}>Last Modified</th>
                <th style={styles.th}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td style={styles.td}>
                    <a href={entry.loc} target="_blank" rel="noopener">
                      {new URL(entry.loc).pathname}
                    </a>
                  </td>
                  <td style={styles.td}>
                    {entry.lastmod ? new Date(entry.lastmod).toLocaleDateString() : '-'}
                  </td>
                  <td style={styles.td}>{entry.priority ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 30,
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  filterLabel: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  select: {
    padding: '8px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#e5e5e5',
    fontSize: 14,
    minWidth: 200,
  },
  infoCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    display: 'flex',
    marginBottom: 16,
  },
  infoLabel: {
    width: 120,
    color: '#666',
    fontSize: 14,
  },
  infoValue: {
    color: '#a0a0a0',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  buttons: {
    display: 'flex',
    gap: 12,
  },
  crawlBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
  registerBtn: {
    padding: '10px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
  logBox: {
    background: '#0f0f0f',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#22c55e',
  },
  loading: {
    color: '#a0a0a0',
  },
  empty: {
    color: '#a0a0a0',
    textAlign: 'center',
    padding: 40,
  },
  entriesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 16,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    color: '#a0a0a0',
    fontSize: 13,
    fontWeight: 500,
  },
  td: {
    padding: '10px 16px',
    borderBottom: '1px solid #252525',
    color: '#e5e5e5',
    fontSize: 13,
  },
};

