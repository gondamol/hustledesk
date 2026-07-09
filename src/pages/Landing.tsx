import {
  FileText,
  Smartphone,
  TrendingUp,
  Shield,
  Zap,
  MessageCircle,
  Image,
  FileSpreadsheet,
  ListOrdered,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../lib/format';

export function Landing() {
  const { go, data } = useApp();
  const enter = () => {
    if (data.session.loggedIn) go('dashboard');
    else go('login');
  };

  return (
    <div className="landing">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go('landing')}>
          <span className="brand-mark">H</span>
          HustleDesk
        </button>
        <div className="nav-actions">
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
            <span className="pill">Kenya-first · Share links · CSV · Quotes → Invoices → Receipts</span>
          </div>
          <h1>The money desk for Kenyan SMEs who still chase payments on WhatsApp.</h1>
          <p className="hero-lead">
            HustleDesk is Wave + FreshBooks + HoneyBook for Kenya: business accounts, logos,
            itemized quotes, public share links clients open without apps, M-Pesa details, payment
            history, receipts, expenses, tax CSV exports, and WhatsApp reminders — in one place.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => go('signup')}>
              Create free business account
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={enter}>
              Open demo
            </button>
          </div>
          <div className="pill-row">
            <span className="pill">Public share links</span>
            <span className="pill">CSV for accountants</span>
            <span className="pill">Catalog + expenses</span>
            <span className="pill">M-Pesa + receipts</span>
          </div>
        </div>

        <div className="hero-card">
          <div className="invoice-preview">
            <div className="invoice-preview-head">
              <div>
                <strong>Your Brand Ltd</strong>
                <div style={{ opacity: 0.85, fontSize: '0.85rem' }}>Logo · KRA PIN · M-Pesa</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>QT-0012 → INV-0042</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Quote won · invoice sent</div>
              </div>
            </div>
            <div className="invoice-preview-body">
              <div className="preview-row">
                <span>Design package × 1 job</span>
                <span>{formatMoney(45000)}</span>
              </div>
              <div className="preview-row">
                <span>Print materials × 200 pcs</span>
                <span>{formatMoney(16000)}</span>
              </div>
              <div className="preview-row">
                <span>VAT 16%</span>
                <span>{formatMoney(9760)}</span>
              </div>
              <div className="preview-row">
                <span>Total due</span>
                <span>{formatMoney(70760)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Real SME pain points we attack</h2>
        <p className="section-sub">
          US tools (FreshBooks, Wave, QuickBooks, HoneyBook, Jobber) already solved this. Kenya still
          lives in Excel + Word + “I’ll send later.” That’s the gap.
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="icon-wrap">
              <Image size={20} />
            </div>
            <h3>Look unprofessional</h3>
            <p>No logo, no letterhead → clients delay payment. Upload logo once; every PDF is on-brand.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <ListOrdered size={20} />
            </div>
            <h3>Fuzzy totals</h3>
            <p>Shops & contractors need lines: item, unit, qty, unit price, amount. Not one vague lump sum.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <FileSpreadsheet size={20} />
            </div>
            <h3>Quotes never become invoices</h3>
            <p>You quote on paper, then retype the invoice. HustleDesk converts quote → invoice in one click.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <Smartphone size={20} />
            </div>
            <h3>Wrong payment rails</h3>
            <p>US tools push cards/ACH. You need Till, Paybill, bank — on the document clients already open.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <TrendingUp size={20} />
            </div>
            <h3>No cash visibility</h3>
            <p>Outstanding vs paid vs overdue vs quote pipeline — stop guessing from WhatsApp threads.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <MessageCircle size={20} />
            </div>
            <h3>Chasing is awkward</h3>
            <p>PDF + WhatsApp message with amount and M-Pesa details. Follow up without rewriting the bill.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <FileText size={20} />
            </div>
            <h3>Tax season panic</h3>
            <p>KRA PIN on docs, VAT lines, payment history — cleaner trail for your accountant later.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <Shield size={20} />
            </div>
            <h3>Data trust</h3>
            <p>Your own business account. Prototype is browser-local; cloud multi-device is the Pro SaaS path.</p>
          </div>
          <div className="card">
            <div className="icon-wrap">
              <Zap size={20} />
            </div>
            <h3>Too expensive / complex</h3>
            <p>QuickBooks is overkill for a salon or plumber. Free tier + KSh 799 Pro matches local wallets.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Inspired by the best — built for East Africa</h2>
        <p className="section-sub">
          FreshBooks (invoices + clients), Wave (free SME accounting entry), HoneyBook (quotes →
          contracts → pay), Jobber (trade itemization). None of them natively feel like M-Pesa Kenya.
        </p>
        <div className="card">
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            <strong>Competition note:</strong> Global tools (Zoho, QuickBooks Online, Xero) exist in Kenya but
            are priced and designed for formal accounting teams. Local payment tools focus on collecting
            money, not the quote→invoice→chase workflow. HustleDesk owns the “solo/SME money paperwork”
            layer — where Excel currently wins by default.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>Simple pricing</h2>
        <div className="grid-2">
          <div className="card pricing-card">
            <h3>Free</h3>
            <div className="price">
              KSh 0 <span>/ forever</span>
            </div>
            <ul className="feature-list">
              <li>Business account + logo</li>
              <li>5 invoices + 5 quotes</li>
              <li>Itemized line items</li>
              <li>M-Pesa + PDF + WhatsApp</li>
            </ul>
            <button type="button" className="btn btn-secondary" onClick={() => go('signup')}>
              Create free account
            </button>
          </div>
          <div className="card pricing-card featured">
            <h3>Pro</h3>
            <div className="price">
              KSh 799 <span>/ month</span>
            </div>
            <ul className="feature-list">
              <li>Unlimited quotes & invoices</li>
              <li>Remove HustleDesk branding</li>
              <li>Cloud backup (roadmap)</li>
              <li>Priority support</li>
            </ul>
            <button type="button" className="btn btn-primary" onClick={() => go('signup')}>
              Start free, upgrade later
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        HustleDesk · Kenya SME money desk · Quote · Invoice · Get paid
      </footer>
    </div>
  );
}
