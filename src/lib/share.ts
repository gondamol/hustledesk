import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type {
  BusinessProfile,
  Client,
  Invoice,
  Quote,
  Receipt,
  SharePayload,
} from '../types';

export function buildSharePayload(
  kind: SharePayload['kind'],
  business: BusinessProfile,
  client: Client | undefined,
  doc: { invoice?: Invoice; quote?: Quote; receipt?: Receipt },
): SharePayload {
  // Keep share URLs under browser limits — include logo only if small
  const logo =
    business.logoDataUrl && business.logoDataUrl.length < 80_000
      ? business.logoDataUrl
      : '';

  return {
    v: 1,
    kind,
    business: {
      name: business.name,
      email: business.email,
      phone: business.phone,
      address: business.address,
      city: business.city,
      kraPin: business.kraPin,
      mpesaTill: business.mpesaTill,
      mpesaPaybill: business.mpesaPaybill,
      mpesaAccount: business.mpesaAccount,
      bankName: business.bankName,
      bankAccount: business.bankAccount,
      bankBranch: business.bankBranch,
      currency: business.currency,
      logoDataUrl: logo,
      brandColor: business.brandColor || '#0f766e',
      paymentTerms: business.paymentTerms || '',
      plan: business.plan,
    },
    client: client
      ? {
          name: client.name,
          company: client.company,
          email: client.email,
          phone: client.phone,
          address: client.address,
        }
      : undefined,
    invoice: doc.invoice,
    quote: doc.quote,
    receipt: doc.receipt,
    createdAt: new Date().toISOString(),
  };
}

export function encodeShare(payload: SharePayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(token: string): SharePayload | null {
  try {
    const raw = decompressFromEncodedURIComponent(token);
    if (!raw) return null;
    const data = JSON.parse(raw) as SharePayload;
    if (data.v !== 1 || !data.kind) return null;
    return data;
  } catch {
    return null;
  }
}

export function shareUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/share/${token}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}
