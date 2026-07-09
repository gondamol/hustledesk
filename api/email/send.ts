import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from '../_lib/cors.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin.js';
import { invoiceEmailHtml, isEmailConfigured, sendEmail } from '../_lib/email.js';

/**
 * POST /api/email/send
 * Body: invoice email fields + optional userId
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isEmailConfigured()) {
    return res.status(503).json({
      error: 'Email not configured. Set RESEND_API_KEY and EMAIL_FROM on Vercel.',
      code: 'EMAIL_MISSING',
    });
  }

  try {
    const body = req.body || {};
    const to = String(body.to || '').trim();
    if (!to || !to.includes('@')) {
      return res.status(400).json({ error: 'Valid client email (to) required' });
    }

    const subject =
      body.subject ||
      `Invoice ${body.invoiceNumber || ''} from ${body.businessName || 'HustleDesk'}`.trim();

    const html =
      body.html ||
      invoiceEmailHtml({
        businessName: body.businessName || 'Business',
        clientName: body.clientName || 'Client',
        invoiceNumber: body.invoiceNumber || '',
        total: body.total || '',
        dueDate: body.dueDate || '',
        balance: body.balance || '',
        shareUrl: body.shareUrl,
        mpesaTill: body.mpesaTill,
        mpesaPaybill: body.mpesaPaybill,
        notes: body.notes,
      });

    const result = await sendEmail({
      to,
      subject,
      html,
      replyTo: body.replyTo,
    });

    if (isSupabaseConfigured() && body.userId) {
      try {
        const admin = getSupabaseAdmin();
        await admin.from('email_log').insert({
          user_id: body.userId,
          to_email: to,
          subject,
          status: 'sent',
          meta: { resendId: result.id, invoiceNumber: body.invoiceNumber },
        });
      } catch {
        /* non-fatal */
      }
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Email failed';
    return res.status(500).json({ error: message });
  }
}
