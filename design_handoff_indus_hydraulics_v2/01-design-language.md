# 01 · Design language

The complete visual contract. Port `tokens.css` first and verify it before building any screen.

---

## 1. Provenance

The grammar is borrowed from the Bazar real-estate project, recoloured to the client's blue direction:

- **Quiet paper** — near-white cool background, white cards, no heavy shadow
- **1px rules** — hairline borders do the separating work; shadows are rare and soft
- **Editorial serif for display** — Instrument Serif at large sizes, with an italic clause carrying emphasis
- **Monospace for data** — every number, SKU, code, label and eyebrow
- **One loud colour** — signal blue, used sparingly. Everything else is ink, paper and rule.

The single most important restraint: **blue must remain the loudest thing on the page.** Semantic colours are deliberately low-chroma so they never compete with it.

---

## 2. Colour

All values are OKLCH. Port verbatim — do not convert to hex, and do not "round" to a nearby brand blue.

### Surfaces
```css
--ih-bg:            oklch(0.976 0.004 250);   /* page background — cool paper */
--ih-surface:       #ffffff;                   /* cards, nav, table bodies */
--ih-surface-2:     oklch(0.955 0.006 250);   /* inset panels, hover rows, ghost hover */
--ih-surface-3:     oklch(0.928 0.009 250);   /* avatar fill, deepest inset */
--ih-border:        oklch(0.902 0.008 250);   /* the hairline — used everywhere */
--ih-border-strong: oklch(0.82 0.013 250);    /* outline buttons, checkbox, dashed drop zones */
```

### Ink — blue-black, never neutral grey
```css
--ih-ink:     oklch(0.195 0.016 255);   /* headings, primary text */
--ih-ink-2:   oklch(0.33 0.016 255);    /* body copy, lede */
--ih-muted:   oklch(0.55 0.013 255);    /* secondary text, eyebrows, placeholders */
--ih-muted-2: oklch(0.685 0.011 255);   /* tertiary — file sizes, disabled arrows */
```

`--ih-muted-2` fails AA on white for body-size text. Use it only for ≥14px non-essential text or icons. Placeholders use `--ih-muted`.

### The blue family
```css
--ih-navy:         oklch(0.275 0.055 252);  /* utility bar, footer, admin sidebar, dark bands */
--ih-navy-2:       oklch(0.355 0.062 252);  /* raised surface on navy */
--ih-accent:       oklch(0.475 0.115 248);  /* THE signal — primary action, links, active nav */
--ih-accent-hover: oklch(0.40 0.115 248);
--ih-accent-soft:  oklch(0.945 0.026 248);  /* accent-tinted panel, notes, selected row */
--ih-accent-fg:    #ffffff;
--ih-steel:        oklch(0.68 0.075 240);   /* secondary data blue — eyebrows on navy, dots */
--ih-steel-soft:   oklch(0.955 0.018 240);  /* steel-tinted panel */
```

**Accent discipline.** One primary action per view. `--ih-accent` also carries links, active nav underline, active tab, active chip, section numerals (`/01`), and the "after" column in before/after tables. It does not carry decoration.

### Semantic
```css
--ih-success: oklch(0.55 0.11 150);
--ih-warning: oklch(0.72 0.12 78);
--ih-danger:  oklch(0.55 0.17 28);
```

Badge pairings (background / foreground) are defined in `tokens.css` under `.ih-badge--*`. Use those, not ad-hoc tints.

---

## 3. Typography

Three families, no exceptions.

```css
--ih-font-sans:  "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--ih-font-serif: "Instrument Serif", ui-serif, Georgia, serif;
--ih-font-mono:  "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

Root: 14px / 1.45, `letter-spacing: -0.005em`, `font-feature-settings: "ss01","cv11"`, antialiased.

### Scale

| Role | Family | Size | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Page H1 (hero) | serif | 46–56px | 400 | -0.01em | line-height 1.03–1.06 |
| Section H2 | serif | 28–38px | 400 | -0.01em | `.ih-sechead .serif` = 34px |
| Section H2 (sans) | sans | 30px | 500 | -0.02em | when not editorial |
| H3 | sans | 17–25px | 500 | -0.02em | line-height 1.12–1.3 |
| Lede | sans | 16px | 400 | — | line-height 1.6, `--ih-ink-2` |
| Body | sans | 13–15.5px | 400 | — | long-form is 15.5/1.7 |
| Small / meta | sans | 12–13px | 400 | — | `--ih-muted` |
| Eyebrow | mono | 10.5px | 500 | 0.13em | uppercase, `--ih-muted` |
| Data / SKU | mono | 10.5–13px | 400 | 0–0.02em | `tnum` on |
| Big numeral | mono | 22–34px | 400 | -0.02 to -0.03em | stat rows |

### The display pattern

Hero and section headlines are **full sentences ending in a period**, with the closing clause set in italic:

```jsx
<h1 className="serif">Give us a part number that no longer exists. <em>We'll tell you what fits.</em></h1>
```

This carries over from the live site, where H1s are long declarative sentences. Keep the sentence structure — it is the client's voice, not a typographic flourish. The italic clause is the emphasis; never bold inside a serif headline.

### Monospace discipline

Mono is for machine-readable content: part numbers, SKUs, quantities, dates, durations, pressures, counts, statuses, eyebrows, table headers, breadcrumbs. Prose is never mono. A number inside a sentence is not mono; the same number in a stat tile is.

---

## 4. Geometry

```css
--ih-radius-sm: 4px;    /* small buttons, badges-square, inset chips */
--ih-radius:    6px;    /* buttons, inputs, notes */
--ih-radius-lg: 10px;   /* cards, image wells, panels */
--ih-radius-xl: 16px;   /* rare — largest containers only */
```

Spacing is a 4px scale exposed as `--ih-1` (4px) through `--ih-20` (80px), multiplied by `--ih-density` (default 1). Density is a hook for a future compact mode; leave it at 1.

**Page rhythm:** 48px horizontal page padding throughout. Sections are `padding: 72px 48px` (`.ih-sec`), tight variants 48px. Grid gaps: 16px for dense product grids, 20–24px for cards, 40–56px between column groups.

**Shadows are rare.**
```css
--shadow-1: 0 1px 2px rgba(20,28,45,.04), 0 8px 24px rgba(20,28,45,.04);
--shadow-2: 0 4px 12px rgba(20,28,45,.07), 0 18px 48px rgba(20,28,45,.09);
```
Shadow-1 for raised cards. Shadow-2 only for true overlays (command palette). Everything else separates with a 1px border.

---

## 5. Component contracts

All class definitions are in `tokens.css`. React signatures below are from `ui.jsx` — they describe the *contract*, not the implementation you must copy.

### Button — `.ih-btn`
`<Btn kind size icon iconR>` where `kind` ∈ `primary | navy | outline | ghost | onnavy`, `size` ∈ `sm | lg | undefined`.

Default 40px tall, 18px horizontal, 13.5px/500, radius 6. `sm` = 32px/12px/12.5px/radius 4. `lg` = 48px/24px/14.5px. Icons are 8px-gapped flex children. Transitions: `background .15s, border-color .15s, color .15s`.

`outline` hover is distinctive: background → `surface-2`, border → accent, text → accent. Not a grey hover.

### Field — `.ih-field`
40px, 12px padding, 1px `--ih-border`, radius 6, 13.5px. Focus: border → accent plus `0 0 0 3px var(--ih-accent-soft)`. Selects get a custom caret via inline SVG background; keep the 30px right padding. Textareas set `height:auto`, 10px vertical padding, line-height 1.55.

### Badge — `.ih-badge`
22px pill, 11px/500, radius 999. Variants: `accent | navy | steel | success | warn | danger`. `--square` modifier switches to radius 3 + mono 10px + 0.06em tracking — used for corner tags on imagery. `dot` prop prepends a 6px `currentColor` dot.

### Card — `.ih-card`
White, 1px border, radius 10, `overflow:hidden`. No shadow by default. This is the workhorse container.

### Chip — `.ih-chip`
30px pill, 12.5px, 1px border. `.is-on` fills accent with white text. `--ghost` drops the background. Used for filters and tag lists.

### Table — `.ih-table`
Header: mono 10.5px/500, 0.08em, uppercase, `--ih-muted`, 11×16px padding, bottom hairline. Cells: 14×16px, bottom hairline, middle-aligned, 13px. Row hover fills `--ih-surface-2`. Last row drops its border. `.num` cells switch to mono with `tnum`.

### Spec list — `.ih-spec`
Key/value rows, 10px vertical, hairline between. Key `--ih-muted` sans 13px; value mono 12.5px right-aligned. The standard pattern for technical attributes in rails and cards.

### Image placeholder — `.ih-img`
Blueprint grid (24px, hairline `oklch(0.905 0.01 250)`) on `oklch(0.945 0.007 250)`, with the `data-label` rendered centred in a translucent mono chip. Variants `--navy`, `--accent`, `--plain`. **Replace entirely with real imagery.**

### Chrome
- **`.ih-utility`** — 34px navy bar, mono 11px, 0.04em, 48px padding. Stock line left, contact links right.
- **`.ih-nav`** — 72px white, 48px padding, bottom hairline. Logo mark 34px navy rounded square with mono `IH` and a 5px steel dot bottom-right; wordmark serif 21px with a mono 9px/0.14em uppercase sub-line. Items 13.5px, 26px gap, active state = accent text + 1.5px accent bottom border.
- **`.ih-footer`** — navy, 64px top padding. Column heads mono 10.5px/0.12em uppercase in `oklch(0.68 0.03 250)`; links 13px, hover white.
- **`.ih-admin`** — 236px navy sidebar + fluid main. Sidebar items 13px with 10px icon gap, radius 6, active fills accent. Top bar 60px white with 1px bottom border. Content padding 24×26px.

### Nav active-state rule
`SiteNav` takes `active` matching one of `Products | Brands | Industries | Services | Blog | About | Contact`. Screens that belong to none — account, policy, 404 — pass an explicit sentinel (`active="none"`) so nothing highlights. **Do not let these fall through to a default.** A falsely-lit nav item is a wayfinding bug.

---

## 6. Layout grammar

Recurring compositions. Reuse them; do not invent new ones per page.

**Hero band** — `background: var(--ih-surface)`, bottom hairline, 48–60px vertical padding. Breadcrumb → eyebrow → serif H1 → lede → pills/actions. Optionally a 4:3 image at 1.25fr/1fr.

**Stat row** — 2–4 items, each with a 2px `--ih-accent` top border (or `--ih-steel` on navy), 14px padding-top, mono numeral 30–34px, mono eyebrow label beneath. The most-repeated device in the system.

**Four-up hairline grid** — `display:grid` with `gap:1px` on a `--ih-border` background inside a bordered radius-10 container. Produces a hairline-separated quartet with no double borders. Used for application areas, method steps, range-by-category.

**Numbered section** — `/01` mono accent numeral + serif H2, 13px padding-bottom, bottom hairline, content 18–20px below. The spine of every long-form page.

**Sticky rail** — 300–320px right column, `position:sticky; top:20px`, stack of cards: contents nav, spec/job card, then one tinted CTA card (`--ih-accent-soft` or `--ih-steel-soft` with matching border).

**Navy band** — exactly one dark panel per long page, used for the support/CTA moment. Eyebrow in `--ih-steel`, white serif H2, body in `oklch(0.82 0.02 250)`, checklist with steel ticks, primary button.

**Note block** — `.ih-note`, accent-soft background with `oklch(0.88 0.04 248)` border and `oklch(0.38 0.09 248)` text. For the one editorial aside per page.

---

## 7. Voice

The copy is part of the design and was written to a specific register: plain, specific, unsentimental, occasionally dry. It states what was measured and what it cost. It does not sell.

Rules that matter when you write new strings:

- Real numbers with units. "0.4 mm bend", "1.5× MAWP, 30 min", "19 days against a 21-day window".
- Name what is *not* covered as readily as what is. The warranty page leads with contamination.
- No exclamation marks, no emoji, no "seamless", "empower", "solutions" as a noun.
- Sentence case everywhere except mono eyebrows and table headers, which are uppercase.
- Where the live site's wording exists, it wins. Do not improve it.
