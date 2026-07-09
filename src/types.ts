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
  /** Shown on public share pages */
  brandColor: string;
  paymentTerms: string;
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

/** Saved products/services for quick insert */
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

export interface AppData {
  business: BusinessProfile;
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  catalog: CatalogItem[];
  expenses: Expense[];
  receipts: Receipt[];
  session: {
    loggedIn: boolean;
  };
}

/** Public share payload (no secrets) — encoded into URL */
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
  | 'settings'
  | 'pricing';
