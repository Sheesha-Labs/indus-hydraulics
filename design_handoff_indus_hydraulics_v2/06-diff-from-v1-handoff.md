# 06 · Diff from the v1 handoff

The v1 package (`design_handoff_indus_hydraulics/`) was produced against the previous design language. Much of it is still correct — the domain did not change. Some of it is now actively wrong.

**Read this before opening the v1 folder for any reason.** Better: delete the v1 folder once this package is accepted. Two handoffs in circulation, one of which specifies Inter and 0px radii, is a real risk.

---

## 1. Direct contradictions — v1 is wrong, v2 wins

If Claude Code reads both, these are the ones that will produce visibly incorrect work.

| Subject | v1 says | v2 says |
|---|---|---|
| **UI typeface** | Inter 400/500/600/700 | **Geist** |
| **Display typeface** | none — Inter for headings | **Instrument Serif**, with an italic closing clause |
| **Mono typeface** | IBM Plex Mono | **JetBrains Mono** |
| **Border radius** | "flat / industrial / 0–2px" | **4 / 6 / 10 / 16px** |
| **Accent colour** | orange | **`oklch(0.475 0.115 248)`** — signal blue. *Client rejected orange outright.* |
| **Palette format** | hex | **OKLCH throughout** — do not convert |
| **Neutrals** | warm grey | **blue-black ink, cool paper** — never neutral grey |
| **Content width** | 1200px storefront, 1400px admin | **1440 with 48px gutters** |
| **Project state** | "greenfield build — no existing codebase" | **there is now a codebase**; this is a migration, not a build |
| **Primary warehouse** | Mumbai | **Dubai / Jebel Ali** |
| **Contact** | +91 22 4890 1200, IST | **+971 52 2477942, 09:00–18:00 GST** |
| **SKU count** | 1,870 | **1,134 live SKUs** |
| **Nav IA** | Catalogue, Insights | **Products, Brands, Industries, Services, Blog, About, Contact** |
| **Signed-out stock** | defaults to Mumbai | **defaults to Dubai** |

`PROMPTS.md` in v1 is the most dangerous single file: its §1 instructs Claude Code to port the old tokens and match "Inter + IBM Plex Mono" and the "0–2px border-radius aesthetic" exactly. It has been superseded by `04-audit-and-migration.md`.

---

## 2. Valuable v1 content that was missing from v2 — now carried forward

These were real gaps in the first cut of this package. All are now in `05-domain-and-data-model.md`.

- **The full data model** — ~40 entities across identity, catalogue, inventory, pricing, RFQ→quote→order, self-service, content, bulk import. Unchanged and still mandatory.
- **Domain concepts** — RFQ-not-checkout, the RFQ status machine, the stacking pricing engine, per-warehouse inventory, accounts ≠ users, BOM-style saved lists. The v2 designs assume all of this and never state it.
- **The two-context auth model** — `account_contact` for the storefront, `staff_user` for the console, deliberately not sharing a session backend.
- **Indexing hints** and the authorisation sketch.

---

## 3. Screens: v1 → v2

### Present in v1, present in v2 — reskin
index, category, search, brands, brand, compare, product, quote, rfq, rfq-confirmation, account-signin, account-signup, forgot-password, account-dashboard, account-quotes, saved-list, about, blog, contact, 404, maintenance, and all 17 console screens.

The console maps one-to-one, with `admin/design.html` → `adm-tokens`. **v2 adds `adm-quotes`**, the RFQ queue, which v1 explicitly listed as "not designed".

### Present in v1, materially changed in v2
| Screen | Change |
|---|---|
| `product.html` | title-first ordering, 4:3 hero (mobile fix, preserved at all breakpoints) |
| `industry.html` | one hand-written page → **one data-driven template, seven verticals** |
| services (v1 root files) | generic industrial hydraulics → **the live 20-service, BOP-weighted taxonomy** |

### Absent from v1, new in v2 — 15 surfaces
`/replacement` cross-reference finder · marine and steel verticals · category index · brand detail · ⌘K palette · compare tray · five policy pages · three long-form templates · the seven-part case study.

### Referenced in v1 but never designed — still missing in v2
- **`address-book.html`** — cited in v1 `PROMPTS.md` §7 and fully modelled as `account_address` with an approval workflow. It does not exist in the v1 `designs/` folder and has no v2 artboard. **Genuine gap in both packages.**
- **Notification centre** — `notification` is modelled, the bell icon is specified in v1 §8, no screen exists in either package.
- **Quote pricing console** — the screen where an engineer prices a multi-line RFQ. `rfq_line` supports it; nobody has drawn it.

---

## 4. Model gaps the v2 designs opened

Detailed in `05-domain-and-data-model.md` §12. In brief:

1. **`/replacement` cannot be built on the existing model.** `product_cross_reference` records *competitor* codes pointing at our SKU; the v2 page is *same-brand supersession* with per-attribute deltas, a fit confidence and a narrative note. Three new tables.
2. **Services are entirely unmodelled** — 20 services, 11 categories, outcome chips.
3. **Case studies are unmodelled** — the seven-part template needs phases, an SOP ledger with sign-off, before/after metrics and a team.
4. **`industry` is far too thin** — needs certifications, stats, application areas, support checks and reference installs as child tables.
5. **`cms_page` is a rich-text blob**; policy pages are structured sections plus an at-a-glance list.

---

## 5. Scope decisions to re-confirm

**Pricing.** v1 built a full engine including `promo_code` and `campaign` rule kinds. v2 shows **no prices anywhere** on the storefront. The engine is still needed to price the quote an engineer sends, but promo codes and campaigns are B2C-shaped and appear nowhere in the v2 designs. Confirm whether they are still wanted.

**v1 out-of-scope list** — mobile console, account switcher for multi-account users, returns/RMA, online payment, ERP integration, multi-currency display, tax engine, i18n, approval workflows beyond addresses, team invite and role management. All still out of scope. v2 adds three more: **Arabic/RTL** (the live training page offers bilingual EN/AR), **mobile for the v2 language** (the earlier retrofit covered v1 only), and **empty/loading/error states** — specified in `03-interactions-and-states.md` §5 as a build requirement rather than a design deliverable.

---

## 6. Recommendation

Delete `design_handoff_indus_hydraulics/` once this package is accepted. Everything worth keeping has been carried into `05-domain-and-data-model.md`, and what remains contradicts the approved direction.
