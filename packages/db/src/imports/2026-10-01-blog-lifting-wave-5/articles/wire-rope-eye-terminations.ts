import type { BlogArticleSeed } from '../shared'

/**
 * Wire rope eye terminations — ferrule-secured (turnback), Flemish eye, hand
 * splice — and the termination efficiency table.
 *
 * Sources checked 2026-10-01: Crosby Wire Rope End Terminations User's Manual
 * (2014) efficiency table and Flemish eye definition; Crosby S-505 sleeve
 * efficiencies; EN 13411-2 / -3 / -9 scopes (official abstracts); Talurit
 * (maker: ferrules validated to ≥ 90% MBL under EN 13411-3; copper ferrules
 * for stainless rope in salt water); LEEA COPSULE 15.3.5, 15.5.3, 15.5.4,
 * 15.10. Our swaged (ferrule-secured) and hand-spliced soft-eye sling tables
 * share the same rope MBL; the spliced/swaged WLL ratio is computed from them.
 * Not used, unverified: per-size hand-splice percentages; "rotation-resistant
 * rope must not be hand spliced".
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'wire-rope-eye-terminations',
  title: 'Ferrule-secured eye vs Flemish eye vs hand splice: wire rope terminations compared',
  excerpt:
    'Every way of making an eye in wire rope keeps a different share of the rope’s strength. Sockets keep all of it; ferrule-secured and Flemish eyes about 90% or better; a hand splice less, and less again as the rope gets bigger. Here is the efficiency table, how each eye is made, and where each one belongs.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Ferrule vs Flemish eye vs hand splice: wire rope termination efficiency',
  seoDescription:
    'Wire rope eye terminations compared: ferrule-secured turnback eyes, Flemish eyes and hand splices, the termination efficiency table, temperature limits and where each is used.',
  focusKeyword: 'wire rope termination efficiency',
  publishedAt: '2026-10-01T12:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A termination’s efficiency is the share of the rope’s breaking load it keeps. Sockets keep 100%; ferrule-secured and Flemish eyes about 90% or better; clips and wedge sockets 80%.',
        'A ferrule-secured (turnback) eye relies entirely on its ferrule. A Flemish eye is laid back into itself, so its strength does not rely on the sleeve alone.',
        'Hand splices keep less: European standards require at least 80%. In our tables, a hand-spliced sling is rated 90% of the ferrule-secured one at 10 mm and 75% at 40 mm.',
        'Aluminium ferrules limit a sling to 150 °C. Hand-spliced and steel-ferrule eyes can be used hotter, at reduced ratings.',
        'Hand splices must be tucked against the lay; a splice tucked with the lay can unlay if the rope rotates.',
      ],
    },
    {
      type: 'lead',
      html: 'A wire rope is never stronger than its weakest point, and that is almost always the end. The way an eye is made decides how much of the rope’s breaking load reaches the hook, how hot the sling can work, and whether the eye can come undone. The differences are large enough to change the sling you buy.',
    },

    { type: 'section_head', number: '/01', title: 'Termination efficiency.', anchor: 'efficiency' },
    {
      type: 'comparison_table',
      caption: 'Efficiency of wire rope terminations, as a share of the rope’s minimum breaking load (Crosby)',
      columns: ['Termination', 'Efficiency'],
      rows: [
        { cells: ['Spelter socket (zinc or resin)', '100%'] },
        { cells: ['Swaged socket', '100%'] },
        { cells: ['Swaged button', '98%'] },
        { cells: ['Flemish eye with steel sleeve', '90% or better'], highlight: true },
        { cells: ['Turnback eye with ferrule', '90% or better'], highlight: true },
        { cells: ['Wedge socket', '80%'] },
        { cells: ['Wire rope clips', '80% or better'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The sling’s WLL is the rope’s minimum breaking load times the termination efficiency, divided by the design factor. For Flemish eyes the efficiency also falls with size: one maker rates its steel sleeve at 96% on 1/4″–1″ steel-core rope, 92% up to 2″ and 90% above. European standards set the floor — at least 80% for spliced eyes under EN 13411-2 — and ferrule makers validate ferrule-secured eyes to at least 90% under EN 13411-3.',
    },

    { type: 'section_head', number: '/02', title: 'Three ways to make an eye.', anchor: 'three-eyes' },
    {
      type: 'prose',
      html: '<h3>Ferrule-secured (turnback) eye</h3><p>The rope is turned back on itself and an aluminium or steel ferrule is pressed over both parts. Quick to make, compact and consistent. Its strength relies entirely on the ferrule, so the pressing must be done to the ferrule maker’s procedure and die.</p><h3>Flemish eye</h3><p>The rope end is opened into two parts — the core with three strands, and the other three strands — which are looped in opposite directions and laid back together to form the eye. A steel sleeve is then swaged over the ends. Because the strands are laid back into the rope, the eye’s strength does not rely on the sleeve alone.</p><h3>Hand-spliced eye</h3><p>The strands are tucked back through the rope by hand. No press is needed, and a spliced eye can be made on site, but it keeps less of the rope’s strength and the gap grows with rope size.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Same rope, two eyes — our soft-eye sling tables, WLL at 5:1',
      columns: ['Rope', 'Ferrule-secured', 'Hand-spliced'],
      rows: [
        { cells: ['10 mm', '1.0 t', '0.9 t (90%)'] },
        { cells: ['16 mm', '2.6 t', '2.3 t (88%)'] },
        { cells: ['24 mm', '5.8 t', '4.6 t (79%)'] },
        { cells: ['32 mm', '10.3 t', '7.7 t (75%)'], highlight: true },
        { cells: ['40 mm', '16.1 t', '12.1 t (75%)'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Which is stronger, a ferrule-secured eye or a hand-spliced eye?',
      answer:
        'A ferrule-secured or Flemish eye keeps about 90% or more of the rope’s breaking load; a hand-spliced eye keeps less, and the gap widens on larger ropes. On our soft-eye slings, the hand-spliced version is rated 90% of the ferrule-secured one at 10 mm and 75% at 40 mm.',
    },

    { type: 'section_head', number: '/03', title: 'Heat, atmosphere and rotation.', anchor: 'limits' },
    {
      type: 'comparison_table',
      caption: 'Where each eye can work (LEEA Code of Practice)',
      columns: ['Eye', 'Temperature', 'Other limits'],
      rows: [
        { cells: ['Aluminium ferrule, steel-core rope', 'Not above 150 °C — withdraw if exposed', 'Restricted in classified hazardous atmospheres (sparking)'] },
        { cells: ['Any eye on fibre-core rope', 'Not above 100 °C', '—'] },
        { cells: ['Hand splice or steel ferrule, steel core', 'Up to 400 °C at reduced WLL: −10% to 200 °C, −25% to 300 °C, −35% to 400 °C', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: '<strong>Rotation.</strong> A hand splice must be tucked against the lay of the rope, with five tucks. Tucks made with the lay tend to undo if the rope rotates, and are effectively banned. Never join slings of different lay directions, for the same reason. The European splicing standard covers six- and eight-strand ropes only.',
    },
    {
      type: 'paragraph',
      html: '<strong>Stainless rope in salt water.</strong> Ferrule makers offer copper ferrules for stainless rope, to avoid galvanic corrosion in a salt-water environment.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing an eye',
      intro: 'Start from the duty.',
      branches: [
        { condition: 'General-purpose lifting slings', outcome: 'Ferrule-secured or Flemish eye: about 90% or more efficient.' },
        { condition: 'Heavy or critical slings where the eye must not rely on one part', outcome: 'Flemish eye with steel sleeve.' },
        { condition: 'Hot work above 150 °C', outcome: 'Steel ferrule or hand-spliced eye on steel-core rope, derated for temperature.' },
        { condition: 'Hazardous (classified) atmosphere', outcome: 'Avoid aluminium ferrules.' },
        { condition: 'Full rope strength needed at the end', outcome: 'A spelter or swaged socket — see our socket guide.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Slings and fittings in this guide',
      skus: ['IH-LR-WS-SWG', 'IH-LR-WS-SPL', 'IH-LR-SL-FEWRS', 'IH-LR-FS-AEN', 'IH-LR-FS-SSFE13411', 'IH-LR-FS-S505'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is a Flemish eye?',
          answer:
            'An eye made by opening the rope end into two parts, looping them in opposite directions and laying them back together, then swaging a steel sleeve over the ends. Its strength does not depend on the sleeve alone.',
        },
        {
          question: 'How efficient is a ferrule-secured eye?',
          answer:
            'About 90% or better of the rope’s minimum breaking load, when the ferrule is pressed to the maker’s procedure. Its strength relies entirely on the ferrule.',
        },
        {
          question: 'Can aluminium ferrule slings be used on hot work?',
          answer:
            'Not above 150 °C, and a sling exposed above that should be withdrawn. Use a steel-ferrule or hand-spliced sling on steel-core rope for hotter work, at a reduced rating.',
        },
        {
          question: 'Why do hand-spliced slings have lower ratings?',
          answer:
            'A hand splice keeps less of the rope’s breaking load than a pressed ferrule, and the gap widens with size. European standards require at least 80%.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'wire-rope-slings',
      label: 'Wire rope slings',
      blurb: 'Ferrule-secured, Flemish-eye and hand-spliced slings with ratings.',
    },
    {
      type: 'category_link',
      slug: 'wire-rope-ferrules-sleeves',
      label: 'Wire rope ferrules and sleeves',
      blurb: 'Aluminium, steel and copper ferrules and Flemish eye sleeves.',
    },
    {
      type: 'related_articles',
      slugs: ['spelter-sockets-open-vs-closed', 'wire-rope-thimble-types', 'wire-rope-clips-installation', 'wire-rope-construction-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Efficiencies from The Crosby Group’s termination manual and catalogue; limits from the LEEA Code of Practice; standard scopes from the EN 13411 abstracts. Sling ratings from the linked size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a sling eye for the job?',
      body: 'Tell us the load, the rope size, the temperature and the environment. We will quote the right termination and sling, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
