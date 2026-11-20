# Ferryl Wave 2 cleaning, rust treatment and sealant — `catalogue-ferryl-maintenance-chemicals`

**8 listings**, branded Ferryl, on the new shelf `marine-maintenance-chemicals` under the Marine group `ship-maintenance-chemicals` (spec template `marine-chemical-spec`).

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-FRY-FERRYCID` | Ferryl Ferrycid Rust Remover | `marine-maintenance-chemicals` | 3 | 3 |
| `IH-FRY-RUSTOIL` | Ferryl Rustoil Penetrating Oil | `marine-maintenance-chemicals` | 2 | 1 |
| `IH-FRY-CF` | Ferryl Cleaning Fluid Oil & Grease Remover | `marine-maintenance-chemicals` | 1 | 1 |
| `IH-FRY-EC` | Ferryl Electroclean Electrical Equipment Cleaner | `marine-maintenance-chemicals` | 2 | 1 |
| `IH-FRY-FERMAID` | Ferryl Fermaid Alkaline Cleaning Liquid | `marine-maintenance-chemicals` | 3 | 1 |
| `IH-FRY-CABIN` | Ferryl Cabin Clean General Cleaning Liquid | `marine-maintenance-chemicals` | 2 | 1 |
| `IH-FRY-AIR` | Ferryl Air-Refreshment Bad Odour Neutraliser | `marine-maintenance-chemicals` | 3 | 1 |
| `IH-FRY-ARMACIT` | Ferryl Armacit Pipe Thread Sealant | `marine-maintenance-chemicals` | 2 | 1 |

- **Brand:** Ferryl (`brandSlug: ferryl`, published with Wave 1).
- **Part numbers:** `IH-FRY-<code>-<pack>`; multi-packs are their own rows.
- **Copy:** original text from Ferryl's product and application pages and English product information sheets. No
  environmental, toxicity, VOC, coverage, flash-point or pressure figure is claimed, and no SOLAS/IMO compliance for the
  fluorescent coatings. SDS are offered on request.
- **Images:** Ferryl's own photographs, cleaned and upscaled with GPT Image. Storage keys come from the alt text.
- **FAQs:** empty; loaded in a later wave after the catalogue (a catalogue re-run wipes FAQs).

## Load

No code change. Load `catalogue-ferryl-coatings` first — it upserts `marine-chemical-spec`.

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-ferryl-maintenance-chemicals --image-dir=<export>/indus-images-w2 --dry-run
```
