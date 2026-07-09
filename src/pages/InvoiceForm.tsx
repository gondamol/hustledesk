import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, invoiceTotals } from '../lib/format';
import { LineItemsEditor } from '../components/LineItemsEditor';
import type { Invoice, PaymentStatus } from '../types';

export function InvoiceForm({ mode }: { mode: 'new' | 'edit' }) {
  const { data, nav, go, createBlankInvoice, saveInvoice, canCreateInvoice } = useApp();
  const currency = data.business.currency;

  const existing = useMemo(() => {
    if (mode !== 'edit' || !nav.invoiceId) return null;
    return data.invoices.find((i) => i.id === nav.invoiceId) || null;
  }, [mode, nav.invoiceId, data.invoices]);

  const [invoice, setInvoice] = useState<Invoice>(() =>
    mode === 'edit' && existing ? existing : createBlankInvoice(),
  );

  useEffect(() => {
    if (mode === 'edit' && existing) setInvoice(existing);
    if (mode === 'new') setInvoice(createBlankInvoice());
  }, [mode, existing, createBlankInvoice]);

  useEffect(() => {
    if (mode === 'new' && !canCreateInvoice) go('pricing');
  }, [mode, canCreateInvoice, go]);

  const totals = invoiceTotals(invoice.items, invoice.taxRate, invoice.discount);

  const onSave = () => {
    if (!invoice.clientId) {
      alert('Select a client (or add one under Clients first).');
      return;
    }
    if (invoice.items.every((i) => !i.description.trim())) {
      alert('Add at least one line item description.');
      return;
    }
    const cleaned: Invoice = {
      ...invoice,
      items: invoice.items.filter((i) => i.description.trim()),
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(cleaned, mode === 'new');
    go('invoice-view', cleaned.id);
  };

  if (mode === 'edit' && !existing) {
    return (
      <div className="empty">
        Invoice not found.
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoices')}>
            Back to invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{mode === 'new' ? 'New invoice' : `Edit ${invoice.number}`}</h1>
          <p>Itemized bill: description, unit, quantity, and price for each line.</p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoices')}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave}>
            <Save size={16} /> Save invoice
          </button>
        </div>
      </div>

      {data.clients.length === 0 && (
        <div className="alert alert-warn">
          You have no clients yet.{' '}
          <button type="button" className="btn btn-sm btn-primary" onClick={() => go('clients')}>
            Add a client
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-grid three">
          <div className="field">
            <label>Invoice number</label>
            <input value={invoice.number} onChange={(e) => setInvoice({ ...invoice, number: e.target.value })} />
          </div>
          <div className="field">
            <label>Client</label>
            <select
              value={invoice.clientId}
              onChange={(e) => setInvoice({ ...invoice, clientId: e.target.value })}
            >
              <option value="">Select client…</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={invoice.status}
              onChange={(e) => setInvoice({ ...invoice, status: e.target.value as PaymentStatus })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="field">
            <label>Issue date</label>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Due date</label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Amount already paid ({currency})</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={invoice.amountPaid}
              onChange={(e) => setInvoice({ ...invoice, amountPaid: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <LineItemsEditor
          items={invoice.items}
          currency={currency}
          onChange={(items) => setInvoice({ ...invoice, items })}
        />
        <div className="form-grid" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label>VAT / tax rate (%)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={invoice.taxRate}
              onChange={(e) => setInvoice({ ...invoice, taxRate: Number(e.target.value) || 0 })}
            />
            <span className="help">Kenya VAT is typically 16%. Use 0 if tax-exempt.</span>
          </div>
          <div className="field">
            <label>Discount ({currency})</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={invoice.discount}
              onChange={(e) => setInvoice({ ...invoice, discount: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field full">
            <label>Notes (shown on invoice)</label>
            <textarea
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
              placeholder="Payment instructions, project ref, thank you…"
            />
          </div>
        </div>

        <div className="totals-box" style={{ marginTop: '1rem' }}>
          <div className="totals-row">
            <span>Subtotal</span>
            <span>{formatMoney(totals.subtotal, currency)}</span>
          </div>
          <div className="totals-row">
            <span>Discount</span>
            <span>-{formatMoney(totals.discount, currency)}</span>
          </div>
          <div className="totals-row">
            <span>Tax</span>
            <span>{formatMoney(totals.tax, currency)}</span>
          </div>
          <div className="totals-row strong">
            <span>Total</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
          <div className="totals-row">
            <span>Paid</span>
            <span>{formatMoney(invoice.amountPaid || 0, currency)}</span>
          </div>
          <div className="totals-row strong">
            <span>Balance</span>
            <span>{formatMoney(Math.max(0, totals.total - (invoice.amountPaid || 0)), currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
