# Product FAQ programme — plan

Status: APPROVED 2026-11-19 (decisions in §9). Pilot in progress.

## 1. Where we actually are (measured on the live DB, 2026-11-19)

The premise "no product has FAQs" is not quite right. The plumbing is complete and most pages
already carry some FAQs. The real problem is that most of them are thin, templated and not
written for what people search.

**Plumbing, already live, no code needed:**
- `product_faqs` table (question, answer, position) → PDP "FAQ (n)" tab, server-rendered.
- `FAQPage` JSON-LD emitted on every PDP with FAQs (checked live on
  `/p/epdm-pe-suction-hose`: tab "FAQ (5)" and the JSON-LD both present).
- Admin product editor can edit FAQs. FAQ count feeds `contentScore`.
- Writes are DB-only: **no deploy, no cache wipe**. Each write bumps the product's
  `contentUpdatedAt` (sitemap lastmod), which is what we want here.

**Coverage:**

| | Active products | With FAQs | Without |
|---|---|---|---|
| All | 7,168 | 4,933 (69%) | 2,235 |

Biggest gaps by root category (active products with no FAQ):

| Root | Active | No FAQ |
|---|---|---|
| Hoses & Fittings | 2,606 | 987 |
| Pneumatics | 797 | **797 (all)** |
| Industrial Hoses | 524 | 138 |
| Valves & Manifolds | 486 | 57 |
| Hydraulic Pumps | 151 | 53 |
| Seals & Accessories | 66 | 49 |
| Instrumentation & Controls | 167 | 39 |
| Hydraulic Cylinders | 175 | 29 |
| Hydraulic Tools & Bolting | 91 | 25 |
| Oilfield small roots (well testing, frac, cementing, drilling, stimulation) | 49 | 39 |
| Hydraulic Motors | 76 | 13 |

Fully covered already: Lifting & Rigging, Lubrication, Marine, Flow Iron, BOP, Oil & Gas Hoses,
Lay Flat, Gearboxes & Winches, Finned Tubes.

**Quality of the existing 26k:**
- Distribution: most products have 2–8; only ~115 have 9+.
- Median answer 164 characters; 25% are under 116. Many are one-liners.
- 190 questions are reused verbatim on 20+ products; 381 answers are reused on 10+ products.
- Top questions are generic: "What is the lead time?" (1,794), "Lead time?" (853),
  "What is it made from?" (849), "What pressure is it rated to?" (800),
  "What sizes are available?" (769) / "Which sizes are available?" (713).
- Questions are written as tab labels, not as searches. Nobody types "What is it made from?".
  They type "is a JIC fitting the same as AN", "1SN vs 2SN hose", "R2AT ferrule skive or no skive".
- They do not name the product, its standard or its part numbers, so they add almost no
  relevance for the queries the page should win.

**Real search demand we already hold (free, no web-search budget):**
- `gsc_metric_daily`: 4,785 query rows over 1,860 PDP URLs, 2026-08-20 → 2026-11-15. Examples:
  "rdme couplings", "snaptite couplings", "ring joint gasket singapore", "atex rated hpu",
  "molykote g-5133", "demco gate valve", "sfx71104", "bsp banjo fittings".
  Almost all have 0 clicks → impressions without a page that answers the question.
- `search_query_logs` (on-site search): small (566), but shows part-number searches
  ("5406-flp", "012471-01", "j022122").
- `product_cross_references`: competitor part numbers — the best source of
  "is X equivalent to Y" questions, which are exactly what traders and stockists search.

## 2. What a good product FAQ is (the standard every FAQ must pass)

Each FAQ must be all of:

1. **Search-shaped.** The question reads like a query a buyer, maintenance engineer, trader or
   stockist would type or ask an AI assistant. It names the thing: product type, standard,
   series, size or part number. "What is the working pressure of a 1/2" SAE 100R2AT hose?"
   not "What pressure is it rated to?".
2. **Answered from facts we hold.** Specs, size rows, variants, cross-references, documents,
   origin, standards. Every number traceable to a DB field or a maker document.
   **No invented ratings** — the 2026-10-07 pressure-claims clean-up stands: maker figure,
   cited standard, or "not published".
3. **Useful on its own.** The answer resolves the question in the first sentence, then adds the
   detail (range, exceptions, how to choose). Target 2–4 sentences, 200–450 characters. The first sentence answers on its own.
4. **Specific to this page.** No answer shared verbatim with more than a handful of siblings in
   the same family. Family-level facts are fine, but phrased with this product's identifiers.
5. **Leads somewhere.** Where it fits, the answer points the reader at the next step: the size
   table, a datasheet, the matching fitting/ferrule/seal, a guide, or a quote. Not a CTA bolted
   onto every answer — at most 1–2 commercial FAQs per product.
6. **Clean.** No supplier/principal names (CLAUDE.md §14). Maker brands only where we list under
   that brand. No unverifiable certification claims (API monogram, NACE, ATEX) unless the
   product data or a document supports it.

## 3. Question taxonomy (per product, 8–12 FAQs)

Pick from these slots by product type. Not every slot fits every product.

| Slot | Searcher | Example |
|---|---|---|
| A. Identity / what it is | everyone | "What is a DIN 2353 24° cone bulkhead union used for?" |
| B. Part-number decode | buyer, stockist | "What does the code 1C456-12-8 mean?" |
| C. Interchange / equivalents | trader, stockist, maintenance | "Is it interchangeable with Snap-tite H series?" / "What is the Gates equivalent?" (from cross-refs) |
| D. Size & selection | engineer, buyer | "Which size do I need for a 3/4" 2SN hose?" "Sizes from X to Y — how to choose" |
| E. Ratings | engineer | working pressure / WLL / temperature / vacuum, with the basis (maker figure, standard, safety factor) |
| F. Materials & media compatibility | engineer | "Can it be used with seawater / phosphate ester / H₂S?" |
| G. Standards & certification | buyer, QA | "Which standard does it conform to? Does it come with an EN 10204 3.1 certificate?" |
| H. Compatibility with mating parts | maintenance | "Which ferrule / seal / hose / adapter goes with it?" |
| I. Install / service / inspection | maintenance | assembly torque, crimp, inspection interval, spares kit |
| J. Application / industry | buyer, AI engines | "Where is it used — drilling, marine, construction?" |
| K. Comparison | everyone | "1SN vs 2SN", "lubricated vs non-lubricated plug valve", "ball vs gate" |
| L. Origin & trade | trader, importer | country of origin, HS code, export documents to GCC / Africa / Asia |
| M. Commercial (max 1–2) | buyer | stock in Dubai / lead time by size, MOQ, what to send for a quote |

Default mix of 12: 1 A, 1 B (or a second D where no code system exists), 1–2 C (where
cross-refs exist, else K), 2 D, 1 E, 1 F, 1 G, 1 H, 1 I, 1 J or K, 1 L, 1 M.

## 4. Unit of work: product family templates + per-product facts

7,168 products cannot be researched one at a time to a good standard, and they do not need to
be: most belong to families (same shelf, same spec template, same standard). Plan:

1. **Family map.** Group active products by shelf + spec template (+ brand where branded).
   Expected ~300–500 families.
2. **Family research brief** (once per family, the "think and research" step):
   - real queries from GSC for that family's URLs,
   - cross-reference brands/series present,
   - standards, materials, rating basis, mating parts,
   - common buyer confusions (e.g. JIC vs SAE 45°, skive vs no-skive, WLL vs MBL),
   - which slots apply and which facts each needs.
   Web search only where GSC + our data are thin (budget: 200 searches/session shared).
3. **Per-product generation.** For each product, fill the family's slots with that product's
   own facts (title, SKU/MPN, size range from variants, specs, cross-refs, origin, HS code,
   documents, linked blog posts). Questions carry the product's identifiers, so siblings get
   distinct, specific FAQs.
4. **Automated checks** before any write:
   - every number in an answer appears in the product's data or the family brief source list;
   - supplier-name grep (§14 list) = empty;
   - no banned claims (API monogram / NACE / ATEX / "certified") without supporting data;
   - near-duplicate check across siblings (answer similarity threshold);
   - length bounds, question ends in "?", no "it" without a noun in the question.
5. **Human review** of a sample per family (5 products) before the family is written.

## 5. Existing FAQs: keep, rewrite or replace

Score each existing FAQ against §2:
- **Keep** — specific, factual, search-shaped (many of the hose-fitting, Sun cartridge and
  plug-valve ones are good on substance and only need the question re-phrased).
- **Rewrite** — right fact, weak question ("Lead time?" → "What is the lead time for a
  2" 1502 plug valve to Saudi Arabia?").
- **Drop** — duplicate, generic or unsupported.

Then top up to 8–12 with new slots. Existing hand-researched answers (lifting, oilfield,
finned tubes) are the most valuable input we have — reuse their facts, do not discard them.

## 6. Waves (priority = gap × search demand × commercial value)

| Wave | Scope | Products | Why first |
|---|---|---|---|
| 0 | Pilot: 3 families (one pneumatic shelf, one hose-fitting family, one oilfield valve family) | ~60 | Prove brief → generate → check → review loop; Ayush signs off format |
| 1 | Pneumatics (zero FAQs) | 797 | Whole root missing |
| 2 | Hoses & Fittings gaps + rewrite of its weak FAQs | 2,606 | Largest root, most GSC impressions, most cross-refs |
| 3 | Industrial Hoses, Valves & Manifolds, Pumps, Motors, Cylinders, Instrumentation, Seals, Tools | ~1,750 | Remaining gaps + rewrites |
| 4 | Oilfield roots (Flow Iron, Oilfield Valves, BOP, well test, frac, cementing, drilling, stimulation, O&G hoses) | ~520 | High value per page; top-up + rewrite |
| 5 | Lifting, Lubrication, Marine, Lay Flat, Gearboxes, Finned Tubes | ~1,410 | Already covered; rewrite to standard and top up |

Each wave: generate → checks → sample review → write (one transaction per product, batched,
off-peak, never within an hour of a deploy — pooler) → IndexNow for touched URLs → note GSC
baseline for those URLs.

## 7. Measuring it

Baseline now from `gsc_metric_daily` for each wave's URLs: impressions, clicks, distinct
queries, average position. Re-read 4 and 8 weeks after each wave. Also track: products with
≥8 FAQs, median answer length, duplicate-answer count, RFQs/enquiries from those PDPs.

Realistic expectation: Google has shown FAQ rich results only for authoritative government and
health sites since August 2023, so **no FAQ stars in search results**. The value is (a) the
page matching long-tail and part-number queries it currently gets impressions for but no
clicks, (b) AI answer engines (ChatGPT, Perplexity, AI Overviews) quoting a clean Q&A, and
(c) buyers getting answers that move them to a quote.

## 8. Optional code change (needs a deploy — batch it)

Answers render as plain text (`whitespace-pre-wrap`), so they cannot link. A small change to
allow internal links (a restricted markdown subset: `[text](/path)`, same-origin only) would let
answers point at the size table anchor, the matching ferrule/seal product, the guide or the
quote page. That is the "lead magnet" part. Not required for waves 0–1; would ship with the
next batch merge, and answers can be written link-ready before it lands.

## 9. Decisions (Ayush, 2026-11-19)

1. **Rewrite every existing FAQ to this standard.** Answer-first: the first sentence answers the
   question on its own, so Google AI Overviews, Perplexity, ChatGPT and Claude can lift it as
   the citation. Detail follows.
2. **12 FAQs per product.** Fewer only where the data genuinely cannot support 12 distinct,
   factual questions — never padded with filler to reach the count.
3. **Answers link to other pages.** Syntax `[text](/path)`, same-origin only — parser in
   `packages/domain/src/faq-answer.ts`, rendered in `ProductTabs`, stripped to plain text in the
   FAQPage JSON-LD. Target 2–4 internal links per product: mating parts, sibling sizes/series,
   the shelf, the relevant guide, the quote page. Every link is checked against live slugs
   before a write. **Answers with links are written only after the renderer is deployed**,
   otherwise the brackets show as text on the live page.
4. **Review is minimal.** Automated checks (§4.4) are the gate. Ayush sees the pilot output
   once; after that, waves go straight through unless a check fails.
5. **Commercial FAQ wording:** "We keep [product] in stock at our warehouse in Dubai, UAE, and
   ship worldwide with the best lead times." This is the catalogue stock posture already
   stated on every page (`packages/domain/src/stock-posture.ts`). The generator reads
   `productAvailability()` for each product so the FAQ never contradicts the pill: the two
   exempt shelves (`butterfly-valves`, `below-the-hook-lifting`) and discontinued products get
   their own lead-time / contact wording instead.

## 10. Pilot results (2026-11-19)

Tooling: `packages/db/src/scripts/product-faqs/` (`dump-facts.ts`, `load-product-faqs.ts`),
payloads in `packages/db/data/product-faqs/pilot/`. Nothing written to the database yet.

| Family | Products | FAQs | Links | Checker | Status |
|---|---|---|---|---|---|
| hammer-unions-standard-service | 21 | 252 | 83 | pass | ready — write after the link renderer deploys |
| hydraulic-hoses (Indus brand) | 11 | 132 | 55 | pass | ready — write after the link renderer deploys |
| pneumatic-tubing | 28 | 336 | 109 | 10 errors | **HOLD** — size-table data must be fixed first |

What the pilot taught us:

1. **FAQ writing is a data audit.** Writing 12 specific answers per product forces every figure
   to be read, and bad catalogue data surfaces immediately. The pneumatic tubing size tables
   carry impossible pressures (200 and 1,000 bar on 8-bar SMC TUZ/TUH/TRS polyurethane), roll
   lengths in the pressure column, wrong IDs on Parker 95UM, a 0.62" wall that should be 0.062",
   "1/28 Inch", and Parker rows whose pressure changes with pack length. Writers worked around
   them by telling the buyer our table was wrong; the checker now rejects that
   (`SELF_CRITICISM`) — fix the data, never the FAQ. **Every wave therefore starts with a data
   pass on the family's size tables**, and the writer's "facts that look wrong" list feeds it.
2. Other data issues reported by the writers, to fix at source:
   - Indus-brand standard hydraulic hoses all record country of origin "USA" — doubtful for
     own-label; the L-slot FAQs repeat whatever is recorded, so confirm before writing.
   - R13: short description 345 bar vs specs 350 bar. R13/R15 bore ranges start at 3/8" but
     the published figures start at -12. 4SH/R13 OD range spec vs size table differ slightly.
   - Every Indus hose long description says the grade is "stocked in Eaton Winner and Parker
     Hannifin" — review.
   - Figure 1003 hammer union description says "Our supplier rates…" (internal wording, live).
   - Hammer-union dimension anomalies: Fig 1003 5" lighter than 4"; Fig 50 5" lighter than 4";
     Fig 100 3" A = B = 103.1; Fig 2002 4" B < 3" B; Fig 1502 BW 3" B < 2" B; Fig 200/206 BW
     6" B < 5" B. Fig 1505 described as butt weld but variants include threaded.
   - ATP and Nycoil part numbers look like a distributor's item numbers, not
     maker part numbers (§14 of CLAUDE.md) — kept out of FAQ text; review the listings.
   - SMC "T Series Nylon Tubing" material recorded as Urethane; "SMC TIL/TL" listing actually
     holds TH (FEP) and TD (modified PTFE); "SMC Tubing" mixes series incl. non-tubing TK-4/TJ.
3. Quality held up: questions name figure numbers, series codes and standards; first sentences
   answer on their own; comparisons (R12 vs 4SH, 1502 vs 2002, TUZ vs TUH) are the strongest
   slots. Links averaged 4–5 per product.
4. Cost: ~3 writer agents × 7–16 min for 60 products. A family of ~25 products ≈ 1 agent run.
   ~900 families ⇒ batch them 3–4 per agent where small.

Next: (a) deploy the link renderer in the next batch merge; (b) write the two ready pilot
families with `--write --allow-links`, IndexNow; (c) pneumatic tubing data fix, rewrite, write;
(d) wave 1 = Pneumatics, each shelf preceded by its size-table data pass.
