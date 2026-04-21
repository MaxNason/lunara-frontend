import { useEffect, useState, type FormEvent } from 'react';
import { companyApi, type CompanyProfile, type CompanyUpdate } from '../api/company';
import { Save, Building, Globe, Target, Tag, MapPin, Users, FileText, CheckCircle, Briefcase } from 'lucide-react';

const arrayToStr = (arr?: string[]) => (arr || []).join(', ');
const strToArray = (s: string) => s.split(',').map((v) => v.trim()).filter(Boolean);

export default function SettingsPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState<CompanyUpdate>({});
  const [arrayFields, setArrayFields] = useState({
    target_industries: '',
    target_titles: '',
    target_regions: '',
    target_keywords: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    companyApi.get().then(({ data }) => {
      setProfile(data);
      setForm({
        company_name: data.company_name || '',
        company_domain: data.company_domain || '',
        industry: data.industry || '',
        description: data.description || '',
        value_proposition: data.value_proposition || '',
        target_industries: data.target_industries || [],
        target_titles: data.target_titles || [],
        target_regions: data.target_regions || [],
        target_company_sizes: data.target_company_sizes || [],
        target_keywords: data.target_keywords || [],
        ideal_customer_desc: data.ideal_customer_desc || '',
        preferred_channels: data.preferred_channels || [],
        budget_range: data.budget_range || '',
      });
      setArrayFields({
        target_industries: arrayToStr(data.target_industries),
        target_titles: arrayToStr(data.target_titles),
        target_regions: arrayToStr(data.target_regions),
        target_keywords: arrayToStr(data.target_keywords),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        target_industries: strToArray(arrayFields.target_industries),
        target_titles: strToArray(arrayFields.target_titles),
        target_regions: strToArray(arrayFields.target_regions),
        target_keywords: strToArray(arrayFields.target_keywords),
      };
      const { data } = await companyApi.update(payload);
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Company Settings</h2>
        {profile?.is_configured && (
          <span className="configured-badge">
            <CheckCircle size={14} /> Configured
          </span>
        )}
      </div>

      <p className="settings-desc">
        Fill in your company profile so the AI assistant better understands your business and delivers more relevant results.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-grid">
          <FormField icon={<Building size={16} />} label="Company Name" required>
            <input
              type="text"
              value={form.company_name || ''}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="Lunara Inc."
              required
            />
          </FormField>

          <FormField icon={<Globe size={16} />} label="Domain" required>
            <input
              type="text"
              value={form.company_domain || ''}
              onChange={(e) => setForm({ ...form, company_domain: e.target.value })}
              placeholder="lunaravox.com"
              required
            />
          </FormField>

          <FormField icon={<Tag size={16} />} label="Industry">
            <input
              type="text"
              value={form.industry || ''}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="SaaS, MarTech"
            />
          </FormField>

          <FormField icon={<FileText size={16} />} label="Product Description" full>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product or service..."
              rows={3}
            />
          </FormField>

          <FormField icon={<Briefcase size={16} />} label="Value Proposition" full>
            <textarea
              value={form.value_proposition || ''}
              onChange={(e) => setForm({ ...form, value_proposition: e.target.value })}
              placeholder="What makes your product unique?"
              rows={2}
            />
          </FormField>

          <FormField icon={<Target size={16} />} label="Target Industries" full>
            <input
              type="text"
              value={arrayFields.target_industries}
              onChange={(e) => setArrayFields({ ...arrayFields, target_industries: e.target.value })}
              placeholder="Healthcare, FinTech, E-commerce (comma-separated)"
            />
          </FormField>

          <FormField icon={<Users size={16} />} label="Target Job Titles" full>
            <input
              type="text"
              value={arrayFields.target_titles}
              onChange={(e) => setArrayFields({ ...arrayFields, target_titles: e.target.value })}
              placeholder="CTO, VP Engineering, Head of Marketing"
            />
          </FormField>

          <FormField icon={<MapPin size={16} />} label="Target Regions">
            <input
              type="text"
              value={arrayFields.target_regions}
              onChange={(e) => setArrayFields({ ...arrayFields, target_regions: e.target.value })}
              placeholder="USA, Europe, CIS"
            />
          </FormField>

          <FormField icon={<Tag size={16} />} label="Keywords">
            <input
              type="text"
              value={arrayFields.target_keywords}
              onChange={(e) => setArrayFields({ ...arrayFields, target_keywords: e.target.value })}
              placeholder="AI, automation, B2B"
            />
          </FormField>

          <FormField icon={<FileText size={16} />} label="Ideal Customer Profile (ICP)" full>
            <textarea
              value={form.ideal_customer_desc || ''}
              onChange={(e) => setForm({ ...form, ideal_customer_desc: e.target.value })}
              placeholder="Describe your ideal customer..."
              rows={3}
            />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : saved ? (
              <><CheckCircle size={18} /> Saved!</>
            ) : (
              <><Save size={18} /> Save &amp; Start</>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .settings-page { animation: fadeIn 0.4s ease; max-width: 800px; }
        .settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .settings-header h2 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .configured-badge {
          display: flex; align-items: center; gap: 5px;
          background: rgba(34,197,94,0.15); color: #22c55e;
          padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
        }
        .settings-desc { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field.full { grid-column: 1 / -1; }
        .field-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.82rem; font-weight: 600;
          color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em;
        }
        .field-label .required { color: #ef4444; }
        .form-field input, .form-field textarea {
          padding: 12px 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .form-field input:focus, .form-field textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .form-field textarea { resize: vertical; }
        .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; }
        .save-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, var(--accent), #818cf8);
          border: none; border-radius: 12px;
          color: white; font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.35); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function FormField({ icon, label, children, required, full }: {
  icon: React.ReactNode; label: string; children: React.ReactNode; required?: boolean; full?: boolean;
}) {
  return (
    <div className={`form-field ${full ? 'full' : ''}`}>
      <label className="field-label">
        {icon} {label} {required && <span className="required">*</span>}
      </label>
      {children}
    </div>
  );
}
