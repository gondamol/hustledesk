#!/usr/bin/env bash
# Usage: ./scripts/check-setup.sh [base-url]
set -euo pipefail
BASE="${1:-https://hustledesk-khaki.vercel.app}"
BASE="${BASE%/}"

echo "Checking $BASE ..."
echo

echo "1) App home"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
echo "   HTTP $CODE  $BASE/"
echo

echo "2) API health"
HEALTH=$(curl -s "$BASE/api/health" || true)
echo "   $HEALTH"
echo

if command -v python3 >/dev/null 2>&1; then
  python3 - <<PY
import json,sys
raw='''$HEALTH'''
try:
  d=json.loads(raw)
  f=d.get("features",{})
  print("3) Feature flags")
  for k in ("supabase","mpesa","email"):
    ok=bool(f.get(k))
    print(f"   {'✓' if ok else '✗'} {k}: {ok}")
  print()
  if not f.get("supabase"):
    print("Next: create Supabase + set VITE_SUPABASE_* and SUPABASE_* on Vercel (see docs/FINISH_SETUP.md)")
  elif not f.get("email"):
    print("Optional next: add RESEND_API_KEY + EMAIL_FROM")
  elif not f.get("mpesa"):
    print("Optional next: add MPESA_* Daraja keys for real Pro STK")
  else:
    print("All cloud features report as configured. Test signup + share + email + STK in the app.")
except Exception as e:
  print("Could not parse health JSON:", e)
  print("Is the site deployed? Base URL correct?")
PY
else
  echo "Install python3 for parsed feature checklist, or read health JSON above."
fi

echo
echo "Guide: docs/FINISH_SETUP.md"
