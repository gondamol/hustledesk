import type { AppData, BusinessProfile, Client, Invoice, Quote } from '../types';
import { addDaysISO, todayISO, uid } from './format';

const STORAGE_KEY = 'hustledesk_v2';
const LEGACY_KEY = 'hustledesk_v1';

export const defaultBusiness = (): BusinessProfile => ({
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
  nextInvoiceNumber: 1,
  nextQuoteNumber: 1,
  notes: 'Thank you for your business. Payment is due by the date above.',
  quoteNotes: 'This quotation is valid until the date shown. Prices in KES unless stated.',
  logoDataUrl: '',
  plan: 'free',
  accountEmail: '',
  accountPassword: '',
  onboardingDone: false,
});

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
    notes: 'Pay via M-Pesa Till. Quote reference: GL-2026.',
    amountPaid: 0,
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
    notes: 'Includes setup and cleanup. 50% deposit to confirm date.',
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
      accountEmail: 'demo@hustledesk.ke',
      accountPassword: 'demo123',
      onboardingDone: true,
      notes: 'Asante sana for your business. Kindly pay by the due date via M-Pesa or bank transfer.',
      quoteNotes: 'Quotation valid for 14 days. 50% deposit locks your date.',
    },
    clients: [clientA, clientB],
    invoices: [inv1, inv2, inv3],
    quotes: [quote1],
    session: { loggedIn: false },
  };
}

function migrate(raw: unknown): AppData {
  const d = raw as Partial<AppData> & { business?: Partial<BusinessProfile> };
  const base = seedData();
  const business = { ...defaultBusiness(), ...base.business, ...d.business };
  // ensure new fields
  if (!business.quotePrefix) business.quotePrefix = 'QT';
  if (!business.nextQuoteNumber) business.nextQuoteNumber = 1;
  if (business.logoDataUrl === undefined) business.logoDataUrl = '';
  if (!business.quoteNotes) business.quoteNotes = defaultBusiness().quoteNotes;

  const invoices = (d.invoices || base.invoices).map((inv) => ({
    ...inv,
    items: (inv.items || []).map((it) => {
      const row = it as { unit?: string };
      return { ...it, unit: row.unit || 'unit' };
    }),
  }));

  const quotes = (d.quotes || []).map((q) => ({
    ...q,
    items: (q.items || []).map((it) => {
      const row = it as { unit?: string };
      return { ...it, unit: row.unit || 'unit' };
    }),
  }));

  return {
    business,
    clients: d.clients || base.clients,
    invoices,
    quotes: quotes.length ? quotes : base.quotes,
    session: d.session || { loggedIn: false },
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      const seeded = seedData();
      saveData(seeded);
      return seeded;
    }
    const parsed = migrate(JSON.parse(raw));
    saveData(parsed);
    return parsed;
  } catch {
    const seeded = seedData();
    saveData(seeded);
    return seeded;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const seeded = seedData();
  saveData(seeded);
  return seeded;
}

export function clearAllData(): AppData {
  const empty: AppData = {
    business: defaultBusiness(),
    clients: [],
    invoices: [],
    quotes: [],
    session: { loggedIn: false },
  };
  saveData(empty);
  return empty;
}

export function nextInvoiceNumber(business: BusinessProfile): string {
  const n = business.nextInvoiceNumber || 1;
  return `${business.invoicePrefix || 'INV'}-${String(n).padStart(4, '0')}`;
}

export function nextQuoteNumber(business: BusinessProfile): string {
  const n = business.nextQuoteNumber || 1;
  return `${business.quotePrefix || 'QT'}-${String(n).padStart(4, '0')}`;
}
