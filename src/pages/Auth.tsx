import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isCloudEnabled } from '../lib/config';

export function Login() {
  const { login, go, cloudMode, cloudReady } = useApp();
  const [email, setEmail] = useState(cloudMode ? '' : 'demo@hustledesk.ke');
  const [password, setPassword] = useState(cloudMode ? '' : 'demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cloud = isCloudEnabled();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Login failed');
      return;
    }
    if (res.error) {
      // soft message e.g. confirm email
      setError(res.error);
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
          <p className="muted">
            {cloud
              ? 'Cloud auth enabled — sign in from any device. Your workspace syncs automatically.'
              : 'Local workspace mode. Add Supabase keys for multi-device cloud auth.'}
          </p>
          {!cloudReady && <p className="help">Connecting…</p>}
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-warn">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !cloudReady}>
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>
          {!cloud && (
            <p className="help" style={{ marginTop: '1rem' }}>
              Demo: <strong>demo@hustledesk.ke</strong> / <strong>demo123</strong>
            </p>
          )}
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            New business?{' '}
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => go('signup')}>
              Create free account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Signup() {
  const { signup, go, cloudReady } = useApp();
  const cloud = isCloudEnabled();
  const [form, setForm] = useState({
    businessName: '',
    owner: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    const res = await signup(form);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Could not create account');
      return;
    }
    if (res.error) {
      setInfo(res.error);
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
          <p className="muted">
            {cloud
              ? 'Cloud account — works on phone, laptop, and tablet.'
              : 'Creates a workspace on this device (enable Supabase for cloud).'}
          </p>
          <form onSubmit={submit} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="field full">
              <label>Business / brand name *</label>
              <input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
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
                minLength={6}
                required
              />
            </div>
            {error && (
              <div className="field full">
                <div className="alert alert-warn">{error}</div>
              </div>
            )}
            {info && (
              <div className="field full">
                <div className="alert alert-info">{info}</div>
              </div>
            )}
            <div className="field full">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading || !cloudReady}
              >
                {loading ? 'Creating…' : 'Create free account'}
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
