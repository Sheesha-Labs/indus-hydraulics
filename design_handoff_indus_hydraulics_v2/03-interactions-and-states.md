# 03 · Interactions, states & behaviour

The designs are static artboards. This document specifies everything they cannot show. Where a value is given, use it; where judgement is required, it says so.

---

## 1. Motion

**Principle: motion confirms, it does not perform.** This is a technical catalogue used by engineers under time pressure. Nothing should slow them down or draw attention to itself.

### Durations
| Interaction | Duration | Easing |
|---|---|---|
| Colour / border / background on hover | 150ms | `ease` |
| Button press feedback | 80ms | `ease-out` |
| Dropdown, popover, tooltip appear | 120ms | `cubic-bezier(.2,0,.2,1)` |
| Command palette open | 160ms | `cubic-bezier(.2,0,.2,1)` |
| Compare tray dock / undock | 220ms | `cubic-bezier(.32,.72,0,1)` |
| Mega menu open | 180ms | `cubic-bezier(.2,0,.2,1)` |
| Accordion / disclosure | 200ms | `cubic-bezier(.4,0,.2,1)` |
| Page transition | none | — |

The 150ms hover transition is already declared on `.ih-btn` in `tokens.css`. Match it everywhere.

### Specific behaviours

**Command palette** — scrim fades 0→1 over 160ms; card translates from `translateY(-8px)` with opacity 0→1 over the same. Background does not scale or blur-animate; the blur is static. Closing is 120ms, no translate.

**Compare tray** — enters with `translateY(100%)` → `0`. When the third item is added and a fourth slot appears, the width change is not animated — only the chip itself fades in over 120ms.

**Mega menu** — opens on hover with a 120ms intent delay and closes with a 240ms grace period so a diagonal mouse path to a distant column doesn't dismiss it. Keyboard opens on Enter, no delay.

**Table row hover** — background only, no transition. Instant response reads as more responsive in dense tables.

**Respect `prefers-reduced-motion: reduce`** — drop all translate and scale; keep opacity fades at 100ms. Never remove focus indicators as part of this.

---

## 2. Interactive states

Every interactive element needs five states. The designs show default and, in places, active. You are specifying the rest.

| State | Rule |
|---|---|
| Default | as drawn |
| Hover | per `tokens.css`; `outline` buttons go accent-bordered and accent-texted, not grey |
| Focus-visible | `0 0 0 3px var(--ih-accent-soft)` + `border-color: var(--ih-accent)`. Never `outline: none` without a replacement. |
| Active / pressed | darken one step (`--ih-accent-hover` for primary); no transform |
| Disabled | 45% opacity, `cursor: not-allowed`, no hover response |

**Focus order** follows DOM order. Skip-to-content link required on every page — visually hidden until focused, then a standard focused button at top-left.

**Hit targets** — 40px minimum for anything on the public site. The 32px `sm` button is permitted only inside dense admin tables and card footers where the surrounding row is itself ≥40px.

---

## 3. Navigation & flow

```
Home ──┬─ Mega menu ──── Category index ── PLP ── PDP ─┬─ Quote list ── RFQ ── Confirmation
       ├─ Search ────────┬─ PLP                        └─ Compare (via tray)
       │                 └─ Replacement (part-number queries intercept here)
       ├─ Industries ─── Industry detail ── PLP (filtered) / Case study
       ├─ Services ───── Case study (7-part)
       ├─ Brands ─────── Brand detail ── PLP (filtered)
       └─ Blog ───────── Article
```

**Quote accumulation** is the spine of the site. Every product surface — PLP card, PDP, search result, cross-reference result, brand page, industry SKU grid — carries "Add to quote". The quote persists across sessions without auth (local storage, then merged into the account on sign-in).

**Cross-reference interception:** a search query matching a part-number pattern (alphanumeric with hyphens/slashes, ≥5 chars, contains a digit) surfaces a cross-reference card above organic results. This is a real behaviour to implement, not decoration.

**Nav active state** — see §5 of `01-design-language.md`. Account, policy and 404 pass an explicit sentinel so nothing highlights.

---

## 4. Forms

**Validation timing** — validate on blur, not on keystroke. Re-validate on change only after a field has already failed once. Never block submit; validate on submit and move focus to the first error.

**Error presentation** — field border `--ih-danger`, message beneath in `--ih-danger` at 11.5px replacing the hint. Never rely on colour alone; the message carries the meaning.

**Required fields** on the RFQ: name, company, work email, and either a part reference or a free-text requirement. Everything else optional. The design deliberately keeps the form short — do not add fields.

**File upload** — dashed `--ih-border-strong` dropzone on `--ih-surface-2`, radius 8. Accepts JPG, PNG, HEIC, PDF up to 25MB. Show per-file progress and allow removal. The nameplate-photo dropzone on `/replacement` is the same component.

**Submission** — button enters a loading state with the label replaced by a spinner and the accessible name changed to "Submitting". Disable double-submit. On success, navigate to the confirmation route; do not use a toast for something this significant.

---

## 5. Empty, loading and error states — REQUIRED, NOT DESIGNED

Every table in these designs is full and every search succeeds. **This is the largest gap in the package and you are expected to close it.** Build these to the language rather than asking for designs.

### Empty
Centre in the region. Mono eyebrow stating the condition, a 15px sentence explaining why in plain terms, and one action. No illustration.

| Region | Message | Action |
|---|---|---|
| Search — no results | "Nothing matched that query." | Cross-reference it / browse categories |
| PLP — filters exclude all | "No SKUs match these filters." | Clear filters |
| Quote list | "Your quote list is empty." | Browse the catalogue |
| Saved list | "Nothing saved yet." | Browse the catalogue |
| Account quotes | "No quotes yet." | Request a quote |
| Cross-reference — no match | "We don't have an interchange on file for that code." | Send it to an engineer |
| Admin table | "Nothing here yet." | The table's primary create action |

The cross-reference no-match case matters commercially: it should read as a route to a person, not a dead end.

### Loading
Skeletons, not spinners, for content regions. `--ih-surface-2` blocks at the real dimensions of the content they replace, radius matching. No shimmer animation — a static block that appears for 200ms is calmer than an animating one. Spinners only inside buttons.

Product grids: skeleton cards at the real card size, 8 of them. Tables: 6 skeleton rows at row height. Never collapse the container and let the page jump.

### Error
Inline within the failed region, never a full-page takeover for a partial failure. `.ih-note` styling but with `--ih-danger` border and text. State what failed and offer retry. For a full page failure use the 404 layout with adjusted copy.

**Stale data** — where stock figures are cached, show the timestamp in mono beside them. An engineer trusting a stale stock number is a real cost.

---

## 6. Responsive behaviour — specified, not designed

All artboards are 1440. This is the intent; visual design for mobile is outstanding work.

| Breakpoint | Behaviour |
|---|---|
| ≥1440 | As drawn. Content max-width 1440, 48px gutters. |
| 1200–1439 | Fluid. Gutters to 32px. 4-col grids → 3-col. Sticky rails hold. |
| 1024–1199 | 3-col → 2-col. Facet rail collapses to a "Filters" button opening a sheet. Sticky rails unstick and move below content. |
| 768–1023 | 2-col → 1-col. Hero splits stack, image first except on PDP where title leads. Stat rows go 2×2. Utility bar drops to phone number only. |
| <768 | Single column, 20px gutters. Nav → hamburger drawer. Sticky bottom quote bar. Tables → stacked key/value cards. Type scale steps down one level; H1 caps at 34px. |

**Console is exempt** — desktop only, minimum 1280.

**Tables are the hard part.** Spec tables become `.ih-spec` key/value lists. The compare matrix becomes a horizontally-scrolled region with the attribute column frozen — with a visible scroll affordance, not a hidden one.

**The 4:3 PDP hero and title-first order exist because of mobile.** Preserve that ordering at every breakpoint.

---

## 7. State management

Client state the designs imply:

| State | Scope | Persistence |
|---|---|---|
| Quote list | global | local storage → account on sign-in |
| Compare selection | global, max 4 | session |
| Saved list | account | server |
| Facet selections | route | URL query params |
| Sort order | route | URL query params |
| Search query | route | URL |
| Palette open | ephemeral | none |
| Mega menu open | ephemeral | none |
| Recently viewed | global, cap 12 | local storage |

**Facets and sort must live in the URL.** These pages are the SEO surface and the sales team shares filtered links.

**Compare is capped at four.** At four, the "add" affordance on cards becomes disabled with a tooltip explaining why.

---

## 8. Accessibility

Non-negotiable, and cheaper to build in than to retrofit.

- **Contrast** — verify against actual backgrounds. `--ih-muted-2` fails AA for body text on white; restrict to ≥14px non-essential text. Mono eyebrows at 10.5px must use `--ih-muted` or darker.
- **Semantics** — real `<nav>`, `<main>`, `<article>`, `<table>` with `<th scope>`. Breadcrumbs in a `<nav aria-label="Breadcrumb">` with an ordered list.
- **Headings** — one `<h1>` per page, no level skips. The mono eyebrow above an H1 is not a heading; mark it as a `<p>` or `<span>`.
- **Command palette** — `role="dialog" aria-modal="true"`, focus trapped, focus returned to the trigger on close, Esc closes. Results are an `aria-activedescendant` listbox; the input keeps focus throughout.
- **Compare tray** — announce count changes via a polite live region.
- **Icons** — decorative icons get `aria-hidden="true"`. Icon-only buttons get an `aria-label`.
- **Images** — every placeholder's `label` prop describes the intended photograph. When real imagery lands, write alt text that describes the equipment and context, not "hydraulic pump".
- **Keyboard** — every path completable without a mouse. Facets, chips and tabs are real controls with arrow-key navigation within a group.
- **Motion** — honour `prefers-reduced-motion`.
