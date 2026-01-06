'use client';

import { useState, useEffect } from 'react';
import { supabase, type Host } from '@/lib/supabase';

export default function HostsPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    name: '',
    sitemap_url: '',
  });

  useEffect(() => {
    fetchHosts();
  }, []);

  async function fetchHosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('hosts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHosts(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase.from('hosts').insert({
      domain: formData.domain,
      name: formData.name || null,
      sitemap_url: formData.sitemap_url || null,
    });

    if (!error) {
      setFormData({ domain: '', name: '', sitemap_url: '' });
      setShowForm(false);
      fetchHosts();
    } else {
      alert('등록 실패: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const { error } = await supabase.from('hosts').delete().eq('id', id);
    if (!error) {
      fetchHosts();
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>호스트 관리</h1>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '+ 호스트 추가'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>도메인 *</label>
            <input
              type="text"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>사이트명</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="테스트 사이트"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>사이트맵 URL</label>
            <input
              type="text"
              value={formData.sitemap_url}
              onChange={e => setFormData({ ...formData, sitemap_url: e.target.value })}
              placeholder="https://example.com/sitemap.xml"
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitBtn}>등록</button>
        </form>
      )}

      {loading ? (
        <p style={styles.loading}>로딩 중...</p>
      ) : hosts.length === 0 ? (
        <p style={styles.empty}>등록된 호스트가 없습니다.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>도메인</th>
              <th style={styles.th}>사이트명</th>
              <th style={styles.th}>사이트맵 URL</th>
              <th style={styles.th}>등록일</th>
              <th style={styles.th}>액션</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map(host => (
              <tr key={host.id}>
                <td style={styles.td}>{host.domain}</td>
                <td style={styles.td}>{host.name || '-'}</td>
                <td style={styles.td}>
                  {host.sitemap_url ? (
                    <a href={host.sitemap_url} target="_blank" rel="noopener">
                      {host.sitemap_url.substring(0, 40)}...
                    </a>
                  ) : '-'}
                </td>
                <td style={styles.td}>{new Date(host.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(host.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  addBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
  form: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 24,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 16,
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
  },
  submitBtn: {
    padding: '10px 24px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
  loading: {
    color: '#a0a0a0',
  },
  empty: {
    color: '#a0a0a0',
    textAlign: 'center',
    padding: 40,
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
    padding: '12px 16px',
    borderBottom: '1px solid #252525',
    color: '#e5e5e5',
    fontSize: 14,
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
  },
};


