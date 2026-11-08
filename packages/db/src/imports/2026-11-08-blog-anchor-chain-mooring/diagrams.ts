/**
 * Inline SVG diagrams for the anchor chain wave. Drawn by hand from the arrangement described in the
 * makers' arrangement sheets and the class rules; generic shapes only, no maker drawing is traced.
 */

const studs = (xs: number[]): string =>
  xs.map((x) => `<ellipse cx="${x}" cy="90" rx="13" ry="8"/>`).join('') +
  xs.map((x) => `<line x1="${x}" y1="83" x2="${x}" y2="97" stroke-width="1.5"/>`).join('')

/** Outboard to inboard: anchor, anchor shackle, swivel forerunner, shots joined by Kenter shackles, end fastening. */
export const CABLE_ARRANGEMENT = `<svg viewBox="0 0 760 250" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
<title>Arrangement of a stud link anchor chain cable from the anchor to the chain locker</title>
<g stroke="#1f2937" fill="none" stroke-width="2.5">
<circle cx="34" cy="78" r="6"/>
<line x1="34" y1="84" x2="34" y2="150"/>
<line x1="22" y1="96" x2="46" y2="96"/>
<path d="M12 136 Q34 172 56 136"/>
<path d="M40 82 h14 q12 0 12 8 q0 8 -12 8 h-14 z"/>
<ellipse cx="88" cy="90" rx="14" ry="9"/>
<ellipse cx="120" cy="90" rx="17" ry="11"/>
<rect x="141" y="80" width="26" height="20" rx="4"/>
<ellipse cx="188" cy="90" rx="17" ry="11"/>
<ellipse cx="220" cy="90" rx="14" ry="9"/>
<rect x="240" y="82" width="22" height="16" rx="8" stroke="#b45309"/>
${studs([282, 306, 330, 354, 378, 402, 426])}
<rect x="446" y="82" width="22" height="16" rx="8" stroke="#b45309"/>
${studs([488, 512, 536, 560, 584])}
<rect x="604" y="82" width="22" height="16" rx="8" stroke="#b45309"/>
<ellipse cx="646" cy="90" rx="13" ry="8"/>
<path d="M662 82 h14 q12 0 12 8 q0 8 -12 8 h-14 z"/>
<rect x="696" y="66" width="50" height="48" stroke-dasharray="5 4" stroke-width="1.5"/>
</g>
<g stroke="#6b7280" fill="none" stroke-width="1.2">
<path d="M74 110 v6 h160 v-6"/>
<path d="M269 110 v6 h170 v-6"/>
<path d="M475 110 v6 h122 v-6"/>
</g>
<g fill="#1f2937" font-size="12" text-anchor="middle">
<text x="58" y="60">Anchor shackle</text>
<text x="675" y="60">End shackle</text>
<text x="34" y="176">Anchor</text>
<text x="154" y="134" font-weight="600">Swivel forerunner</text>
<text x="166" y="150" font-size="11">end · enlarged · swivel · enlarged · end</text>
<text x="354" y="134" font-weight="600">Shot 1 — 27.5 m</text>
<text x="354" y="150" font-size="11">common links</text>
<text x="536" y="134" font-weight="600">Shot 2, 3 …</text>
<text x="721" y="134">Chain locker</text>
</g>
<g fill="#b45309" font-size="12" text-anchor="middle">
<text x="251" y="72">Kenter</text>
<text x="457" y="72">Kenter</text>
<text x="615" y="72">Kenter</text>
</g>
<g stroke="#4b5563" stroke-width="1.2"><line x1="90" y1="192" x2="650" y2="192"/><path d="M650 188 l8 4 -8 4"/></g>
<g fill="#4b5563" font-size="12">
<text x="20" y="196">Outboard</text>
<text x="666" y="196">Inboard</text>
<text x="20" y="224">Shots of 27.5 m (15 fathoms) are joined by Kenter shackles, which are the size of a common link</text>
<text x="20" y="241">and run over the windlass. The inboard end is shackled to an end fastening in the chain locker.</text>
</g>
</svg>`
