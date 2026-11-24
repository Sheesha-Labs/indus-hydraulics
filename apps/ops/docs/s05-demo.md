# S05 demo · the Assistant sorts mail

What the Owner clicks to show S05 working in production, with the checks behind each step. Run it after the S05
migrations are applied, `OPS_ANTHROPIC_API_KEY` is set on the `indus-operations` Vercel project (workspace
"indus-operations", spend limit set in the Anthropic Console) and the deploy is live. Nothing in this script
emails a client or a supplier: every test email goes from your own address to purchase@ or sales@, and every
proposal it makes waits in Review.

Use a SQL console on the production database for the checks (read-only queries only).

## 0. Before: the pipeline is off

`/api/health` (signed in) shows `assistant.pipelineEnabled: false`, `assistant.paused: false`, a budget for the
month and `mailLatency.count: 0`.

```sql
select value from ops.settings_entry where key = 'assistant.mail_pipeline_enabled';   -- {"enabled": false}
select * from ops.assistant_state;                                                     -- pausedAt null
select month, "limitUsd", "spentUsd", "reservedUsd", mode from ops.ai_budget order by month desc limit 1;
select model, "inputPerM", "outputPerM" from ops.ai_model_price order by model;
```

## 1. Switch it on

Settings › Mailboxes › **Let the Assistant sort new mail** → on. A toast says it sorts new mail and what arrived
while it was off, oldest first. Mail that arrived since the S04 deploy is classified in batches of 200.

```sql
select key, "version", "updatedById" from ops.settings_entry where key = 'assistant.mail_pipeline_enabled';
select count(*) filter (where classification = 'unclassified' and confidence is null) as waiting,
       count(*) filter (where classification <> 'unclassified') as sorted
  from ops.mail_message where direction = 'inbound' and origin = 'live';   -- waiting falls to 0
```

## 2. A supplier quote is classified, linked and labelled within two minutes

From your own address send purchase@ a short "quote" ("Please find our price for 10 ball valves, EXW, valid 30
days"). Within two minutes Mail shows it as **Supplier quote** with the Assistant's note, and Gmail shows the
`Indus/…` label on it.

```sql
select m.subject, m.classification, m.confidence, m."handledState", m."labelsApplied",
       extract(epoch from m."firstLabelledAt" - m."receivedAt")::int as seconds
  from ops.mail_message m order by m."receivedAt" desc limit 3;
select "actionKey", state, "levelAtTime", model, "promptVersion", "costUsd"
  from ops.assistant_action where "subjectType" = 'mail_message' order by "createdAt" desc limit 5;
select purpose, model, "inputTokens", "outputTokens", "costUsd", "promptVersion"
  from ops.ai_call order by at desc limit 5;    -- a cost on every call
```

`/api/health` → `mailLatency.p95` under 120 once a few messages have gone through.

## 3. Unsure goes to the pile, and nothing Unsure is written

Send an ambiguous email ("Our updated list attached" with no reference). Mail › **Unsure** shows it with the
best guess first. Choose one: the toast offers Undo; the message is filed as your choice.

```sql
select classification, confidence, "handledState", "unsureReason" from ops.mail_message
 order by "receivedAt" desc limit 1;       -- before the choice: unclassified · unsure
select kind, payload from ops.preference_signal order by "createdAt" desc limit 1;   -- after: unsure_choice
```

## 4. Out of office, bounce, phishing (board 96)

- Reply to one of your own test emails with an automatic reply naming a return date and a stand-in. Mail shows
  **… out until <date> (auto-reply)** and the chip; a "Send to <stand-in>" proposal waits in Review.
- Send a test email from the console to a non-existent address at your own domain. The bounce shows **Contact
  marked bad**; the send stays `sent` with `deliveryStatus = 'bounced'`; the board 89 banner says it bounced.

```sql
select "outOfOfficeUntil", flags->'ooo' from ops.mail_message where classification = 'auto_reply'
 order by "receivedAt" desc limit 1;
select status, "deliveryStatus", "failureReason" from ops.outbound_email order by "createdAt" desc limit 1;
```

## 5. Pause everything (board 102)

Sidebar pill → **Pause everything**. The banner reads "Assistant paused by you at …" on Today and Mail. Send
yourself another test email: it is stored and shown, but not classified. **Resume** on the banner: within two
minutes it is classified, in order.

```sql
select "pausedAt", "pausedById", "resumedAt" from ops.assistant_state;
select "dedupeKey", "resolvedAt" from ops.notification where "dedupeKey" = 'assistant_paused'
 order by "createdAt" desc limit 2;        -- raised, then resolved
select "backfillState"->'pendingHistoryId' from ops.mailbox_sync_state;   -- recorded while paused
```

## 6. The budget refuses over the limit

```sql
begin;
select ops.ai_budget_reserve(date_trunc('month', now())::date, 1000000, 'classify', null);   -- NULL: refused
rollback;
```

## Switching off

Settings › Mailboxes › **Let the Assistant sort new mail** → off. New mail is stored and shown, unsorted;
runs already queued finish. Pause is for "stop everything now"; the switch is for "do not sort mail".
