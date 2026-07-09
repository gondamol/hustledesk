import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BusinessProfile, Client, Invoice, Quote } from '../types';
import { formatDate, formatMoney, invoiceTotals } from './format';

type DocKind = 'INVOICE' | 'QUOTATION';

function buildDoc(
  kind: DocKind,
  number: string,
  issueDate: string,
  endDateLabel: string,
  endDate: string,
  status: string,
  items: { description: string; unit: string; quantity: number; unitPrice: number }[],
  taxRate: number,
  discount: number,
  amountPaid: number | null,
  notes: string,
  client: Client | undefined,
  business: BusinessProfile,
) {
  const doc = new jsPDF();
  const currency = business.currency || 'KES';
  const { subtotal, discount: disc, tax, total } = invoiceTotals(items, taxRate, discount);
  const balance = amountPaid === null ? total : Math.max(0, total - (amountPaid || 0));

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 36, 'F');

  let textLeft = 14;
  if (business.logoDataUrl) {
    try {
      doc.addImage(business.logoDataUrl, 'PNG', 14, 6, 22, 22);
      textLeft = 40;
    } catch {
      // ignore bad logo
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(business.name || 'Business', textLeft, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(kind, 196, 14, { align: 'right' });
  doc.text(number, 196, 21, { align: 'right' });
  doc.text(status.toUpperCase(), 196, 28, { align: 'right' });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  let y = 46;
  const leftMeta: string[] = [];
  if (business.address) leftMeta.push(business.address);
  if (business.city) leftMeta.push(business.city);
  if (business.phone) leftMeta.push(business.phone);
  if (business.email) leftMeta.push(business.email);
  if (business.kraPin) leftMeta.push(`KRA PIN: ${business.kraPin}`);
  leftMeta.forEach((line) => {
    doc.text(line, 14, y);
    y += 5;
  });

  doc.setFont('helvetica', 'bold');
  doc.text(kind === 'INVOICE' ? 'Bill To' : 'Prepared For', 120, 46);
  doc.setFont('helvetica', 'normal');
  let cy = 52;
  const billLines = [
    client?.name || 'Client',
    client?.company,
    client?.email,
    client?.phone,
    client?.address,
  ].filter(Boolean) as string[];
  billLines.forEach((line) => {
    doc.text(line, 120, cy);
    cy += 5;
  });

  doc.setFont('helvetica', 'bold');
  doc.text(`Issue date: ${formatDate(issueDate)}`, 14, 82);
  doc.text(`${endDateLabel}: ${formatDate(endDate)}`, 14, 88);

  autoTable(doc, {
    startY: 96,
    head: [['Description', 'Unit', 'Qty', 'Unit Price', 'Amount']],
    body: items.map((item) => [
      item.description,
      item.unit || 'unit',
      String(item.quantity),
      formatMoney(item.unitPrice, currency),
      formatMoney(item.quantity * item.unitPrice, currency),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
  });

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 130;
  let ty = finalY + 10;
  const right = 196;

  const rows: [string, string][] = [
    ['Subtotal', formatMoney(subtotal, currency)],
    ['Discount', formatMoney(disc, currency)],
    [`VAT (${taxRate || 0}%)`, formatMoney(tax, currency)],
    ['Total', formatMoney(total, currency)],
  ];
  if (amountPaid !== null) {
    rows.push(['Amount paid', formatMoney(amountPaid || 0, currency)]);
    rows.push(['Balance due', formatMoney(balance, currency)]);
  }

  rows.forEach(([label, value], idx) => {
    if (label === 'Total' || label === 'Balance due') doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    doc.text(label, right - 55, ty);
    doc.text(value, right, ty, { align: 'right' });
    ty += 6;
    void idx;
  });

  if (kind === 'INVOICE') {
    ty += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Payment details', 14, ty);
    ty += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const pay: string[] = [];
    if (business.mpesaTill) pay.push(`M-Pesa Till: ${business.mpesaTill}`);
    if (business.mpesaPaybill)
      pay.push(
        `M-Pesa Paybill: ${business.mpesaPaybill}${business.mpesaAccount ? ` (Acc: ${business.mpesaAccount})` : ''}`,
      );
    if (business.bankName)
      pay.push(
        `Bank: ${business.bankName}${business.bankAccount ? ` · ${business.bankAccount}` : ''}${business.bankBranch ? ` · ${business.bankBranch}` : ''}`,
      );
    if (pay.length === 0) pay.push('Contact us for payment instructions.');
    pay.forEach((line) => {
      doc.text(line, 14, ty);
      ty += 5;
    });
  }

  if (notes) {
    ty += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 14, ty);
    ty += 5;
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(notes, 180);
    doc.text(wrapped, 14, ty);
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  const footer =
    business.plan === 'pro'
      ? `${business.name} · Professional document`
      : 'Generated with HustleDesk — get paid faster in Kenya';
  doc.text(footer, 105, 290, { align: 'center' });

  return doc;
}

export function downloadInvoicePdf(
  invoice: Invoice,
  client: Client | undefined,
  business: BusinessProfile,
) {
  const doc = buildDoc(
    'INVOICE',
    invoice.number,
    invoice.issueDate,
    'Due date',
    invoice.dueDate,
    invoice.status,
    invoice.items,
    invoice.taxRate,
    invoice.discount,
    invoice.amountPaid || 0,
    invoice.notes || business.notes,
    client,
    business,
  );
  doc.save(`${invoice.number}.pdf`);
}

export function downloadQuotePdf(
  quote: Quote,
  client: Client | undefined,
  business: BusinessProfile,
) {
  const doc = buildDoc(
    'QUOTATION',
    quote.number,
    quote.issueDate,
    'Valid until',
    quote.validUntil,
    quote.status,
    quote.items,
    quote.taxRate,
    quote.discount,
    null,
    quote.notes || business.quoteNotes,
    client,
    business,
  );
  doc.save(`${quote.number}.pdf`);
}
