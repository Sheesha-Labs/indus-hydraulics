# 04 · Audit & migration plan

The execution document. Phase 0 is a survey with no code changes; phases 1–5 are implementation. Each phase lists what to paste into Claude Code, what to build, and how to know it is done.

---

## Phase 0 · Codebase audit

**No code changes. Output is a document.**

The existing application was built in the previous design language. Before anything is restyled, we need to know what is actually there — the plan for phases 1–5 depends on the answer.

### Paste into Claude Code
`README.md`, `01-design-language.md`, `05-domain-and-data-model.md`, `06-diff-from-v1-handoff.md`, this file. No source files yet.

### Produce `AUDIT.md` answering

**Styling architecture**
1. What styles the app today — Tailwind, CSS modules, styled-components, plain CSS, a mix? If a mix, which parts use which?
2. Is there a token layer already (CSS custom properties, a Tailwind theme, a JS theme object)? Where does it live?
3. How many hard-coded colour values exist outside that layer? List the files with the worst concentration.
4. Where do the old orange accent and warm-grey neutrals appear? Exhaustive list — this is the search-and-destroy list for Phase 1.

**Component inventory**
5. What shared UI primitives exist (Button, Input, Badge, Card, Table, Modal)? For each: file path, prop signature, and how many places consume it.
6. Which v2 components map onto an existing primitive by extension, and which have no equivalent? Produce the mapping table — this determines whether Phase 1 is a retheme or a rebuild.
7. Is there an existing icon set? Which library, what stroke weight, how many icons in use?

**Routes**
8. Full route list with the file that renders each.
9. Map each route to its artboard ID from `02-screen-index.md`. Flag: routes with no artboard (features we have not designed — raise them), and artboards with no route (the net-new list — verify against README §6).
10. Which routes are server-rendered and which are client-only? Affects how the token layer loads.

**Data**
11. For each screen in Phase 2, what API or data source backs it today? Where a v2 screen shows a field the API does not return, list it.
12. Compare the live schema against `05-domain-and-data-model.md`. Which of the ~40 entities exist, which are partial, which are absent?
13. Specifically check the §12 additions, none of which the v1 model supports: `part_interchange` and its deltas, `service` / `service_category`, the `case_study` family, the `industry` child tables, and structured `policy`. These are backend work to scope **now**, not at Phase 4.
14. Does `rfq_line` carry a substitution reason? The v2 quote flow needs one and the v1 model does not have it.

**Risk**
15. Where is the old design language most deeply entangled with layout, such that reskinning means restructuring?
16. What has test coverage? Which of that will a restyle break?
17. Does any part of the codebase reference the v1 handoff (`design_handoff_indus_hydraulics/`) or its tokens? Flag it — that package contradicts this one.

### Done when
`AUDIT.md` exists, the route↔artboard mapping is complete, the component mapping table names every v2 primitive as extend / build / already-exists, and the schema gap list from questions 12–14 is written down.

**Review this before starting Phase 1.** If the audit shows no token layer and heavy hard-coded colour, Phase 1 grows and the estimate for everything after should move with it.

---

## Phase 1 · Design foundation

**The load-bearing phase. Everything else inherits it.**

### Paste
`README.md`, `01-design-language.md`, `03-interactions-and-states.md`, `AUDIT.md`
Source: `tokens.css`, `ui.jsx`, `foundation.jsx`

### Build
1. **Port `tokens.css`** into the app's styling architecture. Custom properties if the app supports them; Tailwind theme extension if it is a Tailwind codebase. Keep OKLCH — do not convert to hex. Keep the `--ih-` prefix or rename consistently, but rename *everywhere* in one commit.
2. **Load the three fonts.** Self-host for production. Set the feature settings (`ss01`, `cv11`) and `tnum` on the mono class.
3. **Build or retheme the primitives**: Button (5 kinds × 3 sizes), Field/Input/Select/Textarea, Label/Hint, Checkbox, Badge (7 variants + square modifier + dot), Card, Chip, Avatar, Table, SpecList, StatTile, Breadcrumb, SectionHead, Eyebrow, Note.
4. **Build the chrome**: UtilityBar, SiteNav (with the sentinel active-state rule), SiteFooter, AdminShell.
5. **Build the icon set** — 30 icons, or map to the existing library at matching weight. Do not mix families.
6. **Build `/_design`** — the foundation board as an internal route. Every primitive in every state, plus the palette and type scale.
7. **Delete the old token layer** in the same phase. Leaving both is how drift starts.

### Done when
- `/_design` renders and is visually indistinguishable from `foundation.jsx` at 100%
- Every primitive has default, hover, focus-visible, active and disabled states
- Zero references to the old accent colour remain in the shared layer
- One existing page — pick the simplest, probably 404 — renders correctly through the new primitives with no page-level overrides

**Do not start Phase 2 until `/_design` is signed off.** Fixing a token here costs one commit; fixing it after Phase 3 costs fifty files.

---

## Phase 2 · Core commerce path

The path that earns money, and the fullest test of the language.

### Paste
Phase-1 documents + `02-screen-index.md` §01–02
Source: `site-home.jsx`, `site-catalog.jsx`, `site-product.jsx`

### Build
`home` · `plp` · `search` · `brands` · `compare` · `megamenu` · `pdp` · `quotelist` · `rfq` · `rfq-done`

Order: **PDP first, then PLP, then home.** PDP is the highest-traffic template and exercises most of the system; home is the longest and benefits from patterns already settled elsewhere.

Restructures in this phase: PDP moves to title-first with a 4:3 hero.

Also implement here: quote-list persistence, facets and sort in URL params, and the part-number search interception.

### Done when
All ten render at 1440 matching their artboards; the quote path works end to end from PDP to confirmation; empty and loading states exist for the product grid, search results and quote list.

---

## Phase 3 · Content templates

Parallelisable with Phase 4. High screen count, low complexity — mostly data-driven templates.

### Paste
Phase-1 documents + `02-screen-index.md` §03–05, §08
Source: `site-industries.jsx`, `site-services-index.jsx`, `site-services.jsx`, `site-longform.jsx`, `site-case-full.jsx`, `site-editorial.jsx`

### Build
`ind-master` + 6 verticals · `svc-index` · `cases` · `case-detail` · `lf-editorial` · `lf-ledger` · `lf-case-7part` · `about` · `blog` · `post` · `contact`

**Build the industry detail as one data-driven template.** Seven pages, one component, `IND_PAGES` keyed by slug. If adding an eighth vertical requires touching a component, the template is wrong.

Same for the long-form patterns — three templates that content can be poured into, not three pages.

`svc-index` is a restructure with the real 20-service taxonomy. Do not reuse the current services page structure.

### Done when
Seven industry pages render from one template and one data object; the three long-form templates are documented for the content team; all copy matches the source verbatim.

---

## Phase 4 · Supporting surfaces

### Paste
Phase-1 documents + `02-screen-index.md` §06–07, §09–10
Source: `site-replacement.jsx`, `site-surfaces.jsx`, `site-account.jsx`, `site-policy.jsx`, `site-system.jsx`

### Build
`replacement` · `cat-index` · `brand-detail` · `palette` · `compare-tray` · 6 account screens · 5 policy pages · `404` · `maint`

**`/replacement` is the priority within this phase** and should be scoped as a feature, not a page. It needs an interchange data model: obsolete code, current code, confidence, per-attribute deltas with fit-effect, and a narrative note. Confirm during Phase 0 whether that data exists anywhere.

Palette and compare tray are global surfaces — build them into the app shell, not into a route. The tray is `position: fixed` in production regardless of what the artboard does.

Policy pages are one template, five content sets.

### Done when
Cross-reference returns a documented result with the change table; the palette opens on ⌘K from any route with correct focus management; the tray persists across navigation; all five policy pages render from one template.

---

## Phase 5 · Admin console

Start any time after Phase 1. Natural place for a second developer.

### Paste
Phase-1 documents + `02-screen-index.md` §11–13
Source: `admin-core.jsx`, `admin-catalog.jsx`, `admin-crm.jsx`, `admin-platform.jsx`

### Build
All 17 console screens.

Desktop only, minimum 1280. Same language, different weighting: navy sidebar chrome, dense tables, mono for every identifier, accent strictly on the one primary action per view.

**Raise the quote pricing console before scoping.** `adm-quotes` is the RFQ queue only. The screen where an engineer prices a multi-line quote, marks substitutions with reasons and sends does not exist in this package, and it is the most-used screen in the backend.

### Done when
All 17 render at 1440×900 with correct internal scroll; the console reads as the same product as the public site; empty and loading states exist for every table.

---

## Working rules across all phases

**Never introduce a colour.** If a value is needed that is not in `tokens.css`, that is a design question — raise it rather than picking a neighbouring shade.

**Never reword approved copy.** Industry and service copy is verbatim from the live site. Case, policy and editorial copy is approved as written. Product data is illustrative and should come from the API.

**Placeholders are not deliverable.** Every `Img` label is a shot-list entry. Agree a photography plan; ship a neutral fallback in the interim, not the blueprint grid.

**One primary action per view.** If a screen appears to need two, one of them is secondary.

**Commit per screen, not per phase.** A 17-screen commit cannot be reviewed.

**When the design and the codebase conflict, say so.** If a v2 screen assumes data the API does not return, or a layout the component system fights, raise it. Do not silently approximate — an approximation that ships is indistinguishable from a decision.

---

## Suggested first message to Claude Code

> We are migrating the Indus Hydraulics application to a new design language. The full handoff is in `design_handoff_indus_hydraulics_v2/`.
>
> Start with **Phase 0** in `04-audit-and-migration.md`. Read `README.md` and `01-design-language.md` first for context, then perform the audit and produce `AUDIT.md`. Make no code changes in this phase.
>
> Pay particular attention to the route↔artboard mapping and the component mapping table — the plan for the later phases depends on both.
>
> Note: an older handoff folder `design_handoff_indus_hydraulics/` may still exist. **Ignore it.** It specifies the previous design language and contradicts this package; `06-diff-from-v1-handoff.md` explains where.
