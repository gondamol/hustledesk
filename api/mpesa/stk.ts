import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from '../_lib/cors.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin.js';
import { isMpesaConfigured, stkPush } from '../_lib/mpesa.js';

const PRO_AMOUNT = Number(process.env.PRO_PRICE_KES || 799);

/**
 * POST /api/mpesa/stk
 * Body: { phone, userId, email? }
 * Initiates STK Push for Pro subscription.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isMpesaConfigured()) {
    return res.status(503).json({
      error: 'M-Pesa not configured. Set MPESA_* env vars on Vercel.',
      code: 'MPESA_MISSING',
      demoAmount: PRO_AMOUNT,
    });
  }

  try {
    const { phone, userId } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });
    if (!userId) return res.status(400).json({ error: 'userId required (login first)' });

    const appUrl = (process.env.PUBLIC_APP_URL || '').replace(/\/$/, '');
    if (!appUrl) {
      return res.status(500).json({ error: 'PUBLIC_APP_URL not set (needed for M-Pesa callback)' });
    }

    const result = await stkPush({
      phone,
      amount: PRO_AMOUNT,
      accountReference: 'HustlePro',
      transactionDesc: 'HustleDesk Pro',
      callbackUrl: `${appUrl}/api/mpesa/callback`,
    });

    if (isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      await admin.from('subscriptions').upsert({
        user_id: userId,
        plan: 'free',
        status: 'pending',
        phone,
        checkout_request_id: result.CheckoutRequestID,
        merchant_request_id: result.MerchantRequestID,
        amount: PRO_AMOUNT,
        updated_at: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      ok: true,
      message: result.CustomerMessage || 'Check your phone for M-Pesa prompt',
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      amount: PRO_AMOUNT,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'STK failed';
    return res.status(500).json({ error: message });
  }
}
