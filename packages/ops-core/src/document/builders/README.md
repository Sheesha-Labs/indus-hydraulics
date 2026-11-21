# Document builders

One builder per document kind turns a domain record into `DocumentData` (`../types.ts`). Both renderers
(the HTML `DocumentPage` in `@indus/ops-ui/document` and the PDF in `@indus/ops-pdf`) draw from that one
structure, so they cannot disagree (ADR-14).

Nothing is built here yet. The builders arrive with the features that issue each document:

| Kind | Builder | Sprint |
|---|---|---|
| OA, PI, PO, PL, DN, tax invoice, credit note | `buildOa`, `buildPi`, `buildPo`, `buildPl`, `buildDn`, `buildInvoice`, `buildCreditNote` | S11 |
| Supplier RFQ | `buildRfq(group)` | S12 |
| Client quotation (Estimate layout) | `buildQuotation(estimate)` | S17 |

Rules every builder follows:

1. **Safe inputs only.** Client-facing builders take `ClientSafeLine` (no supplier, cost, landed or margin
   field); supplier-facing builders take `SupplierSafeLine` (no client name, client ref, client part number,
   site, vessel or project field). The types make the wrong field a compile error (CLAUDE.md §10).
2. **Numbers are formatted, not computed, by renderers.** Builders compute totals, VAT and FX with the
   `ops-core` money helpers and hand the renderers strings.
3. **The letterhead is not the builder's.** Legal name, address, TRN, phone, bank lines, logo, stamp and
   signature come from the database (`Letterhead`) at render time. The public repository holds none of them.
4. **Wording is data.** Disclaimers, terms and note headings come from settings rows, never from literals.
