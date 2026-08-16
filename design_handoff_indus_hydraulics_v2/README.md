# Handoff: Indus Hydraulics — design language v2

**Prepared for:** Claude Code, working against the existing Indus Hydraulics codebase
**Date:** 16 August 2026
**Scope:** 63 screens — public site and admin console — in a new design language

---

## 1. What this is

Indus Hydraulics has an existing, largely-built application in an older design language (warm paper, orange accent, `shared/styles.css`). The client has since rejected the orange accent and directed a blue palette, and asked that the visual language borrow from the Bazar real-estate project.

This package is the complete v2 design language and the full screen set expressed in it. **Your job is to absorb this language into the existing codebase** — not to build a new application. Most of the routes already exist. What changes is the token layer, the component grammar, and in some cases the page structure.

There are also **15 genuinely new surfaces** that do not exist in the current build at all (listed in §6). Those are net-new work.

---

## 2. About the design files — read this first

The files in `design-source/` are **design references written in HTML and React-via-Babel**. They are:

- A single pannable canvas (`Indus Hydraulics V2.html`) that renders all 63 screens as fixed-size artboards
- Rendered in-browser with Babel standalone, no build step, no router, no data layer
- Deliberately stateless — filters don't filter, forms don't submit, tables are hand-written arrays

They are **not production code and must not be copied wholesale into the app.** Specifically:

| Do not port | Reason |
|---|---|
| `design-canvas.jsx`, `app.jsx` | Canvas harness only. Has no analogue in the product. |
| `<AB>` wrapper, `.ih` root class, fixed artboard heights | Artifacts of presenting at 1440×N in a canvas. |
| `Img` / `.ih-img` blueprint placeholders | Stand-ins for photography the client will supply. |
| Inline `style={{}}` objects | Used for speed of iteration. Port to whatever the codebase uses — Tailwind, CSS modules, styled-components. |
| Hard-coded data arrays (`PRODUCTS`, `SVC_CASES`, `IND_PAGES`) | Shapes are instructive; values are illustrative. Wire to the real API. |

**`tokens.css` is the exception.** It is written as production-ready custom properties and should be ported close to verbatim. It is the contract.

---

## 2b. Supersedes the previous handoff

An earlier package exists at `design_handoff_indus_hydraulics/`. It was written against the **previous** design language and **directly contradicts this one** — it specifies Inter, IBM Plex Mono, 0–2px radii, an orange accent, a 1200px content width, and describes the project as greenfield.

**Delete that folder, or read `06-diff-from-v1-handoff.md` before opening it.** Everything from it that remains valid — principally the data model and the domain rules — has been carried into `05-domain-and-data-model.md`.

---

## 3. Fidelity

**High fidelity.** Colours, type scale, spacing, border radii, component states and copy are all final and intentional. Recreate them precisely, using the codebase's existing component primitives where they exist.

Two qualifications:

- **Desktop only.** Every artboard is 1440px wide. Responsive behaviour is specified in `03-interactions-and-states.md` but has not been visually designed. Mobile for v2 is outstanding work.
- **Copy is final where it is real.** Industry pages, service names and service descriptions are verbatim from indushydraulics.com and must not be rewritten. Case-study body copy, policy text and editorial long-form were written for these designs and are approved as-is. Product names, SKUs and stock figures are illustrative.

---

## 4. Package contents

```
design_handoff_indus_hydraulics_v2/
├── README.md                      ← you are here: scope, phasing, acceptance
├── 01-design-language.md          ← tokens, component contracts, layout grammar
├── 02-screen-index.md             ← all 63 screens: purpose, layout, structure
├── 03-interactions-and-states.md  ← motion, states, responsive, accessibility
├── 04-audit-and-migration.md      ← Phase 0 codebase audit protocol
├── 05-domain-and-data-model.md    ← ~40 entities + v2 amendments (§12)
├── 06-diff-from-v1-handoff.md     ← what changed since the previous package
└── design-source/
    ├── Indus Hydraulics V2.html   ← open this in a browser to see everything
    ├── tokens.css                 ← THE CONTRACT — port this first
    ├── ui.jsx                     ← shared primitives + site chrome
    ├── foundation.jsx             ← the design-language board itself
    ├── site-*.jsx                 ← public site screens, grouped by area
    ├── admin-*.jsx                ← console screens, grouped by area
    ├── app.jsx                    ← canvas manifest (reference for the screen list)
    └── design-canvas.jsx          ← canvas harness (do not port)
```

To view the designs: open `design-source/Indus Hydraulics V2.html` in a browser. Scroll and zoom. Sections are numbered 00–13.

---

## 5. Recommended sequencing — phased, not all at once

**Feed this to Claude Code in phases.** Six of them. The reasoning matters, so it is set out below rather than asserted.

### Why phased

1. **Volume.** 63 screens across ~20 source files exceeds what fits usefully in one context window. Attempted at once, later screens get built from a decayed memory of the language rather than from the language itself, and drift compounds silently.
2. **The foundation is load-bearing.** Every screen resolves to `tokens.css`. If the token port is wrong — one shade off, one radius wrong — the error replicates 63 times before anyone reviews it. Phase 1 exists to be verified in isolation, cheaply.
3. **The audit changes the plan.** Phase 0 produces a map of which existing routes take a pure reskin, which need restructuring, and which are net-new. Sequencing the rest before that map exists is guesswork.
4. **Review cadence.** Reskin work is fast to produce and slow to review. Phases give the client natural checkpoints — after Phase 2 they can see the language on real pages and correct course before it is applied 50 more times.
5. **Risk isolation.** The riskiest work (Phase 5, admin console) is also the least externally visible. Sequencing it last means an unrecoverable problem there doesn't block the public site.

### The phases

| Phase | Content | Screens | Depends on |
|---|---|---|---|
| **0** | Codebase audit — no code changes | — | nothing |
| **1** | Design foundation — tokens, primitives, chrome | 1 | Phase 0 |
| **2** | Core commerce path — home, PLP, PDP, search, quote, RFQ | 10 | Phase 1 |
| **3** | Content templates — industries, services, long-form, editorial | 20 | Phase 1 |
| **4** | Supporting surfaces — account, tools, policy, system | 15 | Phase 2 |
| **5** | Admin console | 17 | Phase 1 |

Phases 3 and 4 can run in parallel with each other once 2 is accepted. Phase 5 can start any time after 1, and is the natural place to put a second developer.

### What to paste per phase

Start each phase with the same three files — `README.md`, `01-design-language.md`, `03-interactions-and-states.md` — plus the relevant slice of `02-screen-index.md` and only the `design-source/` files that phase needs. The per-phase file list is in `04-audit-and-migration.md`.

Do not skip re-supplying the design language each phase. It is short, and it is what keeps phase 5 looking like phase 2.

---

## 6. What is net-new versus what is a reskin

**Reskin — route exists, apply the new language:**
home, category/PLP, PDP, search, brands index, compare, mega menu, quote list, RFQ, RFQ confirmation, sign in/up, forgot password, account dashboard, account quotes, saved list, about, blog index, blog post, contact, 404, maintenance, and all 17 admin screens.

**Restructure — route exists but the page is materially different:**

- **Services index** — rebuilt to the live site's structure with the real 20-service taxonomy (category chips with counts, case-of-the-week, outcome-chip grid, four-step method band, long-reads). The current build's services page is generic industrial hydraulics; this is the BOP-weighted business the live site actually describes.
- **Industry pages** — now a single data-driven template with seven verticals. The current build has one hand-written page.
- **PDP** — title-first ordering, 4:3 hero.

**Net-new — no current equivalent:**

| Surface | Notes |
|---|---|
| `/replacement` | Obsolete-part cross-reference finder. Highest-value gap; sitemap priority 0.7, weekly changefreq. |
| `/industries/marine`, `/industries/steel` | Completes the six live verticals. Data entries in the industry template. |
| `/c` category index | Distinct from a single category PLP. |
| `/brands/{slug}` brand detail | Bosch Rexroth is the worked example. |
| ⌘K command palette | Present in live header on every page; never designed. |
| Compare tray | The drawer that accumulates compare selections. |
| `/shipping` `/returns` `/warranty` `/privacy` `/terms` | One template, five content sets. |
| Long-form templates ×3 | Editorial spreads, service ledger, seven-part case study. |

---

## 7. Acceptance criteria

A phase is done when all of the following hold.

**Every phase:**
- No hard-coded colour values anywhere in the diff. Every colour resolves to a `--ih-*` custom property.
- No orange, warm grey, or `shared/styles.css` values survive in the touched files.
- Type uses only the three families: Geist (sans), Instrument Serif (display), JetBrains Mono (data/labels).
- Nav active state is correct on every screen, including the deliberate no-highlight cases (account, policy, 404).
- Focus rings present and visible on all interactive elements.
- Text contrast meets WCAG AA against its actual background.

**Phase 1 additionally:**
- Rendering the foundation board from ported tokens is visually indistinguishable from `design-source` at 100%.

**Phases 2–5 additionally:**
- Each screen matches its artboard in structure, order and spacing at 1440px.
- Empty, loading and error states exist for every data-backed region (see §5 of `03-interactions-and-states.md`) — the designs show only the populated state, and this is a known gap you are expected to fill.

---

## 8. Assets

**Fonts** — Geist, Instrument Serif, JetBrains Mono. Currently loaded from Google Fonts; self-host for production.

**Icons** — 30 inline SVG icons in `ui.jsx` under the `I` object. 24×24 viewBox, `currentColor` stroke, 1.7 default stroke-width, round caps and joins. Port as a component or swap for the codebase's existing icon set at matching weight — do not mix two icon families.

**Imagery** — none supplied. Every image is an `Img` placeholder whose `label` prop describes the intended photograph (e.g. `"wellhead christmas tree, control panel · 1200×900"`). These labels are a shot list for the client. Do not ship the placeholders; agree a photography plan or use a neutral fallback.

**Logo** — the nav mark is a CSS construction (rounded navy square, monospace `IH`, steel dot). Replace with the real asset when supplied.

---

## 9. Known gaps

Carry these into your plan; none are oversights.

1. **Mobile.** All artboards are 1440. The earlier responsive retrofit covered v1 only and does not apply.
2. **Empty / loading / error states.** Every table is full and every search succeeds in these designs.
3. **Arabic / RTL.** The live training page offers bilingual EN/AR. Not designed. Affects the type system, not just strings.
4. **Motion.** Specified in prose in `03-interactions-and-states.md`, not prototyped.
5. **The quoting console.** The admin RFQ queue exists; the screen where an engineer actually prices a multi-line quote does not. It is the most-used screen in the backend and it is not in this package.
6. **Address book and notification centre.** Both are fully modelled (`account_address` with an approval workflow, `notification`) and neither has ever been designed — in this package or the previous one.

---

## 10. Domain

The visual language changed; the business did not. `05-domain-and-data-model.md` carries the full entity model — accounts, catalogue, per-warehouse inventory, the stacking pricing engine, the RFQ→quote→order state machine, saved lists, CMS and bulk import — plus **§12**, which amends it for the v2 surfaces (part interchange, services, case studies, richer industries, structured policies) and corrects the facts that moved with the Dubai-led positioning.

Read §12 first if you already know the v1 model. Read the whole file before Phase 2.
