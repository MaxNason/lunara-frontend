import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle,
  Loader2,
  LogOut,
  MessageCircle,
  QrCode,
  Send,
  XCircle,
} from 'lucide-react';
import api from '../api/client';

interface WAStatus {
  status: string;
  qr?: string | null;
  phone_number?: string | null;
  display_name?: string | null;
  daily_limit: number;
  sent_today: number;
}

const POLL_MS = 2500;

export default function WhatsAppCard() {
  const [data, setData] = useState<WAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testText, setTestText] = useState('Hello from Lunara Bot 👋');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const pollRef = useRef<number | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<WAStatus>('/integrations/whatsapp');
      setData(data);
      if (data.status === 'WORKING' && showQr) {
        setShowQr(false);
        setMessage({ type: 'success', text: `WhatsApp connected as ${data.phone_number}` });
      }
    } catch (e: any) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  // QR polling while modal is open
  useEffect(() => {
    if (showQr) {
      pollRef.current = window.setInterval(async () => {
        try {
          const { data } = await api.get<WAStatus>('/integrations/whatsapp/qr');
          setData(data);
          if (data.status === 'WORKING') {
            setShowQr(false);
            setMessage({ type: 'success', text: `WhatsApp connected as ${data.phone_number}` });
          }
        } catch {
          /* noop */
        }
      }, POLL_MS);
    }
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [showQr]);

  const handleConnect = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await api.post<WAStatus>('/integrations/whatsapp/start');
      setData(data);
      setShowQr(true);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Failed to start WhatsApp' });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Disconnect WhatsApp?')) return;
    setBusy(true);
    try {
      await api.post('/integrations/whatsapp/logout');
      await load();
      setMessage({ type: 'success', text: 'WhatsApp disconnected.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Logout failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone.trim()) {
      setMessage({ type: 'error', text: 'Phone is required' });
      return;
    }
    setBusy(true);
    try {
      await api.post('/integrations/whatsapp/test', { phone: testPhone, text: testText });
      setMessage({ type: 'success', text: `Test message sent to ${testPhone}` });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.detail || 'Send failed' });
    } finally {
      setBusy(false);
    }
  };

  const isConnected = data?.status === 'WORKING';
  const isPairing = data?.status === 'SCAN_QR' || data?.status === 'CONNECTING';

  return (
    <div className="integrations-card" style={{ marginTop: 24 }}>
      <div className="integration-header">
        <div
          className="integration-icon"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
        >
          <MessageCircle size={24} />
        </div>
        <div>
          <h2>WhatsApp</h2>
          <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
            Send personalized AI-crafted WhatsApp messages to your leads
          </div>
        </div>
        {data && (
          <div className={`status-badge ${isConnected ? 'verified' : 'unverified'}`}>
            {isConnected ? <CheckCircle size={14} /> : <XCircle size={14} />}
            <span>{data.status}</span>
          </div>
        )}
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={20} className="spin" />
        </div>
      ) : isConnected ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
              fontSize: '0.9em',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>Phone</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                +{data?.phone_number}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>
                Sent today
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {data?.sent_today} / {data?.daily_limit}
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Test phone (international, e.g. +14155552671)</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1..."
              />
            </div>
            <div className="form-group">
              <label>Test message</label>
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleTest} disabled={busy} className="btn btn-primary">
              {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              <span>Send Test</span>
            </button>
            <button onClick={handleLogout} disabled={busy} className="btn btn-danger">
              <LogOut size={16} />
              <span>Disconnect</span>
            </button>
          </div>
        </>
      ) : (
        <div className="form-actions">
          <button onClick={handleConnect} disabled={busy} className="btn btn-primary">
            {busy ? <Loader2 size={16} className="spin" /> : <QrCode size={16} />}
            <span>{isPairing ? 'Show QR' : 'Connect WhatsApp'}</span>
          </button>
        </div>
      )}

      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 32,
              maxWidth: 420,
              width: '90%',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 8, color: 'var(--text-primary)' }}>
              Scan QR with WhatsApp
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em', marginTop: 4 }}>
              Open WhatsApp → Settings → Linked Devices → Link a device
            </p>
            {data?.qr ? (
              <img
                src={data.qr}
                alt="QR"
                style={{
                  width: 280,
                  height: 280,
                  background: 'white',
                  borderRadius: 8,
                  margin: '12px auto',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: 280,
                  height: 280,
                  margin: '12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Loader2 size={32} className="spin" />
              </div>
            )}
            <div
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.85em',
                marginTop: 8,
              }}
            >
              Status: <strong>{data?.status || 'CONNECTING'}</strong>
            </div>
            <button
              onClick={() => setShowQr(false)}
              className="btn btn-accent"
              style={{ marginTop: 16, marginInline: 'auto' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
