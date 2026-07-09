import { useState } from 'react';
import { Save, RotateCcw, Trash2, ImagePlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fileToLogoDataUrl } from '../lib/format';
import type { BusinessProfile } from '../types';

export function Settings() {
  const { data, updateBusiness, resetDemo, wipeData } = useApp();
  const [form, setForm] = useState<BusinessProfile>(data.business);
  const [saved, setSaved] = useState(false);
  const [logoError, setLogoError] = useState('');

  const set = <K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    updateBusiness(form);
    setSaved(true);
  };

  const onLogo = async (file: File | null) => {
    setLogoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload an image (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setLogoError('Image too large. Use under 4MB.');
      return;
    }
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      set('logoDataUrl', dataUrl);
    } catch {
      setLogoError('Could not process image.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Business settings</h1>
          <p>Your brand, logo, M-Pesa, and KRA details appear on every quote and invoice.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          <Save size={16} /> Save settings
        </button>
      </div>

      {saved && <div className="alert alert-info">Settings saved.</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Business logo</h3>
        <p className="muted">Like FreshBooks / Wave — your logo builds trust on PDFs clients receive.</p>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 12,
              border: '1px dashed var(--line)',
              display: 'grid',
              placeItems: 'center',
              background: '#f8faf9',
              overflow: 'hidden',
            }}
          >
            {form.logoDataUrl ? (
              <img src={form.logoDataUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <ImagePlus size={28} color="#94a3b8" />
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onLogo(e.target.files?.[0] || null)}
            />
            <p className="help">PNG or JPG recommended. Square logos work best.</p>
            {form.logoDataUrl && (
              <button type="button" className="btn btn-sm btn-danger" onClick={() => set('logoDataUrl', '')}>
                Remove logo
              </button>
            )}
            {logoError && <div className="alert alert-warn" style={{ marginTop: 8 }}>{logoError}</div>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Profile</h3>
        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Business name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Owner / contact name</label>
            <input value={form.owner} onChange={(e) => set('owner', e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label>Address</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="field">
            <label>KRA PIN</label>
            <input value={form.kraPin} onChange={(e) => set('kraPin', e.target.value)} placeholder="A000000000X" />
          </div>
          <div className="field">
            <label>Currency</label>
            <select value={form.currency} onChange={(e) => set('currency', e.target.value as BusinessProfile['currency'])}>
              <option value="KES">KES — Kenya Shilling</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Payment details (M-Pesa & bank)</h3>
        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>M-Pesa Till</label>
            <input value={form.mpesaTill} onChange={(e) => set('mpesaTill', e.target.value)} />
          </div>
          <div className="field">
            <label>M-Pesa Paybill</label>
            <input value={form.mpesaPaybill} onChange={(e) => set('mpesaPaybill', e.target.value)} />
          </div>
          <div className="field">
            <label>Paybill account name / number</label>
            <input value={form.mpesaAccount} onChange={(e) => set('mpesaAccount', e.target.value)} />
          </div>
          <div className="field">
            <label>Bank name</label>
            <input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
          </div>
          <div className="field">
            <label>Bank account</label>
            <input value={form.bankAccount} onChange={(e) => set('bankAccount', e.target.value)} />
          </div>
          <div className="field">
            <label>Branch</label>
            <input value={form.bankBranch} onChange={(e) => set('bankBranch', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Document defaults</h3>
        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Invoice prefix</label>
            <input value={form.invoicePrefix} onChange={(e) => set('invoicePrefix', e.target.value)} />
          </div>
          <div className="field">
            <label>Next invoice number</label>
            <input
              type="number"
              min={1}
              value={form.nextInvoiceNumber}
              onChange={(e) => set('nextInvoiceNumber', Number(e.target.value) || 1)}
            />
          </div>
          <div className="field">
            <label>Quote prefix</label>
            <input value={form.quotePrefix} onChange={(e) => set('quotePrefix', e.target.value)} />
          </div>
          <div className="field">
            <label>Next quote number</label>
            <input
              type="number"
              min={1}
              value={form.nextQuoteNumber}
              onChange={(e) => set('nextQuoteNumber', Number(e.target.value) || 1)}
            />
          </div>
          <div className="field full">
            <label>Default invoice notes</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="field full">
            <label>Default quotation notes</label>
            <textarea value={form.quoteNotes} onChange={(e) => set('quoteNotes', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Account (this device)</h3>
        <p className="muted">
          Prototype login is stored in your browser. Hosted multi-device accounts (like Wave cloud) come next.
        </p>
        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Login email</label>
            <input value={form.accountEmail} onChange={(e) => set('accountEmail', e.target.value)} />
          </div>
          <div className="field">
            <label>Login password</label>
            <input
              type="password"
              value={form.accountPassword}
              onChange={(e) => set('accountPassword', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Data</h3>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (confirm('Reload demo data? Your current data will be replaced.')) {
                resetDemo();
                window.location.reload();
              }
            }}
          >
            <RotateCcw size={16} /> Load demo data
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (confirm('Wipe all clients, quotes, and invoices?')) {
                wipeData();
                window.location.reload();
              }
            }}
          >
            <Trash2 size={16} /> Wipe all data
          </button>
        </div>
      </div>
    </div>
  );
}
