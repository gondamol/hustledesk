import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login, Signup } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Invoices } from './pages/Invoices';
import { InvoiceForm } from './pages/InvoiceForm';
import { InvoiceView } from './pages/InvoiceView';
import { Quotes } from './pages/Quotes';
import { QuoteForm } from './pages/QuoteForm';
import { QuoteView } from './pages/QuoteView';
import { Settings } from './pages/Settings';
import { Pricing } from './pages/Pricing';
import { Catalog } from './pages/Catalog';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Receipts } from './pages/Receipts';
import { SharePublic } from './pages/SharePublic';
import { ShortShare } from './pages/ShortShare';
import type { Page } from './types';

const APP_PAGES: Page[] = [
  'dashboard',
  'clients',
  'invoices',
  'invoice-new',
  'invoice-edit',
  'invoice-view',
  'quotes',
  'quote-new',
  'quote-edit',
  'quote-view',
  'catalog',
  'expenses',
  'receipts',
  'reports',
  'settings',
  'pricing',
];

function AppShell() {
  const { nav, data, go } = useApp();
  const page = nav.page;

  if (page === 'landing') return <Landing />;
  if (page === 'login') return <Login />;
  if (page === 'signup') return <Signup />;

  if (APP_PAGES.includes(page) && !data.session.loggedIn) {
    if (page === 'pricing') {
      return (
        <div className="landing">
          <div className="section">
            <Pricing />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => go('login')}>
                Log in to continue
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Login />;
  }

  let body: React.ReactNode;
  switch (page) {
    case 'dashboard':
      body = <Dashboard />;
      break;
    case 'clients':
      body = <Clients />;
      break;
    case 'invoices':
      body = <Invoices />;
      break;
    case 'invoice-new':
      body = <InvoiceForm mode="new" />;
      break;
    case 'invoice-edit':
      body = <InvoiceForm mode="edit" />;
      break;
    case 'invoice-view':
      body = <InvoiceView />;
      break;
    case 'quotes':
      body = <Quotes />;
      break;
    case 'quote-new':
      body = <QuoteForm mode="new" />;
      break;
    case 'quote-edit':
      body = <QuoteForm mode="edit" />;
      break;
    case 'quote-view':
      body = <QuoteView />;
      break;
    case 'catalog':
      body = <Catalog />;
      break;
    case 'expenses':
      body = <Expenses />;
      break;
    case 'receipts':
      body = <Receipts />;
      break;
    case 'reports':
      body = <Reports />;
      break;
    case 'settings':
      body = <Settings />;
      break;
    case 'pricing':
      body = <Pricing />;
      break;
    default:
      body = <Dashboard />;
  }

  return <Layout>{body}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/s/:id" element={<ShortShare />} />
          <Route path="/share/:token" element={<SharePublic />} />
          <Route path="/*" element={<AppShell />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
