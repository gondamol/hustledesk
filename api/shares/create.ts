import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from '../_lib/cors';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin';
import { shortId } from '../_lib/ids';

/**
 * POST /api/shares/create
 * Body: { kind, payload, accessToken? }
 * Creates short share id in Supabase.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: 'Cloud shares not configured',
      code: 'SUPABASE_MISSING',
    });
  }

  try {
    const { kind, payload, userId } = req.body || {};
    if (!kind || !payload) {
      return res.status(400).json({ error: 'kind and payload required' });
    }
    if (!['invoice', 'quote', 'receipt'].includes(kind)) {
      return res.status(400).json({ error: 'invalid kind' });
    }

    const admin = getSupabaseAdmin();
    let id = shortId(10);
    // rare collision retry
    for (let i = 0; i < 3; i++) {
      const { data: existing } = await admin.from('shares').select('id').eq('id', id).maybeSingle();
      if (!existing) break;
      id = shortId(10);
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + 90);

    const { error } = await admin.from('shares').insert({
      id,
      user_id: userId || null,
      kind,
      payload,
      expires_at: expires.toISOString(),
    });

    if (error) throw error;

    const appUrl = (process.env.PUBLIC_APP_URL || process.env.VITE_PUBLIC_APP_URL || '').replace(
      /\/$/,
      '',
    );
    const url = appUrl ? `${appUrl}/s/${id}` : `/s/${id}`;

    return res.status(200).json({ id, url, kind });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Share create failed';
    return res.status(500).json({ error: message });
  }
}
