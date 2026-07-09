import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from '../_lib/cors.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin.js';

/**
 * GET /api/shares/:id
 * Public fetch of short share payload.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Cloud shares not configured', code: 'SUPABASE_MISSING' });
  }

  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ error: 'id required' });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin.from('shares').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Share not found' });

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Share link expired' });
    }

    // best-effort view counter
    await admin
      .from('shares')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);

    return res.status(200).json({
      id: data.id,
      kind: data.kind,
      payload: data.payload,
      created_at: data.created_at,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Share fetch failed';
    return res.status(500).json({ error: message });
  }
}
