# HustleDesk — product roadmap (differentiation)

## Shipped (this release)

- Multi-business **accounts** (email/password workspaces)
- **Logo** + brand colour on docs & share pages
- **Itemized** line items (unit, qty, price) + **catalog**
- **Quotations** → convert to invoice
- **Public shareable links** (no login for clients)
- **PDF**, print, **WhatsApp** send + **reminders**
- **Partial payments** + payment history + **receipts**
- **Expenses** + profit this month
- **CSV exports** (invoices, quotes, clients, expenses)
- **JSON backup / restore**
- **Reports**: VAT approx, client balances
- M-Pesa Till/Paybill, bank, KRA PIN, payment terms
- Free / Pro plan gates

## Next 30 days (cloud auth & payments)

1. **Supabase Auth** + Postgres multi-device sync  
2. **M-Pesa STK** for Pro subscription (Daraja API)  
3. Server-side short share URLs (`/s/abc123`) instead of long tokens  
4. Email delivery of invoices (Resend)

## Next 90 days (defensibility)

- Recurring invoices  
- Multi-user roles (owner / staff / accountant)  
- Client portal “mark paid” + upload M-Pesa screenshot  
- USSD lite for feature phones  
- Offline PWA  
- White-label domains per accountant  
- Mobile app (React Native / Capacitor)

## Competitors (honest)

| | Global | Kenya gap |
|--|--------|-----------|
| Wave / FreshBooks | Strong invoices | Weak M-Pesa UX, USD pricing |
| Zoho / QBO | Full accounting | Complex & expensive for jua kali |
| Excel + WhatsApp | Free | No brand, no AR visibility |
| **HustleDesk** | Lightweight money desk | Local rails + share + KES-first |
