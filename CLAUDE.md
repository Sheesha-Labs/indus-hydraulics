# Indus Hydraulics — Coding Standards

This file is the authoritative engineering guide for this codebase. Claude Code (and all contributors) must follow every rule here without exception. These are not suggestions.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 (Auth.js) |
| Monorepo | Turborepo + pnpm workspaces |
| Testing | Vitest (unit) + Playwright (e2e) |

> **English-only.** This codebase shipped with full English/Arabic next-intl support but Arabic is no longer a product requirement. Routes live at `/`, not `[locale]/`. Strings are inlined as English literals in components — there is no `next-intl`, no `@indus/i18n` package, no message files. If you reintroduce locale routing later, do it as a deliberate new project; do not retrofit it on top of inline strings.

---

## 1. Component Architecture

### Rules

1. **All shared UI lives in `packages/ui`.** Never build a one-off component inside `apps/web` if it could ever be reused. Move it to `packages/ui` and import it. Storefront components live in `src/components/`, admin components in `src/components/admin/`.

2. **Pages are thin.** Route files (`page.tsx`) fetch data and pass typed props to components. No business logic in pages.

3. **Server Components by default.** Add `'use client'` only when the component needs browser APIs, event handlers, or React state. Every `'use client'` boundary is a deliberate decision.

4. **Props are always typed.** No `any`. No implicit `any`. TypeScript strict mode is on.

5. **Component files follow this structure:**
   ```tsx
   // 1. Imports
   // 2. Types/interfaces
   // 3. Component (default export)
   // 4. Named exports (if any sub-components)
   ```

6. **Name conventions:**
   - Component files: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
   - Route files: `kebab-case` directories (e.g., `product-edit/page.tsx`)
   - Utilities/hooks: `camelCase.ts` (e.g., `useRfqState.ts`)
   - Constants: `SCREAMING_SNAKE_CASE`

---

## 2. Styling

### Rules

1. **Tailwind utilities only.** No inline `style=` props. No CSS modules (except for keyframe animations that can't be expressed as utilities). No styled-components.

2. **Design tokens only.** Never use raw hex colors or pixel values. All values come from the design token system:
   ```
   bg-surface, bg-elevated, bg-deep
   text-primary, text-body, text-muted, text-caption
   border-default
   accent, accent-soft
   status-good, status-warn, status-danger, status-info
   ```

3. **Border radius.** This is an industrial brand. Use `rounded-none` or `rounded-sm` (2px) only. Never `rounded-lg`, `rounded-full`, etc.

4. **No magic numbers.** Use Tailwind spacing scale (`p-4`, `gap-6`) not arbitrary values (`p-[17px]`).

5. **Dark mode.** The design includes a dark theme (`[data-theme='dark']`). Tailwind `dark:` variants are wired to a `data-theme` attribute on `<html>`, not `prefers-color-scheme`. The theme toggle sets this attribute.

---

## 3. Data Fetching

### Rules

1. **Server Components fetch from Prisma directly.** Don't create API routes just to call them from RSC:
   ```tsx
   // ✅ Correct
   const products = await db.product.findMany({ where: { status: 'active' } })

   // ❌ Wrong — unnecessary network hop
   const products = await fetch('/api/products').then(r => r.json())
   ```

2. **Client Components use Server Actions** for mutations. No client-side `fetch()` to internal API routes.

3. **Server Actions are in `actions/` files**, co-located with the route segment they serve. They are typed and validated with Zod.

4. **Never expose raw Prisma errors** to the client. Catch and return typed error responses.

5. **Sensitive data is never sent to the client.** Strip `password_hash`, `token_hash`, and other secrets in the select query or a mapper function before returning.

---

## 4. Authentication & Authorization

### Rules

1. **Two completely separate auth contexts, on one origin.** Since the storefront/admin merge both surfaces are served by `apps/web`, so the separation is enforced in code rather than by deployment:
   - `account_contact` — storefront/customer portal. `lib/auth.ts` + `lib/customer-session.ts`.
   - `staff_user` — admin at `/admin/*`. `lib/admin-auth.ts` + `lib/staff-session.ts` + `lib/rbac.ts`.

   They have **different secrets and different session-cookie names**. The cookie name is Auth.js's HKDF salt (`packages/domain/src/auth-cookies.ts`), so tokens minted by one instance are cryptographically undecryptable by the other — the failure mode of a missed check is "session is null", not "session is a customer's".

   **Never import across the boundary.** Both instances export `auth`, so a wrong import type-checks cleanly and fails only at runtime. Zoned `no-restricted-imports` rules in `apps/web/eslint.config.mjs` block it.

   Every session carries a `kind: 'customer' | 'staff'` claim. Guards **reject** a missing `kind`; never default it.

2. **Middleware enforces auth on every protected segment.** Do not rely on page-level redirects — App Router partial rendering means a layout does not re-run on every request, so layout-only authorization is bypassable. Next.js 16 renamed the middleware file: `apps/web/src/proxy.ts` handles both surfaces (allowlist for the storefront, default-deny for `/admin`) and verifies the token with `getToken`, not merely the presence of a cookie.

   Its matcher exempts `api` **and** `admin/api`. The lookahead is anchored after the leading `/`, so `api` alone exempts only top-level `/api/*` — without `admin/api`, `/admin/api/auth/*` is caught by the denylist and sign-in becomes an infinite redirect loop with no error message.

3. **Role checks happen server-side.** Never trust a role value passed from the client. Always read it from the session.

4. **Admin roles:**
   - `super_admin` — full access
   - `manager` — everything except system settings
   - `sales_rep` — own accounts + RFQs
   - `engineer` — RFQ queue + product specs
   - `cms_editor` — content/blog only
   - `warehouse` — inventory only (out of scope for now)
   - `finance` — invoices only (out of scope for now)

---

## 5. Database & Prisma

### Rules

1. **Schema is the single source of truth.** All types flow from the Prisma schema — never define duplicate TypeScript interfaces for database entities.

2. **Use `prisma.$transaction()` for operations that must be atomic.** For example, creating an RFQ + rfq_lines + sending a notification.

3. **Never use `prisma.raw()`** unless you have a documented reason (e.g., full-text search). Raw queries bypass type safety.

4. **Migrations are forward-only.** Never edit a migration file that has already been applied to any environment. Create a new migration instead.

5. **Seed data lives in `packages/db/src/seed.ts`.** It is idempotent — running it twice must not create duplicate records.

6. **Index checklist** (already in schema, enforce on review):
   - `product.sku`, `product.slug`, `product.mpn` — unique
   - `rfq.account_id + status + submitted_at` — composite
   - `account_contact.email` — unique
   - `pricing_rule.status + priority` (future)

---

## 6. Error Handling

### Rules

1. **Every route segment has `error.tsx` and `not-found.tsx`.** These are the fallbacks for unexpected errors and 404s respectively.

2. **Server Actions return typed result objects**, not throw:
   ```ts
   type Result<T> = { success: true; data: T } | { success: false; error: string }
   ```

3. **Log errors server-side, return safe messages client-side.** Never leak stack traces or Prisma error codes to the browser.

4. **No unhandled promise rejections.** Every `await` is either in a try/catch or the function is called within a boundary that handles errors.

---

## 7. RFQ State Machine

The RFQ state machine is in `packages/domain/src/rfq-state-machine.ts`. It is the single source of truth for valid state transitions.

**Valid transitions:**
```
draft → submitted
submitted → engineer_review
engineer_review → engineer_questions_pending
engineer_review → quote_sent
engineer_questions_pending → engineer_review
quote_sent → accepted
quote_sent → declined
quote_sent → expired  (automated, when quote_expires_at passes)
accepted → order_created
order_created → fulfilling → shipped → delivered → invoiced → paid
Any state → cancelled  (admin only)
```

**Rules:**
- Call `canTransition(from, to)` before any status update
- All transitions are logged to `account_activity`
- Email notifications are fired on: `submitted`, `quote_sent`, `order_created`, `shipped`

---

## 8. Testing

### Rules

1. **Unit test all domain logic** in `packages/domain`. The RFQ state machine and any pricing logic must have 100% transition coverage.

2. **Playwright e2e tests** cover the critical paths:
   - Sign up → sign in → add product to quote → submit RFQ
   - Admin: sign in → review RFQ → mark quote sent

3. **Tests run in CI** on every PR. PRs with failing tests are not merged.

4. **Test files co-located with source:** `rfq-state-machine.test.ts` next to `rfq-state-machine.ts`.

---

## 9. Git Conventions

### Commit format: Conventional Commits

```
feat(rfq): add plant-down urgency escalation email
fix(auth): correct lockout timer not resetting on successful login
chore(db): add index on rfq.submitted_at
docs(claude): update testing rules
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`

Scopes: `auth`, `catalogue`, `rfq`, `quote`, `account`, `admin`, `db`, `ui`, `cms`, `seo`

### Branch naming

```
feat/rfq-submission-form
fix/auth-lockout-timer
chore/prisma-schema-update
```

### PR rules

- PRs must reference the phase they implement
- No direct pushes to `main`
- Squash merge only

---

## 10. Accessibility

1. All interactive elements have ARIA labels or visible text labels
2. Color alone never conveys state (always pair color with text or icon)
3. Focus rings are visible — never `outline: none` without a replacement
4. Keyboard navigation works for all flows
5. Radix UI primitives (via shadcn) handle most of this — don't bypass them

---

## 11. File Structure Reference

**One app serves both surfaces.** `apps/admin` no longer exists.

```
apps/web/
  src/
    proxy.ts                 ← middleware for BOTH surfaces (see §4)
    types/next-auth.d.ts     ← the single next-auth module augmentation
    app/
      layout.tsx             ← minimal root: <html>, fonts, globals.css, <body>
      globals.css            ← shared; admin deltas scoped to [data-surface='admin']
      not-found.tsx  robots.ts  sitemap.ts  opengraph-image.tsx  global-error.tsx
      api/                   ← auth, health, quotes, search, seo, inngest
      (storefront)/          ← SiteHeader/Footer + storefront metadata; a FRAGMENT
        page.tsx  (auth)/  account/  c/  p/  brands/  industries/  search/
        compare/  quote/  services/  blog/  replacement/  …
      admin/                 ← robots:noindex + <div data-surface="admin">
        sign-in/  api/{auth,quotes,rfqs}/
        (shell)/             ← sidebar shell: products, rfqs, seo, users, cms, …
    components/              ← storefront components
    components/admin/        ← admin components (incl. seo/)
    actions/                 ← storefront server actions
    inngest/                 ← background jobs (served at /api/inngest)
    lib/
      auth.ts                ← CUSTOMER Auth.js instance
      customer-session.ts    ← requireCustomer / isCustomerSession
      admin-auth.ts          ← STAFF Auth.js instance
      staff-session.ts       ← requireStaff / requireStaffRole
      rbac.ts                ← ROLES groups, requireRole / hasRole
      admin-paths.ts         ← ADMIN_PREFIX, stripAdminPrefix (see §12)
      cache-tags.ts          ← storefront cache invalidation (see §12)
      supabase.ts            ← read-side (signed URLs)
      supabase-admin.ts      ← write-side (uploads, service role)

packages/
  db/
    prisma/schema.prisma
    src/
      seed.ts
      index.ts               ← exports PrismaClient singleton
  ui/
    src/
      Button.tsx, Badge.tsx, Input.tsx, …
      index.ts               ← barrel export
  domain/
    src/
      rfq-state-machine.ts
      preview-token.ts       ← admin → storefront preview link signing
      spec-templates.ts
      types.ts
      index.ts
```

---

## 12. Cross-surface gotchas

Things that fail **silently** now that one app serves two surfaces. Each cost real debugging time.

1. **`/admin` prefix.** Every admin path literal — `href`, `redirect()`, `router.push()`, `revalidatePath()` — must start with `/admin`. A miss no longer 404s; it lands on a storefront route, and an un-prefixed `revalidatePath` purges the public catalogue instead of the admin list. `admin-path-prefix.test.ts` scans for this.

2. **Reading `usePathname()` in admin.** The first segment is always the literal `'admin'`. Route it through `stripAdminPrefix()` from `lib/admin-paths.ts` before treating a segment as a section key, or breadcrumbs collapse and sidebar active-state dies — silently, with no error.

3. **Cache tags are bare strings on both sides.** The storefront registers them via `unstable_cache(..., { tags })`; admin purges them. A rename on one side alone just misses, and looks exactly like a cache that has not expired. Always go through `lib/cache-tags.ts`; `cache-tags.test.ts` asserts the map matches what the storefront actually registers.

4. **Never `next-auth/react`.** Its `signIn`/`signOut` bake a base path from `NEXTAUTH_URL` at build time and always resolve to `/api/auth` — the customer instance. Use the server actions. Banned by lint.

5. **`revalidatePath('//x')` matches nothing.** A protocol-relative path is not a route. 23 of these shipped as silent no-ops before the merge.
