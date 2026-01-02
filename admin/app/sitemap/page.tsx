'use client';

import { useState, useEffect } from 'react';
import { supabase, type Host, type SitemapScan, type SeoPageVersion } from '@/lib/supabase';

interface SitemapEntry {
  id: string;
  loc: string;
  lastmod: string | null;
  priority: number | null;
}

export default function SitemapPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [scans, setScans] = useState<SitemapScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<SitemapScan | null>(null);
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [versions, setVersions] = useState<SeoPageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlLog, setCrawlLog] = useState<string[]>([]);
  
  // 스캔 이름 입력
  const [scanName, setScanName] = useState('');
  
  // 버전 생성 모달
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    if (selectedHost) {
      fetchScans(selectedHost.domain);
      fetchVersions(selectedHost.domain);
    }
  }, [selectedHost]);

  useEffect(() => {
    if (selectedScan) {
      fetchEntries(selectedScan.id);
    } else {
      setEntries([]);
    }
  }, [selectedScan]);

  async function fetchHosts() {
    const { data } = await supabase.from('hosts').select('*').order('domain');
    if (data) {
      setHosts(data);
      if (data.length > 0) {
        setSelectedHost(data[0]);
      }
    }
    setLoading(false);
  }

  async function fetchScans(host: string) {
    const { data } = await supabase
      .from('sitemap_scans')
      .select('*')
      .eq('host', host)
      .order('created_at', { ascending: false });
    
    if (data) {
      setScans(data);
      setSelectedScan(data.length > 0 ? data[0] : null);
    } else {
      setScans([]);
      setSelectedScan(null);
    }
  }

  async function fetchVersions(host: string) {
    const { data } = await supabase
      .from('seo_page_versions')
      .select('*')
      .eq('host', host)
      .order('created_at', { ascending: false });
    
    if (data) {
      setVersions(data);
    } else {
      setVersions([]);
    }
  }

  async function fetchEntries(scanId: string) {
    const { data } = await supabase
      .from('sitemap_entries')
      .select('*')
      .eq('scan_id', scanId)
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
      const res = await fetch('/api/crawl-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost.domain,
          sitemapUrl: selectedHost.sitemap_url,
          scanName: scanName || `스캔 ${new Date().toLocaleDateString('ko-KR')}`,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setCrawlLog(prev => [...prev, `완료! ${result.count}개 URL 등록됨`]);
        setScanName('');
        fetchScans(selectedHost.domain);
      } else {
        setCrawlLog(prev => [...prev, `오류: ${result.error}`]);
      }
    } catch (e) {
      setCrawlLog(prev => [...prev, `오류: ${e}`]);
    }

    setCrawling(false);
  }

  async function handleDeleteScan(scanId: string) {
    if (!confirm('이 스캔 기록을 삭제하시겠습니까? 관련된 모든 URL도 삭제됩니다.')) {
      return;
    }

    const res = await fetch('/api/delete-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId }),
    });

    const result = await res.json();

    if (result.success) {
      fetchScans(selectedHost!.domain);
    } else {
      alert('삭제 실패: ' + result.error);
    }
  }

  async function handleCreateVersion() {
    if (!newVersionName.trim()) {
      alert('버전 이름을 입력하세요.');
      return;
    }

    if (!selectedScan) {
      alert('스캔을 선택하세요.');
      return;
    }

    setCrawlLog(['SEO 버전 생성 중...']);

    try {
      const res = await fetch('/api/create-seo-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost?.domain,
          name: newVersionName,
          description: newVersionDesc,
          scanId: selectedScan.id,
          entries: entries.map(e => e.loc),
        }),
      });

      const result = await res.json();

      if (result.success) {
        setCrawlLog(prev => [...prev, `완료! 버전 "${newVersionName}" 생성됨 (${result.count}개 페이지)`]);
        setShowVersionModal(false);
        setNewVersionName('');
        setNewVersionDesc('');
        fetchVersions(selectedHost!.domain);
      } else {
        setCrawlLog(prev => [...prev, `오류: ${result.error}`]);
      }
    } catch (e) {
      setCrawlLog(prev => [...prev, `오류: ${e}`]);
    }
  }

  async function handleActivateVersion(versionId: string) {
    try {
      const res = await fetch('/api/activate-seo-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost?.domain,
          versionId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        fetchVersions(selectedHost!.domain);
      } else {
        alert('활성화 실패: ' + result.error);
      }
    } catch (e) {
      alert('오류: ' + e);
    }
  }

  async function handleDeleteVersion(versionId: string) {
    if (!confirm('이 버전을 삭제하시겠습니까? 관련된 모든 SEO 페이지 설정도 삭제됩니다.')) {
      return;
    }

    try {
      const res = await fetch('/api/delete-seo-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      const result = await res.json();

      if (result.success) {
        fetchVersions(selectedHost!.domain);
      } else {
        alert('삭제 실패: ' + result.error);
      }
    } catch (e) {
      alert('오류: ' + e);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('ko-KR');
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
          <div style={styles.crawlRow}>
            <input
              type="text"
              value={scanName}
              onChange={e => setScanName(e.target.value)}
              placeholder="스캔 이름 (선택사항)"
              style={styles.scanNameInput}
            />
            <button
              style={styles.crawlBtn}
              onClick={handleCrawl}
              disabled={crawling || !selectedHost.sitemap_url}
            >
              {crawling ? '크롤링 중...' : '사이트맵 크롤링'}
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

      {/* SEO 버전 목록 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>SEO 페이지 버전</h2>
        {versions.length === 0 ? (
          <p style={styles.empty}>생성된 버전이 없습니다.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>버전 이름</th>
                <th style={styles.th}>설명</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>생성일</th>
                <th style={styles.th}>액션</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(version => (
                <tr key={version.id}>
                  <td style={styles.td}>
                    <a 
                      href={`/pages?version=${version.id}`}
                      style={styles.versionLink}
                    >
                      {version.name}
                    </a>
                  </td>
                  <td style={styles.td}>{version.description || '-'}</td>
                  <td style={styles.td}>
                    {version.is_active ? (
                      <span style={styles.activeBadge}>활성</span>
                    ) : (
                      <span style={styles.inactiveBadge}>비활성</span>
                    )}
                  </td>
                  <td style={styles.td}>{formatDate(version.created_at)}</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      {!version.is_active && (
                        <button
                          style={styles.activateBtn}
                          onClick={() => handleActivateVersion(version.id)}
                        >
                          활성화
                        </button>
                      )}
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteVersion(version.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 스캔 기록 */}
      {scans.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>스캔 기록</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>스캔 이름</th>
                <th style={styles.th}>스캔 일시</th>
                <th style={styles.th}>URL 수</th>
                <th style={styles.th}>액션</th>
              </tr>
            </thead>
            <tbody>
              {scans.map(scan => (
                <tr 
                  key={scan.id} 
                  style={{
                    ...styles.scanRow,
                    ...(selectedScan?.id === scan.id ? styles.scanRowSelected : {})
                  }}
                  onClick={() => setSelectedScan(scan)}
                >
                  <td style={styles.td}>{scan.name || '(이름 없음)'}</td>
                  <td style={styles.td}>{formatDate(scan.created_at)}</td>
                  <td style={styles.td}>{scan.url_count}개</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.versionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScan(scan);
                          setShowVersionModal(true);
                        }}
                      >
                        버전 생성
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScan(scan.id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 선택된 스캔의 URL 목록 */}
      {selectedScan && entries.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            크롤링된 URL ({entries.length}개)
            <span style={styles.scanDate}>
              - {selectedScan.name || formatDate(selectedScan.created_at)}
            </span>
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
                      {(() => {
                        try {
                          const url = new URL(entry.loc);
                          return url.pathname + url.search;
                        } catch {
                          return entry.loc;
                        }
                      })()}
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

      {loading && <p style={styles.loading}>로딩 중...</p>}

      {/* 버전 생성 모달 */}
      {showVersionModal && (
        <div style={modalStyles.overlay} onClick={() => setShowVersionModal(false)}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={modalStyles.title}>SEO 버전 생성</h2>
            <p style={modalStyles.subtitle}>
              선택된 스캔: {selectedScan?.name || formatDate(selectedScan?.created_at || '')}
              ({entries.length}개 URL)
            </p>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>버전 이름 *</label>
              <input
                type="text"
                value={newVersionName}
                onChange={e => setNewVersionName(e.target.value)}
                placeholder="예: v1.0, 테스트 버전"
                style={modalStyles.input}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>설명 (선택)</label>
              <textarea
                value={newVersionDesc}
                onChange={e => setNewVersionDesc(e.target.value)}
                placeholder="버전에 대한 설명"
                style={modalStyles.textarea}
                rows={3}
              />
            </div>

            <div style={modalStyles.buttons}>
              <button 
                style={modalStyles.cancelBtn} 
                onClick={() => setShowVersionModal(false)}
              >
                취소
              </button>
              <button 
                style={modalStyles.saveBtn} 
                onClick={handleCreateVersion}
              >
                생성
              </button>
            </div>
          </div>
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
  crawlRow: {
    display: 'flex',
    gap: 12,
  },
  scanNameInput: {
    flex: 1,
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#e5e5e5',
    fontSize: 14,
  },
  crawlBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 16,
  },
  scanDate: {
    fontSize: 13,
    fontWeight: 400,
    color: '#666',
    marginLeft: 8,
  },
  empty: {
    color: '#666',
    fontSize: 14,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
  },
  scanRow: {
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  scanRowSelected: {
    background: '#252525',
  },
  loading: {
    color: '#a0a0a0',
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
  actionButtons: {
    display: 'flex',
    gap: 8,
  },
  versionBtn: {
    padding: '6px 12px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
  },
  activateBtn: {
    padding: '6px 12px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
  },
  versionLink: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
  activeBadge: {
    padding: '4px 8px',
    background: '#22c55e',
    color: '#fff',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  inactiveBadge: {
    padding: '4px 8px',
    background: '#333',
    color: '#a0a0a0',
    borderRadius: 4,
    fontSize: 11,
  },
};

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    color: '#a0a0a0',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#e5e5e5',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#e5e5e5',
    fontSize: 14,
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#333',
    color: '#e5e5e5',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
  },
};
