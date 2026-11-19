# Oteco Wave 3 swivel washpipe and packing — `catalogue-oteco-swivel-washpipe`

**9 listings, 169 part numbers**, branded Oteco, on the **new shelf** `swivel-washpipe-packing` under Drilling & Workover Systems, created with page bands. There is one listing per swivel make (Skytop Brewster, Emsco, Gray, National, Ideco, Oilwell, King, Gardner-Denver) and one for other swivels.

| SKU | Listing | Rows | Images |
|---|---|---|---|
| `IH-OTC-WP-SKYTOP` | Oteco Washpipe & Packing for Skytop Brewster Swivels | 13 | 1 |
| `IH-OTC-WP-EMSCO` | Oteco Washpipe & Packing for Emsco Swivels | 33 | 1 |
| `IH-OTC-WP-GRAY` | Oteco Washpipe & Packing for Gray Swivels | 10 | 1 |
| `IH-OTC-WP-NATIONAL` | Oteco Washpipe & Packing for National Swivels | 21 | 1 |
| `IH-OTC-WP-IDECO` | Oteco Washpipe & Packing for Ideco Swivels | 17 | 1 |
| `IH-OTC-WP-OILWELL` | Oteco Washpipe & Packing for Oilwell Swivels | 14 | 1 |
| `IH-OTC-WP-KING` | Oteco Washpipe & Packing for King Swivels | 9 | 1 |
| `IH-OTC-WP-GD` | Oteco Washpipe & Packing for Gardner-Denver Swivels | 7 | 1 |
| `IH-OTC-WP-OTHER` | Oteco Swivel Washpipe & Packing — Other Swivels | 45 | 1 |

- **Part numbers:** `IH-OTC-<Oteco part number>`. Valve and seat descriptive numbers keep their letters, as
  in `IH-OTC-O-U7VL-1`.
- **Size-table columns:** `item` and `fits`. `fits` is added by the Wave 1 code change (#629), so **load only
  after #629 has deployed.**
- **Spec template:** `rig-equipment-spec`. It is defined identically in the Wave 2 rig-floor payload, so the
  payloads can load in either order.

## Notes

- **Swivel make, where the source names no model:** 53 rows name their swivel models. For **67 more**, the
  make is **inferred** from Oteco's code numbering, and the `fits` column says so.
  - The swivel group is digits 2–3 of the code: washpipe `0670·1·XX·YY`, packing `WP1·XX·YY`.
  - A group is used only when its described siblings all name one make, checked separately for washpipe and
    packing. King washpipe is group 11 but King packing is group 08.
- **Other swivels:** 45 rows sit in groups with no described sibling, so they go to the "other swivels"
  listing and are ordered by part number.
- **Confirm with Oteco** before taking the "make inferred" wording out of the rows.

## Images

The images are Oteco photographs and a drawing from the fluid-end, products and rig hardware brochures. Use is
covered by the agency agreement.

- **Cleaned:** six photos were cleaned with Higgsfield GPT Image 2.6 (medium, 1k), and each was compared
  with its original.
- **Rejected:** the washpipe edit changed the tube's proportions, so the original crop is used.
- **Folder:** the images sit outside the repo; pass them with `--image-dir=`.

## Load (after #629 deploys)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-oteco-swivel-washpipe --image-dir=<export>/indus-images-w3 --publish
```

The dry run on 2026-11-19 created 9 listings and 169 part numbers, with 0 problems.

**After loading:** add the shelf to the megamenu, purge the `categories` and `nav-menu` tags, and run IndexNow at
least 1 h after the deploy. FAQs come in Wave 4.
