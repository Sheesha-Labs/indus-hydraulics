import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Needle, gauge, bleed, double block and bleed, monoflange and globe valves. Sources read 2026-10-21: Swagelok N and HN
 * needle valve catalogue MS-01-168 (to 10,000 psig; stem tips — ball tip for repeated shutoff, regulating tips not for
 * repeated gas shutoff; nitrogen seat test; sour option to NACE MR0175 with alloy 400 stem; back seat); SLB API 6A
 * guide (316 sour-service limits). Standard scopes (API 6D, API 602, API 623, ASME B16.34) are given by title only.
 * NOT used: API 6D's DBB definition wording (not read); monoflange maker data; leak-path percentages.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'needle-globe-and-instrumentation-valves',
  title: 'Needle, globe and instrumentation valves: gauge isolation, bleed, double block and bleed',
  excerpt:
    'Every pressure gauge, transmitter and sample point on a wellhead or skid sits behind a small valve — a needle valve to isolate it, a bleed valve to vent it, a double block and bleed or monoflange where one valve is not enough. Globe valves do the same job at line size where flow must be throttled. How the stem tips differ, what double block and bleed means in an instrument manifold and in a pipeline valve, which standard covers a globe valve, and the limits on stainless in sour service.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Needle, Globe & Instrumentation Valves: DBB, Monoflange',
  seoDescription:
    'A guide to instrumentation valves: needle valve stem tips, gauge isolation and bleed valves, double block and bleed and monoflange valves, globe valves for throttling and their standards, and sour-service material limits.',
  focusKeyword: 'instrumentation needle valve',
  publishedAt: '2026-10-21T23:45:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Needle valves isolate gauges and instruments; choose the stem tip for the duty — a ball tip for repeated shut-off, a regulating tip for fine control.',
        'Swagelok warns its regulating stems are not intended for repeated shut-off in gas service.',
        'Double block and bleed in an instrument valve means two isolating valves and a vent in one body; in a pipeline valve (API 6D) it means one valve with two seats and a cavity bleed.',
        'Globe valves throttle; the steel globe valve standards are API 623 (flanged) and API 602 (compact, NPS 4 and smaller) — not API 6D.',
        'Stainless is limited in sour service by NACE MR0175; specify the H₂S partial pressure and temperature.',
      ],
    },
    {
      type: 'lead',
      html: 'Instrument valves are small, cheap and easy to get wrong. A gauge isolated by a single valve cannot be changed safely without bleeding the line it is on; a regulating-tip valve used for daily shut-off on gas wears out its seat; a valve sold as “sour service” in 316 may be outside the limits of the well it is fitted to. For the gauges themselves see <a href="/blog/pressure-gauge-guide">pressure gauges</a>; for the tube fittings that connect them, <a href="/blog/instrumentation-tube-fittings-guide">instrumentation tube fittings</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Needle, gauge and bleed valves.', anchor: 'needle' },
    {
      type: 'prose',
      html: '<p>A <strong>needle valve</strong> closes a small orifice with a fine-threaded stem. Swagelok’s N and HN series, for example, work to 10,000 psig, with the rating falling as temperature rises. The <strong>stem tip</strong> decides the duty:</p><ul><li><strong>Ball tip</strong> — non-rotating, for repeatable leak-tight shut-off.</li><li><strong>Regulating tip</strong> — tapered, for fine flow control; Swagelok says these are not intended for repetitive shut-off in gas service.</li><li><strong>Soft-seat tips</strong> (PCTFE, PTFE) — tighter shut-off at lower temperatures.</li></ul><p>A <strong>gauge isolation valve</strong> is a needle valve with a gauge port; a <strong>bleed valve</strong> vents the trapped pressure between the isolating valve and the instrument so the gauge can be removed. A back-seat in the fully open position keeps the stem from blowing out and seals the packing.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Double block and bleed, and monoflanges.', anchor: 'dbb' },
    {
      type: 'comparison_table',
      caption: 'Two meanings of double block and bleed',
      columns: ['Context', 'What DBB means', 'Example'],
      rows: [
        { cells: ['Instrument valve', 'Two isolating valves plus a vent in one body — isolate twice, then bleed between', 'Three-handle DBB needle valve, DBB monoflange'], highlight: true },
        { cells: ['Pipeline valve (API 6D)', 'One valve with two seats, sealing from both ends, with a bleed for the cavity between them', 'Trunnion ball or through-conduit gate valve'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>A <strong>monoflange</strong> builds the block, bleed and block valves into a flange-faced body that bolts straight to the process flange or wellhead outlet, replacing a stack of separate valves and fittings at the tap. It is not the same thing as a <strong>3-valve manifold</strong>, which mounts a differential-pressure transmitter with two blocks and an equaliser.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Globe valves.', anchor: 'globe' },
    {
      type: 'prose',
      html: '<p>A globe valve closes a disc onto a seat across the flow path, so it can throttle smoothly — the job a gate valve must never do. The price is a higher pressure drop when open. Steel globe valves are built to <strong>API 623</strong> (flanged and butt-weld, bolted bonnet) or <strong>API 602</strong> (compact, NPS 4 and smaller), with pressure-temperature ratings from ASME B16.34; API 6D covers pipeline gate, ball, plug and check valves, not globes. Order by size, ASME class, end connection, body and trim materials and service.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Sour service has limits for every material.',
      body: 'Under NACE MR0175 / ISO 15156, carbon and low-alloy steels must be 22 HRC or softer, and austenitic stainless such as 316 is restricted by temperature, H₂S partial pressure and chloride. Swagelok’s sour option, for example, pairs a 316 body with an alloy 400 stem. Give the well’s H₂S partial pressure and temperature when ordering.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which needle valve stem tip should I use?', answer: 'A ball tip for repeated shut-off, a regulating tip for fine control (not for repeated gas shut-off), a soft-seat tip for tight shut-off at moderate temperature.' },
        { question: 'What is a double block and bleed valve?', answer: 'In instrumentation, two isolating valves and a bleed in one body. In API 6D pipeline valves, one valve with two seats sealing from both sides and a bleed for the cavity between them.' },
        { question: 'Is a monoflange the same as a 3-valve manifold?', answer: 'No. A monoflange bolts to the process flange with block, bleed and block valves; a 3-valve manifold mounts a differential-pressure transmitter.' },
        { question: 'Which standard covers globe valves?', answer: 'API 623 for flanged and butt-weld steel globe valves, API 602 for compact valves NPS 4 and smaller, with ASME B16.34 ratings. API 6D does not cover globe valves.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Needle, gauge, bleed, double block and bleed and monoflange valves, and globe valves:</p>' + stockList(['oilfield-instrumentation-valves', 'oilfield-globe-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Instrumentation and globe valves',
      skus: ['IH-OFV-INST-NEEDLE-12-NPT-10K-SOUR-CAMERON-SS', 'IH-OFV-INST-GAUGE-12-NPT-10K-CAMERON', 'IH-OFV-INST-BLEED-12-NPT-10K-SOUR-INDUS', 'IH-OFV-INST-DBB-NEEDLE-3HANDLE-CAMERON', 'IH-OFV-INST-MONOFLANGE-12-NPT-15M-SOUR-CAMERON', 'IH-OFV-GLOBE-2-300RF-740-SOUR-FMC', 'IH-OFV-GLOBE-3-600RF-1480-SOUR-CAMERON'],
    },
    { type: 'category_link', slug: 'oilfield-instrumentation-valves', label: 'Instrumentation valves', blurb: 'Needle, gauge, bleed, DBB and monoflange valves.' },
    { type: 'category_link', slug: 'oilfield-globe-valves', label: 'Globe valves', blurb: 'Flanged globe valves, Class 150 to 1500.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'swagelok-needle', text: 'Swagelok. Needle Valves, N and HN Series (MS-01-168).', url: 'https://www.swagelok.com/downloads/webcatalogs/en/ms-01-168.pdf' },
        { id: 'slb-6a', text: 'SLB (Cameron). Introduction to API Specification 6A.', url: 'https://www.slb.com/-/media/files/sur/brochure/introduction-to-api-specification-6a.ashx' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['oilfield-pressure-and-flow-instrumentation', 'pressure-gauge-guide', 'instrumentation-tube-fittings-guide', 'oilfield-pressure-relief-valves'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Needle valve data from Swagelok MS-01-168; sour limits from SLB’s API 6A guide; standard scopes by title.',
    },
    {
      type: 'cta_block',
      heading: 'Fitting out an instrument line?',
      body: 'Send the connection sizes, pressure, temperature, whether the service is sour, and what each valve isolates. We will quote the needle, bleed, DBB or monoflange valves and the fittings between them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
