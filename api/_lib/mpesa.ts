/**
 * Safaricom Daraja STK Push helpers
 * Docs: https://developer.safaricom.co.ke
 */

const env = () => (process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox');

export function mpesaBaseUrl() {
  return env() === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

export function isMpesaConfigured() {
  return !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_PASSKEY &&
    process.env.MPESA_SHORTCODE
  );
}

export async function getMpesaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await fetch(
    `${mpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`M-Pesa token failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export function timestampNow() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

export function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = `254${p.slice(1)}`;
  if (p.startsWith('7') || p.startsWith('1')) p = `254${p}`;
  if (!p.startsWith('254')) throw new Error('Phone must be Kenyan format e.g. 0712345678');
  return p;
}

export async function stkPush(params: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}) {
  const token = await getMpesaToken();
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = timestampNow();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const phone = normalizePhone(params.phone);

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
    Amount: Math.max(1, Math.round(params.amount)),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: params.callbackUrl,
    AccountReference: params.accountReference.slice(0, 12),
    TransactionDesc: params.transactionDesc.slice(0, 13),
  };

  const res = await fetch(`${mpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data.errorCode || data.ResponseCode === '1') {
    throw new Error(data.errorMessage || data.ResponseDescription || 'STK push failed');
  }
  return data as {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
}
