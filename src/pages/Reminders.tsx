import { Bell, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { daysOverdue, formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { clientReminderText, normalizeWa } from '../lib/sales';
import { StatusBadge } from '../components/StatusBadge';

export function Reminders() {
  const { data, go, logReminder } = useApp();
  const currency = data.business.currency;

  const overdue = data.invoices
    .filter((inv) => inv.status !== 'paid' && inv.status !== 'draft')
    .map((inv) => {
      const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
      const balance = Math.max(0, total - (inv.amountPaid || 0));
      const days = daysOverdue(inv.dueDate);
      return { inv, balance, days, total };
    })
    .filter((x) => x.balance > 0 && x.days >= 0)
    .sort((a, b) => b.days - a.days);

  const remind = (invoiceId: string) => {
    const inv = data.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const client = data.clients.find((c) => c.id === inv.clientId);
    const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
    const balance = Math.max(0, total - (inv.amountPaid || 0));
    const text = clientReminderText({
      clientName: client?.name || 'Client',
      invoiceNumber: inv.number,
      balance: formatMoney(balance, currency),
      dueDate: formatDate(inv.dueDate),
      businessName: data.business.name,
      mpesaTill: data.business.mpesaTill,
      mpesaPaybill: data.business.mpesaPaybill,
      overdueDays: daysOverdue(inv.dueDate),
    });
    logReminder({ invoiceId: inv.id, channel: 'whatsapp', message: text });
    const phone = normalizeWa(client?.phone || '');
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const logs = [...(data.reminders || [])].slice(0, 20);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payment reminders</h1>
          <p>
            Chase overdue and due invoices via WhatsApp. Each send is logged so you know who you
            followed up with.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Needs attention</div>
          <div className={`stat-value ${overdue.length ? 'danger' : ''}`}>{overdue.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Reminders sent (log)</div>
          <div className="stat-value">{(data.reminders || []).length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Outstanding total</div>
          <div className="stat-value">
            {formatMoney(
              overdue.reduce((s, x) => s + x.balance, 0),
              currency,
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>
          <Bell size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Due & overdue invoices
        </h3>
        <div className="table-wrap" style={{ border: 'none', marginTop: '0.75rem' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Due</th>
                <th>Days</th>
                <th>Balance</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {overdue.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">Nothing to chase — all clear.</div>
                  </td>
                </tr>
              ) : (
                overdue.map(({ inv, balance, days }) => {
                  const client = data.clients.find((c) => c.id === inv.clientId);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => go('invoice-view', inv.id)}
                        >
                          <strong>{inv.number}</strong>
                        </button>
                      </td>
                      <td>{client?.name || '—'}</td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td>
                        <span className={days > 0 ? 'stat-value danger' : ''} style={{ fontSize: '1rem' }}>
                          {days > 0 ? `${days}d late` : 'due today'}
                        </span>
                      </td>
                      <td>{formatMoney(balance, currency)}</td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                      <td>
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => remind(inv.id)}>
                          <MessageCircle size={14} /> WhatsApp remind
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Recent reminder log</h3>
        {logs.length === 0 ? (
          <p className="muted">No reminders logged yet.</p>
        ) : (
          <div className="table-wrap" style={{ border: 'none', marginTop: '0.5rem' }}>
            <table className="data">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Invoice</th>
                  <th>Channel</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((r) => {
                  const inv = data.invoices.find((i) => i.id === r.invoiceId);
                  return (
                    <tr key={r.id}>
                      <td>{formatDate(r.sentAt.slice(0, 10))}</td>
                      <td>{inv?.number || r.invoiceId}</td>
                      <td>{r.channel}</td>
                      <td className="muted" style={{ maxWidth: 280, fontSize: '0.85rem' }}>
                        {r.message.slice(0, 80)}…
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
