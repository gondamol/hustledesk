import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin.js';

/**
 * POST /api/mpesa/callback
 * Safaricom STK callback — marks Pro on success.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always ACK Safaricom quickly
  const ack = () => res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  try {
    const body = req.body || {};
    const stk = body.Body?.stkCallback;
    if (!stk) return ack();

    const checkoutId = stk.CheckoutRequestID as string;
    const resultCode = stk.ResultCode;
    const meta = stk.CallbackMetadata?.Item as { Name: string; Value?: string | number }[] | undefined;

    let receipt = '';
    let amount = 0;
    let phone = '';
    if (Array.isArray(meta)) {
      for (const item of meta) {
        if (item.Name === 'MpesaReceiptNumber') receipt = String(item.Value || '');
        if (item.Name === 'Amount') amount = Number(item.Value || 0);
        if (item.Name === 'PhoneNumber') phone = String(item.Value || '');
      }
    }

    if (isSupabaseConfigured() && checkoutId) {
      const admin = getSupabaseAdmin();
      if (resultCode === 0) {
        await admin
          .from('subscriptions')
          .update({
            plan: 'pro',
            status: 'active',
            mpesa_receipt: receipt,
            amount: amount || undefined,
            phone: phone || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('checkout_request_id', checkoutId);
      } else {
        await admin
          .from('subscriptions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('checkout_request_id', checkoutId);
      }
    }
  } catch {
    // still ack
  }

  return ack();
}
