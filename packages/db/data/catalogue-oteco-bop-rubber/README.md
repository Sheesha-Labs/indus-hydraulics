# Oteco Wave 2 BOP rubber — `catalogue-oteco-bop-rubber`

**5 listings, 118 part numbers**, branded Oteco, on the existing `bop-spare-parts` shelf (spec template `bop-spares-spec`): annular packing units for Hydril GK/GKM/MSP, Shaffer spherical and Regan Type K BOPs, Hydril seal kits and U-seals, and stripper rubbers for Shaffer and Grant rotating heads.

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-OTC-BOP-HYDRIL` | Oteco Packing Units for Hydril GK, GKM & MSP Annular BOPs | `bop-spare-parts` | 24 | 1 |
| `IH-OTC-BOP-SHAFFER-REGAN` | Oteco Packing Units for Shaffer Spherical & Regan Type K Annular BOPs | `bop-spare-parts` | 6 | 2 |
| `IH-OTC-BOP-SEALS` | Oteco Seal Kits & Seals for Hydril Annular BOPs | `bop-spare-parts` | 38 | 1 |
| `IH-OTC-RSR-SHAFFER` | Oteco Stripper Rubbers for Shaffer Rotating Heads | `bop-spare-parts` | 35 | 1 |
| `IH-OTC-RSR-GRANT` | Oteco Stripper Rubbers for Grant Rotating Heads | `bop-spare-parts` | 15 | 1 |

**Part numbers** are `IH-OTC-<Oteco part number>`, as in Wave 1 (`catalogue-oteco-valves`).

**Size-table columns** are `item` and `fits`, plus the valve keys `model`, `size`, `pressureClass`, `ends`
and `service` on manifold fittings. `fits`, `ends` and `service` are added by the Wave 1 code change, so
**load this payload only after Wave 1's code has deployed.**

## Notes

- **Fits wording.** Rows say what each part fits ("for Hydril GK 13-5/8" 5,000 psi"), as Oteco publishes it.
  Pages carry a trademark note. No OEM part numbers are shown.
- **Shaffer strippers without descriptions.** 33 of these are described from the brochure table, by the
  base stripper code (SHR-469 … SHR-15700). X and B suffixes are listed as construction variants of the
  base stripper. SHR-15125 has no brochure row, so its fit is given by head type only.
- **Tubing stripper rubbers.** These have no part numbers and are an enquiry line in the copy.

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
  --payload=catalogue-oteco-bop-rubber --image-dir=<export>/indus-images-w2 --publish
```

The dry run on 2026-11-19 created 5 listings and 118 part numbers, with 0 problems.

**After loading:**
- Publish the `oteco` brand in the same sitting as Wave 1.
- Purge the category and nav tags, and add the new shelves to the megamenu.
- Run IndexNow at least 1 h after the deploy.

**FAQs** come in Wave 4.
