'use client';

import { useState, useEffect } from 'react';

interface ApiSettings {
  openaiKey: string;
  claudeKey: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ApiSettings>({
    openaiKey: '',
    claudeKey: '',
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false,
  });
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(true);
  const [keyStatus, setKeyStatus] = useState<{
    openai: 'none' | 'env' | 'local';
    claude: 'none' | 'env' | 'local';
  }>({
    openai: 'none',
    claude: 'none',
  });

  useEffect(() => {
    // 로컬 스토리지에서 키 로드
    const savedSettings = localStorage.getItem('ai-api-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
    }

    // 서버에서 환경변수 상태 확인
    checkEnvKeys();
  }, []);

  async function checkEnvKeys() {
    setChecking(true);
    try {
      const res = await fetch('/api/check-api-keys');
      const data = await res.json();
      setKeyStatus({
        openai: data.openai ? 'env' : (settings.openaiKey ? 'local' : 'none'),
        claude: data.claude ? 'env' : (settings.claudeKey ? 'local' : 'none'),
      });
    } catch {
      // 에러 시 로컬 상태만 확인
      setKeyStatus({
        openai: settings.openaiKey ? 'local' : 'none',
        claude: settings.claudeKey ? 'local' : 'none',
      });
    }
    setChecking(false);
  }

  function handleSave() {
    localStorage.setItem('ai-api-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // 상태 업데이트
    setKeyStatus(prev => ({
      openai: settings.openaiKey ? 'local' : (prev.openai === 'env' ? 'env' : 'none'),
      claude: settings.claudeKey ? 'local' : (prev.claude === 'env' ? 'env' : 'none'),
    }));
  }

  function handleClear(key: 'openaiKey' | 'claudeKey') {
    setSettings(prev => ({ ...prev, [key]: '' }));
  }

  function getStatusBadge(status: 'none' | 'env' | 'local') {
    switch (status) {
      case 'env':
        return <span style={styles.envBadge}>✓ 환경변수 설정됨</span>;
      case 'local':
        return <span style={styles.localBadge}>✓ 로컬 저장됨</span>;
      default:
        return <span style={styles.noneBadge}>✗ 미설정</span>;
    }
  }

  return (
    <div>
      <h1 style={styles.title}>⚙️ 설정</h1>
      <p style={styles.subtitle}>AI 모델 API 키를 설정합니다.</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>AI 모델 API 키</h2>
        <p style={styles.cardDesc}>
          AI 자동 생성 기능에서 사용할 API 키를 입력하세요.<br />
          환경변수로 설정하면 더 안전합니다 (.env.local 파일).
        </p>

        {/* OpenAI */}
        <div style={styles.keySection}>
          <div style={styles.keyHeader}>
            <div style={styles.keyInfo}>
              <span style={styles.keyName}>🤖 OpenAI (ChatGPT)</span>
              {!checking && getStatusBadge(keyStatus.openai)}
            </div>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.getKeyLink}
            >
              API 키 발급 →
            </a>
          </div>
          <div style={styles.inputGroup}>
            <input
              type={showKeys.openai ? 'text' : 'password'}
              value={settings.openaiKey}
              onChange={e => setSettings({ ...settings, openaiKey: e.target.value })}
              placeholder="sk-..."
              style={styles.input}
            />
            <button
              style={styles.toggleBtn}
              onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
            >
              {showKeys.openai ? '🙈' : '👁️'}
            </button>
            {settings.openaiKey && (
              <button style={styles.clearBtn} onClick={() => handleClear('openaiKey')}>
                ✕
              </button>
            )}
          </div>
          <p style={styles.envHint}>
            또는 환경변수: <code>OPENAI_API_KEY</code>
          </p>
        </div>

        {/* Claude */}
        <div style={styles.keySection}>
          <div style={styles.keyHeader}>
            <div style={styles.keyInfo}>
              <span style={styles.keyName}>🧠 Anthropic (Claude)</span>
              {!checking && getStatusBadge(keyStatus.claude)}
            </div>
            <a 
              href="https://console.anthropic.com/settings/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.getKeyLink}
            >
              API 키 발급 →
            </a>
          </div>
          <div style={styles.inputGroup}>
            <input
              type={showKeys.claude ? 'text' : 'password'}
              value={settings.claudeKey}
              onChange={e => setSettings({ ...settings, claudeKey: e.target.value })}
              placeholder="sk-ant-..."
              style={styles.input}
            />
            <button
              style={styles.toggleBtn}
              onClick={() => setShowKeys(prev => ({ ...prev, claude: !prev.claude }))}
            >
              {showKeys.claude ? '🙈' : '👁️'}
            </button>
            {settings.claudeKey && (
              <button style={styles.clearBtn} onClick={() => handleClear('claudeKey')}>
                ✕
              </button>
            )}
          </div>
          <p style={styles.envHint}>
            또는 환경변수: <code>ANTHROPIC_API_KEY</code>
          </p>
        </div>

        <div style={styles.saveSection}>
          <button style={styles.saveBtn} onClick={handleSave}>
            {saved ? '✓ 저장됨!' : '💾 저장'}
          </button>
        </div>
      </div>

      {/* 휴리스틱 설명 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📊 휴리스틱 모드</h2>
        <p style={styles.cardDesc}>
          API 키 없이도 사용 가능한 기본 모드입니다.<br />
          페이지 HTML을 분석하여 규칙 기반으로 SEO 데이터를 생성합니다.
        </p>
        <ul style={styles.featureList}>
          <li>✓ API 키 불필요</li>
          <li>✓ 빠른 처리 속도</li>
          <li>✓ 비용 없음</li>
          <li>△ AI 모델 대비 품질 제한</li>
        </ul>
      </div>

      {/* 모델 비교 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📋 모델 비교</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>모델</th>
              <th style={styles.th}>장점</th>
              <th style={styles.th}>비용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>휴리스틱</td>
              <td style={styles.td}>빠름, 무료</td>
              <td style={styles.td}>무료</td>
            </tr>
            <tr>
              <td style={styles.td}>GPT-4o-mini</td>
              <td style={styles.td}>저렴, 빠름</td>
              <td style={styles.td}>~$0.15/1K tokens</td>
            </tr>
            <tr>
              <td style={styles.td}>Claude 3.5 Sonnet</td>
              <td style={styles.td}>고품질, 정확</td>
              <td style={styles.td}>~$3/1M tokens</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 24,
    lineHeight: 1.6,
  },
  keySection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid #333',
  },
  keyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  keyName: {
    fontSize: 15,
    fontWeight: 500,
    color: '#e5e5e5',
  },
  getKeyLink: {
    fontSize: 13,
    color: '#3b82f6',
    textDecoration: 'none',
  },
  inputGroup: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#e5e5e5',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  toggleBtn: {
    padding: '12px 16px',
    background: '#252525',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#e5e5e5',
    cursor: 'pointer',
    fontSize: 16,
  },
  clearBtn: {
    padding: '12px 16px',
    background: '#333',
    border: '1px solid #444',
    borderRadius: 8,
    color: '#a0a0a0',
    cursor: 'pointer',
    fontSize: 14,
  },
  envHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  envBadge: {
    padding: '4px 8px',
    background: '#22c55e20',
    color: '#22c55e',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  localBadge: {
    padding: '4px 8px',
    background: '#3b82f620',
    color: '#3b82f6',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  noneBadge: {
    padding: '4px 8px',
    background: '#ef444420',
    color: '#ef4444',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  saveSection: {
    marginTop: 24,
  },
  saveBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 2,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
    padding: '12px 16px',
    borderBottom: '1px solid #252525',
    color: '#e5e5e5',
    fontSize: 14,
  },
};

