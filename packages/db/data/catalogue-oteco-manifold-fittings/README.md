# Oteco Wave 2 manifold fittings — `catalogue-oteco-manifold-fittings`

**11 listings, 185 part numbers**, branded Oteco (spec template `pipe-fitting-spec`): ten long-sweep manifold fitting styles on the **new shelf** `mud-manifold-fittings` under Drilling & Workover Systems, created with page bands, and the OTECO hub-and-clamp connector as an enquiry page on `flow-iron-fittings-suppliers-uae`.

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-OTC-MF-FFC` | Oteco Long-Sweep Full Flow Crosses, 2 in, 3 in, 4 in, 5 in | `mud-manifold-fittings` | 16 | 2 |
| `IH-OTC-MF-LSFFT` | Oteco Long-Sweep Full Flow Tees, 2 in, 3 in, 4 in, 5 in | `mud-manifold-fittings` | 33 | 2 |
| `IH-OTC-MF-LST` | Oteco Long-Sweep Tees, 2 in, 3 in, 4 in, 5 in | `mud-manifold-fittings` | 26 | 2 |
| `IH-OTC-MF-LSY` | Oteco Long-Sweep Y Fittings, 2 in, 4 in | `mud-manifold-fittings` | 9 | 2 |
| `IH-OTC-MF-LSE45` | Oteco 45° Long-Sweep Ells, 2 in, 3 in, 4 in, 5 in | `mud-manifold-fittings` | 24 | 2 |
| `IH-OTC-MF-LSE90` | Oteco 90° Long-Sweep Ells, 2 in, 3 in, 4 in, 5 in, 6 in | `mud-manifold-fittings` | 31 | 2 |
| `IH-OTC-MF-LSE90-OUTLET` | Oteco 90° Long-Sweep Ells with 2" Outlet, 4 in, 5 in | `mud-manifold-fittings` | 10 | 2 |
| `IH-OTC-MF-GSNK160` | Oteco 160° Standpipe Goosenecks, 3 in, 4 in, 5 in | `mud-manifold-fittings` | 13 | 2 |
| `IH-OTC-MF-GSNKTO` | Oteco 160° Standpipe Goosenecks with Top Outlet, 3 in, 4 in, 5 in | `mud-manifold-fittings` | 18 | 2 |
| `IH-OTC-MF-GSNK180` | Oteco 180° Standpipe Goosenecks, 4 in, 5 in | `mud-manifold-fittings` | 5 | 2 |
| `IH-OTC-CONNECTOR` | OTECO Connector — Hub and Clamp Connector, 1" to 12" | `flow-iron-fittings-suppliers-uae` | 0 | 1 |

**Part numbers** are `IH-OTC-<Oteco part number>`, as in Wave 1 (`catalogue-oteco-valves`).

**Size-table columns** are `item` and `fits`, plus the valve keys `model`, `size`, `pressureClass`, `ends`
and `service` on manifold fittings. `fits`, `ends` and `service` are added by the Wave 1 code change, so
**load this payload only after Wave 1's code has deployed.**

## Notes

- **Working pressure and end connections** come from the part names and descriptions. The copy gives
  Oteco's working/test pressure by schedule.
- **62 rows with no source description** are decoded from the part name (style code, pressure, end), for
  example `5BWXX/4LPT` → "5" butt weld, Sch. XXS × 4" line pipe thread". Metric and bore-specified weld
  ends are kept as listed.
- **One row (410019) has no end code** and is left out.
- **The connector** carries the Grayloc interchange claim that Oteco publishes, with a trademark note.

## Images

Every image is an Oteco photograph or drawing cropped from the rig hardware, products and manifold fittings
brochures. Use is covered by the agency agreement.

Twelve photos were cleaned with Higgsfield GPT Image 2.6 (medium, 1k), which removed the background, stray
text and JPEG artefacts.
- Each edit was compared with its original.
- Seven edits were rejected and those photos use the original crop. In the rejected edits the model had:
  - garbled a tag;
  - added rim holes;
  - changed a moulded part number;
  - added "DIN 7444" stampings;
  - invented hardware the crop had cut off.
- `caption` records which images were edited.
- The image folder sits outside the repo; pass it with `--image-dir=`.

## Load (after Wave 1's code deploys)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-oteco-manifold-fittings --image-dir=<export>/indus-images-w2 --publish
```

The dry run on 2026-11-19 created 11 listings and 185 part numbers, with 0 problems.

**After loading:**
- Publish the `oteco` brand in the same sitting as Wave 1.
- Purge the category and nav tags, and add the new shelves to the megamenu.
- Run IndexNow at least 1 h after the deploy.

**FAQs** come in Wave 4.
