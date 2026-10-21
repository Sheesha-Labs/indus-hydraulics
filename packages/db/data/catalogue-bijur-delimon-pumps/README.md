# Bijur Delimon pumps, wave 1 — `catalogue-bijur-delimon-pumps`

**52 listings, 599 part numbers**, branded Bijur Delimon (`brandSlug: bijur-delimon`), on five new shelves under the
existing **Lubricants** root (`industrial-lubricant-suppliers-uae`). Loaded 2026-10-21 as **drafts** with the shelves
unpublished; 112 images and 69 documents attached, 0 problems. Publish in the sitting after this PR deploys (see Status).

| Shelf | Listings | Part numbers |
|---|---|---|
| `electric-lubrication-pumps` | 28 | 387 |
| `pneumatic-lubrication-pumps` | 7 | 49 |
| `lubrication-barrel-pumps` | 8 | 66 |
| `manual-lubrication-pumps` | 6 | 59 |
| `lubrication-gear-pumps` | 3 | 38 |

Configurator families add order codes, not rows — see below.

Electric: SureFire II single-phase, three-phase, PDI with ZEM injectors and connectors/cables; MultiPort; MultiPort II;
TM-1; TM-5/TMD-5; V5/V5B/V5C; V5W pump-and-motor; BL-3/XV-3; GPO; CS2000; DC Dualine stations; Dynamis Maxx; JS/JSP;
Cartridge Lube Pump; CSK; motor-driven sump gear pumps; electric barrel pumps; and the Delimon FZ-A, FZ-B, ZP3000–6000,
BM-B, BS-B, BF-E, AD-M and WS-E. Pneumatic / hydraulic: AirMatic, SureMatic, SKA881, TS30/TS33, TB-D, PulseFire, 60:1
grease guns. Barrel: PM2, PM3, PM4, PM26, PM35, PM45, PM60, BF-G. Manual: DA, one-shot SLR, PDI/progressive, TB-D
manual, fill and transfer pumps, grease guns. Gear / mechanical: rotary-drive gear pumps, gear pump elements, mechanical
lubricators.

## Part numbers and configurators

Listing SKUs are `IH-BD-<family>` (prefix checked free 2026-10-21). Rows are `IH-BD-<Bijur Delimon part number>`; the
`item` column carries Bijur Delimon's own number and description, e.g. `SFX23871 — SUREFIRE II 12L SLR LS PG PS CNTL
115VAC`. Values are as Bijur Delimon publishes them and are never converted (reservoirs in L, lb, gal or pints;
pressure in psi with bar).

Bijur Delimon sells several ranges only by order code (the site's "Configurator" products — Delimon FZ, ZP, BM-B, BS-B,
BF-E, BF-G, AD-M, WS-E, TB-D and the SureFire II, MultiPort II, CLP, EBP, GPO, AirMatic and TS30 option sets: 113,823
valid codes across the wave). Those are not rows. Each page carries an **Order code** section built from the
configurator's option lists — position, option, code, meaning — plus examples of valid codes.

## Size-table columns

New text keys in `packages/domain/src/variant-columns.ts`, added in the same change. **They render only after that code
deploys**; the values are also in the copy and specs.

`systemType` (SLR / PDI / progressive / Dualine), `lubricant` (with viscosity or NLGI range), `reservoir`,
`pressureRatio` and `container` (barrel pumps), `voltage`, `output`, `maxPressure`, `outletThread`, `monitoring`.
`systemType`, `lubricant`, `reservoir`, `pressureRatio` and `container` mark a table as `equipment`.

Bijur Delimon tags barrel pumps, fill pumps and grease guns with the system they can supply ("PROG"); on an oil-transfer
pump that reads as a claim about the pump, so `systemType` is left off those listings.

## Status and prerequisites

1. **Authorised distributor, image use permitted** — confirmed by Ayush 2026-10-21. Copy says "authorised Bijur Delimon
   distributor for the Middle East, supplied direct from the manufacturer"; no factory is named (Ayush's call).
2. **Brand row `bijur-delimon` created 2026-10-21**, unpublished, `isAuthorizedDistributor: true`. Publish it in the
   same sitting as `--publish`. Logo still to add.
3. **Spec template** `lubrication-pump-spec` (22 fields) is created by the payload.
4. **Documents** (`data/bijur-delimon-documents-pumps`): 69 attachments, 65 PDFs in `product-documents/bijur-delimon/`
   — one datasheet (or brochure / flyer) per listing, as the one-datasheet-per-product index requires, plus up to two
   operator manuals or service cards. Part-linked documents are used only when they name the series; Bijur Delimon's
   part pages carry a few stray links.
5. **Content scores** 21–82, average 66. Five small listings score below 30 (cables, guns, gear elements, mechanical
   lubricators); all have size rows, so they pass the indexability gate.
6. **To go live, after deploy:** re-run with `--publish`, publish the brand and the five shelves, rename the Lubricants
   root's display name to "Lubricants & Lubrication" (decided 2026-10-21), add the shelves to the megamenu, purge cache
   tags, IndexNow ≥1 h after the deploy.

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-bijur-delimon-pumps --image-dir=<export>/indus-jpeg-pumps --publish
```

## Images

112 JPEGs from Bijur Delimon's product images (flattened on white, trimmed, very tall cut-outs padded towards 3:4,
≤1600 px, <380 KB), generator `_scripts/indus/build_pumps.py` in the export, images in `indus-jpeg-pumps/`. Up to three
per listing, one file per distinct photo; alt text is built from the part's published data (model, part number,
reservoir, system, monitoring, voltage). Configurator families show the configurator's photo of the range. Series-page
banners and blog graphics are excluded. TS30's listed rows are indicator assemblies and burst-disc kits, so the station
photo leads that page.

## Not in this wave (wave 1b and later)

The 72 service-parts series (924 part numbers) and pump kits; the obsolete ALM AutoLub-M and 39900 enclosure (spares
only); barrel-pump industrial parts. Divider valves, injectors, meter units, controllers and monitoring, gear spray,
air-oil and accessories follow as their own waves.
