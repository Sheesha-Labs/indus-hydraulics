import type { BlogArticleSeed } from '../shared'

/**
 * Oteco PRV (shear-pin) vs RRV (Type RR reset) relief valves. Sources: _faq/facts/oteco-relief-valves.json
 * (listings IH-OTC-PRV-2, PRV-3, PRV-PINS, PRV-SPARES, RRV-2-5K, RRV-3-5K, RRV-3-8K, RRV-KITS, RRV-PARTS: set
 * ranges, accuracy, pin table, EB-001/EB-003/EB-004 statements, DNV/ABS wording, interchange statements,
 * RRV general-information table) and _raw/brochure-review.md sections 6 (Oteco PRV brochure) and 9
 * (Oteco RRV brochure), 8 (Oteco products overview).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'shear-pin-vs-reset-relief-valve',
  title: 'Shear-pin or reset relief valve: protecting a mud pump with a PRV or an RRV',
  excerpt:
    'Oteco makes two relief valves for mud pumps and manifolds. The PRV opens when a calibrated shear pin breaks and must be re-pinned. The RRV snaps open at its set pressure, can be opened by hand and needs no pins. How each works, how the set pressure is chosen, and which to specify.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Shear Relief Valve or Reset: PRV vs RRV',
  seoDescription:
    'Oteco PRV shear-pin and RRV reset relief valves compared for mud pumps: set pressure, accuracy, pins, resetting, sizes, approvals and which to choose.',
  focusKeyword: 'shear relief valve',
  publishedAt: '2026-11-19T11:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The PRV is a shear-pin relief valve. A calibrated pin breaks at the set pressure and the valve opens fully. Oteco gives its accuracy as about ±10 %, and the pin must be replaced after every relief.',
        'The RRV (Type RR) is a manual reset valve with no pins. It snaps fully open at the set pressure, can be opened by hand with a release button, and has an accuracy of about ±5 %.',
        'Set pressure on the PRV is chosen by pin number and by the number of pins. On the RRV it is set on one adjusting nut and read on an indicator.',
        'Oteco states that PRV parts interchange with Cameron-style shear relief valve parts, and that the RRV bonnet assembly interchanges with Cameron Type A and B.',
        'Whichever you fit, the discharge line must be rated for the full inlet pressure and anchored against the reaction force.',
      ],
    },
    {
      type: 'lead',
      html: 'A mud pump cannot be allowed to run against a closed line. The relief valve is the last protection between a blocked discharge and a burst manifold, and it has to open when it should, every time. Oteco makes two designs for the job. They protect the same equipment but behave differently after the valve has relieved, and that difference is what you are choosing between.',
    },

    { type: 'section_head', number: '/01', title: 'How the PRV (shear-pin) valve works.', anchor: 'prv' },
    {
      type: 'paragraph',
      html: 'In the <a href="/p/oteco-prv-shear-pin-relief-valve-2-inch">2-inch</a> and <a href="/p/oteco-prv-shear-pin-relief-valve-3-inch">3-inch</a> PRV, a calibrated shear pin holds the valve shut. When line pressure reaches the set point the pin breaks and the valve opens fully to relieve the pump. The relief pressure is set by the number and grade of the pins. A metal chart on every valve gives the pin for each set point, and a quick-release safety cover gives fast access to replace the pin afterwards. Oteco pins are precision ground and destructively tested in production, which gives the repeatable set point, about ±10 %. Stems and liner subs are hardened stainless steel.',
    },
    {
      type: 'paragraph',
      html: 'The pins are colour-coded and sold in packs of ten: <a href="/p/oteco-prv-shear-pins">#3 brown up to #60 orange</a>. As an example, the 2-inch 21050 relieves at 1,000 psi with a single #16 blue pin and at 2,500 psi with a #60 orange pin; with two pins the range doubles, from 2,000 to 5,000 psi. Oteco warns that nails or improvised pins cannot give an accurate relief pressure, and says to replace the pin after every relief, with the safety cover closed before the pump is restarted (Oteco Engineering Bulletin EB-003).',
    },

    { type: 'section_head', number: '/02', title: 'How the RRV (reset) valve works.', anchor: 'rrv' },
    {
      type: 'paragraph',
      html: 'The Type RR valve does the same job without a pin. When pressure passes the set point, the valve snaps fully open; it can also be opened by hand with the release button, and the button position shows whether the valve is open or closed. The set pressure is read on an indicator (psi, bar or kPa scales) and adjusted by turning one nut on top. Vibration does not move the setting, and the fully enclosed bonnet keeps its grease. The piston is stainless steel and the subs are cadmium plated.',
    },
    {
      type: 'paragraph',
      html: 'The RRV comes in <a href="/p/oteco-reset-relief-valve-2-inch-5000-psi">2-inch</a> and <a href="/p/oteco-reset-relief-valve-3-inch-5000-psi">3-inch</a> versions for 400 to 5,000 psi, and a <a href="/p/oteco-reset-relief-valve-3-inch-8000-10000-psi">heavy 3-inch</a> for 3,000 to 8,000 psi and 4,000 to 10,000 psi. Oteco states that this high-pressure design was verified at an independent laboratory and on pumps from 700 to 3,000 hp.',
    },

    { type: 'section_head', number: '/03', title: 'Side by side.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Oteco PRV and RRV compared (from the Oteco brochures)',
      columns: ['Feature', 'PRV (shear pin)', 'RRV (Type RR reset)'],
      rows: [
        { cells: ['Sizes', '2 and 3 in', '2 and 3 in'] },
        { cells: ['Set range, nominal', '125 to 10,000 psi across the models', '400 to 10,000 psi across the models'] },
        { cells: ['How it is set', 'By pin number and number of pins', 'One adjusting nut, read on an indicator'] },
        { cells: ['Accuracy', 'About ±10 %', 'About ±5 %'] },
        { cells: ['After it relieves', 'Fit a new pin, close the cover', 'Reset it; no pins to replace'] },
        { cells: ['Manual opening', 'No', 'Yes, release button'] },
        { cells: ['Flow area', 'Not published', '1.8 in² (2 in), 4.2 in² (3 in, 5,000 psi), 4.9 in² (3 in, 8,000 psi)'] },
        { cells: ['Temperature', 'Nameplate example: 250 °F maximum', '−20 °F to 250 °F'] },
        { cells: ['Published interchange', 'Cameron-style shear relief valve parts', 'Bonnet assembly: Cameron Type A and B'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Cameron is a trademark of its owner. Oteco also rebuilds or exchanges worn Oteco, Cameron Type A and Type B reset relief valve bonnet assemblies.',
    },

    { type: 'section_head', number: '/04', title: 'Which one to specify.', anchor: 'choose' },
    {
      type: 'prose',
      html: '<ul><li><strong>Choose the PRV</strong> where a low-cost, simple valve is wanted and the crew is used to re-pinning. Its pressure range covers 125 to 10,000 psi, including low-pressure models, and spare parts and kits are listed for every model.</li><li><strong>Choose the RRV</strong> where you want to avoid a pin change after each trip, want tighter accuracy, or want to open the valve by hand. Its set pressure can be read and adjusted on site.</li><li><strong>High-pressure pumps</strong> up to 10,000 psi: both families have models here. Compare the set ranges in the listings against your pump’s working pressure.</li><li><strong>Approvals:</strong> Oteco states DNV type approval on selected PRV union models, and ABS design assessment and DNV approval on selected RRV models. Check the model number against the approval you need, because it applies to named models, not the whole range.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Install it so that a relief is safe.',
      body: 'Oteco Engineering Bulletin EB-001 covers relief-valve piping. The discharge line must be rated for the full inlet pressure, anchored against the reaction force when the valve opens, and routed so the discharge stream cannot reach people or the environment. Where a line-pipe valve is listed with an end connection rated below the valve, the connection limits the working pressure.',
    },
    {
      type: 'paragraph',
      html: 'Hammer-union versions have a Figure 1502 female inlet and male outlet, made to mate with FMC Weco unions (Oteco Engineering Bulletin EB-004). Weco is a trademark of its owner. For the wider picture of relief valve types see <a href="/blog/oilfield-pressure-relief-valves">oilfield pressure relief valves</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Do I replace the shear pin after every relief?', answer: 'Yes. Oteco says to replace the pin after every relief, with the safety cover closed before the pump is restarted (Engineering Bulletin EB-003).' },
        { question: 'What is in a PRV repair kit?', answer: 'A minor repair kit holds a stem cushion, a piston and an O-ring. A major kit adds the stem. Kits are listed by model.' },
        { question: 'Can I use ordinary pins or nails in a PRV?', answer: 'No. Oteco warns that improvised pins cannot give an accurate relief pressure. Use Oteco pins of the right number for the set point on the valve’s chart.' },
        { question: 'Can a reset relief valve be opened by hand?', answer: 'Yes. The RRV has a release button, and the button position also shows whether the valve is open or closed.' },
        { question: 'Do you supply rebuilt RRVs?', answer: 'Oteco offers rebuilt exchange valves, listed among the RRV spare parts, and rebuilds worn Oteco, Cameron Type A and Type B bonnet assemblies.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'PRV and RRV valves, pins and kits',
      skus: ['IH-OTC-PRV-2', 'IH-OTC-PRV-3', 'IH-OTC-PRV-PINS', 'IH-OTC-RRV-2-5K', 'IH-OTC-RRV-3-5K', 'IH-OTC-RRV-3-8K', 'IH-OTC-RRV-KITS'],
    },
    { type: 'category_link', slug: 'oilfield-pressure-relief-valves', label: 'Pressure relief valves', blurb: 'Oteco PRV shear-pin and RRV reset relief valves, pins, kits and parts.' },
    {
      type: 'related_articles',
      slugs: ['oilfield-pressure-relief-valves', 'oteco-drilling-equipment-guide', 'hammer-union-figure-numbers', 'mud-pump-pistons-explained', 'flow-iron-explained'],
    },
    {
      type: 'cta_block',
      heading: 'Specifying a relief valve?',
      body: 'Send the pump pressure, set point, size and end connections, or the Oteco part number. We keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
