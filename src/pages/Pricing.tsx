import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { config } from '../lib/config';
import { pollProStatus, startProStk } from '../lib/cloudApi';

export function Pricing() {
  const { data, updateBusiness, go, cloudUser, cloudMode, refreshSubscription } = useApp();
  const isPro = data.business.plan === 'pro';
  const [phone, setPhone] = useState(data.business.phone || '');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const activateDemoPro = () => {
    updateBusiness({ plan: 'pro' });
    alert('Pro unlocked on this device (demo mode).\n\nConnect M-Pesa Daraja env vars for real STK billing.');
    go('dashboard');
  };

  const payWithMpesa = async () => {
    if (!cloudUser) {
      setStatus('Log in with cloud auth (Supabase) first, then pay with M-Pesa.');
      return;
    }
    if (!phone.trim()) {
      setStatus('Enter the M-Pesa phone number that will pay.');
      return;
    }
    setLoading(true);
    setStatus('Sending STK push… check your phone.');
    try {
      const res = await startProStk(phone, cloudUser.id);
      setStatus(`${res.message} Waiting for payment confirmation…`);
      // poll up to ~60s
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const st = await pollProStatus(cloudUser.id);
        if (st.plan === 'pro' && st.status === 'active') {
          updateBusiness({ plan: 'pro' });
          await refreshSubscription();
          setStatus(`Payment received${st.mpesaReceipt ? ` · Receipt ${st.mpesaReceipt}` : ''}. Pro active!`);
          setLoading(false);
          return;
        }
        if (st.status === 'failed') {
          setStatus('Payment failed or cancelled. Try again.');
          setLoading(false);
          return;
        }
      }
      setStatus('Still pending. If you paid, click “Refresh subscription” in a moment.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'STK failed';
      if (msg.includes('MPESA') || msg.includes('not configured')) {
        setStatus(`${msg} — using demo unlock instead is available below.`);
      } else {
        setStatus(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pricing</h1>
          <p>
            Current plan: <strong>{isPro ? 'Pro' : 'Free'}</strong>
            {cloudMode ? ' · Cloud sync on' : ' · Local mode'}
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>Pro billing:</strong> KSh {config.proPriceKes}/month via M-Pesa STK (Daraja). Requires cloud login +
        MPESA_* env on Vercel. Until then, demo unlock still works for demos.
      </div>

      <div className="grid-2">
        <div className="card pricing-card">
          <h3>Free</h3>
          <div className="price">
            KSh 0 <span>/ forever</span>
          </div>
          <ul className="feature-list">
            <li>Account + business logo</li>
            <li>8 invoices + 8 quotations</li>
            <li>Itemized lines, share links</li>
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
            KSh {config.proPriceKes} <span>/ month</span>
          </div>
          <ul className="feature-list">
            <li>Unlimited quotes & invoices</li>
            <li>Remove branding on PDFs</li>
            <li>Cloud multi-device sync</li>
            <li>Email invoices (Resend)</li>
            <li>Short share URLs</li>
          </ul>

          {isPro ? (
            <button type="button" className="btn btn-primary" disabled>
              Pro active
            </button>
          ) : (
            <>
              <div className="field" style={{ marginBottom: '0.75rem' }}>
                <label>M-Pesa phone (e.g. 0712…)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xxxxxxxx" />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: 8 }}
                disabled={loading}
                onClick={payWithMpesa}
              >
                {loading ? 'Waiting for M-Pesa…' : `Pay KSh ${config.proPriceKes} via M-Pesa STK`}
              </button>
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={activateDemoPro}>
                Unlock Pro (demo / offline)
              </button>
              {cloudUser && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={async () => {
                    await refreshSubscription();
                    setStatus('Subscription refreshed from cloud.');
                  }}
                >
                  Refresh subscription
                </button>
              )}
            </>
          )}
          {status && (
            <div className="alert alert-info" style={{ marginTop: '0.75rem' }}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
