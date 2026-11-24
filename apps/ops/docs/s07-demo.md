# S07 demo · Autopilot, learning and Today

Run after the S07 deploy, signed in as the Owner (KB) and then the Helper (AB). Nothing here sends an email: every
step stays inside Ops. Neutral names only in any notes you keep.

## 1 · Autopilot (board 98)

1. Open **Assistant › Autopilot**. The master card reads "Assistant running" with **Pause everything**; Mode is
   **Careful**. "This week" shows real counts (emails read, actions done, approved, rejected, undone) and the time
   saved with "An estimate, not a measurement".
2. Every group is listed (Mail, Enquiries, Sourcing, Quotes, After sending, Orders, Money) and **System actions** is
   collapsed. #1–#3 are on Do quietly; every action that emails someone is on Draft and ask; Send quotation and
   Supplier POs show **Locked · you send**; Supplier payments shows **Never**. Row #4 reads "Website form and
   call-back too" (no WhatsApp).
3. **Compare modes** opens the generated table of Careful, Balanced and Hands-off levels.

## 2 · Locked levels

1. The Send quotation row is not a control. Calling the action directly is refused ("This action is not an
   Autopilot setting"), and SQL refuses it too (sprint close).

## 3 · One action (board 99)

1. Click **Acknowledge client**. The drawer shows the level cards with what each means, the rules and "History ·
   last 10 runs" (empty until S08: "No history yet…" on the first day).
2. Choose **Do and tell** and **Save**: the confirmation "Let the Assistant acknowledge client without asking?"
   lists what happens from now on and what still asks. Confirm: the mode becomes **Custom** and the Assistant log
   shows "KB changed Acknowledge client: Draft and ask → Do and tell". Set it back.
3. Open **Chase suppliers**: the chaser rules (1 working day, every 2, up to 3, ask to call after the last, skip
   out-of-office) and the template preview "RE: RFQ IH-RFQ-2611-P04 — reminder" (wording awaiting sign-off).

## 4 · Guardrails (board 100)

1. Values carry "Default · awaiting sign-off"; the two fixed rules show **Fixed** and cannot be changed; each row
   counts "n× this month" from real triggers; **Last triggered** lists them.
2. Set **Outside working hours, queue until** (Edit hours: Mon–Fri 09:00–18:00, release 08:30). A send queued after
   18:00 goes to Review or the queue "because it is outside working hours".
3. **UAE · edit** opens the holiday calendar: add a Ramadan range with its hours, then remove it.

## 5 · Cost & limits (board 101)

1. Month to date from `ai_call` (equal to the SQL month total), the projection line and the marker; the breakdown
   by purpose or model; the most expensive runs.
2. Limits: USD 150 "Default · awaiting sign-off" (250 recommended at full volume), research cap USD 5. Choose
   **Hard stop** and save: this month's `ai_budget` row changes at once. Run the budget test (sprint close): a
   classification is refused and the shell shows "Assistant stopped: the monthly AI budget is reached". Put the
   mode back.

## 6 · What the Assistant has learned (board 115)

1. Preferences created overnight from three or more similar edits, rejections or choices (or the demo seed), each
   with where it came from, linked to the Assistant log.
2. Switch one off, remove one, add a rule yourself. "Send without approval" is refused.
3. Tone samples: **Pick from sent mail** (three messages from sales@). Phrase list: add one to Use and one to Avoid.
4. As AB: read only, except phrases for purchase@.

## 7 · Today (boards 178, 182)

1. As KB: the greeting by the Dubai clock, the Assistant pill, the bell; Needs you with **Approve** inline on the
   first card (an undo toast counts down); Came in since yesterday, Late or at risk, Done for you; This month
   ("Cash in next 7 days · arrives with Money") and This week.
2. As AB: supplier-side cards first, no money figures.
3. **Pause everything**: Today shows the paused banner; Resume. Disconnect a test mailbox: the disconnected banner
   names the other mailbox that still runs.

## 8 · Sign-off

**Settings** lists every default awaiting sign-off by area (Autopilot levels and presets, guardrail values, AI budget
and research cap, minutes saved, chaser wording), each linking to where it is confirmed. Record KB's answers in
`$OPS_PLAN_DIR/decisions.md` and confirm them in Ops (not by a deploy).
