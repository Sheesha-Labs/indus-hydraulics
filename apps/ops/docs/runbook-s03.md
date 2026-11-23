# Runbook · S03

Operational steps for the S03 batch (sign-in, first-run setup and team). Each section names the task
that added it. Run from `apps/ops` unless a step says otherwise.

## S03-T05 · Storage buckets and the company profile copy

Both scripts are run by the orchestrator at sprint close, against production, after the S03 migrations
are applied and **before** the batch PR merges. Neither runs during a hosted build: check first.

### 1. Create the seven private buckets (C29, ADR-21)

```bash
cd apps/ops
SUPABASE_URL=… SUPABASE_SECRET_KEY=… bun scripts/create-buckets.ts --dry-run   # the plan only
SUPABASE_URL=… SUPABASE_SECRET_KEY=… bun scripts/create-buckets.ts
```

- Creates any of `ops-mail`, `ops-documents`, `ops-uploads`, `ops-company`, `ops-imports`, `ops-evals`,
  `ops-backup` that is missing: **private**, 25 MB limit for `ops-mail` and 20 MB for the rest (C19);
  `ops-company` allows only `image/png` and `image/jpeg`.
- An existing private bucket is left exactly as it is (never updated, objects untouched).
- An existing **public** bucket of ours stops the run with exit 1 and changes nothing: make it private in
  the Supabase dashboard, then run again.
- Prints a table of bucket names and actions. Never prints the key or an object.
- Safe to re-run: the second run reports `exists` for all seven.

Verify: Supabase › Storage lists the seven buckets, each with the lock icon (private).

### 2. Copy the company details once from the website settings

```bash
cd apps/ops
OPS_MIGRATION_URL=<postgres role URL> bun scripts/copy-company-profile.ts --dry-run
OPS_MIGRATION_URL=<postgres role URL> bun scripts/copy-company-profile.ts
```

- Reads `public.store_settings` (legal name, VAT TRN, registered address lines, contact phone, site name,
  and `website` if that column exists) and writes `ops.settings_entry 'company.profile'` with
  `copiedFrom: 'website'`, `confirmedAt: null`, plus one `activity_event`, in one transaction.
- Refuses (exit non-zero, nothing written) when: `OPS_MIGRATION_URL` is unset, not postgres, or the
  `ops_app` role (it has no rights on `public`); a Vercel build is running (non-local hosts); the profile
  was already copied (`copiedFrom` set); the profile already holds values typed in Ops; the website row is
  missing or has nothing to copy; the result does not satisfy the registry schema. A website TRN that is
  not 15 digits is not copied.
- Prints the NAMES of the fields copied, never a value.
- Ops caches settings for up to five minutes: Setup 1 shows the copied values within that time (or at
  once after any setting save).

Verify: sign in as the Owner, open `/setup/company`: Legal name and TRN carry "Copied from previous setup
— check"; **Confirm these details** clears the tags.

### Environment

`SUPABASE_URL` and `SUPABASE_SECRET_KEY` are optional in `src/lib/env.ts`: production boots without them,
and an upload is then refused with "File storage is not set up yet." Add both to the Vercel project
(Production) before the batch deploys. Locally, without them, uploads go to a disk stand-in under the OS
temp folder (`src/server/storage/local-storage.ts`), served by `/api/files/local` only while it is active.

## S03 · Sprint close (production, in this order)

1. **Preview first.** Push a commit with `[preview]` that touches `apps/ops`, then check the preview's logs
   for the proxy: a signed-in page load must not log a Prisma engine error from `session-revocation.ts`
   (the proxy imports `@indus/ops-db` for the revocation cache since S03-T02; Turbopack reports it as an
   NFT warning on `middleware.js`). The proxy fails open on a database error, so a broken engine would
   silently disable the 60 s revocation, not sign-in.
2. **Secrets** (Vercel, project `indus-operations`, Production): `RESEND_OPS_API_KEY` (Resend key named
   `indus-operations`, sending access, domain `indushydraulics.com`), `SUPABASE_URL`, `SUPABASE_SECRET_KEY`.
   Without the Resend key, auth mail records `failed` with reason `not_configured`; without the Supabase pair,
   uploads are refused with a plain sentence. Neither blocks boot.
3. **No hosted build in flight**, then the six migrations, one at a time, in file order, with
   `prisma db execute --url "$OPS_MIGRATION_URL"`: `…_ops_auth_hardening`, `…_ops_system_email_kinds`,
   `…_ops_settings_signoff`, `…_ops_settings_defaults_seed`, `…_ops_autopilot_catalogue_seed`,
   `…_ops_team_auth_event_kinds`. The two `ADD VALUE` files run outside a transaction. Then `sql/verify.sql`
   as `ops_app`, and: 66 rows in `ops.autopilot_action_def`, `assistant.mode` = careful.
4. Buckets and the company profile copy (sections 1 and 2 above).
5. Merge in one sitting (merge queue). Then the demo script in the prompt book's S03 header.
