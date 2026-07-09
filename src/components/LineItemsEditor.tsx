import { Plus, Trash2 } from 'lucide-react';
import type { LineItem } from '../types';
import { formatMoney, lineAmount, uid } from '../lib/format';

const UNIT_SUGGESTIONS = ['unit', 'pcs', 'hrs', 'days', 'job', 'kg', 'person', 'guest', 'mo', 'km'];

interface Props {
  items: LineItem[];
  currency: string;
  onChange: (items: LineItem[]) => void;
}

export function LineItemsEditor({ items, currency, onChange }: Props) {
  const update = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const add = () => {
    onChange([
      ...items,
      { id: uid('li'), description: '', unit: 'unit', quantity: 1, unitPrice: 0 },
    ]);
  };

  const remove = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Line items</h3>
        <button type="button" className="btn btn-sm btn-secondary" onClick={add}>
          <Plus size={14} /> Add item
        </button>
      </div>
      <p className="help" style={{ marginTop: '0.35rem' }}>
        List every product or service with quantity, unit, and price — like shops, contractors, and
        caterers do on paper.
      </p>

      <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
        <table className="data">
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>Description</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.description}
                    placeholder="e.g. Cement 50kg bags"
                    onChange={(e) => update(item.id, { description: e.target.value })}
                    style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '0.45rem' }}
                  />
                </td>
                <td>
                  <input
                    list={`units-${item.id}`}
                    value={item.unit}
                    onChange={(e) => update(item.id, { unit: e.target.value })}
                    style={{ width: 80, border: '1px solid var(--line)', borderRadius: 8, padding: '0.45rem' }}
                  />
                  <datalist id={`units-${item.id}`}>
                    {UNIT_SUGGESTIONS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => update(item.id, { quantity: Number(e.target.value) || 0 })}
                    style={{ width: 80, border: '1px solid var(--line)', borderRadius: 8, padding: '0.45rem' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => update(item.id, { unitPrice: Number(e.target.value) || 0 })}
                    style={{ width: 110, border: '1px solid var(--line)', borderRadius: 8, padding: '0.45rem' }}
                  />
                </td>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {formatMoney(lineAmount(item.quantity, item.unitPrice), currency)}
                </td>
                <td>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
