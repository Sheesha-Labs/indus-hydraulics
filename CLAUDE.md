# Indus Hydraulics — Coding Standards

This file is the authoritative engineering guide for this codebase. Claude Code (and all contributors) must follow every rule here without exception. These are not suggestions.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 (Auth.js) |
| Monorepo | Turborepo + pnpm workspaces |
| i18n | next-intl |
| Testing | Vitest (unit) + Playwright (e2e) |

---

## 1. Internationalization (i18n) — MANDATORY

Every feature must ship with full English and Arabic support. This is a hard requirement, not a nice-to-have.

### Rules

1. **No hardcoded strings.** Every user-visible string — button labels, headings, error messages, placeholders, aria-labels, toast messages — must come from a translation key. Hardcoded English text is a bug.

2. **Use `useTranslations()` in Client Components, `getTranslations()` in Server Components:**
   ```tsx
   // Server Component
   const t = await getTranslations('product')
   return <h1>{t('title')}</h1>

   // Client Component
   const t = useTranslations('rfq')
   return <button>{t('submit')}</button>
   ```

3. **Namespaces map to features.** Keep message files flat within a namespace. Do not deeply nest more than 2 levels.
   ```json
   // packages/i18n/messages/en.json
   {
     "auth": { "signIn": "Sign In", "email": "Email address" },
     "product": { "addToQuote": "Add to Quote", "specs": "Specifications" },
     "rfq": { "submit": "Submit RFQ", "urgency": "Urgency" }
   }
   ```

4. **Arabic keys must ship in the same PR.** If you add `en.json` keys without matching `ar.json` keys, CI will fail. The check is in `scripts/check-i18n.ts`.

5. **RTL layout.** Arabic is a right-to-left language. The `<html>` element's `dir` attribute is set automatically by the `[locale]` layout. Use Tailwind's `rtl:` variant for any mirrored layout:
   ```tsx
   <div className="pl-4 rtl:pl-0 rtl:pr-4">...</div>
   ```

6. **Locale routing.** All routes live under `[locale]` — `/en/...` and `/ar/...`. Never hardcode `/en/` in internal links; always use `usePathname()` with the current locale.

7. **Date, number, and currency formatting** must use `useFormatter()` from next-intl, not `toLocaleString()` directly.

---

## 2. Component Architecture

### Rules

1. **All shared UI lives in `packages/ui`.** Never build a one-off component inside `apps/storefront` or `apps/admin` if it could ever be reused. Move it to `packages/ui` and import it.

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

## 3. Styling

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

## 4. Data Fetching

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

## 5. Authentication & Authorization

### Rules

1. **Two completely separate auth contexts:**
   - `account_contact` — storefront/customer portal (`apps/storefront`)
   - `staff_user` — admin (`apps/admin`)
   They must never share sessions or auth backends.

2. **Middleware enforces auth on every protected segment.** Do not rely on page-level redirects. The `middleware.ts` in each app handles auth guards before the page renders.

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

## 6. Database & Prisma

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

## 7. Error Handling

### Rules

1. **Every route segment has `error.tsx` and `not-found.tsx`.** These are the fallbacks for unexpected errors and 404s respectively.

2. **Server Actions return typed result objects**, not throw:
   ```ts
   type Result<T> = { success: true; data: T } | { success: false; error: string }
   ```

3. **Log errors server-side, return safe messages client-side.** Never leak stack traces or Prisma error codes to the browser.

4. **No unhandled promise rejections.** Every `await` is either in a try/catch or the function is called within a boundary that handles errors.

---

## 8. RFQ State Machine

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

## 9. Testing

### Rules

1. **Unit test all domain logic** in `packages/domain`. The RFQ state machine and any pricing logic must have 100% transition coverage.

2. **Playwright e2e tests** cover the critical paths:
   - Sign up → sign in → add product to quote → submit RFQ
   - Admin: sign in → review RFQ → mark quote sent

3. **Tests run in CI** on every PR. PRs with failing tests are not merged.

4. **Test files co-located with source:** `rfq-state-machine.test.ts` next to `rfq-state-machine.ts`.

---

## 10. Git Conventions

### Commit format: Conventional Commits

```
feat(rfq): add plant-down urgency escalation email
fix(auth): correct lockout timer not resetting on successful login
chore(db): add index on rfq.submitted_at
docs(claude): update testing rules
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`

Scopes: `auth`, `catalogue`, `rfq`, `quote`, `account`, `admin`, `db`, `ui`, `i18n`, `cms`, `seo`

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
- Every PR that adds English UI copy must include the matching Arabic translation keys

---

## 11. Accessibility

1. All interactive elements have ARIA labels or visible text labels
2. Color alone never conveys state (always pair color with text or icon)
3. Focus rings are visible — never `outline: none` without a replacement
4. Keyboard navigation works for all flows
5. Radix UI primitives (via shadcn) handle most of this — don't bypass them

---

## 12. File Structure Reference

```
apps/storefront/
  src/
    app/
      [locale]/
        layout.tsx           ← Sets <html lang dir>, loads fonts, next-intl
        page.tsx             ← Home
        (auth)/              ← sign-in, sign-up, forgot-password
        (catalogue)/         ← c/[slug], p/[sku], search, compare, brands, industries
        (rfq)/               ← quote, quote/submit, quote/[code]
        account/             ← account portal (guarded by middleware)
    components/              ← storefront-specific components
    actions/                 ← server actions
    lib/                     ← utils, formatters, auth config
    middleware.ts

apps/admin/
  src/
    app/
      [locale]/
        layout.tsx
        (auth)/
        page.tsx             ← Dashboard
        products/
        categories/
        brands/
        rfqs/
        customers/
        media/
        cms/
        seo/
        users/
        settings/
    components/
    actions/
    lib/
    middleware.ts

packages/
  db/
    src/
      schema.prisma
      seed.ts
      index.ts               ← exports PrismaClient singleton
  ui/
    src/
      Button.tsx
      Badge.tsx
      Input.tsx
      Table.tsx
      Card.tsx
      Tabs.tsx
      FilterBar.tsx
      QuantityStepper.tsx
      EmptyState.tsx
      Stepper.tsx
      StatusPill.tsx
      KPICard.tsx
      index.ts               ← barrel export
  i18n/
    src/
      config.ts
      request.ts
    messages/
      en.json
      ar.json
  domain/
    src/
      rfq-state-machine.ts
      types.ts
      index.ts
```
