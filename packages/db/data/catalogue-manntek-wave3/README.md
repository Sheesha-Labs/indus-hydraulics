# MannTek Wave 3 — `catalogue-manntek-wave3`

**3 listings, 12 part numbers**, branded MannTek, on `dry-disconnect-couplings`. **LIVE 2026-10-18**
(loaded with `--publish`, no `--rewrite-categories`).

| SKU | Listing | Rows |
|---|---|---|
| `IH-MNT-DEC-TU` | DEC Dry Evotek Coupling (chemical, food, pharma), Tank Unit, 1"–3" | 5 |
| `IH-MNT-DEC-HU` | DEC Dry Evotek Coupling (chemical, food, pharma), Hose Unit, 1"–3" | 5 |
| `IH-MNT-RDME` | rDME Coupling for rDME / LPG blends, tank and hose unit, 2" | 2 |

The DEC sizes and bodies come from the configurator (stainless steel 1.4408 or Hastelloy at every size). The
connections, seals, the 25 bar rating and the FDA, PED 4.3 and ATEX 3G statements come from the manntek.se
page and the configurator.

The rDME seals are FFKM, as the website's lead spec states. Its technical-data row repeats the DGC's
"FKM/LT", which is a copy of the DGC table, so it is not used. Flow is 900 L/min, from that same row.

The categories entry repeats the live `dry-disconnect-couplings` row from Wave 1, so a stray
`--rewrite-categories` writes nothing new. The DEC 1" tank-unit service instruction was added to
`data/manntek-service-documents` and attached the same day.
