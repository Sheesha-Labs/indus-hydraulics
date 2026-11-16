/**
 * Inline SVG diagrams for the below-the-hook wave. Drawn by hand as generic force sketches; no maker
 * drawing is traced. The sanitiser allows no `marker`-end attribute on lines, so arrowheads are
 * small polygons drawn by `arrow()`.
 */

const INK = '#1f2937'
const FORCE = '#b45309'
const MUTED = '#6b7280'

/** A straight arrow from (x1, y1) to (x2, y2), head at the far end. */
function arrow(x1: number, y1: number, x2: number, y2: number, colour = FORCE, width = 2.5): string {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = 9
  const p1 = [x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4)]
  const p2 = [x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)]
  const f = (n: number) => n.toFixed(1)
  return (
    `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2 - 5 * Math.cos(a))}" y2="${f(y2 - 5 * Math.sin(a))}" stroke="${colour}" stroke-width="${width}"/>` +
    `<polygon points="${f(x2)},${f(y2)} ${f(p1[0]!)},${f(p1[1]!)} ${f(p2[0]!)},${f(p2[1]!)}" fill="${colour}"/>`
  )
}

/** Centre-of-gravity symbol: a quartered circle. */
function cog(x: number, y: number, r = 8): string {
  return (
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="1.5"/>` +
    `<path d="M${x} ${y} L${x + r} ${y} A${r} ${r} 0 0 1 ${x} ${y + r} Z" fill="${INK}"/>` +
    `<path d="M${x} ${y} L${x - r} ${y} A${r} ${r} 0 0 1 ${x} ${y - r} Z" fill="${INK}"/>`
  )
}

const hook = (x: number, y: number): string =>
  `<path d="M${x} ${y - 14} v10 q0 12 -9 12 q-7 0 -7 -7" fill="none" stroke="${INK}" stroke-width="3"/>`

const FONT = 'font-family="system-ui, -apple-system, sans-serif"'

/** Lifting beam (bending, one top point) beside spreader beam (compression, two top slings). */
export const SPREADER_VS_LIFTING = `<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" ${FONT}>
<title>Force path through a lifting beam and through a spreader beam</title>
${hook(190, 40)}
<line x1="190" y1="44" x2="190" y2="104" stroke="${INK}" stroke-width="2"/>
<rect x="70" y="104" width="240" height="18" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<g stroke="${INK}" stroke-width="2">
<line x1="90" y1="122" x2="90" y2="200"/><line x1="150" y1="122" x2="150" y2="200"/>
<line x1="230" y1="122" x2="230" y2="200"/><line x1="290" y1="122" x2="290" y2="200"/>
</g>
<rect x="70" y="200" width="240" height="44" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
${arrow(92, 96, 172, 96)}${arrow(288, 96, 208, 96)}
${arrow(190, 100, 190, 60, FORCE, 2)}
<text x="190" y="270" text-anchor="middle" font-size="15" font-weight="600" fill="${INK}">Lifting beam</text>
<text x="190" y="290" text-anchor="middle" font-size="12" fill="${INK}">The load travels along the beam to one top point:</text>
<text x="190" y="306" text-anchor="middle" font-size="12" fill="${INK}">the beam works in bending.</text>
${hook(570, 40)}
<line x1="570" y1="44" x2="450" y2="104" stroke="${INK}" stroke-width="2"/>
<line x1="570" y1="44" x2="690" y2="104" stroke="${INK}" stroke-width="2"/>
<rect x="440" y="104" width="260" height="14" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<g stroke="${INK}" stroke-width="2"><line x1="450" y1="118" x2="450" y2="200"/><line x1="690" y1="118" x2="690" y2="200"/></g>
<rect x="430" y="200" width="280" height="44" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
${arrow(452, 136, 512, 136)}${arrow(688, 136, 628, 136)}
${arrow(476, 112, 528, 84, FORCE, 2)}${arrow(664, 112, 612, 84, FORCE, 2)}
<text x="570" y="152" text-anchor="middle" font-size="12" fill="${FORCE}">compression</text>
<text x="570" y="270" text-anchor="middle" font-size="15" font-weight="600" fill="${INK}">Spreader beam</text>
<text x="570" y="290" text-anchor="middle" font-size="12" fill="${INK}">The load goes straight up the top slings;</text>
<text x="570" y="306" text-anchor="middle" font-size="12" fill="${INK}">the beam only holds them apart, in compression.</text>
</svg>`

/**
 * One leg of a two-leg lift at 40° from vertical on a 12 t load, and its force triangle drawn to scale
 * (25 px per tonne): vertical 6 t, horizontal 6 tan 40° = 5.03 t, sling 6 / cos 40° = 7.83 t.
 */
export const FORCE_TRIANGLE = `<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" ${FONT}>
<title>Force in an angled sling leg and its force triangle</title>
${hook(180, 85)}
<line x1="180" y1="89" x2="90" y2="196" stroke="${INK}" stroke-width="2"/>
<line x1="180" y1="89" x2="270" y2="196" stroke="${INK}" stroke-width="2"/>
<rect x="60" y="200" width="240" height="56" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<circle cx="90" cy="198" r="4" fill="${INK}"/><circle cx="270" cy="198" r="4" fill="${INK}"/>
<path d="M90 160 A38 38 0 0 1 112 167" fill="none" stroke="${MUTED}" stroke-width="1.5"/>
<line x1="90" y1="196" x2="90" y2="140" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="100" y="150" font-size="12" fill="${MUTED}">40°</text>
${arrow(110, 226, 160, 226)}${arrow(250, 226, 200, 226)}
<text x="180" y="248" text-anchor="middle" font-size="12" fill="${FORCE}">5.0 t compression</text>
<text x="180" y="290" text-anchor="middle" font-size="14" font-weight="600" fill="${INK}">12 t load, two legs at 40° from vertical</text>
<text x="180" y="308" text-anchor="middle" font-size="12" fill="${INK}">Each lifting point: 6 t up, 5.0 t inward</text>
<line x1="480" y1="230" x2="480" y2="80" stroke="${INK}" stroke-width="3"/>
<line x1="480" y1="230" x2="606" y2="230" stroke="${FORCE}" stroke-width="3"/>
<line x1="606" y1="230" x2="480" y2="80" stroke="${INK}" stroke-width="3"/>
<rect x="480" y="218" width="12" height="12" fill="none" stroke="${MUTED}" stroke-width="1.2"/>
<path d="M480 112 A32 32 0 0 0 500 104" fill="none" stroke="${MUTED}" stroke-width="1.5"/>
<text x="490" y="128" font-size="12" fill="${MUTED}">40°</text>
<text x="470" y="160" text-anchor="end" font-size="13" fill="${INK}">Vertical</text>
<text x="470" y="176" text-anchor="end" font-size="13" font-weight="600" fill="${INK}">6.0 t</text>
<text x="543" y="252" text-anchor="middle" font-size="13" fill="${FORCE}">Horizontal 5.0 t</text>
<text x="556" y="146" font-size="13" fill="${INK}">Sling</text>
<text x="556" y="162" font-size="13" font-weight="600" fill="${INK}">7.8 t</text>
<text x="545" y="290" text-anchor="middle" font-size="14" font-weight="600" fill="${INK}">Force triangle, drawn to scale</text>
<text x="545" y="308" text-anchor="middle" font-size="12" fill="${INK}">The sling side is always the longest</text>
</svg>`

/**
 * Left: two-leg sling on a 10 t load with the centre of gravity 1 m from lug A on 4 m centres (50 px/m,
 * hook 2.2 m above the lugs). Right: a single central top point with the centre of gravity offset; the
 * load tilts until the centre of gravity is under the hook (rotation tan⁻¹ 0.6 ≈ 31°).
 */
export const COG_DIAGRAM = `<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" ${FONT}>
<title>How an offset centre of gravity shares the load between two legs, and tilts a load hung from one point</title>
${hook(130, 50)}
<line x1="130" y1="54" x2="80" y2="166" stroke="${INK}" stroke-width="2"/>
<line x1="130" y1="54" x2="280" y2="166" stroke="${INK}" stroke-width="2"/>
<rect x="60" y="170" width="240" height="70" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<rect x="60" y="170" width="120" height="70" fill="#d1d5db"/>
<rect x="60" y="170" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
<circle cx="80" cy="168" r="4" fill="${INK}"/><circle cx="280" cy="168" r="4" fill="${INK}"/>
${cog(130, 205)}
<line x1="130" y1="68" x2="130" y2="196" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="72" y="160" font-size="12" font-weight="600" fill="${INK}">A</text>
<text x="284" y="160" font-size="12" font-weight="600" fill="${INK}">B</text>
<path d="M80 254 v6 h50 v-6 M130 260 h150 v-6" fill="none" stroke="${MUTED}" stroke-width="1.2"/>
<text x="105" y="274" text-anchor="middle" font-size="12" fill="${MUTED}">1 m</text>
<text x="205" y="274" text-anchor="middle" font-size="12" fill="${MUTED}">3 m</text>
<text x="76" y="110" text-anchor="end" font-size="12" fill="${FORCE}">7.5 t up</text>
<text x="76" y="126" text-anchor="end" font-size="12" fill="${FORCE}">8.2 t in leg</text>
<text x="226" y="100" font-size="12" fill="${FORCE}">2.5 t up</text>
<text x="226" y="116" font-size="12" fill="${FORCE}">4.2 t in leg</text>
<text x="180" y="304" text-anchor="middle" font-size="14" font-weight="600" fill="${INK}">10 t load, centre of gravity off-centre</text>
<text x="180" y="322" text-anchor="middle" font-size="12" fill="${INK}">Hook over the centre of gravity; the near leg carries most</text>
${hook(470, 50)}
<line x1="470" y1="54" x2="470" y2="120" stroke="${INK}" stroke-width="2"/>
<g transform="rotate(31 470 120)">
<rect x="390" y="120" width="160" height="80" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<rect x="470" y="120" width="80" height="80" fill="#d1d5db"/>
<rect x="390" y="120" width="160" height="80" fill="none" stroke="${INK}" stroke-width="2"/>
${cog(500, 170, 7)}
</g>
<circle cx="470" cy="120" r="4" fill="${INK}"/>
<line x1="470" y1="120" x2="470" y2="240" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="4 3"/>
${hook(650, 50)}
<line x1="650" y1="54" x2="650" y2="120" stroke="${INK}" stroke-width="2"/>
<g transform="rotate(56 650 120)">
<rect x="570" y="120" width="160" height="80" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<rect x="650" y="120" width="80" height="40" fill="#d1d5db"/>
<rect x="570" y="120" width="160" height="80" fill="none" stroke="${INK}" stroke-width="2"/>
${cog(680, 140, 7)}
</g>
<circle cx="650" cy="120" r="4" fill="${INK}"/>
<line x1="650" y1="120" x2="650" y2="240" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="470" y="280" text-anchor="middle" font-size="12" fill="${INK}">Low: tilts about 31°</text>
<text x="650" y="280" text-anchor="middle" font-size="12" fill="${INK}">Higher: about 56°</text>
<text x="560" y="304" text-anchor="middle" font-size="14" font-weight="600" fill="${INK}">One central top point, offset centre of gravity</text>
<text x="560" y="322" text-anchor="middle" font-size="12" fill="${INK}">The load turns until its centre of gravity hangs under the hook</text>
</svg>`

/** Three spreader rigs: drops vertical (correct), drops in line with the top slings, drops splayed wider. */
function rig(cx: number, beamHalf: number, lugHalf: number, label: string, l1: string, l2: string, tone: string): string {
  const top = 40
  const beamY = 110
  const loadY = 200
  return `${hook(cx, top)}
<line x1="${cx}" y1="${top + 4}" x2="${cx - beamHalf}" y2="${beamY}" stroke="${INK}" stroke-width="2"/>
<line x1="${cx}" y1="${top + 4}" x2="${cx + beamHalf}" y2="${beamY}" stroke="${INK}" stroke-width="2"/>
<rect x="${cx - beamHalf - 6}" y="${beamY}" width="${2 * beamHalf + 12}" height="12" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<line x1="${cx - beamHalf}" y1="${beamY + 12}" x2="${cx - lugHalf}" y2="${loadY}" stroke="${INK}" stroke-width="2"/>
<line x1="${cx + beamHalf}" y1="${beamY + 12}" x2="${cx + lugHalf}" y2="${loadY}" stroke="${INK}" stroke-width="2"/>
<rect x="${cx - Math.max(lugHalf, beamHalf) - 14}" y="${loadY}" width="${2 * Math.max(lugHalf, beamHalf) + 28}" height="40" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<text x="${cx}" y="268" text-anchor="middle" font-size="14" font-weight="600" fill="${tone}">${label}</text>
<text x="${cx}" y="288" text-anchor="middle" font-size="12" fill="${INK}">${l1}</text>
<text x="${cx}" y="304" text-anchor="middle" font-size="12" fill="${INK}">${l2}</text>`
}

export const MISUSE_DIAGRAM = `<svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg" ${FONT}>
<title>Bottom sling angles under a spreader beam: vertical, in line with the top slings, and splayed wider</title>
${rig(130, 80, 80, 'Correct', 'Drops vertical: the beam', 'takes the compression', '#15803d')}
${arrow(64, 142, 104, 142)}${arrow(196, 142, 156, 142)}
${rig(400, 50, 109, 'Beam doing nothing', 'Drops in line with the top slings:', 'the load takes all the compression', FORCE)}
${arrow(286, 222, 330, 222)}${arrow(514, 222, 470, 222)}
${rig(670, 45, 112, 'Beam in tension', 'Drops splayed wider than the top', 'slings: the beam is pulled apart', '#b91c1c')}
${arrow(664, 140, 632, 140, '#b91c1c')}${arrow(676, 140, 708, 140, '#b91c1c')}
</svg>`

/** End-cap (pin-and-socket) beam above a bolted-flange modular beam. Schematic, not to scale. */
export const END_CAP_VS_FLANGE = `<svg viewBox="0 0 760 300" xmlns="http://www.w3.org/2000/svg" ${FONT}>
<title>End-cap spreader beam and bolted-flange modular spreader beam compared</title>
<text x="30" y="30" font-size="14" font-weight="600" fill="${INK}">End-cap (pin-and-socket) beam</text>
<rect x="150" y="62" width="460" height="26" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<text x="380" y="80" text-anchor="middle" font-size="12" fill="${MUTED}">pipe, cut to length</text>
<path d="M90 56 h80 v38 h-80 z" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<path d="M590 56 h80 v38 h-80 z" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<circle cx="160" cy="75" r="4" fill="${FORCE}"/><circle cx="600" cy="75" r="4" fill="${FORCE}"/>
<circle cx="100" cy="46" r="8" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="660" cy="46" r="8" fill="none" stroke="${INK}" stroke-width="2"/>
<circle cx="100" cy="104" r="8" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="660" cy="104" r="8" fill="none" stroke="${INK}" stroke-width="2"/>
<text x="130" y="130" text-anchor="middle" font-size="12" fill="${INK}">end cap</text>
<text x="160" y="146" text-anchor="middle" font-size="12" fill="${FORCE}">locking pin</text>
<text x="630" y="130" text-anchor="middle" font-size="12" fill="${INK}">end cap</text>
<text x="30" y="186" font-size="14" font-weight="600" fill="${INK}">Bolted-flange modular beam</text>
<path d="M60 206 h90 v38 h-90 z" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<circle cx="70" cy="196" r="8" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="70" cy="254" r="8" fill="none" stroke="${INK}" stroke-width="2"/>
<rect x="150" y="212" width="150" height="26" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<rect x="300" y="212" width="160" height="26" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<rect x="460" y="212" width="150" height="26" fill="#f3f4f6" stroke="${INK}" stroke-width="2"/>
<path d="M610 206 h90 v38 h-90 z" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
<circle cx="690" cy="196" r="8" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="690" cy="254" r="8" fill="none" stroke="${INK}" stroke-width="2"/>
<g stroke="${FORCE}" stroke-width="5"><line x1="150" y1="206" x2="150" y2="244"/><line x1="300" y1="206" x2="300" y2="244"/><line x1="460" y1="206" x2="460" y2="244"/><line x1="610" y1="206" x2="610" y2="244"/></g>
<text x="105" y="276" text-anchor="middle" font-size="12" fill="${INK}">end unit</text>
<text x="380" y="276" text-anchor="middle" font-size="12" fill="${INK}">struts in fixed lengths</text>
<text x="380" y="292" text-anchor="middle" font-size="12" fill="${FORCE}">bolted flange joints</text>
<text x="655" y="276" text-anchor="middle" font-size="12" fill="${INK}">end unit</text>
</svg>`
