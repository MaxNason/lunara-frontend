import { useEffect, useState } from 'react';
import { useLeadStore } from '../store/leadStore';
import { Search, Download, Trash2, Mail, Phone, MessageCircle, ExternalLink, Building2, Filter as FilterIcon, Plus, X } from 'lucide-react';

function AddLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    company: '', title: '', domain: '', linkedin_url: '', website: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.first_name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Lead</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label>First Name *<input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="John" /></label>
            <label>Last Name<input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Doe" /></label>
          </div>
          <div className="form-row">
            <label>Email<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john@company.com" /></label>
            <label>Phone<input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 123 4567" /></label>
          </div>
          <div className="form-row">
            <label>Company<input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Inc" /></label>
            <label>Title<input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="CEO" /></label>
          </div>
          <div className="form-row">
            <label>Domain<input value={form.domain} onChange={(e) => set('domain', e.target.value)} placeholder="acme.com" /></label>
            <label>LinkedIn<input value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></label>
          </div>
          <label className="form-full">Website<input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://acme.com" /></label>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={saving || !form.first_name.trim()}>
            {saving ? 'Saving...' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const {
    leads, campaigns, loading, selectedCampaign,
    fetchLeads, fetchCampaigns, removeLead, addLead, setSelectedCampaign, exportCsv,
  } = useLeadStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchLeads({
      campaign_id: selectedCampaign ?? undefined,
      search: search || undefined,
    });
  }, [selectedCampaign, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await removeLead(id);
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <h2>Leads</h2>
        <div className="leads-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FilterIcon size={16} />
            <select
              value={selectedCampaign ?? ''}
              onChange={(e) => setSelectedCampaign(e.target.value || null)}
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.leads_found})</option>
              ))}
            </select>
          </div>
          <button onClick={exportCsv} className="export-btn" disabled={leads.length === 0}>
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="add-lead-btn">
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={addLead} />}

      <div className="leads-count">
        Found: <strong>{leads.length}</strong> leads
      </div>

      {loading ? (
        <div className="leads-loading">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="leads-empty">
          <p>No leads yet. Go to chat and start a search.</p>
        </div>
      ) : (
        <div className="leads-table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Title</th>
                <th>Email</th>
                <th>Phone</th>
                <th>LinkedIn</th>
                <th>Source</th>
                <th>Conf.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="lead-name">
                    {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td>
                    <span className="lead-company">
                      <Building2 size={14} />
                      {lead.company || '—'}
                    </span>
                  </td>
                  <td className="lead-title">{lead.title || '—'}</td>
                  <td>
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="lead-email">
                        <Mail size={14} />
                        {lead.email}
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    {lead.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={`tel:${lead.phone}`} className="lead-email">
                          <Phone size={14} />
                          {lead.phone}
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in WhatsApp"
                          style={{ color: '#25D366', display: 'inline-flex' }}
                        >
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    {lead.linkedin_url ? (
                      <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="lead-linkedin">
                        <ExternalLink size={14} />
                        Profile
                      </a>
                    ) : '—'}
                  </td>
                  <td><span className="lead-source">{lead.source || '—'}</span></td>
                  <td>
                    <span className={`lead-conf ${lead.confidence >= 0.7 ? 'high' : lead.confidence >= 0.4 ? 'mid' : 'low'}`}>
                      {Math.round(lead.confidence * 100)}%
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(lead.id)} className="del-btn" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .leads-page { animation: fadeIn 0.4s ease; }
        .leads-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }
        .leads-header h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .leads-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .search-box, .filter-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 14px;
          color: var(--text-muted);
        }
        .search-box input, .filter-box select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          min-width: 180px;
        }
        .filter-box select { min-width: 150px; cursor: pointer; }
        .filter-box select option { background: var(--bg-secondary); color: var(--text-primary); }
        .export-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--accent), #818cf8);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .export-btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
        .export-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .leads-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .leads-loading, .leads-empty {
          text-align: center;
          color: var(--text-muted);
          padding: 40px;
        }
        .leads-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg-secondary);
        }
        .leads-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .leads-table th {
          text-align: left;
          padding: 12px 14px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .leads-table td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          color: var(--text-primary);
          white-space: nowrap;
        }
        .leads-table tr:last-child td { border-bottom: none; }
        .leads-table tr:hover td { background: rgba(99,102,241,0.04); }
        .lead-name { font-weight: 600; }
        .lead-company { display: flex; align-items: center; gap: 6px; }
        .lead-title { color: var(--text-secondary); }
        .lead-email, .lead-linkedin {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--cyan);
          text-decoration: none;
          font-size: 0.83rem;
        }
        .lead-email:hover, .lead-linkedin:hover { text-decoration: underline; }
        .lead-source {
          background: var(--bg-tertiary);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.78rem;
        }
        .lead-conf {
          font-weight: 700;
          font-size: 0.82rem;
        }
        .lead-conf.high { color: #22c55e; }
        .lead-conf.mid { color: #eab308; }
        .lead-conf.low { color: #ef4444; }
        .del-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .del-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

        .add-lead-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-lead-btn:hover { box-shadow: 0 4px 15px rgba(34,197,94,0.3); }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .modal-box {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 560px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 0;
        }
        .modal-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .modal-close:hover { color: var(--text-primary); background: var(--bg-secondary); }
        .modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .modal-body label, .form-full {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .modal-body input {
          padding: 9px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          transition: border 0.2s;
        }
        .modal-body input:focus { border-color: var(--accent); }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 24px 20px;
        }
        .btn-cancel {
          padding: 9px 18px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel:hover { background: var(--bg-secondary); }
        .btn-save {
          padding: 9px 22px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), #818cf8);
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-save:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
      `}</style>
    </div>
  );
}
