# Ferryl Wave 2 coatings — `catalogue-ferryl-coatings`

**5 listings**, branded Ferryl, on the new shelf `anticorrosive-safety-coatings` under the new Marine group `ship-maintenance-chemicals`. Creates spec template `marine-chemical-spec`.

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-FRY-400R` | Ferryl 400R Anticorrosive White Coating | `anticorrosive-safety-coatings` | 1 | 3 |
| `IH-FRY-401` | Ferryl 401 Anticorrosive Transparent Coating | `anticorrosive-safety-coatings` | 2 | 3 |
| `IH-FRY-404` | Ferryl 404 Dilution & Cleaning Liquid | `anticorrosive-safety-coatings` | 1 | 1 |
| `IH-FRY-502` | Ferryl 502 Fluorescent Orange-Red Safety Coating | `anticorrosive-safety-coatings` | 2 | 1 |
| `IH-FRY-505` | Ferryl 505 Fluorescent Yellow Safety Coating | `anticorrosive-safety-coatings` | 2 | 2 |

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
  --payload=catalogue-ferryl-coatings --image-dir=<export>/indus-images-w2 --dry-run
```
