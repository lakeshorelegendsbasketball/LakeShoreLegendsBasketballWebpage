# LakeShore Legends — after-launch checklist

## 1. Add openings (planned for Oct 6)
Until then the booking page shows no dates; families can still use **Request Training**.

- [ ] Open https://www.lakeshorelegendsbasketball.com/coach-admin.html and check there's **no orange "Test server" badge** next to your name.
- [ ] Go to **Availability** and add openings. **Recurring** fills several weeks at once; **Bulk add** fills one day with back-to-back sessions.
- [ ] Open the booking page (training.html) and confirm the dates show up.

## 2. Family emails — LIVE (9/29)
Resend verified; DNS now on Cloudflare; emails send from bookings@lakeshorelegendsbasketball.com to families.
- [ ] In the dashboard, go to **Settings → Notifications**, fill in **Reply-to email** (where family replies go) and **Coach alert email**, and click **Save**.

## 3. First real booking
- [ ] After a family pays, the booking turns **Confirmed + Paid** on its own and they land back on your training page. If it stays "Awaiting payment", ask Claude to check the server log.
- [ ] For a group session, the booking shows "1 of N athletes paid" until every family has paid with the shared link (tick **Paid** by hand for cash or Venmo).

## Done
- [x] Stripe post-payment page: new live Payment Links send families back to training.html (9/28).
- [x] Group sessions priced per athlete; each family pays its own share (9/28).
- [x] Old JSONbin data deleted / key no longer works.
- [x] Old bookings imported (marked Paid).
- [x] Old Payment Links (…Jq00–Jq03) deactivated in Stripe (9/28).
