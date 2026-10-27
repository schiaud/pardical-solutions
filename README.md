# Pardical — pardical.com

One Next.js 16 app that serves:

| Path | What it is |
|---|---|
| `/` | **pardical.com pitch** for full-service auto recyclers ("Sell more parts, faster"). Includes a founding-yard demo request form. |
| `/brokers` | **Pitch for auto parts brokers**: order desk, shipments and tracking, eBay buyer messages, repricing. Includes a "book a call" form. |
| `/legal/company-profile` | **Company/owner profile for KYC reviewers.** Not linked anywhere; `noindex` meta and an `X-Robots-Tag` header. Share the URL directly. |
| `/y/<slug>` | **A yard's new website and parts store.** Search by year/make/model or VIN, part pages (grade, mileage, donor vehicle, warranty, core, shipping estimate), "request this part", sell-your-car, about/warranty, and website chat that answers from live inventory. On the yard's own domain it's served at `/` (see `src/proxy.ts`). |
| `/admin` | **Yard admin**, run by us (operator) or the yard owner: inventory import, price suggestions + approval, channels (Google / Meta / eBay feeds + Facebook Marketplace posting kit), leads, settings. |

## Run it

```bash
npm install
npm run dev -- -p 3471
```

Then open:
- http://localhost:3471: the pitch page
- http://localhost:3471/y/demo: the demo yard site
- http://localhost:3471/admin/demo: the demo yard admin (yard `demo`, password `demo`)
- http://localhost:3471/admin: operator view of every yard plus demo requests from both pitch pages (password `pardical` locally, `ADMIN_PASSWORD` in production)

**To put it on pardical.com, follow [DEPLOY.md](DEPLOY.md).** It covers the Docker image, Render blueprint (or Railway), and the two DNS records to change.

The database is a single SQLite file at `data/app.db`, created and seeded with the demo yard on first request. Delete it to reset the demo. Try importing `data/sample-import.csv` from the Inventory page to see the column auto-mapping.

## Settings (environment)

| Var | Needed | What |
|---|---|---|
| `SESSION_SECRET` | prod | 16+ chars; signs admin sessions |
| `ADMIN_PASSWORD` | prod | operator password |
| `DATABASE_PATH` | optional | SQLite file location (use a persistent volume when hosted) |
| `APP_HOSTS` | optional | comma list of Pardical's own hostnames; any other host is looked up as a yard's custom domain |
| `SITE_URL` | optional | canonical URL for share images, sitemap and robots (default `https://pardical.com`) |
| `LEAD_WEBHOOK_URL` | optional | Discord or Slack incoming webhook: a message for every demo request and yard lead (not demo-yard tests) |
| `ANTHROPIC_API_KEY` | optional | turns on Claude-written chat replies (`claude-opus-5-5`, low effort; override with `CHAT_MODEL`). Without it, chat uses rules-based answers from the same inventory. |
| `PRICING_API_URL`, `PRICING_API_PHONE` | optional | the existing Pardical pricing tool and the contact phone it requires. Together they enable "live market check" (car-part.com + eBay comps). Off by default. |
| `KYC_OWNER_NAME`, `KYC_EMAIL`, `KYC_PHONE`, `KYC_ADDRESS` | for the profile | details shown on `/legal/company-profile` (kept out of the repo). Separate address lines with a vertical bar. |

## How the pieces work

- **Inventory import** (`src/lib/csv.ts`): reads CSV/TSV exports from Powerlink, Checkmate, Pinnacle or a spreadsheet. Header names are matched automatically ("Stock #", "Tag", "Hollander Interchange", "Cond", "Odometer", "Retail Price"…). Rows are upserted by stock #. With "whole inventory" checked, anything missing from the file is marked sold, which removes it from the site and every feed.
- **Prices** (`src/lib/pricing.ts`): parts with no price get an offline estimate (part type × vehicle age × grade × mileage). A live market check uses the pricing tool. Nothing goes live until the owner approves it.
- **Shipping estimates** (`src/lib/shipping.ts`): part type goes to a size class, then to cost ranges from Pardical's own 2,817 shipped used-part labels (`data/shipping_*.json`, copied from the pricing tool). Engines, transmissions and bumpers get freight or oversize ranges, with free pickup.
- **Channels** (`src/lib/channels.ts`):
  - `/feeds/<slug>/google.tsv` is for Google Merchant Center free listings (condition=used).
  - `/feeds/<slug>/meta.csv` is a Meta catalog feed for catalog ads, the compliant automated route onto Facebook.
  - `/feeds/<slug>/ebay.csv` is an eBay/Sellersperch import file.
  - The **Facebook Marketplace kit** writes about 10 copy-ready listings a day, big local-pickup parts first, for a person to post. Meta allows no automated Marketplace posting in the US.
  - Blocked parts stay off the feeds: catalytic converters, airbags and emissions parts stay off Facebook, and airbags stay off eBay and Google.
- **Placeholder photos** (`/y/<slug>/parts/<id>/image`): a generated PNG card is used until the yard's real photos come in through the import (image URL column).

## Public-facing safeguards
- **Demo yard** (`/y/demo`): it has a "Demo yard" banner, `noindex`, and its form replies say no real yard will call.
- **Demo admin login** (`demo`/`demo`) is read-only. Visitors' contact details and chat text are hidden from it. The operator login sees everything.
- **Spam protection:** every public form has a hidden honeypot field and per-IP rate limits. Sign-in allows 10 tries per 10 minutes. Chat allows 12 messages a minute and 150 a day per IP.
- **Security headers** (nosniff, frame, referrer, HSTS). `/admin` and `/api/` are disallowed in `robots.txt`.
- **Demo photos** are real Creative Commons photos, credited on each part page.

## Not in this MVP (next)
- Online payment. Part requests become leads, and the yard texts a payment link.
- AI phone agent (reuse Receptionship).
- eBay desk autopilot (buyer messages, cases, tracking).
- Sourcing agent.
- Live eBay listing through Sellersperch's API.
- Hosting/DNS setup for yard domains.

## Market pricing
`PRICING_API_URL` connects the existing Pardical pricing tool for live market checks. It's off by default, and the app adds no scraping of its own.
