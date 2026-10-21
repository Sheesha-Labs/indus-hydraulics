import type { BlogArticleSeed } from '../shared'

/**
 * Liquid-filled vs dry gauges. Why fill (Enerpac G2535L page and blog); pulsation symptoms and remedies (Ashcroft FAQ);
 * fill temperature limits (Ashcroft ambient/storage; Enerpac L2561 operating) — quoted per maker because they differ;
 * oxidiser prohibition (Enerpac L2561, SAMSON AB 09); venting ≤100 psi ranges and refilling procedure (Enerpac L2561);
 * EN 837-1 blow-out requirement for filled gauges (SAMSON). "Fogged fill / cracked window" not used (unsourced).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'glycerine-filled-vs-dry-pressure-gauges',
  title: 'Glycerine-filled vs dry pressure gauges: when to fill, which fluid, and the venting rule',
  excerpt:
    'Filling a gauge with glycerine or silicone damps the pointer, protects the movement from vibration and keeps moisture out — and makes the gauge dangerous on oxygen and inaccurate if the case is not vented. When a filled gauge is worth it, how glycerine, silicone and halocarbon fills differ, temperature limits, the venting rule for low ranges, and the alternatives when fill is not enough.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Glycerine-Filled vs Dry Pressure Gauges: When to Use Each',
  seoDescription:
    'Liquid-filled vs dry pressure gauges: how glycerine and silicone fill damp vibration and pulsation, temperature limits, why fill must never be used on oxygen, venting the fill plug on low ranges, refilling, and snubbers and needle valves.',
  focusKeyword: 'glycerine filled pressure gauge',
  publishedAt: '2026-10-21T14:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A liquid fill damps pointer vibration from pumps and shock loads, protects the movement and keeps moisture out — which is why most hydraulic gauges are glycerine-filled.',
        'Glycerine and silicone fills must never be used with oxygen or other strong oxidisers: use a halocarbon fill or a dry, oxygen-clean gauge.',
        'Fill temperature limits vary by maker — Enerpac rates glycerine gauges for about −20 to +60 °C; Ashcroft gives 20 to 150 °F ambient. Silicone and halocarbon go colder.',
        'Filled gauges with ranges of 100 psi or less must be vented, or temperature changes pressurise the case and the pointer will not return to zero.',
        'Filled gauges must have a blow-out device (EN 837-1 code S1 or better).',
      ],
    },
    {
      type: 'lead',
      html: 'Look at a gauge on a hydraulic power unit and the dial is usually floating in a clear liquid. That fill is doing real work — and on the wrong service it does real harm. This guide covers what a fill does, which fluid to choose, the rules that come with it, and what to use instead when filling is not enough or not allowed.',
    },

    { type: 'section_head', number: '/01', title: 'What the fill does.', anchor: 'why' },
    {
      type: 'prose',
      html: '<p>A gauge movement is a delicate train of gears and a hairspring. On a pump line or a vibrating machine, a dry gauge’s pointer flutters so much it cannot be read, and the movement teeth wear until the gauge reads high at zero. Enerpac describes glycerine fill as protecting the sensing parts from vibration, sudden pressure changes and moisture, damping needle vibration on powered pumps and under shock loads — its example is nut splitters — which improves readability and extends gauge life.</p><p>Ashcroft makes the point about the pulsation you cannot see: high-frequency pulsation may show only as an upscale zero shift from movement wear. A liquid-filled gauge is its first remedy for both pulsation and vibration.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Fill options and their limits (quoted by maker; check the gauge’s own data)',
      columns: ['Fill', 'Temperature (maker)', 'Good for', 'Never use with'],
      rows: [
        { cells: ['Dry', 'Ashcroft: −20 to 200 °F (−29 to 93 °C) ambient', 'Stable pressure, oxygen-clean service, high ambient', '—'] },
        { cells: ['Glycerine', 'Ashcroft: 20 to 150 °F (−7 to 66 °C) ambient; Enerpac: −4 to 140 °F (−20 to 60 °C)', 'Hydraulic and pump vibration, general industry', 'Oxygen, chlorine, nitric acid, hydrogen peroxide'], highlight: true },
        { cells: ['Silicone', 'Ashcroft: −40 to 150 °F (−40 to 66 °C)', 'Cold climates, wide temperature swings', 'Oxygen and strong oxidisers'] },
        { cells: ['Halocarbon (fluorinated)', 'Ashcroft: −40 to 150 °F (−40 to 66 °C)', 'Oxidising media where a fill is needed', '—'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The oxidiser rule.', anchor: 'oxygen' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'No glycerine or silicone on oxygen.',
      body: 'Enerpac and SAMSON both prohibit glycerine- or silicone-filled gauges where strong oxidising agents are present — oxygen, chlorine, nitric acid, hydrogen peroxide — because a chemical reaction, ignition or explosion may result. Use a fully fluorinated or chlorinated fill such as a halocarbon, or a dry gauge cleaned for oxygen service, with the safety-pattern case EN 837-2 requires for oxygen.',
    },

    { type: 'section_head', number: '/03', title: 'Venting: the rule for low ranges.', anchor: 'venting' },
    {
      type: 'prose',
      html: '<p>A sealed, filled case is a small pressure vessel. As the gauge warms, the fill expands and pressurises the case; as it cools, it pulls a slight vacuum. On a high-range gauge the effect is negligible. On a low-range gauge it is not: Enerpac requires every filled gauge with a range of <strong>100 psi or less</strong> (including vacuum-to-100 psi compound ranges) to be case-vented, otherwise the pointer may not return to zero — and warns that an unvented glycerine gauge can become unstable and even burst.</p><p>To vent, Enerpac’s instruction is to cut the tip of the nipple on the fill plug and mount the gauge with the plug at 12 o’clock, so the fill cannot run out. On a Gulf site where a gauge sees 50 °C afternoons and cool nights, the swing is large; low-range filled gauges outdoors should always be vented.</p><h3>Refilling</h3><p>If a gauge has lost fill, Enerpac’s procedure is to fill at 20–29 °C (glycerine warmer than about 29 °C traps air bubbles), let the gauge breathe for at least ten minutes before refitting the plug, and wipe excess fluid off the plug, which can otherwise pop out at high temperature.</p>',
    },

    { type: 'section_head', number: '/04', title: 'When fill is not enough.', anchor: 'beyond' },
    {
      type: 'prose',
      html: '<p>A fill damps the pointer but does not reduce the pressure surges reaching the Bourdon tube. On severe pulsation — reciprocating pumps, hammering tools, high-cycle presses — add damping at the connection:</p><ul><li><strong>Throttle screw or plug</strong> in the gauge socket: a fixed restriction, threaded types removable for cleaning.</li><li><strong>Snubber</strong>: a porous metal disc, graded for the medium — Ashcroft grades for oil, for water and light oil, and for air, steam and gas.</li><li><strong>Pulsation dampener</strong> with selectable orifices, self-cleaning.</li><li><strong>Needle valve or snubber valve</strong>: adjustable throttling and isolation in one. Enerpac’s adjustable snubber valve also stops the pointer snapping back when a load is released.</li><li><strong>Diaphragm seal</strong> for corrosive, viscous or slurry media, or where the medium would attack the gauge’s wetted parts or plug the tube.</li><li><strong>Siphon</strong> on steam, to hold a water barrier between the steam and the gauge.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A filled gauge needs a blow-out device.',
      body: 'EN 837-1 requires liquid-filled gauges to have a blow-out device — code S1, or a full S2/S3 safety pattern where EN 837-2 calls for it (gas or steam above 25 bar). Do not seal over the blow-out plug or the vent.',
    },
    {
      type: 'decision_tree',
      heading: 'Filled or dry?',
      branches: [
        { condition: 'Oxygen or other strong oxidiser?', outcome: 'Dry, oxygen-clean gauge, or halocarbon fill. Never glycerine or silicone.' },
        { condition: 'Pump pulsation, vibration or shock loads?', outcome: 'Filled gauge, plus a snubber or throttle on severe pulsation.' },
        { condition: 'Very cold site or large temperature swings?', outcome: 'Silicone fill rather than glycerine.' },
        { condition: 'Range 100 psi or less, filled?', outcome: 'Vent the case, plug at 12 o’clock.' },
        { condition: 'Stable pressure, no vibration, high ambient?', outcome: 'A dry gauge is fine, and has the wider temperature range.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why are pressure gauges filled with glycerine?', answer: 'To damp pointer vibration from pumps and shock loads, protect the movement from wear and keep moisture out, which makes the gauge easier to read and last longer.' },
        { question: 'Can glycerine-filled gauges be used with oxygen?', answer: 'No. Glycerine and silicone fills can react, ignite or explode with oxygen and other strong oxidisers. Use a halocarbon fill or a dry, oxygen-clean gauge.' },
        { question: 'What is the difference between glycerine and silicone filled gauges?', answer: 'Silicone stays fluid at lower temperatures, so it suits cold sites and large temperature swings; glycerine is the common choice for general hydraulic and industrial service.' },
        { question: 'Why does my filled gauge not return to zero?', answer: 'On ranges of 100 psi or less, an unvented case is pressurised by the fill expanding with temperature. Vent the fill plug and mount it at 12 o’clock. If it still does not return to zero, the element may be damaged.' },
        { question: 'What temperature can a glycerine gauge take?', answer: 'It depends on the maker: Enerpac rates its glycerine gauges for about −20 to +60 °C; Ashcroft gives about −7 to +66 °C ambient. Check the gauge’s own data.' },
        { question: 'Is a filled gauge enough on a pulsating pump?', answer: 'Often, but on severe pulsation add a snubber, throttle screw or needle valve so the surges are damped before they reach the Bourdon tube.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Filled and dry gauges',
      skus: ['IH-DFC-CF-25-14NPT', 'IH-DFC-CF-25-71620SAE', 'IH-DFC-CDS-25-14NPT', 'IH-DFC-PDLC-4-14NPT', 'IH-GA-201L', 'IH-ENE-GAUGE-G25'],
    },
    { type: 'category_link', slug: 'ic-pressure-gauges', label: 'Pressure gauges', blurb: 'Dry and glycerine-filled, brass and all-stainless.' },
    {
      type: 'related_articles',
      slugs: ['pressure-gauge-guide', 'how-to-choose-a-pressure-gauge-range', 'high-pressure-hydraulic-gauges'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Fill behaviour, limits, venting and oxidiser rules from Enerpac and Ashcroft documents and SAMSON’s EN 837 note; limits quoted per maker because they differ.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a filled gauge?',
      body: 'Tell us the medium, the range, the site temperature and how much the line pulses. We will quote a filled or dry gauge with the snubber or valve it needs.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
