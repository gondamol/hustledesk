/** Public sales config — change salesWhatsApp in Business settings too */
export const SALES = {
  /** Fallback if business.salesWhatsApp empty (update to your number) */
  defaultWhatsApp: '254700000000',
  setupPrice: 'KSh 2,000',
  setupLabel: 'Setup & training (one-time)',
  proPrice: 'KSh 799/mo',
  whatsappGreeting:
    'Habari! I want HustleDesk setup for my business. Please help me get started.',
};

export function normalizeWa(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = `254${p.slice(1)}`;
  if (p.length === 9 && (p.startsWith('7') || p.startsWith('1'))) p = `254${p}`;
  return p;
}

export function salesWhatsAppUrl(phone: string, text: string): string {
  const n = normalizeWa(phone || SALES.defaultWhatsApp);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function clientReminderText(opts: {
  clientName: string;
  invoiceNumber: string;
  balance: string;
  dueDate: string;
  businessName: string;
  mpesaTill?: string;
  mpesaPaybill?: string;
  overdueDays?: number;
}): string {
  const overdue =
    opts.overdueDays && opts.overdueDays > 0
      ? `\nThis invoice is ${opts.overdueDays} day(s) overdue.`
      : '';
  return `Habari ${opts.clientName},\n\nFriendly reminder about invoice ${opts.invoiceNumber}.\nBalance due: ${opts.balance}\nDue date: ${opts.dueDate}.${overdue}\n\n${opts.mpesaTill ? `M-Pesa Till: ${opts.mpesaTill}\n` : ''}${opts.mpesaPaybill ? `Paybill: ${opts.mpesaPaybill}\n` : ''}\nFrom: ${opts.businessName}\nAsante.`;
}
