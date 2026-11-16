import type { BlogArticleSeed } from '../shared'

/**
 * Lifting bars for air handling units: base-lifted HVAC plant without lifting lugs. Written to sit beside
 * /blog/lifting-chillers-and-rooftop-plant (general rooftop rigging) without competing with it: this one
 * is about the bar through the base and its status as a lifting accessory. UAE rules as verified for
 * /blog/lifting-equipment-inspection-uae: Abu Dhabi CoP 34 v4.1 (SWL marking, unmarked accessories out of
 * service, 6-month thorough examination of accessories by QCC-approved third parties), Dubai GU48
 * (EIAC-accredited third-party certification; EIAC-certified riggers). Stability argument as in
 * ./centre-of-gravity-in-lifting.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-bars-for-air-handling-units',
  title: 'Lifting bars for air handling units: why a pipe through the base is not lifting equipment',
  excerpt:
    'Many air handling units arrive with holes or fork pockets in the base frame and no lifting lugs. The bar pushed through those holes is a lifting accessory, with everything that implies: a design, a marked SWL, a certificate and periodic examination. What a proper bar set looks like, why one bar is not enough, and who has to provide it.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting Bars for Air Handling Units',
  seoDescription:
    'How to lift air handling units without lifting lugs: why the bar through the base is a lifting accessory, what a certified bar set needs, and who supplies it.',
  focusKeyword: 'air handling units',
  publishedAt: '2026-11-16T13:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Many air handling units (AHUs) have holes or fork pockets in the base frame instead of lifting lugs. The rigging label may name a bar size, but the bar is rarely supplied with the unit.',
        'A bar that is put through the base for the lift and taken out afterwards is not part of the load. It is a lifting accessory: it needs a design, a marked SWL and identification, a certificate and periodic thorough examination.',
        'A length of pipe from the yard has none of those, and in Abu Dhabi an unmarked accessory must be taken out of service.',
        'Use two bars, not one: a unit lifted on a single bar through its base can roll over about it. Hang the bars from a spreader frame or one-over-two beams so the legs stay vertical and clear of the casing.',
        'Price the bar set into the tender. It is a small, reusable item, but it is made to order and has a lead time.',
      ],
    },
    {
      type: 'lead',
      html: 'Lifting an air handling unit onto a roof is routine work on any commercial building, which is exactly why the rigging below the unit rarely gets questioned. The unit arrives on a trailer with two holes through each side of its base frame, a crane is on site, and someone finds two lengths of thick pipe that fit the holes. It may work for years. It is still an uncertified lifting accessory under a heavy, top-heavy load, lifted over a building — and the question of who should have provided something better usually comes up only after something goes wrong.',
    },
    {
      type: 'direct_answer',
      question: 'How do you lift an air handling unit without lifting points?',
      answer:
        'Through the base-frame lifting holes the maker designates, with rated, marked and certified lifting bars sized to those holes — two bars, so the unit cannot roll about a single one — hung from a spreader frame or spreader beams so the slings hang vertically and clear of the casing, following the maker’s rigging instructions and a written lift plan.',
    },

    { type: 'section_head', number: '/01', title: 'Why there are no lugs.', anchor: 'no-lugs' },
    {
      type: 'paragraph',
      html: 'AHUs are built in sections on a base frame, and the frame is designed for shipping and standing on a plinth. Some units come with lifting lugs; many have fork pockets for the truck and depot, or profiled holes through the frame rails meant for a bar. The rigging sheet may show the holes and give a bar diameter, sometimes a minimum spreader length — but the bar, and whatever hangs it from the crane, is left to the installer. That handover is where the gap opens.',
    },

    { type: 'section_head', number: '/02', title: 'Part of the load, or lifting equipment?', anchor: 'status' },
    {
      type: 'paragraph',
      html: 'The distinction matters because the rules for lifting equipment apply to the equipment, not the load. A lug welded to the base frame by the unit maker is part of the load: the maker designed it, and it stays on the unit. A bar slid through the base for the lift and pulled out afterwards is not. It is detachable, it can be used on the next unit and the one after, and it sits between the crane and the load — which makes it a lifting accessory, in the same class as a shackle or a spreader beam.',
    },
    {
      type: 'prose',
      html: '<p>As a lifting accessory, a bar needs what any other accessory needs:</p><ul><li><strong>A design</strong> for the load, the span between the slings and the way it bears in the base frame, by someone competent to do it, with the calculation kept.</li><li><strong>Marking</strong> — its SWL and an identification number, on the bar.</li><li><strong>A certificate</strong> that ties that number to its rating and its proof test.</li><li><strong>Periodic thorough examination</strong> while it is in service.</li></ul><p>In Abu Dhabi, CoP 34 requires every lifting accessory to show its SWL and takes an unmarked accessory out of service; accessories are thoroughly examined every 6 months by a QCC-approved third party. In Dubai, lifting equipment is certified by an EIAC-accredited third party, and riggers are EIAC-certified. A pipe from the yard fails on every point. See <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A load test is not a certificate.',
      body: 'Proof-loading a length of pipe once does not make it lifting equipment. Without a design for the load case, a marked SWL and identification, and a certificate tied to that mark, the bar is still unmarked and uncertified — and its next use is on a different unit.',
    },

    { type: 'section_head', number: '/03', title: 'What goes wrong with the usual methods.', anchor: 'methods' },
    {
      type: 'comparison_table',
      caption: 'Ways AHUs get lifted when there are no lugs',
      columns: ['Method', 'What goes wrong'],
      rows: [
        { cells: ['Basket slings under the base', 'Slings crush the casing and coil edges, can slide along the base, and do not hold the unit square'] },
        { cells: ['Slings threaded through fork pockets', 'Pockets are built for forks, not a sling’s point load; edges cut slings'] },
        { cells: ['One pipe through the base', 'Uncertified, unmarked, unknown capacity — and the unit can roll about it'] },
        { cells: ['Two pipes, slings to one hook', 'Still uncertified; angled slings squeeze the casing and pull the bars inward'] },
        { cells: ['Rated bar set from a spreader frame', 'The method to use'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two physical problems sit under that list. First, stability: a unit lifted at two points can rotate about the line joining them, and when those points are in the base the centre of gravity is above that line, so the unit is balanced like a pencil on its point. That is why one bar is never enough — see <a href="/blog/centre-of-gravity-in-lifting">centre of gravity in lifting</a>. Second, squeeze: slings converging on one hook pull inward on the bar ends and press against the casing. The force is worked out in <a href="/blog/sling-angle-compression-force">sling angle compression force</a>.',
    },

    { type: 'section_head', number: '/04', title: 'What a proper bar set looks like.', anchor: 'right-way' },
    {
      type: 'prose',
      html: '<ul><li><strong>Two bars</strong>, one through each pair of base holes, so the unit is held at four points and cannot roll.</li><li><strong>Sized to the holes</strong> the maker designates, long enough to stand clear of the casing on both sides, with collars, pins or end plates so the sling eyes cannot slide off and the bar cannot slide out.</li><li><strong>Hung vertically</strong> from a <a href="/p/modular-spreader-frames">spreader frame</a>, or from two spreader beams under a third (a one-over-two system), so the four legs hang straight down and never touch the unit.</li><li><strong>Rated, marked and certified</strong> as an accessory — and a bar set can be designed to cover a family of unit sizes, so one set serves the whole project.</li><li><strong>Checked against the base frame.</strong> The bar loads the frame rail at the hole; the unit maker should confirm the frame takes the lift that way.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Rooftop rigging beyond the base — crane sizing, critical lifts, tag lines, moving the unit across the roof — is covered in <a href="/blog/lifting-chillers-and-rooftop-plant">lifting chillers and rooftop plant</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Who is responsible.', anchor: 'responsibility' },
    {
      type: 'prose',
      html: '<p>Each party tends to assume someone else covered it. The unit maker specifies the holes but does not supply the bar; the installer follows the maker’s sheet and assumes that is enough; the rigging crew uses what is on site. In practice:</p><ul><li><strong>The unit maker</strong> should state how the unit may be lifted, where, and what the base frame can take.</li><li><strong>The installer or lifting contractor</strong> plans the lift — through a competent lift planner — and provides lifting equipment that is fit for it.</li><li><strong>The user</strong> — the rigger or crew using the equipment — checks before each lift that every item is marked, certified and in date, and refuses anything that is not.</li></ul><p>The cost is small next to the unit, but the bars and frame are made to order, so the time to raise it is when the lifting points are first reviewed — at tender, not on the morning the crane arrives.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a lifting bar through an AHU base part of the load?', answer: 'No, if it is removed after the lift. A detachable, reusable bar between the crane and the load is a lifting accessory and needs a marked SWL, identification, a certificate and periodic thorough examination.' },
        { question: 'Can I use a length of pipe as a lifting bar?', answer: 'Not unless it has been designed for the lift, marked with its SWL and identification, and certified as lifting equipment. A pipe of unknown grade and wall thickness is none of those.' },
        { question: 'Why use two lifting bars instead of one?', answer: 'A unit lifted on one bar through its base can roll over about the bar, because its centre of gravity is above it. Two bars hold it at four points.' },
        { question: 'Why hang the bars from a spreader frame?', answer: 'So the slings hang vertically and clear of the casing. Slings converging on one hook pull the bar ends inward and press into the unit’s panels.' },
        { question: 'Who should supply the lifting bars for an AHU?', answer: 'Usually the installer or lifting contractor, to the unit maker’s rigging instructions. Agree it at tender, because the bars are made to order.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Frames, beams and systems for base-lifted plant',
      skus: ['IH-LR-BH-MSF', 'IH-LR-BH-PML', 'IH-LR-BH-LHF', 'IH-LR-BH-FSB', 'IH-LR-BH-MSB-8', 'IH-LR-SY-PRSE'],
    },
    { type: 'category_link', slug: 'spreader-frames-h-frames', label: 'Spreader frames and H-frames', blurb: 'Four-point frames that keep every leg vertical, modular from 10 t to 90 t.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Lifting, rigging and plant supply for contractors.' },
    {
      type: 'related_articles',
      slugs: ['lifting-chillers-and-rooftop-plant', 'centre-of-gravity-in-lifting', 'sling-angle-compression-force', 'lifting-equipment-inspection-uae', 'spreader-beam-vs-lifting-beam'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'UAE rules from Abu Dhabi CoP 34 v4.1 and Dubai GU48 as read for our inspection article. The unit maker’s rigging instructions and the rules for the site govern.',
    },
    {
      type: 'cta_block',
      heading: 'Lifting AHUs on your next project?',
      body: 'Send the unit drawings with weights, base-hole positions and sizes. We will quote a certified bar set and spreader frame to suit the range of units, with the rigging to hang it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
