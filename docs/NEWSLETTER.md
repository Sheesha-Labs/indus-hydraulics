# Newsletter — how it works and how to run it

The site's own newsletter, built in four phases in November 2026
(`docs/newsletter-plan.md` has the plan and, in Appendices C–F, what was
built). This page is the operating manual: for staff who write and send, and
for whoever maintains it.

Admin: **Content → Newsletter** (`/admin/newsletter`).

---

## Who can do what

| Role | Can |
|---|---|
| super_admin, manager | Everything below, plus **send, schedule, cancel**, upload lists, export, delete lists, change the sender. |
| cms_editor | Write newsletters and templates, see subscribers and lists, add one address to a list, unsubscribe someone, re-send confirmations, send themselves a test. |
| Everyone else | Nothing in this section. |

Writing a newsletter never lets someone mail everyone: sending is a separate
permission (`ROLES.NEWSLETTER_SEND`).

## Who gets newsletters

- **Subscribers** — people who entered their address on the site *and clicked
  the link in the confirmation email*. Until they click they are "awaiting
  confirmation" and get nothing but that one email (and a reminder if staff
  re-send it).
- **Lists** — addresses staff upload or add by hand, for people who agreed to
  hear from Indus some other way (an exhibition stand, an existing customer
  relationship). **Only upload people who agreed.** Every upload records who
  uploaded it, when, and the consent statement they ticked.
- **Never** anyone on the **suppression** list: everyone who unsubscribed,
  whose address bounced permanently, or who marked a newsletter as spam —
  from the newsletter or any list. Suppression is permanent and covers every
  list; a new upload cannot bring such an address back. Only the person
  themselves can, by subscribing again on the site and confirming.

Each address gets one copy even if it is a subscriber and on two lists.

## Writing one

1. **Newsletters → New newsletter**: pick a layout. The layouts that feature
   products, categories, articles or industries fill themselves with the
   latest published ones; swap them in the designer.
2. **Subject** and **preview text** (the grey line inboxes show after the
   subject).
3. **Who receives it**: all confirmed subscribers, and/or lists. The panel
   shows how many people that is right now.
4. **Content**: *Blocks* (the designer — add, reorder, duplicate, delete
   blocks; each opens to edit its text, links, pictures and colours) or *Rich
   text* (a plain editor). Pictures come from the media library; give each a
   description (alt text).
5. The **preview** is the real email as the server renders it. Switch
   desktop/phone, and the footer for a subscriber or a list contact.
6. **Before it goes** lists anything that stops it being sent: no subject,
   template text left in `[brackets]`, a link an email can't follow, a
   featured product that is no longer published, no audience.
7. **Send me a test** sends one copy to your own address, `[Test]` in the
   subject, unsubscribe link disabled.

Everything autosaves. **Save as template** keeps the design for next time.

Every email ends with the company's legal name, address, why the reader is
getting it, and an unsubscribe link. No design can remove it.

## Sending one

Needs a manager or super admin.

- **Pace**: how many emails an hour. Start at **300 an hour** for the first
  sends (see Warm-up), then raise it.
- **Rehearsal**: tick it to run the whole send — snapshot, batches, report —
  without emailing anyone. Use it before the first real send to any big list.
- **Send now**, or pick a time and **Schedule** (5 minutes to 60 days ahead;
  your local time). A scheduled newsletter can still be edited — what goes is
  what is saved when the time comes. **Unschedule** turns it back into a
  draft.
- While it sends, the report updates every few seconds. **Cancel sending**
  stops it before the next batch of 100; what has gone has gone.

What the report means:

| | |
|---|---|
| Recipients | The snapshot taken when sending started. |
| Sent | Accepted by Resend. |
| Delivered | The receiving server took it (from Resend, a minute or so later). |
| Bounced | Permanently undeliverable — the address is now suppressed everywhere. |
| Complaints | The reader marked it as spam — suppressed everywhere, and a warning sign (below). |
| Failed | Resend refused the batch three times, or the send was interrupted mid-batch. Failed emails are **not** retried automatically, so nobody gets two copies. |
| Skipped | The person unsubscribed or bounced after sending started, or the send was cancelled. |

## Warm-up (first weeks)

The newsletter sends from `newsletter@news.indushydraulics.com`, a
subdomain kept apart from the domain quotes and RFQs use, so a newsletter
problem can't push quote emails into spam. A new sending domain still has no
reputation:

1. First real send: staff and a handful of friendly customers. Pace 300.
2. Then lists of people who know Indus well, a few hundred at a time, over
   2–3 weeks. Watch complaints and bounces on each report.
3. Only then everyone, at a higher pace.

**Resend plan**: the account is on the free plan — **100 emails a day in
total, shared with quote and RFQ email**. Move it to Pro before any send to
more than about 100 people, or quote emails will stop for the rest of the
day. The send panel warns when the audience is over 100.

## If complaints or bounces spike

- More than about **1 complaint per 1,000** or **5% bounces** on a send:
  stop (Cancel sending if it is still going). The people concerned are
  already suppressed.
- A bounce spike means a list was stale or not opted in: delete it.
- A complaint spike means people didn't expect it: check how that list was
  collected; tighten what is uploaded.
- Check **Resend → Domains** that `news.indushydraulics.com` is still
  verified (the Sender page shows it too).

## Subscribers, lists and suppressions

- **Subscribers**: filter by status, search, date range; export to CSV;
  re-send a confirmation to someone who never clicked (at most once a day
  each, 50 at a time); unsubscribe someone who asked by phone or email.
- **Lists**: create, upload CSV or Excel (pick the email and name columns if
  they aren't guessed), add one address, export, delete. Removing an address
  from a list does *not* unsubscribe it; **Unsubscribe** does, everywhere.
- **Suppressions**: only a one-way fingerprint of each address is stored, so
  the page shows counts and lets you check one address at a time.

## For whoever maintains it

| Piece | Where |
|---|---|
| Signup, confirm, unsubscribe, webhook | `apps/web/src/lib/newsletter/service.ts`, `actions/newsletter.ts`, `app/(storefront)/newsletter/*`, `app/api/newsletter/unsubscribe`, `app/api/webhooks/resend` |
| Admin data (subscribers, lists, imports) | `lib/newsletter/admin.ts`, `lists.ts`, `spreadsheet.ts`, `app/admin/(shell)/newsletter/actions.ts` |
| Composer, rendering, gate | `lib/newsletter/blocks/*`, `campaign.ts`, `campaigns.ts`, `records.ts`, `starters.ts`, `campaign-actions.ts`, `components/admin/newsletter/*` |
| Sending | `lib/newsletter/send.ts`, `inngest/newsletterSend.ts` (`newsletter.campaign.send`) |
| Schema | migrations `202611081838`, `…1839`, `202611091422`, `…1444`, `…1458`; DB tests `packages/db/scripts/test-newsletter-*.sql` |

- **Resend webhook** (account-wide — the account also sends for another
  site, so the route ignores events not from `indushydraulics.com`):
  `POST /api/webhooks/resend`, secret `RESEND_WEBHOOK_SECRET`.
- **Inngest**: after any deploy that adds or renames a function,
  `PUT https://indushydraulics.com/api/inngest`.
- Campaign emails are **not** written to `sent_emails`;
  `newsletter_deliveries` is their record.
- Suppression hashes: `newsletter_email_hash()` in SQL must equal
  `newsletterEmailHash()` in TypeScript (`sha256(lower(trim(email)))`).
