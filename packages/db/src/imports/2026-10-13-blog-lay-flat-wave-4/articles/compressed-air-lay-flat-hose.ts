import type { BlogArticleSeed } from '../shared'

/**
 * Lay flat compressed air hose for mining, quarrying and construction, and air-hose safety.
 * Checked 2026-10-14: OSHA 29 CFR 1926.302(b)(1), (b)(4), (b)(7) and 1910.242(b); MSHA 30 CFR
 * 56.13021 / 57.13021; MSHA fatality report (1999); HSE HSG39 and GS4; WorkSafe WA prosecution
 * (2021). Typical rock-drill pressures given as typical, not regulatory. Product facts from
 * IH-LF-TCA — no pressure table published.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'compressed-air-lay-flat-hose',
  title: 'Lay flat compressed air hose for mines, quarries and sites — and how to keep it safe',
  excerpt:
    'Compressed air drives rock drills, breakers and pumps on mine benches, in tunnels and on construction sites — and a long air main of lay flat hose is quicker to run out and recover than rigid pipe. But air stores energy: a failed hose or coupling whips with lethal force. Where lay flat air hose fits, how to size it, and the rules on safety devices, whip checks and restraints from OSHA, MSHA and HSE.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Compressed Air Hose: Mining Use and Safety Rules',
  seoDescription:
    'Lay flat compressed air hose for mines, quarries and construction: where it fits, typical pressures, sizing for pressure drop, and safety rules — OSHA 1926.302 safety devices, MSHA 56.13021 locking devices, whip checks and air fuses.',
  focusKeyword: 'compressed air lay flat hose',
  publishedAt: '2026-10-14T07:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lay flat air hose suits long compressor-to-manifold mains that move often: it rolls flat, deploys fast and recovers onto a reel.',
        'Rock drills and air tools typically run at around 6 to 8 bar (90 to 120 psi); rate hose and couplings for the compressor’s maximum, not the tool’s.',
        'Air stores energy. A hose or coupling that fails under pressure whips — restrain every joint.',
        'OSHA requires a pressure-reducing safety device at the supply for air hose over 1/2" ID; MSHA requires safety chains or locking devices on high-pressure hose connections of 3/4" ID or larger.',
        'Bleed lines before any work on them, and never point compressed air at people.',
      ],
    },
    {
      type: 'lead',
      html: 'On a quarry bench or in a development tunnel, compressed air is the power supply. A compressor at the edge of the work feeds a main to a manifold, and short hoses run from there to rock drills, breakers, air-powered pumps and tools. Rigid air pipe is permanent and slow to move; round rubber hose is heavy in the large sizes a long main needs. A <strong>lay flat air hose</strong> rolls flat on a reel, is run out in minutes, and comes back up when the face moves on.',
    },

    { type: 'section_head', number: '/01', title: 'Where lay flat air hose fits.', anchor: 'where' },
    {
      type: 'prose',
      html: '<ul><li><strong>Compressor-to-manifold mains</strong> on mining and quarry benches.</li><li><strong>Temporary air supply</strong> on construction and plant shutdown work.</li><li><strong>Tunnel and development headings</strong> where the air line advances with the face.</li><li><strong>Industrial air distribution</strong> where a line must be moved often.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/tpu-lay-flat-compressed-air-hose">lay flat compressed air hose</a> has a rubber/TPU tube, a circular-woven polyester jacket and a TPU cover that resists abrasion, oil and weather, in red for identification. A per-size pressure table is not published for this line, so send the bore, length, compressor pressure and end connections and we will confirm the rating. The short whip hoses to the tools themselves are normally round air hose, not lay flat.',
    },

    { type: 'section_head', number: '/02', title: 'Pressure and sizing.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'Pneumatic rock drills and breakers typically run at about 6 to 8 bar (90 to 120 psi), but a compressor can deliver more, and the main sees the compressor’s maximum when tools stop. Rate the hose and every coupling for the highest pressure the compressor can deliver, with margin. Then size the bore for <strong>pressure drop</strong>: an air tool starved by a long, narrow main runs slowly and wears faster. Long mains, several tools and high air demand all call for a larger bore — send the compressor output and the tools’ air consumption and we will size it.',
    },
    {
      type: 'direct_answer',
      question: 'Can lay flat hose be used for compressed air?',
      answer:
        'Yes, if it is built and rated for air. A lay flat compressed air hose suits long compressor-to-manifold mains that move often. Rate it and its couplings for the compressor’s maximum pressure, restrain every joint with whip checks or locking devices, and fit a safety device at the supply that cuts pressure if the hose fails.',
    },

    { type: 'section_head', number: '/03', title: 'Why air hose is dangerous.', anchor: 'hazard' },
    {
      type: 'paragraph',
      html: 'Water in a burst hose stops pushing almost at once; compressed air keeps expanding. A hose or coupling that separates under air pressure whips and snakes with enough force to kill. The record is clear. In a 1999 MSHA fatality at an underground mine, a 4-inch air line at about 120 psi blew off its valve during repairs; there was no shutoff valve or safety chain, and the line had not been bled. In 2018, on an Australian tunnelling project, an unrestrained 6-inch compressed-air hose detached and caused a traumatic brain injury — the contractor’s own method statement called for whip checks, and none were fitted. The company was fined AUD 200,000.',
    },

    { type: 'section_head', number: '/04', title: 'What the rules require.', anchor: 'rules' },
    {
      type: 'comparison_table',
      caption: 'Compressed air hose safety rules (as published)',
      columns: ['Rule', 'Requirement'],
      rows: [
        { cells: ['OSHA 29 CFR 1926.302(b)(7) — US construction', 'Hoses over 1/2" inside diameter must have a safety device at the source of supply or branch line to reduce pressure if the hose fails'], highlight: true },
        { cells: ['OSHA 1926.302(b)(1)', 'Pneumatic tools must be secured to the hose or whip by a positive means so they cannot disconnect accidentally'] },
        { cells: ['OSHA 1910.242(b) and 1926.302(b)(4)', 'Compressed air for cleaning reduced to less than 30 psi, with chip guarding and PPE'] },
        { cells: ['MSHA 30 CFR 56.13021 / 57.13021 — US mines', 'Except where automatic shutoff valves are used, safety chains or other locking devices at connections of high-pressure hose lines of 3/4" ID or larger where failure would create a hazard'] },
        { cells: ['HSE HSG39 — UK', 'Restrain or shield hoses where failure would be hazardous; fit hose-rupture valves (air fuses) as close as practicable to the connector'] },
      ],
    },
    {
      type: 'prose',
      html: '<ol><li><strong>Fit an excess-flow valve (air fuse)</strong> at the supply or branch, so pressure drops if the hose fails.</li><li><strong>Restrain every joint</strong> with a whip check across the coupling, or use couplings with safety locking clips.</li><li><strong>Bleed the line</strong> before disconnecting or working on it — never break a pressurised coupling.</li><li><strong>Inspect before every shift</strong>: cover damage, kinks and coupling wear.</li><li><strong>Protect road crossings</strong> and keep hose clear of moving plant.</li><li><strong>Never point compressed air at people</strong> or use it to clean clothing or skin.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Follow your site rules.',
      body: 'These summarise published US and UK rules and guidance. Your country’s regulations, the mine or site operator’s procedures and the compressor maker’s instructions take precedence.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure do rock drills run at?', answer: 'Typically about 6 to 8 bar (90 to 120 psi), though compressors can deliver more. Rate the hose for the compressor’s maximum.' },
        { question: 'Is a whip check required on air hose?', answer: 'MSHA requires safety chains or other locking devices on high-pressure hose connections of 3/4" ID or larger where failure would be hazardous, unless automatic shutoff valves are used; HSE guidance calls for restraint where failure would be hazardous. Whip checks are the common way to meet both.' },
        { question: 'What is an air fuse?', answer: 'An excess-flow or hose-rupture valve that closes when flow suddenly rises, as it does when a hose fails downstream. OSHA requires a pressure-reducing safety device at the supply for air hose over 1/2" ID.' },
        { question: 'Can I use water lay flat hose for compressed air?', answer: 'No. Use hose built and rated for compressed air, with couplings rated for the same pressure.' },
        { question: 'What pressure is your air hose rated for?', answer: 'A per-size table is not published for this line. Send the bore, length, compressor pressure and end connections and we will confirm it.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Compressed air hose',
      skus: ['IH-LF-TCA', 'IH-LF-CHP', 'IH-LF-EPW'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Including lay flat compressed air hose for mining and construction.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'poland',
      label: 'Hose supply to Poland',
      blurb: 'Air and dewatering hose for Polish mines and quarries.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'norway',
      label: 'Hose supply to Norway',
      blurb: 'Air and water hose for Norwegian tunnelling.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Hose supply to Saudi Arabia',
      blurb: 'Air hose for Saudi mining and construction.',
    },
    {
      type: 'related_articles',
      slugs: ['mine-dewatering-lay-flat-hose', 'lay-flat-hose-couplings-guide', 'why-lay-flat-hose-fails', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'OSHA 29 CFR 1926.302 and 1910.242; MSHA 30 CFR 56.13021 and 57.13021 and a 1999 MSHA fatality report; HSE HSG39; WorkSafe WA (2021). Typical pressures are not regulatory figures.',
    },
    {
      type: 'cta_block',
      heading: 'Running an air main?',
      body: 'Send the compressor output and pressure, the main length and the tools. We will size the hose and confirm the rating and couplings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
