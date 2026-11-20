# Ferryl Wave 1 greases and oils — `catalogue-ferryl-greases`

**5 listings, 6 part numbers**, branded Ferryl, on the new shelf `wire-rope-anticorrosive-greases` under Lubricants & Lubrication (spec template `lubricant-spec`).

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-FRY-202S` | Ferryl 202 Standard Anticorrosive Wire Rope Grease | `wire-rope-anticorrosive-greases` | 2 | 2 |
| `IH-FRY-202W` | Ferryl 202 White Anticorrosive Wire Rope Grease | `wire-rope-anticorrosive-greases` | 1 | 1 |
| `IH-FRY-202A` | Ferryl 202 Aluminium Anticorrosive Grease (Grease Paint) | `wire-rope-anticorrosive-greases` | 1 | 1 |
| `IH-FRY-101` | Ferryl 101 Anticorrosive Wire Rope Oil | `wire-rope-anticorrosive-greases` | 1 | 1 |
| `IH-FRY-103` | Ferryl 103 Anticorrosive Drying Oil | `wire-rope-anticorrosive-greases` | 1 | 1 |

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
  --payload=catalogue-ferryl-greases --image-dir=<export>/indus-images-w1 --dry-run
# then without --dry-run (drafts), review, then --publish
```
