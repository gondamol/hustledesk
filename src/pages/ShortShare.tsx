import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchShortShare } from '../lib/cloudApi';
import { decodeShare } from '../lib/share';
import type { SharePayload } from '../types';
import { ShareDocument } from '../components/ShareDocument';

/**
 * /s/:id — short cloud share
 * Also supports legacy long tokens if id is actually a compressed token (rare).
 */
export function ShortShare() {
  const { id } = useParams();
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setError('Missing share id');
        setLoading(false);
        return;
      }
      // try cloud short id first
      const cloud = await fetchShortShare(id);
      if (cancelled) return;
      if (cloud) {
        setPayload(cloud);
        setLoading(false);
        return;
      }
      // fallback: treat as long local token
      const local = decodeShare(id);
      if (local) {
        setPayload(local);
        setLoading(false);
        return;
      }
      setError('Share link not found or expired.');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="landing" style={{ minHeight: '100vh', padding: '3rem', textAlign: 'center' }}>
        <p className="muted">Loading document…</p>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="landing" style={{ minHeight: '100vh', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: 480, margin: '2rem auto' }}>
          <h1>Link not found</h1>
          <p className="muted">{error || 'Invalid share link.'}</p>
          <Link to="/" className="btn btn-primary">
            Go to HustleDesk
          </Link>
        </div>
      </div>
    );
  }

  return <ShareDocument payload={payload} />;
}
