# Oteco Wave 2 rig floor and rig hardware — `catalogue-oteco-rig-floor`

**18 listings, 730 part numbers**, branded Oteco, on two **new shelves** under Drilling & Workover Systems — `rig-floor-consumables` (pipe wipers, kelly wipers, MG-500/600/800 mud and oil guards and spares, balancing and tong pull-back straps) and `rig-hardware` (wireline guides, G-20 turnbacks and hanging assemblies, impact box wrenches, roller chain connectors, jack-up shock pads). The payload creates spec template `rig-equipment-spec` (8 fields) and both shelves with page bands.

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-OTC-PW-DS` | Oteco Double Solid Pipe Wipers | `rig-floor-consumables` | 53 | 1 |
| `IH-OTC-PW-DSP` | Oteco Double Split Pipe Wipers | `rig-floor-consumables` | 63 | 1 |
| `IH-OTC-PW-DSRA` | Oteco Double Split Rap-a-Round Pipe Wipers | `rig-floor-consumables` | 97 | 1 |
| `IH-OTC-PW-S` | Oteco Single Pipe Wipers, Hard Core | `rig-floor-consumables` | 122 | 1 |
| `IH-OTC-PW-OHB` | Oteco Oval and Handle-Bar Pipe Wipers | `rig-floor-consumables` | 17 | 1 |
| `IH-OTC-KW-SQ` | Oteco Square Kelly Wipers, 8-3/8" and 10" | `rig-floor-consumables` | 14 | 1 |
| `IH-OTC-KW-HEX` | Oteco Hexagonal Kelly Wipers, 8-3/8" and 10" | `rig-floor-consumables` | 17 | 1 |
| `IH-OTC-MG-500` | Oteco MG-500 Oil Guard, 1" to 3-1/2" tubing | `rig-floor-consumables` | 20 | 2 |
| `IH-OTC-MG-600` | Oteco MG-600 Mud Guard, 2-3/8" to 5-1/2" drill pipe | `rig-floor-consumables` | 32 | 2 |
| `IH-OTC-MG-800` | Oteco MG-800 Mud Guard, 2-3/8" to 7" drill pipe | `rig-floor-consumables` | 26 | 2 |
| `IH-OTC-MG-SPARES` | Oteco Mud & Oil Guard Seals and Spare Parts | `rig-floor-consumables` | 189 | 1 |
| `IH-OTC-WL-GUIDE` | Oteco Wireline Guides & Rollers — G-10, G-102, BJ Roliguide | `rig-hardware` | 23 | 2 |
| `IH-OTC-WL-G20` | Oteco G-20 Wireline Turnback Assemblies & Parts | `rig-hardware` | 19 | 2 |
| `IH-OTC-WL-HANG` | Oteco Wireline Guide Hanging Assemblies | `rig-hardware` | 13 | 1 |
| `IH-OTC-BOX-WRENCH` | Oteco Impact Box Wrenches, 5/8" to 2-1/2" Stud | `rig-hardware` | 14 | 2 |
| `IH-OTC-CHAIN-CONN` | Oteco Roller Chain Connectors, No. 1, 2 and 3 | `rig-hardware` | 3 | 1 |
| `IH-OTC-STRAPS` | Oteco Elevator Balancing Straps & Tong Pull-Back Straps | `rig-floor-consumables` | 8 | 2 |
| `IH-OTC-SHOCK-PAD` | Oteco Shock Pads for Jack-Up Rig Jacking Systems | `rig-hardware` | 0 | 1 |

**Part numbers** are `IH-OTC-<Oteco part number>`, as in Wave 1 (`catalogue-oteco-valves`).

**Size-table columns** are `item` and `fits`, plus the valve keys `model`, `size`, `pressureClass`, `ends`
and `service` on manifold fittings. `fits`, `ends` and `service` are added by the Wave 1 code change, so
**load this payload only after Wave 1's code has deployed.**

## Notes

- **Part numbers taken from the brochure.**
  - Box wrench 425075 (3/4" stud) is not in the source part list and comes from the brochure table.
  - The 10" square NR kelly wiper had no part number in the source, so 256142 is from the brochure.
  - Chain connectors (3) and straps (8) come from the brochure tables only.
- **Nine wireline parts with no description** are described from their part names. Confirm them with
  Oteco.
- **Shock pads** are an enquiry page with no rows; they are made to order.

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
  --payload=catalogue-oteco-rig-floor --image-dir=<export>/indus-images-w2 --publish
```

The dry run on 2026-11-19 created 18 listings and 730 part numbers, with 0 problems.

**After loading:**
- Publish the `oteco` brand in the same sitting as Wave 1.
- Purge the category and nav tags, and add the new shelves to the megamenu.
- Run IndexNow at least 1 h after the deploy.

**FAQs** come in Wave 4.
