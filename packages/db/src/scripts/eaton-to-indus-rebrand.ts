/**
 * Move the Eaton Aeroquip range onto the Indus Hydraulics brand.
 *
 * 39 products carry brand `eaton-aeroquip`, in two very different states:
 *
 *   27 quick couplers — Eaton is baked into every layer: SKU (`EATON-FD89`),
 *      title, slug, seoTitle, focus keyword, body copy and FAQs. The body even
 *      documents Eaton's own part-number scheme and quotes "ex-Eaton USA".
 *   12 hydraulic hoses — already Indus-shaped (`IH-HOSE-R13`, "R13 Multi-Spiral
 *      Very-High-Pressure Hose"). Only the brand field and one sentence of body
 *      copy mention Eaton.
 *
 * Founder's decision: these sell under our own label, not Eaton's. The Eaton
 * identity is retired outright — new series codes, new SKUs, new slugs, and
 * NO REDIRECTS. The old `/p/eaton-*` URLs 404 after this runs. That is
 * deliberate: keeping them alive would keep pointing at a brand we no longer
 * claim.
 *
 * ── What is removed, and what is kept ──────────────────────────────────────
 *
 * Follows `industrial-hose-render-sprint.ts`, which did the same move for the
 * Dixon hose lines. Claims that belong to Eaton are DELETED, never
 * reattributed: their part-number scheme, their catalogue, their mill
 * certification, their US stock and lead times, their datasheets. Transferring
 * another manufacturer's certification onto our own-brand product is exactly
 * the thing that rule exists to prevent.
 *
 * What stays, because it is not Eaton's to own:
 *   - Public standards — ISO 7241, ISO 16028, ISO 5675, MIL-C-4109, SAE J1502.
 *     A coupling built to ISO 16028 is built to ISO 16028 whoever makes it.
 *   - Interchange references. Naming the parts ours mates with is ordinary
 *     trade practice, and this script ADDS Eaton to that list rather than
 *     hiding it: "interchanges with Eaton FD89" is true, useful to a buyer
 *     holding an Eaton fleet, and keeps the page findable for that query.
 *   - Every technical spec. The dimensions and ratings are unchanged.
 *
 * ── SEO, aligned with #279 ─────────────────────────────────────────────────
 *
 * #279 established that slug, title and focus keyword must move together:
 * `scoreEntity` awards `keywordInTitle` (8) and `keywordInUrl` (5) only when
 * the keyword appears in BOTH, so renaming a slug alone LOWERS the score while
 * looking like an improvement. Every triple below is asserted before anything
 * is written — title inside TITLE_RANGE, keyword present in the new title and
 * the new slug — and a failing triple aborts the run.
 *
 * One deliberate divergence from #279: no geo suffix on these. #279 put
 * `-uae` on ten CATEGORY hubs, which is where supplier-intent traffic should
 * land. Repeating it across 27 sibling products would set them competing with
 * each other and with the hub that is supposed to win that query. Product
 * keywords are functional instead ("iso 16028 flush face coupler"); the geo
 * intent stays on the hub above them.
 *
 * Dry-run by default. Pass `--apply` to write.
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/eaton-to-indus-rebrand.ts [--apply]
 */
import { TITLE_RANGE, DESCRIPTION_RANGE } from '@indus/domain'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ── The 27 couplers: frozen identity table ────────────────────────────────
// `series` replaces Eaton's designation in the spec row and the body copy.
// `interchange` is the Eaton reference, kept honestly as an interchange note.

type Coupler = {
  from: string
  sku: string
  series: string
  title: string
  slug: string
  focusKeyword: string
  /** Eaton series this replaces — surfaced as an interchange reference. */
  interchange: string
}

const COUPLERS: Coupler[] = [
  {
    from: 'EATON-5600-VALVED',
    sku: 'IH-QC-ISO7241A-V',
    series: 'QC-7241A',
    title: 'ISO 7241 Series A Valved Hydraulic Quick Coupler',
    slug: 'iso-7241-series-a-valved-hydraulic-quick-coupler',
    focusKeyword: 'iso 7241 series a valved hydraulic quick coupler',
    interchange: 'Eaton 5600',
  },
  {
    from: 'EATON-5600-NON-VALVED',
    sku: 'IH-QC-ISO7241A-NV',
    series: 'QC-7241A-NV',
    title: 'ISO 7241 Series A Non-Valved Quick Coupler',
    slug: 'iso-7241-series-a-non-valved-quick-coupler',
    focusKeyword: 'iso 7241 series a non-valved quick coupler',
    interchange: 'Eaton 5600',
  },
  {
    from: 'EATON-FD45-VALVED',
    sku: 'IH-QC-ISO7241B-V',
    series: 'QC-7241B',
    title: 'ISO 7241 Series B Valved Hydraulic Quick Coupler',
    slug: 'iso-7241-series-b-valved-hydraulic-quick-coupler',
    focusKeyword: 'iso 7241 series b valved hydraulic quick coupler',
    interchange: 'Eaton FD45',
  },
  {
    from: 'EATON-FD45-NON-VALVED',
    sku: 'IH-QC-ISO7241B-NV',
    series: 'QC-7241B-NV',
    title: 'ISO 7241 Series B Non-Valved Quick Coupler',
    slug: 'iso-7241-series-b-non-valved-quick-coupler',
    focusKeyword: 'iso 7241 series b non-valved quick coupler',
    interchange: 'Eaton FD45',
  },
  {
    from: 'EATON-FD45-PUSHER',
    sku: 'IH-QC-ISO7241B-PSH',
    series: 'QC-7241B-P',
    title: 'ISO 7241 Series B Pusher-Style Quick Coupler',
    slug: 'iso-7241-series-b-pusher-style-quick-coupler',
    focusKeyword: 'iso 7241 series b pusher-style quick coupler',
    interchange: 'Eaton FD45',
  },
  {
    from: 'EATON-FD89',
    sku: 'IH-QC-ISO16028',
    series: 'QC-16028',
    title: 'ISO 16028 Flush Face Hydraulic Quick Coupler',
    slug: 'iso-16028-flush-face-hydraulic-quick-coupler',
    focusKeyword: 'iso 16028 flush face hydraulic quick coupler',
    interchange: 'Eaton FD89',
  },
  {
    from: 'EATON-FD89-2000',
    sku: 'IH-QC-ISO16028-SS',
    series: 'QC-16028-SS',
    title: '316 Stainless ISO 16028 Flush Face Coupler',
    slug: '316-stainless-iso-16028-flush-face-coupler',
    focusKeyword: '316 stainless iso 16028 flush face coupler',
    interchange: 'Eaton FD89-2000',
  },
  {
    from: 'EATON-FD99',
    sku: 'IH-QC-ISO16028-HP',
    series: 'QC-16028-HP',
    title: 'High-Pressure ISO 16028 Flush Face Coupler',
    slug: 'high-pressure-iso-16028-flush-face-coupler',
    focusKeyword: 'high-pressure iso 16028 flush face coupler',
    interchange: 'Eaton FD99',
  },
  {
    from: 'EATON-FD96',
    sku: 'IH-QC-FF-TTC-HP',
    series: 'QC-FFT',
    title: 'Thread-to-Connect Flush Face Quick Coupler',
    slug: 'thread-to-connect-flush-face-quick-coupler',
    focusKeyword: 'thread-to-connect flush face quick coupler',
    interchange: 'Eaton FD96',
  },
  {
    from: 'EATON-FD86',
    sku: 'IH-QC-DRYBREAK-TTC',
    series: 'QC-DB',
    title: 'Dry Break Thread-to-Connect Quick Coupler',
    slug: 'dry-break-thread-to-connect-quick-coupler',
    focusKeyword: 'dry break thread-to-connect quick coupler',
    interchange: 'Eaton FD86',
  },
  {
    from: 'EATON-5100',
    sku: 'IH-QC-BRASS-TTC',
    series: 'QC-BR',
    title: 'Thread-to-Connect Brass Quick Coupler',
    slug: 'thread-to-connect-brass-quick-coupler',
    focusKeyword: 'thread-to-connect brass quick coupler',
    interchange: 'Eaton 5100',
  },
  {
    from: 'EATON-5400',
    sku: 'IH-QC-REFRIG',
    series: 'QC-RF',
    title: 'Refrigerant Quick Coupler — Low Air Inclusion',
    slug: 'refrigerant-quick-coupler-low-air-inclusion',
    focusKeyword: 'refrigerant quick coupler',
    interchange: 'Eaton 5400',
  },
  {
    from: 'EATON-FD14',
    sku: 'IH-QC-OILDRAIN',
    series: 'QC-OD',
    title: 'Push-to-Connect Oil Drain Coupling (FLOCS)',
    slug: 'push-to-connect-oil-drain-coupling',
    focusKeyword: 'oil drain coupling',
    interchange: 'Eaton FD14',
  },
  {
    from: 'EATON-FD15',
    sku: 'IH-QC-OILSAMPLE',
    series: 'QC-OS',
    title: 'Hydraulic Oil Sampling Valve Coupler',
    slug: 'hydraulic-oil-sampling-valve-coupler',
    focusKeyword: 'hydraulic oil sampling valve',
    interchange: 'Eaton FD15',
  },
  {
    from: 'EATON-FD31',
    sku: 'IH-QC-JACK-10K',
    series: 'QC-JK',
    title: '10,000 psi Hydraulic Jack Quick Coupler',
    slug: '10000-psi-hydraulic-jack-quick-coupler',
    focusKeyword: 'hydraulic jack quick coupler',
    interchange: 'Eaton FD31, Enerpac interchange',
  },
  {
    from: 'EATON-FD35',
    sku: 'IH-QC-ARCLATCH-10K',
    series: 'QC-AL',
    title: '10,000 psi Arc Latch Hydraulic Quick Coupler',
    slug: '10000-psi-arc-latch-hydraulic-quick-coupler',
    focusKeyword: 'arc latch hydraulic quick coupler',
    interchange: 'Eaton FD35',
  },
  {
    from: 'EATON-FD69',
    sku: 'IH-QC-WATERBLAST-10K',
    series: 'QC-WB',
    title: '10,000 psi Water Blast Quick Coupler',
    slug: '10000-psi-water-blast-quick-coupler',
    focusKeyword: 'water blast quick coupler',
    interchange: 'Eaton FD69',
  },
  {
    from: 'EATON-FD40',
    sku: 'IH-QC-AIR-MIL-PTC',
    series: 'QC-AM',
    title: 'MIL-C-4109 Push-to-Connect Air Coupler',
    slug: 'mil-c-4109-push-to-connect-air-coupler',
    focusKeyword: 'mil-c-4109 push-to-connect air coupler',
    interchange: 'Eaton FD40',
  },
  {
    from: 'EATON-FD43',
    sku: 'IH-QC-AIR-MIL-MR',
    series: 'QC-AMR',
    title: 'MIL-C-4109 Manual-Retract Air Coupler',
    slug: 'mil-c-4109-manual-retract-air-coupler',
    focusKeyword: 'mil-c-4109 manual-retract air coupler',
    interchange: 'Eaton FD43',
  },
  {
    from: 'EATON-FD41',
    sku: 'IH-QC-AIR-ARO210',
    series: 'QC-ARO',
    title: 'ARO 210 Interchange Air Quick Coupler',
    slug: 'aro-210-interchange-air-quick-coupler',
    focusKeyword: 'aro 210 interchange air quick coupler',
    interchange: 'Eaton FD41, ARO 210',
  },
  {
    from: 'EATON-FD48',
    sku: 'IH-QC-SM250',
    series: 'QC-SM',
    title: 'SM-250 Interchange Hydraulic Quick Coupler',
    slug: 'sm-250-interchange-hydraulic-quick-coupler',
    focusKeyword: 'sm-250 interchange hydraulic quick coupler',
    interchange: 'Eaton FD48, Parker Bruning SM-250',
  },
  {
    from: 'EATON-FD49',
    sku: 'IH-QC-HTMA',
    series: 'QC-HT',
    title: 'HTMA Interchange Hydraulic Tool Coupler',
    slug: 'htma-interchange-hydraulic-tool-coupler',
    focusKeyword: 'htma interchange hydraulic tool coupler',
    interchange: 'Eaton FD49, NFPA T3.20.15 HTMA',
  },
  {
    from: 'EATON-FD70-FD76',
    sku: 'IH-QC-FARM-ISO5675',
    series: 'QC-5675',
    title: 'ISO 5675 Farm Tractor Male Tip Coupler',
    slug: 'iso-5675-farm-tractor-male-tip-coupler',
    focusKeyword: 'iso 5675 farm tractor male tip coupler',
    interchange: 'Eaton FD70 / FD76',
  },
  {
    from: 'EATON-FD72',
    sku: 'IH-QC-FARM-CUP',
    series: 'QC-5675-CUP',
    title: 'Connect-Under-Pressure Farm Quick Coupler',
    slug: 'connect-under-pressure-farm-quick-coupler',
    focusKeyword: 'connect-under-pressure farm quick coupler',
    interchange: 'Eaton FD72',
  },
  {
    from: 'EATON-FD83',
    sku: 'IH-QC-COOLANT-SS',
    series: 'QC-CL',
    title: 'Dual-Interlock Stainless Coolant Coupler',
    slug: 'dual-interlock-stainless-coolant-coupler',
    focusKeyword: 'dual-interlock stainless coolant coupler',
    interchange: 'Eaton FD83',
  },
  {
    from: 'EATON-FD90',
    sku: 'IH-QC-TESTPOINT',
    series: 'QC-TP',
    title: 'SAE J1502 Diagnostic Test-Point Coupler',
    slug: 'sae-j1502-diagnostic-test-point-coupler',
    focusKeyword: 'sae j1502 diagnostic test-point coupler',
    interchange: 'Eaton FD90',
  },
  {
    from: 'EATON-FF14802',
    sku: 'IH-QC-GAUGEKIT',
    series: 'QC-GK',
    title: 'Hydraulic Pressure Gauge Test Kit',
    slug: 'hydraulic-pressure-gauge-test-kit',
    focusKeyword: 'hydraulic pressure gauge test kit',
    interchange: 'Eaton FF14802',
  },
]

// ── Validation, per #279 ──────────────────────────────────────────────────

function validate(c: Coupler): string[] {
  const errs: string[] = []
  const len = c.title.length
  if (len < TITLE_RANGE.min || len > TITLE_RANGE.max) {
    errs.push(`title is ${len} chars, outside ${TITLE_RANGE.min}–${TITLE_RANGE.max}`)
  }
  const k = c.focusKeyword.toLowerCase()
  if (!c.title.toLowerCase().includes(k)) errs.push(`keyword "${k}" is not in the title`)
  const url = `/p/${c.slug}`.toLowerCase()
  if (!url.includes(k.replace(/\s+/g, '-')) && !url.includes(k)) {
    errs.push(`keyword "${k}" is not in the slug`)
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)) errs.push(`slug "${c.slug}" is not kebab-case`)
  if (!/^IH-QC-[A-Z0-9-]+$/.test(c.sku)) errs.push(`sku "${c.sku}" is off-pattern`)
  return errs
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Trim to a word boundary so the meta description lands inside its range. */
function fitDescription(lead: string, tail: string): string {
  const joined = `${lead.trim()} ${tail}`.replace(/\s+/g, ' ').trim()
  if (joined.length <= DESCRIPTION_RANGE.max) return joined
  const cut = joined.slice(0, DESCRIPTION_RANGE.max)
  const at = cut.lastIndexOf(' ')
  return (at > DESCRIPTION_RANGE.min ? cut.slice(0, at) : cut).replace(/[,;—-]$/, '').trim()
}

type SpecMap = Record<string, string>

/**
 * Rebuilds the body under Indus framing. Deliberately does NOT regex-patch the
 * old HTML: the Eaton material is structural (a whole part-number-scheme
 * paragraph, a sample-part-number list, an ex-Eaton supply paragraph), and
 * patching around it leaves seams. Regenerating from the spec rows — which are
 * unchanged and were always ours — is cleaner and auditable.
 */
function buildHtml(c: Coupler, s: SpecMap, oneLiner: string): string {
  const bar = Number(s.max_operating_pressure_bar ?? 0)
  const burst = Number(s.min_burst_pressure_bar ?? 0)
  const psi = (n: number) => Math.round(n * 14.5038)
  const li = (label: string, v?: string) => (v ? `<li>${label}: ${escape(v)}</li>` : '')

  const interchangeAll = [s.interchange_with, c.interchange].filter(Boolean).join(', ')

  return `<p>The <strong>${escape(c.title)}</strong> is a ${escape((s.application_class ?? 'hydraulic').toLowerCase())} quick-disconnect coupling in the Indus <strong>${escape(c.series)}</strong> range. ${escape(oneLiner)}</p>
<p>Working pressure to <strong>${bar} bar (${psi(bar)} psi)</strong> at the smallest body size, with minimum burst pressure of ${burst} bar. ${escape(s.connection_method ?? '')} connection — ${escape((s.valving ?? '').toLowerCase())} variant.</p>
<h3>Construction &amp; features</h3>
<ul>
${li('Interchange standard', s.interchange_standard)}
${li('Connection method', s.connection_method)}
${li('Valving', s.valving)}
${s.flush_face === 'true' ? '<li>Flush-face / no-spill design — minimal fluid loss and air inclusion at disconnect</li>' : ''}
${s.connect_under_pressure === 'true' ? '<li>Connect-under-pressure capability — couplings can be mated against trapped residual pressure</li>' : ''}
${interchangeAll ? `<li>Interchanges with: ${escape(interchangeAll)}</li>` : ''}
</ul>
<h3>Available variants — specify in your RFQ</h3>
<p>Indus supplies the full <strong>${escape(c.series)}</strong> range. Specify the configuration that matches your hose end and operating envelope and we will quote against it.</p>
<ul>
${li('<strong>Coupling halves</strong>', s.available_halves)}
${li('<strong>Body sizes</strong>', s.available_sizes)}
${li('<strong>Body materials</strong>', s.available_body_materials)}
${li('<strong>Seal materials</strong>', s.available_seal_materials)}
${li('<strong>Port thread types</strong>', s.available_port_threads)}
</ul>
<h3>Performance</h3>
<ul>
<li>Maximum operating pressure: ${bar} bar (${psi(bar)} psi) at the smallest size; derates with diameter</li>
<li>Minimum burst pressure: ${burst} bar (${psi(burst)} psi)</li>
${s.rated_flow_lpm_max ? `<li>Rated flow (largest size): up to ${escape(s.rated_flow_lpm_max)} L/min</li>` : ''}
${s.vacuum_rating_in_hg && s.vacuum_rating_in_hg !== '0' ? `<li>Vacuum rating: ${escape(s.vacuum_rating_in_hg)} in./Hg</li>` : ''}
<li>Operating temperature range: ${escape(s.temp_min_c ?? '')}°C to +${escape(s.temp_max_c ?? '')}°C (varies by seal compound; specify in RFQ)</li>
</ul>
<h3>Replacing an existing coupling?</h3>
<p>This coupler is dimensionally interchangeable with <strong>${escape(c.interchange)}</strong>${s.interchange_with ? `, and with ${escape(s.interchange_with)}` : ''}. If you are matching an existing fleet, quote the coupling you are replacing on the RFQ and we will confirm the mating half before you order.</p>
<h3>How to order</h3>
<p>Confirm the coupling half (male / female / complete set / dust cap), body size, port thread type and size, seal compound and body material. Indus quotes with material certification on request, and air-freight or sea-freight to the UAE and wider GCC. Standard lead time 14 days from order; stocked configurations ship the same week.</p>
<h3>Companion products</h3>
<p>Indus also supplies the matching dust caps, dust plugs and seal repair kits for this series — add them to the same RFQ. For a hose assembly terminated with this coupler, request a complete assembly quote and we will supply it tested at 1.5× working pressure with a witness-test certificate.</p>`
}

function buildFaqs(c: Coupler, s: SpecMap, oneLiner: string) {
  const bar = Number(s.max_operating_pressure_bar ?? 0)
  const burst = Number(s.min_burst_pressure_bar ?? 0)
  const psi = (n: number) => Math.round(n * 14.5038)
  const cup = s.connect_under_pressure === 'true'
  return [
    {
      question: `What is the Indus ${c.series} range used for?`,
      answer: `${oneLiner} It is supplied under the Indus Hydraulics brand and built to ${s.interchange_standard || 'the interchange dimensions noted on this page'}.`,
    },
    {
      question: 'What is the maximum working pressure?',
      answer: `${bar} bar (${psi(bar)} psi) at the smallest body size, with minimum burst pressure of ${burst} bar (${psi(burst)} psi). Pressure derates with body size — ask us for the per-size figure for the size you need.`,
    },
    {
      question: 'What sizes are available?',
      answer: `${s.available_sizes || 'Sizes vary by configuration.'} Specify the body size that matches your hose ID in the RFQ and we will confirm availability and price.`,
    },
    {
      question: 'What seal and body materials are available?',
      answer: `Seal materials: ${s.available_seal_materials || 'specify on the RFQ'}. Body materials: ${s.available_body_materials || 'specify on the RFQ'}. Seal compound drives the temperature range — Buna-N (-40°C to +100°C), Viton (-20°C to +200°C), EPR (-45°C to +150°C), Neoprene (-30°C to +90°C). Choose based on your fluid and operating temperature.`,
    },
    {
      question: 'What port thread options are available?',
      answer: `${s.available_port_threads || 'Common hydraulic port threads are available.'} Specify the exact port thread you need so it matches your existing pipework or hose end.`,
    },
    {
      question: 'Does this coupling connect under pressure?',
      answer: cup
        ? `Yes — the ${c.series} is rated for connect-under-pressure operation. The connect-under-pressure rating is typically lower than the connected working pressure; ask us for the figure at your size.`
        : `No — the ${c.series} is not rated for connect-under-pressure. Both halves must be depressurised before mating. For connect-under-pressure service see the Indus QC-FFT thread-to-connect flush face or QC-BR brass thread-to-connect couplers.`,
    },
    {
      question: 'Will this replace the coupling already on my machine?',
      answer: `It is dimensionally interchangeable with ${c.interchange}${s.interchange_with ? `, and with ${s.interchange_with}` : ''}. Tell us what you are replacing on the RFQ and we will confirm the mating half before you order.`,
    },
    {
      question: 'What is the typical lead time?',
      answer: 'Standard lead time is 14 working days from order. Stocked configurations ship the same week, and non-standard sizes or seal compounds add two to three weeks. Air freight to the UAE and GCC is available for plant-down emergencies — flag it on the RFQ.',
    },
  ]
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const apply = process.argv.includes('--apply')
  const prefix = apply ? '[LIVE]' : '[DRY-RUN]'

  // 1. Validate every triple first. A failure aborts before any write.
  const failures: string[] = []
  for (const c of COUPLERS) {
    for (const e of validate(c)) failures.push(`${c.from}: ${e}`)
  }
  const skus = COUPLERS.map((c) => c.sku)
  const slugs = COUPLERS.map((c) => c.slug)
  if (new Set(skus).size !== skus.length) failures.push('duplicate SKU in the table')
  if (new Set(slugs).size !== slugs.length) failures.push('duplicate slug in the table')

  if (failures.length > 0) {
    console.error(`ABORT — ${failures.length} invalid triple(s):`)
    for (const f of failures) console.error(`  ${f}`)
    process.exitCode = 1
    return
  }
  console.log(
    `all ${COUPLERS.length} triples validate (title length, keyword in title and slug, sku/slug shape)\n`,
  )

  const indus = await db.brand.findUnique({ where: { slug: 'indus' }, select: { id: true } })
  if (!indus) throw new Error('brand "indus" not found')

  // 2. Collisions against the rest of the catalogue.
  const clashes = await db.product.findMany({
    where: {
      OR: [{ sku: { in: skus } }, { slug: { in: slugs } }],
      NOT: { sku: { in: COUPLERS.map((c) => c.from) } },
    },
    select: { sku: true, slug: true },
  })
  if (clashes.length > 0) {
    console.error('ABORT — new SKU/slug already in use by another product:')
    for (const c of clashes) console.error(`  ${c.sku}  ${c.slug}`)
    process.exitCode = 1
    return
  }

  // 3. Couplers.
  let done = 0
  for (const c of COUPLERS) {
    const p = await db.product.findUnique({
      where: { sku: c.from },
      select: { id: true, descriptionShort: true, specs: { select: { label: true, value: true, templateField: { select: { key: true } } } } },
    })
    if (!p) {
      console.log(`  gone     ${c.from.padEnd(22)} not found — skipped`)
      continue
    }
    const s: SpecMap = {}
    for (const row of p.specs) {
      const key = row.templateField?.key
      if (key) s[key] = row.value
    }
    const oneLiner = (p.descriptionShort ?? '').replace(/\s+/g, ' ').trim()
    const seoDescription = fitDescription(
      oneLiner,
      `Supplied under the Indus Hydraulics brand. Interchangeable with ${c.interchange}.`,
    )

    console.log(`  ${c.from.padEnd(22)} -> ${c.sku}`)
    console.log(`     title  ${c.title}  (${c.title.length} chars)`)
    console.log(`     slug   /p/${c.slug}`)
    console.log(`     meta   ${seoDescription.length} chars`)

    if (apply) {
      await db.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: p.id },
          data: {
            sku: c.sku,
            slug: c.slug,
            title: c.title,
            seoTitle: c.title,
            seoDescription,
            focusKeyword: c.focusKeyword,
            brandId: indus.id,
            descriptionLong: buildHtml(c, s, oneLiner),
          },
        })
        // The `series` spec still held Eaton's designation.
        await tx.productSpec.updateMany({
          where: { productId: p.id, label: 'Series' },
          data: { value: c.series },
        })
        // Interchange list gains the Eaton reference, kept honestly.
        const existing = s.interchange_with ?? ''
        const merged = [existing, c.interchange].filter(Boolean).join(', ')
        await tx.productSpec.updateMany({
          where: { productId: p.id, label: 'Interchanges With (Competitor Brands)' },
          data: { value: merged },
        })
        await tx.productFaq.deleteMany({ where: { productId: p.id } })
        await tx.productFaq.createMany({
          data: buildFaqs(c, s, oneLiner).map((f, i) => ({
            productId: p.id,
            question: f.question,
            answer: f.answer,
            position: i,
          })),
        })
      })
    }
    done += 1
  }

  // 4. The 12 hoses — brand flip plus the one sentence that named the Eaton
  //    Aeroquip reference as though this product were it.
  const hoses = await db.product.findMany({
    where: { brand: { slug: 'eaton-aeroquip' }, sku: { startsWith: 'IH-HOSE' } },
    select: { id: true, sku: true, descriptionLong: true },
  })
  console.log(`\n  ${hoses.length} hose(s) — brand flip + "Also available in" clause`)
  for (const h of hoses) {
    const before = h.descriptionLong ?? ''
    const after = before.replace(
      /in addition to the Eaton Aeroquip reference/gi,
      'in addition to the Indus reference',
    )
    const changed = after !== before
    console.log(`     ${h.sku.padEnd(18)} clause rewritten: ${changed ? 'yes' : 'no (already clean)'}`)
    if (apply) {
      await db.product.update({
        where: { id: h.id },
        data: { brandId: indus.id, ...(changed ? { descriptionLong: after } : {}) },
      })
    }
  }

  // 5. Report any Eaton text left anywhere in the moved set.
  if (apply) {
    const leftovers: Array<{ sku: string; where: string }> = []
    const moved = await db.product.findMany({
      where: { sku: { in: [...skus, ...hoses.map((h) => h.sku)] } },
      select: {
        sku: true,
        title: true,
        seoTitle: true,
        descriptionLong: true,
        faqs: { select: { question: true, answer: true } },
        specs: { select: { label: true, value: true } },
      },
    })
    for (const m of moved) {
      if (/eaton|aeroquip/i.test(m.title)) leftovers.push({ sku: m.sku, where: 'title' })
      if (/eaton|aeroquip/i.test(m.seoTitle ?? '')) leftovers.push({ sku: m.sku, where: 'seoTitle' })
      // Body and specs legitimately name Eaton as an interchange reference.
      const bodyHits = (m.descriptionLong ?? '').match(/Eaton|Aeroquip/gi)?.length ?? 0
      const interchangeHits = (m.descriptionLong ?? '').match(/Interchange|interchangeable/gi)?.length ?? 0
      if (bodyHits > 0 && interchangeHits === 0) leftovers.push({ sku: m.sku, where: 'body (not an interchange note)' })
      for (const f of m.faqs) {
        if (/Aeroquip|Eaton (catalogue|datasheet|USA)/i.test(f.question + f.answer)) {
          leftovers.push({ sku: m.sku, where: `faq: ${f.question.slice(0, 40)}` })
        }
      }
    }
    console.log(
      leftovers.length === 0
        ? '\n  audit: no Eaton branding left outside interchange references'
        : `\n  audit: ${leftovers.length} leftover(s) to review`,
    )
    for (const l of leftovers) console.log(`     ${l.sku}  ${l.where}`)
  }

  const remaining = await db.product.count({ where: { brand: { slug: 'eaton-aeroquip' } } })
  console.log(`\n${prefix} ${done} coupler(s) and ${hoses.length} hose(s) processed.`)
  console.log(`Products still on brand eaton-aeroquip: ${apply ? remaining : '(unchanged in dry-run)'}`)
  console.log('No redirects written — the old /p/eaton-* URLs will 404, as instructed.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
