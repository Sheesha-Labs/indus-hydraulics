# Indus admin — design language

Binding on every admin screen. A new page that departs from this needs a reason
written down, not a preference.

**Where it came from.** The founder reviewed the Bazar Real Estate CMS admin
beside this one and asked for its component language, in Indus's colours. This
document is that transfer: every structural decision — component anatomy,
density, type scale, radii, borders, hover and focus behaviour, empty states —
comes from Bazar. Only the colour VALUES are Indus's, expressed as
`--color-ih-*` tokens.

Two decisions are settled and not open:

1. **The sidebar is a light rail.** `bg-ih-surface`, right border, and the
   ACTIVE item as a solid `bg-ih-navy` pill. Navy did not leave the product; it
   moved from the whole panel onto the one thing that means "you are here".
2. **Built on `packages/ui`.** shadcn is not installed and is not being
   installed (CLAUDE.md is explicit). Every component below is specified as
   anatomy, metrics and states so it can be built here.

Rules are numbered so a review can cite one.

---

> **Indus Hydraulics — Admin Design Language**
> Binding on all work under `apps/web/src/app/admin/` and `apps/web/src/components/admin/`.
> Stated entirely in Indus v2 tokens. Where a rule amends `CLAUDE.md`, it says so and §12 lists the edit.
> Rule numbers are stable — cite them in review (`LT-7`, `FE-4`).

---

## 0. What this document is, and what it is built on

The admin already has a design language declared in `apps/web/src/app/globals.css`: one `@theme` block of `--color-ih-*` tokens, a four-step radius ladder, three type families, and a `[data-surface='admin']` root of `13px / 1.45`. **Nothing here replaces that.** This document specifies how those tokens are assembled into pages — the parts `globals.css` cannot express, and the parts every page currently invents for itself.

The problem it exists to solve, measured on the tree today:

| Drift | Count |
|---|---|
| Raw `oklch(...)` literals inside `className` strings | **340** across 60 files |
| `bg-white` (outside the surface ramp) | **146** across 29 files |
| `font-semibold` (a weight the language does not have) | **84** across 40 files |
| Hand-rolled `<table>` or `grid grid-cols-[…]` pseudo-tables | **69** grid templates across 32 files, **20** `<table>` across 18 |
| Files importing `Table` from `@indus/ui` | **0** |
| `h-9` (36px) controls, against a 32px system | **220** across 59 files |
| `window.confirm()` on destructive actions | **22** across 16 files |
| `border-dashed` empty states | **30** across 29 files |
| `space-y-*` | **24** across 16 files |

Every one of those is a decision taken 20 times instead of once. The rules below take each decision once.

---

## 1. The page frame

### 1.1 The three fixed numbers

**PF-1.** The desktop shell is a two-column CSS grid: **240px** sidebar, `1fr` content. Below `md` (768px) it is one column.

```
h-full min-h-dvh-safe md:grid md:grid-cols-[240px_1fr] md:min-h-screen
```

The desktop tree and the mobile tree are **siblings inside this one element**, hidden with `hidden md:flex` / `md:hidden` — never swapped — so `children` renders exactly once, inside one shared `<main>`. Rendering the body twice is the failure this structure exists to prevent: two mounted copies of an editor means two `useState` trees, two subscriptions, and a form whose submit button belongs to the invisible copy.

*Amends CLAUDE.md §2.4 — 236px becomes 240px.*

**PF-2.** The topbar is exactly **60px** tall with **28px** horizontal padding:

```
hidden md:flex h-[60px] px-7 items-center gap-4 border-b border-ih-border bg-ih-surface
```

**PF-3.** The content gutter is **28px** at ≥md and **16px** below:

```tsx
<main className="flex-1 overflow-auto p-4 md:p-7 pb-[calc(var(--ih-tabbar-h)+16px)] md:pb-7">
```

**PF-3a — why PF-2 and PF-3 must carry the same number.** The topbar's `px-7` and `<main>`'s `p-7` are both 28px *on purpose*, so the page title's left edge sits exactly above the first content element. Both land at `240 + 28 = 268px` from the viewport left. Change one without the other and the single most visible alignment in the product breaks. Today the shell uses `px-[26px]` on both, which is internally consistent but off the 4px grid and inconsistent with the storefront's 48px; 28px is the value.

*Amends CLAUDE.md §2.4 — the admin gutter is 28px.*

**PF-4.** The content column carries `flex flex-col min-w-0 md:overflow-hidden`; `<main>` carries `flex-1 overflow-auto`. `md:overflow-hidden` on the grid item, against the grid's `md:min-h-screen`, pins that column to the viewport height — so **`<main>` is the desktop scroller** and the sidebar and topbar stay in view *without* `position: sticky`.

**Nothing in the desktop chrome is sticky or fixed.** Do not add `sticky top-0` to the topbar: with this height chain it is redundant, and the `z-20` stacking context it creates is what a sticky bulk-action bar (LT-19) then has to fight.

**PF-5.** `<main>` sets **no** `max-width` and no background of its own. It shows the body's `--color-ih-bg`. The sidebar and topbar are the only `--color-ih-surface` chrome. Page width is a per-page decision (PF-9).

**PF-6.** The vertical gap between the topbar and the first page element is `md:p-7`'s top padding — **and nothing else**. No page adds a root `mt-*`. One rule owns the top gap so no page can drift 4px from its neighbour.

### 1.2 Who owns the bar

**PF-7.** The **page** renders the shell, not the layout. Every admin page renders `<AdminPageShell>` as its root and passes its own title, breadcrumb and actions. `app/admin/(shell)/layout.tsx` renders **zero page chrome** — it is the auth/role gate, the sidebar, and the providers.

This is already how Indus works, and `apps/web/src/lib/admin-page-shell.test.ts` asserts it. **Keep the pattern and keep the test.** The reasoning is documented at length in `AdminPageShell.tsx` and remains correct: the page is the only node where the fetched row that names the title, the `<form>` a submit belongs to, and the client state a toggle reads all exist together.

Props:

```ts
title: ReactNode          // required
breadcrumbs?: ReactNode   // renders ABOVE the title
primary?: ReactNode       // at most one Button
secondary?: ReactNode     // always a bare text link, never a button
notifications?: ReactNode
children: ReactNode
```

`title`, `breadcrumbs`, `primary` and `secondary` are `ReactNode`, never `string` — two subtitles carry inline markup and two carry a page's only link back to its parent, so a `string` prop silently deletes an exit route.

**PF-7a.** `bodyClassName` is **removed**. It exists today as an escape hatch and is used by six files to re-type the gutter by hand (`px-[26px] py-6 pb-16 max-w-[960px]`), which is exactly how the gutter drifted. Width caps live on the page's own body wrapper (PF-9), not on the shell.

**PF-8.** One exception to PF-7: a route group whose children all share one title may host the shell in its own sub-layout, with a **220px** left rail of sub-tabs and a **920px** body. `/admin/settings` is the sole instance. Do not generalise it.

**PF-9.** Content width caps by page role. One value per role, no others:

| Role | Cap |
|---|---|
| List / index page | **none** — full-bleed to the 28px gutter |
| Detail page with right rail | **none** — the grid handles it |
| Card-stack editor, no rail | **860px** |
| Create ("New X") form | **672px** (`max-w-2xl`) |
| Settings body | **920px** |
| Running prose | **60ch** |

The 28px gutter is a *frame*, not a *measure*. Without an inner cap a settings page runs edge-to-edge on a 2560px monitor and becomes unreadable. The admin currently ships **eleven** different caps (`max-w-[640px]`×10, `max-w-4xl`×10, `max-w-[800px]`×7, `max-w-[960px]`×6, `max-w-2xl`×5, `max-w-[380px]`×4, `max-w-3xl`×4, `max-w-[860px]`×3, `max-w-[720px]`×3, `max-w-[680px]`×3, `max-w-[560px]`×3), so the content column jumps width on almost every navigation.

### 1.3 Page body shapes

**PF-10.** Wrap page content in **exactly one** layout div directly inside the shell, in one of two shapes:

**List / index:**
```tsx
<div className="flex flex-col gap-6">
```

**Detail:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
  <div className="flex flex-col gap-6 min-w-0">…</div>
  <aside className="sticky top-7 flex flex-col gap-6">…</aside>
</div>
```

`items-start` is load-bearing: without it the `<aside>` stretches to the grid row's height and `sticky` never engages. `min-w-0` is load-bearing: without it a wide table in the main column blows the `1fr` track out and pushes the rail off-screen. The rail sticks at `top-7` (28px) so a pinned rail aligns with the content column's own top edge.

**PF-11.** Do not put a `max-w-*` on an inner `<form>` or tab panel. One cap, on the one body wrapper, so every card ends on the same right edge. The product editor currently alternates 768px and 896px between tabs, so the card edge jumps 128px as you move between Core and Description.

### 1.4 Mobile frame

The admin has **no mobile frame today** — zero `md:hidden` occurrences, no app bar, no tab bar, and a 236px navy rail that renders at every viewport, leaving 139px of content at 375px. When it is built, it is built to these rules.

**PF-12.** Mobile app bar: `sticky top-0 z-30 border-b border-ih-border bg-ih-surface pt-safe` wrapping `flex h-14 items-center gap-2 px-2`. Title `min-w-0 flex-1 truncate px-1 text-center text-[16px] font-medium text-ih-ink`. Actions `flex items-center gap-1 min-w-0 shrink overflow-x-auto`. Search is omitted. The `overflow-x-auto` on the action rail is what stops a wide CTA plus a view-toggle pushing the page past the viewport.

**PF-13.** Mobile bottom tab bar: `fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-ih-border bg-ih-surface px-2 pt-1.5 pb-safe`. Tab: `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5`. Active icon pill `h-[26px] w-10 rounded-full bg-ih-navy text-ih-bg`; idle icon `text-ih-muted`. Icon `size-[18px]`. Label `text-[10px] font-medium`, `text-ih-navy` / `text-ih-muted`. App bar `z-30`, tab bar `z-40`.

The safe-area inset is applied **once per stacked column, on the bottommost fixed element**, or the home-indicator gap double-counts. It requires `viewportFit: 'cover'` on the root viewport export — without it `env()` reports 0 and every safe-area rule is inert.

**PF-14.** Reserve the tab bar's height with a token, and make the reservation match the render. Rendered height is `pt-1.5` (6px) + `min-h-12` (48px) + safe inset:

```css
--ih-tabbar-h: calc(54px + var(--ih-safe-bottom));
```

---

## 2. Navigation

### 2.1 Sidebar — a light surface

**NAV-1.** The sidebar is a **light `--color-ih-surface` panel**, not a navy rail.

```
hidden md:flex bg-ih-surface border-r border-ih-border flex-col py-5 px-3.5 gap-1 overflow-y-auto
```

20px vertical padding, 14px horizontal, 4px between group blocks. Separation from the content region is the **1px right border, never a shadow** — the content region has no fill of its own, so the border is the seam.

*Why this is the single biggest change in the programme:* the navy rail forces every colour inside it off the token layer. The current file carries **six raw `oklch()` literals** (`oklch(0.84 0.02 250)` for idle text, `oklch(0.68 0.035 250)` for group labels, `oklch(0.7 0.03 250)` for the sublabel and role, `oklch(0.86 0.02 250)` for the LIVE chip) and **three `bg-white/[0.07]` opacity hovers**, because the four-step ink ramp and the four-step surface ramp are both defined against a light ground and none of them works on navy. On a light sidebar every one of those becomes a token.

**NAV-2.** Brand block: `<div className="px-2.5 pb-5">` wrapping a link to `/admin` containing the wordmark — `.serif`, 18px, `leading-none` — plus a sublabel at `text-[12px] text-ih-muted tracking-wider`. No border under it (NAV-6).

**NAV-3.** Group label:

```
px-2.5 pt-3.5 pb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ih-muted-2
```

**Never a divider line between groups** — the label's own 14px top padding *is* the group separation. The label is deliberately lighter than the items it heads (`muted-2` vs `ink-2`) so it reads as furniture, not as a link.

**NAV-4.** Nav item:

```
flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors
```
Icon `size={15} strokeWidth={1.6}`. Items butt against each other with no gap; each is ~36px tall (8 + 8 + ~19.5).

- **Active:** `bg-ih-navy text-ih-bg` — a solid navy pill. Not a tint, not a left bar, not accent.
- **Idle:** `text-ih-ink-2 hover:bg-ih-surface-2`.

**NAV-5.** Active state is derived from the pathname, never from React state:

```ts
item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
```

The dashboard needs the exact match or it stays lit on every child route. **Route the pathname through `stripAdminPrefix()` from `lib/admin-paths.ts` first** — CLAUDE.md §12.2: the first segment is always the literal `admin`, and skipping this kills sidebar active-state silently.

**NAV-6.** The sidebar footer is pinned with `mt-auto pt-4 border-t border-ih-border`. **That top rule is the only divider inside the sidebar.** The brand block's bottom border and the store-indicator's four-sided box both go.

**NAV-7.** The user pile is a full-width dropdown trigger, not a row with a stray icon button:

```
w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-ih-surface-2 transition-colors text-left
```
- Avatar `w-8 h-8 rounded-full bg-ih-accent text-ih-accent-fg text-[11px] font-medium` — two-letter initials, uppercase
- Name `text-[13px] font-medium truncate`
- Role `text-[11px] text-ih-muted capitalize` — **sans, not mono uppercase**
- Trailing `MoreVertical size={15}` in `text-ih-muted`

The menu opens `align="start" side="top"` at width 224px, and holds *View storefront* and *Sign out*. Signed-out degrades to a static disc `bg-ih-surface-3 text-ih-muted text-[12px]` plus "Signed out", with no dropdown.

### 2.2 Topbar

**NAV-8.** The left block is `flex-1 min-w-0`, with the breadcrumb **stacked above** the title:

- Breadcrumb: `text-[11.5px] text-ih-muted mb-0.5 [&_a]:text-ih-accent [&_a:hover]:text-ih-navy [&_.mono]:text-ih-navy`
- Title: `text-[18px] font-medium tracking-tight`, colour inherited from `--color-ih-ink`

The arbitrary `[&_a]` variants exist so a page can pass raw `<Link>`s with no styling and still get the correct link colour; `.mono` is the hook for reference codes and slugs inside a crumb. Today the shell renders `sub` *below* the title, which reads as a subtitle and cannot carry a navigational crumb.

**NAV-9.** Breadcrumb node shape, one form only:

```tsx
<span className="inline-flex items-center gap-1">
  <Link …/><ChevronRight size={11} strokeWidth={1.7} />{terminal}
</span>
```
Bare strings are permitted for a one-level crumb ("Catalogue", "Content · Blog"). **No `/` separators. No `←` back-links in the crumb slot** — the crumb link *is* the exit.

**NAV-10.** Right cluster order, left to right: **search → live → notifications → secondary → primary.** Ambient status sits left of user-triggered actions, and the page's own CTA is always the rightmost thing in the bar. Mobile keeps the order minus search.

**NAV-11.** Topbar search: `relative w-[280px]` wrapping

```
w-full h-8 pl-9 pr-3 bg-ih-surface-2 border border-ih-border rounded-lg text-[13.5px]
outline-none transition-colors
focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft
```
with `Search size={15}` at `absolute left-3 top-1/2 -translate-y-1/2 text-ih-muted pointer-events-none`. It is 32px like every other control, and it sits on `surface-2` because a `surface` field on a `surface` bar is distinguished only by its border.

**NAV-12.** The topbar title is the page's `<h1>`. `AdminPageShell` already renders it as `<h1>` — **keep that**, and do not add a second `<h1>` in the body. Where a page opens with a display serif headline (dashboard, analytics, settings), that headline is the `<h1>` and the bar title becomes a `<div>`. Exactly one `<h1>` per page, never two.

### 2.3 Mobile navigation

**NAV-13.** The sidebar's N groups collapse to **5 thumb tabs**: four section roots plus "More", which opens a bottom sheet. The active tab is derived from the pathname via a prefix map that falls through to `more` — never from `useState`, or server and client disagree on first paint.

**NAV-14.** More sheet: bottom sheet, `gap-0 rounded-t-2xl p-0`, `maxHeight: 92dvh`, grab handle `mx-auto mt-2.5 h-1 w-9 rounded-full bg-ih-border-strong`, body `min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-4`. Sheet nav item `flex items-center gap-3 rounded-lg px-2 py-2.5 text-[14px] transition-colors`, active `bg-ih-navy text-ih-bg`, idle `text-ih-ink-2 active:bg-ih-surface-2`, icon `size={17} strokeWidth={1.6}`.

The sheet reads the **same `NAV_SECTIONS` constant** as the sidebar — one source of truth — and closes itself on navigate. 14px/`py-2.5` against the sidebar's 13px/`py-2` is deliberate: these are touch targets.

---

## 3. Lists and tables

### 3.1 Page body

**LT-1.** A list page's body owns **no header chrome**. Title, breadcrumb and the New-X button all come from the shell (PF-7, NAV-10). Four catalogue pages currently put their CTA in the body as the first stacked element while products puts it in the bar — same job, two places, one click apart.

**LT-2.** Body stack — `<div className="flex flex-col gap-6">` — in this order:

> filter bar → bulk bar → counts line → table → pagination

**LT-3.** The counts line sits **immediately above the table**, left-aligned, `text-[12.5px] text-ih-muted`, singular/plural aware, with extra facts chained after ` · `:

> `{n} products · {n} live · {n} drafts`

12.5px, not 13px: the line must sit *below* the 13px table body it labels. An optional right-side hint shares the row via `flex items-baseline justify-between` at `text-[12px] text-ih-muted` ("Click a row to open the editor.").

The count does **not** go in the topbar. It is currently in the shell's `sub` slot on ten pages, rendering at 11.5px in a 60px bar where the eye is not looking for it — and on `spec-templates` an entire explanatory sentence is run into the bar.

### 3.2 The table

**LT-4. One table language.** Every list of ≥4 comparable columns is a real `<table>` built from `@indus/ui`'s `Table` primitives. There are currently **six competing header dialects** and **32 files** hand-rolling `grid grid-cols-[…]` pseudo-tables, none of which can scroll horizontally, none of which has a `<th>`, and three of which declare a *different* column template for a row and for that same row's edit state — so the columns visibly re-flow the instant you click Edit.

**LT-5.** Table container, written once in the primitive:

```
rounded-lg border border-ih-border bg-ih-surface overflow-x-auto
```
Radius 10px, 1px border, surface fill, **no shadow**. The card edge is the only thing separating the table from the page ground, because neither the header row nor the body rows carry a fill.

**LT-6.** `<table className="w-full text-[13px]">`. Size is set **once on the table element**, never per cell — that is what stops a row's cells drifting apart.

**LT-7.** Header row `<tr className="text-left border-b border-ih-border">` — **no background fill**. Each `<th>`:

```
whitespace-nowrap px-4 py-3 font-mono text-[10.5px] font-medium uppercase
tracking-[0.08em] text-ih-muted-2 align-bottom
```
First column `px-4`, every subsequent column `px-3`.

Mono at 10.5px on 0.08em tracking is the micro-label. `tracking-[0.1em]` is the *sidebar group label* value and does not belong here; `tracking-wider` (0.05em) and `tracking-[0.04em]` are not on the ladder at all. The ink is `muted-2`, the faintest stop — a column header is furniture.

Thirteen tables currently paint the header row `bg-ih-surface-2`, **which is also the row-hover colour**, so hovering a row makes it indistinguishable from the header.

**LT-8.** Body cell: `px-4 py-3` first column, `px-3 py-3` after, plus `align-middle whitespace-nowrap`. Derived row height ≈ **43px**.

Row:
```
border-b border-ih-border last:border-b-0 hover:bg-ih-surface-2
```
**No zebra striping. No state striping.** The last row drops its rule so the table ends on the container edge, not a floating hairline. Use `border-b … last:border-b-0`, never the `i > 0 ? 'border-t …'` conditional.

Row hover has **no transition** — this is the one place the 150ms hover rule does not apply, and `packages/ui/src/Table.tsx` already documents why: instant response reads as more responsive in a dense table. (This is a deliberate Indus decision and it is *kept*, not replaced.)

A row is ~2.5× denser than a form field (FE-6). Lists are for scanning many; forms are for editing one.

**LT-9.** Column widths: give a **percentage width to the primary (first) column only** and let every other column auto-size. Default `w-[40%]`; drop to `w-[32%]` when the row also carries a checkbox and ≥7 other columns. Fixed px only for a checkbox column (`w-[44px]`) and a trailing icon-actions column (`w-[40px]`).

The title column is the only one whose content length is unbounded. Pinning it and freeing the rest keeps data columns snug with no layout algorithm.

**LT-10.** Primary cell anatomy — a whole-cell link, `block hover:text-ih-accent transition-colors`, containing exactly **two** lines:

```tsx
<div className="font-medium truncate max-w-[42ch]">{title}</div>
<div className="mono text-[11px] text-ih-muted mt-0.5">{sku | reference | slug}</div>
```

The mono second line is the row's real identity and is machine text; that pairing is what makes a row recognisable at a glance. **Never a third stacked line** — the RFQ list currently stacks code + subject + engineer and runs ~63px against its neighbours' ~50px.

Where a thumbnail leads, the link becomes `flex items-center gap-3` with a `h-9 w-9 shrink-0 rounded-md border border-ih-border bg-ih-surface` thumb, or a `w-9 h-9 rounded-full bg-ih-surface-3 text-[12px] font-medium` initials disc. Where the second line is prose rather than an identifier, drop mono: `text-[11.5px] text-ih-muted mt-0.5 truncate max-w-[60ch]`.

**LT-11.** A status pill in a cell is CS-6, at its fixed 22px height — readable inside a 12px-padded cell without adding row height.

**LT-12.** **List timestamps are always relative**, from one shared helper, right-aligned, `text-[12px] text-ih-muted`, **sans** (TY-3.6).

Ladder: `just now` · `{n}m ago` · `{n}h ago` · `today` · `yesterday` · `{n}d ago` · `{n}mo ago` · `{n}y ago`. Null renders `—`.

Relative dates compress to ~5 characters, which is what lets an Updated column sit in an already-tight table. There are currently at least **nine** date renderings in the admin, including four bare `toLocaleDateString()` calls with no locale argument — which produce a *different string on the server and on the client* and are a live hydration hazard, not only a style one.

*Exception:* an audit/evidence table shows both — bold relative over `mono text-[11px] text-ih-muted` absolute UTC via `toLocaleString('en-GB', { …, timeZone: 'UTC' })`.

**LT-13.** Row actions live in a **right-aligned final column**, and a table uses one form, never both:

- **Text-link form** (default): cell `text-right` wrapping `<span className="inline-flex items-center justify-end gap-2">`; each action `inline-flex items-center gap-1 text-[12px] text-ih-muted hover:text-ih-ink transition-colors` with a lucide icon at `size={12} strokeWidth={1.7}`.
- **Icon-button form** (≥3 actions): 24px ghost icon buttons, `h-6 w-6 text-ih-muted transition-all`, icons `size={13} strokeWidth={1.7}`, each carrying **both** `aria-label` and `title`.

An unavailable action renders `<span className="text-[12px] text-ih-muted-2">—</span>` so the column never collapses.

**A destructive action is never red at rest.** A table of red icons reads as an alarm panel and the eye stops distinguishing the one that matters. Red arrives on hover only, through the shared `DANGER_HOVER` constant (CT-8). Five row-action sites are `text-ih-danger` at rest today.

10px mono is not a row action. It is 2.5px below the floor of the type scale and it is the eyebrow treatment being used for interactive text — there are 18 of them.

**LT-14.** In-flight row state swaps **the whole action group** for `<Loader2 size={13} className="animate-spin text-ih-muted" aria-label="Working" />`. Replacing a 24px icon button with a 13px spinner preserves the column width exactly.

**LT-15.** A wide table scrolls by giving the **table** an explicit `min-w-[720px]` (or `min-w-[640px]`) inside the `overflow-x-auto` container. Percentage widths alone do not scroll — the table just squeezes, and because cells are `truncate`, data silently disappears. Never nest two scroll containers.

Below `md` the scroller bleeds to the gutter: `overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0`, outside the bordered card. `-mx-4 px-4` matches the shell's mobile `p-4` so the card still starts at the gutter. **There is no per-row mobile collapse** — tables scroll sideways below md.

### 3.3 Filters

**LT-16.** Filter controls sit directly under the topbar, above the counts line. **All filter state lives in the URL** (`?status=`, `?view=`, `?scope=`), and changing a filter resets the page param. That is what makes a deep link from the dashboard land on the right tab and the back button work; client state breaks both. Four shapes, chosen by cardinality:

**(a) Underline tabs** — a status partition of one list:
```
nav:   role="tablist" border-b border-ih-border flex gap-5
item:  role="tab" aria-selected  py-3 inline-flex items-center gap-2 text-[13.5px] border-b-2 -mb-px transition-colors
       active  border-ih-accent text-ih-accent
       idle    border-transparent text-ih-muted hover:text-ih-ink-2
count: mono text-[11px] px-1.5 rounded-sm
       active  bg-ih-accent text-ih-accent-fg
       idle    bg-ih-surface-2 text-ih-muted
```
Spacing comes from `gap-5` on the nav, not from `px-4` on the item. The active label takes **accent, not ink** — with ink, the only active signal is a 2px underline. The count is a chip, not text concatenated into the label string.

**(b) Segmented tray** — a 2–5-way view switch:
```
tray: inline-flex rounded-md border border-ih-border bg-ih-bg p-0.5
item: inline-flex items-center gap-1.5 h-7 px-2.5 rounded-sm text-[12px] transition-colors
      active bg-ih-navy text-ih-bg font-medium · idle text-ih-ink-2 hover:text-ih-ink
count: mono text-[10.5px] · text-ih-bg/80 active · text-ih-muted idle
```

**(c) Chip row** — scopes:
```
nav:  flex gap-1
item: px-3 h-8 inline-flex items-center rounded-md text-[13px] transition-colors
      active bg-ih-navy text-ih-bg · idle text-ih-ink-2 hover:bg-ih-surface-2
```
No border on the chip, no mono, no uppercase.

**(d) Input filter bar** — free-text / date / enum:
```
bar:   flex flex-wrap items-center gap-2
text:  h-8 px-2.5 bg-ih-surface border border-ih-border rounded-lg text-[12.5px] w-[200px] (or w-[260px])
pair:  inline-flex items-center h-8 bg-ih-surface border border-ih-border rounded-lg overflow-hidden
label: px-2 border-r border-ih-border font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-muted-2
```
A select's label lives **inside the control shell**, not stacked above it in 10px mono. Stacked micro-labels above 36px controls is what makes the SEO inspector's filter bar two rows tall for four filters.

**LT-16a.** Tab bars are `<Link>` navs over URL state carrying `role="tablist"` / `role="tab"` / `aria-selected` — never a client-state `Tabs` component. Deep links, the back button and server rendering all depend on it. `aria-current="page"` is not a substitute: it says "this is the current page", not "this tab is selected".

### 3.4 Pagination and bulk

**LT-17. Paginate every list.** Indus has 1,138 products, and the SEO Inspector currently renders *every* SEO-bearing row (all products + categories + brands + industries + blog + CMS pages) into one unpaginated DOM table. `rfqs` and `customers` have no `take` at all; `blog` caps at 200, `audit` at 200, `ai/runs`/`not-found`/`scraper` at 100 — all with no UI saying rows were cut. `packages/ui/src/Pagination.tsx` exists and has almost no importers.

Control anatomy:
```
wrap:     flex items-center gap-2 self-end
link:     inline-flex items-center gap-1 px-2 h-8 text-[12.5px] text-ih-ink hover:text-ih-accent transition-colors
disabled: pointer-events-none opacity-40 text-ih-muted
position: text-[11.5px] text-ih-muted  →  {page} / {pages}
chevrons: size={13} strokeWidth={1.7}
```
Returns `null` when `pages <= 1`. Page state is **0-indexed in the URL and rendered 1-indexed**. Keep the counts line *and* the control.

**LT-18.** Multi-select, where a list has it: a `w-[44px]` checkbox column; checkbox `h-3.5 w-3.5 accent-[--color-ih-accent] cursor-pointer disabled:cursor-not-allowed`; the header checkbox is tri-state via `ref={el => { if (el) el.indeterminate = state === 'some' }}`. A selected row takes `data-state="selected"` **and** an explicit `bg-ih-surface-2`. Selection is held in the URL and capped — URL-held selection survives a filter change or a refresh, which is what makes a 100-row bulk publish safe.

**LT-19.** Bulk action bar:
```
sticky top-0 z-30 -mx-7 px-7 py-3 bg-ih-accent-soft border-y border-ih-border
flex items-center gap-3 flex-wrap
role="region" aria-label="Bulk actions"
```
Returns `null` at zero selection. Count chip `inline-flex items-center h-6 px-2 rounded-full text-[12px] font-medium bg-ih-ink text-ih-bg`. Clear button `h-7 px-2 text-[12px] text-ih-muted hover:text-ih-ink`. Destructive dialogs pushed right with `ml-auto`.

`top-0` is correct **because `<main>` is the scroller** (PF-4) — it parks the bar flush under the topbar. The 28px bleed matches the shell gutter.

### 3.5 When not to use a table

**LT-20.** Reach for a table only when rows have **≥4 comparable columns**. Otherwise:

- **Card list:** `<ul className="flex flex-col gap-2">` → `block bg-ih-surface border border-ih-border rounded-lg p-4 hover:border-ih-border-strong transition-colors`; inside, `flex items-start gap-4`; title `font-medium text-[14.5px]`; body `text-[13px] text-ih-ink-2 mt-2 line-clamp-2 leading-snug`; meta `flex flex-wrap gap-3 text-[11.5px] text-ih-muted mt-2.5`; trailing `flex flex-col items-end gap-2 flex-shrink-0` with `ChevronRight size={14} strokeWidth={1.6}`.
- **Card grid:** `grid gap-3 sm:grid-cols-2 xl:grid-cols-3`, card `flex h-full flex-col gap-1 rounded-lg border border-ih-border bg-ih-surface p-4 hover:border-ih-accent transition-colors`.
- **Divided list:** container as LT-5 plus `overflow-hidden` → `<ul className="divide-y divide-ih-border">` → row `flex items-center gap-4 px-4 py-2.5 text-[13px]`.

A two-line brief with a wrapping meta row cannot live in a `whitespace-nowrap` table cell. The shared border / radius / fill keeps the cards reading as the same family as the tables.

---

## 4. Forms and editors

**FE-1.** A record editor is PF-10's detail grid: `1fr` main + `320px` rail, 24px gutter, `items-start`, rail `sticky top-7`, rail cards stacked at `gap-6`.

**FE-2.** An editor with no rail is a single stack capped at 860px: `flex flex-col gap-5 max-w-[860px]`. A create form is `flex flex-col gap-5 max-w-2xl` (672px).

**FE-3.** Two card strings, written in this order every time:

```
Form card:  bg-ih-surface border border-ih-border rounded-lg p-6 flex flex-col gap-5
Rail card:  bg-ih-surface border border-ih-border rounded-lg p-5 flex flex-col gap-4
```
24px padding / 20px between fields for a form card; 20px / 16px for a rail card. **Fields never sit naked on the page ground** — six editors currently do that, including both user forms and both blog/CMS editors.

**FE-4.** A field is a 6px vertical stack holding **Label → control → hint → error**, in that DOM order, hint above error:

```tsx
<div className="flex flex-col gap-1.5">
  <label className="flex items-center gap-2 text-[14px] font-medium leading-none text-ih-ink">…</label>
  {control}
  <p className="text-[11.5px] text-ih-muted">{hint}</p>
  <p className="text-[11.5px] text-ih-danger">{error}</p>
</div>
```

The label is `flex items-center gap-2` so an icon or an AI-suggest adornment can sit beside the text without extra alignment.

The 6px-inside / 20px-between ratio (1 : 3.3) is what makes a label unambiguously belong to the control *under* it rather than the one above — the classic label-orphaning failure.

**A field label is sans sentence case, never the mono uppercase eyebrow.** The string `block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5` is copy-pasted **81 times** across the admin as a field label. That is the `.eyebrow` treatment, which FE-9 reserves for *sub-section headings*. Using it for both means a form has no visual distinction between "this section is called Pricing" and "this box is called Price".

There are currently **eleven** local `function Field(...)` definitions in the admin, in five different label treatments, while `packages/ui/src/Field.tsx` exports `Field` / `Label` / `Hint` / `ErrorText` with the wiring already solved (a `useId()`-backed context that guarantees `htmlFor`/`id` association — the failure mode it exists to prevent is invisible in a screenshot, which is how ~150 unassociated labels once accumulated). **Import it. Do not write a twelfth.**

**FE-5.** **Requiredness is never marked on the label** — no asterisk, no "(required)", no `aria-required`. It is carried by hint prose and by the publish card's pre-flight checklist (FE-14).

Saving a draft is never blocked on a field, so marking a field required on the label *lies*: the eleven `Title *` / `Slug *` / `Body *` labels in the tree all sit on forms that save happily with the field empty. The gate is publish, not save.

**CT-0 — one tone vocabulary.** Every component that colours by meaning takes
the same six names, exported as `Tone` from `packages/ui/src/tone.ts`:

```
neutral · info · success · warning · danger · accent
```

Before this, `StatusPill` said `good`/`warn`, `Callout` said `success`/`warning`,
and `Toast` had neither a warning nor an info tone. Writing `warn` where
`warning` belonged was a compile error in one component and silently wrong in
another, and a warning could not be expressed as a toast at all. The retired
names (`good`, `warn`, `ok`, `error`, `muted`, `note`, `default`) are listed in
`LEGACY_TONE_ALIASES` with their replacements, and `tone.test.ts` fails the
build if a second vocabulary starts to grow.

`Badge`'s `kind` is NOT a tone — it is the visual palette a tone resolves to,
and it keeps its own names. `StatusPill`'s `TONE_KIND` is the single place the
two are translated, which is why `warning` maps to Badge's `warn` there and
nowhere else. The blog block schema in `packages/domain/src/blog-blocks.ts` is
also out of scope: its tone enum validates PERSISTED content and changing it is
a data migration, not a refactor.

**FE-6.** Control geometry — one set, no exceptions:

| Control | Height | Padding | Radius | Type |
|---|---|---|---|---|
| Input | **32px** (`h-8`) | `px-2.5 py-1` | **10px** (`rounded-lg`) | `text-[16px] md:text-[14px]` |
| Select trigger | **32px** | `pl-2.5 pr-2 py-2` | **10px** | 14px |
| Textarea | auto (`rows` 3 / 4) | `px-3 py-2` | **10px** | 14px, `leading-[1.55]`, `resize-y` |
| Button (default) | **32px** | `px-2.5` | **10px** | 14px / 500 |

All on `bg-transparent`, `border border-ih-border`.

16px under `md` on inputs is the iOS zoom-on-focus guard; `md:text-[14px]` returns it to the admin's own size. Input and select share one horizontal padding so their text aligns in a grid — today input is `px-3` and select is `px-2`, so a select's text sits 4px left of the input above it.

*Amends CLAUDE.md §2.3 — the control radius is 10px, not 6px. Amends CLAUDE.md §10.8 — 32px is the admin default control height, not a dense-table exception.* The admin currently ships 220 × `h-9` and 22 × `h-10`; mixing 32, 36 and 40 breaks every `flex items-center` control row.

**FE-7.** Focus, invalid and disabled — on **every** control, textareas included:

```
outline-none
focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft
aria-invalid:border-ih-danger  aria-invalid:ring-[3px] aria-invalid:ring-ih-danger-soft
disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-ih-surface-2 disabled:opacity-50
```

This is CLAUDE.md §10.3's contract, correctly spelled (see §12 — §10.3 currently names two tokens that do not exist). Roughly 60 controls in the admin declare a border-only `focus:` with no ring, and roughly 60 more declare no focus treatment at all and fall back to the global `:focus-visible { outline: 2px solid … }` in `globals.css` — which means tabbing across one form alternates between three different focus looks.

**FE-8.** Field groups are a responsive grid at the **same 20px gap as the vertical stack**:

```
grid grid-cols-1 md:grid-cols-2 gap-5
grid grid-cols-2 md:grid-cols-4 gap-5      (numeric quartet)
grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5
```
A 12px horizontal gap against a 20px vertical one makes a *pair* of fields read as one control. And `grid-cols-2` with no breakpoint — seven instances in the settings page alone — puts two 32px inputs side by side at 375px.

A lone narrow field is capped, not stretched: `flex flex-col gap-1.5 max-w-md`.

**FE-9.** Section headings inside a card — **two forms only, never both in one card**:

- **Sub-section eyebrow** (rail cards, in-card groups): the existing `.eyebrow` class — mono, 10.5px (10px under `[data-surface='admin']`), 500, uppercase, 0.13em, `--color-ih-muted`. Use the class; do not re-type the string.
- **Settings panel head:** `<h2 className="text-[15px] font-medium tracking-tight">` + `<p className="text-[12.5px] text-ih-muted mt-1 leading-[1.55]">`, over a `mb-4 pb-4 border-b border-ih-border` divider.

**FE-10.** A form with more than ~6 field groups splits into tabs **whose panel is the card** — the panel class is FE-3's form-card string plus `mt-6`, so tabs and card read as one surface.

Maintain a `FIELD_TAB` map from field name → owning tab, and on a failed validation **open that tab and toast the message**. This is load-bearing, not decoration: an unmounted tab panel swallows its own inline error, so a failed Save looks like it did nothing.

**FE-11.** Save is a **right-aligned** footer row below the card stack: `flex items-center justify-end gap-3`.

On a long form it becomes sticky to the bottom of the scroller — `… sticky bottom-0 bg-ih-bg pt-3 pb-2` — with the dirty readout pushed left by `mr-auto`:

```tsx
<span className="text-[12px] text-ih-muted mr-auto">
  Editing <span className="mono text-ih-ink-2">{reference}</span>{isDirty ? ' · unsaved changes' : null}
</span>
<Button type="submit" disabled={pending || !isDirty}>
  <Save size={14} strokeWidth={1.8} />{pending ? 'Saving…' : 'Save'}
</Button>
```

`disabled={pending || !isDirty}` on **every** editor — a Save button that is live on a clean form invites a no-op write and an audit-log entry for nothing. Sticky save bars are always at the **bottom**.

**FE-12.** **Publishing lives only in the right rail, never in the form footer.** Rail buttons stack full-width at 8px — `<div className="flex flex-col gap-2">` — Save draft (`outline`) on top, then the primary publish/revert, then a `ghost` archive with `justify-center`.

The publish button is wired to the form by `form="<form-id>"` + `name="intent" value="publish"`, **not its own action.** Publishing on its own re-reads the row from the DB, so unsaved body text is invisible to it and a fresh record reports "Body is empty" while the author is looking at the body they just typed.

**FE-13.** Above those buttons, a definition list of record state:

```tsx
<dl className="text-[12.5px] flex flex-col gap-2">
  <div className="flex justify-between"><dt className="text-ih-muted">…</dt><dd>…</dd></div>
</dl>
```
Status / Last edited / Published / Author. Status renders as the 20px pill (CS-7). Absolute dates here, via `toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })`; null renders `—`.

**FE-14.** Where publishing has preconditions, render them as a **live checklist** in the rail and disable publish until all pass:

eyebrow "Pre-flight" → `<ul className="flex flex-col gap-1">`, row `flex items-center gap-2 text-[13px]` toggling `text-ih-ink` / `text-ih-muted`, marker `<CheckCircle2 size={14} strokeWidth={1.8} className="text-ih-success" />` vs `<Circle size={14} strokeWidth={1.8} className="text-ih-muted-2" />`. Per-failure remediation copy at `mt-2 text-[11.5px] text-ih-muted`, naming the tab to fix it in. Blocked footer:

```tsx
<p className="flex items-start gap-1.5 text-[12px] text-ih-muted">
  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
  Resolve every pre-flight check above before publishing.
</p>
```

Checks are computed from **server-rendered row values**, so any successful mutation must call `router.refresh()` or the checklist goes stale and blocks a publish that would now succeed.

**FE-15.** A card that owns its own persistence puts a small Save in its **header row**, not the page footer:

```
flex items-center gap-3
  <div className="mr-auto">  <h2 className="text-[13.5px] font-medium">  <p className="text-[11.5px] text-ih-muted">
  {dirty ? <span className="text-[11.5px] text-ih-muted">Unsaved changes</span> : null}
  <Button size="sm" disabled={pending || !dirty}><Save size={13} strokeWidth={1.8} />{pending ? 'Saving…' : 'Save'}</Button>
```

**FE-16.** Nullable enum selects use a sentinel: `const UNSET = '__unset__'` with a leading `<SelectItem value={UNSET}>Unset</SelectItem>`, mapped back to `null` on change. An empty-string option value is not addressable.

**FE-17.** Server-side field errors merge into a `serverFieldErrors` record and render through the **same** `<ErrorText>` as client validation — `errors.x?.message ?? serverFieldErrors.x`. Never a separate banner, and never an error span parked next to the submit button where the field it refers to is 400px away.

---

## 5. Cards and panels

**CP-1.** A card is **1px border + 10px radius + surface fill**. **No shadow, ever, on a card.** Elevation in the admin is border-only; shadows (`--shadow-2`) are reserved for true overlays (CT-13).

```
bg-ih-surface border border-ih-border rounded-lg p-{n}
```
Written in that order every time. There are currently ~60 bordered containers in the SEO cluster alone with no radius at all, and four whole catalogue pages (`categories`, `brands`, `industries`, `spec-templates`) that contain **zero** `rounded-*` classes — every card, table, button, input and pill on those pages renders at radius 0 while the rest of the product is at 10px.

**CP-2.** Padding by role — chosen by how much the box holds:

| Role | Padding | Internal stack |
|---|---|---|
| Form / section card | `p-6` (24px) | `gap-5` (20px) |
| Rail card, KPI tile, stat card | `p-5` (20px) | `gap-4` (16px) |
| List-row card, grid tile | `p-4` (16px) | `gap-1.5`–`gap-2` |
| Inline note / callout | `p-3` (12px) | — |
| Empty state (non-table) | `p-12` (48px), centred | — |

`p-8` is not on the ladder.

**CP-3.** A **clickable** card's hover affordance is a **border darken**, not a shadow and not a fill: `hover:border-ih-border-strong transition-colors`. A card that navigates to a *create* action uses `hover:border-ih-accent`. The admin has almost no shadows, so hover-raise has to be expressed in the one line weight the page already has.

**CP-4.** Groups are separated by **whitespace and containment**, almost never by a naked hairline rule. Where a rule is used it always carries padding: `border-t border-ih-border pt-4`.

**CP-5.** KPI tile — `p-5 border border-ih-border rounded-lg bg-ih-surface`, in a `grid grid-cols-2 md:grid-cols-4 gap-4`:

- label: `font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ih-muted`
- value: `serif text-[32px] mt-1 leading-none text-ih-navy tracking-[-0.02em]`
- delta: `mt-2 mono text-[11px]`, `text-ih-accent` up / `text-ih-danger` down

**One numeral treatment: Instrument Serif at 32px in navy.** The admin currently ships at least seven KPI tile components across seven pages with four prop shapes, and numerals at mono-24-semibold, mono-26-semibold, sans-28-semibold and sans-16-semibold. Navy rather than ink or accent, because a KPI should read as *brand*, not as body text — and the serif is the entire visual difference between this admin and a generic dashboard.

**CP-6.** Dashboard / analytics widget card: `rounded-lg border border-ih-border bg-ih-surface p-6`, headed by an eyebrow plus `serif text-[18px] mt-1 leading-tight tracking-[-0.01em]`.

**CP-7.** Right-rail cards are `p-5`, never `p-6`; the rail stack is `gap-6`.

---

## 6. Typography

### 6.1 Families

**TY-1.** Three families, already loaded as CSS variables and set on `body`:
**Geist** (`--font-sans`) · **Instrument Serif** 400 only (`--font-serif`) · **JetBrains Mono** (`--font-mono`).

**TY-2.** Body micro-settings are global and set once in `globals.css` (`font-feature-settings: 'ss01','cv11'`, `-webkit-font-smoothing: antialiased`). The admin base stays `[data-surface='admin'] { font-size: 13px; line-height: 1.45 }`. Do not restate either.

**TY-3 — the mono rule.** CLAUDE.md §2.6 is upheld and extended, **with one deletion**.

**Mono is mandatory for:**
1. Table column headers (LT-7).
2. Eyebrows and sidebar / dropdown group labels (NAV-3, FE-9, CT-11).
3. Every machine-authored **value**: SKU, part number, RFQ/quote reference, UUID and target id, slug, URL path, database table/column name, API key prefix, ISO timestamp, byte size, position/ordinal, quantity, price, pressure, and count chips in tabs and trays.
4. Multi-line preformatted blocks, via the `.mono` class.

**Mono is banned for:**

5. **Status pill labels.** *This is the deletion from §2.6.* "Published", "Draft", "Quote sent" are human words describing a state, not machine values — and at 11px inside a fixed 22px pill, mono's wider figures and tighter cap-height break the pill's geometry against its sans neighbours. **`packages/ui/src/StatusPill.tsx` — currently `font-mono font-semibold` — must change.**
6. **Relative timestamps** ("2d ago") — prose *about* a value, not the value.
7. Page titles, form labels, hints, errors, nav items, **button labels**, tab labels, breadcrumbs, prose, empty-state copy, toast copy, and row-action links.

There are **746 `font-mono` occurrences across 90 admin files**. A large fraction are labels, buttons and tabs — human words — and the effect is that the admin reads as a terminal rather than as a console.

**TY-4.** `.mono` sets family and `font-feature-settings: 'tnum'` **only** — never `letter-spacing`. `globals.css` documents why at length: pinning `letter-spacing: 0` silently killed the tracking on every eyebrow that also carried `.mono`, because the class is unlayered and beats the utility. **Use the `.mono` class, never a bare `font-mono` utility**, so there is one entry point.

**TY-5.** `.serif` is for display numerals and card/section headings only. Never for UI labels, table content or form copy. Confining it is what keeps it a signal.

### 6.2 Scale

**TY-6.** Size every piece of admin text with an explicit pixel value from this scale. **No Tailwind named steps** (`text-sm`, `text-base`, `text-xs`) anywhere in the admin.

| px | Role |
|---|---|
| **10.5** | table column header · sidebar group label · eyebrow · dropdown group label · segmented-tray count |
| **11** | status pill · secondary identifier line (SKU/slug) · avatar initials · tab count chip · KPI delta · KPI label |
| **11.5** | breadcrumb · field hint · field error · card sub-description |
| **12** | row-action text link · bulk count chip · dirty-state readout · pre-flight footnote |
| **12.5** | counts line · topbar `secondary` link · rail `<dl>` rows · de-emphasised cell · settings sub-copy |
| **13** | **table body · sidebar nav item · list rows · dropdown item · dialog body** |
| **13.5** | filter tab label · topbar search input |
| **14** | form `<Label>` · button label · intro prose · mobile sheet nav item |

Display band, five sizes only: **15** (settings panel h2) · **18** (topbar title, widget card heading) · **20** (section heading) · **28** (page-section title) · **32** (page `<h1>`, KPI numeral).

**9px, 9.5px, 10px, 14.5px, 15.5px, 16px, 17px, 22px, 24px, 26px and 36px are dropped.** `text-[10px]` alone appears **212 times across 58 files** and is the second most common size in the admin after 13px; it is 0.5px off the micro-label step and it is used interchangeably for column headers, filter labels, status pills, row actions and identifier lines — five roles that the scale distinguishes.

**TY-7. One emphasis weight: `font-medium` (500).** `font-normal` (400) only to cancel an inherited 500. **No `font-semibold`, no `font-bold`, anywhere in the admin** — 84 occurrences across 40 files today.

With one weight step, hierarchy is carried by size plus the ink ramp — which is exactly why the ink ramp needs four stops (CS-2).

*Note:* `globals.css` sets `font-weight: 600` inside `.sc-article-body strong` and `.ih-editor strong`. Those are **author-entered prose**, not UI chrome, and are out of scope for this rule.

**TY-8.** Display tracking comes off a three-value ladder, as a `tracking-[…]` utility and **never an inline `style`** (banned by CLAUDE.md §2.1):

`-0.01em` at 18–20px · `-0.015em` at 22–28px · `-0.025em` at 32px+.

Small-caps tracking: `tracking-[0.08em]` for mono micro-labels · `tracking-[0.1em]` for sidebar group labels · `tracking-[0.13em]` for `.eyebrow` · `tracking-tight` for the 18px topbar title. `tracking-wider`, `tracking-[0.04em]`, `tracking-[0.06em]`, `tracking-[0.09em]`, `tracking-[0.12em]` and `tracking-[0.14em]` are all in the tree today and are all off the ladder.

**TY-9.** Line heights: `leading-none` on numerals and the topbar title · `leading-tight` on serif headings · `leading-snug` on dense list copy · `leading-[1.55]` on card sub-descriptions and textareas · `leading-relaxed` on intro prose.

**TY-10.** Topbar title: `text-[18px] font-medium tracking-tight`, **sans not serif**. Breadcrumb above it at `text-[11.5px] text-ih-muted`. Mobile title `text-[16px] font-medium text-ih-ink`, centred and truncated. Sans, because the serif headline lives *inside* the page body — so a page can carry both a chrome title and a display headline without them competing.

**TY-11.** A page body that opens with a headline uses this block, in this order and with these gaps:

```
<Eyebrow> → mt-2 → <h1 className="serif text-[32px] font-normal tracking-[-0.025em]">
          → mt-3 → intro text-[14px] text-ih-ink-2 max-w-[60ch] leading-relaxed
          → mt-8 → first content block
```
Subsequent sections `mt-10` (40px). 40px against the 24px between blocks gives a second, coarser tier of grouping without adding a rule.

---

## 7. Colour and status

### 7.1 The tokens that exist

Every colour in this document is one of these. They are already declared in `apps/web/src/app/globals.css`. **Write the real utility — `bg-ih-accent`, `text-ih-muted`, `border-ih-border` — never `bg-[var(--color-ih-accent)]` and never a raw `oklch()` literal.** A real utility fails loudly and autocompletes; the arbitrary-value escape hatch fails silently, which is exactly how 52 dangling token references once survived for months.

| Token | Value | Role in the admin |
|---|---|---|
| `--color-ih-bg` | `oklch(0.976 0.004 250)` | page ground; also the ink *on* a navy fill |
| `--color-ih-surface` | `#ffffff` | cards, sidebar, topbar, table shell |
| `--color-ih-surface-2` | `oklch(0.955 0.006 250)` | hover, selected row, neutral pill fill, inset tray |
| `--color-ih-surface-3` | `oklch(0.928 0.009 250)` | avatar disc, dormant pill fill |
| `--color-ih-border` | `oklch(0.902 0.008 250)` | every hairline |
| `--color-ih-border-strong` | `oklch(0.82 0.013 250)` | clickable-card hover, grab handle |
| `--color-ih-ink` | `oklch(0.195 0.016 255)` | primary text |
| `--color-ih-ink-2` | `oklch(0.33 0.016 255)` | supporting text, idle nav item |
| `--color-ih-muted` | `oklch(0.55 0.013 255)` | metadata, hints, breadcrumb |
| `--color-ih-muted-2` | `oklch(0.685 0.011 255)` | faintest labels: column headers, group labels |
| `--color-ih-navy` | `oklch(0.275 0.055 252)` | **nav-active fill**, segmented-tray active, KPI numeral |
| `--color-ih-accent` | `oklch(0.475 0.115 248)` | primary button, focus border, filter-tab active, link hover |
| `--color-ih-accent-hover` | `oklch(0.4 0.115 248)` | primary button hover |
| `--color-ih-accent-soft` | `oklch(0.945 0.026 248)` | focus halo, bulk-bar band, saved chip |
| `--color-ih-accent-fg` | `#ffffff` | text on accent |
| `--color-ih-steel-soft` | `oklch(0.955 0.018 240)` | info pill fill |
| `--color-ih-success` / `-soft` | `oklch(0.55 0.11 150)` / `oklch(0.94 0.04 150)` | pre-flight tick / good pill fill |
| `--color-ih-warning` / `-soft` | `oklch(0.72 0.12 78)` / `oklch(0.955 0.05 80)` | advisory rule / warn pill fill |
| `--color-ih-danger` / `-soft` | `oklch(0.55 0.17 28)` / `oklch(0.955 0.035 28)` | field error, destructive fill / danger pill fill |

### 7.2 The tokens to add

The admin has the four semantic **fill** tokens but no **ink** partner for any of them, which is why every status pill in the tree hardcodes its own text colour. These go in the `@theme` block, and the values are the ones `Badge.tsx` already renders — so this is tokenising what already ships, not a new palette:

```css
/* Status-pill ink — partners for the -soft fills that already exist. */
--color-ih-success-ink: oklch(0.38 0.09 150);
--color-ih-warning-ink: oklch(0.46 0.10 78);
--color-ih-danger-ink:  oklch(0.46 0.13 28);
--color-ih-info-ink:    oklch(0.42 0.07 240);   /* pairs with --color-ih-steel-soft */

/* Destructive interaction */
--color-ih-danger-hover: oklch(0.48 0.17 28);
--color-ih-danger-ring:  oklch(0.83 0.07 28);

/* Mobile chrome */
--ih-safe-top:    env(safe-area-inset-top, 0px);
--ih-safe-bottom: env(safe-area-inset-bottom, 0px);
--ih-tabbar-h:    calc(54px + var(--ih-safe-bottom));
```

Plus the four utilities `.pt-safe`, `.pb-safe`, `.min-h-dvh-safe`, and `viewportFit: 'cover'` on the root viewport export — **without that last one, `env()` reports 0 and every safe-area rule is inert.**

Two honest notes on these values:
- `Badge.tsx` currently renders the warn ink at hue **62** against a hue-80 fill. `--color-ih-warning-ink` pulls it to **78** so fill and ink share a hue. The remaining 78/80 gap between `--color-ih-warning` and `--color-ih-warning-soft` is 2°, is imperceptible, and is **not** worth a churn PR.
- These are the only new colour tokens this document introduces. If a state needs a colour that is not here, that is a design question — raise it rather than picking a neighbouring shade (CLAUDE.md §2.2).

### 7.3 Ramps

**CS-1. Four-step surface ramp, no raw white outside it.**
`ih-bg` (page) → `ih-surface` (cards/chrome) → `ih-surface-2` (hover, selected, neutral fill) → `ih-surface-3` (avatar disc, dormant fill).

`surface` sits on `bg`, `surface-2` sits on `surface` — so every hover and selected state has a legal next step with no opacity trick. **No `bg-white`** (146 occurrences today), **no `bg-black/n`**, **no `bg-white/[0.07]`**, and no stock Tailwind palette (`bg-red-50`, `bg-yellow-100`).

A card is never filled with `bg-ih-bg`: the scraper cluster does that, so its cards have no fill contrast against the page at all. A table's header row and body rows carry **no fill** — the card edge is the separation.

**CS-2. Four-step ink ramp, strict descending prominence:**
`ih-ink` (primary) → `ih-ink-2` (supporting) → `ih-muted` (metadata) → `ih-muted-2` (faintest labels).

Exactly four, so "a bit greyer" is always a token and never a one-off `opacity-50` — which the users list currently applies to an entire inactive `<tr>`, dropping its status pill and its Edit link below the contrast floor while the pill already says "Inactive".

**CS-3. Two border tokens.** `ih-border` is the hairline, everywhere. `ih-border-strong` appears only as `hover:border-ih-border-strong` on a clickable card, and on the bottom-sheet grab handle.

**CS-4. Navy vs accent — one rule.**

- **Navy is the nav-active fill** — sidebar item, mobile tab pill, segmented tray, record pill tabs, scope chips — **and the KPI numeral.** Nothing else.
- **Accent is everything interactive** — primary button, focus border and halo, filter-tab active underline and label, link hover, cell-link hover, count-chip active fill.

A save button is **never navy**. There are 12 navy submit buttons in the tree today, and on those pages the visual primary of the page is the Save while the topbar CTA is accent — two different "most important thing" signals on one screen.

**CS-5. No dark theme.** CLAUDE.md §2.5 stands. No `dark:` variants, no `[data-theme]` block.

### 7.4 Status

**CS-6. One status-pill geometry:**

```
inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium
```
Sans (TY-3.5), `font-medium` (TY-7), plus a fill/ink token pair. Written as **one primitive with a `tone` prop** — never an inline class string, never a per-page local map.

The admin currently ships roughly **thirty** hand-rolled pill implementations at eleven different geometries, none of them `rounded-full`, almost all `font-mono font-semibold`, most drawing their colours from a page-local raw-`oklch()` map. Two of those maps (`TIER_COLORS`, `STATUS_COLORS`) are byte-identical duplicates between `customers/page.tsx` and `customers/[id]/page.tsx`.

**CS-7.** A denser variant — `h-[20px] px-2 rounded-full text-[10.5px] font-medium` — is permitted **only** inside a rail publish card's `<dl>` (FE-13) and on card-list rows (LT-20).

**CS-8. Seven tones, fully tokenised:**

| Tone | Fill | Ink | Used for |
|---|---|---|---|
| `neutral` | `bg-ih-surface-2` | `text-ih-ink-2` | draft, unconfigured |
| `good` | `bg-ih-success-soft` | `text-ih-success-ink` | published, live, active, in stock |
| `warn` | `bg-ih-warning-soft` | `text-ih-warning-ink` | in review, scheduled, pending approval |
| `danger` | `bg-ih-danger-soft` | `text-ih-danger-ink` | archived, suspended, declined, cancelled |
| `info` | `bg-ih-steel-soft` | `text-ih-info-ink` | new, unread, awaiting reply |
| `dormant` | `bg-ih-surface-3` | `text-ih-muted` | discontinued, off-catalogue, internal |
| `accent` | `bg-ih-accent-soft` | `text-ih-accent` | current, qualified, onboarding |

Each fill sits at ~0.94–0.955 lightness and each ink at ~0.38–0.46, at the same hue — so a tinted pill and a neutral pill are the same chip with a different fill, and a status enum can gain a state without touching layout.

**Domain enum → tone mapping lives in one module** (`packages/ui/src/StatusPill.tsx` already has the shape: `productStatusTone`, `accountStatusTone`, `accountTierTone`). Add `rfqStatusTone`, `urgencyTone`, `publishTone`, `scrapeStatusTone` there. A page never writes a tone map.

**CS-9. Colour never carries state alone** (CLAUDE.md §10.2). Every pill has a text label; every pre-flight row has an icon *and* text. **No emoji as a status glyph** — `🔴 Plant Down` / `🟡 Priority` appear in three places on the RFQ pages and are, literally, colour-only state with a decoration.

---

## 8. Controls

All controls are hand-rolled in `packages/ui` (CLAUDE.md Stack table — this is **not** shadcn). Each is a `cva` with `kind` × `size`, and a `cn()` merge so a call site can override width and type but **not** height or padding.

### 8.1 Button

**CT-1.** Base string — every button, every size:

```
inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none
border border-transparent rounded-lg text-[14px] font-medium
transition-[background-color,border-color,color] duration-150
outline-none
focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft
disabled:pointer-events-none disabled:opacity-50
```

**No transform on `:active`.** `Button.tsx` already documents the reason and it is a good one: this is a catalogue used under time pressure, and the press reads as a colour step, not a nudge. That decision stands.

**CT-2.** Sizes — each sets an explicit **height and horizontal padding only**. Never vertical padding; a button's height must not depend on its label's line box.

| Size | Box | Gap | Type | Radius | Icon |
|---|---|---|---|---|---|
| `default` | `h-8` (32px) | `gap-1.5` | 14px | 10px | 16px |
| `sm` | `h-7` (28px) | `gap-1` | 12.8px | 6px | 14px |
| `xs` | `h-6` (24px) | `gap-1` | 12px | 6px | 12px |
| `icon` | `size-8` | — | — | 10px | 16px |
| `icon-sm` | `size-7` | — | — | 6px | 14px |
| `icon-xs` | `size-6` | — | — | 6px | 12px |

Horizontal padding `px-2.5` on default/sm, `px-2` on xs. Fixed heights are what let buttons sit on a shared baseline in a toolbar or a table row without label length changing the row rhythm.

**CT-3.** Do **not** add `[&_svg:not([class*='size-'])]:size-4` to the button base. It silently outranks a lucide `size` prop (which is emitted as an SVG width/height attribute), making every in-button icon size a lie. Indus's Button does not have it today — keep it that way, and set icon sizes on the icon.

**CT-4.** Icon `strokeWidth`: **1.8** inside a button · **1.7** in tables, rows, dropdown items and metadata · **1.6** in sidebar and sheet nav · **2** on checklist ticks and crosses. 1.7 stops a 13px table icon out-weighing the 12.5px text beside it; 1.8 gives an in-button icon enough presence to survive a filled background.

**CT-5.** Icon size **outside** a button: **13** for table/row/menu icons · **15** for sidebar nav and topbar search · **17** for the mobile sheet · **12** for row-action text-link icons and checklist ticks · **11** for breadcrumb chevrons.

**CT-5a.** Icons are lucide components, never text glyphs. `←`, `→`, `↓`, `↗`, `✓` and `+` are used as iconography in ~25 places today; they do not scale with the type, do not take `strokeWidth`, and render differently on every platform.

**CT-6. Four kinds only:**

| Kind | Rest | Hover | Open (`aria-expanded`) |
|---|---|---|---|
| `primary` | `bg-ih-accent text-ih-accent-fg` | `bg-ih-accent-hover` | — |
| `outline` | `border-ih-border bg-ih-surface text-ih-ink` | `bg-ih-surface-2` | `bg-ih-surface-2` |
| `ghost` | transparent, `text-ih-ink-2` | `bg-ih-surface-2 text-ih-ink` | `bg-ih-surface-2` |
| `danger` | `bg-ih-danger text-white` | `bg-ih-danger-hover` | — |

`outline`'s hover is a **grey step to `surface-2`**, not an accent reach. *This amends the `Button.tsx` doc comment,* which currently says outline "is the one place the language lets a secondary control reach for the signal colour". The admin is mostly reversible edits, and an accent-coloured secondary control competes with the one primary on the screen.

`danger` is a **solid fill**, and it is the only destructive button treatment. Not a recoloured outline, not a 10% wash.

`aria-expanded` styling keeps a dropdown trigger visibly lit while its menu is open.

**`hover:opacity-90` is not a hover state** — 81 occurrences across 43 files. It fades the label along with the fill, which is the opposite of "this is more prominent now".

**CT-7. One `kind="primary"` button per rendered card or form section** — not per page. A settings page with four independent `SectionCard`s has four primaries, one per card, because it is four independent saves. Everything else in that region is `outline` or `ghost`.

*Amends CLAUDE.md §2.7.*

The topbar's `primary` slot holds **at most one control**, and `secondary` is **always a bare text link, never a button**:

```
inline-flex items-center gap-1.5 text-[12.5px] text-ih-muted hover:text-ih-ink transition-colors
```
with `<ExternalLink size={12} />` or `<ChevronLeft size={12} strokeWidth={1.7} />`. The topbar is the only always-visible surface, so exactly one thing there earns button weight. "Go look at the public page" and "back to the list" are navigation, not actions — there are currently ten bordered 36px back-buttons in the bar, and on `customers/new` that gives the bar two button-weight controls competing for the eye.

**CT-8.** A ghost icon button in a table row is `kind="ghost" size="icon"` shrunk to `h-6 w-6 text-ih-muted transition-all`, always carrying **both** `aria-label` and `title` (there is no tooltip component — CT-14). Two hover treatments, defined **once** in `packages/ui` and imported, never copy-pasted:

```ts
NEUTRAL_HOVER = 'hover:text-ih-ink hover:bg-ih-surface-2'
DANGER_HOVER  = 'hover:text-ih-danger-ink hover:bg-ih-danger-soft hover:ring-1 hover:ring-ih-danger-ring ' +
                'hover:shadow-[0_0_0_4px_var(--color-ih-danger-ink)/0.14]'
```

**CT-16.** The disabled look comes from the Button base (`disabled:opacity-50 disabled:pointer-events-none`) and nothing restates it. No hand-rolled `disabled:opacity-30` / `-60` / `-45`.

**CT-17.** Disable on the **union** of pending, unmet preconditions, and insufficient permission — `disabled={pending || !isDirty}`, `disabled={pending || blocked || !canPublish}`, `disabled={pending || !phraseOk}` — and **always render the reason in prose next to the button.** Never leave it to a toast:

> "Your role can edit this record but not publish it — a manager or super_admin can take it live."

A disabled button with no adjacent explanation is a dead end.

### 8.2 Tabs

**CT-9.** Three recipes, already specified in LT-16 (a)(b)(c), plus:

- **Record tabs** (switching between sibling records): container `flex items-center gap-1 overflow-x-auto -mx-1 px-1 py-1 border-b border-ih-border`; item `shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors`, active `bg-ih-navy text-ih-bg`, idle `text-ih-ink-2 hover:bg-ih-surface-2`; draft marker `h-1.5 w-1.5 rounded-full bg-ih-warning` carrying `aria-label="Draft"` + `title="Draft"`.
- **Form tabs** (FE-10) are the one client-state case, because the panel *is* the card.

`packages/ui/src/Tabs.tsx` is still on the v1 grammar (`text-sm`, `data-[state=active]:border-ih-ink`, `focus-visible:ring-2`) and is **not** the underline-tab recipe. Rebuild it to LT-16(a) or do not use it.

### 8.3 Dropdown menu

**CT-10.** Content: `min-w-32 rounded-lg bg-ih-surface p-1 ring-1 ring-ih-ink/10 shadow-[var(--shadow-2)]`, `sideOffset={4}`, `align="end"` at every call site, with an explicit width (`w-44` / `w-48` / `w-[200px]`).

A **ring rather than a border** keeps the 1px hairline outside the padding box, so items sit flush to the edge. `align="end"` keeps a right-hand row kebab's menu inside the table.

**CT-11.** Item: `relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-[14px] outline-hidden select-none`, focus `bg-ih-surface-2 text-ih-ink`, `data-disabled:pointer-events-none data-disabled:opacity-50`, icons 16px.
Group label: `px-1.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted-2`.
Separator: `-mx-1 my-1 h-px bg-ih-border`.
Destructive item: a `variant="destructive"` **prop on the item** — `text-ih-danger`, focus `bg-ih-danger-soft text-ih-danger`. Never a `className` override at the call site.

**CT-12.** There is exactly **one** dropdown trigger recipe: `kind="ghost" size="icon-sm"` (`size-7`).

### 8.4 Overlays

**CT-13. Dialog.** `packages/ui/src/Dialog.tsx` already delegates focus trap, `role`/`aria-modal`, Escape and focus restoration to `@radix-ui/react-dialog`, which discharges CLAUDE.md §10.5. **Use it. Do not hand-roll another overlay** — there are four hand-rolled ones in the admin today, two of them on `bg-black/40` with `bg-white` panels, no radius, and top-anchored rather than centred.

Anatomy:
- Overlay: `fixed inset-0 isolate z-50 bg-ih-ink/10 supports-[backdrop-filter]:backdrop-blur-[2px]`, 100ms fade.
- Content: `fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-ih-surface p-4 text-[14px] ring-1 ring-ih-ink/10 shadow-[var(--shadow-2)] outline-none sm:max-w-md`.
- Width is **always** written with the breakpoint guard: `sm:max-w-md` / `sm:max-w-lg` / `sm:max-w-[640px]`. Never a bare `max-w-*`, which fights `max-w-[calc(100%-2rem)]` on narrow viewports.
- Close: `kind="ghost" size="icon-sm"` at `absolute top-2 right-2` with an `sr-only` label.
- Header `flex flex-col gap-2`; title `text-[16px] font-medium leading-none` (**sans**); description `text-[14px] text-ih-muted`.
- Footer `-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t border-ih-border bg-ih-surface-2 p-4 sm:flex-row sm:justify-end`.
- **DOM order is always `outline` Cancel then the confirm button**, so `flex-col-reverse` puts confirm on top on mobile and `sm:flex-row` puts it rightmost on desktop.

Note the trap `Dialog.tsx` already documents: the content portals to `document.body`, which is **outside `[data-surface='admin']`**, so a portalled dialog reverts to the storefront's root size unless it pins its own `text-[13px]`. Keep that pin.

**CT-14. There is no tooltip component in the admin.** Hover hints are the native `title` attribute, always paired with `aria-label`. Native titles need no portal, no provider and no keyboard trap, and an icon button's accessible name is already required — so it doubles as the hint for free.

**CT-15.** Overlay motion honours `prefers-reduced-motion` (CLAUDE.md §10.7): drop translate and scale, keep the opacity fade at 100ms, never remove the focus indicator. `globals.css` already declares the `ih-dialog-in`/`-out`, `ih-fade-in`/`-out` and `ih-toast-in` keyframes — **keep both halves of each pair**, or Radix's Presence never unmounts the node.

---

## 9. Feedback and empty states

**FB-1. One toast per completed server action.** The level comes from the action's own result and **the server owns the sentence.** Indus's toast API is a hook, not a singleton:

```tsx
const { toast } = useToast()          // from @indus/ui
const r = await action()
r.status === 'ok' ? toast({ tone: 'success', title: r.message ?? 'Saved.' })
                  : toast({ tone: 'danger',  title: r.message })
```

The client never invents a generic "Something went wrong". Client-held literals are permitted **only** for pre-flight validation that never reaches the server ("Enter the subject's email address.").

> **Prerequisite.** `ToastProvider` is currently mounted only inside `media/_components/library-client.tsx`. It must be mounted once in `app/admin/(shell)/layout.tsx` before any of this rule is reachable.

**FB-2.** Levels: `success` on a completed write · `danger` on a rejected one · a warning tone on **partial** success only (`Archived 12; 3 skipped.`). Never a loading toast for a form submit — that is FB-5's job.

**FB-3. Toast copy is a completed past-tense sentence ending in a full stop.** Where the outcome has a consequence the user cannot see, add it after an em dash:

> "Saved." · "Published." · "Quote sent." · "Unpublished — the page is a draft again." · "Draft saved — you can finish it whenever."

Server error copy uses the same voice and names the likely cause:

> "Slug already in use — pick a different one." · "Not saved — your account may not be allowed to edit this." · "Fix the highlighted fields before saving."

Past tense confirms the write *landed* rather than describing the button. The em-dash clause answers the follow-up question ("…so where did it go?") before it is asked.

**FB-4.** Toaster: bottom-right, close button, card on `bg-ih-surface`, text `ih-ink`, border `ih-border`, radius **6px** (`--radius-md`). Status icons 16px; loading is a 16px `animate-spin`.

**FB-5. Pending state = conjugate the label.** Swap to the present participle ending in `…` (U+2026, never three periods) and set `disabled={pending}`. **No spinner inside a labelled button.** The leading icon stays put through the swap so the button does not jump width:

```tsx
<Save size={14} strokeWidth={1.8} />{pending ? 'Saving…' : 'Save'}
```
Vocabulary: Saving… · Publishing… · Archiving… · Deleting… · Sending… · Uploading… · Creating… · Generating… · Working…

**FB-6.** **The spinner is only for row- and region-level pending**, where there is no label to conjugate, and it **replaces** the control (LT-14). For a whole region, set `aria-busy={pending}` plus `opacity-95 pointer-events-none` and show no spinner at all.

**FB-7.** A saved indicator is a chip, not a toast and not a bare span:

```
inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11.5px] text-ih-accent bg-ih-accent-soft
```
with `<Check size={12} strokeWidth={1.8} />`. One component. The "Saved at {time}" span with its hardcoded `oklch(0.55 0.12 150)` currently exists verbatim in four editor clients, with two further variants beside it.

**FB-8. Destructive confirmation is type-to-confirm.** One mechanism for everything destructive — **no `window.confirm()` anywhere** (22 occurrences across 16 files today, several on irreversible cascading deletes).

The dialog must:
1. Carry `<AlertTriangle size={16} strokeWidth={1.8} className="text-ih-danger" />` in the title.
2. Name the **exact database effect** in `.mono` — `status=archived`, `deleted_at=now()`.
3. Preview the affected records — `<ul className="mt-2 flex flex-col gap-1 text-[13px]">` of `<li className="mono text-ih-ink-2">`, capped at 5, then `<li className="text-[12px] text-ih-muted">+{n} more</li>`.
4. Count and state cascade fallout **before** the fact.
5. Require an exact string — a fixed word (`ARCHIVE`, `DELETE`) for bulk, or the record's own name for a single delete — via `<Input className="mt-1 mono" autoComplete="off" spellCheck={false} />` under a `text-[12px] text-ih-muted` label.
6. Keep the confirm `disabled={pending || !phraseOk}`, `kind="danger"`.
7. Reset the typed phrase on a deferred timer (`setTimeout(…, 200)`) so it does not flicker mid-fade.

Typing the word makes the cost of a mis-click non-zero; naming the rows makes the confirmation about *these* records rather than a count.

**FB-9.** An irreversible delete is **refused outright while the record is published** — unpublish first. That keeps the reversible step separate from the irreversible one. The refusal is rendered as prose in the delete card, not as an error after the click.

**FB-10.** Destructive and advisory severity has two tokenised containers:

- **Advisory band:** `flex items-start gap-2 rounded-md border border-ih-warning/40 bg-ih-warning-soft px-3 py-2`, icon and text `text-ih-warning-ink`, text `text-[12px]`.
- **Danger container:** `rounded-lg border border-ih-danger/35 bg-ih-surface p-4`, gated behind a reveal button.

No left-border accent bars. No square boxes on raw literals.

**FB-11. An empty state is a sentence that names what will fill the space and where it comes from** — never an icon-and-noun placeholder and never a bare negative ("No brands yet."). An empty admin table is otherwise ambiguous between "broken" and "nothing has happened yet".

**FB-12. Two shapes only. No dashed borders** (30 in the tree today).

- **In-table (default):** a single full-width centred cell, `colSpan={n}`, `text-center py-16 text-ih-muted text-[12.5px]`, repeating the page's own CTA as an inline `text-ih-ink underline` link:
  > "No products yet — add the first one with **New product**."

  Keeping it inside the table means the header row survives, so the user still sees what the columns *would* be, and the repeated CTA makes the empty state actionable without moving the eye to the topbar.

- **Non-table** (card lists, media grids): the table is replaced entirely by `bg-ih-surface border border-ih-border rounded-lg p-12 text-center`, with `<h3 className="serif text-[20px]">` + `<p className="text-[13px] text-ih-muted mt-2">` naming the upstream trigger, and an `outline` button at `mt-6` when there is one:
  > "When a customer submits the form at /quote, the RFQ lands here. The status starts at **Draft**."

---

## 10. Spacing rhythm

**SP-1.** The frame is three fixed numbers: **240px** sidebar · **60px** topbar · **28px** content gutter, with topbar `px` = main `p` (PF-1…PF-3). 28px is deliberately off the 4/8 grid everything else uses, so the page frame reads as a distinctly larger step than any in-page spacing.

**SP-2. Four-step vertical scale inside a page. Do not go between the steps.**

| Step | Utility | Use |
|---|---|---|
| **6px** | `flex flex-col gap-1.5` | inside one field: label → control → hint → error |
| **12px** | `gap-3` / `mt-3` | a label group and its content |
| **20px** | `flex flex-col gap-5` | between fields inside a card |
| **24px** | `flex flex-col gap-6` | between page sections; between rail cards |

Secondary steps: **4px** `gap-1` (tight text pairs) · **8px** `gap-2` (list rows, stacked rail buttons) · **16px** `gap-4` (rail-card internals, KPI grid).

Each step is ~1.5–1.7× the one below, so the eye reads nesting depth from the gap alone, with no rule and no box. `mt-[26px]` — used three times in `CategoriesClient` as a hand-measured "label-height spacer" — is exactly what this rule forbids: it is off the grid *and* it breaks the moment FE-4 changes the label size.

**SP-3. `gap-*` on the container, never `space-y-*`.** Zero `space-y-*` in the admin (24 today). A section added or removed cannot then leave a stray margin behind, and no `:last-child` reset is ever needed.

**SP-3a. Sections are never separated by their own `mb-*`.** The page root's `gap-6` owns every gap between its direct children. There are ~40 section-separating `mb-3` / `mb-4` / `mb-5` / `mb-6` / `mb-8` in the tree, which is why adjacent list pages have visibly different rhythms.

**SP-4.** Card padding by role: **24px** section/form card · **20px** rail card and stat tile · **16px** list-row card and grid tile · **12px** inline note · **48px** centred empty state (CP-2).

**SP-5.** Horizontal gaps by content type:

| Gap | Use |
|---|---|
| `gap-1` / `gap-1.5` | icon + its label — keeps the pair reading as one word |
| `gap-2` | control clusters, checkbox + label |
| `gap-2.5` | sidebar nav icon + label, user-pile columns |
| `gap-3` | toolbars, form footers, dialog footers |
| `gap-4` | topbar action cluster, card-list row internals |
| `gap-5` | underline tab bar |

**SP-6.** Coarse tier, above the section gap: **`mt-8`** (32px) from an intro paragraph to the first content block; **`mt-10`** (40px) between major page sections. 40px against 24px gives a second grouping tier with no rule (TY-11).

**SP-7. A grid gap never equals or exceeds the page section gap.** KPI row `gap-4`, card grids `gap-3`, card lists `gap-2` — all against a root `gap-6`. If a grid gap matched the section gap, the tiles would stop reading as one group. The media grid currently runs `gap-4` tiles inside a `gap-4` column and does exactly that.

**SP-8.** Derived densities, for judging a new component:
- table row ≈ **43px** (12 + 12 + ~19 line box)
- sidebar nav item ≈ **36px** (8 + 8 + ~19.5)
- form field ≈ **57px** label-to-control-bottom, **~77px** on the 20px pitch
- a table row is ~2.5× denser than a form field, on purpose

**SP-9.** Mobile keeps the in-page rhythm and shrinks only the **frame**: gutter 28px → 16px, chrome bars 56px at each end, chrome gutter 8px. Card padding, field gaps and table cell padding are unchanged across the breakpoint, so the two views feel like one product. The 8px chrome gutter is a chrome-only value — it is what lets the mobile action rail scroll — and is never a content value.

**SP-10. Radius ladder**, assigned by element class. The tokens already exist in `globals.css`:

| Radius | Token | Elements |
|---|---|---|
| **16px** | `--radius-xl` | Dialog, bottom-sheet top corners (`rounded-t-2xl`) |
| **10px** | `--radius-lg` | cards, table shells, dropdown/select popovers, **default Button / Input / Select**, mobile sheet nav item |
| **6px** | `--radius-md` | sidebar nav item, `sm`/`xs` buttons, menu items, chip rows, record tabs, segmented tray, toast |
| **4px** | `--radius-sm` | inset tray items, count chips, colour swatches |
| **999px** | `rounded-full` | status pills, avatars, bulk-bar count chips, mobile tab-bar active pill, grab handle, progress meters |

`rounded-[3px]` survives in exactly one place — the checkbox in `Field.tsx` — and is not a general option.

---

## 11. Accessibility, restated for the admin

These are CLAUDE.md §10 applied to this surface. They are not optional and they are not covered by a library.

**A11Y-1.** Every icon-only control carries **both** `aria-label` and `title` (CT-8, CT-14).
**A11Y-2.** Colour never carries state alone: every pill has a word, every checklist row has an icon *and* text, no emoji stands in for a status (CS-9).
**A11Y-3.** Focus is visible on every control and matches FE-7 exactly. Never `outline: none` without the ring replacement.
**A11Y-4.** Tab bars carry `role="tablist"` / `role="tab"` / `aria-selected` (LT-16a). `aria-current="page"` is a different statement and does not substitute.
**A11Y-5.** Every overlay owns its focus trap, `role="dialog" aria-modal="true"`, Escape handling and focus restoration — discharged by using `@indus/ui`'s `Dialog`, never by hand-rolling.
**A11Y-6.** `prefers-reduced-motion: reduce` drops translate and scale, keeps opacity fades at 100ms, and never removes a focus indicator.
**A11Y-7.** The admin's default control height is **32px** (FE-6). This is the exception to the storefront's 40px minimum and it applies to the whole admin surface, not just dense tables.
**A11Y-8.** The admin body is a `<main>` landmark. There is currently no `<main>` element anywhere under `app/admin` — zero occurrences — so the admin has no main landmark at all.
**A11Y-9.** A 50%-opacity row is not a state. Use a tone (CS-2).

---

## 12. What this amends in `CLAUDE.md`

| § | Current wording | Replacement | Why |
|---|---|---|---|
| **§2.3** | "Cards are 10px; buttons, inputs and notes are 6px; small buttons and inset chips are 4px" — and the ladder is listed as "`--radius-sm` 4px · `--radius` 6px · `--radius-lg` 10px" | "Cards, table shells, popovers and **default-size** buttons / inputs / selects are **10px**; `sm` and `xs` buttons, menu items, sidebar nav items, chips, record tabs and the toast are 6px; inset tray items and count chips are 4px; dialogs and bottom sheets are 16px." **Also correct `--radius` → `--radius-md`** — `globals.css` declares `--radius-md`, and `--radius` is undefined. | FE-6 / SP-10. Container and control share 10px; there are no concentric radii on primitives. The `--radius` typo is a live dangling-token reference of exactly the kind §2.2 warns about. |
| **§2.4** | "40px control height, 48px page gutter, 236px admin sidebar" | "40px control height **on the storefront**, 32px in the admin; 48px page gutter on the storefront, **28px** in the admin, where the topbar's horizontal padding must equal `<main>`'s; **240px** admin sidebar." | PF-1, PF-3, FE-6. |
| **§2.6** | "Mono is for machine-readable content only — part numbers, SKUs, quantities, dates, pressures, **statuses**, table headers, eyebrows." | Delete "statuses". Extend the list with "slugs, URL paths, ids, byte sizes and ordinals". Add: "Relative timestamps, button labels, tab labels and field labels are **sans** — they are prose about a value, not the value." | TY-3. A status pill holds a human word inside a fixed 22px chip; mono's figure widths break its geometry against sans neighbours. |
| **§2.7** | "**One primary action per view.** If a screen appears to need two, one of them is secondary." | "**One primary action per rendered card or form section**, plus at most one in the topbar's `primary` slot. A settings page with four independently-saved cards has four primaries." | CT-7. One-per-page would either merge unrelated writes or leave three cards with no way to commit. |
| **§10.3** | "v2 focus-visible is `box-shadow: 0 0 0 3px var(--color-accent-soft)` plus `border-color: var(--color-accent)`." | "v2 focus-visible is `focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft`, with `aria-invalid:border-ih-danger aria-invalid:ring-[3px] aria-invalid:ring-ih-danger-soft`." | **`--color-accent-soft` and `--color-accent` do not exist** — the tokens are `--color-ih-accent-soft` and `--color-ih-accent`. As written, the rule instructs contributors to produce a declaration that computes to `unset`. This is a real bug in the house rules, not a wording preference. |
| **§10.8** | "Minimum hit target is 40px on the storefront. The 32px small button is permitted only inside dense admin tables and card footers where the surrounding row is itself ≥40px." | "Minimum hit target is 40px on the storefront. **32px is the default control height across the whole admin surface** — inputs, selects, buttons and filter controls alike. Mobile admin chrome keeps 48px tab targets." | FE-6. Bazar's admin runs entirely on 32px, and mixing 32 / 36 / 40 breaks every `flex items-center` control row — which is precisely the state of the tree today. |
| **`Button.tsx` doc** | "`outline`'s hover is NOT a grey hover… it is the one place the language lets a secondary control reach for the signal colour." | "`outline`'s hover is a grey step: `bg-ih-surface-2` + `text-ih-ink`." | CT-6. |
| **`StatusPill.tsx`** | `inline-flex items-center font-mono font-semibold capitalize tracking-tight` + `px/py` sizing at 9/10/11px, tones as raw `oklch()` | `inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium`, sans, tones from the `-soft`/`-ink` token pairs | CS-6 + TY-3.5 + TY-7. |
| **`Field.tsx`** | `Label` = `mb-1.5 block text-xs font-medium text-ih-ink-2`; `Hint`/`ErrorText` carry `mt-[5px]`; `Input`/`Select` are `h-10 rounded-md text-[13.5px]` on `bg-ih-surface` | `Label` = `flex items-center gap-2 text-[14px] font-medium leading-none text-ih-ink` inside a `flex flex-col gap-1.5` stack; `Hint`/`ErrorText` drop their margins (the stack gap owns them); controls become `h-8 rounded-lg` on `bg-transparent`, input `text-[16px] md:text-[14px]` | FE-4, FE-6. |
| **`Table.tsx`** | `TableHead` `py-[11px] text-ih-muted`; `TableCell` `py-3.5`; `Table` renders no bordered container | `TableHead` `py-3 text-ih-muted-2`; `TableCell` `py-3`; `Table` renders the `rounded-lg border border-ih-border bg-ih-surface overflow-x-auto` shell | LT-5, LT-7, LT-8. |

**Explicitly *not* amended:** `Table.tsx`'s "row hover has NO transition" (a reasoned local decision, and correct) and `Button.tsx`'s "no transform on `:active`" (same). Both are places where Indus's existing thinking is better than the imported alternative.

---

## 13. Applying this to a new admin page — checklist

Work top to bottom. If you cannot answer one of these from this document, that is a gap in the document, not a licence to invent.

**Frame**
- [ ] Page root is `<AdminPageShell>`, with `title`, and `breadcrumbs` if the page has a parent.
- [ ] The topbar carries **at most one** `primary` Button; `secondary` is a bare text link with a lucide icon and no border.
- [ ] No `bodyClassName`, no `sticky` on the bar, no `mt-*` on the first body element.

**Body shape**
- [ ] Exactly **one** layout div inside the shell: `flex flex-col gap-6` (list) or `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start` (detail).
- [ ] Width cap chosen from the PF-9 table — one value, on that wrapper, never on an inner form or tab panel.
- [ ] Zero `space-y-*`. Zero section-separating `mb-*`.

**Content**
- [ ] Every table is `@indus/ui`'s `Table`. No `grid grid-cols-[…]` pseudo-table. Wide tables carry `min-w-[720px]`.
- [ ] Counts line above the table, `text-[12.5px] text-ih-muted`. Pagination below it.
- [ ] Timestamps in list cells are relative, from the shared helper, sans, 12px.
- [ ] Row actions in one right-aligned column, one form (text-link **or** icon-button), destructive red on hover only.
- [ ] Every card is `bg-ih-surface border border-ih-border rounded-lg p-{6|5|4|3}` by role. No shadow.
- [ ] Every status is `<StatusPill tone=…>`. No local colour map.
- [ ] Every field is `<Field>` from `@indus/ui`. Sans 14px label. No asterisk. No local `function Field`.
- [ ] Every button is `<Button kind size>` from `@indus/ui`. No `h-9`, no `hover:opacity-90`, no `bg-ih-navy` on a save.
- [ ] Every control has the FE-7 focus / invalid / disabled contract — which it gets free by using the primitives.

**Behaviour**
- [ ] Filter and tab state is in the URL, and changing a filter resets the page param.
- [ ] Save is `disabled={pending || !isDirty}` and conjugates its label to `Saving…`.
- [ ] Publishing is in the rail, wired by `form=` + `name="intent"`, never its own action.
- [ ] Every completed write raises one toast whose sentence came from the server.
- [ ] Every destructive action goes through the shared type-to-confirm dialog. Zero `window.confirm()`.
- [ ] Empty state names what fills the space and repeats the CTA. No dashed border.

**Grep before you open a PR** — each of these must return nothing under `apps/web/src/app/admin` and `apps/web/src/components/admin`:

```bash
grep -rE 'bg-white|font-semibold|font-bold|space-y-|border-dashed|hover:opacity-|window\.confirm|confirm\(' .
grep -rE 'oklch\(' .                       # colour literals in className
grep -rE 'text-(xs|sm|base|lg|xl)\b' .     # Tailwind named sizes
grep -rE 'text-\[(9|9\.5|10|14\.5|16|17|22|24|26|36)px\]' .   # off-scale sizes
grep -rE 'h-9|h-10' .                      # off-system control heights
grep -rE 'style=\{\{' .                    # CLAUDE.md §2.1
```

---

---
