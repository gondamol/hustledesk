import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login, go } = useApp();
  const [email, setEmail] = useState('demo@hustledesk.ke');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error || 'Login failed');
      return;
    }
    go('dashboard');
  };

  return (
    <div className="landing" style={{ minHeight: '100vh' }}>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go('landing')}>
          <span className="brand-mark">H</span>
          HustleDesk
        </button>
      </header>
      <div className="section" style={{ maxWidth: 440 }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem' }}>Log in to your business</h1>
          <p className="muted">Each SME gets their own workspace with logo, clients, quotes & invoices.</p>
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="alert alert-warn">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg">
              Log in
            </button>
          </form>
          <p className="help" style={{ marginTop: '1rem' }}>
            Demo: <strong>demo@hustledesk.ke</strong> / <strong>demo123</strong>
          </p>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            New business?{' '}
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => go('signup')}>
              Create free account
            </button>
          </p>
          <p className="help" style={{ marginTop: '1rem' }}>
            Multi-business accounts on this device (each email = isolated workspace). Cloud multi-device
            auth (Supabase) is the next Pro infrastructure step — share links already work anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Signup() {
  const { signup, go } = useApp();
  const [form, setForm] = useState({
    businessName: '',
    owner: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = signup(form);
    if (!res.ok) {
      setError(res.error || 'Could not create account');
      return;
    }
    go('settings');
  };

  return (
    <div className="landing" style={{ minHeight: '100vh' }}>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go('landing')}>
          <span className="brand-mark">H</span>
          HustleDesk
        </button>
      </header>
      <div className="section" style={{ maxWidth: 480 }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem' }}>Create your business account</h1>
          <p className="muted">60 seconds. Then add your logo, M-Pesa Till, and first quotation.</p>
          <form onSubmit={submit} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="field full">
              <label>Business / brand name *</label>
              <input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Wanjiku Designs"
                required
              />
            </div>
            <div className="field">
              <label>Your name</label>
              <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
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
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={4}
                required
              />
            </div>
            {error && (
              <div className="field full">
                <div className="alert alert-warn">{error}</div>
              </div>
            )}
            <div className="field full">
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Create free account
              </button>
            </div>
          </form>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Already have an account?{' '}
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => go('login')}>
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
