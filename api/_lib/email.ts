export function isEmailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!isEmailConfigured()) {
    throw new Error('Email not configured. Set RESEND_API_KEY and EMAIL_FROM.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      reply_to: params.replyTo,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Resend error ${res.status}`);
  }
  return data as { id: string };
}

export function invoiceEmailHtml(opts: {
  businessName: string;
  clientName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  balance: string;
  shareUrl?: string;
  mpesaTill?: string;
  mpesaPaybill?: string;
  notes?: string;
}) {
  const payBits = [
    opts.mpesaTill ? `M-Pesa Till: <strong>${opts.mpesaTill}</strong>` : '',
    opts.mpesaPaybill ? `Paybill: <strong>${opts.mpesaPaybill}</strong>` : '',
  ]
    .filter(Boolean)
    .join('<br/>');

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Segoe UI,Arial,sans-serif;color:#0f1f1c;line-height:1.5;background:#f4f7f6;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #d7e3df;">
    <h2 style="color:#0f766e;margin:0 0 8px;">Invoice ${opts.invoiceNumber}</h2>
    <p style="margin:0 0 16px;color:#5b6e69;">From ${opts.businessName}</p>
    <p>Habari ${opts.clientName},</p>
    <p>Please find your invoice details below.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#5b6e69;">Total</td><td style="text-align:right;font-weight:700;">${opts.total}</td></tr>
      <tr><td style="padding:8px 0;color:#5b6e69;">Balance due</td><td style="text-align:right;font-weight:700;">${opts.balance}</td></tr>
      <tr><td style="padding:8px 0;color:#5b6e69;">Due date</td><td style="text-align:right;">${opts.dueDate}</td></tr>
    </table>
    ${payBits ? `<div style="background:#f0fdfa;border-radius:8px;padding:12px;margin:16px 0;">${payBits}</div>` : ''}
    ${opts.shareUrl ? `<p><a href="${opts.shareUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">View invoice online</a></p>` : ''}
    ${opts.notes ? `<p style="color:#5b6e69;font-size:14px;">${opts.notes}</p>` : ''}
    <p style="font-size:12px;color:#8aa39c;margin-top:24px;">Sent with HustleDesk</p>
  </div>
</body>
</html>`;
}
