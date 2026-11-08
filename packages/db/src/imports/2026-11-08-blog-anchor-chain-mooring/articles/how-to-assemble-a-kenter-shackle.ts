import type { BlogArticleSeed } from '../shared'

/**
 * Kenter shackle. Sources: a stockist's "dismantling of a Kenter shackle" manual page (punch the taper
 * pin out from its narrow end, displacing the lead pellet; knock the centre chock out; separate the
 * halves) and its lead plug sheet (sizes = live listing IH-MR-AC-LPL); a chain maker's Kenter page (two
 * intermeshing halves, a stud and taper pins; tapered groove sealed with lead; ends may take different
 * chain sizes); link proportions (6D × 4.2D) from the makers' drawings. No source gives an assembly
 * procedure: assembly is presented as the dismantling steps reversed, with the maker's instructions
 * named as the authority.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-assemble-a-kenter-shackle',
  title: 'Kenter shackle: how to dismantle and assemble one, and why it is sealed with lead',
  excerpt:
    'The Kenter shackle joins lengths of anchor chain without changing the shape of the cable. Its parts, how to take one apart with a punch and hammer, how to put it back together and seal the taper pin with a new lead plug, which lead plug fits which chain size, and the checks before it goes back over the windlass.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Kenter Shackle: Dismantle and Assemble',
  seoDescription:
    'How a Kenter shackle works and how to dismantle and assemble one — halves, centre stud, taper pin and lead plug — with lead plug sizes by chain size.',
  focusKeyword: 'kenter shackle',
  publishedAt: '2026-11-08T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A Kenter shackle is a joining link made of two interlocking halves and a centre stud, locked by a taper pin that is sealed in with a lead plug.',
        'It has the length and stud of a common link, so it passes over the windlass and joins lengths without end or enlarged links.',
        'To dismantle: drive the taper pin out from its narrow end with a punch, knock the centre stud out, and slide the halves apart.',
        'To assemble, reverse the steps, then hammer a new lead plug into the recess so the pin cannot work loose. Never reuse the old lead.',
        'Lead plugs are sized to the chain: 20 × 20 mm for 44–54 mm chain, 30 mm diameter for 66–76 mm, 50 × 50 mm for 130–137 mm.',
      ],
    },
    {
      type: 'lead',
      html: 'Most anchor cables are joined with Kenter shackles, and sooner or later one has to be opened — to remove a worn length, to turn the cable end for end, or to fit a new forerunner. The job is simple with the right tools, and easy to get wrong without them: a taper pin driven from the wrong end, a lead plug left out, or halves from two shackles mixed up.',
    },
    {
      type: 'direct_answer',
      question: 'How do you open a Kenter shackle?',
      answer:
        'Drive the taper pin out with a punch from its narrow end; this pushes out the lead plug that seals it. With the pin out, knock the centre stud straight out, then slide the two halves of the shackle apart. To close it, fit the halves, insert the stud, drive the taper pin home and seal it with a new lead plug.',
    },

    { type: 'section_head', number: '/01', title: 'The parts.', anchor: 'parts' },
    {
      type: 'comparison_table',
      caption: 'Parts of a Kenter shackle',
      columns: ['Part', 'What it does'],
      rows: [
        { cells: ['Two halves', 'Interlocking C-shaped halves that together form the link body'] },
        { cells: ['Centre stud (chock)', 'Sits across the middle, holding the halves together, like the stud of a common link'] },
        { cells: ['Taper pin', 'Passes through the halves and stud and locks them'] },
        { cells: ['Lead plug (pellet)', 'Hammered into the recess behind the taper pin so it cannot work out'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The shackle is 6D long and 4.2D wide — the length of a common link and slightly wider — so it runs over the cable lifter like any other link. Our <a href="/p/kenter-shackle-grades-u2-and-u3">Kenter shackles</a> come in grades U2 and U3 for ship chain; the <a href="/p/slim-kenter-joining-shackle">slim Kenter</a> suits tight cable lifters, and the <a href="/p/anchor-kenter-shackle-grades-r3-and-r4">anchor Kenter shackle</a> connects offshore chain to an anchor. Where it sits in a cable is in <a href="/blog/anchor-chain-cable-arrangement">the arrangement of a chain cable</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Dismantling.', anchor: 'dismantling' },
    {
      type: 'prose',
      html: '<p>Tools: a hammer, a drift punch slightly smaller than the narrow end of the taper pin, and something to support the shackle firmly. Lay the shackle flat on a solid surface.</p><ol><li><strong>Drive out the taper pin.</strong> Put the punch on the narrow end of the pin and drive it out towards the wide end. The pin pushes the lead plug out of its recess as it goes.</li><li><strong>Knock out the centre stud.</strong> With the pin removed, drive the stud straight out of the halves.</li><li><strong>Separate the halves.</strong> Slide the two halves apart sideways. The links either side are now free.</li></ol><p>Clean every part and keep the parts of each shackle together — they are made and supplied as a matched set.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Drive from the narrow end.',
      body: 'A taper pin only comes out one way. Hammering on the wide end jams it tighter and damages the halves. If the pin will not move, check which end you are on before hitting harder.',
    },

    { type: 'section_head', number: '/03', title: 'Assembling.', anchor: 'assembling' },
    {
      type: 'prose',
      html: '<p>Assembly is dismantling in reverse. Follow the maker’s instructions for the shackle, and check each part as you go:</p><ol><li><strong>Inspect.</strong> No cracks, burrs or wear on the halves, stud or pin; the pin hole and the lead recess clean.</li><li><strong>Fit the halves</strong> through the end links of the two lengths and slide them together.</li><li><strong>Insert the centre stud</strong> so the holes for the taper pin line up.</li><li><strong>Drive the taper pin home</strong>, narrow end leading, from the side it was driven out towards, until it seats.</li><li><strong>Seal it.</strong> Put a new lead plug of the right size into the recess behind the pin and hammer it in until it fills the recess and locks the pin.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Always a new lead plug.',
      body: 'Lead that has been driven out is deformed and will not lock the pin securely again. A Kenter shackle without its lead can shed its taper pin over the windlass. Keep a stock of plugs in the sizes your chain needs.',
    },

    { type: 'section_head', number: '/04', title: 'Lead plug sizes.', anchor: 'lead-plugs' },
    {
      type: 'comparison_table',
      caption: 'Lead plug for Kenter and joining shackle pins — diameter Ø and height B (mm)',
      columns: ['Chain size', 'Ø', 'B'],
      rows: [
        { cells: ['12.5 mm', '10', '6, 10 or 15'] },
        { cells: ['14–22 mm', '13, 14 or 15', '17, 18 or 20'] },
        { cells: ['24–32 mm', '16', '13'] },
        { cells: ['34–42 mm', '16', '20'] },
        { cells: ['44–54 mm', '20', '20'] },
        { cells: ['56–64 mm', '25', '25'] },
        { cells: ['66–73 mm', '30', '30'] },
        { cells: ['76 mm', '30', '45 or 50'] },
        { cells: ['81–92 mm', '35', '35'] },
        { cells: ['95–100 mm', '40', '40'] },
        { cells: ['102–107 mm', '45', '50'] },
        { cells: ['111–117 mm', '45', '45'] },
        { cells: ['120–127 mm', '49', '45'] },
        { cells: ['130–137 mm', '50', '50'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Where two or three sizes are listed for one chain size, match the plug to the recess in your shackle — makers’ recesses differ. All sizes are in our <a href="/p/lead-plug-for-kenter-and-joining-shackle-pins">lead plug</a> listing.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a Kenter shackle?', answer: 'A joining link for anchor chain made of two interlocking halves, a centre stud and a taper pin sealed with lead. It is the size of a common link, so it passes over the windlass.' },
        { question: 'Which way does a Kenter taper pin come out?', answer: 'It is driven out from its narrow end towards its wide end.' },
        { question: 'Can I reuse the lead plug?', answer: 'No. Fit a new lead plug every time the shackle is assembled.' },
        { question: 'Can I mix parts from different Kenter shackles?', answer: 'Keep each shackle’s parts together; they are supplied as a matched set.' },
        { question: 'Can a Kenter shackle join two chain sizes?', answer: 'Yes — Kenter shackles can be made with ends for two different chain diameters.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Kenter shackles and lead plugs',
      skus: ['IH-LR-AC-KSGU2U3', 'IH-MR-AC-SKS', 'IH-MR-AC-AKS', 'IH-MR-AC-AKSH', 'IH-MR-AC-LPL', 'IH-MR-AC-CCS'],
    },
    { type: 'category_link', slug: 'anchor-chain-accessories', label: 'Anchor chain accessories', blurb: 'Kenter, D and pear shackles, swivels, forerunners, end and enlarged links.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-cable-arrangement', 'anchor-chain-wear-limits', 'offshore-mooring-components', 'anchor-chain-grades-u1-u2-u3'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Dismantling steps and lead plug sizes from a chain stockist’s manual and data sheet; part names from a chain maker. The maker’s instructions for your shackle govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need Kenter shackles or lead plugs?',
      body: 'Send the chain size and grade. We will quote Kenter shackles, spare taper pins and lead plugs, with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
