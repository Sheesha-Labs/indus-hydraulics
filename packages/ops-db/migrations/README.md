# Ops SQL migrations (`ops` schema)

Indus Operations lives in its own Postgres schema, `ops`, in the same Supabase database as the
website (architecture ADR-03). It has its own Prisma schema (`../prisma/schema.prisma`), its own
generated client (`../generated/client`, git-ignored) and this folder of hand-written SQL. The
rules are the website's (`packages/db/migrations/README.md`), adapted.

> **`db:push` is disabled for this package and must not be run.** `bun run --filter
> @indus/ops-db db:push` prints why and exits 1. Prisma would also see the website's `public`
> schema and propose destructive changes to it, and it cannot express the generated `tsvector`
> columns, CHECKs, partial uniques, triggers, roles or RLS that these files carry. Never run
> `prisma migrate dev` either. Edit `schema.prisma` for the types, write the SQL here for the
> database, and keep the two in step by hand.

## Naming

    YYYYMMDDHHMM_ops_snake_case_description.sql

Always get the name from the script, never by hand:

```bash
bash packages/ops-db/scripts/new-migration.sh add_the_thing
# → packages/ops-db/migrations/202611221015_ops_add_the_thing.sql
```

It uses `date +%Y%m%d%H%M` (local time) and moves forward a minute at a time while the prefix
is taken in **either** this folder **or** `packages/db/migrations`. Both folders are applied to
the same database, so a prefix must be unique across the two. `src/migration-filenames.test.ts`
fails the build if a name does not match `^\d{12}_ops_[a-z0-9_]+\.sql$`, if two files share a
prefix (in this folder or across both), if the order is not chronological, or if a file is
missing from the table below. Its assertion helper is a byte-identical copy of
`packages/db/src/migration-folder-assertions.ts`, and a test fails if the copies drift.

## Writing a migration

- Wrap the file in `BEGIN; … COMMIT;` unless Postgres forbids it (`CREATE INDEX CONCURRENTLY`,
  `VACUUM`, or an `ALTER TYPE … ADD VALUE` whose value the same transaction would use).
- Make it idempotent: `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP TRIGGER IF EXISTS` +
  `CREATE TRIGGER`, and `DO` blocks that check the catalogue first. Re-running a file must be
  safe: running `scripts/apply-local.sh` twice in a row must succeed.
- Generate base DDL without a database:
  `(cd packages/ops-db && bunx prisma migrate diff --from-schema-datamodel <old> --to-schema-datamodel prisma/schema.prisma --script)`,
  then hand-edit it and list every hand edit in the file header, so the next diff can be
  reconciled (see `…_ops_enums_and_tables.sql`).
- Reference Supabase roles (`anon`, `authenticated`, `service_role`) only inside `DO` blocks
  that check `pg_roles`, so the file also runs on plain Postgres.
- New tables need RLS on and an `ops_app_all` policy, the grants of
  `…_ops_rls_and_grants.sql`, and `REVOKE … FROM PUBLIC` on any new function. A per-schema
  default privilege cannot revoke Postgres's global `EXECUTE` grant to `PUBLIC`.
- **No passwords, ever.** The repository is public. Role passwords are set out of band in the
  Supabase SQL editor and stored only in Vercel env. The only password in this package is the
  local-only one in `scripts/apply-local.sh`, which refuses any host but localhost.
- **No supplier or client names** (CLAUDE.md §14). Fixtures say "Example Valve Co" and
  "Sample Client LLC".

### Enum values ship ahead of code (C31)

`ALTER TYPE ops."X" ADD VALUE 'y'` goes in its own migration, applied **before** the PR whose
code uses it. Adding the value is safe while the old client runs; a **row** using it is not —
the deployed client throws reading a value it does not know. So no row may use a new value
until the regenerated client is deployed. `ADD VALUE` cannot run inside a transaction block
that later uses the value, so keep it in a file of its own.

## Applying

Apply in plain `ls` order with `prisma db execute` over the **direct** connection
(`OPS_DIRECT_URL`, as `postgres`), **before** merging the PR that needs the change, then
regenerate the client:

```bash
(cd packages/ops-db && bunx prisma db execute --url "$OPS_DIRECT_URL" --file migrations/<file>.sql)
bun run --filter @indus/ops-db db:generate
```

Never while a hosted build is running (both hit the same pooler), and never within an hour of
a storefront deploy or an IndexNow burst (ADR-04).

Locally, `bash packages/ops-db/scripts/apply-local.sh <localhost url>` applies
`../sql/local/public-stub.sql` (stand-in Supabase roles and website tables — **never** on
Supabase), every migration, and a local-only `ops_app` password. Then check the result as
`ops_app`:

```bash
(cd packages/ops-db && bunx prisma db execute \
  --url "postgresql://ops_app:ops_app_local@localhost:54329/postgres" --file sql/verify.sql)
```

## Supabase lint exception: `security_definer_view`

`ops.catalogue_product_v`, `ops.catalogue_variant_v` and `ops.catalogue_cross_ref_v` are owned
by `postgres` and deliberately **not** `security_invoker`: `ops_app` has no grant on any
`public` table and reads the catalogue through the owner's rights. Supabase's linter reports
this as `security_definer_view`. The exception is accepted because `ops` is not exposed to
PostgREST and `anon` / `authenticated` have no `USAGE` on the schema (06-map-schema.md §6).
Do not "fix" it by switching the views to `security_invoker`: Ops would lose the catalogue.

## Files

| File | Purpose | Applied to prod |
|------|---------|-----------------|
| `202611212357_ops_roles_and_schema.sql` | Roles `ops_app` (NOINHERIT, CONNECTION LIMIT 15, `search_path ops`, 15 s statement / 5 s lock / 30 s idle-in-transaction timeouts) and `ops_maint` (limit 2, 120 s), no passwords. Schema `ops` owned by `postgres`; USAGE revoked from PUBLIC and the Supabase API roles, granted to the two Ops roles; default privileges revoked. Asserts the Ops roles hold no privilege on any `public` table. | 2026-11-22 |
| `202611212358_ops_extensions.sql` | Asserts `pg_trgm` (creates it only if absent: `extensions` schema when present, else `public`) and records its schema in the comment on schema `ops`. No `vector`. | 2026-11-22 |
| `202611212359_ops_enums_and_tables.sql` | `prisma migrate diff --from-empty` output (165 enums, 144 tables, 231 indexes, 224 foreign keys), hand-edited: `gen_random_uuid()` id defaults, eight generated weighted `searchTsv` columns, `ops.immutable_array_to_string`, 28 currency and 46 actor foreign keys, idempotency guards. | 2026-11-22 |
| `202611220000_ops_constraints_indexes.sql` | CHECKs (reference formats, revision ≥ 1, chasers 0–3, ordered equivalence pairs, money ≥ 0, ISO countries, locked notifications, payment approver, Gmail sent id), six partial uniques, five trigram GIN indexes with the schema-qualified operator class, GIN on every `searchTsv`. | 2026-11-22 |
| `202611220001_ops_functions_triggers.sql` | Numbering (`format_number`, `allocate_number`, `release_number`, `seed_number_sequence`), the two SECURITY DEFINER legacy checks (`legacy_quote_number_exists`, `legacy_enquiry_ref_exists`), append-only guard on six audit tables, assistant-action guard and event log, Autopilot locked/max level guard, owner-only approval, tax invoices never cancelled, stage timestamps, and the command-bar index triggers on eleven tables. | 2026-11-22 |
| `202611220002_ops_catalogue_views.sql` | `catalogue_product_v`, `catalogue_variant_v`, `catalogue_cross_ref_v`: active website products only, owned by `postgres`, SELECT to `ops_app` (lint exception above). | 2026-11-22 |
| `202611220003_ops_rls_and_grants.sql` | RLS + `ops_app_all` policy on every table; table grants to `ops_app` minus UPDATE/DELETE on append-only tables and DELETE on never-deleted records; `ops_maint` purge grants on the mail and file tables; everything revoked from PUBLIC and the API roles; final assertions. | 2026-11-22 |
| `202611220004_ops_reference_seed.sql` | Structural rows: 13 currencies, 14 number sequences (all unseeded except `assistant_action`), 11 guardrails (params `{}`, disabled), 14 skeleton sending rules from board 87 (roles only, no addresses). | 2026-11-22 |
| `202611221342_ops_action_idempotency.sql` | S02-T08: `action_idempotency` (key PK, action, userId → `user`, result jsonb, createdAt, expiresAt + index) for `defineAction` replays of approve / send / pay; RLS + `ops_app_all`; ops_app SELECT, INSERT, DELETE and never UPDATE (re-revoked after migration 7 re-grants on a re-apply); nothing for PUBLIC or the API roles. | 2026-11-22 |
| `202611222313_ops_auth_hardening.sql` | S03-T01/T02: `rate_limit_counter` (key, windowStart PK, count; windowStart index for the purge) + `hit_rate_limit(key, window_seconds, max)` (atomic upsert, SECURITY INVOKER, TRUE while within the limit); `user."passwordHistory"`, `"passwordSetAt"`, `"totpLastStep"`; `user_session."deviceHash"`, `"revokedById"` (FK → `user`), `"revokeReason"` + partial index on `revokedAt IS NOT NULL`; RLS + `ops_app_all` / `ops_maint_all` and grants on the new table. | 2026-11-23 |
| `202611222314_ops_system_email_kinds.sql` | S03-T01: `OutboundKind` + `auth_password_reset`, `auth_invite`, `auth_security_notice`; `OutboundStatus` + `suppressed_preview`. No BEGIN/COMMIT (ADD VALUE ships ahead of code, C31). | 2026-11-23 |
| `202611231304_ops_settings_signoff.sql` | S03-T04 (S03 migration 3): enum `SignoffStatus` (awaiting, signed_off, not_required); `signoffStatus` (default `not_required`), `signedOffById` (FK `user`) and `signedOffAt` on `settings_entry`, `email_template`, `document_template`, `terms_clause`, `terms_preset`, `guardrail`, `sending_rule`, `autopilot_action_def`, with a CHECK that `signed_off` ⇔ both set. | 2026-11-23 |
| `202611231305_ops_settings_defaults_seed.sql` | S03-T04 (S03 migration 4): the 17 `settings_entry` defaults (product values from the architecture; 11 `awaiting` sign-off; every key ownerOnly but `setup.progress`; `company.profile` seeds empty strings) and the six `setup` `checklist_item` steps. ON CONFLICT DO NOTHING. | 2026-11-23 |
| `202611231426_ops_autopilot_catalogue_seed.sql` | S03-T06 (S03 migration 5): the Autopilot catalogue, the only catalogue seed. 66 `autopilot_action_def` rows (#1–#32 at positions 1–32, the 34 §4.6 system actions at 101–134; per-mode defaults, 8 locks, 5 Draft-and-ask caps, 4 not configurable, all `awaiting` sign-off) and 66 `autopilot_setting` rows at Careful (`chase_suppliers` rules `{"firstNeedsApproval":true}`). ON CONFLICT DO NOTHING; asserts every definition has a setting. | 2026-11-23 |
| `202611231430_ops_team_auth_event_kinds.sql` | S03-T03: `AuthEventKind` + `invite_domain_override`, `permissions_changed`, `user_removed` (Settings › Team). No BEGIN/COMMIT (ADD VALUE ships ahead of code, C31). | 2026-11-23 |
| `202611231701_ops_mail_enum_values.sql` | S04-T02: `MailboxStatus` + `token_expired`, `revoked`, `resyncing`; `OutboundStatus` + `scheduled`, `held`, `unknown`, `superseded` (`suppressed_preview` re-asserted). ADD VALUE only, no transaction; unused until the S04 deploy. | applied 2026-11-24 |
| `202611231702_ops_mail_sync_columns.sql` | S04-T02/T04/T05: table `oauth_state` (single-use mailbox OAuth state, RLS); `mailbox` token columns (`tokenKeyId` text, `accessTokenEnc`, `accessExpiresAt`, `grantedEmail`, `lastTokenError`); `mailbox_sync_state` sync/watch/backfill columns (`dlqCount` NULL); `mail_message` `origin` (live/backfill/import CHECK), `internalDate`, threading and header columns, body file FKs, index (mailboxId, internalDate). | applied 2026-11-24 |
| `202611231705_ops_mail_settings_seed.sql` | S04-T02: settings `mail.label_names` (the eight Indus/* labels) and `mailbox.consent` (data-location line, Mumbai ap-south-1 instead of the board's EU region), both awaiting sign-off. ON CONFLICT DO NOTHING. | applied 2026-11-24 |
| `202611231721_ops_mail_backfill_settings_seed.sql` | S04-T05: setting `mail.backfill_exclusions` (never-import senders, empty, awaiting sign-off). ON CONFLICT DO NOTHING. | applied 2026-11-24 |
| `202611231724_ops_holiday_calendar.sql` | S04-T06: table `holiday` (country, date, kind public_holiday/ramadan/closure, optional hours, signoffStatus) with RLS; UAE public holidays 2026–2027 and Ramadan 2027 (10:00–15:00), best known, awaiting sign-off. | applied 2026-11-24 |
| `202611231725_ops_outbound_send_queue.sql` | S04-T06: `outbound_email` send-queue columns (claimedAt, proposed/read-back RFC ids, references, basisHash, approvedById FK + approvedAt, holdReason CHECK, sendSlotAt, reconcileChecks, fromAlias); partial index (mailboxId, status) for active rows; asserts the S00 sent-has-gmailMessageId CHECK. | applied 2026-11-24 |
| `202611231726_ops_send_settings_seed.sql` | S04-T06: settings `send.timing` (client hours, 19:00 → 08:30 window, Ramadan, supplier morning, chaser Friday rule, 04:00 cap reset) and `calendar.country_weekends`, awaiting sign-off. | applied 2026-11-24 |
| `202611231751_ops_sending_page_settings_seed.sql` | S04-T07: settings `send.signatures` (empty), `send.attachment_names` (INDUS-Q{n}.pdf, IH-RFQ-{ref}.pdf, awaiting sign-off) and `mail.test_allowlist` (empty). ON CONFLICT DO NOTHING. | applied 2026-11-24 |
| `202611231809_ops_help_gmail_truth.sql` | S04-T08: help article `gmail-stays-the-truth` (board 88 explainer: intro, four principles, the side-panel note) — content in the database. ON CONFLICT DO NOTHING. | applied 2026-11-24 |
| `202611240117_ops_maint_outbound_thread_grant.sql` | S04 follow-up: `GRANT UPDATE ("threadId", "updatedAt") ON outbound_email TO ops_maint`, so the board 90 purge can clear a sent email's thread link before deleting the thread; asserts the grant is column-only. | applied 2026-11-24 |
| `202611241306_ops_ai_runtime.sql` | S05-T01: `ai_model_price` (Opus/Sonnet/Haiku 5.5 from 2026-11-01, awaiting sign-off), `ai_budget` (per Dubai month), `ai_reservation`; functions `ai_budget_reserve` (one conditional UPDATE; refuses an estimate above the month's limit in every mode), `ai_budget_settle`, `ai_budget_release_stale`, `ai_budget_ensure_month`; `ai_call` + promptVersion, stopReason, effort, cacheWrite1hTokens, reservationId; `assistant.budget` gains `mode`. RLS + grants. | applied 2026-11-24 |
| `202611241318_ops_assistant_runtime.sql` | S05-T02: `assistant_state` (single pause row, carried over from the interim `assistant.paused` setting), `live_counter`, `preference_signal`; `assistant_action` + basisHash, idempotencyKey (unique), origin, model, promptVersion, levelReasons, surface, version (guard: new columns immutable, version bumped on update); `mail_message` + assistantNote, flags. RLS + grants. | applied 2026-11-24 |
| `202611241324_ops_s05_settings_seed.sql` | S05: settings seed `assistant.internal_undo_minutes` ({\"minutes\":5}, awaiting sign-off). ON CONFLICT DO NOTHING. | applied 2026-11-24 |
| `202611241335_ops_source_span.sql` | S05-T04 (moved from S08): `source_span` (email, pdf, sheet, image, docx; exact, fuzzy, page_only, unresolved), index (sourceKind, sourceId); RLS; ops_app SELECT/INSERT/DELETE (never UPDATE); ops_maint SELECT/DELETE for the purge. | applied 2026-11-24 |
| `202611241353_ops_mail_view_indexes.sql` | S05-T05: Mail view indexes: mail_thread (lastMessageAt, id) and (mailboxId, lastMessageAt, id); mail_message (threadId, direction, origin) and (classification, confidence). | applied 2026-11-24 |
| `202611241356_ops_s05_action_defs.sql` | S05: action defs `manual_reply` (mail, Draft and ask ×3, maxLevel draft_and_ask; external) and `ooo_facts` (mail, Do quietly, not configurable) with their settings. ON CONFLICT DO NOTHING. | applied 2026-11-24 |
| `202611241457_ops_assistant_action_created_idx.sql` | S05-T08: assistant_action (createdAt DESC) for the pill popover's week count and last action. | applied 2026-11-24 |
| `202611241506_ops_s05_pipeline_settings_seed.sql` | S05-T09: settings seed `assistant.mail_pipeline_enabled` {"enabled":false} (the switch; not_required). | applied 2026-11-24 |
| `202611241507_ops_mail_message_first_labelled.sql` | S05-T09: mail_message."firstLabelledAt" (set by the first Indus label on live mail) and its partial index, for the latency metric. | applied 2026-11-24 |
| `202611241513_ops_notification_open_dedupe_idx.sql` | S05-T09: partial index on open notifications by dedupeKey (resolveNotifications on every recovery). | applied 2026-11-24 |
| `202611241639_ops_review_lifecycle.sql` | S06-T01: assistant_action lifecycle columns staleAt, staleReason, supersededById, blockedByActionId, redraftOfId, effectivePayload; partial indexes on laterUntil (state later) and redraftOfId. | applied 2026-11-25 |
| `202611241705_ops_s06_action_defs.sql` | S06: action defs `override_value` (system, Do quietly), `outbound_attention` (system, Draft and ask) and `instruction` (system, Draft and ask, maxLevel draft_and_ask) with their settings. | applied 2026-11-25 |
| `202611241711_ops_log_and_history.sql` | S06-T04/T06: activity_event.revertsEventId; index (subjectType, subjectId, field, at); view ops.assistant_log_v (actions, people's decisions, people's own changes), SELECT to ops_app. | applied 2026-11-25 |
| `202611250210_ops_autopilot_learning.sql` | S07-T01/T02/T03/T05: `guardrail_trigger` (append-only for ops_app, index guardrailKey+at), `autopilot_suggestion` (one open per action), `preference` + actionKey, createdFrom, strength, disabledAt, createdById; `preference_learn_batch`; `autopilot_setting` sign-off columns; guardrail values (value_threshold → value_threshold_quotation + value_threshold_rfq, all enabled, awaiting); minutesSaved defaults. RLS + grants. | applied 2026-11-25 |
| `202611251158_ops_uom_and_column_mapping.sql` | S08-T02/T05: `uom_unit` (EA, PR, SET, M, FT, KG, L, DRUM, BOX, ROLL, LOT, PKT) and `uom_alias` (NOS, PCS, MTR …) seeded with structure; `client_column_mapping` (per company and header signature, unique; byHeader so a reordered sheet still maps; usedCount). RLS + grants. | not yet applied |
| `202611251200_ops_intake_batch.sql` | S08-T03: RecordType + `intake_file`; enums IntakeSource, IntakeBatchStatus, IntakeFileStatus; `intake_batch` (one open mail batch per message), `intake_file` (status, progress, failure kind), `intake_line_candidate` (staging values, code confidence, unsure question, duplicate link, decision, spans). `ops.trgm_similarity(text, text)` SECURITY DEFINER wrapper pinned to pg_trgm's schema (ops_app has no privilege on public). Nothing here writes enquiry_line. RLS + grants. | not yet applied |
| `202611251430_ops_s08_action_defs.sql` | S08: action defs `request_original` (board 17, Draft and ask, sends to the client) and `resolve_extracted_line` (Unsure line card, always asks); email templates `client_ack` (board 93) and `request_original`, awaiting sign-off (P03). | not yet applied |
| `202611251431_ops_s08_settings_seed.sql` | S08-T07: settings `ack.revert_by` {pricingDays 0.5, bufferDays 2, defaultSupplierReplyDays 2, defaultNoDeadlineDays 3}, awaiting sign-off (P03). | not yet applied |
| `202611251512_ops_intake_sheet_map.sql` | S08-T05: `intake_file.sheetMap` (board 35's working mapping for one sheet: sheet, header row, header signature, columns → fields, unit overrides, remember, confirmedAt). | not yet applied |
| `202611251548_ops_legacy_enquiry_ref.sql` | S08-T06 (C5): `ops.legacy_enquiry_max(year)` SECURITY DEFINER (owner postgres, EXECUTE to ops_app) — the highest website-admin ENQ number in a year, for the seed (legacy max + 1000) and `ops.numbering.continuity`. With `legacy_enquiry_ref_exists` it is the second and last read path from ops_app into public; both are dropped at the S21 cutover. | not yet applied |
| `202611251549_ops_number_sequence_out_of_step.sql` | S08-T06: `number_sequence.outOfStepAt`, set by `ops.numbering.continuity` when the website admin reaches the Operations ENQ block, cleared when the check passes. | not yet applied |
