# Putting Pardical on pardical.com

The app is one Docker service with a small persistent disk (the SQLite database lives at `/data/app.db`).

**Where pardical.com stands today** (checked 2026-10-27):
- DNS is hosted on **Google Cloud DNS** (nameservers `ns-cloud-b*.googledomains.com`).
- The site points at the old **Shopify** store:
  - `pardical.com` → A `23.227.38.32`
  - `www.pardical.com` → CNAME `pardical.myshopify.com`
- **Google Workspace email** (MX, SPF, DKIM) is on the same domain, along with `app.pardical.com` (Vercel) and `api.pardical.com` (EC2). Those must not change.

Google Cloud DNS has no ALIAS / CNAME-flattening at the root domain, so pick a host that gives the root domain an A record. **Render does**, so only two DNS records change. Railway needs the DNS moved to Cloudflare first (see the alternative at the bottom).

## 1. Push the code
```bash
git push -u origin recycler-mvp
```
Deploy from the `recycler-mvp` branch, or merge it into `main` first.

## 2. Create the service on Render (recommended)
1. Go to render.com and choose **New → Blueprint**. Connect the GitHub repo `schiaud/pardical-solutions` and pick the branch. Render reads `render.yaml`, which creates:
   - web service `pardical-web` (Docker, Starter plan)
   - a 1 GB disk at `/data`
   - health check at `/api/health`
   - custom domains `pardical.com` + `www.pardical.com`
2. When Render asks for the secret values:
   - `ADMIN_PASSWORD`: a long, unique password. It signs you in at `/admin`.
   - `LEAD_WEBHOOK_URL` (optional): a Discord or Slack incoming-webhook URL. You get a message for every demo request and yard lead.
   - `ANTHROPIC_API_KEY` (optional): Claude-written chat replies. Without it the chat still answers from inventory.
   - `KYC_OWNER_NAME`, `KYC_EMAIL`, `KYC_PHONE`, `KYC_ADDRESS`: your details for the company profile page. They're deliberately not in the repo, because the repo is public. Separate address lines with `|`. Until all four are set, the profile page shows "not found".

   `SESSION_SECRET` is generated automatically. `SITE_URL` and `APP_HOSTS` are already set.
3. Wait for the first deploy, then open the `…onrender.com` URL Render shows. Check `/api/health` returns `{"ok":true}`.

## 3. Point the domain at Render (Google Cloud DNS)
In Google Cloud Console → **Network services → Cloud DNS** → the `pardical.com` zone, change **only these two records**:

| Name | Type | Change to |
|---|---|---|
| `pardical.com.` | A | `216.24.57.1` (Render's load balancer; use the value Render shows on the service's Custom Domains page if it differs). Delete the Shopify value `23.227.38.32`. |
| `www.pardical.com.` | CNAME | `pardical-web.onrender.com.` (the exact `…onrender.com` host Render shows). Replaces `pardical.myshopify.com.` |

- Delete any **AAAA** record on `pardical.com` or `www` (Render is IPv4 only).
- Leave everything else alone: **MX**, the `v=spf1` TXT, `google._domainkey`, `app`, `api`.

Then on Render → the service → **Settings → Custom Domains**, click **Verify** for both. Certificates are issued automatically once DNS propagates (minutes to a few hours). In Shopify, you can remove `pardical.com` from Online Store → Domains afterwards so it stops trying to renew a certificate.

## 4. Check it's live
- `https://pardical.com`: the recycler pitch. `https://pardical.com/brokers`: the broker pitch.
- `https://pardical.com/y/demo`: the demo yard. It has a "Demo yard" banner and is hidden from search engines.
- `https://pardical.com/admin`: sign in with `ADMIN_PASSWORD`.
- `https://pardical.com/admin/demo`: public demo admin (password `demo`). It's read-only, and visitors' details are hidden.
- `https://pardical.com/legal/company-profile`: the KYC profile, filled from the `KYC_*` settings. Not linked anywhere, not indexed. Give the URL directly to reviewers.
- Submit the "Book a demo" form once, and check it appears at `/admin` (and in Discord/Slack if the webhook is set).
- Make sure **hello@pardical.com** receives mail. It's the contact address on the site, privacy policy and terms. Add it as a Google Workspace alias or group if it doesn't exist yet.

## 5. Onboarding a yard later
1. Go to `/admin` → **Add a yard** (name + web name).
2. **Settings:** fill in the yard's info and set an owner password.
3. **Inventory:** import their export.
4. **Prices:** run price research and approve.
5. **Their domain:**
   - In Render → Custom Domains, add `theiryard.com` and `www.theiryard.com`.
   - At their DNS, set the same A/CNAME records as above.
   - In the yard's Settings, enter the domain.

   Any hostname that isn't in `APP_HOSTS` is looked up as a yard's domain automatically.

## Backups
The database is one file on the Render disk (`/data/app.db`). Render takes daily disk snapshots on paid plans. For an extra copy, run this from the Render shell (the image has Node, not the sqlite3 tool):
```bash
node -e "new (require('node:sqlite').DatabaseSync)('/data/app.db').exec(\"VACUUM INTO '/data/backup-$(date +%F).db'\")"
```

## Alternative: Railway
`railway.toml` is included. Railway can't take an A record at the root domain, so:
1. Move the pardical.com DNS to **Cloudflare** (free). Copy every record above, especially MX, SPF and `google._domainkey`.
2. In Railway, create a service from the repo (it reads `railway.toml`), add a **Volume** mounted at `/data`, and set the same environment variables as `.env.example`.
3. Add custom domains `pardical.com` and `www.pardical.com`. Create the CNAME + TXT records Railway shows in Cloudflare; the root works through CNAME flattening.

Keep **one** replica on any host: the SQLite file can't be shared between instances.
