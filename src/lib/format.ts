export function formatMoney(amount: number, currency = 'KES'): string {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number, from = todayISO()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function invoiceTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate: number,
  discount: number,
) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountSafe = Math.max(0, discount || 0);
  const taxable = Math.max(0, subtotal - discountSafe);
  const tax = taxable * ((taxRate || 0) / 100);
  const total = taxable + tax;
  return { subtotal, discount: discountSafe, tax, total };
}

export function lineAmount(qty: number, unitPrice: number): number {
  return (Number(qty) || 0) * (Number(unitPrice) || 0);
}

/** Compress image file to data URL for logo storage */
export function fileToLogoDataUrl(file: File, maxPx = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
