# `src/data` — page reads

Every read a console page makes goes through a function here (05-map-frontend §7.1,
apps/ops/CLAUDE.md §6). Pages are thin: they await `params` and `searchParams`, validate them
with the segment's Zod schema, call one or two data functions, and pass typed props down. Writes
never live here; they go through `defineAction` (`src/lib/define-action.ts`).

`data-layer.test.ts` enforces rules 1 and 2; review enforces the rest.

## Rules

1. **`import 'server-only'` is the first line of every module.** A data function must never be
   bundled into a client component. Client panels that need data call a read action
   (`actions/read/*.ts`, `defineAction` with `readOnlySafe: true`), never `fetch()`.
2. **Prisma lives here, in `src/server` and `src/inngest`, and nowhere else** (plus
   `define-action.ts` and `audit.ts` for idempotency and audit rows). Nothing under `src/app`,
   `src/components` or `packages/ops-ui` imports `@indus/ops-db`, not even for a type: export the
   DTO type from the data module instead.
3. **At most two queries per request** (ADR-04: the shared pooler, `connection_limit=1`). Prefer
   one query with `select` / `include`, or a SQL view for index counts. No `Promise.all` over
   more than two queries, and no per-row query (N+1). Wrap a function that several components
   call in React `cache()` so it runs once per request.
4. **Select minimal columns.** Always `select` the fields the screen renders; never return a
   whole row. Never select a secret (`passwordHash`, `totpSecretEnc`, token columns).
5. **Keyset pagination, 50 rows** (`pagination.ts`): `keysetWhere` + `keysetOrderBy` +
   `take: PAGE_SIZE + 1` + `takePage`. The cursor is opaque base64url over (sort value, id); a
   cursor for another sort decodes to null and the index shows page 1. Sort columns are NOT NULL.
   Every list's `WHERE` / `ORDER BY` has an index in the migration that creates its table.
6. **Helper masking happens in the mappers here**, not in components: a Helper without
   `canSeeMargins` gets DTOs with no margin, cost or sell fields at all (`can(user, flag)` from
   `src/lib/access.ts`), and `activity_event` rows with `sensitive = true` are left out. The UI
   cannot leak what it was never sent.
7. **Return DTOs, not Prisma types.** Map rows to plain, serialisable objects (money as the
   `ops-core/money` string form, dates as `Date`). Client-facing data uses `ClientSafe*` types
   only (CLAUDE.md §10).
8. **No database at build time.** Data functions are called from dynamic routes only; no
   `generateStaticParams`, no module-level queries.
9. **Caching** only for slow-changing reference data (company settings, numbering patterns, FX
   locks, template lists): `use cache` + `cacheTag`, tag names in `lib/ops-cache-tags.ts`. Console
   data is per-user and live.

## Files

| File | What it reads |
|---|---|
| `pagination.ts` | Keyset cursor helpers (no queries) |
| `health.ts` | `/api/health`: ops_app connections and the Inngest heartbeat |
| `cockpit.ts` | `getRecordHeaderState(kind, ref)`: the record header and strip seed (S02 stub: neutral fixtures outside production, null in production; S09 queries) |
