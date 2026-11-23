# Infrastructure decisions (S00-T04)

Facts that size later sprints, and the hosted pieces as built. Each is read from a dashboard and recorded here with the date and who
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
| New system present (publishable + secret keys; legacy anon/service_role still enabled). For now Ops uses the project's shared `default` secret key as `SUPABASE_SECRET_KEY` (Owner's decision at S03 close; revoking it also affects the website). A dedicated `indus_operations` key remains the target. `SUPABASE_URL` and the key set in Vercel Production. | 2026-11-23 | S03 close |

## 4. Google sign-in client (recorded 2026-11-22)

- Cloud project `indus-operations` inside the Workspace organisation, created by the Workspace super admin (the
  company, not a personal account, owns it).
- Google Auth Platform: user type **Internal**; scopes `openid`, `userinfo.email`, `userinfo.profile` only. Gmail
  (`gmail.modify`) is added in S04; Internal means no restricted-scope verification.
- Web client `indus-operations-web`: origins `https://operations.indushydraulics.com` and `http://localhost:3100`;
  redirect URIs `/api/auth/callback/google` on both. **Not** marked "for an AI-powered agent": that flag is for
  clients using Google's MCP tools, and Ops calls the Gmail API itself. A Google MCP workflow, if ever, gets its own
  client.
- Admin console › API controls: "Trust internal apps" is on, and the client is also listed explicitly as Trusted
  for the whole organisation, so tightening the internal-apps setting later does not lock Ops out.
- `GOOGLE_OPS_CLIENT_ID` / `GOOGLE_OPS_CLIENT_SECRET` (sensitive) are on Vercel Production only: preview URLs are
  not registered redirect URIs, so Google sign-in cannot work on previews.

## 5. Domain (recorded 2026-11-22)

`operations.indushydraulics.com` is a CNAME to the project-specific Vercel target, in the Spaceship **default**
record group (the "external API custom" group belongs to an integration that may rewrite it). TTL 300. Vercel shows
it verified; the certificate is issued with the first production deployment.
