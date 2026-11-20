# Ferryl product FAQs — `product-faqs/ferryl/`

These payloads hold 12 answer-first FAQs for each of the **20 Ferryl listings** loaded in #645 and #648, written to
`docs/product-faq-plan.md` (§2, §3, §9). They were written to the database on 2026-11-20 and every family passed
`load-product-faqs.ts`.

| Payload | Shelf (`--shelf`) | Listings | FAQs |
|---|---|---|---|
| `ferryl-greases.json` | `wire-rope-anticorrosive-greases` | 5 | 60 |
| `ferryl-lubricators.json` | `wire-rope-lubricators` | 2 | 24 |
| `ferryl-coatings.json` | `anticorrosive-safety-coatings` | 5 | 60 |
| `ferryl-maintenance-chemicals.json` | `marine-maintenance-chemicals` | 8 | 96 |

## Reload

A catalogue re-run (`import-lifting-catalogue.ts` on any `catalogue-ferryl-*` payload) **wipes these FAQs**. Reload
them straight after every catalogue run:

```bash
pnpm --filter @indus/db exec tsx src/scripts/product-faqs/dump-facts.ts \
  --shelf=<shelf> --brand="Ferryl" --out=<scratch>/<family>.json
pnpm --filter @indus/db exec tsx src/scripts/product-faqs/load-product-faqs.ts \
  --facts=<scratch>/<family>.json --payload=data/product-faqs/ferryl/<family>.json --write --allow-links
```

## Claim rules used

- Ferryl is named as the maker. Indus *distributes* Ferryl in the Middle East — there is no "authorised distributor"
  wording yet.
- No equivalence with other brands; the comparisons are between Ferryl products or between product types.
- No environmental, toxicity, EAL/VGP, SOLAS/IMO, NLGI-grade, flash-point, VOC or coverage claim. The two published
  figures used are the 202 Aluminium temperature range and the lubricator's figures.
- The commercial answer carries the catalogue stock sentence (plan decision 5), because every Ferryl listing is
  ex-stock.
