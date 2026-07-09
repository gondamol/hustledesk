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
  'settings',
  'pricing',
];

function Router() {
  const { nav, data, go } = useApp();
  const page = nav.page;

  if (page === 'landing') return <Landing />;
  if (page === 'login') return <Login />;
  if (page === 'signup') return <Signup />;

  // Protect app pages — still allow pricing public-ish via layout when logged in
  if (APP_PAGES.includes(page) && !data.session.loggedIn) {
    // Pricing can be viewed from landing without auth — redirect others to login
    if (page === 'pricing') {
      return (
        <div className="landing">
          <Pricing />
          <div className="section" style={{ textAlign: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => go('login')}>
              Log in to continue
            </button>
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
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
