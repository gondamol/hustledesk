# HustleDesk cloud setup (all 4 features)

This enables:

1. **Supabase cloud auth + multi-device sync**
2. **Short share URLs** (`/s/abc123`)
3. **M-Pesa Daraja STK** for Pro (KSh 799)
4. **Email invoices** via Resend

## 1. Supabase

1. Create a project at https://supabase.com  
2. **SQL Editor** → paste & run `supabase/schema.sql`  
3. **Authentication → Providers → Email** enabled  
4. Copy:
   - Project URL → `VITE_SUPABASE_URL` + `SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server only**)

Optional: disable “Confirm email” under Auth settings while testing.

## 2. Vercel environment variables

Project → Settings → Environment Variables → add:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app

MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=174379
PRO_PRICE_KES=799

RESEND_API_KEY=
EMAIL_FROM=HustleDesk <onboarding@resend.dev>
```

Redeploy after saving.

## 3. M-Pesa Daraja (Safaricom)

1. Register at https://developer.safaricom.co.ke  
2. Create an app → get Consumer Key / Secret  
3. Use **Lipa Na M-Pesa Online** sandbox passkey & shortcode  
4. Callback URL (auto): `{PUBLIC_APP_URL}/api/mpesa/callback`  
5. For production: switch `MPESA_ENV=production` and use live shortcode/passkey  

**Sandbox testing:** use Safaricom’s test MSISDNs from the docs.

Flow:

1. User logs in (cloud)  
2. Pricing → enters phone → STK prompt  
3. Callback marks `subscriptions.plan = pro`  
4. App polls status and unlocks Pro  

## 4. Resend email

1. Create account at https://resend.com  
2. API key → `RESEND_API_KEY`  
3. Start with `EMAIL_FROM=HustleDesk <onboarding@resend.dev>`  
4. Later: verify your domain for production From addresses  

Invoice → **Email** button sends HTML + share link.

## 5. Verify

```bash
curl https://YOUR_DOMAIN/api/health
```

Expect:

```json
{
  "ok": true,
  "features": { "supabase": true, "mpesa": true, "email": true }
}
```

## Local development

```bash
cp .env.example .env
# fill VITE_ values for frontend cloud auth
npm run dev
```

API routes run on Vercel; for full local API testing use `vercel dev`.

## Fallbacks (no keys)

| Feature | Without keys |
|--------|----------------|
| Auth | Local multi-account (browser) |
| Shares | Long compressed URL tokens |
| Pro | Demo unlock button |
| Email | Error with setup hint |

App always stays usable offline-first.
