import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, uid } from '../lib/format';
import type { CatalogItem } from '../types';

export function Catalog() {
  const { data, saveCatalogItem, deleteCatalogItem } = useApp();
  const currency = data.business.currency;
  const [form, setForm] = useState({
    name: '',
    unit: 'unit',
    unitPrice: 0,
    taxRate: 16,
    category: 'Services',
  });

  const add = () => {
    if (!form.name.trim()) return alert('Name required');
    const item: CatalogItem = {
      id: uid('cat'),
      name: form.name.trim(),
      unit: form.unit,
      unitPrice: form.unitPrice,
      taxRate: form.taxRate,
      category: form.category,
      createdAt: new Date().toISOString(),
    };
    saveCatalogItem(item, true);
    setForm({ name: '', unit: 'unit', unitPrice: 0, taxRate: 16, category: 'Services' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Product & service catalog</h1>
          <p>
            Save prices once — insert into quotes and invoices in seconds. Differentiator vs Excel:
            consistent pricing across your team.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Add item</h3>
        <div className="form-grid three" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Unit</label>
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div className="field">
            <label>Unit price</label>
            <input
              type="number"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field">
            <label>Default VAT %</label>
            <input
              type="number"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={add}>
          <Plus size={16} /> Save to catalog
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Price</th>
              <th>VAT %</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.catalog.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty">No catalog items yet. Add your top services/products.</div>
                </td>
              </tr>
            ) : (
              data.catalog.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.category}</td>
                  <td>{c.unit}</td>
                  <td>{formatMoney(c.unitPrice, currency)}</td>
                  <td>{c.taxRate}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteCatalogItem(c.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
