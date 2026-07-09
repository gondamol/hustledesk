import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Client } from '../types';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  notes: '',
};

export function Clients() {
  const { data, addClient, updateClient, deleteClient } = useApp();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data.clients;
    return data.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term),
    );
  }, [data.clients, q]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (client: Client) => {
    setCreating(false);
    setEditing(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      notes: client.notes,
    });
  };

  const save = () => {
    if (!form.name.trim()) {
      alert('Client name is required');
      return;
    }
    if (editing) {
      updateClient(editing.id, form);
    } else {
      addClient(form);
    }
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  };

  const showForm = creating || editing;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>People and companies you invoice. Keep phone numbers ready for WhatsApp follow-ups.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add client
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search name, company, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>{editing ? 'Edit client' : 'New client'}</h3>
          <div className="form-grid" style={{ marginTop: '0.75rem' }}>
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="field">
              <label>Phone / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+2547…"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field full">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="field full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="toolbar" style={{ marginTop: '0.85rem', marginBottom: 0 }}>
            <button type="button" className="btn btn-primary" onClick={save}>
              Save client
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setCreating(false);
                setEditing(null);
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
              <th>Company</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No clients yet. Add your first client to start invoicing.</div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.company || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEdit(c)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (confirm(`Delete ${c.name}?`)) deleteClient(c.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
