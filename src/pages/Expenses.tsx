import { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatMoney, todayISO, uid } from '../lib/format';
import { downloadCsv, expensesToCsv } from '../lib/csv';
import type { Expense, ExpenseCategory } from '../types';

const CATS: ExpenseCategory[] = [
  'supplies',
  'rent',
  'transport',
  'salaries',
  'marketing',
  'utilities',
  'tax',
  'other',
];

export function Expenses() {
  const { data, saveExpense, deleteExpense } = useApp();
  const currency = data.business.currency;
  const [form, setForm] = useState({
    date: todayISO(),
    category: 'supplies' as ExpenseCategory,
    description: '',
    amount: 0,
    vendor: '',
    paymentMethod: 'M-Pesa',
  });

  const add = () => {
    if (!form.description.trim() || form.amount <= 0) {
      alert('Description and amount required');
      return;
    }
    const exp: Expense = {
      id: uid('exp'),
      ...form,
      description: form.description.trim(),
      createdAt: new Date().toISOString(),
    };
    saveExpense(exp, true);
    setForm({ ...form, description: '', amount: 0, vendor: '' });
  };

  const total = data.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>
            Track money out so profit is real — not just invoices sent. Total logged:{' '}
            <strong>{formatMoney(total, currency)}</strong>
          </p>
        </div>
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
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Log expense</h3>
        <div className="form-grid three" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Amount</label>
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field full">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Vendor</label>
            <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </div>
          <div className="field">
            <label>Paid via</label>
            <input
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={add}>
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.expenses.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty">No expenses yet.</div>
                </td>
              </tr>
            ) : (
              data.expenses.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.category}</td>
                  <td>{e.description}</td>
                  <td>{e.vendor || '—'}</td>
                  <td>{formatMoney(e.amount, currency)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteExpense(e.id)}
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
