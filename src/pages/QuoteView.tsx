import { useState } from 'react';
import { Download, Pencil, Printer, MessageCircle, ArrowLeft, FileText, Link2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { downloadQuotePdf } from '../lib/pdf';
import { QuoteStatusBadge } from '../components/StatusBadge';
import { buildSharePayload, copyToClipboard, encodeShare, shareUrl } from '../lib/share';

export function QuoteView() {
  const { data, nav, go, convertQuoteToInvoice, canCreateInvoice } = useApp();
  const quote = data.quotes.find((q) => q.id === nav.quoteId);
  const client = quote ? data.clients.find((c) => c.id === quote.clientId) : undefined;
  const business = data.business;
  const currency = business.currency;
  const [shareMsg, setShareMsg] = useState('');

  if (!quote) {
    return (
      <div className="empty">
        Quotation not found.
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('quotes')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const totals = invoiceTotals(quote.items, quote.taxRate, quote.discount);

  const toInvoice = () => {
    if (quote.status === 'converted' && quote.convertedInvoiceId) {
      go('invoice-view', quote.convertedInvoiceId);
      return;
    }
    if (!canCreateInvoice) {
      alert('Free invoice limit reached. Upgrade to Pro.');
      go('pricing');
      return;
    }
    const inv = convertQuoteToInvoice(quote.id);
    if (inv) go('invoice-view', inv.id);
  };

  const shareLink = async () => {
    const token = encodeShare(buildSharePayload('quote', business, client, { quote }));
    const url = shareUrl(token);
    await copyToClipboard(url);
    setShareMsg(url);
    alert('Quotation share link copied!');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Habari ${client?.name || ''},\n\nPlease find quotation ${quote.number} for ${formatMoney(totals.total, currency)}.\nValid until: ${formatDate(quote.validUntil)}.\n\nFrom: ${business.name}\n(I will also send the PDF / share link.)`,
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
          <h1>{quote.number}</h1>
          <p>
            <QuoteStatusBadge status={quote.status} /> · {formatMoney(totals.total, currency)}
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('quotes')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => go('quote-edit', quote.id)}>
            <Pencil size={16} /> Edit
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => downloadQuotePdf(quote, client, business)}>
            <Download size={16} /> PDF
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button type="button" className="btn btn-secondary" onClick={shareLink}>
            <Link2 size={16} /> Share link
          </button>
          <button type="button" className="btn btn-secondary" onClick={shareWhatsApp}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          {quote.status !== 'converted' && (
            <button type="button" className="btn btn-primary" onClick={toInvoice}>
              <FileText size={16} /> Convert to invoice
            </button>
          )}
          {quote.status === 'converted' && quote.convertedInvoiceId && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => go('invoice-view', quote.convertedInvoiceId)}
            >
              Open invoice
            </button>
          )}
        </div>
      </div>

      {shareMsg && (
        <div className="alert alert-info no-print">
          Share link:
          <div style={{ wordBreak: 'break-all', fontSize: '0.85rem', marginTop: 6 }}>{shareMsg}</div>
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
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>QUOTATION</div>
            <div>
              <strong>{quote.number}</strong>
            </div>
            <div className="muted">Issued {formatDate(quote.issueDate)}</div>
            <div className="muted">Valid until {formatDate(quote.validUntil)}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Prepared for
          </div>
          <strong>{client?.name || 'Client'}</strong>
          <div className="muted">
            {client?.company}
            {client?.phone ? ` · ${client.phone}` : ''}
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
              {quote.items.map((item) => (
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
            <span>VAT ({quote.taxRate}%)</span>
            <span>{formatMoney(totals.tax, currency)}</span>
          </div>
          <div className="totals-row strong">
            <span>Total</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
        </div>

        {(quote.notes || business.quoteNotes) && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Notes
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{quote.notes || business.quoteNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
