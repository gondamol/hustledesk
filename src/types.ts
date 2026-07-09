export type PaymentStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type ExpenseCategory =
  | 'supplies'
  | 'rent'
  | 'transport'
  | 'salaries'
  | 'marketing'
  | 'utilities'
  | 'tax'
  | 'other';
export type RecurrenceFrequency = 'weekly' | 'monthly' | 'quarterly';
export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';

export interface BusinessProfile {
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  kraPin: string;
  mpesaTill: string;
  mpesaPaybill: string;
  mpesaAccount: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  currency: 'KES' | 'USD' | 'EUR';
  invoicePrefix: string;
  quotePrefix: string;
  receiptPrefix: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  nextReceiptNumber: number;
  notes: string;
  quoteNotes: string;
  logoDataUrl: string;
  plan: 'free' | 'pro';
  accountEmail: string;
  accountPassword: string;
  onboardingDone: boolean;
  brandColor: string;
  paymentTerms: string;
  /** Sales WhatsApp for landing CTAs (owner/agent) */
  salesWhatsApp: string;
  /** Accountant / multi-client mode */
  isAccountant: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  taxRate: number;
  category: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  note: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: PaymentStatus;
  items: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  amountPaid: number;
  payments: PaymentRecord[];
  quoteId?: string;
  shareId?: string;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  items: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  convertedInvoiceId?: string;
  shareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor: string;
  paymentMethod: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  number: string;
  invoiceId: string;
  clientId: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  createdAt: string;
}

export interface RecurringTemplate {
  id: string;
  name: string;
  clientId: string;
  frequency: RecurrenceFrequency;
  nextRun: string;
  dueDays: number;
  items: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  active: boolean;
  lastRunAt?: string;
  createdAt: string;
}

export interface ReminderLog {
  id: string;
  invoiceId: string;
  sentAt: string;
  channel: 'whatsapp' | 'note';
  message: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessType: string;
  message: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

/** Full business file for accountant multi-client switcher */
export interface WorkspaceSnapshot {
  id: string;
  name: string;
  business: BusinessProfile;
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  catalog: CatalogItem[];
  expenses: Expense[];
  receipts: Receipt[];
  recurring: RecurringTemplate[];
  reminders: ReminderLog[];
  updatedAt: string;
}

export interface AppData {
  business: BusinessProfile;
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  catalog: CatalogItem[];
  expenses: Expense[];
  receipts: Receipt[];
  recurring: RecurringTemplate[];
  reminders: ReminderLog[];
  workspaces: WorkspaceSnapshot[];
  activeWorkspaceId: string;
  leads: Lead[];
  session: {
    loggedIn: boolean;
  };
}

export interface SharePayload {
  v: 1;
  kind: 'invoice' | 'quote' | 'receipt';
  business: Pick<
    BusinessProfile,
    | 'name'
    | 'email'
    | 'phone'
    | 'address'
    | 'city'
    | 'kraPin'
    | 'mpesaTill'
    | 'mpesaPaybill'
    | 'mpesaAccount'
    | 'bankName'
    | 'bankAccount'
    | 'bankBranch'
    | 'currency'
    | 'logoDataUrl'
    | 'brandColor'
    | 'paymentTerms'
    | 'plan'
  >;
  client?: Pick<Client, 'name' | 'company' | 'email' | 'phone' | 'address'>;
  invoice?: Invoice;
  quote?: Quote;
  receipt?: Receipt;
  createdAt: string;
}

export type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'clients'
  | 'invoices'
  | 'invoice-new'
  | 'invoice-edit'
  | 'invoice-view'
  | 'quotes'
  | 'quote-new'
  | 'quote-edit'
  | 'quote-view'
  | 'catalog'
  | 'expenses'
  | 'receipts'
  | 'reports'
  | 'recurring'
  | 'reminders'
  | 'leads'
  | 'workspaces'
  | 'settings'
  | 'pricing';
