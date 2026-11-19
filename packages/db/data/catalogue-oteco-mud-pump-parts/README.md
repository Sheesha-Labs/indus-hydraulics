# Oteco Wave 3 mud pump fluid-end parts — `catalogue-oteco-mud-pump-parts`

**6 listings, 354 part numbers**, branded Oteco, on the **new shelf** `mud-pump-fluid-end-parts` under Drilling & Workover Systems, created with page bands:

- mud pump pistons in four listings: double-acting assemblies, single-acting and bonded urethane assemblies, rubbers and replacement kits, and hubs and parts;
- premium wing-guided valves, full-open seats, springs, inserts and puller heads;
- pulsation dampener diaphragms and parts.

| SKU | Listing | Rows | Images |
|---|---|---|---|
| `IH-OTC-PST-DA` | Oteco Double-Acting Mud Pump Pistons | 82 | 2 |
| `IH-OTC-PST-SA` | Oteco Single-Acting Mud Pump Pistons — Premium & Bonded Urethane | 46 | 2 |
| `IH-OTC-PST-RUBBERS` | Oteco Mud Pump Piston Rubbers & Replacement Kits | 104 | 1 |
| `IH-OTC-PST-PARTS` | Oteco Mud Pump Piston Hubs, Retainer Plates & Snap Rings | 92 | 1 |
| `IH-OTC-VALVES-SEATS` | Oteco Mud Pump Valves & Seats — Wing-Guided, Full-Open, API 6 & 7 | 15 | 3 |
| `IH-OTC-DAMPENER` | Oteco Pulsation Dampener Diaphragms & Parts — K-10, K-20 | 15 | 1 |

- **Part numbers:** `IH-OTC-<Oteco part number>`. Valve and seat descriptive numbers keep their letters, as
  in `IH-OTC-O-U7VL-1`.
- **Size-table columns:** `item` and `fits`. `fits` is added by the Wave 1 code change (#629), so **load only
  after #629 has deployed.**
- **Spec template:** `rig-equipment-spec`. It is defined identically in the Wave 2 rig-floor payload, so the
  payloads can load in either order.

## Notes

- **Pistons are decoded from their part names only.** In this family several source descriptions belong to
  other products (brush and thread-compound text on piston parts), so none is used.
  - **Liner size:** the size code is inches plus eighths. `I44` is 4-1/2", `I26` 2-3/4" (confirmed by
    `I26A10,2.75`).
  - **Series:** A, B, K or L.
  - **Rod fit:** an API 3–6 or GD1 taper on double-acting pistons; a 1" or 1-1/2"/1-5/8" straight bore on
    single-acting pistons.
- **Piston hubs (58)** are decoded from Oteco's hub code: `01` + series digit (1 A, 2 B, 3 K, 4 L) + taper or
  bore code + size. The pattern matches the assemblies but is inferred. Confirm it with Oteco.
- **Valves and seats** use the descriptive numbers and the 40-pump selection table from Oteco's fluid-end
  sheet, dated 7-97. The copy says we confirm the current part number per pump.
- **Pulsation dampener parts** come from the rig hardware brochure table. Bottom plate 123754 comes from the
  brochure only.

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
  --payload=catalogue-oteco-mud-pump-parts --image-dir=<export>/indus-images-w3 --publish
```

The dry run on 2026-11-19 created 6 listings and 354 part numbers, with 0 problems.

**After loading:** add the shelf to the megamenu, purge the `categories` and `nav-menu` tags, and run IndexNow at
least 1 h after the deploy. FAQs come in Wave 4.
