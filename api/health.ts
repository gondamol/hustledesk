import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from './_lib/cors.js';
import { isSupabaseConfigured } from './_lib/supabaseAdmin.js';
import { isMpesaConfigured } from './_lib/mpesa.js';
import { isEmailConfigured } from './_lib/email.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  return res.status(200).json({
    ok: true,
    service: 'hustledesk-api',
    features: {
      supabase: isSupabaseConfigured(),
      mpesa: isMpesaConfigured(),
      email: isEmailConfigured(),
    },
  });
}
