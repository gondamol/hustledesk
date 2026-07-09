import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, invoiceTotals, todayISO } from '../lib/format';
import {
  clientsToCsv,
  downloadCsv,
  expensesToCsv,
  invoicesToCsv,
  quotesToCsv,
} from '../lib/csv';

export function Reports() {
  const { data, stats } = useApp();
  const currency = data.business.currency;

  let vatCollected = 0;
  let salesTotal = 0;
  for (const inv of data.invoices) {
    if (inv.status === 'draft') continue;
    const t = invoiceTotals(inv.items, inv.taxRate, inv.discount);
    salesTotal += t.total;
    vatCollected += t.tax;
  }

  const byClient = data.clients.map((c) => {
    let owed = 0;
    let paid = 0;
    for (const inv of data.invoices.filter((i) => i.clientId === c.id)) {
      const t = invoiceTotals(inv.items, inv.taxRate, inv.discount);
      paid += inv.amountPaid || 0;
      owed += Math.max(0, t.total - (inv.amountPaid || 0));
    }
    return { client: c, owed, paid };
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports & exports</h1>
          <p>Tax-ready summaries and CSV files your accountant will love (Wave/FreshBooks style).</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Outstanding AR</div>
          <div className="stat-value">{formatMoney(stats.outstanding, currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Collected this month</div>
          <div className="stat-value success">{formatMoney(stats.paidThisMonth, currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Expenses this month</div>
          <div className="stat-value">{formatMoney(stats.expensesThisMonth, currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Est. profit this month</div>
          <div className={`stat-value ${stats.profitThisMonth >= 0 ? 'success' : 'danger'}`}>
            {formatMoney(stats.profitThisMonth, currency)}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3>VAT / tax summary</h3>
          <div className="totals-row">
            <span>Sales on invoices (excl. drafts)</span>
            <strong>{formatMoney(salesTotal, currency)}</strong>
          </div>
          <div className="totals-row">
            <span>VAT line total (approx.)</span>
            <strong>{formatMoney(vatCollected, currency)}</strong>
          </div>
          <p className="help">
            Approximate from document tax rates — not a substitute for official KRA filing software.
          </p>
        </div>
        <div className="card">
          <h3>CSV exports</h3>
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                downloadCsv(
                  `invoices-${todayISO()}.csv`,
                  invoicesToCsv(data.invoices, data.clients, currency),
                )
              }
            >
              <Download size={16} /> Invoices
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                downloadCsv(
                  `quotes-${todayISO()}.csv`,
                  quotesToCsv(data.quotes, data.clients, currency),
                )
              }
            >
              <Download size={16} /> Quotes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => downloadCsv(`clients-${todayISO()}.csv`, clientsToCsv(data.clients))}
            >
              <Download size={16} /> Clients
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                downloadCsv(
                  `expenses-${todayISO()}.csv`,
                  expensesToCsv(data.expenses, currency),
                )
              }
            >
              <Download size={16} /> Expenses
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Client balances (statements snapshot)</h3>
        <div className="table-wrap" style={{ border: 'none', marginTop: '0.75rem' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Client</th>
                <th>Paid (all time)</th>
                <th>Still owed</th>
              </tr>
            </thead>
            <tbody>
              {byClient.map(({ client, owed, paid }) => (
                <tr key={client.id}>
                  <td>
                    <strong>{client.name}</strong>
                    {client.company ? (
                      <div className="muted" style={{ fontSize: '0.85rem' }}>
                        {client.company}
                      </div>
                    ) : null}
                  </td>
                  <td>{formatMoney(paid, currency)}</td>
                  <td>
                    <strong className={owed > 0 ? 'stat-value danger' : ''} style={{ fontSize: '1rem' }}>
                      {formatMoney(owed, currency)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
