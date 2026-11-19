# Oteco product FAQs — `product-faqs/oteco/`

These payloads hold 12 answer-first FAQs for each of the **85 Oteco listings** in catalogue PRs #629, #630
and #631, written to `docs/product-faq-plan.md` (§2, §3, §9). Each payload covers one family, which is one
shelf with brand Oteco.

| Payload | Shelf (`--shelf`) | Listings |
|---|---|---|
| `oteco-gate-valves.json` | `oilfield-gate-valves` | 8 |
| `oteco-gate-valve-spares.json` | `gate-valve-repair-kits` | 5 |
| `oteco-relief-valves.json` | `oilfield-pressure-relief-valves` | 9 |
| `oteco-float-valves.json` | `oilfield-float-valves` | 5 |
| `oteco-pressure-gauges.json` | `ic-pressure-gauges` | 9 |
| `oteco-bop-rubber.json` | `bop-spare-parts` | 5 |
| `oteco-rig-floor.json` | `rig-floor-consumables` | 12 |
| `oteco-rig-hardware.json` | `rig-hardware` | 6 |
| `oteco-manifold-fittings.json` | `mud-manifold-fittings` | 10 |
| `oteco-connector.json` | `flow-iron-fittings-suppliers-uae` | 1 |
| `oteco-fluid-end.json` | `mud-pump-fluid-end-parts` | 6 |
| `oteco-swivel-washpipe.json` | `swivel-washpipe-packing` | 9 |

## Order of operations

The products do not exist in the database until the catalogue payloads load, so these FAQs are written
**after** that step.

1. Merge #629, #630 and #631 (the batch) and let the deploy finish.
2. Load the seven `catalogue-oteco-*` payloads with `--publish`. **Then** load these FAQs. The catalogue
   loader replaces a product's FAQs with the catalogue payload's, which is empty, so these payloads must run
   after every catalogue (re)load.
3. For each family, run the facts dump and the check, then the write:

   ```bash
   pnpm --filter @indus/db exec tsx src/scripts/product-faqs/dump-facts.ts \
     --shelf=<shelf> --brand="Oteco" --out=<scratch>/<family>.json
   pnpm --filter @indus/db exec tsx src/scripts/product-faqs/load-product-faqs.ts \
     --facts=<scratch>/<family>.json --payload=data/product-faqs/oteco/<family>.json
   # add --write --allow-links once it passes
   ```

   Off-peak, not within an hour of the deploy. Then run IndexNow on the touched URLs.

## How they were written

- **Facts.** They were written against facts files built from the catalogue payloads. The checker was a local
  port of `load-product-faqs.ts`, run with the same rules plus the not-yet-live Oteco pages as valid link
  targets. Every payload passed.
- **Real check after loading.** The repo checker runs against the live facts dump once the products exist.
  Every number must still trace to the database or to the payload's `extraFacts`.
- **Interchange.** Only the interchanges Oteco itself publishes are named:
  - Model 72 ↔ Cameron Type S Flex-Seal;
  - PRV ↔ Cameron-style shear relief valves;
  - RRV bonnet ↔ Cameron Type A/B;
  - Model 6/7 gauges ↔ Cameron F/D, Totco, Geosource, Wadeco, Gauges International;
  - connector ↔ Grayloc;
  - hammer-union ends ↔ FMC Weco (EB-004).

  BOP rubber, strippers, dampener parts, washpipe and valves/seats get fit statements only.
- **Certifications.**
  - No API monogram or licence claims and no NACE claims: Oteco's literature makes none for these products.
  - DNV and ABS appear only where Oteco marks them.
  - ISO 9001 comes from Oteco's certificate (as an `extraFact`).
- **Inferred data.** Washpipe makes inferred from Oteco code groups, decoded piston hubs, and valve/seat numbers
  from the 1997 sheet are all worded as confirmed against the part number before shipping.
