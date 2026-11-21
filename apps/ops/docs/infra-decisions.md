# Infrastructure decisions (S00-T04)

Three facts that size later sprints. Each is read from a dashboard and recorded here with the date and who
recorded it. No secrets, keys or connection strings belong in this file.

## 1. Inngest concurrency cap

Whether the plan's concurrency limit applies per function or to the whole account, and its value.

- Consequence: `OPS_INNGEST_CONCURRENCY_CAP` in `src/inngest/plan.ts` must equal the cap available to Ops.
  `concurrency.test.ts` fails if the Ops functions together exceed it. If the cap is account-wide and shared with
  the website, upgrade the plan before mail goes live (S04 gate, 10-architecture Appendix I #7).

| Recorded value | Date | By |
|---|---|---|
| | | |

## 2. Supavisor per-user pool size

The pool size per user, database and mode on the Supabase pooler, and the total client cap.

- Context: `ops_app` has `CONNECTION LIMIT 15` and every serverless instance uses `connection_limit=1`
  (ADR-04), because the shared pooler (200-client cap) has failed after deploys before. The per-user pool must fit
  `ops_app` beside the website's `postgres` pool.

| Recorded value | Date | By |
|---|---|---|
| | | |

## 3. Supabase API key system

Whether the project has the new publishable/secret keys or only the legacy `anon`/`service_role` keys.

- Consequence: with the new system Ops uses its own secret key `indus-operations` as `SUPABASE_SECRET_KEY` (from
  S03), revocable without touching the website; otherwise the service-role key.

| Recorded value | Date | By |
|---|---|---|
| | | |
