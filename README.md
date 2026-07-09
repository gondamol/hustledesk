# HustleDesk

**Kenya-first money desk for SMEs & freelancers**  
Quotes → invoices → short share links → M-Pesa → receipts → email → reports.

| | |
|--|--|
| **Live** | https://hustledesk-khaki.vercel.app |
| **GitHub** | https://github.com/gondamol/hustledesk |
| **Cloud setup** | [docs/CLOUD_SETUP.md](docs/CLOUD_SETUP.md) |

## Features

### Product
- Business accounts, logo, brand colour
- Itemized quotes & invoices (qty × unit price) + product catalog
- Convert quote → invoice
- Partial payments, payment history, receipts
- Expenses + profit dashboard
- CSV exports + JSON backup
- WhatsApp send + payment reminders

### Cloud infrastructure (configure env)
1. **Supabase auth + multi-device workspace sync**
2. **Short share URLs** `/s/abc123` (stored in Supabase)
3. **M-Pesa Daraja STK** for Pro billing (KSh 799)
4. **Email invoices** via Resend

Without keys, the app still works in **local mode** (demo login, long share tokens, demo Pro unlock).

## Demo (local mode)

- Email: `demo@hustledesk.ke`
- Password: `demo123`

## Quick start

```bash
npm install
cp .env.example .env   # optional cloud keys
npm run dev
```

## API health

```bash
curl https://hustledesk-khaki.vercel.app/api/health
```

## Deploy

```bash
git push origin master   # auto-deploys if Vercel linked
# or
vercel --prod
```

Set env vars in Vercel (see `.env.example` and `docs/CLOUD_SETUP.md`).

## Custom domain

See [docs/CUSTOM_DOMAIN.md](docs/CUSTOM_DOMAIN.md).

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).
