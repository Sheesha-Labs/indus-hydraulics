# Older coupling listings: product-specific copy

Applied on 2026-10-07 by `src/imports/2026-10-07-older-coupling-copy/run.ts`
to 108 listings:

- the 98 written by the Sealfast / Sunpool coupling import of May 2026: Storz,
  KC, Guillemin, composite fittings, flanges, sandblast, crowfoot, ground
  joint, ring lock, pin lug, shank couplings, hose nipple and mender;
- the 10 Sealfast Bauer listings, written the same way.

The template gave every listing in a family the same lines:

- **Ends:** "End A: Coupling face — standard", "End B: Threaded / barbed back
  per variant".
- **Seals and standards nobody stated:** "Industrial KC nipple pattern";
  "DIN 14301" and "UL listed" on every Storz part, gaskets included; a
  "gasket on the female end" on Guillemin, which is symmetrical; Bauer flanges
  "to DIN 2501 PN 10".
- **Family paragraphs** with history and market claims.
- **Short descriptions** calling every part "Sealfast / Sunpool".
- **Sealfast size ranges** that contradicted the listings' own size tables.

## How it was built

`build.py` writes `payload.json` from the same supplier data the size tables
use:

- the Sunpool product pages (`../sunpool-size-tables/website.json`);
- the Sealfast family pages and size rows
  (`../sealfast-size-tables/payload.json`);
- the Sealfast datasheets.

For each listing the payload holds:

- the ends, seal and standard the supplier supports, or nothing;
- a one-line summary;
- Sunpool's own bullets;
- for Sealfast, the size list.

For each family it holds a rewritten paragraph and service notes.

The runner rebuilds each description around the lines earlier runners
already corrected — size range, material and working pressure. It keeps those
lines and the size-table block verbatim, then rewrites:

- the short and SEO descriptions;
- the matching FAQ answers and spec rows.

## What the sources settled

- **Bauer flanges are ASA Class 150, not DIN 2501 PN 10.** Sealfast's flanged
  Bauer drawings (BTC…FLF, BTC…FLM) say "Flange ASA Class - 150". Their bolt
  circles match it, for example 4.764" on the 2".
- **Bauer seal and rating.** The same drawings show a rubber O-ring in the
  female and "working pressures up to 150 psi". The three flanged Bauer
  listings get that rating back: it was removed with the template lines on
  2026-10-07, and its spec row is recreated. The other Bauer listings stay
  "not published".
- **Ring lock** seals on a gasket. Sealfast's drawing shows female, locking
  ring, male and gasket.
- **Storz.** Sunpool fits a discharge gasket as standard and a suction gasket
  to order (code S), per its part-number list.
- **Storz FDC and safety-latch parts** conform to NFPA 1963 and the FDCs are
  UL listed, per Sunpool.
- **Storz standard.** DIN 14301 covers only Storz size D and has since been
  merged into newer standards. Sunpool says only "Conformed to DIN Standard",
  so the pages say the DIN Storz pattern, without a number.
- **Guillemin.** NF E 29-572 is the French Guillemin standard. Sunpool does
  not claim it, so it appears as family background, not as a product claim.

## Deliberately not republished

- Sunpool's "EN 14420-6 / DIN 28450" on the Guillemin female-thread page.
  Those are tank-truck coupling standards.
- Compatibility claims nobody sourced: Bauer with Perrot and Selecta; ground
  joint with Boss, Holedall and Dixon; crowfoot "interchangeable with Chicago".
  The pages say to check a half from another maker instead.
- "EN 13765" for the composite fittings. It is a hose standard, and Sunpool
  does not cite it.
- Seal lines Sunpool or Sealfast do not state: Buna-N or Viton crowfoot
  gaskets, the KC "gasket per service", flange gaskets to B16.21, sandblast
  Buna-N.

## Open

- **IH-BC-FLANGE-MALE-SET** is titled "Flanged … Male Threaded … Complete
  Set". Sealfast lists the family as "Male NPT Threaded Male x Female Bauer
  Type Coupling", so the copy describes it as a threaded set and does not
  claim a flange. The title is unchanged.
- **The Guillemin reducing adapter.** Sunpool states no material (its page
  puts the sizes in the Material row), and the listing says so.

## Re-running

```bash
python3 build.py
```

```bash
pnpm --filter @indus/db exec tsx src/imports/2026-10-07-older-coupling-copy/run.ts --dry-run
```

A re-run is a no-op. The runner refuses a description that is neither the
family template nor its own output.
