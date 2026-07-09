import {
  LayoutDashboard,
  Users,
  FileText,
  FileSpreadsheet,
  Settings,
  CreditCard,
  LogOut,
  Package,
  Wallet,
  Receipt,
  BarChart3,
  RefreshCw,
  Bell,
  Building2,
  UserPlus,
  Palette,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

const links: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'quotes', label: 'Quotations', icon: FileSpreadsheet },
  { page: 'invoices', label: 'Invoices', icon: FileText },
  { page: 'recurring', label: 'Recurring', icon: RefreshCw },
  { page: 'reminders', label: 'Reminders', icon: Bell },
  { page: 'receipts', label: 'Receipts', icon: Receipt },
  { page: 'clients', label: 'Clients', icon: Users },
  { page: 'catalog', label: 'Catalog', icon: Package },
  { page: 'expenses', label: 'Expenses', icon: Wallet },
  { page: 'reports', label: 'Reports', icon: BarChart3 },
  { page: 'workspaces', label: 'Businesses', icon: Building2 },
  { page: 'leads', label: 'Leads', icon: UserPlus },
  { page: 'brand', label: 'Brand studio', icon: Palette },
  { page: 'settings', label: 'Business', icon: Settings },
  { page: 'pricing', label: 'Upgrade', icon: CreditCard },
];

function isActive(current: Page, page: Page) {
  if (page === 'invoices') return current.startsWith('invoice');
  if (page === 'quotes') return current.startsWith('quote');
  return current === page;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    nav,
    go,
    data,
    logout,
    cloudMode,
    cloudSyncing,
    cloudUser,
    switchWorkspace,
  } = useApp();

  const workspaces = data.workspaces || [];

  const NavButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {links.map(({ page, label, icon: Icon }) => (
        <button
          key={page}
          type="button"
          className={`side-link ${isActive(nav.page, page) ? 'active' : ''}`}
          onClick={() => go(page)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
      {!mobile && (
        <>
          <div className="side-spacer" />
          {workspaces.length > 1 && (
            <div style={{ padding: '0.5rem 0.75rem' }}>
              <label className="help" style={{ display: 'block', marginBottom: 4, color: '#8fb5ae' }}>
                Switch business
              </label>
              <select
                value={data.activeWorkspaceId}
                onChange={(e) => switchWorkspace(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#e7f5f2',
                  padding: '0.45rem',
                }}
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name || w.business.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="button" className="side-link" onClick={logout}>
            <LogOut size={18} />
            Log out
          </button>
          <div className="side-meta">
            {data.business.logoDataUrl ? (
              <img
                src={data.business.logoDataUrl}
                alt=""
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  objectFit: 'contain',
                  background: '#fff',
                  marginBottom: 6,
                }}
              />
            ) : null}
            {data.business.name || 'Your business'}
            <br />
            Plan: <strong>{data.business.plan === 'pro' ? 'Pro' : 'Free'}</strong>
            <br />
            {cloudMode ? (
              <span style={{ opacity: 0.85 }}>
                Cloud {cloudUser ? (cloudSyncing ? '· syncing…' : '· synced') : '· signed out'}
              </span>
            ) : (
              <span style={{ opacity: 0.75 }}>Local mode</span>
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button type="button" className="brand" onClick={() => go('dashboard')}>
          <span className="brand-mark">H</span>
          HustleDesk
        </button>
        <NavButtons />
      </aside>
      <div className="app-content">
        <nav className="mobile-nav">
          <button
            type="button"
            className="brand"
            onClick={() => go('dashboard')}
            style={{ color: 'white' }}
          >
            <span className="brand-mark">H</span>
          </button>
          <NavButtons mobile />
        </nav>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
