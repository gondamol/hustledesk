import { useApp } from '../context/AppContext';
import { formatDate, formatMoney } from '../lib/format';
import { copyToClipboard } from '../lib/share';
import { createShareLink } from '../lib/cloudApi';
import { Link2, Trash2 } from 'lucide-react';

export function Receipts() {
  const { data, deleteReceipt, cloudUser } = useApp();
  const currency = data.business.currency;

  const share = async (receiptId: string) => {
    const r = data.receipts.find((x) => x.id === receiptId);
    if (!r) return;
    const client = data.clients.find((c) => c.id === r.clientId);
    const { url } = await createShareLink({
      kind: 'receipt',
      business: data.business,
      client,
      receipt: r,
      userId: cloudUser?.id,
    });
    await copyToClipboard(url);
    alert('Receipt share link copied!\n\n' + url.slice(0, 80) + '…');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Receipts</h1>
          <p>Issued automatically when you record a payment with “create receipt” on an invoice.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Client</th>
              <th>Invoice</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.receipts.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    No receipts yet. Open an invoice → Record payment → check “Issue receipt”.
                  </div>
                </td>
              </tr>
            ) : (
              data.receipts.map((r) => {
                const client = data.clients.find((c) => c.id === r.clientId);
                const inv = data.invoices.find((i) => i.id === r.invoiceId);
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.number}</strong>
                    </td>
                    <td>{formatDate(r.date)}</td>
                    <td>{client?.name || '—'}</td>
                    <td>{inv?.number || '—'}</td>
                    <td>
                      {r.method}
                      {r.reference ? ` · ${r.reference}` : ''}
                    </td>
                    <td>{formatMoney(r.amount, currency)}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => share(r.id)}>
                          <Link2 size={14} /> Share
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteReceipt(r.id)}
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
