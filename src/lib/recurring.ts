import type { Invoice, RecurrenceFrequency, RecurringTemplate } from '../types';
import { addDaysISO, todayISO, uid } from './format';
import { nextInvoiceNumber } from './storage';
import type { BusinessProfile } from '../types';

export function advanceDate(iso: string, frequency: RecurrenceFrequency): string {
  const d = new Date(iso + 'T12:00:00');
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

export function frequencyLabel(f: RecurrenceFrequency): string {
  return f === 'weekly' ? 'Weekly' : f === 'monthly' ? 'Monthly' : 'Quarterly';
}

/** Generate all invoices that are due for active templates (up to maxRuns each) */
export function runDueRecurring(
  templates: RecurringTemplate[],
  business: BusinessProfile,
  maxPerTemplate = 3,
): { invoices: Invoice[]; templates: RecurringTemplate[] } {
  const today = todayISO();
  const invoices: Invoice[] = [];
  let nextNum = business.nextInvoiceNumber || 1;
  const updated = templates.map((t) => ({ ...t }));

  for (const t of updated) {
    if (!t.active || !t.clientId) continue;
    let runs = 0;
    while (t.nextRun <= today && runs < maxPerTemplate) {
      const issueDate = t.nextRun;
      const dueDate = addDaysISO(t.dueDays || 7, issueDate);
      const number = `${business.invoicePrefix || 'INV'}-${String(nextNum).padStart(4, '0')}`;
      nextNum += 1;
      invoices.push({
        id: uid('inv'),
        number,
        clientId: t.clientId,
        issueDate,
        dueDate,
        status: 'sent',
        items: t.items.map((it) => ({ ...it, id: uid('li') })),
        taxRate: t.taxRate,
        discount: t.discount,
        notes: `${t.notes || ''}\n\n(Auto-generated from recurring: ${t.name})`.trim(),
        amountPaid: 0,
        payments: [],
        recurringId: t.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      t.lastRunAt = today;
      t.nextRun = advanceDate(t.nextRun, t.frequency);
      runs += 1;
    }
  }

  return { invoices, templates: updated };
}

export function blankRecurring(clientId = ''): RecurringTemplate {
  return {
    id: uid('rec'),
    name: '',
    clientId,
    frequency: 'monthly',
    nextRun: todayISO(),
    dueDays: 7,
    items: [{ id: uid('li'), description: '', unit: 'unit', quantity: 1, unitPrice: 0 }],
    taxRate: 16,
    discount: 0,
    notes: '',
    active: true,
    createdAt: new Date().toISOString(),
  };
}

// silence unused if tree-shaken
void nextInvoiceNumber;
