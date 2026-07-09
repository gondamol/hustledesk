import { Download, Pencil, Printer, MessageCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { downloadInvoicePdf } from '../lib/pdf';
import { StatusBadge } from '../components/StatusBadge';

export function InvoiceView() {
  const { data, nav, go, saveInvoice } = useApp();
  const invoice = data.invoices.find((i) => i.id === nav.invoiceId);
  const client = invoice ? data.clients.find((c) => c.id === invoice.clientId) : undefined;
  const business = data.business;
  const currency = business.currency;

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

  const markPaid = () => {
    saveInvoice(
      {
        ...invoice,
        status: 'paid',
        amountPaid: totals.total,
        updatedAt: new Date().toISOString(),
      },
      false,
    );
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Habari ${client?.name || ''},\n\nPlease find invoice ${invoice.number} for ${formatMoney(totals.total, currency)}.\nDue: ${formatDate(invoice.dueDate)}.\n\n${business.mpesaTill ? `M-Pesa Till: ${business.mpesaTill}\n` : ''}${business.mpesaPaybill ? `Paybill: ${business.mpesaPaybill}\n` : ''}From: ${business.name}\n\n(I will also send the PDF.)`,
    );
    const phone = (client?.phone || '').replace(/[^\d]/g, '');
    const url = phone
      ? `https://wa.me/${phone.startsWith('0') ? `254${phone.slice(1)}` : phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="page-header no-print">
        <div>
          <h1>{invoice.number}</h1>
          <p>
            <StatusBadge status={invoice.status} /> · Balance {formatMoney(balance, currency)}
            {invoice.quoteId ? ' · From quotation' : ''}
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoices')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => go('invoice-edit', invoice.id)}>
            <Pencil size={16} /> Edit
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
          <button type="button" className="btn btn-secondary" onClick={shareWhatsApp}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          {invoice.status !== 'paid' && (
            <button type="button" className="btn btn-primary" onClick={markPaid}>
              Mark paid
            </button>
          )}
        </div>
      </div>

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
              {client?.address ? (
                <>
                  <br />
                  {client.address}
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
                  {business.bankBranch ? ` · ${business.bankBranch}` : ''}
                </>
              )}
              {!business.mpesaTill && !business.mpesaPaybill && !business.bankName && (
                <>Add payment details in Business settings.</>
              )}
            </div>
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
