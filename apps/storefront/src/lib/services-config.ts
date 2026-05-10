/**
 * Static / hardcoded values for /services that do not (yet) live in the DB.
 *
 * - HERO_STATS: 3 KPIs in the hero strip — set by the business owner; bump
 *   here when real numbers change. Will move to StoreSettings once admin
 *   editability is in scope.
 * - APPROACH_STEPS: 4 named phases of every service engagement. Same content
 *   appears on the index "How we work" section + can be referenced inside a
 *   case article via a `approach_grid` body block.
 *
 * Both are intentionally typed and exported so future admin CRUD reuses the
 * exact same shape.
 */

export type HeroStat = {
  value: string
  smallSuffix?: string
  label: string
}

export const HERO_STATS: HeroStat[] = [
  { value: '2,400+', label: 'Jobs / yr' },
  { value: '96', smallSuffix: 'h', label: 'Avg TAT' },
  { value: '100', smallSuffix: '%', label: 'On-time' },
]

export type ApproachStep = {
  number: string // "/01"
  title: string
  body: string
  preview: {
    tagLabel: string // "STEP 02 · MEASURE & QUOTE"
    title: string
    body: string
    deliverables: string[]
    placeholderLabel: string
  }
}

export const APPROACH_STEPS: ApproachStep[] = [
  {
    number: '/01',
    title: 'Intake & photo report',
    body: 'Logged, tagged, photographed within 4 hours of arrival.',
    preview: {
      tagLabel: 'STEP 01 · INTAKE & PHOTO REPORT',
      title: 'Every asset gets a 4-hour intake — photographed, tagged, logged before anyone touches it.',
      body: 'On-site or in our Jebel Ali yard, intake is the first defensible step. Walk-around photos, fluid sample, OEM nameplate, recerts audit. The intake report is on the operator’s desk inside 4 hours of the asset being on the ground — before a single bay-hour is billed.',
      deliverables: ['Walk-around photo log', 'Fluid sample', 'OEM nameplate capture', 'Recerts audit'],
      placeholderLabel: '"Intake bay — asset arriving on transporter\\n880×500"',
    },
  },
  {
    number: '/02',
    title: 'Measure & quote',
    body: 'Dimensional report against OEM tolerances. PDF before we cut metal.',
    preview: {
      tagLabel: 'STEP 02 · MEASURE & QUOTE',
      title: 'You get a 12-page PDF before we cut a single piece of metal.',
      body: 'Bore roundness, rod straightness, gland clearances, deck flatness, seat depths — captured against OEM tolerances, with a recommendation for each finding. If you’d rather replace than rebuild, we’ll tell you, and quote the replacement too.',
      deliverables: ['12-page PDF', 'Dimensional data', 'Photo evidence', 'Cost vs replace', 'Lead-time options'],
      placeholderLabel: '"Step 02 — measurement report on bench\\n880×500"',
    },
  },
  {
    number: '/03',
    title: 'Rebuild & test',
    body: 'Closed-loop tested at 1.5× MAWP. Curves on file forever.',
    preview: {
      tagLabel: 'STEP 03 · REBUILD & TEST',
      title: 'Every assembly is wet-tested at 1.5× rated pressure before it leaves the bench.',
      body: 'Rebuild against OEM tolerance, NACE-spec elastomers on sour service, traceable hardware throughout. Each unit closed-loop tested against the OEM commissioning script; curve recorded and kept on file forever.',
      deliverables: ['Closed-loop test', '1.5× MAWP hold', 'OEM curve match', 'Test record on file'],
      placeholderLabel: '"Closed-loop test rig — cylinder under proof\\n880×500"',
    },
  },
  {
    number: '/04',
    title: 'Document & dispatch',
    body: 'Return packet with serials, torque values, test results, photos.',
    preview: {
      tagLabel: 'STEP 04 · DOCUMENT & DISPATCH',
      title: 'Two paper copies of the sign-off pack ride back to the rig with the asset.',
      body: 'Serials, torque values, NACE certs, test curves, photos — the complete return packet. ADNOC / Aramco / KOC / PDO supplier-spec compliant. Signed off by an HSE rep where the operator requires it.',
      deliverables: ['Sign-off pack PDF', 'Serial register', 'Torque spec sheet', 'Test curves', 'NACE certs', 'Two paper copies'],
      placeholderLabel: '"Return packet handed to operator HSE rep\\n880×500"',
    },
  },
]
