import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, BarChart3, Settings, LogOut, Zap, Plug } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const links = [
  { to: '/', icon: MessageSquare, label: 'Chat' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/integrations', icon: Plug, label: 'Integrations' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Zap size={24} className="text-accent" />
          <span className="logo-text">Lunara Bot</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user.full_name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 0;
        }
        .sidebar-header {
          padding: 24px 20px 16px;
          border-bottom: 1px solid var(--border);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent), var(--cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-link:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--text-primary);
        }
        .nav-link-active {
          background: rgba(99, 102, 241, 0.15) !important;
          color: var(--accent) !important;
          box-shadow: inset 3px 0 0 var(--accent);
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          flex-shrink: 0;
        }
        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </aside>
  );
}
