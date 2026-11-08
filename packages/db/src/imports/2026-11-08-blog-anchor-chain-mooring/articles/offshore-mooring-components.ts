import type { BlogArticleSeed } from '../shared'

/**
 * Offshore mooring components. Sources: a chain maker's product pages (H-link connects several mooring
 * parts; LTM end joining shackle connects to the fastening device; pear link takes wire rope or chain;
 * pear shackle replaces a Kenter, a three-link adaptor and a D end shackle as a spare; tri-plate for
 * buoy and wharf moorings; chasers) and its mooring-system diagram; a second maker's mooring assembly
 * codes and proportion drawings (LTM H-type 9D × 3.6D, LTM end joining shackle 8.6D × 3.8D); a
 * stockist's sheets (H-connector 76/84 mm R4 proof 5,682 / break 7,208 kN; RF connector 76 mm 4,731 /
 * 6,002 kN; triplate WLL 9.5–200 t; installation link proportions). The 2026 news pages list the unit
 * types. Loads quoted are from the stockist's sheets as listed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'offshore-mooring-components',
  title: 'Offshore mooring components: H-links, pear links, triangle plates, LTM shackles and swivels',
  excerpt:
    'A mooring line is chain, wire or rope joined by connectors, each one rated to the line’s grade. What the H-link, pear link and pear shackle, triangle plate, LTM joining and end shackles, installation links, swivels and chasers do, and where each sits in a mooring leg.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Offshore Mooring Components Explained',
  seoDescription:
    'Offshore mooring components: H-links, pear links and shackles, triangle plates, LTM shackles, installation links, swivels and chasers explained.',
  focusKeyword: 'offshore mooring components',
  publishedAt: '2026-11-08T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Offshore mooring legs join chain, wire rope and fibre rope with forged connectors, each rated to the chain grade — typically R3 to R5.',
        'H-links and similar connectors join chain to chain, or chain to other components, where a Kenter shackle will not do.',
        'Pear links and pear shackles join chain of different sizes, or chain to wire rope; a triangle plate joins three lines at one point.',
        'LTM-pattern joining and end shackles connect studless chain and the chain ends to anchors and fastening devices.',
        'Swivels release twist, installation links make temporary connections during laying, and chasers recover anchors and hold chain clear of pipelines.',
      ],
    },
    {
      type: 'lead',
      html: 'A mooring for a drilling rig, an FPSO, a floating storage unit, a single point mooring buoy or a floating wind turbine is a set of legs, each running from an anchor on the seabed to a fairlead on the unit. Along the way the leg may change from chain to wire to fibre rope and back, branch to a buoy or a clump weight, and pass through a swivel. Every one of those changes is a connector — and the connectors are where a mooring is most often specified wrongly.',
    },
    {
      type: 'figure',
      imageId: '20631f4a-5aa0-4229-8cd6-dcc1e638b928',
      caption: 'Mooring chain at a platform leg: every connector in the line is rated to the chain’s grade.',
      aspectRatio: '1/1',
    },
    {
      type: 'direct_answer',
      question: 'What components make up an offshore mooring line?',
      answer:
        'The anchor and its anchor shackle; chain (stud link or studless) with joining shackles, H-links or other connectors; wire or fibre rope joined by sockets, thimbles and pear links; swivels to release twist; triangle plates where lines branch to a buoy or clump weight; and end shackles at the fastening on the unit.',
    },

    { type: 'section_head', number: '/01', title: 'Connectors for chain.', anchor: 'chain-connectors' },
    {
      type: 'comparison_table',
      caption: 'Chain connectors and what they do',
      columns: ['Component', 'What it does', 'Notes'],
      rows: [
        { cells: ['H-link / H-connector', 'Joins mooring components; can connect several parts', 'Grades R3–R5; 76/84 mm R4 hybrid: proof 5,682 kN, break 7,208 kN'] },
        { cells: ['LTM H-type joining shackle', 'Joins two lengths of chain', 'About 9D long, 3.6D wide'] },
        { cells: ['LTM joining shackle (D)', 'Joins studless chain, and the ends of stud link chain', 'Forged; locking pin'] },
        { cells: ['LTM end joining shackle', 'Connects chain to the fastening device', 'About 8.6D × 3.8D'] },
        { cells: ['RF connector', 'Joins offshore chain', '76 mm R4: proof 4,731 kN, break 6,002 kN'] },
        { cells: ['Kenter / anchor Kenter shackle', 'Joins lengths; connects chain to an anchor', 'Common-link size, passes over a chain wheel'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Listings: <a href="/p/h-link">H-link</a>, <a href="/p/h-connector-hybrid-76-84-mm-grade-r4">H-connector</a>, <a href="/p/ltm-joining-shackle-d-type">LTM joining shackle</a>, <a href="/p/ltm-end-joining-shackle-d-type-grade-r4">LTM end joining shackle</a>, <a href="/p/rf-connector-shackle-grade-r4">RF connector</a> and <a href="/p/anchor-kenter-shackle-grades-r3-and-r4">anchor Kenter shackle</a>. Where studless meets stud link chain, a <a href="/p/three-link-adaptor-studless-to-stud-link-mooring-chain">three-link adaptor</a> makes the change — see <a href="/blog/stud-link-vs-studless-chain">stud link vs studless chain</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Pear links and pear shackles.', anchor: 'pear' },
    {
      type: 'paragraph',
      html: 'A pear link is pear-shaped: a wide end and a narrow end, so it can join a large component to a smaller one — chain to a smaller chain, or chain to a wire rope socket. A <a href="/p/pear-shaped-end-shackle-grade-r4">pear-shaped end shackle</a> adds a bolt, and makes a useful spare: one maker notes it can stand in for a Kenter shackle, a three-link adaptor and a D-type end shackle. Our pear shackles come in <a href="/p/pear-shaped-end-shackle-grade-3">grade 3</a> and grade R4.',
    },

    { type: 'section_head', number: '/03', title: 'Plates: where lines branch.', anchor: 'plates' },
    {
      type: 'paragraph',
      html: 'A <a href="/p/triangle-plate-triplate">triangle plate</a> (tri-plate) joins three lines at one point — typically a mooring buoy’s riser chain, the ground leg and a pick-up or clump weight line. It is used mainly in buoy and wharf moorings. One published range runs from 9.5 t to 200 t working load. A <a href="/p/quad-plate-grade-3">quad plate</a> takes four.',
    },

    { type: 'section_head', number: '/04', title: 'Swivels, installation links and chasers.', anchor: 'others' },
    {
      type: 'prose',
      html: '<ul><li><strong>Swivels</strong> release the twist that builds up in a line from wave action and from wire rope’s own torque. Offshore types include <a href="/p/compact-mooring-swivel-grades-r4-and-r5">compact</a>, <a href="/p/in-line-mooring-swivel-grade-r4">in-line</a>, <a href="/p/box-mooring-swivel-grade-r4">box</a> and <a href="/p/bearing-mooring-swivel">bearing</a> swivels. Bearing swivels need periodic servicing; one maker calls for a full strip-down with magnetic particle inspection every two years.</li><li><strong><a href="/p/installation-link-lllc">Installation links</a></strong> make the temporary connections used while a mooring is laid and tensioned.</li><li><strong>Chasers</strong> run down a mooring line from a workboat: a <a href="/p/permanent-chaser">permanent chaser</a> recovers an anchor or holds chain clear of a pipeline during laying; a <a href="/p/j-chaser">J-chaser</a> lifts vertically to free a stuck anchor.</li><li><strong>Weak links</strong> set a deliberate failure point, used in aquaculture and at a ship’s chain locker — see the <a href="/p/weak-link-system">weak link system</a>.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Grade every connector to the chain.',
      body: 'A connector is proof tested to the proof load of the chain it is made for. An R3 shackle in an R4 line makes it an R3 line — check the grade on each certificate, not just the size.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an H-link in mooring?', answer: 'A forged connector used to join mooring components, made in grades R3 to R5. It can connect several parts at once.' },
        { question: 'What is a pear link used for?', answer: 'To join components of different sizes — chain to smaller chain, or chain to a wire rope socket.' },
        { question: 'What is a triangle plate?', answer: 'A plate with three holes that joins three mooring lines at one point, mainly in buoy and wharf moorings.' },
        { question: 'What does LTM mean on a shackle?', answer: 'It is a pattern name for heavy offshore D-type joining and end shackles with locking pins.' },
        { question: 'Why does a mooring line need a swivel?', answer: 'To release twist from wave action and from wire rope torque, which would otherwise kink the chain and load the connectors unevenly.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Mooring connectors',
      skus: ['IH-MR-CN-HLK', 'IH-MR-CN-HCN', 'IH-MR-AC-PESR4', 'IH-MR-CN-TRP', 'IH-MR-AC-LTMEJ', 'IH-MR-AC-CSW', 'IH-MR-CN-ILK', 'IH-MR-AH-PCH'],
    },
    { type: 'category_link', slug: 'mooring-connectors', label: 'Mooring connectors', blurb: 'H-links, triangle and quad plates, sockets, thimbles, weak links and installation links.' },
    { type: 'category_link', slug: 'anchor-handling-chasers', label: 'Anchor handling & chasers', blurb: 'Chasers, grapnels and hooks for running and recovering moorings.' },
    {
      type: 'related_articles',
      slugs: ['offshore-mooring-chain-grades-r3-r4-r5', 'stud-link-vs-studless-chain', 'anchor-chain-cable-arrangement', 'how-to-assemble-a-kenter-shackle'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Component descriptions from chain makers’ product pages and drawings; loads from a chain stockist’s data sheets. The mooring design and the classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Building a mooring leg?',
      body: 'Send the line make-up — chain size and grade, wire or rope, and the connectors you need. We will quote every component to the same grade, each with its certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
