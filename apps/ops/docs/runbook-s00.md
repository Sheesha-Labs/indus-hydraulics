# S00 runbook: the hosted pieces

What has to exist outside the repository for Indus Operations to run. No secrets here; values live in Vercel and
a password manager.

1. **Vercel project `indus-operations`.** Same GitHub repository. Root directory `apps/ops`, framework Next.js,
   "Include files outside the root directory" on, Node 24, region `bom1` (also in `apps/ops/vercel.json`, with the
   pinned Bun install command and the shared ignore script). Fluid compute on. Deployment Protection (Vercel
   Authentication) on for Preview. Production branch `main`. No Vercel crons. Connect the Git repository when the
   S00 batch merges, so `main` never tries to build an app it does not contain yet.
2. **Environment variables.** Production and Preview per the S00 table in the prompt book: `APP_ENV`,
   `NEXT_PUBLIC_OPS_BASE_URL`, `OPS_AUTH_SECRET` (different per environment), `AUTH_TRUST_HOST`,
   `GOOGLE_WORKSPACE_DOMAIN`, `OPS_TOKEN_KEYS` + `OPS_TOKEN_KEY_ACTIVE`, `OPS_READ_ONLY=1` (Preview),
   `GOOGLE_OPS_CLIENT_ID/SECRET`, `INNGEST_EVENT_KEY/SIGNING_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`,
   `SENTRY_ORG`, `SENTRY_AUTH_TOKEN`, and `DATABASE_URL`/`DIRECT_URL` as `ops_app` once its password exists.
3. **Domain.** Add `operations.indushydraulics.com` to the project. At the DNS host add
   the CNAME Vercel shows on the project's Domains page (a project-specific `…vercel-dns-0NN.com` target, TTL 300). Wait for `dig +short operations.indushydraulics.com CNAME`
   and for Vercel to issue the certificate.
4. **Sentry.** Project `indus-operations` (Next.js) in the existing organisation. Data scrubbing on, "Prevent storing
   IP addresses" on, Session Replay off. Alerts: any issue tagged `job`; any message containing `EMAXCONN` or
   `P2024`.
5. **Inngest.** Same account and environment as the website. App `indus-operations` syncs from
   `https://operations.indushydraulics.com/api/inngest` (Vercel integration, or `curl -X PUT` after a deploy). A
   dedicated event key named `indus-operations`. Record the concurrency cap in `infra-decisions.md` §1.
6. **Supabase.** Record the pooler's per-user pool size and client cap, and the API key system
   (`infra-decisions.md` §2, §3). If the new key system exists, create a secret key `indus-operations`.
7. **Google.** Workspace admin: Google Cloud project `indus-operations` inside the Workspace organisation; OAuth
   consent screen Internal, scopes `openid email profile`; Web client `indus-operations-web` with redirect URIs
   `https://operations.indushydraulics.com/api/auth/callback/google` and
   `http://localhost:3100/api/auth/callback/google`; mark the client Trusted (Admin console › Security › API
   controls).
8. **Postgres role passwords** (after the S00 migrations are applied): generate and set passwords for `ops_app`
   and `ops_maint` in the SQL editor; store them only in Vercel env and the password manager.
9. **The Owner account.** After the migrations and before the first sign-in:
   `DIRECT_URL=<direct session URL> bun apps/ops/scripts/create-owner.ts --email <workspace address> --name "<name>" --initials <XX>`.
   It refuses a second Owner, an address outside `GOOGLE_WORKSPACE_DOMAIN`, and a non-local database while a
   Vercel build is running. Everyone after the Owner is invited from Settings (S03).

## Local development and e2e

- Postgres 17 in Docker on `localhost:54329`; `bun run --filter @indus/ops-db db:apply:local` applies every
  migration (it refuses any other host).
- Env (never committed): `APP_ENV=local`, `NEXT_PUBLIC_OPS_BASE_URL=http://localhost:3100`, a 32+ character
  `OPS_AUTH_SECRET`, `DATABASE_URL`/`DIRECT_URL` as `ops_app` on the local database, and `OPS_E2E_AUTH=1` for the
  test sign-in provider. Quote values in an env file: the URLs contain `&`.
- Seed one Owner with `create-owner.ts` (`GOOGLE_WORKSPACE_DOMAIN=example.test`, `--email owner@example.test`).
- `bun run --filter @indus/ops test:e2e`. `auth.spec.ts` fails (it does not skip) without that database and Owner.
