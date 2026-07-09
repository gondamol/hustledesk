import { useState } from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/format';

export function Workspaces() {
  const {
    data,
    switchWorkspace,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    updateBusiness,
  } = useApp();
  const [name, setName] = useState('');
  const list = data.workspaces || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Client businesses</h1>
          <p>
            Accountant / bookkeeper mode: switch between SME files without logging out. Each client
            has separate invoices, clients, and settings.
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        Enable accountant mode in Business settings if you manage multiple shops. Active:{' '}
        <strong>{data.business.name || 'Unnamed'}</strong>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Add client business</h3>
        <div className="toolbar" style={{ marginBottom: 0, marginTop: '0.75rem' }}>
          <input
            className="search"
            placeholder="e.g. Wanjiku Designs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!name.trim()) return alert('Enter a business name');
              createWorkspace(name.trim());
              updateBusiness({ isAccountant: true });
              setName('');
            }}
          >
            <Plus size={16} /> Create & switch
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Business</th>
              <th>Invoices</th>
              <th>Clients</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No workspaces yet — they appear after first save.</div>
                </td>
              </tr>
            ) : (
              list.map((w) => {
                const active = w.id === data.activeWorkspaceId;
                return (
                  <tr key={w.id} style={active ? { background: '#f0fdfa' } : undefined}>
                    <td>
                      <Building2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      <strong>{w.name || w.business.name}</strong>
                      {active && (
                        <span className="badge badge-paid" style={{ marginLeft: 8 }}>
                          Active
                        </span>
                      )}
                    </td>
                    <td>{w.invoices?.length ?? 0}</td>
                    <td>{w.clients?.length ?? 0}</td>
                    <td>{formatDate(w.updatedAt.slice(0, 10))}</td>
                    <td>
                      <div className="row-actions">
                        {!active && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => switchWorkspace(w.id)}
                          >
                            Switch
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            const n = prompt('Rename business', w.name || w.business.name);
                            if (n) renameWorkspace(w.id, n);
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          disabled={list.length <= 1}
                          onClick={() => {
                            if (confirm(`Delete workspace “${w.name}”?`)) deleteWorkspace(w.id);
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
