# Vercel Deployment Handoff — `indus-hydraulics`

> **Resolved 2026-05-04.** The Prisma engine bundling problem was fixed by
> PR #20 (`fix(db): move Prisma client to default path so Vercel bundles
> the engine`) — moving the Prisma client back to its default location at
> `node_modules/.prisma/client` and adding `serverExternalPackages` in
> both apps' `next.config.ts`. Storefront and admin both serve from
> Vercel without runtime Prisma errors. Keep this file as historical
> context only.

Context for the next Claude agent picking up the storefront deployment bug.

---

## Goal

Deploy Turborepo monorepo to Vercel as two projects:

- `indus-hydraulics` → `apps/storefront` → `indus-hydraulics.vercel.app`
- `indus-hydraulics-admin` → `apps/admin` → `indus-hydraulics-admin.vercel.app`

Both should auto-deploy on push to `main`.

---

## Current State

- **Admin** (`indus-hydraulics-admin.vercel.app`): deploying & serving. Returns "Forbidden" at root due to middleware auth guard — that's expected behavior, not a bug.
- **Storefront** (`indus-hydraulics.vercel.app`): builds succeed, but the homepage throws `PrismaClientInitializationError: could not locate Query Engine for runtime "rhel-openssl-3.0.x"`. Header/footer render (those don't query Prisma); the page body errors and `error.tsx` shows "We hit a snag".
- **PR #19** is merged but its outcome is **unverified** — session was stopped before confirming whether `outputFileTracingIncludes` fixed it.

---

## Chronology of Fixes Already Merged to `main`

| Commit | What it did | Result |
|---|---|---|
| `eb5ae98` | Added `globalEnv` to `turbo.json` so Turborepo `envMode: "strict"` (v2.9.6) doesn't strip env vars | Fixed: env vars reach build |
| `e7b3a1a` | Added `postinstall: "prisma generate"` to `packages/db/package.json` | Fixed: Prisma client generated on Vercel install |
| `9fae763` | Added `.catch(() => null)` to root `layout.tsx`'s `db.seoSetting.findFirst()` | Fixed: build no longer fails on SeoSetting query |
| `630be04` | Added `.catch()` fallbacks to `not-found.tsx`, `SiteHeader.tsx`, `lib/navigation.ts`, `lib/store-settings.ts` | Fixed: build tolerates Prisma errors during static generation |
| `6bc9886` (PR #18) | Added `binaryTargets = ["native", "rhel-openssl-3.0.x"]` to `schema.prisma`; added `outputFileTracingRoot: path.join(__dirname, '../../')` to both `next.config.ts` | **Insufficient** — build passes but runtime still errors |
| PR #19 (merged) | Added `outputFileTracingIncludes: { '/**/*': ['../../packages/db/generated/client/**/*'] }` to both `next.config.ts` | **Unverified** — stopped before confirming |

---

## Vercel Env Var Change (Manual, Not in Git)

`DATABASE_URL` for storefront updated from:

```
?pgbouncer=true&connection_limit=1
```

to:

```
?pgbouncer=true&connection_limit=1&pool_timeout=60
```

Was meant to fix P2024 connection-pool-exhaustion errors during concurrent SSG. This *did* help build-time (the build now reaches "Generating static pages" and finishes), but is unrelated to the current runtime error.

---

## Root Cause of the Current Bug

The Prisma generated client is at a **custom output path**: `packages/db/generated/client/` (set by `output = "../generated/client"` in `schema.prisma`, not the default `node_modules/.prisma/client`).

Next.js's `@vercel/nft` file tracing follows static `require`s, but Prisma loads its query-engine binary (`libquery_engine-rhel-openssl-3.0.x.so.node`) via dynamic `require` at runtime. So the binary doesn't end up in the serverless function bundle, even though it's generated correctly during build.

---

## Things Tried (in PRs Above) That Didn't Fully Solve It

1. `binaryTargets = ["native", "rhel-openssl-3.0.x"]` — generates the binary, but doesn't help bundling
2. `outputFileTracingRoot: path.join(__dirname, '../../')` — sets monorepo root for tracing, but tracing still doesn't follow the dynamic require
3. `outputFileTracingIncludes` (PR #19, unverified) — explicit include glob; this *should* work in theory

---

## Alternatives Not Yet Tried (Candidates for the Plan)

- **`@prisma/nextjs-monorepo-workaround-plugin`** — Prisma's officially-supported fix for this exact monorepo + Next.js scenario. Adds a webpack plugin via `next.config.ts`. Might or might not support Next.js 15 cleanly.
- **Move Prisma client back to default location** — remove `output = "../generated/client"` from `schema.prisma` so the client goes to `node_modules/.prisma/client`. Default location is what file tracing handles best, and is what the Prisma docs assume. Trade-off: changes import paths, may need workspace tweaks.
- **`serverExternalPackages: ['@prisma/client', '@indus/db']`** in `next.config.ts` — tells Next.js not to bundle these and load them from `node_modules` at runtime. Pairs well with the default-location approach.

---

## Tech Stack Reminders

- Turborepo + pnpm workspaces; apps are `apps/storefront` and `apps/admin`; shared packages `packages/db`, `packages/ui`, `packages/domain`
- Next.js 15 (App Router), TypeScript strict, Tailwind v4
- Prisma 6.19.x, Postgres on Supabase, with pgbouncer (`connection_limit=1`)
- Vercel Hobby tier (builds run sequentially; `outputFileTracingRoot` strongly recommended for monorepos)
- Vercel build runs on Linux (`rhel-openssl-3.0.x`); local dev is macOS arm64
- Two separate Vercel projects, both pointed at the same GitHub repo, each with its own root directory (`apps/storefront` vs `apps/admin`)

---

## Files Changed (Still on `main`)

- `turbo.json` — `globalEnv` array
- `packages/db/package.json` — postinstall script
- `packages/db/prisma/schema.prisma` — `binaryTargets`
- `apps/storefront/src/app/layout.tsx` — `.catch(() => null)` on seoSetting query
- `apps/storefront/src/app/not-found.tsx` — `.catch(() => [])` on category query
- `apps/storefront/src/components/SiteHeader.tsx` — `.catch(() => 0)` on product count
- `apps/storefront/src/lib/navigation.ts` — `.catch(() => null)` on navMenu query
- `apps/storefront/src/lib/store-settings.ts` — `.catch(() => null)` on storeSettings query
- `apps/storefront/next.config.ts` and `apps/admin/next.config.ts` — `outputFileTracingRoot` + (after PR #19) `outputFileTracingIncludes`

---

## Worktrees on Disk (Not Cleaned Up)

- `.claude/worktrees/fix+prisma-vercel-engine` (branch `worktree-fix+prisma-vercel-engine`, PR #18 — merged)
- `.claude/worktrees/fix+prisma-engine-include` (branch `worktree-fix+prisma-engine-include`, PR #19 — merged)

---

## Verification Commands the Next Agent Will Want

- **Latest deployment status:** Vercel dashboard → indus-hydraulics → Deployments
- **Check storefront live:** `curl -sI https://indus-hydraulics.vercel.app`
- **View runtime errors:** Vercel dashboard → indus-hydraulics → Logs → filter status 500
- **Confirm what's actually in `packages/db/generated/client/` after a Vercel build:** only inspectable via build logs
- **Check if PR #19 worked:** visit `https://indus-hydraulics.vercel.app` — if homepage renders the catalogue (categories, brands, featured products), it worked; if "We hit a snag", the next alternative needs to be tried.
