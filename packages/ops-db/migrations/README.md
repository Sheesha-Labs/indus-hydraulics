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
