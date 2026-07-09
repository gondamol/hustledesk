import type { SharePayload } from '../types';
import { config } from './config';
import { buildSharePayload, encodeShare, shareUrl as localShareUrl } from './share';
import type { BusinessProfile, Client, Invoice, Quote, Receipt } from '../types';

/** Create short share URL via API; falls back to long local token URL */
export async function createShareLink(params: {
  kind: SharePayload['kind'];
  business: BusinessProfile;
  client?: Client;
  invoice?: Invoice;
  quote?: Quote;
  receipt?: Receipt;
  userId?: string | null;
}): Promise<{ url: string; mode: 'cloud' | 'local'; id?: string }> {
  const payload = buildSharePayload(params.kind, params.business, params.client, {
    invoice: params.invoice,
    quote: params.quote,
    receipt: params.receipt,
  });

  try {
    const res = await fetch('/api/shares/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: params.kind,
        payload,
        userId: params.userId || null,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { id: string; url: string };
      const origin = config.appUrl || window.location.origin;
      const url = data.url.startsWith('http') ? data.url : `${origin}/s/${data.id}`;
      return { url, mode: 'cloud', id: data.id };
    }
  } catch {
    /* fall through */
  }

  const token = encodeShare(payload);
  return { url: localShareUrl(token), mode: 'local' };
}

export async function fetchShortShare(id: string): Promise<SharePayload | null> {
  try {
    const res = await fetch(`/api/shares/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.payload as SharePayload;
  } catch {
    return null;
  }
}

export async function startProStk(phone: string, userId: string) {
  const res = await fetch('/api/mpesa/stk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'STK push failed');
  return data as {
    ok: boolean;
    message: string;
    checkoutRequestId: string;
    amount: number;
  };
}

export async function pollProStatus(userId: string) {
  const res = await fetch(`/api/mpesa/status?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Status failed');
  return data as { plan: string; status: string; mpesaReceipt?: string };
}

export async function sendInvoiceEmail(body: Record<string, unknown>) {
  const res = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Email failed');
  return data as { ok: boolean; id: string };
}
