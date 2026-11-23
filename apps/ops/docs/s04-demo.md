# S04 demo · mailboxes, Gmail sync and the send queue

What the Owner clicks to show S04 working in production, with the checks behind each step. Run it after the S04
migrations are applied, the env in `docs/gmail-setup.md` is set, and both mailboxes are connected. No real client
or supplier is written to: every send goes to an internal address on the test list.

Before you start: Settings › Sending › **Test email addresses** holds one internal address (yours). Use a SQL
console on the production database (read-only queries only).

## 1. Both mailboxes are live

Settings › Mailboxes shows sales@ (role Client) and purchase@ (role Supplier) as **Live · last message … ago**,
"Daily · Google notifications renew daily — automatic", and the backfill line ("Done · … messages · …" or a
percentage with a live ETA).

```sql
select address, status, "lastSuccessfulSyncAt", "watchExpiresAt", "lagSeconds"
  from ops.mailbox m join ops.mailbox_sync_state s on s."mailboxId" = m.id;
```

## 2. New mail arrives within a minute

From your personal address, send a short email to purchase@. Within a minute the purchase@ card's "messages read
today" goes up by one.

```sql
select count(*) from ops.mail_message where "receivedAt" > now() - interval '2 minutes';   -- 1
```

## 3. A missed push is caught by the safety poll

Switch the push subscription to pull, send another email, wait up to 10 minutes; `ops.gmail.poll` stores it.

```bash
gcloud pubsub subscriptions modify-push-config gmail-push-ops --push-endpoint=""
# send the email, wait, run the SQL from step 2 (with interval '12 minutes')
gcloud pubsub subscriptions modify-push-config gmail-push-ops \
  --push-endpoint=https://operations.indushydraulics.com/api/gmail/push \
  --push-auth-service-account=gmail-push-invoker@indus-operations.iam.gserviceaccount.com \
  --push-auth-token-audience=https://operations.indushydraulics.com/api/gmail/push
```

## 4. A test send, held and undone

On the purchase@ card: **⋯ › Send a test email…** (Owner only). Choose your address and "Reply in the latest
thread with this address". The toast reads **Undo 4:59**. Click **Undo**.

```sql
select status, "undoUntil", "claimedAt" from ops.outbound_email order by "createdAt" desc limit 1;   -- cancelled, never claimed
```

## 5. A test send that goes

Send the test again and leave it. After the hold (5 minutes) and inside the send window it arrives in the same
Gmail thread with a single "Re:", and it is in purchase@ Sent.

```sql
select status, "gmailMessageId", "rfcMessageId", "sentAt" from ops.outbound_email order by "createdAt" desc limit 1;   -- sent
select "sentToday", "sentTodayDate" from ops.mailbox_sync_state s join ops.mailbox m on m.id = s."mailboxId"
 where m.address like 'purchase@%';
```

## 6. Disconnect and reconnect

Disconnect purchase@ (**Keep what was imported**, type the address). The receipt shows the counts and "Google
access revoked at …". Queue another test send from the purchase@ card: it waits ("Waiting for purchase@") and is
never sent from sales@. Reconnect purchase@ through the connect flow: sync resumes from the stored history
position, and the waiting send is re-gated and goes after its hold.

```sql
select status, "disconnectedAt" from ops.mailbox where address like 'purchase@%';
select "historyId" from ops.mailbox_sync_state s join ops.mailbox m on m.id = s."mailboxId" where m.address like 'purchase@%';   -- unchanged across the disconnect
select status, "holdReason" from ops.outbound_email order by "createdAt" desc limit 1;   -- waiting_for_mailbox, then sent
```

## 7. The guards

Show the CI run where `gmail-allowlist.test.ts` and `no-resend.test.ts` passed, and the Inngest billing page with
the confirmed concurrency (see `docs/infra-decisions.md`).
