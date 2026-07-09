import { useState } from 'react';
import { Plus, Play, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, invoiceTotals, uid } from '../lib/format';
import { blankRecurring, frequencyLabel } from '../lib/recurring';
import { LineItemsEditor } from '../components/LineItemsEditor';
import type { RecurrenceFrequency, RecurringTemplate } from '../types';

export function Recurring() {
  const {
    data,
    saveRecurring,
    deleteRecurring,
    processRecurringNow,
    canCreateInvoice,
  } = useApp();
  const currency = data.business.currency;
  const [editing, setEditing] = useState<RecurringTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setEditing(blankRecurring(data.clients[0]?.id || ''));
    setIsNew(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return alert('Name required');
    if (!editing.clientId) return alert('Select a client');
    if (editing.items.every((i) => !i.description.trim())) return alert('Add line items');
    saveRecurring(
      {
        ...editing,
        items: editing.items.filter((i) => i.description.trim()),
      },
      isNew,
    );
    setEditing(null);
    setIsNew(false);
  };

  const runNow = () => {
    if (!canCreateInvoice) {
      alert('Invoice limit reached — upgrade Pro or free some invoices.');
      return;
    }
    const n = processRecurringNow();
    alert(n ? `Generated ${n} invoice(s) from due templates.` : 'No templates due today.');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recurring invoices</h1>
          <p>
            Auto-create retainers (weekly / monthly / quarterly). Due templates generate when you
            open the app.
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={runNow}>
            <Play size={16} /> Run due now
          </button>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> New schedule
          </button>
        </div>
      </div>

      {statsBanner(data.recurring || [])}

      {editing && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>{isNew ? 'New recurring schedule' : 'Edit schedule'}</h3>
          <div className="form-grid three" style={{ marginTop: '0.75rem' }}>
            <div className="field">
              <label>Name</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Monthly SEO retainer"
              />
            </div>
            <div className="field">
              <label>Client</label>
              <select
                value={editing.clientId}
                onChange={(e) => setEditing({ ...editing, clientId: e.target.value })}
              >
                <option value="">Select…</option>
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Frequency</label>
              <select
                value={editing.frequency}
                onChange={(e) =>
                  setEditing({ ...editing, frequency: e.target.value as RecurrenceFrequency })
                }
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="field">
              <label>Next run date</label>
              <input
                type="date"
                value={editing.nextRun}
                onChange={(e) => setEditing({ ...editing, nextRun: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Due days after issue</label>
              <input
                type="number"
                min={0}
                value={editing.dueDays}
                onChange={(e) => setEditing({ ...editing, dueDays: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label>Active</label>
              <select
                value={editing.active ? '1' : '0'}
                onChange={(e) => setEditing({ ...editing, active: e.target.value === '1' })}
              >
                <option value="1">Yes — auto-generate</option>
                <option value="0">Paused</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <LineItemsEditor
              items={editing.items}
              currency={currency}
              catalog={data.catalog}
              onChange={(items) => setEditing({ ...editing, items })}
            />
          </div>
          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label>VAT %</label>
              <input
                type="number"
                value={editing.taxRate}
                onChange={(e) => setEditing({ ...editing, taxRate: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label>Discount</label>
              <input
                type="number"
                value={editing.discount}
                onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field full">
              <label>Notes</label>
              <textarea
                value={editing.notes}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="toolbar" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <button type="button" className="btn btn-primary" onClick={save}>
              Save schedule
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setIsNew(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Client</th>
              <th>Frequency</th>
              <th>Next run</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data.recurring || []).length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    No recurring schedules. Create monthly retainers so invoices write themselves.
                  </div>
                </td>
              </tr>
            ) : (
              (data.recurring || []).map((t) => {
                const client = data.clients.find((c) => c.id === t.clientId);
                const { total } = invoiceTotals(t.items, t.taxRate, t.discount);
                return (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                    </td>
                    <td>{client?.name || '—'}</td>
                    <td>{frequencyLabel(t.frequency)}</td>
                    <td>{formatDate(t.nextRun)}</td>
                    <td>{formatMoney(total, currency)}</td>
                    <td>{t.active ? 'Active' : 'Paused'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setEditing({ ...t, items: t.items.map((i) => ({ ...i })) });
                            setIsNew(false);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (confirm('Delete this schedule?')) deleteRecurring(t.id);
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

function statsBanner(list: RecurringTemplate[]) {
  const today = new Date().toISOString().slice(0, 10);
  const due = list.filter((t) => t.active && t.nextRun <= today).length;
  const active = list.filter((t) => t.active).length;
  return (
    <div className="stat-grid" style={{ marginBottom: '1rem' }}>
      <div className="stat">
        <div className="stat-label">Active schedules</div>
        <div className="stat-value">{active}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Due to generate</div>
        <div className={`stat-value ${due ? 'danger' : ''}`}>{due}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Total schedules</div>
        <div className="stat-value">{list.length}</div>
      </div>
    </div>
  );
}

void uid;
