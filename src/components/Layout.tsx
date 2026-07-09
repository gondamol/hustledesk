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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

const links: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'quotes', label: 'Quotations', icon: FileSpreadsheet },
  { page: 'invoices', label: 'Invoices', icon: FileText },
  { page: 'receipts', label: 'Receipts', icon: Receipt },
  { page: 'clients', label: 'Clients', icon: Users },
  { page: 'catalog', label: 'Catalog', icon: Package },
  { page: 'expenses', label: 'Expenses', icon: Wallet },
  { page: 'reports', label: 'Reports', icon: BarChart3 },
  { page: 'settings', label: 'Business', icon: Settings },
  { page: 'pricing', label: 'Upgrade', icon: CreditCard },
];

function isActive(current: Page, page: Page) {
  if (page === 'invoices') return current.startsWith('invoice');
  if (page === 'quotes') return current.startsWith('quote');
  return current === page;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { nav, go, data, logout } = useApp();

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
      <div>
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
