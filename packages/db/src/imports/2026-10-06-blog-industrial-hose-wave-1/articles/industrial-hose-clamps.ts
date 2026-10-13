import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The clamps shelf, read from its 20 listings. The point the article makes is
 * the one the shelf itself makes by what it stocks: there is no worm-drive band
 * on it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'industrial-hose-clamps',
  title: 'Industrial hose clamps: which clamp for which hose, and why the band is not on the list',
  excerpt:
    'Safety, interlocking, bolted, spiral and sanitary clamps each solve a different problem on an industrial hose. How to choose one, size it and fit it, and when a crimped ferrule beats every clamp.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which clamp should I use on an industrial hose?',
      answer:
        'Choose by duty. A forged safety clamp to EN 14420-3 / DIN 2817 on a matching fitting for chemical and oil transfer; an EN 14423 clamp for European steam couplings; an interlocking or bolted clamp sized to the hose outside diameter for general transfer and suction hose; a spiral clamp where the hose has an external helix; and a sanitary clamp on food and pharmaceutical lines. A worm-drive band is for low-pressure soft hose only — and where a joint must not fail, a crimped ferrule beats any clamp.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A clamp\'s job is to press the hose evenly onto a serrated tail; the more evenly it does that, the more pressure the joint holds.',
        'Size to the hose outside diameter, not the bore — two hoses of one bore can differ by several millimetres over the cover.',
        'Safety clamps (EN 14420-3 / DIN 2817) grip a collar on the fitting as well as the hose, which a band cannot.',
        'Interlocking and bolted clamps are the workhorses for suction and delivery hose; spiral clamps follow an external helix.',
        'Crimped ferrules and sleeves remove the clamp as a variable, and are the better answer for any joint that must not let go.',
      ],
    },
    {
      type: 'lead',
      html: 'Look along the clamps shelf and one thing is missing: the worm-drive band that holds half the hoses in the world onto their nipples. That is deliberate. A band squeezes a hose along one thin line, it loosens as the rubber relaxes, and its rating is whatever it happens to be that day. Every clamp we stock exists because <strong>a specific hose and duty needed something better</strong> — and choosing between them is mostly a matter of reading the hose.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a clamp has to do.',
      anchor: 'what-it-does',
    },
    {
      type: 'paragraph',
      html: 'A serrated tail holds a hose only as well as the hose is pressed onto it. The clamp provides that pressure, and the way it applies it decides the joint: evenly around the full circumference and along a good length of the tail, the serrations grip; on one narrow line, they cut. A good clamp also stays tight as the hose wall creeps and the temperature cycles, which is where a band fails first.',
    },
    {
      type: 'comparison_table',
      caption: 'Our clamps, by duty',
      columns: ['Clamp', 'Use it for', 'Listed sizes / materials'],
      rows: [
        { cells: ['Safety clamp, EN 14420-3 / DIN 2817', 'Chemical, oil and steam transfer on EN 14420-5 fittings', 'Forged aluminium, forged brass, 316'], highlight: true },
        { cells: ['EN 14423 clamp', 'European steam hose couplings', 'Brass or 316'] },
        { cells: ['Interlocking clamp', 'Suction and delivery hose on nipples and shanks', 'Carbon steel, malleable iron'] },
        { cells: ['Single / double bolt clamp', 'General transfer hose; super version for heavier duty', 'Carbon steel, malleable iron or 304 by type; hollow or solid'] },
        { cells: ['Spiral clamp', 'Hose with an external helix', '1-1/2" – 12", carbon steel'] },
        { cells: ['Sanitary clamps (single pin, double pin, bolted, 3-segment)', 'Food, dairy and pharmaceutical tri-clamp joints', '3/4" – 12", 304 / 316 / 316L'] },
        { cells: ['Grooved clamp', 'Grooved-end pipe joints', '2" – 10", forged carbon steel, NBR gasket'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Safety clamps and steam clamps.',
      anchor: 'safety-clamps',
    },
    {
      type: 'paragraph',
      html: 'The forged safety clamp to EN 14420-3 — long known as DIN 2817 — is the clamp of chemical and oil transfer. It bolts around the hose in two halves and grips both the hose cover and a collar machined on the fitting, so it locks the fitting into the hose instead of relying on friction alone. It works with EN 14420-5 GA and GI fittings and is pointless on a plain barb. The EN 14423 clamp is its steam counterpart, for the European steam hose coupling system.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Interlocking, bolted and spiral clamps.',
      anchor: 'bolted',
    },
    {
      type: 'paragraph',
      html: 'For suction and delivery hose on KC nipples, cam-lock shanks and Bauer or Storz tails, the workhorses are the <strong>interlocking clamp</strong> and the <strong>single or double bolt clamp</strong>. Both close around the hose with bolts rather than a screw band, both apply pressure across a wide face, and both can be re-tightened after the first pressurisation, when the hose takes its set. A <strong>spiral clamp</strong> follows the external helix on a suction hose, so it bears on the rubber between the coils instead of riding up on the wire.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Measure the outside diameter.',
      body: 'Bolted and interlocking clamps are sized to the hose OD. A clamp chosen by bore can bottom out before it grips, or fail to close. Measure over the cover — and remeasure if you change hose maker, because the same bore can carry a different wall.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Sanitary, drag hose and frac clamps.',
      anchor: 'special',
    },
    {
      type: 'paragraph',
      html: 'Food, dairy and pharmaceutical lines join on sanitary (tri-clamp) ferrules, and our heavy-duty sanitary clamps — single pin with a wing nut, double pin, double-pressure bolted and three-segment — run in 304, 316 and 316L from 3/4" to 12". Drag hose for slurry and manure has its own set: an aluminium drag hose clamp, a sleeve and a coupling ring clamp from 4" to 10". And the frac-water couplings on our KC shelf use a three-segment aluminium clamp from 8" to 16".',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'When to crimp instead.',
      anchor: 'crimp',
    },
    {
      type: 'paragraph',
      html: 'Every clamp leaves the joint dependent on someone fitting and re-tightening it. A crimped ferrule or sleeve removes that variable: it is swaged once, to a diameter, and it stays there. Our ferrules and sleeves for KC and cam-lock shanks, our heavy-duty ferrule rated 300 psi and our sanitary-style crimp ferrules all do that job, and CrimpTEK cam and groove halves are machined to be crimped directly. On any line where a separated hose would hurt someone or spill something, crimping is the better answer.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can I use a worm-drive hose clip on a suction hose?',
          answer:
            'Only on light, low-pressure duty. For suction and delivery hose use an interlocking or bolted clamp sized to the hose OD, or a crimped ferrule.',
        },
        {
          question: 'What is a DIN 2817 safety clamp?',
          answer:
            'A forged two-piece bolted clamp that grips both the hose and a collar on the fitting. The design is standardised as EN 14420-3 and is used with EN 14420-5 fittings.',
        },
        {
          question: 'How do I size a hose clamp?',
          answer:
            'By the outside diameter of the hose, measured over the cover. Our sleeves for KC and cam-lock shanks are listed with the bore range they fit for each hose size.',
        },
        {
          question: 'Should I re-tighten a bolted clamp?',
          answer:
            'Yes — after the first pressurisation or heat cycle, when the hose wall settles, and at each inspection after that.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Clamps for industrial hose',
      skus: [
        'IH-CLP-SAFETY-14420-3',
        'IH-CLP-EN-14423',
        'IH-CLP-INTERLOCKING',
        'IH-CLP-DOUBLE-BOLT',
        'IH-CLP-DOUBLE-BOLT-SUPER',
        'IH-CLP-SINGLE-BOLT',
        'IH-CLP-SPIRAL',
        'IH-CLP-SAN-SINGLE-PIN',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Ferrules and sleeves',
      skus: ['IH-CLP-FERRULE-KC-CAMLOCK', 'IH-CLP-SLEEVE-KC-CAMLOCK', 'IH-CLP-FERRULE-HD', 'IH-CLP-FERRULE-SANITARY'],
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps, sleeves and ferrules',
      blurb: 'Safety, steam, interlocking, bolted, spiral and sanitary clamps; crimp ferrules and sleeves.',
    },
    {
      type: 'category_link',
      slug: 'en14420-5-fittings',
      label: 'EN 14420-5 fittings',
      blurb: 'GA and GI fittings made for the safety clamp.',
    },

    {
      type: 'cta_block',
      heading: 'Not sure which clamp the hose needs?',
      body: 'Send the hose, its outside diameter, the fitting and the working pressure. We will quote the clamp or the ferrule that suits the duty.',
      quoteLabel: 'Quote hose clamps',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Clamp types, sizes, materials and standards checked against our clamps, sleeves and ferrules listings.',
    },
  ],
}

export default ARTICLE
