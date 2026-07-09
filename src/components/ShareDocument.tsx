import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { downloadInvoicePdf, downloadQuotePdf } from '../lib/pdf';
import type { BusinessProfile, Client, Invoice, Quote, SharePayload } from '../types';

export function ShareDocument({ payload }: { payload: SharePayload }) {
  const brand = payload.business.brandColor || '#0f766e';
  const currency = payload.business.currency || 'KES';
  const business = payload.business as unknown as BusinessProfile;
  const client = payload.client as Client | undefined;

  if (payload.kind === 'invoice' && payload.invoice) {
    const inv = payload.invoice;
    const totals = invoiceTotals(inv.items, inv.taxRate, inv.discount);
    const balance = Math.max(0, totals.total - (inv.amountPaid || 0));
    return (
      <PublicShell brand={brand} businessName={payload.business.name}>
        <DocHeader
          brand={brand}
          title="INVOICE"
          number={inv.number}
          logo={payload.business.logoDataUrl}
          business={payload.business}
          meta={[
            `Issued ${formatDate(inv.issueDate)}`,
            `Due ${formatDate(inv.dueDate)}`,
            `Status: ${inv.status.toUpperCase()}`,
          ]}
        />
        <BillTo client={payload.client} />
        <ItemsTable items={inv.items} currency={currency} />
        <Totals
          currency={currency}
          rows={[
            ['Subtotal', totals.subtotal],
            ['Discount', -totals.discount],
            [`VAT (${inv.taxRate}%)`, totals.tax],
            ['Total', totals.total],
            ['Paid', inv.amountPaid || 0],
            ['Balance due', balance],
          ]}
        />
        <PayBox business={payload.business} terms={payload.business.paymentTerms} />
        {inv.notes && <Notes text={inv.notes} />}
        <div className="toolbar no-print" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => downloadInvoicePdf(inv as Invoice, client, business)}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </PublicShell>
    );
  }

  if (payload.kind === 'quote' && payload.quote) {
    const q = payload.quote;
    const totals = invoiceTotals(q.items, q.taxRate, q.discount);
    return (
      <PublicShell brand={brand} businessName={payload.business.name}>
        <DocHeader
          brand={brand}
          title="QUOTATION"
          number={q.number}
          logo={payload.business.logoDataUrl}
          business={payload.business}
          meta={[
            `Issued ${formatDate(q.issueDate)}`,
            `Valid until ${formatDate(q.validUntil)}`,
            `Status: ${q.status.toUpperCase()}`,
          ]}
        />
        <BillTo client={payload.client} label="Prepared for" />
        <ItemsTable items={q.items} currency={currency} />
        <Totals
          currency={currency}
          rows={[
            ['Subtotal', totals.subtotal],
            ['Discount', -totals.discount],
            [`VAT (${q.taxRate}%)`, totals.tax],
            ['Quote total', totals.total],
          ]}
        />
        {q.notes && <Notes text={q.notes} />}
        <div className="toolbar no-print" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => downloadQuotePdf(q as Quote, client, business)}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </PublicShell>
    );
  }

  if (payload.kind === 'receipt' && payload.receipt) {
    const r = payload.receipt;
    return (
      <PublicShell brand={brand} businessName={payload.business.name}>
        <DocHeader
          brand={brand}
          title="RECEIPT"
          number={r.number}
          logo={payload.business.logoDataUrl}
          business={payload.business}
          meta={[`Date ${formatDate(r.date)}`, `Method ${r.method}`]}
        />
        <BillTo client={payload.client} label="Received from" />
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="totals-row strong">
            <span>Amount received</span>
            <span>{formatMoney(r.amount, currency)}</span>
          </div>
          {r.reference && (
            <div className="totals-row">
              <span>Reference</span>
              <span>{r.reference}</span>
            </div>
          )}
        </div>
      </PublicShell>
    );
  }

  return (
    <div className="empty">
      Unsupported document type. <Link to="/">Home</Link>
    </div>
  );
}

function PublicShell({
  children,
  brand,
  businessName,
}: {
  children: React.ReactNode;
  brand: string;
  businessName: string;
}) {
  return (
    <div className="landing" style={{ minHeight: '100vh' }}>
      <header className="topbar" style={{ borderBottom: `3px solid ${brand}`, background: 'white' }}>
        <div className="brand" style={{ cursor: 'default' }}>
          <span className="brand-mark" style={{ background: brand }}>
            {(businessName || 'H')[0]}
          </span>
          {businessName || 'Document'}
        </div>
        <span className="pill">Shared via HustleDesk</span>
      </header>
      <div className="section" style={{ maxWidth: 800 }}>
        <div className="invoice-sheet">{children}</div>
        <p className="footer" style={{ border: 'none' }}>
          Create your own branded quotes & invoices free → <a href="/">hustledesk</a>
        </p>
      </div>
    </div>
  );
}

function DocHeader({
  brand,
  title,
  number,
  logo,
  business,
  meta,
}: {
  brand: string;
  title: string;
  number: string;
  logo?: string;
  business: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    kraPin: string;
  };
  meta: string[];
}) {
  return (
    <div className="invoice-sheet-head" style={{ borderColor: brand }}>
      <div style={{ display: 'flex', gap: '0.85rem' }}>
        {logo && <img src={logo} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />}
        <div>
          <h2 style={{ color: brand }}>{business.name}</h2>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
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
        <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{title}</div>
        <strong>{number}</strong>
        {meta.map((m) => (
          <div key={m} className="muted">
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function BillTo({
  client,
  label = 'Bill to',
}: {
  client?: { name: string; company?: string; phone?: string; email?: string };
  label?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </div>
      <strong>{client?.name || 'Client'}</strong>
      <div className="muted">
        {client?.company}
        {client?.phone ? ` · ${client.phone}` : ''}
        {client?.email ? ` · ${client.email}` : ''}
      </div>
    </div>
  );
}

function ItemsTable({
  items,
  currency,
}: {
  items: { id: string; description: string; unit: string; quantity: number; unitPrice: number }[];
  currency: string;
}) {
  return (
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
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.unit}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item.unitPrice, currency)}</td>
              <td>{formatMoney(item.quantity * item.unitPrice, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Totals({ rows, currency }: { rows: [string, number][]; currency: string }) {
  return (
    <div className="totals-box" style={{ marginTop: '1rem' }}>
      {rows.map(([label, value], i) => (
        <div key={label} className={`totals-row ${i >= rows.length - 2 ? 'strong' : ''}`}>
          <span>{label}</span>
          <span>{formatMoney(value, currency)}</span>
        </div>
      ))}
    </div>
  );
}

function PayBox({
  business,
  terms,
}: {
  business: {
    mpesaTill: string;
    mpesaPaybill: string;
    mpesaAccount: string;
    bankName: string;
    bankAccount: string;
    bankBranch: string;
  };
  terms?: string;
}) {
  return (
    <div style={{ marginTop: '1.25rem' }}>
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
      </div>
      {terms && (
        <p className="help" style={{ marginTop: 8 }}>
          {terms}
        </p>
      )}
    </div>
  );
}

function Notes({ text }: { text: string }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
        Notes
      </div>
      <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
    </div>
  );
}
