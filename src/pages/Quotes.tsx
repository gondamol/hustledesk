import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { QuoteStatusBadge } from '../components/StatusBadge';
import type { QuoteStatus } from '../types';

export function Quotes() {
  const { data, go, deleteQuote, canCreateQuote, freeQuoteLimit } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | QuoteStatus>('all');
  const currency = data.business.currency;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.quotes
      .filter((qt) => (status === 'all' ? true : qt.status === status))
      .filter((qt) => {
        if (!term) return true;
        const client = data.clients.find((c) => c.id === qt.clientId);
        return (
          qt.number.toLowerCase().includes(term) ||
          (client?.name || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [data.quotes, data.clients, q, status]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Quotations</h1>
          <p>
            Send a professional quote first — convert to invoice when the client says yes.
            {data.business.plan === 'free'
              ? ` Free: ${data.quotes.length}/${freeQuoteLimit} quotes.`
              : ' Unlimited on Pro.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canCreateQuote}
          onClick={() => go('quote-new')}
        >
          <Plus size={16} /> New quotation
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search quote # or client…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Valid until</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    No quotations yet. Win the job with a clear itemized quote before invoicing.
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((qt) => {
                const client = data.clients.find((c) => c.id === qt.clientId);
                const { total } = invoiceTotals(qt.items, qt.taxRate, qt.discount);
                return (
                  <tr key={qt.id}>
                    <td>
                      <strong>{qt.number}</strong>
                    </td>
                    <td>{client?.name || '—'}</td>
                    <td>{formatDate(qt.issueDate)}</td>
                    <td>{formatDate(qt.validUntil)}</td>
                    <td>
                      <QuoteStatusBadge status={qt.status} />
                    </td>
                    <td>{formatMoney(total, currency)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => go('quote-view', qt.id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => go('quote-edit', qt.id)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (confirm(`Delete ${qt.number}?`)) deleteQuote(qt.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
