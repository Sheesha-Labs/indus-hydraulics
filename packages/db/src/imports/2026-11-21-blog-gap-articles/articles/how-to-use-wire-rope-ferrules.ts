import type { BlogArticleSeed } from '../shared'

/**
 * How to use wire rope ferrules and sleeves. Dimensions are from live listings: the aluminium ferrule
 * to EN 13411-3 / DIN 3093 (1–60 mm, A/B/L as lettered on the listing drawing), the steel oval sleeve
 * (5/16–1-1/4″, length L and after-swage dimension) and the S-505 Flemish eye and S-506 duplex sleeve
 * patterns. Method follows EN 13411-3 (ferrule-secured eye terminations) in outline; the ferrule and
 * die maker's instructions govern press stages and gauge dimensions. No termination efficiencies quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-use-wire-rope-ferrules',
  title: 'How to use wire rope ferrules and sleeves: sizing, pressing and checking the swage',
  excerpt:
    'A wire rope ferrule only holds when it matches the rope, is pressed in the right die and passes a gauge check afterwards. Here is how to choose a ferrule or sleeve, form the eye, press it and check it, and the mistakes that make a termination fail.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Use Wire Rope Ferrules and Sleeves',
  seoDescription:
    'How to use wire rope ferrules: matching ferrule to rope, forming the eye, pressing in the right die, the after-swage gauge check, and what not to do.',
  focusKeyword: 'how to use wire rope ferrules',
  publishedAt: '2026-11-21T09:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do you use wire rope ferrules?',
      answer:
        'Choose a ferrule made for the rope diameter and construction, slide it onto the rope, form the eye round a thimble if one is used, and pass the tail back through the ferrule. Press it in a hydraulic press with the die made for that ferrule size, then gauge the pressed ferrule. For lifting, the finished termination is tested and certified.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A ferrule or sleeve is sized to the rope diameter. A ferrule for a different size, or one stretched over a larger rope, will not hold its rating.',
        'Ferrules are pressed in a press with dies matched to the ferrule size. Hand swagers are only for small sleeves on small cable.',
        'Check every pressed ferrule or sleeve with a gauge or calliper against the maker’s after-swage dimension. Our steel oval sleeve listing gives it for each size, from 19.6 mm for 5/16″ rope to 65 mm for 1-1/4″.',
        'For lifting slings, ferrule-secured eyes are made to EN 13411-3, then proof tested and certified by the sling maker or a competent person.',
        'Never reuse a pressed ferrule, and never press a ferrule over damaged or welded rope.',
      ],
    },
    {
      type: 'lead',
      html: 'A ferrule is a short tube of aluminium, steel, copper or stainless steel that clamps the rope tail to the live rope and makes a permanent eye. Pressed properly it is a neat, strong termination; pressed wrongly it looks exactly the same and lets go under load. The difference is in the details: the right ferrule for the rope, the right die and a gauge check afterwards. This guide covers the types in our <a href="/c/wire-rope-ferrules-sleeves">wire rope ferrules and sleeves</a> range and how each one is used.',
    },

    { type: 'section_head', number: '/01', title: 'Ferrule and sleeve types.', anchor: 'types' },
    {
      type: 'prose',
      html: '<ul><li><strong>Aluminium ferrules to EN 13411-3 (DIN 3093).</strong> The standard ferrule for ferrule-secured eyes on steel wire rope slings, in 1 mm to 60 mm on our <a href="/p/aluminium-ferrule-en-13411-3-din-3093">aluminium ferrule listing</a>. A stainless steel version is listed in the same sizes, with the load rating on request.</li><li><strong>Tapered aluminium ferrules (Form C).</strong> A ferrule with a tapered end, so the termination snags less when the sling is pulled from under a load. 8 mm to 52 mm.</li><li><strong>Flemish eye sleeves (S-505 pattern).</strong> Steel sleeves pressed over the tails of a Flemish eye splice, 1/4″ to 6″ on the <a href="/p/flemish-eye-steel-swaging-sleeve-s-505-pattern">S-505 listing</a>.</li><li><strong>Duplex and oval sleeves.</strong> Figure-eight sleeves that hold two runs of rope side by side for a turnback eye. Steel in <a href="/p/steel-oval-sleeve">steel oval sleeve</a> and the S-506 duplex pattern; aluminium and copper in smaller sizes.</li><li><strong>Hourglass sleeves and stop buttons.</strong> Small copper and aluminium sleeves for light cable, and buttons swaged onto a rope end as a stop. These are for cable work such as balustrades and light fixings, not for making lifting slings.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'How a ferrule-secured eye compares with a Flemish eye and a hand splice is covered in <a href="/blog/wire-rope-eye-terminations">wire rope eye terminations compared</a>. This article is about the practical steps.',
    },

    { type: 'section_head', number: '/02', title: 'Match the ferrule to the rope.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'Measure the rope with a calliper across the crowns of the strands, not across the flats, and buy the ferrule for that nominal diameter. EN 13411-3 ferrules are sized by rope diameter, so a 6 mm rope takes a size 6 ferrule. The ferrule also has to suit the rope construction and core; ask if the rope is unusual, such as a compacted or rotation-resistant rope. The table shows the small end of our aluminium ferrule range.',
    },
    {
      type: 'comparison_table',
      caption: 'Aluminium ferrules to EN 13411-3 / DIN 3093, sizes 1–6 (dimensions in mm, lettered as on our listing drawing)',
      columns: ['Rope size', 'A', 'B', 'L'],
      rows: [
        { cells: ['1 mm', '1.2', '2.4', '5'] },
        { cells: ['2 mm', '2.2', '4.4', '7'] },
        { cells: ['3 mm', '3.3', '6.6', '11'] },
        { cells: ['4 mm', '4.4', '8.8', '14'] },
        { cells: ['5 mm', '5.5', '11', '18'] },
        { cells: ['6 mm', '6.6', '13.2', '21'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Making a ferrule-secured eye.', anchor: 'pressing' },
    {
      type: 'prose',
      html: '<ol><li><strong>Cut and seize.</strong> Cut the rope square and seize or tape the end so the strands do not unlay.</li><li><strong>Thread the ferrule.</strong> Slide the ferrule onto the rope before you form the eye.</li><li><strong>Form the eye.</strong> Bend the rope round a thimble if the eye will bear on a pin or hook, or to the eye size you need for a soft eye. See <a href="/blog/wire-rope-thimble-types">wire rope thimble types</a> for choosing one.</li><li><strong>Pass the tail back.</strong> Feed the tail back through the ferrule alongside the live rope. Position the tail as the ferrule maker’s instructions require: a tail that stops short inside the ferrule weakens the grip.</li><li><strong>Press.</strong> Set the ferrule in the press die made for its size and press it in the number of stages the die maker specifies. Keep the ferrule square in the die so it closes evenly.</li><li><strong>Gauge.</strong> Measure the pressed ferrule against the maker’s finished dimension and look for cracks, flash folded into the surface and uneven closing.</li><li><strong>Test and certify.</strong> A termination for lifting is proof tested and certified before use. See <a href="/blog/proof-load-testing-lifting-gear">proof load testing of lifting gear</a>.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A pressed ferrule that looks right can still be wrong.',
      body: 'Wrong die, wrong ferrule size or too few press stages all produce a ferrule that looks finished. The only check is the gauge against the maker’s dimension. If the pressed ferrule is outside it, cut the termination off and start again; never re-press or reuse it.',
    },

    { type: 'section_head', number: '/04', title: 'Sleeves and the after-swage check.', anchor: 'sleeves' },
    {
      type: 'paragraph',
      html: 'Steel sleeves are used two ways. On a Flemish eye the rope is unlaid into two parts, formed into an eye and laid back up, and the <a href="/p/flemish-eye-steel-swaging-sleeve-s-505-pattern">S-505 sleeve</a> is pressed over the tails to finish the splice. On a turnback eye the rope is simply looped back and a <a href="/p/duplex-swaging-sleeve-s-506-pattern">duplex sleeve</a> holds the two runs. Either way, the sleeve is pressed in matched dies and then gauged. Our steel oval sleeve listing gives the after-swage dimension for each size.',
    },
    {
      type: 'comparison_table',
      caption: 'Steel oval sleeve: sleeve length and after-swage dimension (mm, from our listing)',
      columns: ['Rope size', 'Sleeve length L', 'After swage'],
      rows: [
        { cells: ['5/16″', '31.8', '19.6'] },
        { cells: ['3/8″', '31.8', '19.6'] },
        { cells: ['7/16″', '41.4', '26.2'] },
        { cells: ['1/2″', '41.4', '26.2'] },
        { cells: ['9/16″', '57.1', '32.8'] },
        { cells: ['5/8″', '57.1', '32.8'] },
        { cells: ['3/4″', '66.8', '39.4'] },
        { cells: ['7/8″', '73.2', '45.7'] },
        { cells: ['1″', '77.7', '52.1'] },
        { cells: ['1-1/4″', '103.1', '65'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Small copper and aluminium hourglass sleeves, such as our <a href="/p/copper-hourglass-sleeve">copper hourglass sleeve</a>, are crimped with a hand swager on light cable. They are not a substitute for a pressed ferrule on a lifting sling. Where a temporary eye is needed without a press, wire rope clips are the alternative; see <a href="/blog/wire-rope-clips-installation">how to install wire rope clips</a>.',
    },

    { type: 'section_head', number: '/05', title: 'What not to do.', anchor: 'mistakes' },
    {
      type: 'prose',
      html: '<ul><li>Do not use a ferrule or sleeve made for a different rope size, or open one up to fit.</li><li>Do not press without the matching die, or with a hammer.</li><li>Do not reuse a ferrule or sleeve that has been pressed once.</li><li>Do not terminate rope that is kinked, birdcaged, corroded or has broken wires at the eye.</li><li>Do not put a lifting sling into service until it has been tested, marked and certified.</li></ul><p>A competent person examines wire rope slings and their terminations at the intervals the local rules set. Cracked, deformed or corroded ferrules, and broken wires at the ferrule, are grounds to take the sling out of service.</p>',
    },

    { type: 'section_head', number: '/06', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<ul><li>Rope diameter, construction and material (galvanised, bright or stainless).</li><li>The termination: ferrule-secured eye, Flemish eye or turnback eye.</li><li>Ferrule or sleeve type and quantity, and whether you need thimbles.</li><li>Whether the rope is for lifting, guying or general use.</li></ul><p>We quote and ship ferrules, sleeves and the rest of our <a href="/c/wire-rope-fittings">wire rope and fittings</a> range from Dubai, UAE. If you would rather not press <a href="/c/wire-rope-ferrules-sleeves">ferrules and sleeves</a> yourself, ask for the sling built, tested and certified.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a wire rope ferrule and a sleeve?', answer: 'The words overlap. In European practice a ferrule is the single-bore aluminium or steel tube pressed to EN 13411-3. In US practice a sleeve is usually an oval or duplex figure-eight shape that holds two runs of rope side by side, or a collar pressed over a Flemish eye.' },
        { question: 'Can you crimp a wire rope ferrule by hand?', answer: 'Only small copper and aluminium sleeves on light cable, with a hand swager sized for them. Ferrules for lifting slings are pressed in a hydraulic press with matched dies.' },
        { question: 'How do I know a ferrule is pressed correctly?', answer: 'Measure it against the maker’s finished dimension with a gauge or calliper, and look for cracks or uneven closing. For a lifting sling the termination is also proof tested.' },
        { question: 'What size ferrule do I need?', answer: 'The one made for your rope’s nominal diameter, measured across the strand crowns. A 6 mm rope takes a size 6 EN 13411-3 ferrule.' },
        { question: 'Can a ferrule be reused?', answer: 'No. Once pressed, a ferrule has been permanently deformed to that rope. Cut the termination off and fit a new ferrule.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Ferrules and sleeves',
      skus: ['IH-LR-FS-AEN', 'IH-LR-FS-AFC', 'IH-LR-FS-S505', 'IH-LR-FS-DSSS506', 'IH-LR-FS-SOV', 'IH-LR-FS-CUHG'],
    },
    { type: 'category_link', slug: 'wire-rope-ferrules-sleeves', label: 'Wire rope ferrules and sleeves', blurb: 'EN 13411-3 aluminium and stainless ferrules, Flemish eye and duplex sleeves, hourglass sleeves and stop buttons.' },
    {
      type: 'related_articles',
      slugs: ['wire-rope-eye-terminations', 'wire-rope-thimble-types', 'wire-rope-clips-installation', 'wire-rope-sling-capacity-chart'],
    },
    {
      type: 'cta_block',
      heading: 'Terminating wire rope?',
      body: 'Send the rope size and construction and the termination you need. We will quote the ferrules or sleeves, or the finished sling with its certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
