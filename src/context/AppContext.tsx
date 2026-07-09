import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppData,
  BusinessProfile,
  CatalogItem,
  Client,
  Expense,
  Invoice,
  Page,
  PaymentRecord,
  Quote,
  Receipt,
} from '../types';
import {
  createAccount,
  loadData,
  loginAccount,
  logoutAccount,
  nextInvoiceNumber,
  nextQuoteNumber,
  nextReceiptNumber,
  persistWorkspace,
  resetDemo,
  getSessionEmail,
  defaultBusiness,
} from '../lib/storage';
import { addDaysISO, invoiceTotals, todayISO, uid } from '../lib/format';
import { isCloudEnabled } from '../lib/config';
import {
  cloudGetSession,
  cloudGetSubscription,
  cloudGetUser,
  cloudLoadWorkspace,
  cloudSaveWorkspace,
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  getSupabase,
} from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface NavState {
  page: Page;
  invoiceId?: string;
  quoteId?: string;
  receiptId?: string;
}

interface AppContextValue {
  data: AppData;
  nav: NavState;
  cloudUser: User | null;
  cloudMode: boolean;
  cloudSyncing: boolean;
  cloudReady: boolean;
  go: (page: Page, id?: string) => void;
  updateBusiness: (patch: Partial<BusinessProfile>) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  saveInvoice: (invoice: Invoice, isNew: boolean) => void;
  deleteInvoice: (id: string) => void;
  createBlankInvoice: (clientId?: string) => Invoice;
  duplicateInvoice: (id: string) => Invoice | null;
  recordPayment: (
    invoiceId: string,
    payment: Omit<PaymentRecord, 'id'>,
    issueReceipt: boolean,
  ) => Receipt | null;
  saveQuote: (quote: Quote, isNew: boolean) => void;
  deleteQuote: (id: string) => void;
  createBlankQuote: (clientId?: string) => Quote;
  convertQuoteToInvoice: (quoteId: string) => Invoice | null;
  saveCatalogItem: (item: CatalogItem, isNew: boolean) => void;
  deleteCatalogItem: (id: string) => void;
  saveExpense: (expense: Expense, isNew: boolean) => void;
  deleteExpense: (id: string) => void;
  deleteReceipt: (id: string) => void;
  importBackup: (json: string) => { ok: boolean; error?: string };
  exportBackup: () => string;
  getClient: (id: string) => Client | undefined;
  signup: (payload: {
    businessName: string;
    owner: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  stats: {
    outstanding: number;
    paidThisMonth: number;
    overdueCount: number;
    invoiceCount: number;
    clientCount: number;
    openQuotes: number;
    quotePipeline: number;
    expensesThisMonth: number;
    profitThisMonth: number;
  };
  freeInvoiceLimit: number;
  freeQuoteLimit: number;
  canCreateInvoice: boolean;
  canCreateQuote: boolean;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const FREE_INVOICE_LIMIT = 8;
const FREE_QUOTE_LIMIT = 8;

function emptyWorkspace(partial?: Partial<BusinessProfile>): AppData {
  return {
    business: { ...defaultBusiness(), ...partial },
    clients: [],
    invoices: [],
    quotes: [],
    catalog: [],
    expenses: [],
    receipts: [],
    session: { loggedIn: true },
  };
}

function normalizeLoaded(raw: AppData): AppData {
  return {
    ...raw,
    catalog: raw.catalog || [],
    expenses: raw.expenses || [],
    receipts: raw.receipts || [],
    invoices: (raw.invoices || []).map((i) => ({ ...i, payments: i.payments || [] })),
    session: { loggedIn: true },
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [nav, setNav] = useState<NavState>({ page: 'landing' });
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudReady, setCloudReady] = useState(!isCloudEnabled());
  const skipNextPersist = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cloudMode = isCloudEnabled();

  // Restore cloud session on boot
  useEffect(() => {
    if (!cloudMode) {
      setCloudReady(true);
      return;
    }
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const session = await cloudGetSession();
        if (session?.user) {
          setCloudUser(session.user);
          const remote = await cloudLoadWorkspace(session.user.id);
          if (remote) {
            skipNextPersist.current = true;
            setData(normalizeLoaded(remote));
          } else {
            // first cloud login: keep local empty structure with email
            setData((d) =>
              normalizeLoaded({
                ...d,
                business: {
                  ...d.business,
                  accountEmail: session.user.email || d.business.accountEmail,
                  email: session.user.email || d.business.email,
                },
                session: { loggedIn: true },
              }),
            );
          }
          const sub = await cloudGetSubscription(session.user.id);
          if (sub?.plan === 'pro' && sub.status === 'active') {
            setData((d) => ({ ...d, business: { ...d.business, plan: 'pro' } }));
          }
        }
        const sb = getSupabase();
        if (sb) {
          const { data: subData } = sb.auth.onAuthStateChange(async (event, sess) => {
            if (event === 'SIGNED_OUT') {
              setCloudUser(null);
            } else if (sess?.user) {
              setCloudUser(sess.user);
            }
          });
          unsub = () => subData.subscription.unsubscribe();
        }
      } catch (e) {
        console.warn('Cloud boot failed', e);
      } finally {
        setCloudReady(true);
      }
    })();
    return () => unsub?.();
  }, [cloudMode]);

  // Local multi-account persist
  useEffect(() => {
    const email = getSessionEmail() || data.business.accountEmail;
    if (email && data.session.loggedIn && !cloudUser) {
      persistWorkspace(email, data);
    }
  }, [data, cloudUser]);

  // Cloud debounced sync
  useEffect(() => {
    if (!cloudUser || !data.session.loggedIn) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        setCloudSyncing(true);
        await cloudSaveWorkspace(cloudUser.id, data);
      } catch (e) {
        console.warn('Cloud sync failed', e);
      } finally {
        setCloudSyncing(false);
      }
    }, 900);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [data, cloudUser]);

  const go = useCallback((page: Page, id?: string) => {
    if (page.startsWith('quote')) setNav({ page, quoteId: id });
    else if (page.startsWith('invoice')) setNav({ page, invoiceId: id });
    else if (page === 'receipts') setNav({ page, receiptId: id });
    else setNav({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateBusiness = useCallback((patch: Partial<BusinessProfile>) => {
    setData((d) => ({ ...d, business: { ...d.business, ...patch } }));
  }, []);

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const full: Client = { ...client, id: uid('cli'), createdAt: new Date().toISOString() };
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
    setData((d) => ({ ...d, clients: d.clients.filter((c) => c.id !== id) }));
  }, []);

  const saveInvoice = useCallback((invoice: Invoice, isNew: boolean) => {
    setData((d) => {
      if (isNew) {
        return {
          ...d,
          invoices: [invoice, ...d.invoices],
          business: {
            ...d.business,
            nextInvoiceNumber: (d.business.nextInvoiceNumber || 1) + 1,
          },
        };
      }
      return { ...d, invoices: d.invoices.map((i) => (i.id === invoice.id ? invoice : i)) };
    });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setData((d) => ({ ...d, invoices: d.invoices.filter((i) => i.id !== id) }));
  }, []);

  const createBlankInvoice = useCallback(
    (clientId?: string): Invoice => ({
      id: uid('inv'),
      number: nextInvoiceNumber(data.business),
      clientId: clientId || data.clients[0]?.id || '',
      issueDate: todayISO(),
      dueDate: addDaysISO(7),
      status: 'draft',
      items: [{ id: uid('li'), description: '', unit: 'unit', quantity: 1, unitPrice: 0 }],
      taxRate: 16,
      discount: 0,
      notes: data.business.notes || '',
      amountPaid: 0,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [data.business, data.clients],
  );

  const duplicateInvoice = useCallback(
    (id: string): Invoice | null => {
      const src = data.invoices.find((i) => i.id === id);
      if (!src) return null;
      if (data.business.plan !== 'pro' && data.invoices.length >= FREE_INVOICE_LIMIT) return null;
      const copy: Invoice = {
        ...src,
        id: uid('inv'),
        number: nextInvoiceNumber(data.business),
        status: 'draft',
        amountPaid: 0,
        payments: [],
        issueDate: todayISO(),
        dueDate: addDaysISO(7),
        items: src.items.map((it) => ({ ...it, id: uid('li') })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        quoteId: undefined,
        shareId: undefined,
      };
      setData((d) => ({
        ...d,
        invoices: [copy, ...d.invoices],
        business: {
          ...d.business,
          nextInvoiceNumber: (d.business.nextInvoiceNumber || 1) + 1,
        },
      }));
      return copy;
    },
    [data.invoices, data.business],
  );

  const recordPayment = useCallback(
    (invoiceId: string, payment: Omit<PaymentRecord, 'id'>, issueReceipt: boolean): Receipt | null => {
      let created: Receipt | null = null;
      setData((d) => {
        const inv = d.invoices.find((i) => i.id === invoiceId);
        if (!inv) return d;
        const pay: PaymentRecord = { ...payment, id: uid('pay') };
        const amountPaid = (inv.amountPaid || 0) + pay.amount;
        const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
        let status = inv.status;
        if (amountPaid >= total - 0.01) status = 'paid';
        else if (amountPaid > 0) status = 'partial';

        const invoices = d.invoices.map((i) =>
          i.id === invoiceId
            ? {
                ...i,
                amountPaid,
                status,
                payments: [...(i.payments || []), pay],
                updatedAt: new Date().toISOString(),
              }
            : i,
        );

        let receipts = d.receipts;
        let business = d.business;
        if (issueReceipt) {
          created = {
            id: uid('rct'),
            number: nextReceiptNumber(d.business),
            invoiceId,
            clientId: inv.clientId,
            date: pay.date,
            amount: pay.amount,
            method: pay.method,
            reference: pay.reference,
            createdAt: new Date().toISOString(),
          };
          receipts = [created, ...d.receipts];
          business = {
            ...d.business,
            nextReceiptNumber: (d.business.nextReceiptNumber || 1) + 1,
          };
        }
        return { ...d, invoices, receipts, business };
      });
      return created;
    },
    [],
  );

  const saveQuote = useCallback((quote: Quote, isNew: boolean) => {
    setData((d) => {
      if (isNew) {
        return {
          ...d,
          quotes: [quote, ...d.quotes],
          business: {
            ...d.business,
            nextQuoteNumber: (d.business.nextQuoteNumber || 1) + 1,
          },
        };
      }
      return { ...d, quotes: d.quotes.map((q) => (q.id === quote.id ? quote : q)) };
    });
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setData((d) => ({ ...d, quotes: d.quotes.filter((q) => q.id !== id) }));
  }, []);

  const createBlankQuote = useCallback(
    (clientId?: string): Quote => ({
      id: uid('qt'),
      number: nextQuoteNumber(data.business),
      clientId: clientId || data.clients[0]?.id || '',
      issueDate: todayISO(),
      validUntil: addDaysISO(14),
      status: 'draft',
      items: [{ id: uid('li'), description: '', unit: 'unit', quantity: 1, unitPrice: 0 }],
      taxRate: 16,
      discount: 0,
      notes: data.business.quoteNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [data.business, data.clients],
  );

  const convertQuoteToInvoice = useCallback(
    (quoteId: string): Invoice | null => {
      const quote = data.quotes.find((q) => q.id === quoteId);
      if (!quote) return null;
      if (data.business.plan !== 'pro' && data.invoices.length >= FREE_INVOICE_LIMIT) return null;
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
        payments: [],
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

  const saveCatalogItem = useCallback((item: CatalogItem, isNew: boolean) => {
    setData((d) => ({
      ...d,
      catalog: isNew ? [item, ...d.catalog] : d.catalog.map((c) => (c.id === item.id ? item : c)),
    }));
  }, []);

  const deleteCatalogItem = useCallback((id: string) => {
    setData((d) => ({ ...d, catalog: d.catalog.filter((c) => c.id !== id) }));
  }, []);

  const saveExpense = useCallback((expense: Expense, isNew: boolean) => {
    setData((d) => ({
      ...d,
      expenses: isNew
        ? [expense, ...d.expenses]
        : d.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  }, []);

  const deleteReceipt = useCallback((id: string) => {
    setData((d) => ({ ...d, receipts: d.receipts.filter((r) => r.id !== id) }));
  }, []);

  const exportBackup = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const importBackup = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as AppData;
      if (!parsed.business || !Array.isArray(parsed.invoices)) {
        return { ok: false, error: 'Invalid backup file.' };
      }
      setData(normalizeLoaded({ ...parsed, session: { loggedIn: true } }));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not parse JSON backup.' };
    }
  }, []);

  const getClient = useCallback(
    (id: string) => data.clients.find((c) => c.id === id),
    [data.clients],
  );

  const signup = useCallback(
    async (payload: {
      businessName: string;
      owner: string;
      email: string;
      password: string;
      phone: string;
    }) => {
      if (cloudMode) {
        try {
          const result = await cloudSignUp(payload.email, payload.password, {
            businessName: payload.businessName,
            owner: payload.owner,
            phone: payload.phone,
          });
          const user = result.user;
          if (!user) {
            return {
              ok: true,
              error: undefined,
            };
          }
          // email confirmation may be required
          if (!result.session) {
            return {
              ok: true,
              error: 'Account created. Check your email to confirm, then log in.',
            };
          }
          setCloudUser(user);
          const ws = emptyWorkspace({
            name: payload.businessName.trim(),
            owner: payload.owner.trim(),
            phone: payload.phone.trim(),
            email: payload.email.trim().toLowerCase(),
            accountEmail: payload.email.trim().toLowerCase(),
            onboardingDone: true,
          });
          setData(ws);
          await cloudSaveWorkspace(user.id, ws);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : 'Signup failed' };
        }
      }

      const res = createAccount(payload.email, payload.password, {
        name: payload.businessName.trim(),
        owner: payload.owner.trim(),
        phone: payload.phone.trim(),
      });
      if (!res.ok) return { ok: false, error: res.error };
      setData(res.data);
      return { ok: true };
    },
    [cloudMode],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (cloudMode) {
        try {
          const result = await cloudSignIn(email, password);
          const user = result.user;
          setCloudUser(user);
          const remote = await cloudLoadWorkspace(user.id);
          if (remote) {
            skipNextPersist.current = true;
            let next = normalizeLoaded(remote);
            const sub = await cloudGetSubscription(user.id);
            if (sub?.plan === 'pro' && sub.status === 'active') {
              next = { ...next, business: { ...next.business, plan: 'pro' } };
            }
            setData(next);
          } else {
            setData(
              emptyWorkspace({
                email: user.email || email,
                accountEmail: user.email || email,
                onboardingDone: true,
              }),
            );
          }
          return { ok: true };
        } catch (e) {
          // fall back to local if cloud fails and local demo exists
          const local = loginAccount(email, password);
          if (local.ok) {
            setData(local.data);
            return { ok: true };
          }
          return { ok: false, error: e instanceof Error ? e.message : 'Login failed' };
        }
      }

      const res = loginAccount(email, password);
      if (!res.ok) return { ok: false, error: res.error };
      setData(res.data);
      return { ok: true };
    },
    [cloudMode],
  );

  const logout = useCallback(async () => {
    if (cloudMode) await cloudSignOut();
    logoutAccount();
    setCloudUser(null);
    setData((d) => ({ ...d, session: { loggedIn: false } }));
    setNav({ page: 'landing' });
  }, [cloudMode]);

  const refreshSubscription = useCallback(async () => {
    const user = cloudUser || (await cloudGetUser());
    if (!user) return;
    const sub = await cloudGetSubscription(user.id);
    if (sub?.plan === 'pro' && sub.status === 'active') {
      setData((d) => ({ ...d, business: { ...d.business, plan: 'pro' } }));
    }
  }, [cloudUser]);

  const resetDemoData = useCallback(() => {
    setCloudUser(null);
    setData(resetDemo());
    setNav({ page: 'dashboard' });
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
    let expensesThisMonth = 0;

    for (const inv of data.invoices) {
      const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
      const balance = Math.max(0, total - (inv.amountPaid || 0));
      if (inv.status !== 'paid' && inv.status !== 'draft') outstanding += balance;
      if (inv.status === 'overdue') overdueCount += 1;
      for (const p of inv.payments || []) {
        const d = new Date(p.date);
        if (d.getMonth() === month && d.getFullYear() === year) paidThisMonth += p.amount;
      }
      if (inv.status === 'paid' && !(inv.payments || []).length) {
        const d = new Date(inv.updatedAt || inv.issueDate);
        if (d.getMonth() === month && d.getFullYear() === year) paidThisMonth += total;
      }
    }

    for (const q of data.quotes) {
      if (q.status === 'sent' || q.status === 'draft' || q.status === 'accepted') {
        openQuotes += 1;
        quotePipeline += invoiceTotals(q.items, q.taxRate, q.discount).total;
      }
    }

    for (const e of data.expenses) {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) expensesThisMonth += e.amount;
    }

    return {
      outstanding,
      paidThisMonth,
      overdueCount,
      invoiceCount: data.invoices.length,
      clientCount: data.clients.length,
      openQuotes,
      quotePipeline,
      expensesThisMonth,
      profitThisMonth: paidThisMonth - expensesThisMonth,
    };
  }, [data]);

  const canCreateInvoice =
    data.business.plan === 'pro' || data.invoices.length < FREE_INVOICE_LIMIT;
  const canCreateQuote =
    data.business.plan === 'pro' || data.quotes.length < FREE_QUOTE_LIMIT;

  const value: AppContextValue = {
    data,
    nav,
    cloudUser,
    cloudMode,
    cloudSyncing,
    cloudReady,
    go,
    updateBusiness,
    addClient,
    updateClient,
    deleteClient,
    saveInvoice,
    deleteInvoice,
    createBlankInvoice,
    duplicateInvoice,
    recordPayment,
    saveQuote,
    deleteQuote,
    createBlankQuote,
    convertQuoteToInvoice,
    saveCatalogItem,
    deleteCatalogItem,
    saveExpense,
    deleteExpense,
    deleteReceipt,
    importBackup,
    exportBackup,
    getClient,
    signup,
    login,
    logout,
    refreshSubscription,
    stats,
    freeInvoiceLimit: FREE_INVOICE_LIMIT,
    freeQuoteLimit: FREE_QUOTE_LIMIT,
    canCreateInvoice,
    canCreateQuote,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
