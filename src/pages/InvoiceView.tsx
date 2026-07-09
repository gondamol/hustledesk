import { useState } from 'react';
import {
  Download,
  Pencil,
  Printer,
  MessageCircle,
  ArrowLeft,
  Link2,
  Copy,
  Bell,
  Banknote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { daysOverdue, formatDate, formatMoney, invoiceTotals, todayISO } from '../lib/format';
import { downloadInvoicePdf } from '../lib/pdf';
import { StatusBadge } from '../components/StatusBadge';
import { buildSharePayload, copyToClipboard, encodeShare, shareUrl } from '../lib/share';

export function InvoiceView() {
  const { data, nav, go, recordPayment, duplicateInvoice, canCreateInvoice } = useApp();
  const invoice = data.invoices.find((i) => i.id === nav.invoiceId);
  const client = invoice ? data.clients.find((c) => c.id === invoice.clientId) : undefined;
  const business = data.business;
  const currency = business.currency;

  const [payOpen, setPayOpen] = useState(false);
  const [pay, setPay] = useState({
    amount: 0,
    date: todayISO(),
    method: 'M-Pesa',
    reference: '',
    note: '',
    receipt: true,
  });
  const [shareMsg, setShareMsg] = useState('');

  if (!invoice) {
    return (
      <div className="empty">
        Invoice not found.
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoices')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const totals = invoiceTotals(invoice.items, invoice.taxRate, invoice.discount);
  const balance = Math.max(0, totals.total - (invoice.amountPaid || 0));
  const overdueDays = invoice.status !== 'paid' ? daysOverdue(invoice.dueDate) : 0;

  const markPaid = () => {
    recordPayment(
      invoice.id,
      {
        amount: balance,
        date: todayISO(),
        method: 'M-Pesa',
        reference: '',
        note: 'Marked paid in full',
      },
      true,
    );
  };

  const submitPayment = () => {
    if (pay.amount <= 0) return alert('Enter payment amount');
    recordPayment(
      invoice.id,
      {
        amount: pay.amount,
        date: pay.date,
        method: pay.method,
        reference: pay.reference,
        note: pay.note,
      },
      pay.receipt,
    );
    setPayOpen(false);
    setPay({ amount: 0, date: todayISO(), method: 'M-Pesa', reference: '', note: '', receipt: true });
  };

  const shareLink = async () => {
    const token = encodeShare(
      buildSharePayload('invoice', business, client, { invoice }),
    );
    const url = shareUrl(token);
    await copyToClipboard(url);
    setShareMsg(url);
    alert('Shareable link copied to clipboard!\n\nAnyone with the link can view this invoice (no login).');
  };

  const shareWhatsApp = (reminder = false) => {
    const extra = reminder
      ? `\n\nFriendly reminder: this invoice is ${overdueDays > 0 ? `${overdueDays} day(s) overdue` : 'due soon'}. Kindly settle via M-Pesa when you can.`
      : '';
    const text = encodeURIComponent(
      `Habari ${client?.name || ''},\n\nPlease find invoice ${invoice.number} for ${formatMoney(totals.total, currency)}.\nDue: ${formatDate(invoice.dueDate)}.\nBalance: ${formatMoney(balance, currency)}.\n\n${business.mpesaTill ? `M-Pesa Till: ${business.mpesaTill}\n` : ''}${business.mpesaPaybill ? `Paybill: ${business.mpesaPaybill}\n` : ''}From: ${business.name}${extra}\n\n(I can also send a share link / PDF.)`,
    );
    const phone = (client?.phone || '').replace(/[^\d]/g, '');
    const url = phone
      ? `https://wa.me/${phone.startsWith('0') ? `254${phone.slice(1)}` : phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const onDuplicate = () => {
    if (!canCreateInvoice) {
      go('pricing');
      return;
    }
    const copy = duplicateInvoice(invoice.id);
    if (copy) go('invoice-edit', copy.id);
  };

  return (
    <div>
      <div className="page-header no-print">
        <div>
          <h1>{invoice.number}</h1>
          <p>
            <StatusBadge status={invoice.status} /> · Balance {formatMoney(balance, currency)}
            {overdueDays > 0 && invoice.status !== 'paid' ? (
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                {' '}
                · {overdueDays}d overdue
              </span>
            ) : null}
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoices')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoice-edit', invoice.id)}>
            <Pencil size={16} /> Edit
          </button>
          <button type="button" className="btn btn-secondary" onClick={onDuplicate}>
            <Copy size={16} /> Duplicate
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => downloadInvoicePdf(invoice, client, business)}
          >
            <Download size={16} /> PDF
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button type="button" className="btn btn-secondary" onClick={shareLink}>
            <Link2 size={16} /> Share link
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => shareWhatsApp(false)}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          {invoice.status !== 'paid' && (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => shareWhatsApp(true)}>
                <Bell size={16} /> Remind
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPay({ ...pay, amount: balance });
                  setPayOpen(true);
                }}
              >
                <Banknote size={16} /> Record payment
              </button>
              <button type="button" className="btn btn-primary" onClick={markPaid}>
                Mark paid
              </button>
            </>
          )}
        </div>
      </div>

      {shareMsg && (
        <div className="alert alert-info no-print">
          Share link ready (also in clipboard):
          <div style={{ wordBreak: 'break-all', fontSize: '0.85rem', marginTop: 6 }}>{shareMsg}</div>
        </div>
      )}

      {payOpen && (
        <div className="card no-print" style={{ marginBottom: '1rem' }}>
          <h3>Record payment</h3>
          <div className="form-grid three" style={{ marginTop: '0.75rem' }}>
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                value={pay.amount}
                onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={pay.date}
                onChange={(e) => setPay({ ...pay, date: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Method</label>
              <input value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} />
            </div>
            <div className="field">
              <label>M-Pesa / bank reference</label>
              <input
                value={pay.reference}
                onChange={(e) => setPay({ ...pay, reference: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Note</label>
              <input value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
            </div>
            <div className="field" style={{ justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <input
                  type="checkbox"
                  checked={pay.receipt}
                  onChange={(e) => setPay({ ...pay, receipt: e.target.checked })}
                />
                Issue receipt
              </label>
            </div>
          </div>
          <div className="toolbar" style={{ marginBottom: 0, marginTop: '0.75rem' }}>
            <button type="button" className="btn btn-primary" onClick={submitPayment}>
              Save payment
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setPayOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="invoice-sheet">
        <div className="invoice-sheet-head">
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            {business.logoDataUrl && (
              <img
                src={business.logoDataUrl}
                alt="Logo"
                style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8 }}
              />
            )}
            <div>
              <h2 style={{ color: 'var(--brand)' }}>{business.name}</h2>
              <div className="muted" style={{ fontSize: '0.92rem' }}>
                {[business.address, business.city].filter(Boolean).join(', ')}
                <br />
                {business.phone}
                {business.email ? ` · ${business.email}` : ''}
                <br />
                {business.kraPin ? `KRA PIN: ${business.kraPin}` : ''}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>INVOICE</div>
            <div>
              <strong>{invoice.number}</strong>
            </div>
            <div className="muted">Issued {formatDate(invoice.issueDate)}</div>
            <div className="muted">Due {formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
          <div>
            <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Bill to
            </div>
            <strong>{client?.name || 'Client'}</strong>
            <div className="muted">
              {client?.company && (
                <>
                  {client.company}
                  <br />
                </>
              )}
              {client?.phone}
              {client?.email ? (
                <>
                  <br />
                  {client.email}
                </>
              ) : null}
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Payment details
            </div>
            <div className="muted">
              {business.mpesaTill && (
                <>
                  M-Pesa Till: <strong>{business.mpesaTill}</strong>
                  <br />
                </>
              )}
              {business.mpesaPaybill && (
                <>
                  Paybill: <strong>{business.mpesaPaybill}</strong>
                  {business.mpesaAccount ? ` · Acc ${business.mpesaAccount}` : ''}
                  <br />
                </>
              )}
              {business.bankName && (
                <>
                  {business.bankName}
                  {business.bankAccount ? ` · ${business.bankAccount}` : ''}
                </>
              )}
            </div>
            {business.paymentTerms && (
              <p className="help" style={{ marginTop: 8 }}>
                {business.paymentTerms}
              </p>
            )}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Description</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.unit || 'unit'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unitPrice, currency)}</td>
                  <td>{formatMoney(item.quantity * item.unitPrice, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <span>VAT ({invoice.taxRate}%)</span>
            <span>{formatMoney(totals.tax, currency)}</span>
          </div>
          <div className="totals-row strong">
            <span>Total</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
          <div className="totals-row">
            <span>Amount paid</span>
            <span>{formatMoney(invoice.amountPaid || 0, currency)}</span>
          </div>
          <div className="totals-row strong">
            <span>Balance due</span>
            <span>{formatMoney(balance, currency)}</span>
          </div>
        </div>

        {(invoice.payments || []).length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Payment history
            </div>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.date)}</td>
                      <td>{p.method}</td>
                      <td>{p.reference || p.note || '—'}</td>
                      <td>{formatMoney(p.amount, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(invoice.notes || business.notes) && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Notes
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{invoice.notes || business.notes}</p>
          </div>
        )}

        {business.plan === 'free' && (
          <p className="muted" style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
            Generated with HustleDesk · Upgrade to Pro to remove footer branding
          </p>
        )}
      </div>
    </div>
  );
}
