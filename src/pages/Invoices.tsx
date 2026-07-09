import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, invoiceTotals } from '../lib/format';
import { StatusBadge } from '../components/StatusBadge';
import type { PaymentStatus } from '../types';

export function Invoices() {
  const { data, go, deleteInvoice, canCreateInvoice, freeInvoiceLimit } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | PaymentStatus>('all');
  const currency = data.business.currency;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.invoices
      .filter((inv) => (status === 'all' ? true : inv.status === status))
      .filter((inv) => {
        if (!term) return true;
        const client = data.clients.find((c) => c.id === inv.clientId);
        return (
          inv.number.toLowerCase().includes(term) ||
          (client?.name || '').toLowerCase().includes(term) ||
          (client?.company || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [data.invoices, data.clients, q, status]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>
            {data.business.plan === 'free'
              ? `Free plan: ${data.invoices.length}/${freeInvoiceLimit} invoices used`
              : 'Unlimited invoices on Pro'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canCreateInvoice}
          onClick={() => go('invoice-new')}
        >
          <Plus size={16} /> New invoice
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search invoice # or client…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Status</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty">No invoices match. Create one for a client.</div>
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const client = data.clients.find((c) => c.id === inv.clientId);
                const { total } = invoiceTotals(inv.items, inv.taxRate, inv.discount);
                const balance = Math.max(0, total - (inv.amountPaid || 0));
                return (
                  <tr key={inv.id}>
                    <td>
                      <strong>{inv.number}</strong>
                    </td>
                    <td>{client?.name || '—'}</td>
                    <td>{formatDate(inv.issueDate)}</td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>{formatMoney(total, currency)}</td>
                    <td>{formatMoney(balance, currency)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => go('invoice-view', inv.id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => go('invoice-edit', inv.id)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (confirm(`Delete ${inv.number}?`)) deleteInvoice(inv.id);
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
