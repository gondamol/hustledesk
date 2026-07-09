import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppData,
  BusinessProfile,
  Client,
  Invoice,
  Page,
  Quote,
} from '../types';
import {
  clearAllData,
  loadData,
  nextInvoiceNumber,
  nextQuoteNumber,
  resetData,
  saveData,
} from '../lib/storage';
import { addDaysISO, invoiceTotals, todayISO, uid } from '../lib/format';

interface NavState {
  page: Page;
  invoiceId?: string;
  quoteId?: string;
}

interface AppContextValue {
  data: AppData;
  nav: NavState;
  go: (page: Page, id?: string) => void;
  updateBusiness: (patch: Partial<BusinessProfile>) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  saveInvoice: (invoice: Invoice, isNew: boolean) => void;
  deleteInvoice: (id: string) => void;
  createBlankInvoice: (clientId?: string) => Invoice;
  saveQuote: (quote: Quote, isNew: boolean) => void;
  deleteQuote: (id: string) => void;
  createBlankQuote: (clientId?: string) => Quote;
  convertQuoteToInvoice: (quoteId: string) => Invoice | null;
  getClient: (id: string) => Client | undefined;
  signup: (payload: {
    businessName: string;
    owner: string;
    email: string;
    password: string;
    phone: string;
  }) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  stats: {
    outstanding: number;
    paidThisMonth: number;
    overdueCount: number;
    invoiceCount: number;
    clientCount: number;
    openQuotes: number;
    quotePipeline: number;
  };
  freeInvoiceLimit: number;
  freeQuoteLimit: number;
  canCreateInvoice: boolean;
  canCreateQuote: boolean;
  resetDemo: () => void;
  wipeData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const FREE_INVOICE_LIMIT = 5;
const FREE_QUOTE_LIMIT = 5;

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [nav, setNav] = useState<NavState>({ page: 'landing' });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const go = useCallback((page: Page, id?: string) => {
    if (page.startsWith('quote')) {
      setNav({ page, quoteId: id });
    } else if (page.startsWith('invoice')) {
      setNav({ page, invoiceId: id });
    } else {
      setNav({ page });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateBusiness = useCallback((patch: Partial<BusinessProfile>) => {
    setData((d) => ({ ...d, business: { ...d.business, ...patch } }));
  }, []);

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const full: Client = {
      ...client,
      id: uid('cli'),
      createdAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, clients: [full, ...d.clients] }));
    return full;
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      clients: d.clients.filter((c) => c.id !== id),
    }));
  }, []);

  const saveInvoice = useCallback((invoice: Invoice, isNew: boolean) => {
    setData((d) => {
      let invoices = d.invoices;
      let business = d.business;
      if (isNew) {
        invoices = [invoice, ...d.invoices];
        business = {
          ...d.business,
          nextInvoiceNumber: (d.business.nextInvoiceNumber || 1) + 1,
        };
      } else {
        invoices = d.invoices.map((i) => (i.id === invoice.id ? invoice : i));
      }
      return { ...d, invoices, business };
    });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setData((d) => ({ ...d, invoices: d.invoices.filter((i) => i.id !== id) }));
  }, []);

  const createBlankInvoice = useCallback(
    (clientId?: string): Invoice => {
      const number = nextInvoiceNumber(data.business);
      return {
        id: uid('inv'),
        number,
        clientId: clientId || data.clients[0]?.id || '',
        issueDate: todayISO(),
        dueDate: addDaysISO(7),
        status: 'draft',
        items: [
          { id: uid('li'), description: '', unit: 'unit', quantity: 1, unitPrice: 0 },
        ],
        taxRate: 16,
        discount: 0,
        notes: data.business.notes || '',
        amountPaid: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    [data.business, data.clients],
  );

  const saveQuote = useCallback((quote: Quote, isNew: boolean) => {
    setData((d) => {
      let quotes = d.quotes;
      let business = d.business;
      if (isNew) {
        quotes = [quote, ...d.quotes];
        business = {
          ...d.business,
          nextQuoteNumber: (d.business.nextQuoteNumber || 1) + 1,
        };
      } else {
        quotes = d.quotes.map((q) => (q.id === quote.id ? quote : q));
      }
      return { ...d, quotes, business };
    });
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setData((d) => ({ ...d, quotes: d.quotes.filter((q) => q.id !== id) }));
  }, []);

  const createBlankQuote = useCallback(
    (clientId?: string): Quote => {
      const number = nextQuoteNumber(data.business);
      return {
        id: uid('qt'),
        number,
        clientId: clientId || data.clients[0]?.id || '',
        issueDate: todayISO(),
        validUntil: addDaysISO(14),
        status: 'draft',
        items: [
          { id: uid('li'), description: '', unit: 'unit', quantity: 1, unitPrice: 0 },
        ],
        taxRate: 16,
        discount: 0,
        notes: data.business.quoteNotes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    [data.business, data.clients],
  );

  const convertQuoteToInvoice = useCallback(
    (quoteId: string): Invoice | null => {
      const quote = data.quotes.find((q) => q.id === quoteId);
      if (!quote) return null;
      if (data.business.plan !== 'pro' && data.invoices.length >= FREE_INVOICE_LIMIT) {
        return null;
      }
      const inv: Invoice = {
        id: uid('inv'),
        number: nextInvoiceNumber(data.business),
        clientId: quote.clientId,
        issueDate: todayISO(),
        dueDate: addDaysISO(7),
        status: 'sent',
        items: quote.items.map((it) => ({ ...it, id: uid('li') })),
        taxRate: quote.taxRate,
        discount: quote.discount,
        notes: `Converted from quotation ${quote.number}.\n${quote.notes || ''}`,
        amountPaid: 0,
        quoteId: quote.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setData((d) => ({
        ...d,
        invoices: [inv, ...d.invoices],
        business: {
          ...d.business,
          nextInvoiceNumber: (d.business.nextInvoiceNumber || 1) + 1,
        },
        quotes: d.quotes.map((q) =>
          q.id === quoteId
            ? {
                ...q,
                status: 'converted' as const,
                convertedInvoiceId: inv.id,
                updatedAt: new Date().toISOString(),
              }
            : q,
        ),
      }));
      return inv;
    },
    [data.quotes, data.business, data.invoices.length],
  );

  const getClient = useCallback(
    (id: string) => data.clients.find((c) => c.id === id),
    [data.clients],
  );

  const signup = useCallback(
    (payload: {
      businessName: string;
      owner: string;
      email: string;
      password: string;
      phone: string;
    }) => {
      if (!payload.email.trim() || !payload.password || payload.password.length < 4) {
        return { ok: false, error: 'Email and password (min 4 chars) required.' };
      }
      if (!payload.businessName.trim()) {
        return { ok: false, error: 'Business name is required.' };
      }
      setData((d) => ({
        ...d,
        business: {
          ...d.business,
          name: payload.businessName.trim(),
          owner: payload.owner.trim(),
          email: payload.email.trim().toLowerCase(),
          phone: payload.phone.trim(),
          accountEmail: payload.email.trim().toLowerCase(),
          accountPassword: payload.password,
          onboardingDone: true,
        },
        session: { loggedIn: true },
      }));
      return { ok: true };
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) => {
      const e = email.trim().toLowerCase();
      // Demo account always works
      if (
        (e === data.business.accountEmail && password === data.business.accountPassword) ||
        (e === 'demo@hustledesk.ke' && password === 'demo123')
      ) {
        setData((d) => ({ ...d, session: { loggedIn: true } }));
        return { ok: true };
      }
      // First-time: if no account set, allow login that sets session if matching email on business
      if (!data.business.accountEmail && data.business.email.toLowerCase() === e) {
        setData((d) => ({
          ...d,
          business: {
            ...d.business,
            accountEmail: e,
            accountPassword: password,
            onboardingDone: true,
          },
          session: { loggedIn: true },
        }));
        return { ok: true };
      }
      return { ok: false, error: 'Wrong email or password. Try demo@hustledesk.ke / demo123' };
    },
    [data.business],
  );

  const logout = useCallback(() => {
    setData((d) => ({ ...d, session: { loggedIn: false } }));
    setNav({ page: 'landing' });
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let outstanding = 0;
    let paidThisMonth = 0;
    let overdueCount = 0;
    let quotePipeline = 0;
    let openQuotes = 0;

    for (const inv of data.invoices) {
      const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
      const balance = Math.max(0, total - (inv.amountPaid || 0));
      if (inv.status !== 'paid' && inv.status !== 'draft') outstanding += balance;
      if (inv.status === 'overdue') overdueCount += 1;
      if (inv.status === 'paid') {
        const d = new Date(inv.updatedAt || inv.issueDate);
        if (d.getMonth() === month && d.getFullYear() === year) paidThisMonth += total;
      }
    }

    for (const q of data.quotes) {
      if (q.status === 'sent' || q.status === 'draft' || q.status === 'accepted') {
        openQuotes += 1;
        const { total } = invoiceTotals(q.items, q.taxRate, q.discount);
        quotePipeline += total;
      }
    }

    return {
      outstanding,
      paidThisMonth,
      overdueCount,
      invoiceCount: data.invoices.length,
      clientCount: data.clients.length,
      openQuotes,
      quotePipeline,
    };
  }, [data.invoices, data.clients, data.quotes]);

  const canCreateInvoice =
    data.business.plan === 'pro' || data.invoices.length < FREE_INVOICE_LIMIT;
  const canCreateQuote =
    data.business.plan === 'pro' || data.quotes.length < FREE_QUOTE_LIMIT;

  const resetDemo = useCallback(() => setData(resetData()), []);
  const wipeData = useCallback(() => setData(clearAllData()), []);

  const value: AppContextValue = {
    data,
    nav,
    go,
    updateBusiness,
    addClient,
    updateClient,
    deleteClient,
    saveInvoice,
    deleteInvoice,
    createBlankInvoice,
    saveQuote,
    deleteQuote,
    createBlankQuote,
    convertQuoteToInvoice,
    getClient,
    signup,
    login,
    logout,
    stats,
    freeInvoiceLimit: FREE_INVOICE_LIMIT,
    freeQuoteLimit: FREE_QUOTE_LIMIT,
    canCreateInvoice,
    canCreateQuote,
    resetDemo,
    wipeData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
