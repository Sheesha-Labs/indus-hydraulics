# Hammer unions — 29 listings, 172 sizes

Loaded 2026-08-25 from two licensed catalogues:

| Ref | Source | What it owns here |
|---|---|---|
| **M** | Marlia Ingenieros S.L., *Weco couplings — Hammer lug unions*, 20 pp | Every dimension and every weight. The supplier catalogue. |
| **S** | SPM Oil & Gas / Kemper, *Oilfield Hammer Unions*, 2 pp, © 2021 | Pressure and size cross-checks **only** — facts, not expression. No SPM wording, artwork or photograph reaches the storefront. |

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-hammer-unions.ts --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-hammer-unions.ts --publish
```

## This was a rewrite, not an addition

**Twenty-three hammer union listings were already live**, bulk-generated
without a catalogue, and their specifications were not sourced from anything.
`pre-rewrite-snapshot-2026-08-25.json` is the full state of all 23 before this
ran — 345 specs and 184 FAQs, none of them traceable to a source.

What was wrong with them:

- **`IH-FI-HU-400-NPT-4K-STD-INDUS` advertised a 12 in Figure 400 at 4,000 psi.**
  S rates that size at **500 psi** cold working pressure. An eightfold
  overstatement on a pressure-containing part, live on the site.
- Figure 602's sizes were listed as "2 in, 4 in". M tabulates 1", 1½", 2", 3", 4"
  and S marks eight sizes.
- Figure 1002's sizes were listed as "4 in" alone. M tabulates six.
- Every listing carried a temperature rating (−20 °F to 250 °F), a material
  split by pressure class (ASTM A105 below 6,000 psi, AISI 4130 above), EN 10204
  3.1/3.2 mill certificates, a 1.5× hydrostatic shell test and an 8–14 week mill
  lead time. **No source states any of them.**
- Eight SKUs carried competitor names — `-FMC`, `-ANSON`, `-SPM`.
- Two pairs were duplicates of each other.

So the importer **deletes** specs and FAQs on a rewritten listing rather than
merging. A merge would leave the invented rows beside the sourced ones.

## What is published

29 listings, 172 orderable sizes, under a new three-level category tree:

```
Flow Iron & Wellhead
└── Hammer Unions                      hammer-union-suppliers-uae
    ├── Standard Service Hammer Unions hammer-unions-standard-service   (20)
    └── Sour Gas Service Hammer Unions hammer-unions-sour-gas-service    (9)
```

All 29 attach to a new `hammer-union-spec` template (15 fields), keyed on the
figure number — the industry series a buyer arrives holding — and on the
service class, because the same figure is rated differently in sour gas.

17 listings were rewritten in place and kept their URL. **Four moved**, because
the live slug named an end type or a service class the page is no longer for;
each left a 301:

| Old | New | Why |
|---|---|---|
| `…206-series-butt-weld-butt-weld-2-000-psi-sour-service` | `figure-206-hammer-union-butt-weld-ends-2000-psi` | Neither book publishes an H2S rating for Figure 206. The sour claim was unsourced. |
| `…600-series-butt-weld-6-000-psi-standard-service` | `figure-600-hammer-union-bronze-seated-threaded-6000-psi` | M tabulates Figure 600 **threaded** only. |
| `misaligning-…-1003-series-butt-weld-10-000-psi-standard-service` | `figure-1003-misaligning-hammer-union-standard-service` | The page now carries both threaded and butt weld sizes. |
| `…1502-series-butt-weld-…` (SKU only) | same slug, SKU `…-FMC` → `…-INDUS` | Competitor name in the SKU. |

## What is NOT published

**Four figures are set to `draft`: 40, 201, 301 and AG.** Neither catalogue
covers them. Their live pages stated a working pressure, a size list, a material
and a temperature range that nothing sourced. Rewriting them would mean
inventing the same specifications again; leaving them live keeps unsourced
pressure figures in front of buyers. Drafting is the only honest third option.
**They need a supplier data sheet before they can come back.**

**Two listings were deleted** and 301'd into their surviving twin:
`IH-FI-HU-602-NPT-6K-STD-ANSON` and `IH-FI-HU-1502-NPT-15K-STD-FMC`.

**Figure 1502 got four pages, not six.** The founder's list named a Standard and
a Sour with no end type as well as threaded and butt-weld versions of each. The
two end-less pages would have copied every number from the four end-specific
ones — the thin-doorway-page pattern we criticise elsewhere. Decision taken
2026-08-25.

**Figure 200 and 206 stop at 8 in.** S lists a 10 in size; M's dimension table
does not reach it. The pages neither claim it nor deny it.

**No temperature rating, material grade, test regime, certificate or lead time
appears anywhere in this payload**, because no source states one.

## Conflicts between and within the sources

Recorded rather than resolved silently. `hu_sources.py` in the build scratchpad
carries the same list against the data.

### Safety-relevant

1. **Figure 1003 sour gas, 4 in and 5 in — M p13 prints "7.500 psi cwp (345 bar)".**
   345 bar is 5,000 psi, not 7,500; the halves of one sentence disagree by 50%.
   **Published as 5,000 psi / 345 bar.** S p2 independently rates Figure 1003
   H2S at CWP 5,000 / test 7,500, and its note for sour-prepped 5″ B/W says the
   same. The psi is the typo.

2. **Figure 1003 standard — M rates 2″/3″ at 10,000 psi and 4″/5″ at 7,500. S rates
   the whole figure at 7,500.** Same figure number, different manufacturers.
   **Published at M's per-size figures**, because M supplies ours and its table
   is size-specific. Both Figure 1003 pages carry a note that other
   manufacturers rate the figure lower and that the stamp on the union governs.
   **← FOUNDER REVIEW.** If we would rather publish the conservative 7,500 psi
   throughout, it is a one-line change in `hu_sources.py` and a re-run.

3. **Figure 400, 5″/6″/10″/12″ — S marks them `***` and reduces them to CWP 500 psi /
   test 4,000.** Published per size. This is the fix for the live eightfold
   overstatement above.

### Not safety-relevant, still decisions

4. **Figure 1004 end type.** M p14's prose introduces it as butt weld twice and
   gives the engineering reason (the 5″/6″ Figure 1002 O-ring unions must be made
   up perfectly square, so the 1004 uses lip seals). The table above it is headed
   "Threaded". **Published butt weld** — founder decision, 2026-08-25. The header
   reads as a copy of the Figure 1002 table on the facing page.

5. **Figure 200 threaded, 8″ — M p4 prints dia. body C = 142,8 mm.** The 5″ body on
   the same table is 162,0 and the 8″ body on the Figure 100 table is 242,8. A
   body cannot shrink as the line grows. **C is dropped on that row only**; the
   other three figures publish. Repairing it to 242,8 would be a guess.

6. **Figure 50 weights invert** — the 4″ union is heavier than the 5″ in both the
   threaded (12,4 vs 9,90 kg) and socket weld (11,7 vs 9,30 kg) columns.
   **Published as printed.** Weight is not a pressure figure, and M's own
   standing note — *"Where dimensions and weight are critical, please consult
   us"* — is carried on every page. **Flag to the supplier.**

7. **Figure 100 material — M says "steel, not cast iron"; S says "ductile iron".**
   M's wording is published, because M supplies ours. S is not quoted.

8. **Figure 600 sizes — M tabulates 1″, 2″, 3″, 4″; S marks 1″, 1¼″, 1½″, 2″, 4″.**
   M's four are published, with M's dimensions. Neither book covers the union of
   the two.

## Renders

`briefs.py` → `scenes.json` → `run.py`, the same `codex exec` + `$imagegen`
harness as the blog, service-case and metric-elbow sprints. One brief per SKU,
composed from that listing's own spec row. Output `<SKU>.png` into
`~/Documents/Indus Hydraulics Website/Product Images/Hammer Unions`, attached
with `attach-renders-by-sku.ts --dir …`.

**No catalogue page is fed to the model.** The reference images passed to hold
house style are three of our own live renders, in `refs/`. The catalogue
drawings were read closely for geometry — the three-lug wing nut, the ball-nose
male sub against the coned female sub, the bronze ring in the Figure 600 — and
reading a drawing is not copying a photograph.

**Every union renders bare, unpainted steel.** Real hammer unions are usually
painted and the colour carries a figure code, but that code differs between
manufacturers. Rendering a colour would assert a rating we have no source for.
The preamble says so explicitly so the model does not invent one.

The nine sour gas renders are geometrically identical to their standard
siblings. Sour trim is a metallurgy and hardness question, not a visible one,
and nothing in the frame should claim a trim it cannot show.
