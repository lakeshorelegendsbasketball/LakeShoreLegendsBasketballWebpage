# Booking API — setup & deployment

The site (`docs/`) stays on GitHub Pages. Bookings, payments, coach logins, and
settings live in this Cloudflare Worker + D1 database. Secrets are stored only
as Worker secrets — never in the site's JavaScript.

## One-time setup (≈20 minutes)

Run these from the `api/` folder.

1. **Sign in to Cloudflare** (opens a browser):
   `npx wrangler login`
2. **Create the database** and copy the `database_id` it prints into
   `wrangler.toml` (replace `REPLACE_WITH_ID_FROM_wrangler_d1_create`):
   `npx wrangler d1 create lsl-booking`
3. **Create tables**: `npm run migrate:remote`
4. **Set secrets** (each command prompts for the value):
   - `npx wrangler secret put SETUP_TOKEN` — any long random phrase; used once to create your director login.
   - `npx wrangler secret put STRIPE_WEBHOOK_SECRET` — from step 7.
   - Optional: `npx wrangler secret put STRIPE_SECRET_KEY` — a **restricted** key with read access to *Payment Links* and *Prices* only (shows live prices in the dashboard).
   - Optional: `npx wrangler secret put RESEND_API_KEY` — enables family emails (see step 8).
5. **Deploy**: `npm run deploy`. Note the URL it prints
   (e.g. `https://lsl-booking-api.<your-subdomain>.workers.dev`).
   Put it in `wrangler.toml` as `API_PUBLIC_URL` and redeploy.
6. **Point the site at the API**: set `PRODUCTION_API` in `docs/js/config.js`
   to that URL, commit, and push.
7. **Stripe webhook**: Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `<API URL>/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`
   - Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.
   Do this in **test mode first** with test Payment Links, then repeat in live mode.
8. **Email (optional but recommended)**: create a Resend account, verify the
   domain `lakeshorelegendsbasketball.com` (adds DNS records at GoDaddy), then
   set `EMAIL_FROM` in `wrangler.toml` (e.g. `bookings@lakeshorelegendsbasketball.com`).
   Keep `EMAIL_MODE = "redirect"` with `EMAIL_REDIRECT_TO` = your own address
   while testing — every email goes to you. Switch to `EMAIL_MODE = "live"`
   only when you're ready for families to receive them.
9. **Create your director login**: open `coach-admin.html`, enter your name,
   email, a password (10+ characters), and the `SETUP_TOKEN`. This only works
   once.
10. **Import the old data**: Dashboard → Settings → *Import from the old
    booking system*. Paste the JSONbin master key, load, then import. Check
    the Bookings tab, then **delete the bin in JSONbin and regenerate the
    master key** (the old key is public in this repo's history).

## How payments are matched

Families keep using your existing Stripe Payment Links. When a family reserves,
the API holds the time (default 30 minutes) and sends them to the link with
`?client_reference_id=<booking id>`. Stripe returns that id on the Checkout
Session, and the webhook marks that exact booking paid. Nothing is marked paid
from the browser. In each Payment Link's settings you can set the
confirmation page to redirect back to the site.

## Local development

```
npm install
npm run migrate:local
npm run dev          # API on http://localhost:8787
npm test             # end-to-end tests (fake data, no emails, no Stripe)
```
The site uses the local API automatically when opened from `localhost`
(serve `docs/` on port 8080). Rebuild the site's JSX with `npm run build`
from the repo root after editing `docs/js/*.jsx`.
