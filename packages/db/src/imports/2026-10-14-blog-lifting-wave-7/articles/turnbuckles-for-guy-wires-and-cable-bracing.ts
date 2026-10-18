import type { BlogArticleSeed } from '../shared'

/**
 * Turnbuckles in guy wires and cable bracing. Checked 2026-10-14: TIA/EIA-222 initial guy tension
 * ~10% of breaking strength (forum quotes of rev F — stated as a common design figure, NOT TIA-222-H);
 * turnbuckle safety loops woven through the eyes (tower-guy distributor listing, medium); 3 clips per
 * turnback on small strand (medium); makers' in-line-only and locking rules. Clip counts and torques
 * are left to the wire-rope-clips article (Crosby G-450 / EN 13411-5 sourced there).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'turnbuckles-for-guy-wires-and-cable-bracing',
  title: 'Turnbuckles for guy wires and cable bracing: building the whole assembly',
  excerpt:
    'Guyed masts, temporary towers, steel bracing, shade structures and facade cables all end the same way: a wire rope, a thimble, clips or a ferrule, and a turnbuckle to set the tension. How to put the assembly together so every part matches, set the tension, lock the turnbuckle and keep it there through Gulf heat and wind.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Turnbuckles for Guy Wires and Cable Bracing: Full Assembly',
  seoDescription:
    'How to build a guy wire or cable bracing assembly with a turnbuckle: matching rope, thimble, clips and turnbuckle ratings, setting initial tension, locking against vibration, safety loops and inspection in Gulf conditions.',
  focusKeyword: 'turnbuckle for guy wire',
  publishedAt: '2026-10-14T08:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A guy or brace is a chain of parts — anchor, shackle, turnbuckle, thimble, rope, clips — and is only as strong as the weakest.',
        'Use eye or jaw end turnbuckles on permanent guys; hook ends are rated lower and can come off a slack line.',
        'Every rope eye gets a thimble, and every clip goes on the right way round, in the right number, at the right torque.',
        'Guyed towers are commonly designed with an initial tension around a tenth of the strand’s breaking strength — set it, then lock the turnbuckle.',
        'Lock with jam nuts and a safety wire or loop; inspect after storms and through the summer, when heat and wind loosen fittings.',
      ],
    },
    {
      type: 'lead',
      html: 'On a construction site, guy wires hold temporary masts, lighting towers and scaffold hoists; on finished buildings, cables brace steel frames, carry shade sails and hold facade elements. The turnbuckle is the adjustable link in every one of them, but it is never alone. This guide builds the whole assembly, end to end. For the turnbuckle itself — end fittings, ratings and locking — see <a href="/blog/how-to-choose-and-tension-a-turnbuckle">how to choose and tension a turnbuckle</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The assembly, end to end.', anchor: 'assembly' },
    {
      type: 'prose',
      html: '<ol><li><strong>Anchor</strong> — a ground anchor, embedded plate or structural lug rated for the guy load.</li><li><strong>Shackle</strong> — joins the anchor to the turnbuckle; a <a href="/p/bolt-type-anchor-shackle-g-2130-pattern">bolt-type shackle</a> for anything permanent.</li><li><strong>Turnbuckle</strong> — eye or jaw ends, rated at least for the design tension.</li><li><strong>Thimble</strong> — inside every rope eye, to stop the rope crushing and wearing. See <a href="/blog/wire-rope-thimble-types">wire rope thimble types</a>.</li><li><strong>Wire rope</strong> — sized for the load with the design factor your engineer specifies.</li><li><strong>Termination</strong> — wire rope clips or a pressed ferrule. See <a href="/blog/wire-rope-clips-installation">wire rope clips installation</a> for numbers, spacing and torque.</li></ol>',
    },
    {
      type: 'direct_answer',
      question: 'What size turnbuckle do I need for a guy wire?',
      answer:
        'One whose rated load, for the end fittings you use, is at least the guy’s design tension — and that matches the wire rope, clips, thimbles and anchor in the same line. Use eye or jaw ends for permanent guys, and check the rating on the turnbuckle’s size table rather than the thread size.',
    },

    { type: 'section_head', number: '/02', title: 'Matching the parts.', anchor: 'matching' },
    {
      type: 'comparison_table',
      caption: 'Matching a guy or brace line',
      columns: ['Part', 'Match it to'],
      rows: [
        { cells: ['Turnbuckle', 'Design tension, using the rating for its end fittings'] },
        { cells: ['Wire rope', 'Design tension × the design factor the engineer specifies'], highlight: true },
        { cells: ['Thimble', 'The rope diameter, and the shackle or turnbuckle pin it sits on'] },
        { cells: ['Clips or ferrule', 'The rope diameter and construction; clip count by rope size'] },
        { cells: ['Shackle', 'At least the design tension; pin fits the turnbuckle eye or jaw'] },
        { cells: ['Anchor', 'The design tension, as calculated for the ground or structure'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Setting the tension.', anchor: 'tension' },
    {
      type: 'paragraph',
      html: 'Guyed towers are commonly designed with an initial tension of around 10% of the guy strand’s published breaking strength — enough to keep the mast stable without overloading the guys when the wind blows. Your engineer or the mast supplier sets the figure for your structure. Bring each guy up gradually and in sequence around the mast so it stays plumb, turning the turnbuckle body with a spanner on its flats; for bracing and shade cables, tension to the designer’s figure and check the structure stays true.',
    },

    { type: 'section_head', number: '/04', title: 'Locking it for the long term.', anchor: 'locking' },
    {
      type: 'paragraph',
      html: 'Wind makes guys and cables vibrate, and vibration turns an unlocked turnbuckle. Once the tension is set, tighten the <strong>jam nuts</strong> against the body and add <strong>locking wire</strong> through the body and end fittings. On guyed towers a common extra measure is a <strong>safety loop</strong>: a length of guy strand woven through both turnbuckle eyes and the anchor and clipped, so that if the turnbuckle ever let go the guy would still be held.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Gulf conditions.',
      body: 'Heat expands steel and slackens guys through the day; sand and salt attack threads. Use hot-dip galvanised or stainless parts, re-check tension after the first hot week and after storms, and include guy assemblies in the site’s periodic inspection — see stainless vs galvanised rigging in the Gulf.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How tight should a guy wire be?', answer: 'To the designer’s figure. Guyed towers are commonly designed with an initial tension around 10% of the strand’s breaking strength, but your structure’s design governs.' },
        { question: 'Should a guy wire turnbuckle have hook ends?', answer: 'Not on permanent guys. Use eye or jaw ends; hooks are rated lower and can come off a slack line.' },
        { question: 'Do I need a thimble in a guy wire eye?', answer: 'Yes. A thimble protects the rope eye from crushing and wear where it bears on the turnbuckle or shackle.' },
        { question: 'How do I stop guy wire turnbuckles loosening?', answer: 'Tighten the jam nuts, add locking wire through the body and ends, and consider a safety loop of strand through the turnbuckle eyes and anchor.' },
        { question: 'Galvanised or stainless for outdoor bracing?', answer: 'Hot-dip galvanised for most structural and site work; stainless where corrosion is severe or appearance matters, such as coastal facades.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For guy and bracing assemblies',
      skus: ['IH-LR-TB-US', 'IH-LR-TB-D1480', 'IH-LR-TB-D1478TG', 'IH-LR-TB-SSD1480T', 'IH-LR-SH-G2130'],
    },
    {
      type: 'category_link',
      slug: 'wire-rope-fittings',
      label: 'Wire rope and fittings',
      blurb: 'Steel wire rope, clips, thimbles, ferrules and terminals.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['how-to-choose-and-tension-a-turnbuckle', 'wire-rope-clips-installation', 'wire-rope-thimble-types', 'din-1480-vs-din-1478-turnbuckle', 'wire-rope-construction-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Guy tension practice from published guyed-tower design guidance (commonly ~10% of breaking strength); safety loop practice from tower-guy suppliers; turnbuckle rules from makers’ warnings. Your engineer’s design governs.',
    },
    {
      type: 'cta_block',
      heading: 'Building guy or bracing assemblies?',
      body: 'Send the design tension, rope size and end connections. We will quote turnbuckles, thimbles, clips and shackles that match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
