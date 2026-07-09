# Finish HustleDesk setup (step-by-step)

Your app is **already live** and usable in local mode:

- **App:** https://hustledesk-khaki.vercel.app  
- **GitHub:** https://github.com/gondamol/hustledesk  
- **Demo:** `demo@hustledesk.ke` / `demo123`

Cloud auth, short links, M-Pesa STK, and email turn on after the steps below.  
Do them when you have ~30–45 minutes. Order matters: **Supabase → Vercel env → Redeploy → (optional) M-Pesa + Resend**.

---

## Status checklist

| Step | What it unlocks | Done? |
|------|-----------------|-------|
| A. Supabase project + SQL | Multi-device login + short `/s/xxx` links | ☐ |
| B. Vercel env vars + redeploy | Frontend + APIs can talk to Supabase | ☐ |
| C. Test cloud signup | Real accounts on any device | ☐ |
| D. Resend email (optional same day) | Email invoices to clients | ☐ |
| E. M-Pesa Daraja (optional) | Real Pro STK payments | ☐ |
| F. Custom domain (optional) | Your brand URL | ☐ |

Check progress anytime:

```bash
curl https://hustledesk-khaki.vercel.app/api/health
```

You want:

```json
{"ok":true,"features":{"supabase":true,"mpesa":true,"email":true}}
```

---

## A. Create Supabase project + database (required for cloud)

### A1. Create project (website — easiest)

1. Open https://supabase.com/dashboard and sign in (GitHub is fine).
2. Click **New project**.
3. Settings:
   - **Name:** `hustledesk`
   - **Database password:** generate a strong one → **save it in a password manager**
   - **Region:** pick closest (e.g. Frankfurt / London)
4. Wait until the project is **Healthy** (1–2 minutes).

### A1b. Or use Supabase CLI (if you prefer terminal)

In **PowerShell or Ubuntu** (where `supabase` works):

```bash
# Login once (opens browser / asks for access token)
supabase login

# List orgs (note your org id if needed)
supabase orgs list

# Create project (you will be prompted for DB password)
supabase projects create hustledesk --region eu-central-1

# List and copy the project ref (xxxx in xxx.supabase.co)
supabase projects list
```

Access tokens (if `supabase login` fails):  
https://supabase.com/dashboard/account/tokens → **Generate new token** →  

```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
supabase projects list
```

### A2. Run the database schema

1. In Supabase dashboard: open your **hustledesk** project.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open this file from the repo:

   `supabase/schema.sql`

   (or on GitHub: https://github.com/gondamol/hustledesk/blob/master/supabase/schema.sql)

4. **Copy all** of it → paste into SQL Editor → click **Run**.
5. You should see **Success**. Tables created: `workspaces`, `shares`, `subscriptions`, `email_log`.

### A3. Auth settings (important for testing)

1. Supabase → **Authentication** → **Providers** → **Email** = ON.
2. **Authentication** → **Sign In / Providers** or **Settings**:
   - While testing, you can turn **OFF** “Confirm email” so signup logs in immediately.
   - For production, turn confirmation **ON** again later.

### A4. Copy API keys

1. Supabase → **Project Settings** (gear) → **API**.
2. Copy and keep somewhere safe:

| What | Where it goes |
|------|----------------|
| **Project URL** | `https://xxxxx.supabase.co` |
| **anon public** key | long JWT starting with `eyJ...` |
| **service_role** key | another JWT — **never put this in frontend** |

---

## B. Put keys on Vercel + redeploy (required)

1. Open: https://vercel.com/aurel123/hustledesk/settings/environment-variables  
   (or Vercel dashboard → **hustledesk** → **Settings** → **Environment Variables**)

2. Add these for **Production**, **Preview**, and **Development** (or at least Production):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app
```

3. **Save**, then **Deployments** → latest deployment → **⋯** → **Redeploy**  
   (or push any small commit to `master`).

4. After deploy finishes (~30s), run:

```bash
curl https://hustledesk-khaki.vercel.app/api/health
```

`features.supabase` should be **true**.

### Optional: local `.env` for `npm run dev`

```bash
cd /home/gondamol/hustledesk   # or your clone path
cp .env.example .env
# edit .env with the same VITE_ values (and SUPABASE_* if using vercel dev)
npm run dev
```

---

## C. Test cloud signup (5 minutes)

1. Open https://hustledesk-khaki.vercel.app  
2. **Start free** → create a **new** email/password account.  
3. Fill Business settings (logo, M-Pesa Till).  
4. Create a quote or invoice → **Share link**.  
5. Open the link in an **incognito** window — client should see the document.  
6. On another device/browser: **Log in** with the same email → data should still be there (cloud sync).

If signup fails:

- Check Auth email provider is on.
- Check `VITE_SUPABASE_*` were set and you **redeployed** after setting them.
- Open browser console for errors.

---

## D. Email invoices (Resend) — optional but recommended

1. Create account: https://resend.com  
2. **API Keys** → create key → copy `re_...`  
3. For testing, use:

```
RESEND_API_KEY=re_xxxx
EMAIL_FROM=HustleDesk <onboarding@resend.dev>
```

4. Add both to **Vercel env** → redeploy.  
5. Later for production: Resend → **Domains** → verify `yourdomain.com` → change `EMAIL_FROM` to something like `invoices@yourdomain.com`.  
6. Test: open an invoice with a client email → **Email** button.

`curl .../api/health` should show `"email": true`.

---

## E. M-Pesa STK for Pro billing — optional until you charge money

1. Register: https://developer.safaricom.co.ke  
2. Create an app → enable **Lipa Na M-Pesa Online**.  
3. From the portal copy:
   - Consumer Key  
   - Consumer Secret  
   - Passkey (sandbox)  
   - Shortcode (sandbox default often `174379`)  

4. Add to Vercel:

```
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=174379
PRO_PRICE_KES=799
PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app
```

5. Redeploy.  
6. Callback URL is automatic:  
   `https://hustledesk-khaki.vercel.app/api/mpesa/callback`  
7. In app: **log in with cloud account** → **Upgrade** → enter phone → STK.  
8. Use Safaricom **sandbox test numbers** from their docs while in sandbox.

Production later:

```
MPESA_ENV=production
```

Use your live shortcode + live passkey + KYC’d paybill/till.

Until M-Pesa is configured, **Unlock Pro (demo)** still works for demos.

---

## F. Custom domain (optional)

Full guide: [CUSTOM_DOMAIN.md](./CUSTOM_DOMAIN.md)

Short version:

1. Buy domain (e.g. `hustledesk.ke` or `app.yourbrand.co.ke`).  
2. Vercel → hustledesk → **Domains** → Add.  
3. Copy DNS records to your registrar.  
4. Wait for SSL.  
5. Update env:

```
VITE_PUBLIC_APP_URL=https://your-domain.com
PUBLIC_APP_URL=https://your-domain.com
```

6. Redeploy.

---

## Terminal helpers (after you have tokens)

From the project folder:

```bash
# Check what the live API sees
./scripts/check-setup.sh

# If supabase CLI is logged in and linked:
# supabase link --project-ref YOUR_REF
# supabase db push   # only if you use migrations; we used SQL Editor instead
```

---

## What is already finished (no action needed)

- Product UI (quotes, invoices, catalog, expenses, reports, receipts)
- Share links (long tokens work without Supabase; short `/s/` needs Supabase)
- Local multi-account demo mode
- GitHub repo + Vercel production deploy
- API routes: health, shares, mpesa, email
- Schema file + env template

---

## If you get stuck

| Symptom | Fix |
|--------|-----|
| Still local demo only after Supabase | Redeploy after setting `VITE_*` vars |
| Share is long ugly URL | Supabase + service role not set / not redeployed |
| Email button errors | Add Resend keys + redeploy |
| STK “not configured” | Add MPESA_* + PUBLIC_APP_URL + redeploy |
| Cloud login works, data empty on phone | Wait 1–2s after edits; sidebar should show “Cloud · synced” |

---

## Recommended order this weekend

1. **A + B + C** (cloud + short links) — core product  
2. **D** (email) — look professional  
3. **E** (M-Pesa) — when you start charging Pro  
4. **F** (domain) — when branding for customers  

You do **not** need M-Pesa or Resend to start selling setup services and collecting testimonials.
