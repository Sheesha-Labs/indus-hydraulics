# Ferryl Wave 1 wire rope lubricators — `catalogue-ferryl-wire-rope-lubricators`

**2 listings, 6 part numbers**, branded Ferryl, on the new shelf `wire-rope-lubricators` under Lubricants & Lubrication (spec template `lubrication-system-spec`).

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-FRY-WRL` | Ferryl Wire Rope Lubricator | `wire-rope-lubricators` | 5 | 5 |
| `IH-FRY-PUMP` | Ferryl Pump Unit for Wire Rope Lubricator | `wire-rope-lubricators` | 1 | 1 |

- The Pump Unit ratio is left out: the Ferryl website says 40:1 and the lubricator brochure 43:1.

- **Brand:** Ferryl (`brandSlug: ferryl`). The brand row must exist before loading; it is created unpublished.
- **Part numbers:** `IH-FRY-<code>-<pack>`. Ferryl publishes no article numbers yet; `mpn` is added once it does.
- **Copy:** original text from Ferryl's product and application pages and its English product information sheets. Nothing
  in the payload claims an approval, environmental status, NLGI grade, dropping point or flash point — Ferryl's technical
  data sheets are not yet in hand. Fields without a published value are left out, never filled with "per datasheet".
- **Images:** Ferryl's own photographs, cleaned and upscaled with GPT Image where the originals were too small. Storage keys
  come from the alt text.
- **FAQs:** empty; written in a later wave (a catalogue re-run wipes FAQs, so FAQs load after the catalogue).

## Load

No code change is needed: the spec template exists and the size-table columns are already rendered.

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-ferryl-wire-rope-lubricators --image-dir=<export>/indus-images-w1 --dry-run
# then without --dry-run (drafts), review, then --publish
```
