import type { BlogArticleSeed } from '../shared'

/**
 * Recovery winches for tow trucks. Checked 2026-10-21 against Dinamic Oil's towing / recovery winch catalogue (T19/A)
 * and pulling-winch manual: T27 IN to T300, 2,700–30,000 daN first layer, 10–26 mm cable, orbit motor with pilot
 * overcentre valve, negative multi-disc brake, manual / pneumatic / hydraulic drum freewheel, B tensioner, C2
 * fairlead, C1 both, four rotation and cable-exit arrangements, 5 wraps minimum, 5 bar return back-pressure, not for
 * lifting people, S10AR 6x36 WS IWRC cable to ISO 2408, oil ISO VG 150, first change 500 h then yearly.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'recovery-winch-for-tow-trucks',
  title: 'Choosing a recovery winch for tow trucks: pull, cable, freewheel and fairlead',
  excerpt:
    'A recovery winch is sized on the pull it needs on the layer it works from, then fitted out for the job: freewheel to walk the cable out, a fairlead for angled pulls, and the right cable. How to choose one, with Dinamic Oil’s T series as the worked example.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Recovery Winch for Tow Trucks: Pull, Cable, Freewheel',
  seoDescription:
    'Choosing a recovery winch for tow trucks: line pull per layer, snatch blocks, cable size and construction, drum freewheel, fairlead, tensioner and hydraulics.',
  focusKeyword: 'recovery winch for tow trucks',
  publishedAt: '2026-10-21T00:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Size the winch on the pull it must deliver on the working layer; the first-layer rating is the highest.',
        'A snatch block on the casualty roughly doubles the available pull at half the cable speed.',
        'A drum freewheel lets the operator walk the cable out without running the hydraulics.',
        'A fairlead guides the cable on angled pulls; a tensioner keeps it spooling tight with no load.',
        'Recovery winches pull; they must never be used to lift or carry people.',
      ],
    },
    {
      type: 'lead',
      html: 'On a tow truck or recovery body, the winch does the work the crane cannot: dragging a vehicle out of sand, a ditch or a wadi, or up onto a bed. The pull needed depends less on the vehicle’s weight than on what holds it — a stuck truck in soft sand can need more pull than its own weight. Choosing the winch means sizing that pull and then fitting it for how it will be used.',
    },

    { type: 'section_head', number: '/01', title: 'Size the pull.', anchor: 'pull' },
    {
      type: 'paragraph',
      html: 'Recovery winches are rated by their first-layer line pull. Dinamic Oil’s T series runs from 2,700 daN (T27 IN) to 30,000 daN (T300) on 10 to 26 mm cable. As the cable builds up on the drum, pull falls and speed rises, so check the datasheet’s figure for the layer the winch will really be working from — with most of the cable paid out, that is usually one of the first two. A single snatch block anchored to the casualty and the cable returned to the truck roughly doubles the pull, at half the cable speed, less the sheave’s losses.',
    },
    {
      type: 'direct_answer',
      question: 'How much winch pull does a recovery truck need?',
      answer:
        'It depends on what holds the vehicle, not just its weight: on a firm, level surface the pull is a fraction of the weight, but a vehicle bogged in sand or mud can need a pull approaching its own weight. Size the winch on its working-layer pull and use a snatch block to double it for heavy recoveries.',
    },

    { type: 'section_head', number: '/02', title: 'Fit it for the job.', anchor: 'fit' },
    {
      type: 'comparison_table',
      caption: 'Recovery winch options (Dinamic Oil T series)',
      columns: ['Option', 'What it does', 'When to choose it'],
      rows: [
        { cells: ['Drum freewheel', 'Disconnects the drum so the cable can be pulled out by hand', 'Always on recovery work; manual, pneumatic or hydraulic'], highlight: true },
        { cells: ['Fairlead (C2)', 'Guides the cable with horizontal and vertical rollers', 'Pulls at an angle to the truck'] },
        { cells: ['Cable tensioner (B)', 'Presses the cable onto the drum when there is no load', 'Even spooling when rewinding slack cable'] },
        { cells: ['Rotation and exit', 'Clockwise or counterclockwise, cable over or under the drum', 'To suit where the winch sits on the body'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Every T series winch has an orbit hydraulic motor with a pilot-operated overcentre valve mounted on it, so the load cannot run the cable back, and a negative multi-disc brake that locks the drum whenever the motor stops. The motor, brake and planetary gearbox are separate modules on the drum, which keeps installation and maintenance simple.',
    },

    { type: 'section_head', number: '/03', title: 'Cable and care.', anchor: 'cable' },
    {
      type: 'paragraph',
      html: 'Use the cable diameter the winch is built for, in a construction made for drums: Dinamic Oil recommends 6x36 Warrington Seale with a steel core (IWRC) to ISO 2408, 2,160 N/mm² wire, with a thimble and pressed-sleeve end. Keep at least five wraps on the drum. Run the winch from a pump that delivers its rated flow at its pulling pressure, keep the return-line back-pressure under 5 bar, and check the gear oil level every 250 hours — first change at 500 hours, then once a year.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Pulling only.',
      body: 'A recovery winch is designed and rated for horizontal pulling. Never use it to lift a load or to carry people.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I fit a bigger cable for more strength?', answer: 'No. The drum, brake and rating are built around the listed cable diameter; a larger cable reduces capacity and spools badly.' },
        { question: 'Why does the winch need an overcentre valve?', answer: 'It holds the load against the motor, so a vehicle on a slope cannot drag the cable back out when the operator stops.' },
        { question: 'How fast is a recovery winch?', answer: 'Slow by design: 4.5 to 12 m/min on the first layer across the T series, faster on outer layers.' },
        { question: 'Is a pneumatic freewheel worth it?', answer: 'On trucks with an air system it saves the operator climbing up to the winch to disengage the drum.' },
        { question: 'What oil does it use?', answer: 'Gear oil ISO VG 150 in the gearbox, checked every 250 hours and changed yearly after the first 500 hours.' },
      ],
    },
    { type: 'product_embed', heading: 'Recovery winches', skus: ['IH-DO-T', 'IH-DO-WACC'] },
    { type: 'category_link', slug: 'towing-recovery-winches', label: 'Towing and recovery winches', blurb: 'Dinamic Oil T series, 2,700 to 30,000 daN.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Site vehicles and recovery.' },
    { type: 'related_articles', slugs: ['hydraulic-winch-sizing', 'wire-rope-construction-explained', 'truck-crane-hydraulic-hose'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-21', note: 'Range, construction, options, cable and service intervals from Dinamic Oil’s towing winch catalogue and manual.' },
    {
      type: 'cta_block',
      heading: 'Specifying a recovery winch?',
      body: 'Send the truck, the heaviest casualty, the cable length you need and the pump flow and pressure. We will propose the Dinamic Oil T series size and options.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
