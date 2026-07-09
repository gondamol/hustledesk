import { useState } from 'react';
import {
  FileText,
  Smartphone,
  TrendingUp,
  MessageCircle,
  Image,
  FileSpreadsheet,
  ListOrdered,
  RefreshCw,
  Bell,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../lib/format';
import { SALES, salesWhatsAppUrl } from '../lib/sales';

export function Landing() {
  const { go, data, addLead } = useApp();
  const salesPhone = data.business.salesWhatsApp || SALES.defaultWhatsApp;

  const enter = () => {
    if (data.session.loggedIn) go('dashboard');
    else go('login');
  };

  const [lead, setLead] = useState({
    name: '',
    phone: '',
    email: '',
    businessType: '',
    message: '',
  });
  const [leadDone, setLeadDone] = useState(false);

  const submitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name.trim() || !lead.phone.trim()) {
      alert('Name and phone are required');
      return;
    }
    addLead({
      name: lead.name.trim(),
      phone: lead.phone.trim(),
      email: lead.email.trim(),
      businessType: lead.businessType.trim(),
      message: lead.message.trim(),
      source: 'landing',
    });
    setLeadDone(true);
    const waText = `Habari! I'm ${lead.name}. Business: ${lead.businessType || 'SME'}. Phone: ${lead.phone}. I want HustleDesk setup (${SALES.setupPrice}). ${lead.message}`;
    window.open(salesWhatsAppUrl(salesPhone, waText), '_blank');
  };

  return (
    <div className="landing">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go('landing')}>
          <span className="brand-mark">H</span>
          HustleDesk
        </button>
        <div className="nav-actions">
          <a className="btn btn-secondary" href={salesWhatsAppUrl(salesPhone, SALES.whatsappGreeting)} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> WhatsApp us
          </a>
          <button type="button" className="btn btn-secondary" onClick={() => go('pricing')}>
            Pricing
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => go('login')}>
            Log in
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go('signup')}>
            Start free
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="pill-row" style={{ marginBottom: '1rem' }}>
            <span className="pill">Kenya · M-Pesa · Recurring · Reminders · Accountants</span>
          </div>
          <h1>Get paid faster. Stop chasing invoices on WhatsApp chaos.</h1>
          <p className="hero-lead">
            Professional quotes & invoices with your logo, itemized line items, M-Pesa details,
            recurring retainers, payment reminders, and multi-business tools for accountants —
            built for Kenyan freelancers and SMEs.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => go('signup')}>
              Start free — no card
            </button>
            <a
              className="btn btn-secondary btn-lg"
              href={salesWhatsAppUrl(
                salesPhone,
                `I want setup help for ${SALES.setupPrice}. Please assist.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> Book setup {SALES.setupPrice}
            </a>
          </div>
          <div className="pill-row">
            <span className="pill">Free forever tier</span>
            <span className="pill">Pro {SALES.proPrice}</span>
            <span className="pill">Setup & training {SALES.setupPrice}</span>
          </div>
        </div>

        <div className="hero-card">
          <div className="invoice-preview">
            <div className="invoice-preview-head">
              <div>
                <strong>Your Brand Ltd</strong>
                <div style={{ opacity: 0.85, fontSize: '0.85rem' }}>Logo · KRA · M-Pesa Till</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>INV-0042</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Recurring · Reminder ready</div>
              </div>
            </div>
            <div className="invoice-preview-body">
              <div className="preview-row">
                <span>Monthly retainer × 1 mo</span>
                <span>{formatMoney(25000)}</span>
              </div>
              <div className="preview-row">
                <span>VAT 16%</span>
                <span>{formatMoney(4000)}</span>
              </div>
              <div className="preview-row">
                <span>Total due</span>
                <span>{formatMoney(29000)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Everything an SME needs to look legit and get paid</h2>
        <div className="grid-3">
          {[
            { icon: FileSpreadsheet, t: 'Quotes → invoices', d: 'Win the job, convert in one click.' },
            { icon: ListOrdered, t: 'Itemized billing', d: 'Qty × unit price, VAT, discounts.' },
            { icon: Image, t: 'Your logo & brand', d: 'PDFs clients take seriously.' },
            { icon: Smartphone, t: 'M-Pesa first', d: 'Till & Paybill on every document.' },
            { icon: RefreshCw, t: 'Recurring invoices', d: 'Monthly retainers auto-create.' },
            { icon: Bell, t: 'Payment reminders', d: 'WhatsApp chase with balance & Till.' },
            { icon: Building2, t: 'Multi-business', d: 'Accountants switch client files.' },
            { icon: TrendingUp, t: 'Reports & CSV', d: 'Outstanding, profit, tax export.' },
            { icon: FileText, t: 'Share links', d: 'Client opens invoice without an app.' },
          ].map(({ icon: Icon, t, d }) => (
            <div className="card" key={t}>
              <div className="icon-wrap">
                <Icon size={20} />
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Pricing that pays for itself</h2>
        <div className="grid-3">
          <div className="card pricing-card">
            <h3>Free</h3>
            <div className="price">
              KSh 0 <span>/ forever</span>
            </div>
            <ul className="feature-list">
              <li>Quotes, invoices, clients</li>
              <li>M-Pesa details + PDF</li>
              <li>WhatsApp share</li>
            </ul>
            <button type="button" className="btn btn-secondary" onClick={() => go('signup')}>
              Start free
            </button>
          </div>
          <div className="card pricing-card featured">
            <h3>Pro</h3>
            <div className="price">
              {SALES.proPrice} <span></span>
            </div>
            <ul className="feature-list">
              <li>Unlimited documents</li>
              <li>Recurring + branding</li>
              <li>Cloud when configured</li>
            </ul>
            <button type="button" className="btn btn-primary" onClick={() => go('pricing')}>
              See Pro
            </button>
          </div>
          <div className="card pricing-card">
            <h3>Done-for-you setup</h3>
            <div className="price">
              {SALES.setupPrice} <span>/ once</span>
            </div>
            <ul className="feature-list">
              <li>We configure your brand</li>
              <li>First invoices + training</li>
              <li>WhatsApp support</li>
            </ul>
            <a
              className="btn btn-secondary"
              href={salesWhatsAppUrl(salesPhone, `I want ${SALES.setupLabel} for ${SALES.setupPrice}.`)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> Book on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="leads">
        <h2>Get a free walkthrough</h2>
        <p className="section-sub">
          Leave your details — we WhatsApp you. Or message us directly for {SALES.setupPrice} setup.
        </p>
        <div className="grid-2">
          <div className="card">
            {leadDone ? (
              <div className="alert alert-info">
                Asante! We saved your lead and opened WhatsApp. If chat didn&apos;t open, tap the
                button above.
              </div>
            ) : (
              <form onSubmit={submitLead} className="form-grid">
                <div className="field">
                  <label>Your name *</label>
                  <input
                    value={lead.name}
                    onChange={(e) => setLead({ ...lead, name: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>WhatsApp phone *</label>
                  <input
                    value={lead.phone}
                    onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                    placeholder="07…"
                    required
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={lead.email}
                    onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Business type</label>
                  <input
                    value={lead.businessType}
                    onChange={(e) => setLead({ ...lead, businessType: e.target.value })}
                    placeholder="Salon, freelancing, shop…"
                  />
                </div>
                <div className="field full">
                  <label>Message</label>
                  <textarea
                    value={lead.message}
                    onChange={(e) => setLead({ ...lead, message: e.target.value })}
                    placeholder="I need invoices for my clients…"
                  />
                </div>
                <div className="field full">
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Submit & open WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="card">
            <h3>Prefer to try yourself?</h3>
            <p className="muted">
              Create a free account in 60 seconds. Demo login: demo@hustledesk.ke / demo123
            </p>
            <button type="button" className="btn btn-secondary" onClick={enter}>
              Open app
            </button>
            <p className="help" style={{ marginTop: '1rem' }}>
              Tip: set your sales WhatsApp under Business settings so these CTAs reach your number.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        HustleDesk · Made for Kenya hustlers · Quotes · Invoices · Get paid
      </footer>
    </div>
  );
}
