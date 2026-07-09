import type { PaymentStatus, QuoteStatus } from '../types';

const invLabels: Record<PaymentStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
};

const quoteLabels: Record<QuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  converted: 'Converted',
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`badge badge-${status}`}>{invLabels[status]}</span>;
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const cls =
    status === 'accepted' || status === 'converted'
      ? 'paid'
      : status === 'rejected' || status === 'expired'
        ? 'overdue'
        : status === 'sent'
          ? 'sent'
          : status === 'draft'
            ? 'draft'
            : 'partial';
  return <span className={`badge badge-${cls}`}>{quoteLabels[status]}</span>;
}
