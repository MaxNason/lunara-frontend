import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Instagram,
  Loader2,
  LogOut,
  XCircle,
} from 'lucide-react';
import api from '../api/client';

interface IgStatus {
  status: string;
  is_verified: boolean;
  username?: string | null;
  daily_dm_limit: number;
  daily_comment_limit: number;
  daily_post_limit: number;
  sent_today_dm: number;
  sent_today_comment: number;
  sent_today_post: number;
  last_error?: string;
}

export default function InstagramCard() {
  const [data, setData] = useState<IgStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [need2fa, setNeed2fa] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<IgStatus>('/integrations/instagram');
      setData(data);
      if (data?.status === 'NEEDS_2FA') setNeed2fa(true);
    } catch {
      // not configured
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Username and password required.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await api.post<IgStatus>('/integrations/instagram/login', { username, password });
      setData(data);
      if (data.status === 'VERIFIED') {
        setMessage({ type: 'success', text: `Connected as @${data.username}` });
        setShowLogin(false);
        setNeed2fa(false);
      } else if (data.status === 'NEEDS_2FA') {
        setNeed2fa(true);
        setMessage({ type: 'success', text: 'Enter the 2FA code from your authenticator app.' });
      } else if (data.status === 'CHALLENGE') {
        setMessage({ type: 'error', text: 'Instagram requires verification. Log in via the official app once, then retry.' });
      } else {
        setMessage({ type: 'error', text: data.last_error || 'Login failed.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Login failed' });
    } finally {
      setBusy(false);
    }
  };

  const handle2fa = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await api.post<IgStatus>('/integrations/instagram/2fa', { code });
      setData(data);
      if (data.status === 'VERIFIED') {
        setMessage({ type: 'success', text: `Connected as @${data.username}` });
        setShowLogin(false);
        setNeed2fa(false);
        setCode('');
      } else {
        setMessage({ type: 'error', text: data.last_error || '2FA failed.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || '2FA failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Disconnect Instagram?')) return;
    setBusy(true);
    try {
      await api.post('/integrations/instagram/logout');
      await load();
      setData(null);
      setMessage({ type: 'success', text: 'Instagram disconnected.' });
    } finally {
      setBusy(false);
    }
  };

  const updateLimit = async (field: 'daily_dm_limit' | 'daily_comment_limit' | 'daily_post_limit', value: number) => {
    try {
      const { data } = await api.post<IgStatus>('/integrations/instagram/limits', { [field]: value });
      setData(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Update failed' });
    }
  };

  if (loading) {
    return (
      <div className="integrations-card">
        <div className="integration-header">
          <Instagram size={20} />
          <h3>Instagram</h3>
        </div>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const verified = data?.is_verified;

  return (
    <div className="integrations-card">
      <div className="integration-header">
        <Instagram size={20} />
        <h3>Instagram</h3>
        {verified ? (
          <span className="badge badge-ok"><CheckCircle size={14} /> Connected</span>
        ) : (
          <span className="badge badge-off"><XCircle size={14} /> Not connected</span>
        )}
      </div>

      <p className="muted">
        Connect your Instagram account so the AI agent can post comments under target posts, send DMs to target accounts and publish promotional posts on your behalf.
      </p>

      {verified && data && (
        <>
          <div className="ig-info">
            <div><strong>Account:</strong> @{data.username}</div>
            <div className="ig-counters">
              <span>DM today: {data.sent_today_dm}/{data.daily_dm_limit}</span>
              <span>Comments today: {data.sent_today_comment}/{data.daily_comment_limit}</span>
              <span>Posts today: {data.sent_today_post}/{data.daily_post_limit}</span>
            </div>
          </div>

          <div className="ig-limits">
            <label>
              Daily DM limit
              <input
                type="number" min={1} max={200} value={data.daily_dm_limit}
                onChange={(e) => updateLimit('daily_dm_limit', Number(e.target.value))}
              />
            </label>
            <label>
              Daily Comment limit
              <input
                type="number" min={1} max={300} value={data.daily_comment_limit}
                onChange={(e) => updateLimit('daily_comment_limit', Number(e.target.value))}
              />
            </label>
            <label>
              Daily Post limit
              <input
                type="number" min={1} max={25} value={data.daily_post_limit}
                onChange={(e) => updateLimit('daily_post_limit', Number(e.target.value))}
              />
            </label>
          </div>

          <div className="actions">
            <button className="btn btn-danger" onClick={handleLogout} disabled={busy}>
              {busy ? <Loader2 size={16} className="spin" /> : <LogOut size={16} />} Disconnect
            </button>
          </div>
        </>
      )}

      {!verified && !showLogin && (
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
            Connect Instagram
          </button>
        </div>
      )}

      {!verified && showLogin && (
        <div className="ig-login">
          {!need2fa && (
            <>
              <label>
                Username
                <input
                  type="text" value={username} placeholder="your_handle"
                  onChange={(e) => setUsername(e.target.value)} disabled={busy}
                />
              </label>
              <label>
                Password
                <input
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={busy}
                />
              </label>
              <div className="actions">
                <button className="btn btn-primary" onClick={handleLogin} disabled={busy}>
                  {busy ? <Loader2 size={16} className="spin" /> : null} Log in
                </button>
                <button className="btn btn-ghost" onClick={() => setShowLogin(false)} disabled={busy}>
                  Cancel
                </button>
              </div>
              <p className="muted small">
                Tip: use a dedicated Instagram account for marketing automation. Credentials are stored encrypted at rest and used only via instagrapi sessions.
              </p>
            </>
          )}
          {need2fa && (
            <>
              <label>
                2FA code
                <input
                  type="text" value={code} placeholder="123456"
                  onChange={(e) => setCode(e.target.value)} disabled={busy}
                />
              </label>
              <div className="actions">
                <button className="btn btn-primary" onClick={handle2fa} disabled={busy}>
                  {busy ? <Loader2 size={16} className="spin" /> : null} Verify
                </button>
                <button className="btn btn-ghost" onClick={() => { setNeed2fa(false); setCode(''); }} disabled={busy}>
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {message && (
        <div className={`msg msg-${message.type}`}>{message.text}</div>
      )}

      <style>{`
        .ig-info { margin: 12px 0; display: flex; flex-direction: column; gap: 6px; font-size: .9rem; }
        .ig-counters { display: flex; gap: 12px; flex-wrap: wrap; color: var(--text-secondary); font-size: .82rem; }
        .ig-limits { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin: 12px 0; }
        .ig-limits label { display: flex; flex-direction: column; gap: 4px; font-size: .8rem; color: var(--text-secondary); }
        .ig-limits input { padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-input,transparent); color: var(--text-primary); }
        .ig-login { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
        .ig-login label { display: flex; flex-direction: column; gap: 4px; font-size: .85rem; color: var(--text-secondary); }
        .ig-login input { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-input,transparent); color: var(--text-primary); }
        .small { font-size: .78rem; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; font-size: .75rem; margin-left: 8px; }
        .badge-ok { background: rgba(34,197,94,.15); color: rgb(74,222,128); }
        .badge-off { background: rgba(148,163,184,.15); color: rgb(148,163,184); }
        .actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .msg { margin-top: 12px; padding: 8px 12px; border-radius: 6px; font-size: .85rem; }
        .msg-success { background: rgba(34,197,94,.12); color: rgb(74,222,128); }
        .msg-error { background: rgba(239,68,68,.12); color: rgb(248,113,113); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
