# Custom domain for HustleDesk

Your production app is on Vercel: `https://hustledesk-khaki.vercel.app`

## Steps

1. **Buy a domain**  
   Examples: `hustledesk.ke`, `pay.yourbusiness.co.ke`, `invoices.yourbrand.com`

2. **Open Vercel domains**  
   Project → Settings → Domains → Add  
   https://vercel.com/aurel123/hustledesk/settings/domains

3. **DNS at your registrar**  
   Vercel will show records (often):
   - Apex (`example.com`): A record → `76.76.21.21`
   - `www` or `app`: CNAME → `cname.vercel-dns.com`

4. **Wait for SSL**  
   Usually minutes; can take up to 48h for DNS propagation.

5. **Optional**  
   Set the custom domain as **Production** primary in Vercel.

## Branding tip

Use `app.yourbusiness.co.ke` if you white-label HustleDesk for accountants/SMEs.
