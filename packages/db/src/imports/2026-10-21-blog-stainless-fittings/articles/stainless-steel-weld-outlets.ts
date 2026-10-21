import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Stainless weld outlets and weld-on adapters. Sources read 2026-10-21: Wermac "olets" page, drawing on Bonney Forge
 * data (weldolet the most common branch connection, butt-weld outlet; thredolet threaded, 3000/6000; sockolet
 * 3000/6000/9000; elbolet on long-radius elbows, thermowells and instruments; latrolet 45° laterals; nipolet for
 * valve take-offs, drains and vents; "100% reinforcement requirement of applicable piping codes" B31.1/.3/.4/.8;
 * reinforcement depends on run-pipe wall; MSS SP-97 "Integrally Reinforced Forged Branch Outlet Fittings"). ASME
 * B16.11 classes for socket/threaded. Listing copy for the weld-on hydraulic adapters (316, tube or pipe × JIC, ORFS,
 * BSPP swivel, NPT).
 * NOT used: any olet-vs-tee size rule — left to the piping class branch table.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-weld-outlets',
  title: 'Stainless steel weld outlets: weldolet, threadolet and sockolet branch connections, and weld-on adapters',
  excerpt:
    'Cutting a full tee into a 6" stainless line to take a ½" drain wastes a weld, a fitting and a day. A weld outlet does it with one forged fitting welded onto the run. Butt-weld, socket-weld and threaded outlets to MSS SP-97, how they reinforce the hole, elbolets, latrolets and nipolets, and the weld-on adapters that put a hydraulic port on a tank or manifold.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Weld Outlets: Weldolet, Threadolet & Sockolet Guide',
  seoDescription:
    'Stainless steel weld outlets explained: weldolet, threadolet and sockolet branch fittings to MSS SP-97, integral reinforcement, Class 3000/6000 ratings, elbolets, latrolets, nipolets and weld-on hydraulic adapters.',
  focusKeyword: 'stainless steel weldolet',
  publishedAt: '2026-10-21T16:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A weld outlet is a forged fitting welded onto the run pipe over a hole, to take a branch without cutting in a tee.',
        'MSS SP-97 covers integrally reinforced forged branch outlets; the fitting supplies the reinforcement the piping codes (B31.1, B31.3, B31.4, B31.8) require around the hole.',
        'The branch end decides the type: weldolet (butt weld), sockolet (socket weld, Class 3000/6000/9000), threadolet (NPT, Class 3000/6000).',
        'Elbolets sit on long-radius elbows for thermowells and instruments; latrolets make 45° laterals; nipolets are one-piece outlets for vents, drains and valve take-offs.',
        'The reinforcement depends on the run pipe wall, so order the outlet by run size, run schedule and branch size.',
      ],
    },
    {
      type: 'lead',
      html: 'Every process line sprouts small branches — drains at low points, vents at high points, pressure and temperature tappings, sample points. On a large stainless run each could be a reducing tee, with two extra butt welds and a cut through the pipe. Most of them are instead a weld outlet: a contoured forging welded onto the outside of the pipe, with the branch connection already on it.',
    },

    { type: 'section_head', number: '/01', title: 'What an outlet does.', anchor: 'what' },
    {
      type: 'prose',
      html: '<p>Cutting a hole in a pressure pipe weakens it; the piping codes require the metal removed to be replaced around the opening. A weld outlet carries that reinforcement in its own body. Wermac, quoting Bonney Forge, says these fittings meet the 100% reinforcement requirement of the applicable piping codes and are shaped to minimise stress concentration. The standard is <strong>MSS SP-97</strong>, integrally reinforced forged branch outlet fittings.</p><p>Because the reinforcement is sized against the run wall, an outlet is specified by the <strong>run pipe size and schedule</strong> as well as the branch size — the same ½" outlet is a different forging on a 2" Sch 10S run than on a 6" Sch 40S one.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The types.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Branch outlet types (Wermac, after Bonney Forge)',
      columns: ['Type', 'Branch end', 'Typical use'],
      rows: [
        { cells: ['Weldolet', 'Butt weld (bevelled), full-penetration branch weld', 'The most common outlet; branches on process lines'], highlight: true },
        { cells: ['Sockolet', 'Socket weld, Class 3000, 6000 or 9000', 'Small-bore welded branches'] },
        { cells: ['Thredolet', 'NPT female thread, Class 3000 or 6000', 'Gauges, plugs, threaded valves'] },
        { cells: ['Elbolet', 'Butt weld, socket or thread, on a long-radius elbow', 'Thermowells and instruments at a bend'] },
        { cells: ['Latrolet', 'Butt weld, socket or thread, at 45°', 'Lateral connections'] },
        { cells: ['Nipolet', 'One piece with a built-in nipple', 'Valve take-offs, drains and vents'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Whether a given branch is a tee or an outlet is the piping class’s decision — most specifications carry a branch table that says which to use for each run and branch size. Socket-weld and threaded outlets follow the same class logic as ASME B16.11 fittings: see <a href="/blog/stainless-threaded-pipe-fittings-150-vs-3000">threaded and socket-weld fittings</a> for what the class numbers mean.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Weld-on hydraulic adapters.', anchor: 'weld-on' },
    {
      type: 'prose',
      html: '<p>A different weld-on part does a similar job on hydraulic equipment: a 316 stainless body with a plain end to weld onto a tank, reservoir, manifold or pipe, and a hydraulic connection on the other — 37° JIC male or female swivel, ORFS female swivel, BSPP female swivel or NPT. They put a standard port where there was only plate or pipe, and the swivel versions let a hose or tube be connected without twisting it. Weld them with the same purge and L-grade care as any stainless weld, and keep welding heat away from any O-ring or seal on the fitting.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a weldolet?', answer: 'A forged branch outlet with a butt-weld branch end, welded onto a run pipe over a hole. It carries its own reinforcement under MSS SP-97 and is the most common type of outlet.' },
        { question: 'Weldolet or tee?', answer: 'The piping class decides, usually through a branch table. Outlets are used for branches smaller than the run; tees for equal or near-equal branches.' },
        { question: 'What is the difference between a sockolet and a threadolet?', answer: 'The branch end: a sockolet takes the branch pipe in a socket for a fillet weld (Class 3000, 6000 or 9000); a threadolet has an NPT female thread (Class 3000 or 6000).' },
        { question: 'How do I order a weld outlet?', answer: 'By run pipe size and schedule, branch size, branch end type and class, and grade — for example 6" Sch 40S run × 1" Class 3000 threaded, 316.' },
        { question: 'What is an elbolet used for?', answer: 'A branch on a long-radius elbow — usually a thermowell or instrument that needs to face into the flow.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Forged 304 and 316 butt-weld, socket-weld and threaded outlets, and 316 weld-on hydraulic adapters:</p>' + stockList(['stainless-steel-weld-outlets']),
    },
    {
      type: 'product_embed',
      heading: 'Weld outlets and weld-on adapters',
      skus: ['IH-PF-BWO4-J6', 'IH-PF-BWO8-J4', 'IH-PF-SWO-J6', 'IH-PF-TWO-J6', 'IH-PF-SS-WO-FJX', 'IH-PF-SS-WO-FFX', 'IH-PF-SS-WO-FBX', 'IH-PF-SS-WO-MP'],
    },
    { type: 'category_link', slug: 'stainless-steel-weld-outlets', label: 'Stainless weld outlets', blurb: 'Butt-weld, socket-weld and threaded outlets and weld-on adapters.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'wermac-olets', text: 'Wermac. Olets — branch connections (after Bonney Forge).', url: 'https://wermac.org/fittings/olets_general.html' },
        { id: 'asme-b16-11', text: 'ASME B16.11 — Forged Fittings, Socket-Welding and Threaded, scope.', url: 'https://www.asme.org/codes-standards/find-codes-standards/b16-11-forged-fittings-socket-welding-threaded' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-steel-butt-weld-fittings', 'stainless-threaded-pipe-fittings-150-vs-3000', 'stainless-steel-pipe-fittings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Outlet types, classes and reinforcement from Wermac’s summary of Bonney Forge data and MSS SP-97; weld-on adapters from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Adding branches to a stainless line?',
      body: 'Send the run size and schedule, branch sizes and end types, class and grade. We will quote the outlets to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
