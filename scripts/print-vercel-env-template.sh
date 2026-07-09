#!/usr/bin/env bash
# Prints the env vars to paste into Vercel after you fill values.
cat <<'EOF'
# Paste into Vercel → hustledesk → Settings → Environment Variables
# Then Redeploy.

# --- Required for cloud auth + short share links ---
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon...
VITE_PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
PUBLIC_APP_URL=https://hustledesk-khaki.vercel.app

# --- Optional: email invoices ---
RESEND_API_KEY=re_...
EMAIL_FROM=HustleDesk <onboarding@resend.dev>

# --- Optional: M-Pesa STK Pro billing ---
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=174379
PRO_PRICE_KES=799
EOF
