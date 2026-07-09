import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, invoiceTotals } from '../lib/format';
import { LineItemsEditor } from '../components/LineItemsEditor';
import type { Quote, QuoteStatus } from '../types';

export function QuoteForm({ mode }: { mode: 'new' | 'edit' }) {
  const { data, nav, go, createBlankQuote, saveQuote, canCreateQuote } = useApp();
  const currency = data.business.currency;

  const existing = useMemo(() => {
    if (mode !== 'edit' || !nav.quoteId) return null;
    return data.quotes.find((q) => q.id === nav.quoteId) || null;
  }, [mode, nav.quoteId, data.quotes]);

  const [quote, setQuote] = useState<Quote>(() =>
    mode === 'edit' && existing ? existing : createBlankQuote(),
  );

  useEffect(() => {
    if (mode === 'edit' && existing) setQuote(existing);
    if (mode === 'new') setQuote(createBlankQuote());
  }, [mode, existing, createBlankQuote]);

  useEffect(() => {
    if (mode === 'new' && !canCreateQuote) go('pricing');
  }, [mode, canCreateQuote, go]);

  const totals = invoiceTotals(quote.items, quote.taxRate, quote.discount);

  const onSave = () => {
    if (!quote.clientId) {
      alert('Select a client first.');
      return;
    }
    if (quote.items.every((i) => !i.description.trim())) {
      alert('Add at least one line item.');
      return;
    }
    const cleaned: Quote = {
      ...quote,
      items: quote.items.filter((i) => i.description.trim()),
      updatedAt: new Date().toISOString(),
    };
    saveQuote(cleaned, mode === 'new');
    go('quote-view', cleaned.id);
  };

  if (mode === 'edit' && !existing) {
    return (
      <div className="empty">
        Quote not found.
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('quotes')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{mode === 'new' ? 'New quotation' : `Edit ${quote.number}`}</h1>
          <p>Itemized estimate clients can approve — then one click to invoice.</p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('quotes')}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave}>
            <Save size={16} /> Save quotation
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-grid three">
          <div className="field">
            <label>Quote number</label>
            <input value={quote.number} onChange={(e) => setQuote({ ...quote, number: e.target.value })} />
          </div>
          <div className="field">
            <label>Client</label>
            <select
              value={quote.clientId}
              onChange={(e) => setQuote({ ...quote, clientId: e.target.value })}
            >
              <option value="">Select client…</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={quote.status}
              onChange={(e) => setQuote({ ...quote, status: e.target.value as QuoteStatus })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="converted">Converted</option>
            </select>
          </div>
          <div className="field">
            <label>Issue date</label>
            <input
              type="date"
              value={quote.issueDate}
              onChange={(e) => setQuote({ ...quote, issueDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Valid until</label>
            <input
              type="date"
              value={quote.validUntil}
              onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <LineItemsEditor
          items={quote.items}
          currency={currency}
          onChange={(items) => setQuote({ ...quote, items })}
        />
        <div className="form-grid" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label>VAT / tax (%)</label>
            <input
              type="number"
              min={0}
              value={quote.taxRate}
              onChange={(e) => setQuote({ ...quote, taxRate: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field">
            <label>Discount ({currency})</label>
            <input
              type="number"
              min={0}
              value={quote.discount}
              onChange={(e) => setQuote({ ...quote, discount: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field full">
            <label>Notes</label>
            <textarea
              value={quote.notes}
              onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
              placeholder="Validity, deposit %, exclusions…"
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
            <span>Quote total</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
