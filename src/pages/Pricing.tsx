import { useApp } from '../context/AppContext';

export function Pricing() {
  const { data, updateBusiness, go } = useApp();
  const isPro = data.business.plan === 'pro';

  const activatePro = () => {
    updateBusiness({ plan: 'pro' });
    alert(
      'Pro unlocked on this device (prototype).\n\nLive business: collect KSh 799 via M-Pesa, then activate the customer.',
    );
    go('dashboard');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pricing</h1>
          <p>
            Current plan: <strong>{isPro ? 'Pro' : 'Free'}</strong>
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>Revenue model:</strong> Free forever for acquisition → Pro KSh 799/mo · Setup service
        KSh 1,500–5,000 · Accountant white-label KSh 3k–10k/mo. Same playbook as Wave (free) + FreshBooks
        (paid power users).
      </div>

      <div className="grid-2">
        <div className="card pricing-card">
          <h3>Free</h3>
          <div className="price">
            KSh 0 <span>/ forever</span>
          </div>
          <ul className="feature-list">
            <li>Account + business logo</li>
            <li>5 invoices + 5 quotations</li>
            <li>Itemized lines (qty × price)</li>
            <li>PDF + WhatsApp</li>
          </ul>
          {!isPro ? (
            <button type="button" className="btn btn-secondary" disabled>
              Current plan
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => updateBusiness({ plan: 'free' })}>
              Switch to Free
            </button>
          )}
        </div>

        <div className="card pricing-card featured">
          <h3>Pro</h3>
          <div className="price">
            KSh 799 <span>/ month</span>
          </div>
          <ul className="feature-list">
            <li>Unlimited quotes & invoices</li>
            <li>Remove branding on PDFs</li>
            <li>Cloud multi-device (roadmap)</li>
            <li>Best for full-time freelancers & shops</li>
          </ul>
          {isPro ? (
            <button type="button" className="btn btn-primary" disabled>
              Pro active
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={activatePro}>
              Unlock Pro (demo)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
