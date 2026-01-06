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
  const [showAiModal, setShowAiModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
          
          {/* AI 생성 전: AI 자동 생성 버튼 / AI 생성 후: 검토하기 버튼 */}
          {!selectedVersionData.ai_generated ? (
            <button
              style={styles.aiBtn}
              onClick={() => setShowAiModal(true)}
              disabled={pages.length === 0}
            >
              🤖 AI 자동 생성
            </button>
          ) : (
            <button
              style={styles.reviewBtn}
              onClick={() => setShowReviewModal(true)}
              disabled={pages.length === 0}
            >
              ✅ 검토하기 ({pages.filter(p => p.reviewed).length}/{pages.length})
            </button>
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

      {/* AI 자동 생성 모달 */}
      {showAiModal && (
        <AiGenerateModal
          host={selectedHost}
          versionId={selectedVersion}
          pages={pages}
          onClose={() => setShowAiModal(false)}
          onComplete={() => {
            setShowAiModal(false);
            fetchVersions(selectedHost); // 버전 정보 갱신 (ai_generated 플래그)
            fetchPages(selectedVersion);
          }}
        />
      )}

      {/* 검토 모달 */}
      {showReviewModal && (
        <ReviewModal
          host={selectedHost}
          pages={pages}
          onClose={() => setShowReviewModal(false)}
          onUpdate={() => fetchPages(selectedVersion)}
        />
      )}
    </div>
  );
}

type AiModel = 'heuristic' | 'openai' | 'claude';

function AiGenerateModal({
  host,
  versionId,
  pages,
  onClose,
  onComplete,
}: {
  host: string;
  versionId: string;
  pages: SeoPage[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [fields, setFields] = useState({
    title: true,
    description: true,
    json_ld: false,
    canonical: false,
    h1_selector: false,
  });
  const [selectedModel, setSelectedModel] = useState<AiModel>('heuristic');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    total: number;
    current: number;
    status: string;
    model: string;
    results: { path: string; status: string; message?: string; model?: string }[];
  } | null>(null);

  // 로컬 스토리지에서 API 키 가져오기
  function getApiKey(model: AiModel): string | null {
    if (typeof window === 'undefined') return null;
    const settings = localStorage.getItem('ai-api-settings');
    if (!settings) return null;
    const parsed = JSON.parse(settings);
    if (model === 'openai') return parsed.openaiKey || null;
    if (model === 'claude') return parsed.claudeKey || null;
    return null;
  }

  async function handleGenerate() {
    if (!Object.values(fields).some(Boolean)) {
      alert('적용할 필드를 하나 이상 선택하세요');
      return;
    }

    // API 키 확인 (휴리스틱 제외)
    if (selectedModel !== 'heuristic') {
      const apiKey = getApiKey(selectedModel);
      if (!apiKey) {
        const modelName = selectedModel === 'openai' ? 'OpenAI' : 'Claude';
        alert(`${modelName} API 키가 설정되지 않았습니다.\n설정 메뉴에서 API 키를 등록하세요.`);
        return;
      }
    }

    setProcessing(true);
    setProgress({
      total: pages.length,
      current: 0,
      status: '처리 중...',
      model: selectedModel,
      results: [],
    });

    try {
      const apiKey = getApiKey(selectedModel);
      const res = await fetch('/api/ai-generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          host,
          pageIds: [], // 전체 페이지
          fields,
          model: selectedModel,
          apiKey: apiKey, // 로컬에서 가져온 키 전달
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProgress({
          total: data.total,
          current: data.total,
          status: '완료!',
          model: data.model || selectedModel,
          results: data.results || [],
        });

        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setProgress(prev => prev ? { ...prev, status: '오류: ' + data.error } : null);
      }
    } catch (e) {
      setProgress(prev => prev ? { ...prev, status: '오류: ' + String(e) } : null);
    } finally {
      setProcessing(false);
    }
  }

  function getModelLabel(model: AiModel) {
    switch (model) {
      case 'heuristic': return '📊 휴리스틱';
      case 'openai': return '🤖 ChatGPT (GPT-4o-mini)';
      case 'claude': return '🧠 Claude (3.5 Sonnet)';
    }
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <h2 style={modalStyles.title}>🤖 AI 자동 SEO 생성</h2>
        <p style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 24 }}>
          AI가 실제 페이지를 방문하여 콘텐츠를 분석하고 SEO 데이터를 자동 생성합니다.
        </p>

        {!progress ? (
          <>
            {/* 필드 선택 */}
            <div style={aiStyles.section}>
              <h3 style={aiStyles.sectionTitle}>적용할 필드 선택</h3>
              <div style={aiStyles.checkboxGroup}>
                {[
                  { key: 'title', label: 'Title', desc: '페이지 제목 (60자 이내)' },
                  { key: 'description', label: 'Description', desc: '메타 설명 (160자 이내)' },
                  { key: 'json_ld', label: 'JSON-LD', desc: '구조화된 데이터 (Schema.org)' },
                  { key: 'canonical', label: 'Canonical URL', desc: '정규 URL' },
                  { key: 'h1_selector', label: 'H1 Selector', desc: 'H1 태그로 변환할 요소' },
                ].map(({ key, label, desc }) => (
                  <label key={key} style={aiStyles.checkbox}>
                    <input
                      type="checkbox"
                      checked={fields[key as keyof typeof fields]}
                      onChange={e => setFields({ ...fields, [key]: e.target.checked })}
                    />
                    <span style={aiStyles.checkboxLabel}>
                      <strong>{label}</strong>
                      <span style={aiStyles.checkboxDesc}>{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* AI 모델 선택 */}
            <div style={aiStyles.section}>
              <h3 style={aiStyles.sectionTitle}>AI 모델 선택</h3>
              <div style={aiStyles.modelGroup}>
                {[
                  { value: 'heuristic', label: '📊 휴리스틱', desc: '규칙 기반, 무료, 빠름' },
                  { value: 'openai', label: '🤖 ChatGPT', desc: 'GPT-4o-mini, 저렴, 고품질' },
                  { value: 'claude', label: '🧠 Claude', desc: '3.5 Sonnet, 정확, 고품질' },
                ].map(({ value, label, desc }) => (
                  <label
                    key={value}
                    style={{
                      ...aiStyles.modelOption,
                      ...(selectedModel === value ? aiStyles.modelOptionActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={value}
                      checked={selectedModel === value}
                      onChange={() => setSelectedModel(value as AiModel)}
                      style={{ display: 'none' }}
                    />
                    <span style={aiStyles.modelLabel}>{label}</span>
                    <span style={aiStyles.modelDesc}>{desc}</span>
                  </label>
                ))}
              </div>
              {selectedModel !== 'heuristic' && (
                <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
                  ⚠️ API 키가 필요합니다. 설정에서 등록하세요.
                </p>
              )}
            </div>

            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
              📋 전체 {pages.length}개 페이지에 적용됩니다.
            </p>

            <div style={modalStyles.buttons}>
              <button style={modalStyles.cancelBtn} onClick={onClose}>취소</button>
              <button
                style={{ ...modalStyles.saveBtn, background: '#8b5cf6' }}
                onClick={handleGenerate}
                disabled={processing}
              >
                🚀 {getModelLabel(selectedModel)}로 생성
              </button>
            </div>
          </>
        ) : (
          <div style={aiStyles.progressSection}>
            <div style={aiStyles.progressHeader}>
              <div>
                <span style={aiStyles.progressStatus}>{progress.status}</span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                  ({getModelLabel(progress.model as AiModel)})
                </span>
              </div>
              <span style={aiStyles.progressCount}>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div style={aiStyles.progressBar}>
              <div
                style={{
                  ...aiStyles.progressFill,
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>

            {progress.results.length > 0 && (
              <div style={aiStyles.resultsList}>
                {progress.results.map((result, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...aiStyles.resultItem,
                      borderLeft: `3px solid ${result.status === 'success' ? '#22c55e' : '#ef4444'}`,
                    }}
                  >
                    <span style={aiStyles.resultPath}>{result.path}</span>
                    <span style={{
                      color: result.status === 'success' ? '#22c55e' : '#ef4444',
                      fontSize: 12,
                    }}>
                      {result.status === 'success' ? '✓ 성공' : `✗ ${result.message}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!processing && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button style={modalStyles.saveBtn} onClick={onComplete}>
                  닫기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewModal({
  host,
  pages,
  onClose,
  onUpdate,
}: {
  host: string;
  pages: SeoPage[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  // 미검토 페이지만 필터 (또는 전체)
  const unreviewedPages = pages.filter(p => !p.reviewed);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<SeoPage | null>(
    unreviewedPages[0] || pages[0] || null
  );
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(unreviewedPages.length === 0);

  const displayPages = showAll ? pages : unreviewedPages;
  const currentPage = displayPages[currentIndex];

  // 페이지 변경 시 formData 업데이트
  function goToPage(index: number) {
    if (index >= 0 && index < displayPages.length) {
      setCurrentIndex(index);
      setFormData(displayPages[index]);
    }
  }

  async function handleApplyAndNext() {
    if (!formData) return;

    setSaving(true);
    const { error } = await supabase
      .from('seo_pages')
      .update({
        h1_selector: formData.h1_selector,
        title: formData.title,
        description: formData.description,
        json_ld: formData.json_ld,
        canonical: formData.canonical,
        reviewed: true,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', formData.id);

    setSaving(false);

    if (error) {
      alert('저장 실패: ' + error.message);
      return;
    }

    onUpdate();

    // 다음 페이지로 이동
    if (currentIndex < displayPages.length - 1) {
      goToPage(currentIndex + 1);
    } else {
      // 모든 검토 완료
      alert('모든 페이지 검토 완료!');
      onClose();
    }
  }

  async function handleSkip() {
    if (currentIndex < displayPages.length - 1) {
      goToPage(currentIndex + 1);
    } else {
      onClose();
    }
  }

  if (!currentPage || !formData) {
    return (
      <div style={reviewStyles.overlay} onClick={onClose}>
        <div style={reviewStyles.modal} onClick={e => e.stopPropagation()}>
          <p style={{ color: '#a0a0a0', textAlign: 'center', padding: 40 }}>
            검토할 페이지가 없습니다.
          </p>
          <button style={modalStyles.saveBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    );
  }

  const fullUrl = `https://${host}${currentPage.path}`;

  return (
    <div style={reviewStyles.overlay}>
      <div style={reviewStyles.modal} onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={reviewStyles.header}>
          <div style={reviewStyles.headerLeft}>
            <h2 style={reviewStyles.title}>📝 SEO 검토</h2>
            <span style={reviewStyles.progress}>
              {currentIndex + 1} / {displayPages.length}
              {!showAll && ` (미검토 ${unreviewedPages.length}개)`}
            </span>
          </div>
          <div style={reviewStyles.headerRight}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a0a0a0', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={e => {
                  setShowAll(e.target.checked);
                  setCurrentIndex(0);
                  const newPages = e.target.checked ? pages : unreviewedPages;
                  setFormData(newPages[0] || null);
                }}
              />
              전체 보기
            </label>
            <button style={reviewStyles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* 페이지 네비게이션 */}
        <div style={reviewStyles.pageNav}>
          <button
            style={reviewStyles.navBtn}
            onClick={() => goToPage(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            ◀ 이전
          </button>
          <select
            style={reviewStyles.pageSelect}
            value={currentIndex}
            onChange={e => goToPage(Number(e.target.value))}
          >
            {displayPages.map((page, idx) => (
              <option key={page.id} value={idx}>
                {page.path} {page.reviewed ? '✓' : ''}
              </option>
            ))}
          </select>
          <button
            style={reviewStyles.navBtn}
            onClick={() => goToPage(currentIndex + 1)}
            disabled={currentIndex === displayPages.length - 1}
          >
            다음 ▶
          </button>
        </div>

        {/* 메인 컨텐츠: 왼쪽 iframe, 오른쪽 설정 */}
        <div style={reviewStyles.content}>
          {/* 왼쪽: 실제 페이지 */}
          <div style={reviewStyles.previewPane}>
            <div style={reviewStyles.previewHeader}>
              <span style={reviewStyles.previewUrl}>{fullUrl}</span>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={reviewStyles.openLink}
              >
                새 탭에서 열기 ↗
              </a>
            </div>
            <iframe
              src={fullUrl}
              style={reviewStyles.iframe}
              title="페이지 미리보기"
            />
          </div>

          {/* 오른쪽: SEO 설정 */}
          <div style={reviewStyles.settingsPane}>
            <h3 style={reviewStyles.settingsTitle}>SEO 설정</h3>

            <div style={reviewStyles.formGroup}>
              <label style={reviewStyles.label}>Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value || null })}
                placeholder="페이지 제목"
                style={reviewStyles.input}
              />
              <span style={reviewStyles.charCount}>{(formData.title || '').length}/60</span>
            </div>

            <div style={reviewStyles.formGroup}>
              <label style={reviewStyles.label}>Description</label>
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value || null })}
                placeholder="페이지 설명"
                style={reviewStyles.textarea}
                rows={3}
              />
              <span style={reviewStyles.charCount}>{(formData.description || '').length}/160</span>
            </div>

            <div style={reviewStyles.formGroup}>
              <label style={reviewStyles.label}>H1 Selector</label>
              <input
                type="text"
                value={formData.h1_selector || ''}
                onChange={e => setFormData({ ...formData, h1_selector: e.target.value || null })}
                placeholder="#post-title, .main-heading 등"
                style={reviewStyles.input}
              />
            </div>

            <div style={reviewStyles.formGroup}>
              <label style={reviewStyles.label}>Canonical URL</label>
              <input
                type="text"
                value={formData.canonical || ''}
                onChange={e => setFormData({ ...formData, canonical: e.target.value || null })}
                placeholder="비워두면 현재 URL 사용"
                style={reviewStyles.input}
              />
            </div>

            <div style={reviewStyles.formGroup}>
              <label style={reviewStyles.label}>JSON-LD</label>
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
                style={{ ...reviewStyles.textarea, fontFamily: 'monospace', fontSize: 12 }}
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={reviewStyles.footer}>
          <button style={reviewStyles.skipBtn} onClick={handleSkip}>
            건너뛰기
          </button>
          <button
            style={reviewStyles.applyBtn}
            onClick={handleApplyAndNext}
            disabled={saving}
          >
            {saving ? '저장 중...' : '✓ 적용 및 다음'}
          </button>
        </div>
      </div>
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
  aiBtn: {
    marginLeft: 'auto',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  reviewBtn: {
    marginLeft: 'auto',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
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

const aiStyles: { [key: string]: React.CSSProperties } = {
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e5e5e5',
    marginBottom: 12,
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  checkbox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  checkboxDesc: {
    fontSize: 12,
    color: '#666',
  },
  modelGroup: {
    display: 'flex',
    gap: 12,
  },
  modelOption: {
    flex: 1,
    padding: 16,
    background: '#252525',
    border: '2px solid #333',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'all 0.2s',
  },
  modelOptionActive: {
    borderColor: '#8b5cf6',
    background: '#8b5cf620',
  },
  modelLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e5e5e5',
  },
  modelDesc: {
    fontSize: 11,
    color: '#666',
  },
  radioGroup: {
    display: 'flex',
    gap: 20,
    marginBottom: 12,
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    color: '#e5e5e5',
  },
  pageSelector: {
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    padding: 12,
  },
  pageSelectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #333',
  },
  pageList: {
    maxHeight: 200,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  pageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    padding: '4px 0',
  },
  pagePath: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#3b82f6',
  },
  progressSection: {
    padding: 20,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressStatus: {
    fontSize: 16,
    fontWeight: 600,
    color: '#e5e5e5',
  },
  progressCount: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  progressBar: {
    height: 8,
    background: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6 0%, #22c55e 100%)',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  resultsList: {
    maxHeight: 300,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#252525',
    borderRadius: 4,
  },
  resultPath: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#a0a0a0',
  },
};

const reviewStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  modal: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0d0d0d',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #333',
    background: '#1a1a1a',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  progress: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 20,
    cursor: 'pointer',
    padding: 4,
  },
  pageNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '12px 24px',
    background: '#151515',
    borderBottom: '1px solid #333',
  },
  navBtn: {
    padding: '8px 16px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#e5e5e5',
    fontSize: 13,
    cursor: 'pointer',
  },
  pageSelect: {
    padding: '8px 12px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#e5e5e5',
    fontSize: 13,
    minWidth: 300,
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  previewPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #333',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333',
  },
  previewUrl: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#3b82f6',
  },
  openLink: {
    fontSize: 12,
    color: '#666',
    textDecoration: 'none',
  },
  iframe: {
    flex: 1,
    width: '100%',
    border: 'none',
    background: '#fff',
  },
  settingsPane: {
    width: 400,
    padding: 20,
    overflow: 'auto',
    background: '#1a1a1a',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
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
  charCount: {
    position: 'absolute',
    right: 8,
    bottom: -18,
    fontSize: 11,
    color: '#666',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    padding: '16px 24px',
    background: '#1a1a1a',
    borderTop: '1px solid #333',
  },
  skipBtn: {
    padding: '12px 24px',
    background: '#333',
    color: '#a0a0a0',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
  },
  applyBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
};
