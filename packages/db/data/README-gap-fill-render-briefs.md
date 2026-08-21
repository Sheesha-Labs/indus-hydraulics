# Gap-fill render briefs — 14 products

Fourteen products went live from the Al Feel gap-fill audit (PRs #265 and this
one) with **no photograph**. They are quotable but visually blank. This file is
the brief for producing their renders.

Every description below is derived from the product's **own spec row in our
database** — thread form, sealing form, configuration, gender, series, size
range, material, finish. Nothing here is traced from a competitor's photograph,
and no source image should be fed to the model. A part rendered from its own
dimensional standard is our asset; a regenerated copy of someone else's photo is
theirs with the watermark taken off, and it stays theirs.

## House style

Match the existing catalogue renders (the 2026 hose and coupling sprints):

- Single part, three-quarter view, slight downward camera angle
- Plain near-white studio ground, soft top-left key light, gentle contact shadow
- No scale props, no hands, no packaging, no text or logos burned into the frame
- 1536 × 1024 PNG
- Zinc-plated carbon steel unless the brief says otherwise: cool silver-grey with
  a faint iridescent Cr3+ sheen, machined hex flats reading slightly brighter
  than the turned body

## Attaching the results

Name each file after the SKU (`IH-DF-FEM-24-HS.png`), drop them all in one
folder, and run the attach step — same mechanism as
`src/scripts/industrial-hose-render-sprint.ts` phase 3. The traps that script
documents still apply: `Media -> ProductImage` is RESTRICT rather than cascade,
and `Media.storagePath` is not unique.

---

## DIN hose fittings — heavy series (7)

All seven are DIN 2353 / ISO 8434-1 heavy series (S), DN6–DN38, zinc-plated
carbon steel. The distinguishing detail across the set is the **cone seat** and
the **elbow angle**.

| SKU | Brief |
|---|---|
| `IH-DF-MAL-24-HS` | Straight hose fitting. One end is a hose nipple: a stepped, barbed shank for crimping into hose. The other is a **male** 24° cone spigot with a metric parallel thread and a hex collar between the two. Heavy-series proportions — noticeably thicker wall than a light-series equivalent. |
| `IH-DF-FEM-24-HS` | Straight hose fitting. Hose nipple at one end; at the other a **female swivel nut** (hex, free-turning) over an internal 24° cone seat. Seat is bare machined metal — **no O-ring groove, no elastomer visible**. |
| `IH-DF-FEM-24-HS-45` | As `IH-DF-FEM-24-HS` but the body bends **45°** between the hose nipple and the swivel nut. |
| `IH-DF-FEM-24-HS-90` | As `IH-DF-FEM-24-HS` but the body bends **90°**. Standard drop height, not long-drop. |
| `IH-DF-FEM-24-OR-HS` | Straight. Same female swivel nut, but the internal 24° cone carries a **visible black NBR O-ring seated in a machined groove**. This is the only visual difference from `IH-DF-FEM-24-HS` — make the O-ring clearly readable. |
| `IH-DF-FEM-24-OR-HS-45` | As `IH-DF-FEM-24-OR-HS`, bent **45°**. O-ring visible in the seat. |
| `IH-DF-FEM-24-OR-HS-90` | As `IH-DF-FEM-24-OR-HS`, bent **90°**. O-ring visible in the seat. |

The plain and O-ring pairs must be **distinguishable at thumbnail size** — that
is the whole reason both exist in the catalogue. If the O-ring does not read at
400px, push its contrast.

## Crimp ferrule (1)

| SKU | Brief |
|---|---|
| `IH-CF-NS-AC` | Automotive A/C crimp ferrule — a short open cylindrical sleeve, **aluminium not steel**: warmer, softer, matte grey with a mill finish, no zinc iridescence. Outer wall carries shallow circumferential beadlock ridges. Uncrimped (round, not hexed). Show it standing on end, slightly turned so the bore is visible. |

## Pressure washer / waterjet (2)

| SKU | Brief |
|---|---|
| `IH-PW-GUN-INSERT` | Gun-end insert for a pressure washer hose. A slim steel stem with a **bayonet head** — a turned nose with two opposed lugs — a black O-ring behind the head, and a barbed hose shank at the tail. Compact, roughly finger-length. Generic industrial part: **no brand name, no colour scheme, nothing resembling any manufacturer's trade dress.** |
| `IH-PW-WJ-FEM` | Female swivel hose fitting, M22 × 1.5. Chunky hex swivel nut at one end over an internal cone seat, barbed hose shank at the other. Plain steel. Again generic — no branding. |

## NPSM swivel (1)

| SKU | Brief |
|---|---|
| `IH-PT-NPSM-SWV` | Straight hose fitting. Hose nipple one end; at the other a **male stem carrying a free-turning swivel nut** with a straight (non-tapered) NPSM thread and a 60° internal cone seat. The swivel nut is the feature — render it so the nut clearly reads as a separate, rotating component rather than machined into the body. |

## BSP bulkhead (1)

| SKU | Brief |
|---|---|
| `IH-BSP-MAL-60-BH` | Straight bulkhead hose fitting. Hose nipple one end; the other end an **extended male BSP parallel thread long enough to pass through a panel**, with a 60° cone nose. A **separate hex bulkhead locknut** is threaded partway down that shank — show it as a distinct component with a visible gap of bare thread on either side, so the bulkhead function is obvious. |

## Wing nut quick couplings (2)

| SKU | Brief |
|---|---|
| `IH-QC-WINGNUT` | Screw-together hydraulic quick coupling, **shown coupled**: two steel halves joined by a knurled **wing nut** with two flat wings for hand tightening. Zinc-plated. Female half has a BSP port at its tail; male half a matching port at the other end. Wings should be the clear focal point. |
| `IH-QC-WINGNUT-TRL` | Trailer pattern of the same coupling: **longer body and noticeably larger wings**, sized for a gloved hand. Render it beside nothing — the size difference should read from proportion against its own body, not from a prop. Same finish. |

---

## What not to do

Do not source, download, or feed the model any product photograph from a
competitor's website, and do not use an image model to reproduce a watermarked
image with the watermark removed. Both the copy and the derivative infringe, and
removing the mark is a separate problem on top of that.

Where a genuine supplier photograph is needed — an Eaton, Sunpool or Sealfast
part we distribute — take it from that manufacturer's own materials, which is
what `import-industrial-couplings.ts` and the Sealfast import already do. That is
supplier imagery used with a trading relationship behind it, and it is a
different thing from copying a competitor.
