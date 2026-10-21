import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Hydraulic torque wrenches: square drive vs low-profile hexagon, sizing, accessories. Sources read 2026-10-21:
 * Enerpac Bolting Tools Catalog E415 (S-Series X-Edition and W-Series X-Edition tables, RSL/RSQ tables, PTW and ETW
 * pages, BSH sockets and socket standards, BUS back-up spanners, THQ hoses at 700 bar with 4:1 safety factor, the
 * theory pages: loosening up to 2½× tightening torque and no more than 75% of tool maximum when loosening,
 * corrosion multipliers, 10% minimum torque, "use only 80% of these ratings", ±3% accuracy, 690 bar rating) and
 * Enerpac Industrial Tools Catalog E330 (DSX and HMT tables).
 * NOT used: listing claims not in the catalogues; ETW torque per model beyond "up to 6,000 ft-lb".
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-torque-wrenches-guide',
  title: 'Hydraulic torque wrenches: square drive or low-profile, and how to size one',
  excerpt:
    'A hydraulic torque wrench is chosen by three things: the torque the joint needs, the nut size, and how much room there is around the nut. Square-drive wrenches take a standard impact socket and suit open access; low-profile hexagon wrenches slip a cassette over the nut where a socket will not fit. How each works, the torque ranges of the Enerpac series, the sizing rules for breakout, and the hoses, sockets and reaction arms that have to come with the tool.',
  categorySlug: 'hydraulic-tools-bolting',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Torque Wrenches: Square Drive vs Low Profile',
  seoDescription:
    'How hydraulic torque wrenches work and how to choose one: square-drive vs low-profile hexagon cassette wrenches, Enerpac S, W, DSX, HMT, RSL and RSQ torque ranges, breakout sizing, sockets, reaction arms and twin hoses.',
  focusKeyword: 'hydraulic torque wrench',
  publishedAt: '2026-10-21T23:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Enerpac rates its hydraulic wrenches at 10,000 psi (690 bar) with ±3% accuracy; output is set by pump pressure.',
        'Square-drive wrenches take an impact socket and need clearance above the nut; low-profile hexagon wrenches fit a cassette straight over the nut.',
        'Breaking a nut loose can take up to 2½ times its tightening torque — more if it is corroded — and Enerpac advises using no more than 75% of the tool’s maximum when loosening.',
        'Do not run a wrench below about 10% of its maximum; choose the smallest tool that covers the job with margin.',
        'The tool arrives with a pump, twin hoses, sockets or cassettes and a reaction point — specify all of them.',
      ],
    },
    {
      type: 'lead',
      html: 'Bolts on pressure flanges, wind towers, heavy machinery and structural steel are tightened to a torque that no person can apply with a bar. A hydraulic torque wrench does it with a piston and ratchet, driven by a 10,000 psi pump, and reacts the force against a neighbouring nut or a fixed point rather than against the operator. Choosing one is mostly a question of fit — the joint decides the tool far more often than the torque does.',
    },

    { type: 'section_head', number: '/01', title: 'How a hydraulic torque wrench works.', anchor: 'how' },
    {
      type: 'prose',
      html: '<p>Oil from the pump pushes a piston, which drives a ratchet through a short arc — 35° on Enerpac’s S-Series and DSX, 30° on the W-Series — then retracts and resets. The reaction arm or paddle braces against an adjacent nut, a flange edge or a fixed structure, so the force goes into the fastener rather than the operator’s hands. Torque is proportional to pump pressure: the wrench’s calibration certificate converts the gauge reading into torque, and Enerpac quotes accuracy of ±3% across the full stroke.</p><p>Enerpac’s safety rule for every wrench: hold the tool at its handle only, and never put any part of the body between the wrench and the reaction point.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Square drive or low-profile hexagon.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Enerpac hydraulic torque wrench series (catalogue figures at 10,000 psi)',
      columns: ['Series', 'Type', 'Torque range', 'Fits'],
      rows: [
        { cells: ['S-Series (X-Edition)', 'Square drive, steel', '1,440–26,150 ft-lb (1,952–35,455 Nm)', '3/4"–2-1/2" drive sockets'], highlight: true },
        { cells: ['DSX', 'Square drive, aluminium', '1,411–24,057 ft-lb (1,913–32,617 Nm)', '3/4"–2-1/2" drive sockets'] },
        { cells: ['RSQ', 'Square-drive head on RSL drive', '1,408–28,002 ft-lb (1,909–37,965 Nm)', '3/4"–2-1/2" drive sockets'] },
        { cells: ['W-Series (X-Edition)', 'Low-profile hexagon cassettes', '2,040–35,000 ft-lb (2,766–47,453 Nm)', '30–155 mm hex'], highlight: true },
        { cells: ['RSL', 'Low-profile hexagon cassettes', '1,408–28,002 ft-lb', '26–155 mm hex'] },
        { cells: ['HMT', 'Modular drive, HLP hex or HSQ square cassettes', '1,541–13,489 ft-lb (2,089–18,289 Nm)', '27–115 mm hex'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>Square drive</strong> wrenches take a heavy-duty impact socket on the drive and need room above the nut for the socket and the tool body. They are the general-purpose choice: one tool covers many nut sizes by changing the socket, and Allen (hex) drives let the DSX turn socket-head cap screws.</p><p><strong>Low-profile hexagon</strong> wrenches replace the socket with a slim cassette that slides over the nut from the side. They fit where a socket cannot — close to a flange neck, between bolts on a tight pitch, under a structure — and each cassette covers one nut size, so a job with several sizes needs several cassettes. Enerpac’s W-Series takes stepped-width UltraSlim cassettes for the tightest spaces.</p><p>Where there is no hydraulic supply, Enerpac’s <strong>PTW</strong> pneumatic wrenches (1,000–6,000 ft-lb) run on air regulated to 120 psi at 50 CFM, and its <strong>ETW</strong> electric wrenches (up to 6,000 ft-lb) store torque-and-angle settings and record each fastener.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Sizing the wrench to the joint.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<ol><li><strong>Start from the tightening torque</strong> in the joint procedure — it depends on bolt grade, size and lubricant, never on the tool.</li><li><strong>Allow for breakout.</strong> Enerpac: it can take up to 2½ times the tightening torque to break a nut loose, and corrosion raises it further — up to 2× for humidity, 2½× for sea water or chemicals and 3× for heat. When loosening, use no more than 75% of the tool’s maximum.</li><li><strong>Stay above the bottom of the range.</strong> Enerpac recommends a minimum of 10% of a wrench’s maximum rated torque.</li><li><strong>Keep margin.</strong> Enerpac’s general rule: ratings are maximum safe limits, and good practice uses only 80% of them.</li><li><strong>Check the access</strong> — nose radius for a square-drive tool, hex size and clearance for a cassette — and where the reaction arm will land.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Torque is not preload.',
      body: 'On a dry steel bolt Enerpac shows only about 10% of the applied torque turning into bolt load: about half is lost under the nut face and 40% in the threads. Lubricate the threads and the nut face with the lubricant the procedure names, or the same torque gives a different bolt load.',
    },

    { type: 'section_head', number: '/04', title: 'What has to arrive with the wrench.', anchor: 'kit' },
    {
      type: 'prose',
      html: '<ul><li><strong>Pump</strong> — a 10,000 psi torque-wrench pump with a gauge (electric, air or hand).</li><li><strong>Twin hoses</strong> — Enerpac THQ thermoplastic twin hoses, rated 700 bar with a 4:1 safety factor, in 6 ft, 19.5 ft and 39 ft lengths.</li><li><strong>Sockets</strong> — BSH heavy-duty impact sockets for 3/4", 1", 1-1/2" and 2-1/2" drives (19–155 mm). Enerpac specifies impact sockets to ISO 2725 and ISO 1174, DIN 3129 and DIN 3121, or ASME B107.2 — never hand sockets.</li><li><strong>Cassettes</strong> for low-profile tools, one per nut size.</li><li><strong>Reaction arms, paddles and extensions</strong> to reach a reaction point.</li><li><strong>Back-up spanners</strong> — BUS spanners hold the back nut so it does not turn; each fits two hex sizes from 27 to 120 mm.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure does a hydraulic torque wrench run at?', answer: 'Enerpac rates its hydraulic wrenches at a maximum of 10,000 psi (690 bar); torque is set by adjusting pump pressure against the calibration certificate.' },
        { question: 'Square drive or low-profile wrench?', answer: 'Square drive where there is room above the nut for a socket; low-profile hexagon cassettes where there is not — near flange necks, on tight bolt pitches or under structures.' },
        { question: 'How much bigger should the wrench be for loosening?', answer: 'Enerpac warns breakout can take up to 2½ times the tightening torque, and more with corrosion, and advises using no more than 75% of the tool’s maximum when loosening.' },
        { question: 'Can I use a normal socket on a hydraulic wrench?', answer: 'No. Use heavy-duty impact sockets made to ISO 2725/ISO 1174, DIN 3129/3121 or ASME B107.2.' },
        { question: 'How accurate is a hydraulic torque wrench?', answer: 'Enerpac quotes ±3% across the stroke for its hydraulic series, provided the tool is used with its calibration certificate and a calibrated gauge.' },
        { question: 'What is the smallest torque a wrench should be used for?', answer: 'Enerpac recommends no less than 10% of the wrench’s maximum rated torque.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Hydraulic, pneumatic and electric torque wrenches, and their sockets, cassettes, reaction arms, back-up spanners and hoses:</p>' + stockList(['hydraulic-torque-wrenches', 'torque-wrench-sockets-accessories']),
    },
    {
      type: 'product_embed',
      heading: 'Torque wrenches and accessories',
      skus: ['IH-ENE-TW-S', 'IH-ENE-TW-W', 'IH-ENE-TW-DSX', 'IH-ENE-TW-RSL', 'IH-ENE-TW-HMT', 'IH-ENE-BSH10', 'IH-ENE-THQ', 'IH-ENE-BUS'],
    },
    { type: 'category_link', slug: 'hydraulic-torque-wrenches', label: 'Hydraulic torque wrenches', blurb: 'Square-drive, low-profile hexagon, pneumatic and electric wrenches.' },
    { type: 'category_link', slug: 'torque-wrench-sockets-accessories', label: 'Sockets and accessories', blurb: 'Impact sockets, cassettes, reaction arms, back-up spanners and twin hoses.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Flange bolting on pipelines, plants and rigs.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'enerpac-e415', text: 'Enerpac. Bolting Tools Catalog E415 (EN-US).', url: 'https://vault.enerpac.com/m/70e0e0d9d5787fed/original/Enerpac_Bolting_Tools_Catalog_E415_EN-US.pdf' },
        { id: 'enerpac-e330', text: 'Enerpac. Industrial Tools Catalog E330 (EN-US).', url: 'https://vault.enerpac.com/m/633ff0c42dd24838/original/Enerpac_Industrial_Tools_Catalog_E330_EN-US.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['bolt-tensioning-nut-splitters-and-flange-tools', 'anti-seize-and-assembly-pastes', 'stainless-steel-flanges-asme-b16-5', 'high-pressure-hydraulic-cylinders-and-pumps', 'high-pressure-hydraulic-gauges'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Torque ranges, ratings, sizing rules and accessories from Enerpac catalogues E415 and E330.',
    },
    {
      type: 'cta_block',
      heading: 'Need a torque wrench for a job?',
      body: 'Send the bolt size and grade, the tightening torque, the nut size and a photo of the access around the joint. We will quote the wrench, pump, hoses and sockets or cassettes as one kit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
