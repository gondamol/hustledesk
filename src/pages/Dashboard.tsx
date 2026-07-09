import { AlertCircle, Plus, FileText, FileSpreadsheet, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { StatusBadge, QuoteStatusBadge } from '../components/StatusBadge';

export function Dashboard() {
  const { data, stats, go, canCreateInvoice, canCreateQuote } = useApp();
  const currency = data.business.currency;
  const recent = [...data.invoices]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const recentQuotes = [...data.quotes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Karibu, {data.business.owner || data.business.name || 'founder'}. Pipeline + cash in one place.
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={() => go('clients')}>
            <Users size={16} /> Clients
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => go('quote-new')}
            disabled={!canCreateQuote}
          >
            <FileSpreadsheet size={16} /> New quote
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => go('invoice-new')}
            disabled={!canCreateInvoice}
          >
            <Plus size={16} /> New invoice
          </button>
        </div>
      </div>

      {!data.business.logoDataUrl && (
        <div className="alert alert-info">
          Pro tip: upload your <strong>logo</strong> under Business so quotes & invoices look like a real brand —
          clients pay serious-looking businesses faster.
          <button type="button" className="btn btn-sm btn-secondary" style={{ marginLeft: 8 }} onClick={() => go('settings')}>
            Add logo
          </button>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Outstanding (invoices)</div>
          <div className="stat-value">{formatMoney(stats.outstanding, currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Collected this month</div>
          <div className="stat-value success">{formatMoney(stats.paidThisMonth, currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Quote pipeline</div>
          <div className="stat-value">{formatMoney(stats.quotePipeline, currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Profit this month</div>
          <div className={`stat-value ${stats.profitThisMonth >= 0 ? 'success' : 'danger'}`}>
            {formatMoney(stats.profitThisMonth, currency)}
          </div>
        </div>
      </div>
      {stats.overdueCount > 0 && (
        <div className="alert alert-warn">
          You have <strong>{stats.overdueCount}</strong> overdue invoice(s). Open each → <strong>Remind</strong> on
          WhatsApp or send a <strong>Share link</strong>.
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Recent invoices</h3>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => go('invoices')}>
              <FileText size={14} /> All
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="empty">
              <AlertCircle size={24} style={{ opacity: 0.4 }} />
              <p>No invoices yet.</p>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((inv) => {
                    const client = data.clients.find((c) => c.id === inv.clientId);
                    const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
                    return (
                      <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => go('invoice-view', inv.id)}>
                        <td>
                          <strong>{inv.number}</strong>
                        </td>
                        <td>{client?.name || '—'}</td>
                        <td>
                          <StatusBadge status={inv.status} />
                        </td>
                        <td>{formatMoney(total, currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Open quotations</h3>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => go('quotes')}>
              <FileSpreadsheet size={14} /> All
            </button>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="empty">
              <p>No quotes. Send estimates before work starts.</p>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Valid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.map((qt) => {
                    const client = data.clients.find((c) => c.id === qt.clientId);
                    return (
                      <tr key={qt.id} style={{ cursor: 'pointer' }} onClick={() => go('quote-view', qt.id)}>
                        <td>
                          <strong>{qt.number}</strong>
                        </td>
                        <td>{client?.name || '—'}</td>
                        <td>{formatDate(qt.validUntil)}</td>
                        <td>
                          <QuoteStatusBadge status={qt.status} />
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
    </div>
  );
}
