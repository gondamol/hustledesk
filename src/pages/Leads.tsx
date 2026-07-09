import { MessageCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/format';
import { normalizeWa, SALES, salesWhatsAppUrl } from '../lib/sales';
import type { LeadStatus } from '../types';

export function Leads() {
  const { data, updateLead, deleteLead } = useApp();
  const salesPhone = data.business.salesWhatsApp || SALES.defaultWhatsApp;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sales leads</h1>
          <p>
            Captured from the public landing form. Call or WhatsApp them for {SALES.setupPrice} setup
            packages.
          </p>
        </div>
        <a
          className="btn btn-primary"
          href={salesWhatsAppUrl(salesPhone, SALES.whatsappGreeting)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> Open sales WhatsApp
        </a>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Business</th>
              <th>Message</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data.leads || []).length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    No leads yet. Share your landing page — the form saves leads here.
                  </div>
                </td>
              </tr>
            ) : (
              (data.leads || []).map((l) => (
                <tr key={l.id}>
                  <td>{formatDate(l.createdAt.slice(0, 10))}</td>
                  <td>
                    <strong>{l.name}</strong>
                    {l.email ? (
                      <div className="muted" style={{ fontSize: '0.8rem' }}>
                        {l.email}
                      </div>
                    ) : null}
                  </td>
                  <td>{l.phone || '—'}</td>
                  <td>{l.businessType || '—'}</td>
                  <td className="muted" style={{ maxWidth: 200, fontSize: '0.9rem' }}>
                    {l.message || '—'}
                  </td>
                  <td>
                    <select
                      value={l.status}
                      onChange={(e) => updateLead(l.id, { status: e.target.value as LeadStatus })}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      {l.phone && (
                        <a
                          className="btn btn-sm btn-secondary"
                          href={`https://wa.me/${normalizeWa(l.phone)}?text=${encodeURIComponent(`Habari ${l.name}, this is ${data.business.name || 'HustleDesk'}. Thanks for your interest!`)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (confirm('Delete lead?')) deleteLead(l.id);
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
