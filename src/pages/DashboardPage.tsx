import { useEffect, useState } from 'react';
import { dashboardApi, type DashboardData } from '../api/dashboard';
import { Users, Mail, BarChart3, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!data) return <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No data</div>;

  const topSources = Object.entries(data.leads_by_source)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCompanies = Object.entries(data.leads_by_company)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <StatCard icon={<Users size={22} />} label="Total Leads" value={data.total_leads} color="var(--accent)" />
        <StatCard icon={<Mail size={22} />} label="Emails Found" value={data.emails_found} color="var(--cyan)" />
        <StatCard icon={<BarChart3 size={22} />} label="Campaigns" value={data.total_campaigns} color="#a78bfa" />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Email Conversion"
          value={data.total_leads > 0 ? `${Math.round((data.emails_found / data.total_leads) * 100)}%` : '—'}
          color="#22c55e"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>Lead Sources</h3>
          {topSources.length === 0 ? (
            <p className="empty">No data</p>
          ) : (
            <div className="bar-chart">
              {topSources.map(([source, count]) => (
                <div key={source} className="bar-row">
                  <span className="bar-label">{source}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(count / Math.max(...topSources.map(([, v]) => v))) * 100}%` }}
                    />
                  </div>
                  <span className="bar-value">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-card">
          <h3>Top Companies</h3>
          {topCompanies.length === 0 ? (
            <p className="empty">No data</p>
          ) : (
            <div className="company-list">
              {topCompanies.map(([company, count]) => (
                <div key={company} className="company-row">
                  <span className="company-name">{company}</span>
                  <span className="company-count">{count} leads</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 20 }}>
        <h3>Recent Campaigns</h3>
        {data.recent_campaigns.length === 0 ? (
          <p className="empty">No campaigns yet</p>
        ) : (
          <table className="campaigns-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Leads</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="camp-name">{c.name}</td>
                  <td>
                    <span className={`camp-status ${c.status}`}>{c.status}</span>
                  </td>
                  <td>{c.leads_found}</td>
                  <td className="camp-date">
                    <Clock size={13} />
                    {new Date(c.started_at).toLocaleDateString('ru')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .dashboard { animation: fadeIn 0.4s ease; }
        .dashboard h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
        .stat-label { font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
        .dash-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
        }
        .dash-card h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
        .empty { color: var(--text-muted); font-size: 0.85rem; }
        .bar-chart { display: flex; flex-direction: column; gap: 10px; }
        .bar-row { display: flex; align-items: center; gap: 10px; }
        .bar-label { min-width: 80px; font-size: 0.82rem; color: var(--text-secondary); text-transform: capitalize; }
        .bar-track { flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--cyan)); border-radius: 4px; transition: width 0.6s ease; }
        .bar-value { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); min-width: 30px; text-align: right; }
        .company-list { display: flex; flex-direction: column; gap: 8px; }
        .company-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px; }
        .company-name { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); }
        .company-count { font-size: 0.8rem; color: var(--text-secondary); }
        .campaigns-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .campaigns-table th { text-align: left; padding: 8px 12px; color: var(--text-secondary); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .campaigns-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
        .campaigns-table tr:last-child td { border-bottom: none; }
        .camp-name { font-weight: 600; }
        .camp-status { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .camp-status.completed { background: rgba(34,197,94,0.15); color: #22c55e; }
        .camp-status.running { background: rgba(99,102,241,0.15); color: var(--accent); }
        .camp-status.failed { background: rgba(239,68,68,0.15); color: #ef4444; }
        .camp-date { display: flex; align-items: center; gap: 5px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
