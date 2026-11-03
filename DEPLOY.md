# Running Pardical on pardical.com

The site runs on **Vercel** (Pardical team, project `pardical-solutions`) with a **Turso** database (`pardical-web`, free Starter plan, connected through Vercel's Storage tab).

## Ship an update
```bash
npm run build
vercel deploy --prod
```
That's the whole process. The project isn't linked to GitHub, so pushing doesn't deploy anything. `.vercelignore` keeps local data, secrets and internal notes out of the upload.

To undo a bad deploy:
```bash
vercel rollback
```

To check a change first without touching the live site, run `vercel deploy` with no `--prod`. It gives you a private preview address that only people signed in to the Vercel team can open. Previews use the **same database** as the live site.

## Settings
On Vercel under Project → Settings → Environment Variables. `.env.example` explains each one.

| Setting | Notes |
|---|---|
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Added by the Turso connection. |
| `SESSION_SECRET`, `ADMIN_PASSWORD` | Random values, saved in `.env.vercel-secrets` on Dave's machine (git-ignored, never uploaded). To change the password, update it on Vercel and redeploy. |
| `SITE_URL`, `APP_HOSTS` | `https://pardical.com`, and Pardical's own hostnames. |
| `KYC_OWNER_NAME`, `KYC_EMAIL`, `KYC_PHONE`, `KYC_ADDRESS` | The company profile page. Deliberately not in the repo, because the repo is public. Separate address lines with `\|`. Until all four are set, the page shows "not found". |
| `LEAD_WEBHOOK_URL` (optional) | Discord or Slack incoming webhook. You get a message for every demo request and yard lead. |
| `ANTHROPIC_API_KEY` (optional) | Claude-written chat replies. Without it, chat answers from inventory with plain rules. |

## The domain
`pardical.com` DNS is managed in **Squarespace Domains** (nameservers `ns-cloud-b*.googledomains.com`). Only two records point at this site:

| Host | Type | Value |
|---|---|---|
| `@` | A | `@@APEX@@` |
| `www` | CNAME | `@@WWW@@` |

Everything else on the domain is separate and must stay as it is: Google Workspace email (MX, SPF, `google._domainkey`), `app` (pricing tool, Vercel), `solutions` (this same site), `api`, `employee`, and the verification records.

### Shopify
The pricing tool at `app.pardical.com` still checks out through the Shopify store, using `pardical.com` links (`/cart`, `/products`, `/policies`, `/pages`…). `src/proxy.ts` forwards those paths to `pardical.myshopify.com`. This only works while `pardical.com` is **not** a domain on the Shopify store (Settings → Domains), otherwise Shopify sends them straight back and they loop.

## What to check after a deploy
- `/` the recycler pitch, `/brokers` the broker pitch.
- `/y/demo` the demo yard. It has a "Demo yard" banner and is hidden from search engines.
- `/admin` sign in with `ADMIN_PASSWORD`. `/admin/demo` is the public demo admin (password `demo`): read-only, visitors' details hidden.
- `/legal/company-profile` the KYC profile. Not linked anywhere and not indexed. Give the URL directly to reviewers.
- `/api/health` returns `{"ok":true}` when the site can reach its database.

## Onboarding a yard
1. Go to `/admin` → **Add a yard** (name + web name).
2. **Settings:** fill in the yard's info and set an owner password.
3. **Inventory:** import their export.
4. **Prices:** run price research and approve.
5. **Their domain:**
   - In Vercel → Project → Settings → Domains, add `theiryard.com` and `www.theiryard.com`. Vercel shows the exact records.
   - Set those records at their DNS.
   - In the yard's Settings, enter the domain.

   Any hostname that isn't in `APP_HOSTS` is looked up as a yard's domain automatically.

## Limits to know about
- **Inventory uploads:** Vercel accepts about 4.5 MB per request, so the import form stops at 4 MB with a clear message. For a bigger export, split it into smaller files and untick "whole inventory", otherwise each file would mark the parts in the other files as sold.
- **Rate limits** on public forms and chat are counted per server instance, so they're a speed bump for bots rather than an exact count.
- **Cost:** hosting comes out of the existing Vercel Pro plan's included usage. Turso's Starter plan is free up to 5 GB, 500M row reads and 10M row writes a month.

## Backups
Turso keeps the data on its side. For an extra copy, use the Turso Cloud dashboard (Vercel → Storage → `pardical-web` → Open in Turso Cloud), or the Turso command-line tool: `turso db shell pardical-web .dump > backup.sql`.

## Running locally
Without the `TURSO_*` settings, the app uses a SQLite file at `data/app.db`, which is created and filled with the demo yard on first use. See the README.
