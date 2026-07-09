import { useEffect, useState } from 'react';
import { Save, RotateCcw, ImagePlus, Download, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fileToLogoDataUrl, todayISO } from '../lib/format';
import {
  clientsToCsv,
  downloadCsv,
  expensesToCsv,
  invoicesToCsv,
  quotesToCsv,
} from '../lib/csv';
import type { BusinessProfile } from '../types';
import { isCloudEnabled } from '../lib/config';

export function Settings() {
  const {
    data,
    updateBusiness,
    resetDemoData,
    exportBackup,
    importBackup,
    cloudMode,
    cloudUser,
    cloudSyncing,
    go,
  } = useApp();
  const [form, setForm] = useState<BusinessProfile>(data.business);
  const [saved, setSaved] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [apiFeatures, setApiFeatures] = useState<{
    supabase: boolean;
    mpesa: boolean;
    email: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setApiFeatures(d.features || null))
      .catch(() => setApiFeatures(null));
  }, []);

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

  const currency = data.business.currency;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Business settings</h1>
          <p>Brand, payments, account, backup — your SME control centre.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          <Save size={16} /> Save settings
        </button>
      </div>

      {saved && <div className="alert alert-info">Settings saved.</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Cloud & billing setup status</h3>
        <p className="muted">
          Frontend cloud mode: <strong>{cloudMode || isCloudEnabled() ? 'ON' : 'OFF'}</strong>
          {cloudUser ? ` · signed in as ${cloudUser.email}` : ' · not signed into cloud'}
          {cloudSyncing ? ' · syncing…' : ''}
        </p>
        <ul className="feature-list" style={{ marginTop: '0.5rem' }}>
          <li>
            Supabase API: {apiFeatures == null ? 'checking…' : apiFeatures.supabase ? 'configured' : 'not set'}
          </li>
          <li>
            Email (Resend): {apiFeatures == null ? 'checking…' : apiFeatures.email ? 'configured' : 'not set'}
          </li>
          <li>
            M-Pesa STK: {apiFeatures == null ? 'checking…' : apiFeatures.mpesa ? 'configured' : 'not set'}
          </li>
        </ul>
        <p className="help">
          Finish cloud setup with the step-by-step guide in the repo:{' '}
          <code>docs/FINISH_SETUP.md</code> (also on GitHub). Until then, local demo mode still works.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Business logo & brand</h3>
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
            <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0] || null)} />
            <p className="help">Shown on invoices, quotes, PDFs, and public share links.</p>
            {form.logoDataUrl && (
              <button type="button" className="btn btn-sm btn-danger" onClick={() => set('logoDataUrl', '')}>
                Remove logo
              </button>
            )}
            {logoError && (
              <div className="alert alert-warn" style={{ marginTop: 8 }}>
                {logoError}
              </div>
            )}
          </div>
        </div>
        <div className="form-grid" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label>Primary brand colour</label>
            <input
              type="color"
              value={form.brandColor || form.theme?.primary || '#0f766e'}
              onChange={(e) => {
                const primary = e.target.value;
                set('brandColor', primary);
                set('theme', {
                  ...(form.theme || {
                    primary,
                    primaryDark: primary,
                    primarySoft: '#ccfbf1',
                    accent: '#f59e0b',
                    background: '#f4f7f6',
                    surface: '#ffffff',
                    text: '#0f1f1c',
                    muted: '#5b6e69',
                    border: '#d7e3df',
                    font: 'system' as const,
                    radius: '14px',
                  }),
                  primary,
                });
              }}
            />
            <span className="help">
              For full themes (AI + logo + fonts), open{' '}
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => go('brand')}>
                Brand studio
              </button>
            </span>
          </div>
          <div className="field full">
            <label>Default payment terms</label>
            <input
              value={form.paymentTerms || ''}
              onChange={(e) => set('paymentTerms', e.target.value)}
              placeholder="Payment due within 7 days…"
            />
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
            <input value={form.kraPin} onChange={(e) => set('kraPin', e.target.value)} />
          </div>
          <div className="field">
            <label>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => set('currency', e.target.value as BusinessProfile['currency'])}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="field">
            <label>Sales WhatsApp (landing CTAs)</label>
            <input
              value={form.salesWhatsApp || ''}
              onChange={(e) => set('salesWhatsApp', e.target.value)}
              placeholder="2547…"
            />
            <span className="help">Used for “Book setup” buttons on the marketing page.</span>
          </div>
          <div className="field">
            <label>Accountant multi-business mode</label>
            <select
              value={form.isAccountant ? '1' : '0'}
              onChange={(e) => set('isAccountant', e.target.value === '1')}
            >
              <option value="0">Off — single business</option>
              <option value="1">On — manage client businesses</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>M-Pesa & bank</h3>
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
            <label>Paybill account</label>
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
        <h3>Document numbering</h3>
        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Invoice prefix</label>
            <input value={form.invoicePrefix} onChange={(e) => set('invoicePrefix', e.target.value)} />
          </div>
          <div className="field">
            <label>Next invoice #</label>
            <input
              type="number"
              value={form.nextInvoiceNumber}
              onChange={(e) => set('nextInvoiceNumber', Number(e.target.value) || 1)}
            />
          </div>
          <div className="field">
            <label>Quote prefix</label>
            <input value={form.quotePrefix} onChange={(e) => set('quotePrefix', e.target.value)} />
          </div>
          <div className="field">
            <label>Next quote #</label>
            <input
              type="number"
              value={form.nextQuoteNumber}
              onChange={(e) => set('nextQuoteNumber', Number(e.target.value) || 1)}
            />
          </div>
          <div className="field full">
            <label>Invoice notes default</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="field full">
            <label>Quote notes default</label>
            <textarea value={form.quoteNotes} onChange={(e) => set('quoteNotes', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Workspace account (multi-business on this device)</h3>
        <p className="muted">
          Each SME signs up with email + password. Data is isolated per account in this browser
          (cloud multi-device sync is the Pro SaaS roadmap — Supabase/Auth). Demo: demo@hustledesk.ke /
          demo123
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

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Export CSV & full backup</h3>
        <div className="toolbar">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              downloadCsv(
                `invoices-${todayISO()}.csv`,
                invoicesToCsv(data.invoices, data.clients, currency),
              )
            }
          >
            <Download size={16} /> Invoices CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              downloadCsv(`quotes-${todayISO()}.csv`, quotesToCsv(data.quotes, data.clients, currency))
            }
          >
            <Download size={16} /> Quotes CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => downloadCsv(`clients-${todayISO()}.csv`, clientsToCsv(data.clients))}
          >
            <Download size={16} /> Clients CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              downloadCsv(`expenses-${todayISO()}.csv`, expensesToCsv(data.expenses, currency))
            }
          >
            <Download size={16} /> Expenses CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const blob = new Blob([exportBackup()], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hustledesk-backup-${todayISO()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} /> Full JSON backup
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Restore backup
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const res = importBackup(text);
                if (!res.ok) alert(res.error);
                else alert('Backup restored.');
              }}
            />
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Custom domain (your brand URL)</h3>
        <ol className="muted" style={{ paddingLeft: '1.2rem' }}>
          <li>
            Buy a domain (e.g. <code>hustledesk.ke</code> or <code>app.yourbrand.co.ke</code>).
          </li>
          <li>
            Open{' '}
            <a href="https://vercel.com/aurel123/hustledesk/settings/domains" target="_blank" rel="noreferrer">
              Vercel → hustledesk → Domains
            </a>
            .
          </li>
          <li>Add the domain and copy the DNS records Vercel shows (usually A/CNAME).</li>
          <li>At your registrar (Namecheap, Safaricom Domains, Cloudflare…), paste those records.</li>
          <li>Wait for SSL (often &lt; 30 min). Your app will open on your domain.</li>
        </ol>
      </div>

      <div className="card">
        <h3>Demo data</h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (confirm('Reset demo workspace and log into demo account?')) resetDemoData();
          }}
        >
          <RotateCcw size={16} /> Load demo account
        </button>
      </div>
    </div>
  );
}
