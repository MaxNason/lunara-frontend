import { useEffect, useState } from 'react';
import { Instagram, CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchCampaigns, type Campaign } from '../api/instagram';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    completed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', icon: <CheckCircle size={13} /> },
    failed:    { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', icon: <XCircle size={13} /> },
    running:   { bg: 'rgba(99,102,241,0.15)', color: '#6366f1', icon: <Clock size={13} /> },
    pending:   { bg: 'rgba(156,163,175,0.15)',color: '#9ca3af', icon: <Clock size={13} /> },
  };
  const s = styles[status] ?? styles.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: '0.78rem', fontWeight: 600 }}>
      {s.icon}{status}
    </span>
  );
}

function fmt(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function InstagramAnalyticsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCampaigns()
      .then(setCampaigns)
      .catch(e => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalSent = campaigns.reduce((s, c) => s + c.succeeded, 0);
  const totalFailed = campaigns.reduce((s, c) => s + c.failed, 0);
  const completedCount = campaigns.filter(c => c.status === 'completed').length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#e1306c,#833ab4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Instagram size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Instagram Analytics</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>История кампаний и прокомментированные посты</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Кампаний завершено', value: completedCount, color: '#22c55e' },
          { label: 'Действий выполнено', value: totalSent, color: '#6366f1' },
          { label: 'Ошибок', value: totalFailed, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Загрузка...</div>}
      {error && <div style={{ color: '#ef4444', textAlign: 'center', padding: 40 }}>{error}</div>}

      {/* Campaigns list */}
      {!loading && !error && campaigns.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
          Нет кампаний. Запусти первую из чата!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {campaigns.map(c => {
          const open = expanded.has(c.id);
          const sentLogs = c.logs.filter(l => l.status === 'sent');
          return (
            <div key={c.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {/* Campaign header */}
              <button
                onClick={() => toggle(c.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      #{c.target_query || '(без тега)'}
                    </span>
                    <StatusBadge status={c.status} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(99,102,241,0.1)', borderRadius: 6, padding: '2px 8px' }}>{c.mode}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{fmt(c.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0, fontSize: '0.85rem' }}>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ {c.succeeded}</span>
                  {c.failed > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ {c.failed}</span>}
                </div>
              </button>

              {/* Expanded logs */}
              {open && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {sentLogs.length === 0 ? (
                    <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Нет отправленных действий</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                          <th style={{ padding: '10px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Аккаунт</th>
                          <th style={{ padding: '10px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Пост</th>
                          <th style={{ padding: '10px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Комментарий</th>
                          <th style={{ padding: '10px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Время</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sentLogs.map((l, i) => (
                          <tr key={l.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.05)' }}>
                            <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>
                              <a href={`https://www.instagram.com/${l.target_username}/`} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
                                @{l.target_username}
                              </a>
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              {l.target_url ? (
                                <a href={l.target_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                                  <ExternalLink size={14} />
                                  {l.target_url.replace('https://www.instagram.com/p/', '').replace('/', '')}
                                </a>
                              ) : '—'}
                            </td>
                            <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', maxWidth: 300 }}>
                              <span title={l.message_text} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.message_text}
                              </span>
                            </td>
                            <td style={{ padding: '12px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {fmt(l.sent_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
