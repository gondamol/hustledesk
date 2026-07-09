import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from '../_lib/cors';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin';

/**
 * GET /api/mpesa/status?userId=...
 * Poll Pro subscription status after STK.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured', plan: 'free', status: 'unknown' });
  }

  try {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;

    return res.status(200).json({
      plan: data?.plan || 'free',
      status: data?.status || 'inactive',
      mpesaReceipt: data?.mpesa_receipt || null,
      amount: data?.amount || null,
      updatedAt: data?.updated_at || null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Status failed';
    return res.status(500).json({ error: message });
  }
}
