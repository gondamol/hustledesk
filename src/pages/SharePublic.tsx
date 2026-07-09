import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { decodeShare } from '../lib/share';
import { ShareDocument } from '../components/ShareDocument';

/** Legacy long-token share route: /share/:token */
export function SharePublic() {
  const { token } = useParams();
  const payload = useMemo(() => (token ? decodeShare(token) : null), [token]);

  if (!payload) {
    return (
      <div className="landing" style={{ minHeight: '100vh', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: 480, margin: '2rem auto' }}>
          <h1>Link invalid or expired</h1>
          <p className="muted">This share link could not be decoded. Ask the sender for a new link.</p>
          <Link to="/" className="btn btn-primary">
            Go to HustleDesk
          </Link>
        </div>
      </div>
    );
  }

  return <ShareDocument payload={payload} />;
}
