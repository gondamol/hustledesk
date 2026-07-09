import type {
  AppData,
  BusinessProfile,
  CatalogItem,
  Client,
  Invoice,
  Quote,
} from '../types';
import { addDaysISO, todayISO, uid } from './format';
import { DEFAULT_THEME, themeFromPrimary } from './theme';

const DATA_KEY = 'hustledesk_v3';
const ACCOUNTS_KEY = 'hustledesk_accounts_v1';
const SESSION_KEY = 'hustledesk_session_v1';
const LEGACY_KEYS = ['hustledesk_v2', 'hustledesk_v1'];

export interface AccountRecord {
  email: string;
  password: string;
  createdAt: string;
  data: AppData;
}

export function defaultBusiness(): BusinessProfile {
  return {
  name: '',
  owner: '',
  email: '',
  phone: '',
  address: '',
  city: 'Nairobi',
  kraPin: '',
  mpesaTill: '',
  mpesaPaybill: '',
  mpesaAccount: '',
  bankName: '',
  bankAccount: '',
  bankBranch: '',
  currency: 'KES',
  invoicePrefix: 'INV',
  quotePrefix: 'QT',
  receiptPrefix: 'RCT',
  nextInvoiceNumber: 1,
  nextQuoteNumber: 1,
  nextReceiptNumber: 1,
  notes: 'Thank you for your business. Payment is due by the date above.',
  quoteNotes: 'This quotation is valid until the date shown.',
  logoDataUrl: '',
  plan: 'free',
  accountEmail: '',
  accountPassword: '',
  onboardingDone: false,
  brandColor: DEFAULT_THEME.primary,
  theme: { ...DEFAULT_THEME },
  paymentTerms: 'Payment due within 7 days of invoice date.',
  salesWhatsApp: '',
  isAccountant: false,
  };
}

function ensureInvoice(inv: Invoice): Invoice {
  return {
    ...inv,
    payments: inv.payments || [],
    items: (inv.items || []).map((it) => ({
      ...it,
      unit: it.unit || 'unit',
    })),
  };
}

function emptyData(): AppData {
  return {
    business: defaultBusiness(),
    clients: [],
    invoices: [],
    quotes: [],
    catalog: [],
    expenses: [],
    receipts: [],
    recurring: [],
    reminders: [],
    workspaces: [],
    activeWorkspaceId: '',
    leads: [],
    session: { loggedIn: false },
  };
}

function seedData(): AppData {
  const clientA: Client = {
    id: uid('cli'),
    name: 'Amina Wanjiku',
    email: 'amina@example.co.ke',
    phone: '+254712345678',
    company: 'GreenLeaf Catering',
    address: 'Westlands, Nairobi',
    notes: 'Pays via M-Pesa Till',
    createdAt: new Date().toISOString(),
  };
  const clientB: Client = {
    id: uid('cli'),
    name: 'James Otieno',
    email: 'james@techstart.ke',
    phone: '+254722000111',
    company: 'TechStart KE',
    address: 'Kilimani, Nairobi',
    notes: 'Monthly retainer',
    createdAt: new Date().toISOString(),
  };

  const catalog: CatalogItem[] = [
    {
      id: uid('cat'),
      name: 'Website maintenance (monthly)',
      unit: 'mo',
      unitPrice: 18000,
      taxRate: 16,
      category: 'Services',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('cat'),
      name: 'Logo design package',
      unit: 'job',
      unitPrice: 12000,
      taxRate: 0,
      category: 'Design',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('cat'),
      name: 'Event staff',
      unit: 'person',
      unitPrice: 3500,
      taxRate: 16,
      category: 'Labour',
      createdAt: new Date().toISOString(),
    },
  ];

  const inv1: Invoice = {
    id: uid('inv'),
    number: 'INV-0001',
    clientId: clientA.id,
    issueDate: todayISO(),
    dueDate: addDaysISO(7),
    status: 'sent',
    items: [
      { id: uid('li'), description: 'Event catering setup', unit: 'job', quantity: 1, unitPrice: 25000 },
      { id: uid('li'), description: 'Service staff', unit: 'person', quantity: 4, unitPrice: 3500 },
      { id: uid('li'), description: 'Drinks package (soft)', unit: 'tray', quantity: 6, unitPrice: 1200 },
    ],
    taxRate: 16,
    discount: 0,
    notes: 'Pay via M-Pesa Till.',
    amountPaid: 0,
    payments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const inv2: Invoice = {
    id: uid('inv'),
    number: 'INV-0002',
    clientId: clientB.id,
    issueDate: addDaysISO(-20),
    dueDate: addDaysISO(-5),
    status: 'overdue',
    items: [
      { id: uid('li'), description: 'Website maintenance — June', unit: 'mo', quantity: 1, unitPrice: 18000 },
    ],
    taxRate: 16,
    discount: 1000,
    notes: 'Monthly maintenance package',
    amountPaid: 5000,
    payments: [
      {
        id: uid('pay'),
        amount: 5000,
        date: addDaysISO(-10),
        method: 'M-Pesa',
        reference: 'QWE123XYZ',
        note: 'Partial deposit',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const inv3: Invoice = {
    id: uid('inv'),
    number: 'INV-0003',
    clientId: clientB.id,
    issueDate: addDaysISO(-40),
    dueDate: addDaysISO(-25),
    status: 'paid',
    items: [
      { id: uid('li'), description: 'Logo redesign package', unit: 'job', quantity: 1, unitPrice: 12000 },
    ],
    taxRate: 0,
    discount: 0,
    notes: '',
    amountPaid: 12000,
    payments: [
      {
        id: uid('pay'),
        amount: 12000,
        date: addDaysISO(-30),
        method: 'M-Pesa',
        reference: 'PAID001',
        note: 'Full payment',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const quote1: Quote = {
    id: uid('qt'),
    number: 'QT-0001',
    clientId: clientA.id,
    issueDate: todayISO(),
    validUntil: addDaysISO(14),
    status: 'sent',
    items: [
      { id: uid('li'), description: 'Wedding catering — 80 guests', unit: 'guest', quantity: 80, unitPrice: 1500 },
      { id: uid('li'), description: 'Decor & table setup', unit: 'job', quantity: 1, unitPrice: 35000 },
      { id: uid('li'), description: 'Wait staff', unit: 'person', quantity: 6, unitPrice: 4000 },
    ],
    taxRate: 16,
    discount: 5000,
    notes: '50% deposit to confirm date.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    business: {
      ...defaultBusiness(),
      name: 'Hustle Studio KE',
      owner: 'Demo User',
      email: 'hello@hustlestudio.ke',
      phone: '+254700000000',
      address: 'Ngong Road',
      city: 'Nairobi',
      kraPin: 'A000000000X',
      mpesaTill: '123456',
      bankName: 'Equity Bank',
      bankAccount: '0123456789',
      bankBranch: 'Westlands',
      nextInvoiceNumber: 4,
      nextQuoteNumber: 2,
      nextReceiptNumber: 1,
      accountEmail: 'demo@hustledesk.ke',
      accountPassword: 'demo123',
      onboardingDone: true,
      brandColor: '#0f766e',
      notes: 'Asante sana. Kindly pay by the due date via M-Pesa or bank transfer.',
      quoteNotes: 'Quotation valid for 14 days. 50% deposit locks your date.',
    },
    clients: [clientA, clientB],
    invoices: [inv1, inv2, inv3],
    quotes: [quote1],
    catalog,
    expenses: [
      {
        id: uid('exp'),
        date: addDaysISO(-3),
        category: 'supplies',
        description: 'Packaging materials',
        amount: 4500,
        vendor: 'Carrefour',
        paymentMethod: 'M-Pesa',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid('exp'),
        date: addDaysISO(-12),
        category: 'transport',
        description: 'Client meeting Uber',
        amount: 850,
        vendor: 'Uber',
        paymentMethod: 'M-Pesa',
        createdAt: new Date().toISOString(),
      },
    ],
    receipts: [],
    recurring: [
      {
        id: uid('rec'),
        name: 'TechStart monthly maintenance',
        clientId: clientB.id,
        frequency: 'monthly',
        nextRun: todayISO(),
        dueDays: 7,
        items: [
          {
            id: uid('li'),
            description: 'Website maintenance retainer',
            unit: 'mo',
            quantity: 1,
            unitPrice: 18000,
          },
        ],
        taxRate: 16,
        discount: 0,
        notes: 'Monthly retainer — auto-generated.',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
    reminders: [],
    workspaces: [],
    activeWorkspaceId: '',
    leads: [],
    session: { loggedIn: false },
  };
}

function migrate(raw: unknown): AppData {
  const d = raw as Partial<AppData>;
  const business = { ...defaultBusiness(), ...d.business };
  if (!business.receiptPrefix) business.receiptPrefix = 'RCT';
  if (!business.nextReceiptNumber) business.nextReceiptNumber = 1;
  if (!business.brandColor) business.brandColor = '#0f766e';
  if (!business.paymentTerms) business.paymentTerms = defaultBusiness().paymentTerms;
  if (business.salesWhatsApp === undefined) business.salesWhatsApp = '';
  if (business.isAccountant === undefined) business.isAccountant = false;
  if (!business.theme?.primary) {
    business.theme = themeFromPrimary(business.brandColor || DEFAULT_THEME.primary);
  }
  if (!business.brandColor) business.brandColor = business.theme.primary;

  return {
    business,
    clients: d.clients || [],
    invoices: (d.invoices || []).map(ensureInvoice),
    quotes: d.quotes || [],
    catalog: d.catalog || [],
    expenses: d.expenses || [],
    receipts: d.receipts || [],
    recurring: d.recurring || [],
    reminders: d.reminders || [],
    workspaces: d.workspaces || [],
    activeWorkspaceId: d.activeWorkspaceId || '',
    leads: d.leads || [],
    session: d.session || { loggedIn: false },
  };
}

export function loadAccounts(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AccountRecord>) : {};
  } catch {
    return {};
  }
}

export function saveAccounts(accounts: Record<string, AccountRecord>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getSessionEmail(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { email?: string };
    return s.email || null;
  } catch {
    return null;
  }
}

export function setSessionEmail(email: string | null) {
  if (!email) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}

/** Load workspace for current session, or seed demo */
export function loadData(): AppData {
  const email = getSessionEmail();
  const accounts = loadAccounts();

  if (email && accounts[email]) {
    const data = migrate(accounts[email].data);
    data.session = { loggedIn: true };
    return data;
  }

  // migrate legacy single-workspace into demo account once
  for (const key of [DATA_KEY, ...LEGACY_KEYS]) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const data = migrate(JSON.parse(raw));
        // ensure demo account exists
        if (!accounts['demo@hustledesk.ke']) {
          const demo = seedData();
          accounts['demo@hustledesk.ke'] = {
            email: 'demo@hustledesk.ke',
            password: 'demo123',
            createdAt: new Date().toISOString(),
            data: { ...demo, session: { loggedIn: false } },
          };
          saveAccounts(accounts);
        }
        // if legacy had real account, register it
        if (data.business.accountEmail) {
          const e = data.business.accountEmail.toLowerCase();
          if (!accounts[e]) {
            accounts[e] = {
              email: e,
              password: data.business.accountPassword || 'changeme',
              createdAt: new Date().toISOString(),
              data: { ...data, session: { loggedIn: false } },
            };
            saveAccounts(accounts);
          }
        }
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      break;
    }
  }

  // ensure demo always available
  if (!accounts['demo@hustledesk.ke']) {
    const demo = seedData();
    accounts['demo@hustledesk.ke'] = {
      email: 'demo@hustledesk.ke',
      password: 'demo123',
      createdAt: new Date().toISOString(),
      data: { ...demo, session: { loggedIn: false } },
    };
    saveAccounts(accounts);
  }

  return { ...emptyData(), session: { loggedIn: false } };
}

export function persistWorkspace(email: string, data: AppData) {
  const accounts = loadAccounts();
  const key = email.toLowerCase();
  if (!accounts[key]) return;
  accounts[key] = {
    ...accounts[key],
    data: { ...data, session: { loggedIn: false } },
  };
  saveAccounts(accounts);
  // also keep last active snapshot
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function createAccount(
  email: string,
  password: string,
  initial: Partial<BusinessProfile>,
): { ok: true; data: AppData } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  if (!e || !password || password.length < 4) {
    return { ok: false, error: 'Email and password (min 4 chars) required.' };
  }
  const accounts = loadAccounts();
  if (accounts[e]) return { ok: false, error: 'An account with this email already exists. Log in instead.' };

  const data = emptyData();
  data.business = {
    ...data.business,
    ...initial,
    email: e,
    accountEmail: e,
    accountPassword: password,
    onboardingDone: true,
  };
  data.session = { loggedIn: true };

  accounts[e] = {
    email: e,
    password,
    createdAt: new Date().toISOString(),
    data: { ...data, session: { loggedIn: false } },
  };
  saveAccounts(accounts);
  setSessionEmail(e);
  return { ok: true, data };
}

export function loginAccount(
  email: string,
  password: string,
): { ok: true; data: AppData } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  const accounts = loadAccounts();
  const acc = accounts[e];
  if (!acc || acc.password !== password) {
    return {
      ok: false,
      error: 'Wrong email or password. Try demo@hustledesk.ke / demo123',
    };
  }
  setSessionEmail(e);
  const data = migrate(acc.data);
  data.session = { loggedIn: true };
  return { ok: true, data };
}

export function logoutAccount() {
  setSessionEmail(null);
}

export function resetDemo(): AppData {
  const demo = seedData();
  const accounts = loadAccounts();
  accounts['demo@hustledesk.ke'] = {
    email: 'demo@hustledesk.ke',
    password: 'demo123',
    createdAt: new Date().toISOString(),
    data: { ...demo, session: { loggedIn: false } },
  };
  saveAccounts(accounts);
  setSessionEmail('demo@hustledesk.ke');
  return { ...demo, session: { loggedIn: true } };
}

export function nextInvoiceNumber(business: BusinessProfile): string {
  const n = business.nextInvoiceNumber || 1;
  return `${business.invoicePrefix || 'INV'}-${String(n).padStart(4, '0')}`;
}

export function nextQuoteNumber(business: BusinessProfile): string {
  const n = business.nextQuoteNumber || 1;
  return `${business.quotePrefix || 'QT'}-${String(n).padStart(4, '0')}`;
}

export function nextReceiptNumber(business: BusinessProfile): string {
  const n = business.nextReceiptNumber || 1;
  return `${business.receiptPrefix || 'RCT'}-${String(n).padStart(4, '0')}`;
}
