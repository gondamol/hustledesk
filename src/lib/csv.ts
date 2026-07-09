import type { Client, Expense, Invoice, Quote } from '../types';
import { invoiceTotals } from './format';

function escapeCell(v: string | number): string {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) lines.push(row.map(escapeCell).join(','));
  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function invoicesToCsv(
  invoices: Invoice[],
  clients: Client[],
  currency: string,
): string {
  const headers = [
    'Number',
    'Client',
    'Status',
    'Issue Date',
    'Due Date',
    'Subtotal',
    'Tax',
    'Discount',
    'Total',
    'Amount Paid',
    'Balance',
    'Currency',
  ];
  const rows = invoices.map((inv) => {
    const client = clients.find((c) => c.id === inv.clientId);
    const t = invoiceTotals(inv.items, inv.taxRate, inv.discount);
    const paid = inv.amountPaid || 0;
    return [
      inv.number,
      client?.name || '',
      inv.status,
      inv.issueDate,
      inv.dueDate,
      t.subtotal.toFixed(2),
      t.tax.toFixed(2),
      t.discount.toFixed(2),
      t.total.toFixed(2),
      paid.toFixed(2),
      Math.max(0, t.total - paid).toFixed(2),
      currency,
    ];
  });
  return toCsv(headers, rows);
}

export function quotesToCsv(quotes: Quote[], clients: Client[], currency: string): string {
  const headers = [
    'Number',
    'Client',
    'Status',
    'Issue Date',
    'Valid Until',
    'Subtotal',
    'Tax',
    'Total',
    'Currency',
  ];
  const rows = quotes.map((q) => {
    const client = clients.find((c) => c.id === q.clientId);
    const t = invoiceTotals(q.items, q.taxRate, q.discount);
    return [
      q.number,
      client?.name || '',
      q.status,
      q.issueDate,
      q.validUntil,
      t.subtotal.toFixed(2),
      t.tax.toFixed(2),
      t.total.toFixed(2),
      currency,
    ];
  });
  return toCsv(headers, rows);
}

export function clientsToCsv(clients: Client[]): string {
  const headers = ['Name', 'Company', 'Phone', 'Email', 'Address', 'Notes', 'Created'];
  const rows = clients.map((c) => [
    c.name,
    c.company,
    c.phone,
    c.email,
    c.address,
    c.notes,
    c.createdAt.slice(0, 10),
  ]);
  return toCsv(headers, rows);
}

export function expensesToCsv(expenses: Expense[], currency: string): string {
  const headers = ['Date', 'Category', 'Description', 'Vendor', 'Method', 'Amount', 'Currency'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.description,
    e.vendor,
    e.paymentMethod,
    e.amount.toFixed(2),
    currency,
  ]);
  return toCsv(headers, rows);
}
