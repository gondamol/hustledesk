# HustleDesk

**Kenya-first money desk for SMEs & freelancers**  
Quotes → invoices → share links → M-Pesa → receipts → reports.

Live: **https://hustledesk-khaki.vercel.app**  
Repo: **https://github.com/gondamol/hustledesk**

## Demo

- Email: `demo@hustledesk.ke`
- Password: `demo123`

## Features that set us apart

| Feature | Why it matters |
|--------|----------------|
| **Public share links** | Client opens invoice/quote in browser — no app install |
| **Multi-business accounts** | Isolated workspaces per email on this device |
| **Logo + brand colour** | Look legit on every PDF & share page |
| **Itemized lines + catalog** | Qty × unit price; reuse services |
| **Quotes → invoice** | HoneyBook-style conversion |
| **Partial payments + receipts** | Track M-Pesa references; issue receipts |
| **WhatsApp send + reminders** | Chase overdue politely |
| **Expenses + profit** | Money in vs money out |
| **CSV + JSON backup** | Accountants + disaster recovery |
| **Reports** | VAT approx + client balances |
| **M-Pesa / bank / KRA PIN** | Local rails, not US-only cards |

## Quick start

```bash
npm install
npm run dev
```

## Deploy

Pushes to `master` deploy on Vercel. Manual:

```bash
npm run build
vercel --prod
```

Custom domain: see [docs/CUSTOM_DOMAIN.md](docs/CUSTOM_DOMAIN.md)  
Roadmap: see [docs/ROADMAP.md](docs/ROADMAP.md)

## Cloud auth (honest status)

**Now:** multi-account email/password workspaces stored in the browser (like a strong offline Wave prototype). Share links work **globally** without login.

**Next:** Supabase Auth + Postgres for true multi-device cloud (phone + laptop). Documented in roadmap.

## License

Build your business. Keep a commercial hosted version.
