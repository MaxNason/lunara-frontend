import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px 32px',
        background: 'var(--bg-primary)',
      }}>
        {children}
      </main>
    </div>
  );
}
