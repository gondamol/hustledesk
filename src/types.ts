export type PaymentStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

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
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  notes: string;
  quoteNotes: string;
  logoDataUrl: string; // base64 data URL
  plan: 'free' | 'pro';
  /** Simple local account — real multi-user cloud auth is Pro SaaS phase 2 */
  accountEmail: string;
  accountPassword: string;
  onboardingDone: boolean;
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
  /** e.g. pcs, hrs, days, kg, job */
  unit: string;
  quantity: number;
  unitPrice: number;
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
  /** If created from a quote */
  quoteId?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  business: BusinessProfile;
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  session: {
    loggedIn: boolean;
  };
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
  | 'settings'
  | 'pricing';
