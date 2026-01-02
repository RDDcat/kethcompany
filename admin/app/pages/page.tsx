'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, type SeoPage, type Host, type SeoPageVersion } from '@/lib/supabase';

export default function PagesPage() {
  const searchParams = useSearchParams();
  const versionIdFromUrl = searchParams.get('version');
  
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [versions, setVersions] = useState<SeoPageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    if (selectedHost) {
      fetchVersions(selectedHost);
    }
  }, [selectedHost]);

  useEffect(() => {
    if (selectedVersion) {
      fetchPages(selectedVersion);
    } else {
      setPages([]);
    }
  }, [selectedVersion]);

  async function fetchHosts() {
    const { data } = await supabase.from('hosts').select('*').order('domain');
    if (data && data.length > 0) {
      setHosts(data);
      setSelectedHost(data[0].domain);
    }
    setLoading(false);
  }

  async function fetchVersions(host: string) {
    const { data } = await supabase
      .from('seo_page_versions')
      .select('*')
      .eq('host', host)
      .order('created_at', { ascending: false });
    
    if (data) {
      setVersions(data);
      
      // URL에서 버전 ID가 있으면 선택
      if (versionIdFromUrl) {
        const version = data.find(v => v.id === versionIdFromUrl);
        if (version) {
          setSelectedVersion(version.id);
          return;
        }
      }
      
      // 활성 버전이 있으면 선택, 없으면 첫 번째
      const activeVersion = data.find(v => v.is_active);
      if (activeVersion) {
        setSelectedVersion(activeVersion.id);
      } else if (data.length > 0) {
        setSelectedVersion(data[0].id);
      } else {
        setSelectedVersion('');
      }
    } else {
      setVersions([]);
      setSelectedVersion('');
    }
  }

  async function fetchPages(versionId: string) {
    setLoading(true);
    const { data } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('version_id', versionId)
      .order('path');
    
    if (data) {
      setPages(data);
    }
    setLoading(false);
  }

  async function handleSave(page: SeoPage) {
    const { error } = await supabase
      .from('seo_pages')
      .update({
        h1_selector: page.h1_selector,
        title: page.title,
        description: page.description,
        json_ld: page.json_ld,
        canonical: page.canonical,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    if (!error) {
      setEditingPage(null);
      fetchPages(selectedVersion);
    } else {
      alert('저장 실패: ' + error.message);
    }
  }

  async function handleDelete(pageId: string) {
    if (!confirm('이 페이지 설정을 삭제하시겠습니까?')) {
      return;
    }

    const { error } = await supabase
      .from('seo_pages')
      .delete()
      .eq('id', pageId);

    if (!error) {
      fetchPages(selectedVersion);
    } else {
      alert('삭제 실패: ' + error.message);
    }
  }

  const selectedVersionData = versions.find(v => v.id === selectedVersion);

  return (
    <div>
      <h1 style={styles.title}>페이지별 SEO 설정</h1>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>호스트:</label>
          <select
            value={selectedHost}
            onChange={e => {
              setSelectedHost(e.target.value);
              setSelectedVersion('');
            }}
            style={styles.select}
          >
            {hosts.map(host => (
              <option key={host.id} value={host.domain}>{host.domain}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>버전:</label>
          <select
            value={selectedVersion}
            onChange={e => setSelectedVersion(e.target.value)}
            style={styles.select}
          >
            {versions.length === 0 ? (
              <option value="">버전 없음</option>
            ) : (
              versions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.name} {version.is_active ? '(활성)' : ''}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedVersionData && (
        <div style={styles.versionInfo}>
          <span style={styles.versionName}>{selectedVersionData.name}</span>
          {selectedVersionData.is_active ? (
            <span style={styles.activeBadge}>Workers 활성</span>
          ) : (
            <span style={styles.inactiveBadge}>비활성</span>
          )}
          {selectedVersionData.description && (
            <span style={styles.versionDesc}>{selectedVersionData.description}</span>
          )}
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>로딩 중...</p>
      ) : versions.length === 0 ? (
        <div style={styles.empty}>
          <p>생성된 SEO 버전이 없습니다.</p>
          <p style={styles.hint}>사이트맵 크롤링 후 버전을 생성하세요.</p>
        </div>
      ) : pages.length === 0 ? (
        <div style={styles.empty}>
          <p>등록된 페이지가 없습니다.</p>
        </div>
      ) : (
        <div style={styles.pageList}>
          {pages.map(page => (
            <div key={page.id} style={styles.pageCard}>
              <div style={styles.pageHeader}>
                <div style={styles.pagePath}>{page.path}</div>
                <div style={styles.pageActions}>
                  <button
                    style={styles.editBtn}
                    onClick={() => setEditingPage(page)}
                  >
                    수정
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(page.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div style={styles.pageInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>h1 Selector:</span>
                  <span style={styles.infoValue}>{page.h1_selector || '(기본 정책)'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Title:</span>
                  <span style={styles.infoValue}>{page.title || '(자동)'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Description:</span>
                  <span style={styles.infoValue}>
                    {page.description ? page.description.substring(0, 50) + '...' : '(자동)'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      {editingPage && (
        <EditModal
          page={editingPage}
          onSave={handleSave}
          onClose={() => setEditingPage(null)}
        />
      )}
    </div>
  );
}

function EditModal({
  page,
  onSave,
  onClose,
}: {
  page: SeoPage;
  onSave: (page: SeoPage) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(page);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={modalStyles.title}>SEO 설정 수정</h2>
        <p style={modalStyles.path}>{page.path}</p>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>
            h1 Selector
            <span style={modalStyles.hint}>비워두면 기본 정책 적용</span>
          </label>
          <input
            type="text"
            value={formData.h1_selector || ''}
            onChange={e => setFormData({ ...formData, h1_selector: e.target.value || null })}
            placeholder="#post-title, .main-heading 등"
            style={modalStyles.input}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={e => setFormData({ ...formData, title: e.target.value || null })}
            placeholder="페이지 제목"
            style={modalStyles.input}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Description</label>
          <textarea
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value || null })}
            placeholder="페이지 설명"
            style={modalStyles.textarea}
            rows={3}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Canonical URL</label>
          <input
            type="text"
            value={formData.canonical || ''}
            onChange={e => setFormData({ ...formData, canonical: e.target.value || null })}
            placeholder="비워두면 현재 URL 사용"
            style={modalStyles.input}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>JSON-LD (JSON 형식)</label>
          <textarea
            value={formData.json_ld ? JSON.stringify(formData.json_ld, null, 2) : ''}
            onChange={e => {
              try {
                const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                setFormData({ ...formData, json_ld: parsed });
              } catch {
                // 파싱 실패 시 무시
              }
            }}
            placeholder='{"@context": "https://schema.org", ...}'
            style={modalStyles.textarea}
            rows={5}
          />
        </div>

        <div style={modalStyles.buttons}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>취소</button>
          <button style={modalStyles.saveBtn} onClick={() => onSave(formData)}>저장</button>
        </div>
      </div>
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
    gap: 24,
    marginBottom: 20,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
    minWidth: 180,
  },
  versionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    marginBottom: 20,
  },
  versionName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
  },
  versionDesc: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
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
  loading: {
    color: '#a0a0a0',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#a0a0a0',
  },
  hint: {
    fontSize: 13,
    color: '#666',
  },
  pageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  pageCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 16,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pagePath: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#3b82f6',
  },
  pageActions: {
    display: 'flex',
    gap: 8,
  },
  editBtn: {
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
  pageInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  infoRow: {
    display: 'flex',
    fontSize: 13,
  },
  infoLabel: {
    width: 120,
    color: '#666',
  },
  infoValue: {
    color: '#a0a0a0',
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
    maxWidth: 600,
    maxHeight: '90vh',
    overflow: 'auto',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
  },
  path: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#3b82f6',
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
  hint: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
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
    fontFamily: 'monospace',
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
