# LakeShore Legends — after-launch checklist

## 1. Family emails (≈15 minutes, free)
Until this is done, confirmations and reminders show as "not sent" in the dashboard.

- [ ] Create a free account at **resend.com** (sign up with lakeshorelegendsbasketball@gmail.com).
- [ ] In Resend → **Domains → Add domain** → `lakeshorelegendsbasketball.com`.
- [ ] Resend shows a few DNS records (TXT / MX). Add each one at **GoDaddy → My Products → lakeshorelegendsbasketball.com → DNS → Add record**, copying Type, Name, and Value exactly.
- [ ] Back in Resend, click **Verify** (can take a few minutes to an hour).
- [ ] Resend → **API Keys → Create API key** → copy it.
- [ ] Ask Claude to finish setup: it saves the key on the server (you run one Terminal command with `Get-Clipboard`), sets the "from" address, and sends test emails **only to you** first.
- [ ] After the test emails look right, ask Claude to switch emails to **live** so families receive them.
- [ ] Dashboard → **Settings → Notifications**: fill in **Reply-to email** and **Coach alert email**, then Save.

## 2. Stripe post-payment page (≈5 minutes)
Sends families back to your site after they pay instead of Stripe's generic "Thanks" page.

Stripe (live mode, **not** Sandbox) → **Payment Links** → for **each** of the 4 links:
- [ ] 60 Minute Private Training
- [ ] 60 Minute 2-on-1 Training
- [ ] 60 Minute 3-on-1 Training
- [ ] 60 Minute 4+ Player Training

For each: open it → **Edit** → **After payment** → **Don't show confirmation page** → redirect to
`https://www.lakeshorelegendsbasketball.com/training.html` → **Update link**.
(The link address itself doesn't change, so nothing in the dashboard needs updating.)

## Also still open
- [ ] Add openings in the dashboard (**Availability** → Recurring / Bulk add).
- [ ] Delete the old bin or regenerate the key at **jsonbin.io** (the old key is still in GitHub history).
- [ ] Watch the first real booking turn **Confirmed + Paid** on its own.
