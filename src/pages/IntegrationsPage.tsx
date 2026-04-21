import { useEffect, useState } from 'react';
import { Mail, CheckCircle, XCircle, Loader2, Save, Trash2, Zap, Phone } from 'lucide-react';
import api from '../api/client';
import WhatsAppCard from '../components/WhatsAppCard';

interface SmtpSettings {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  use_ssl: boolean;
  is_verified?: boolean;
}

interface VoxSettings {
  id?: string;
  api_key: string;
  assistant_id: string;
  base_url: string;
  api_key_masked?: string;
  is_verified?: boolean;
}

const EMPTY_SMTP: SmtpSettings = {
  smtp_host: '',
  smtp_port: 465,
  smtp_user: '',
  smtp_password: '',
  from_email: '',
  from_name: '',
  use_ssl: true,
};

const EMPTY_VOX: VoxSettings = {
  api_key: '',
  assistant_id: '',
  base_url: 'https://lunara-vox-44f11167db7c.herokuapp.com',
};

export default function IntegrationsPage() {
  const [form, setForm] = useState<SmtpSettings>({ ...EMPTY_SMTP });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exists, setExists] = useState(false);

  // Vox state
  const [voxForm, setVoxForm] = useState<VoxSettings>({ ...EMPTY_VOX });
  const [, setVoxLoading] = useState(true);
  const [voxSaving, setVoxSaving] = useState(false);
  const [voxTesting, setVoxTesting] = useState(false);
  const [voxDeleting, setVoxDeleting] = useState(false);
  const [voxMessage, setVoxMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [voxExists, setVoxExists] = useState(false);

  useEffect(() => {
    loadSmtp();
    loadVox();
  }, []);

  const loadSmtp = async () => {
    try {
      const { data } = await api.get('/integrations/smtp');
      if (data) {
        setForm({ ...data, smtp_password: '' });
        setExists(true);
      }
    } catch {
      // no settings yet
    } finally {
      setLoading(false);
    }
  };

  const loadVox = async () => {
    try {
      const { data } = await api.get('/integrations/vox');
      if (data) {
        setVoxForm({ ...EMPTY_VOX, assistant_id: data.assistant_id, base_url: data.base_url, api_key: '' });
        setVoxExists(true);
        setVoxForm((prev) => ({ ...prev, is_verified: data.is_verified, api_key_masked: data.api_key_masked }));
      }
    } catch {
      // no settings yet
    } finally {
      setVoxLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.smtp_host || !form.smtp_user || !form.from_email) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    if (!form.smtp_password && !exists) {
      setMessage({ type: 'error', text: 'Password is required' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form };
      if (exists && !payload.smtp_password) {
        // Don't send empty password if updating
        delete (payload as any).smtp_password;
      }
      await api.post('/integrations/smtp', payload);
      setMessage({ type: 'success', text: 'SMTP settings saved successfully' });
      setExists(true);
      loadSmtp();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.detail || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    try {
      await api.post('/integrations/smtp/test');
      setMessage({ type: 'success', text: '✅ SMTP connection successful! Settings verified.' });
      loadSmtp();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.detail || 'SMTP test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      await api.delete('/integrations/smtp');
      setForm({ ...EMPTY_SMTP });
      setExists(false);
      setMessage({ type: 'success', text: 'SMTP settings deleted' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete settings' });
    } finally {
      setDeleting(false);
    }
  };

  // --- Vox handlers ---
  const handleVoxSave = async () => {
    if (!voxForm.api_key && !voxExists) {
      setVoxMessage({ type: 'error', text: 'API Key is required' });
      return;
    }
    if (!voxForm.assistant_id) {
      setVoxMessage({ type: 'error', text: 'Assistant ID is required' });
      return;
    }
    setVoxSaving(true);
    setVoxMessage(null);
    try {
      const payload: any = {
        assistant_id: voxForm.assistant_id,
        base_url: voxForm.base_url,
        api_key: voxForm.api_key,
      };
      await api.post('/integrations/vox', payload);
      setVoxMessage({ type: 'success', text: 'Lunara Vox settings saved' });
      setVoxExists(true);
      loadVox();
    } catch (err: any) {
      setVoxMessage({ type: 'error', text: err?.response?.data?.detail || 'Failed to save' });
    } finally {
      setVoxSaving(false);
    }
  };

  const handleVoxTest = async () => {
    setVoxTesting(true);
    setVoxMessage(null);
    try {
      const { data } = await api.post('/integrations/vox/test');
      setVoxMessage({
        type: 'success',
        text: `✅ ${data.message} | Voice: ${data.voice || 'default'} | Language: ${data.language || 'en'}`,
      });
      loadVox();
    } catch (err: any) {
      setVoxMessage({ type: 'error', text: err?.response?.data?.detail || 'Vox test failed' });
    } finally {
      setVoxTesting(false);
    }
  };

  const handleVoxDelete = async () => {
    setVoxDeleting(true);
    setVoxMessage(null);
    try {
      await api.delete('/integrations/vox');
      setVoxForm({ ...EMPTY_VOX });
      setVoxExists(false);
      setVoxMessage({ type: 'success', text: 'Vox settings deleted' });
    } catch {
      setVoxMessage({ type: 'error', text: 'Failed to delete settings' });
    } finally {
      setVoxDeleting(false);
    }
  };

  const update = (key: keyof SmtpSettings, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Integrations</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure external services for email and call campaigns
        </p>
      </div>

      <div className="integrations-card">
        <div className="integration-header">
          <div className="integration-icon">
            <Mail size={24} />
          </div>
          <div>
            <h2>SMTP Email Server</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
              Configure your SMTP server to send email campaigns to leads
            </p>
          </div>
          {exists && (
            <div className={`status-badge ${form.is_verified ? 'verified' : 'unverified'}`}>
              {form.is_verified ? (
                <><CheckCircle size={14} /> Verified</>
              ) : (
                <><XCircle size={14} /> Not verified</>
              )}
            </div>
          )}
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>SMTP Host *</label>
            <input
              type="text"
              value={form.smtp_host}
              onChange={(e) => update('smtp_host', e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="form-group">
            <label>SMTP Port *</label>
            <input
              type="number"
              value={form.smtp_port}
              onChange={(e) => update('smtp_port', parseInt(e.target.value) || 465)}
            />
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={form.smtp_user}
              onChange={(e) => update('smtp_user', e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={form.smtp_password}
              onChange={(e) => update('smtp_password', e.target.value)}
              placeholder={exists ? '••••••••' : 'App password'}
            />
          </div>

          <div className="form-group">
            <label>From Email *</label>
            <input
              type="email"
              value={form.from_email}
              onChange={(e) => update('from_email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>From Name</label>
            <input
              type="text"
              value={form.from_name}
              onChange={(e) => update('from_name', e.target.value)}
              placeholder="Your Company Name"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={form.use_ssl}
                onChange={(e) => update('use_ssl', e.target.checked)}
              />
              <span>Use SSL/TLS</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>

          {exists && (
            <>
              <button onClick={handleTest} disabled={testing} className="btn btn-accent">
                {testing ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                {deleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- Lunara Vox Card --- */}
      <div className="integrations-card" style={{ marginTop: '24px' }}>
        <div className="integration-header">
          <div className="integration-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <Phone size={24} />
          </div>
          <div>
            <h2>Lunara Vox — AI Calls</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
              Configure AI phone calls for outbound lead campaigns
            </p>
          </div>
          {voxExists && (
            <div className={`status-badge ${voxForm.is_verified ? 'verified' : 'unverified'}`}>
              {voxForm.is_verified ? (
                <><CheckCircle size={14} /> Verified</>
              ) : (
                <><XCircle size={14} /> Not verified</>
              )}
            </div>
          )}
        </div>

        {voxMessage && (
          <div className={`alert ${voxMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {voxMessage.text}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>API Key *</label>
            <input
              type="password"
              value={voxForm.api_key}
              onChange={(e) => setVoxForm((p) => ({ ...p, api_key: e.target.value }))}
              placeholder={voxExists ? (voxForm.api_key_masked || '••••••••') : 'lnr_live_XXXX_secret'}
            />
          </div>

          <div className="form-group">
            <label>Assistant ID *</label>
            <input
              type="text"
              value={voxForm.assistant_id}
              onChange={(e) => setVoxForm((p) => ({ ...p, assistant_id: e.target.value }))}
              placeholder="assistant_1234567890"
            />
          </div>

          <div className="form-group">
            <label>Base URL</label>
            <input
              type="text"
              value={voxForm.base_url}
              onChange={(e) => setVoxForm((p) => ({ ...p, base_url: e.target.value }))}
              placeholder="https://lunara-vox-44f11167db7c.herokuapp.com"
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleVoxSave} disabled={voxSaving} className="btn btn-primary">
            {voxSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{voxSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>

          {voxExists && (
            <>
              <button onClick={handleVoxTest} disabled={voxTesting} className="btn btn-accent">
                {voxTesting ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
                <span>{voxTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button onClick={handleVoxDelete} disabled={voxDeleting} className="btn btn-danger">
                {voxDeleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <WhatsAppCard />

      <style>{`
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .integrations-card {
          margin-top: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }
        .integration-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .integration-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), var(--cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .integration-header h2 {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .status-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85em;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
        }
        .status-badge.verified {
          background: rgba(34,197,94,0.15);
          color: var(--success);
        }
        .status-badge.unverified {
          background: rgba(239,68,68,0.15);
          color: var(--danger);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group label {
          display: block;
          font-size: 0.85em;
          color: var(--text-secondary);
          margin-bottom: 6px;
          font-weight: 500;
        }
        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="number"] {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.95em;
        }
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--text-primary);
        }
        .checkbox-group input[type="checkbox"] {
          accent-color: var(--accent);
          width: 18px;
          height: 18px;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9em;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary {
          background: var(--accent);
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--accent-glow);
        }
        .btn-accent {
          background: rgba(34,211,238,0.15);
          color: var(--cyan);
          border: 1px solid rgba(34,211,238,0.3);
        }
        .btn-accent:hover:not(:disabled) {
          background: rgba(34,211,238,0.25);
        }
        .btn-danger {
          background: rgba(239,68,68,0.15);
          color: var(--danger);
          border: 1px solid rgba(239,68,68,0.3);
        }
        .btn-danger:hover:not(:disabled) {
          background: rgba(239,68,68,0.25);
        }
        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.9em;
        }
        .alert-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: var(--success);
        }
        .alert-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: var(--danger);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
