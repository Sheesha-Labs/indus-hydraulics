# Bijur Delimon pump spare parts, wave 1b — `catalogue-bijur-delimon-pump-spares`

**38 listings, 977 part numbers**: Bijur Delimon's service parts and kits for the pumps of wave 1
(`catalogue-bijur-delimon-pumps`), one page per pump family, branded Bijur Delimon (`brandSlug: bijur-delimon`), on one
new shelf **`lubrication-pump-spare-parts`** under the Lubricants root (`industrial-lubricant-suppliers-uae`).
Loaded 2026-10-21 as **drafts** with the shelf unpublished. Wave 1 (PR #555) is already merged and live; publish
these after this change deploys (see Status).

Scope: every series in Bijur Delimon's Pumps tree that wave 1 does not list — the 72 "Service Parts" / "Spare Parts"
series, the obsolete AutoLub-M and the 39900 enclosure (spares only), the barrel-pump "Industrial Parts" group and the
kits in the loose "Pumps > Electric" and "Pumps > Pneumatic Pumps" groups. Ten complete pumps in those loose groups
(stub, pail and cart pumps, a TP131C lubricator, a portable hydraulic oil unit) are pumps, not spares, and are left out.

| Listing | Page | Part numbers |
|---|---|---|
| `IH-BD-SFX-SP` | SureFire II Service Parts and Kits | 66 |
| `IH-BD-MP-SP` | MultiPort Lubricator Service Parts | 70 |
| `IH-BD-MP2-SP` | MultiPort II Service Parts | 39 |
| `IH-BD-CLP-SP` | Cartridge Lube Pump (CLP) Service Parts | 31 |
| `IH-BD-GPO-SP` | GPO Lubricator Service Parts | 75 |
| `IH-BD-TM1-SP` | TM-1 Lubricator Service Parts | 38 |
| `IH-BD-TM5-SP` | TM-5 and TMD-5 Lubricator Service Parts | 28 |
| `IH-BD-DYX-SP` | Dynamis Maxx Service Parts and Kits | 32 |
| `IH-BD-JS-SP` | JS and JSP Lubricator Service Parts | 13 |
| `IH-BD-MDGP-SP` | Motor-Driven Sump Gear Pump Service Parts | 9 |
| `IH-BD-EBP-SP` | Electric Barrel Pump (EBP and EBPD) Service Parts | 16 |
| `IH-BD-CS2K-SP` | CS2000 Station and DJ2000 Pump Service Parts | 39 |
| `IH-BD-DC-SP` | Dualine Station Service Parts (DC41, DJ45 and 39900 Enclosure) | 26 |
| `IH-BD-OLD-SP` | Service Parts and Kits for Older Bijur Lubricators (V3, YP-8, SK-505, KIB) | 13 |
| `IH-BD-FZ-SP` | FZ-A and FZ-B Lubricator Spare Parts and Kits | 65 |
| `IH-BD-ZP-SP` | ZP3000 to ZP6000 Pump Service Kits | 76 |
| `IH-BD-BMB-SP` | BM-B Pump Service Kits | 18 |
| `IH-BD-BSB-SP` | BS-B Pump Service Kits | 22 |
| `IH-BD-ADM-SP` | AD-M Gear Pump Unit Service Kits | 6 |
| `IH-BD-WSE-SP` | WS-E Chain Lubrication Unit Service Kits | 6 |
| `IH-BD-ALM-SP` | AutoLub-M Pump Service Kits | 5 |
| `IH-BD-BF-SP` | BF-E and BF-G Barrel Pump Service Kits | 3 |
| `IH-BD-TBD-SP` | TB-D Piston Pump Service Kits | 7 |
| `IH-BD-AIRM-SP` | AirMatic Lubricator Service Parts | 40 |
| `IH-BD-SUREM-SP` | SureMatic Lubricator Service Parts | 34 |
| `IH-BD-SKA-SP` | SKA881 and DPG Pneumatic Dualine Pump Service Parts | 25 |
| `IH-BD-TS30-SP` | TS30 Lubrication Station Service Parts | 21 |
| `IH-BD-PULSE-SP` | PulseFire Hydraulic Oiler Service Parts | 7 |
| `IH-BD-PM2-SP` | PM2 Oil Transfer Pump Service Kits | 5 |
| `IH-BD-PM3-SP` | PM3 55:1 Grease Pump Service Parts | 18 |
| `IH-BD-PM4-SP` | PM4 Oil Pump Service Kits | 8 |
| `IH-BD-PM35-SP` | PM35 Grease Pump Service Kits | 8 |
| `IH-BD-PM45-SP` | PM45 Drum Pump Service Kits | 14 |
| `IH-BD-PM60-SP` | PM60 Drum Pump Service Kits | 4 |
| `IH-BD-BPP-SP` | Barrel Pump Parts, Kits and Accessories | 62 |
| `IH-BD-DA-SP` | DA Manual Lubricator Service Parts | 6 |
| `IH-BD-MSLR-SP` | Manual One-Shot Lubricator Service Parts | 9 |
| `IH-BD-L13-SP` | L13 Manual PDI Lubricator Service Parts | 13 |

## Rows and the `For` column

Rows are `IH-BD-<Bijur Delimon part number>` (no clash with wave 1 or the live catalogue, checked 2026-10-21). The
`item` column is `<part number> — <Bijur Delimon's description>`, in the maker's own shorthand (`KIT SF II RESERVOIR 6L
METAL`), with the long description where the short one is a copy-paste slip (the DYN valve kits) and, for a few
Delimon kits named only "KIT ADM" or "KIT LOOSE COMPONENTS", the kit's name from the service card in brackets.

Every row carries **`usedOn`** — the pump, or pump version, Bijur Delimon files the part under (`SureFire II 3-phase`,
`PM45 40:1`, `ZP5000`). It is a new text key in `packages/domain/src/variant-columns.ts`, headed **For**, added in this
change; like the wave-1 lubrication keys it **renders only after that code deploys**, and it marks the table
`equipment` (a spares table has no dimension drawing to offer).

## Links between pump and spares pages

Each spares page links its pump page(s) in a "The pump" section. Wave 1's payload is regenerated in this change so 41
pump pages gain a "Spare parts" section linking their spares page, and their spare-parts FAQ names it; nothing else in
wave 1 changes. **The wave-1 payload with those links is not loaded yet**: the pump pages are live and the spares pages
are drafts, so loading it now would put dead links on live pages. Load it right after the spares go live (step 3).

## Images, copy, documents

- **101 images**: 76 Bijur Delimon part photos (3D renders on white, contact-sheet checked, no watermarks; the
  Intel-Flow keypad photos carry a third-party brand and are not used) plus wave-1 pump photos on pages whose parts
  have none, with alt text saying they show the pump the parts fit. Alt text written per image
  (`_scripts/indus/spares_alt.py` in the export). JPEG, ≤1600 px, <380 KB. Eight small Delimon-kit and PM60 pages have
  one or two images; no page has none.
- **Copy**: what the list covers (part groups with counts and part numbers), finding the right part, what wears and what
  to keep on site, the pump page link, documents. Supply wording as wave 1: authorised Bijur Delimon distributor for the
  Middle East, direct from the manufacturer; no factory named, no prices.
- **Spec template** `lubrication-pump-spares-spec` (12 fields): product type, pump range, fits, part numbers listed,
  parts covered, service kits, pump drive, lubrication system, lubricant (the last three from the wave-1 pump pages),
  parts documentation, ordering, supply.
- **Documents** (`data/bijur-delimon-documents-pump-spares`): 65 attachments, 62 distinct PDFs — the Delimon service
  cards (ZP3000–6000, FZ-A/FZ-B, BM-B, BS-B, AD-M, WS-E, AutoLub-M, BF-E, BF-G, TB-D), Bijur operator manuals and
  service sheets, the V3 / YP-8 / KIB replacement guides, and at most one datasheet per page (partial unique index).
  Titles written per file. Most files are already in Media from wave 1 and are reused, not uploaded again.

## Status

1. **Loaded 2026-10-21 as drafts**, shelf `lubrication-pump-spare-parts` unpublished, 0 problems; documents attached
   with `attach-product-documents.ts --payload=bijur-delimon-documents-pump-spares --doc-dir=<export>/indus-docs-pump-spares`.
2. **Held for the batch merge.** This change adds the `usedOn` column, so the spares stay drafts until it deploys.
3. **To go live, after deploy**, in this order:

```bash
# spares pages and their shelf
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-bijur-delimon-pump-spares --image-dir=<export>/indus-jpeg-pump-spares --publish
# then the pump pages with their new "Spare parts" links (status unchanged, they are already live)
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-bijur-delimon-pumps --image-dir=<export>/indus-jpeg-pumps
```

   then add the shelf to the megamenu under Lubricants & Lubrication, purge cache tags, IndexNow ≥1 h after the deploy.

Generator: `_scripts/indus/build_spares.py` (+ `spares_map.py`, `spares_alt.py`, `service_card_kits.py`) in the export;
`build_pumps.py` imports `spares_map.SPARES` for the pump-page links.
