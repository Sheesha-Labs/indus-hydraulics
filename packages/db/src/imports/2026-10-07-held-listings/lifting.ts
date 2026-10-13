/**
 * Seventeen H-Quality lifting families imported on 2026-09-25 with no size
 * table: thirteen fibre ropes and twines, two electric wire rope hoists and two
 * R-T-J cluster hooks. H-Quality's pages give the fibre, size range,
 * construction and packing for the ropes; frame dimensions but no capacity for
 * the hoists; and an ultimate load and weight for the hooks. Nothing here adds
 * a size the maker did not list or a load it did not publish: the ropes and
 * hoists stay unrated ("load rating on request"), as every unrated lifting
 * family on the site does.
 *
 * General fibre data (specific gravity, melting point) is from the NSW
 * Government dogging and rigging guide, "Construction of fibre rope". The
 * R-T-J hook description follows towing-equipment suppliers' descriptions of
 * the R, T and mini-J hooks.
 */
import type { Entry, Faq, Spec } from './types'

const HQ = 'H-Quality product page (Source Exports/H-Quality, h-quality-product-descriptions)'
const NSW = 'NSW Government, Dogging and rigging guide — Construction of fibre rope'

type Fibre = 'pp' | 'pe' | 'nylon' | 'polyester'
const FIBRE: Record<Fibre, { name: string; sg: string; melt: string; floats: boolean }> = {
  pp: { name: 'polypropylene', sg: '0.91', melt: 'about 165 °C', floats: true },
  pe: { name: 'polyethylene', sg: '0.95', melt: 'about 135 °C', floats: true },
  nylon: { name: 'nylon (polyamide)', sg: '1.14', melt: 'about 250 °C', floats: false },
  polyester: { name: 'polyester', sg: '1.38', melt: 'about 260 °C', floats: false },
}
const ISO: Record<Fibre, string> = {
  pp: 'ISO 1346',
  pe: 'ISO 1969',
  nylon: 'ISO 1140',
  polyester: 'ISO 1141',
}

const p = (s: string) => `<p>${s}</p>`
const h3 = (s: string) => `<h3>${s}</h3>`
const ul = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
const spec = (group: string, label: string, value: string, key?: string): Spec => ({
  group,
  label,
  value,
  ...(key ? { key } : {}),
})

const NO_RATING_ROPE = p(
  '<strong>No load rating is published for this range.</strong> The maker gives a size range but no breaking loads. Tell us the diameter and the duty and we will confirm the breaking load with the quotation, with a test certificate if you need one. Do not use it to lift until you have that rating in writing.'
)
const ORDERING_ROPE = p(
  'Send the fibre, diameter, construction, colour and length you need, with any standard the rope must meet, and we will confirm the specification and lead time on the quotation.'
)

const fibreChoiceFaq: Faq = {
  question: 'Which fibre should I choose?',
  answer:
    'Polypropylene floats and is economical; polyethylene is similar and resists abrasion; nylon stretches and absorbs shock, which suits mooring; polyester stretches least and holds up best in sunlight. State the diameter, construction and length you need.',
}
const floatFaq = (fibres: Fibre[]): Faq => {
  if (fibres.length === 1) {
    const f = FIBRE[fibres[0]!]
    return {
      question: 'Does it float?',
      answer: f.floats
        ? `Yes. ${cap(f.name)} has a specific gravity of about ${f.sg}, lighter than water, so the rope floats — useful for lines that must stay clear of propellers or be easy to recover.`
        : `No. ${cap(f.name)} has a specific gravity of about ${f.sg}, so the rope sinks.`,
    }
  }
  return {
    question: 'Does it float?',
    answer:
      'That depends on the fibre. Polypropylene (specific gravity about 0.91) and polyethylene (about 0.95) float; nylon (about 1.14) and polyester (about 1.38) sink. Choose the fibre with that in mind.',
  }
}
const ratingFaqRope: Faq = {
  question: 'What is the breaking load?',
  answer:
    'No load rating is published for this range: the maker gives a size range but no breaking loads. Tell us the diameter and duty and we will confirm the breaking load on the quotation. A breaking load is a test figure, never a working limit.',
}
const standardFaq = (fibres: Fibre[]): Faq => ({
  question: 'Can you supply it to a standard?',
  answer: `Ask for it on the RFQ. Fibre ropes are made to product standards by fibre — ${fibres
    .map((f) => `${ISO[f]} for ${FIBRE[f].name}`)
    .join(
      ', '
    )} — and tested to ISO 2307. We confirm on the quotation which standard and test certificate the rope comes with.`,
})
const suppliedFaq = (packing: string): Faq => ({
  question: 'How is it supplied?',
  answer: `In ${packing}, in the colour you specify. Give the length you need and we confirm the put-up on the quotation.`,
})

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** "coil, hank, reel" → "coils, hanks or reels". */
function plural(list: string): string {
  const words = list.split(', ').map((w) => `${w}s`)
  return words.length > 1
    ? `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}`
    : words[0]!
}

type Rope = {
  sku: string
  was: string
  name: string
  fibres: Fibre[]
  /** As the maker states it. */
  material: string
  size: string
  construction: string
  packing: string
  short: string
  seo: string
  intro: string[]
  constructionNote: string
  extraFaqs: Faq[]
}

function rope(r: Rope): Entry {
  const single = r.fibres.length === 1 ? FIBRE[r.fibres[0]!] : null
  const fibreLines = r.fibres.map(
    (f) =>
      `${cap(FIBRE[f].name)}: specific gravity about ${FIBRE[f].sg} (${FIBRE[f].floats ? 'floats' : 'sinks'}), melts at ${FIBRE[f].melt}.`
  )
  return {
    sku: r.sku,
    was: r.was,
    seoDescription: r.seo,
    descriptionShort: r.short,
    descriptionLong: [
      ...r.intro.map(p),
      h3('Specification'),
      ul([
        `<strong>Material:</strong> ${r.material}`,
        `<strong>Size:</strong> ${r.size}`,
        `<strong>Construction:</strong> ${r.construction}`,
        `<strong>Packing:</strong> ${r.packing}`,
        '<strong>Colour:</strong> to order',
      ]),
      h3('Construction'),
      p(r.constructionNote),
      h3('The fibre'),
      ul(fibreLines),
      p(
        'Polypropylene floats and is economical; polyethylene is similar and resists abrasion; nylon stretches and absorbs shock; polyester stretches least and holds up best in sunlight.'
      ),
      h3('Load rating'),
      NO_RATING_ROPE,
      h3('Ordering'),
      ORDERING_ROPE,
      p(
        'See the <a href="/c/fibre-rope-twine">fibre rope and twine range</a> for ropes with published breaking loads.'
      ),
    ].join(''),
    faqs: [
      fibreChoiceFaq,
      floatFaq(r.fibres),
      ratingFaqRope,
      ...r.extraFaqs,
      standardFaq(r.fibres),
      suppliedFaq(plural(r.packing)),
    ],
    specs: [
      spec('Identification', 'Product type', r.name, 'product_type'),
      spec('Dimensions', 'Size range', r.size, 'size_range'),
      spec('Construction', 'Material', single ? cap(single.name) : r.material, 'material'),
      spec('Construction', 'Construction', r.construction),
      spec('Performance', 'Working load limit', 'Load rating on request', 'wll_range'),
      spec(
        'Performance',
        'Minimum breaking load',
        'Not published — confirmed on quotation',
        'breaking_load_range'
      ),
      spec('Commercial', 'Packing', cap(r.packing)),
      spec('Commercial', 'Colour', 'To order'),
      ...(single
        ? [
            spec(
              'Construction',
              'Specific gravity',
              `${single.sg} — ${single.floats ? 'floats' : 'sinks'}`
            ),
            spec('Construction', 'Melting point', cap(single.melt)),
          ]
        : [
            spec(
              'Construction',
              'Buoyancy',
              'Polypropylene and polyethylene float; nylon and polyester sink'
            ),
          ]),
    ],
    sources: [HQ, NSW],
  }
}

type Twine = {
  sku: string
  was: string
  name: string
  fibre: Fibre
  material: string
  denier: string
  short: string
  seo: string
  intro: string
  uses: string
  packing: string
}

function twine(t: Twine): Entry {
  const f = FIBRE[t.fibre]
  return {
    sku: t.sku,
    was: t.was,
    seoDescription: t.seo,
    descriptionShort: t.short,
    descriptionLong: [
      p(t.intro),
      h3('Specification'),
      ul([
        `<strong>Material:</strong> ${t.material}`,
        `<strong>Size:</strong> ${t.denier}-denier yarn, from 3-ply to 96-ply (${t.denier}D/3 to ${t.denier}D/96)`,
        `<strong>Packing:</strong> ${t.packing}`,
        '<strong>Colour:</strong> to order',
      ]),
      h3('Reading the size'),
      p(
        `Twine is sized by yarn and ply, not diameter. ${t.denier}D means the yarn has a linear density of ${t.denier} denier — ${t.denier} grams per 9,000 metres — and the figure after the slash is the number of plies twisted together. More plies give a thicker, stronger twine: ${t.denier}D/3 is a fine twine, ${t.denier}D/96 a heavy one.`
      ),
      h3('The fibre'),
      p(
        `${cap(f.name)} has a specific gravity of about ${f.sg}, so the twine ${f.floats ? 'floats' : 'sinks'}, and it melts at ${f.melt}. ${t.uses}`
      ),
      h3('Breaking strength'),
      p(
        'The maker lists the yarn and plies but publishes no breaking strengths. Tell us the ply and what the twine is for and we will confirm the breaking strength with the quotation.'
      ),
      h3('Ordering'),
      p(
        'Send the yarn, ply, colour, packing and quantity you need, and we will confirm the specification and lead time on the quotation.'
      ),
    ].join(''),
    faqs: [
      {
        question: `What does ${t.denier}D/3 mean?`,
        answer: `${t.denier}D is the yarn's linear density, ${t.denier} denier, or ${t.denier} grams per 9,000 metres of yarn. The number after the slash is the number of plies twisted together, so ${t.denier}D/3 is three plies. This twine runs from 3-ply to 96-ply.`,
      },
      {
        question: 'Which ply should I order?',
        answer:
          'Match the ply to the load and the job: more plies make a thicker, stronger twine. If you are replacing an existing twine, send its marking or a sample length and we match it.',
      },
      {
        question: 'Does it float?',
        answer: f.floats
          ? `Yes. ${cap(f.name)} has a specific gravity of about ${f.sg}, lighter than water.`
          : `No. ${cap(f.name)} has a specific gravity of about ${f.sg}, so the twine sinks.`,
      },
      {
        question: 'What is the breaking strength?',
        answer:
          'The maker publishes no breaking strengths for this twine. Tell us the ply and the use and we will confirm the breaking strength on the quotation.',
      },
      {
        question: 'How is it supplied?',
        answer: `In ${plural(t.packing)}, in the colour you specify.`,
      },
    ],
    specs: [
      spec('Identification', 'Product type', t.name, 'product_type'),
      spec(
        'Dimensions',
        'Size range',
        `${t.denier}D/3 to ${t.denier}D/96 (3- to 96-ply)`,
        'size_range'
      ),
      spec('Construction', 'Material', cap(f.name), 'material'),
      spec('Construction', 'Yarn', `${t.denier} denier`),
      spec('Construction', 'Plies', '3 to 96'),
      spec('Construction', 'Specific gravity', `${f.sg} — ${f.floats ? 'floats' : 'sinks'}`),
      spec('Construction', 'Melting point', cap(f.melt)),
      spec('Performance', 'Breaking strength', 'Not published — confirmed on quotation'),
      spec('Commercial', 'Packing', cap(t.packing)),
      spec('Commercial', 'Colour', 'To order'),
    ],
    sources: [HQ, NSW],
  }
}

const TWISTED_NOTE =
  'A twisted (laid) rope is three or four strands twisted together. It is easy to splice and to inspect, because damage shows on the surface, and it stretches more than a braid of the same fibre. Under load a laid rope tends to unlay, so it can kink or hockle if it is twisted against its lay.'

const ROPES: Entry[] = [
  rope({
    sku: 'IH-LR-FR-16B',
    was: '16-Strand Braided Rope',
    name: '16-strand braided rope',
    fibres: ['pp', 'pe', 'polyester', 'nylon'],
    material: 'Polyethylene, polypropylene, polyester, nylon or cotton',
    size: '3–30 mm',
    construction: '16-strand braid',
    packing: 'coil, hank, bundle, reel',
    short:
      '16-strand braided rope from 3 to 30 mm, in polyethylene, polypropylene, polyester, nylon or cotton: a round, smooth, flexible braid that runs well through blocks and cleats. Colour and packing to order.',
    seo: '16-strand braided rope, 3–30 mm, in PE, PP, polyester, nylon or cotton. Colour and packing to order. Breaking load confirmed on quotation. Request a quote.',
    intro: [
      'A 16-strand braided rope in diameters from 3 to 30 mm, braided from polyethylene, polypropylene, polyester, nylon or cotton. Sixteen strands plaited together make a round, smooth and flexible rope that handles well and runs easily over sheaves and through cleats.',
      'Braids like this are used for general-purpose lines, lashings, halyards and sheets, and wherever a rope is handled often. Choose the fibre for the job: the maker supplies the same construction in five materials.',
    ],
    constructionNote:
      'A braided rope does not unlay under load the way a twisted rope does, so it is less prone to kinking and keeps its shape on a winch or a reel. With sixteen strands, each strand is finer than in an 8-strand braid of the same diameter, which gives a smoother surface.',
    extraFaqs: [
      {
        question: 'Braided or twisted rope?',
        answer:
          'A braid is round, flexible and does not unlay under load, so it resists kinking and runs smoothly through blocks. A twisted rope is cheaper, easier to splice and easier to inspect. Choose the braid for lines that are handled and run often.',
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-8B',
    was: '8-Strand Braided Rope',
    name: '8-strand braided rope',
    fibres: ['pp', 'pe', 'polyester', 'nylon'],
    material: 'Polyethylene, polypropylene, polyester, nylon or cotton',
    size: '3–20 mm',
    construction: '8-strand braid',
    packing: 'coil, hank, bundle, reel',
    short:
      '8-strand braided rope from 3 to 20 mm, in polyethylene, polypropylene, polyester, nylon or cotton: a flexible braid that does not unlay under load and resists kinking. Colour and packing to order.',
    seo: '8-strand braided rope, 3–20 mm, in PE, PP, polyester, nylon or cotton. Colour and packing to order. Breaking load confirmed on quotation. Request a quote.',
    intro: [
      'An 8-strand braided rope in diameters from 3 to 20 mm, braided from polyethylene, polypropylene, polyester, nylon or cotton. Eight strands plaited together give a flexible rope that keeps its shape and does not unlay under load.',
      'At these diameters it is a general-purpose cord and light line for lashing and tying, and for handling work where a twisted rope would kink. Choose the fibre for the job.',
    ],
    constructionNote:
      'A braided rope resists kinking because it does not unlay under load the way a laid rope does. Eight strands make a coarser braid than sixteen, with fewer, thicker strands on the surface.',
    extraFaqs: [
      {
        question: 'Braided or twisted rope?',
        answer:
          'A braid does not unlay under load, so it resists kinking and handles well. A twisted rope is cheaper and easier to splice and inspect. For cords and light lines that are tied and untied often, the braid is usually easier to live with.',
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-8HAW',
    was: '8-Strand Mooring Hawser',
    name: '8-strand mooring hawser',
    fibres: ['pp', 'pe', 'polyester', 'nylon'],
    material: 'Polyethylene, polypropylene, polyester or nylon',
    size: '40–120 mm',
    construction: '8-strand plaited',
    packing: 'coil',
    short:
      '8-strand mooring hawser from 40 to 120 mm, in polyethylene, polypropylene, polyester or nylon, supplied in coils. A heavy plaited rope for ship mooring and towing lines; breaking load confirmed on the quotation.',
    seo: '8-strand mooring hawser, 40–120 mm, in PE, PP, polyester or nylon, supplied in coils. Breaking load confirmed on quotation. Request a quote.',
    intro: [
      'An 8-strand mooring hawser in diameters from 40 to 120 mm, in polyethylene, polypropylene, polyester or nylon, supplied in coils. Hawsers are the heavy lines that hold a ship to a berth or a buoy, and serve as towing lines.',
      'The fibre decides how the line behaves: nylon stretches and absorbs shock loads from swell, polyester stretches least, and polypropylene and polyethylene float and cost less.',
    ],
    constructionNote:
      'An 8-strand plaited rope is made of four pairs of strands, two pairs laid each way. The opposing twists balance, so the rope does not rotate or kink under load and is flexible to handle on deck — the reason the construction is common for mooring lines.',
    extraFaqs: [
      {
        question: 'Can you supply hawsers to OCIMF guidelines?',
        answer:
          "Terminals and tanker operators often specify mooring lines against OCIMF's Mooring Equipment Guidelines (MEG4). Put the requirement and the line design break force on the RFQ and we confirm on the quotation what the hawser can be supplied with.",
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-PECOL',
    was: 'Coloured Polyethylene Rope',
    name: 'Coloured polyethylene rope',
    fibres: ['pe'],
    material: 'HDPE (polyethylene)',
    size: '4–60 mm',
    construction: '3-strand or 4-strand twisted',
    packing: 'coil, hank, bundle, reel',
    short:
      'Coloured polyethylene rope from 4 to 60 mm, 3- or 4-strand twisted HDPE in the colour you specify. Light, it floats and resists abrasion; used for marine, fishing, agricultural and general lines.',
    seo: 'Coloured polyethylene (HDPE) rope, 4–60 mm, 3- or 4-strand, floats. Colour to order; breaking load confirmed on quotation. Request a quote.',
    intro: [
      'A twisted polyethylene rope in diameters from 4 to 60 mm, laid in three or four strands from HDPE and coloured to order. Colour lets lines be told apart on deck or on site, by job or by owner.',
      'Polyethylene is light, floats and resists abrasion, which makes it a common choice for marine and fishing lines, agricultural ties and general-purpose rope.',
    ],
    constructionNote: TWISTED_NOTE,
    extraFaqs: [
      {
        question: 'Which colours are available?',
        answer:
          'The maker makes it to the colour you order. Name the colour, or the colours for multi-colour rope, on the RFQ and we confirm it on the quotation.',
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-PETW',
    was: 'Polyethylene Twisted Rope',
    name: 'Polyethylene twisted rope',
    fibres: ['pe'],
    material: 'HDPE (polyethylene)',
    size: '6–20 mm',
    construction: '3-strand or 4-strand twisted',
    packing: 'coil, hank, bundle, reel',
    short:
      'Polyethylene twisted rope from 6 to 20 mm, laid in three or four strands from HDPE. Light, it floats and resists abrasion; easy to splice and inspect. Colour and packing to order.',
    seo: 'Polyethylene (HDPE) twisted rope, 6–20 mm, 3- or 4-strand, floats. Colour and packing to order; breaking load confirmed on quotation. Request a quote.',
    intro: [
      'A twisted polyethylene rope in diameters from 6 to 20 mm, laid in three or four strands from HDPE. It is a light, floating, abrasion-resistant rope for marine, fishing and general use.',
      'At these diameters it is used for mooring small craft, buoy and float lines, tie-downs and general lashing.',
    ],
    constructionNote: TWISTED_NOTE,
    extraFaqs: [
      {
        question: 'Polyethylene or polypropylene rope?',
        answer:
          'Both float and both are economical. Polyethylene resists abrasion better; polypropylene is lighter, with a specific gravity of about 0.91 against about 0.95. Choose polyethylene where the rope drags over decks or rocks.',
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-DAN',
    was: 'Polypropylene Danline Rope',
    name: 'Polypropylene danline rope',
    fibres: ['pp'],
    material: 'Polypropylene',
    size: '4–60 mm',
    construction: '3-strand or 4-strand twisted',
    packing: 'coil, hank, bundle, reel',
    short:
      'Polypropylene danline rope from 4 to 60 mm, laid in three or four strands. Light, it floats and resists rot and most common chemicals; used for mooring, fishing and general marine lines. Colour to order.',
    seo: 'Polypropylene danline rope, 4–60 mm, 3- or 4-strand, floats. Colour and packing to order; breaking load confirmed on quotation. Request a quote.',
    intro: [
      'A polypropylene danline rope in diameters from 4 to 60 mm, laid in three or four strands. Danline is a type of polypropylene rope, made from a different polypropylene yarn than monofilament rope.',
      'Like all polypropylene rope it is light and floats, and it does not rot. It is widely used for mooring and docking lines, fishing and pot lines, and general marine and industrial lashing.',
    ],
    constructionNote: TWISTED_NOTE,
    extraFaqs: [
      {
        question: 'What is danline rope?',
        answer:
          "Danline is a polypropylene rope made from its own type of polypropylene yarn, distinct from monofilament polypropylene rope. It shares polypropylene's properties: it floats and does not rot. Send a sample or the rope you use now if you need a match.",
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-PPMR',
    was: 'Polypropylene Multifilament Rope',
    name: 'Polypropylene multifilament rope',
    fibres: ['pp'],
    material: 'Polypropylene multifilament',
    size: '4–60 mm',
    construction: '3-strand or 4-strand twisted',
    packing: 'coil, hank, bundle, reel',
    short:
      'Polypropylene multifilament rope from 4 to 60 mm, laid in three or four strands from fine continuous filaments. Softer to handle than film or monofilament rope; it floats. Colour and packing to order.',
    seo: 'Polypropylene multifilament rope, 4–60 mm, 3- or 4-strand, floats, soft handling. Colour to order; breaking load confirmed on quotation.',
    intro: [
      'A polypropylene multifilament rope in diameters from 4 to 60 mm, laid in three or four strands. Multifilament yarn is spun from many fine continuous filaments, which gives a softer, smoother rope than split-film or monofilament polypropylene.',
      'It floats, does not rot and is kind to hands, so it is used for marine and boat lines and general rope work where it is handled a lot.',
    ],
    constructionNote: TWISTED_NOTE,
    extraFaqs: [
      {
        question: 'Multifilament, monofilament or split-film polypropylene?',
        answer:
          'They differ in the yarn. Multifilament is made of many fine filaments and is the softest to handle. Monofilament uses thicker single filaments and is stiffer; split-film is made from slit film and is the most economical. All three float.',
      },
    ],
  }),
  rope({
    sku: 'IH-LR-FR-PPTW',
    was: 'Polypropylene Twisted Rope',
    name: 'Polypropylene twisted rope',
    fibres: ['pp'],
    material: 'Polypropylene',
    size: '4–30 mm',
    construction: '3-strand or 4-strand twisted',
    packing: 'coil, hank, bundle, reel',
    short:
      'Polypropylene twisted rope from 4 to 30 mm, laid in three or four strands. The lightest common rope fibre: it floats, does not rot and is economical for marine, agricultural and general use. Colour to order.',
    seo: 'Polypropylene twisted rope, 4–30 mm, 3- or 4-strand, floats. Colour and packing to order; breaking load confirmed on quotation. Request a quote.',
    intro: [
      'A twisted polypropylene rope in diameters from 4 to 30 mm, laid in three or four strands. Polypropylene is the lightest of the common rope fibres, with a specific gravity of about 0.91.',
      'It floats, does not rot and is economical, which makes it a general-purpose rope for marine and fishing lines, agriculture, packing and site use.',
    ],
    constructionNote: TWISTED_NOTE,
    extraFaqs: [
      {
        question: 'Three-strand or four-strand?',
        answer:
          'Both are twisted ropes. Three-strand is the more common and the easier to splice; four-strand has a rounder cross-section. State which you need on the RFQ.',
      },
    ],
  }),
]

const TWINES: Entry[] = [
  twine({
    sku: 'IH-LR-FR-NYT',
    was: 'Nylon Twine',
    name: 'Nylon twine',
    fibre: 'nylon',
    material: 'Polyamide (nylon)',
    denier: '210',
    short:
      'Nylon (polyamide) twine in 210-denier yarn from 3-ply to 96-ply, on hanks, spools or reels. Strong and elastic, it absorbs shock loads; widely used for fishing nets, netting and tying. Colour to order.',
    seo: 'Nylon (polyamide) twine, 210D from 3-ply to 96-ply, on hank, spool or reel. Colour to order; breaking strength confirmed on quotation.',
    intro:
      'Nylon twine in 210-denier polyamide yarn, from 3-ply to 96-ply, supplied on hanks, spools or reels. Nylon is the strongest and most elastic of the common synthetic fibres, so the twine absorbs shock loads without parting.',
    uses: 'Nylon multifilament twine is widely used to make and mend fishing nets, and for netting, tying and seaming.',
    packing: 'hank, spool, reel',
  }),
  twine({
    sku: 'IH-LR-FR-PET',
    was: 'Polyester Twine',
    name: 'Polyester twine',
    fibre: 'polyester',
    material: 'Polyester',
    denier: '210',
    short:
      'Polyester twine in 210-denier yarn from 3-ply to 96-ply, on hanks, spools or reels. Low-stretch and resistant to sunlight; used for netting, sewing and whipping and tying work. Colour to order.',
    seo: 'Polyester twine, 210D from 3-ply to 96-ply, on hank, spool or reel. Low stretch, UV resistant. Colour to order; breaking strength on quotation.',
    intro:
      'Polyester twine in 210-denier yarn, from 3-ply to 96-ply, supplied on hanks, spools or reels. Polyester stretches least of the common rope fibres and holds up best in sunlight, so the twine keeps its length and strength outdoors.',
    uses: 'Polyester twine is used for netting, for sewing and whipping rope ends, and for tying work where stretch is unwelcome.',
    packing: 'hank, spool, reel',
  }),
  twine({
    sku: 'IH-LR-FR-PET2',
    was: 'Polyethylene Twine',
    name: 'Polyethylene twine',
    fibre: 'pe',
    material: 'HDPE (polyethylene)',
    denier: '380',
    short:
      'Polyethylene (HDPE) twine in 380-denier yarn from 3-ply to 96-ply, on hanks, spools or reels. Light, it floats and resists abrasion; used for fishing and aquaculture nets, agriculture and tying. Colour to order.',
    seo: 'Polyethylene (HDPE) twine, 380D from 3-ply to 96-ply, on hank, spool or reel. Floats. Colour to order; breaking strength on quotation.',
    intro:
      'Polyethylene twine in 380-denier HDPE yarn, from 3-ply to 96-ply, supplied on hanks, spools or reels. Polyethylene is light, floats and stands up to abrasion and water.',
    uses: 'Polyethylene twine is used for fishing and aquaculture nets, agricultural netting and general tying.',
    packing: 'hank, spool, reel',
  }),
  twine({
    sku: 'IH-LR-FR-PPMT',
    was: 'Polypropylene Multifilament Twine',
    name: 'Polypropylene multifilament twine',
    fibre: 'pp',
    material: 'Polypropylene multifilament',
    denier: '210',
    short:
      'Polypropylene multifilament twine in 210-denier yarn from 3-ply to 96-ply, on hanks, spools or reels. Soft, light and floating; used for netting, packing and general tying. Colour to order; breaking strength on quotation.',
    seo: 'Polypropylene multifilament twine, 210D from 3-ply to 96-ply, on hank, spool or reel. Floats. Colour to order; breaking strength on quotation.',
    intro:
      'Polypropylene multifilament twine in 210-denier yarn, from 3-ply to 96-ply, supplied on hanks, spools or reels. Multifilament yarn is spun from many fine filaments, so the twine is soft to handle as well as light.',
    uses: 'Polypropylene multifilament twine is used for netting, packing and general tying.',
    packing: 'hank, spool, reel',
  }),
  twine({
    sku: 'IH-LR-FR-PPST',
    was: 'Polypropylene Split-Film Twine',
    name: 'Polypropylene split-film twine',
    fibre: 'pp',
    material: 'Polypropylene split film',
    denier: '380',
    short:
      'Polypropylene split-film twine in 380-denier yarn from 3-ply to 96-ply, on hanks or spools. The economical polypropylene twine, made from slit film; used for agricultural baling and tying and packing. Colour to order.',
    seo: 'Polypropylene split-film twine, 380D from 3-ply to 96-ply, on hank or spool. Economical tying and baling twine. Breaking strength on quotation.',
    intro:
      'Polypropylene split-film twine in 380-denier yarn, from 3-ply to 96-ply, supplied on hanks or spools. Split-film yarn is made by slitting polypropylene film into fibres, which makes it the most economical polypropylene twine.',
    uses: 'Split-film twine is used for agricultural baling and tying, packing and general-purpose tying.',
    packing: 'hank, spool',
  }),
]

const HOIST_SOURCES = [
  HQ,
  'Abu Dhabi CoP 34.0 (ADPHC, v4.1, 2026)',
  'Dubai Municipality DM-HSD-GU48-ECLA2 V5.0 (2025)',
]

const hoistFaqs = (kind: 'foot' | 'low'): Faq[] => [
  {
    question: 'What does 2/1 reeving mean?',
    answer:
      'The hook hangs on two falls of rope: the rope runs from the drum down round the sheave in the bottom block and back up to the hoist frame. Each fall carries half the load, and the hook rises at half the rope speed.',
  },
  kind === 'foot'
    ? {
        question: 'What is a foot-mounted hoist for?',
        answer:
          'It is bolted down by its feet to a floor, wall, platform or frame instead of running on a beam, and lifts through a fixed point.',
      }
    : {
        question: 'What is a low-headroom hoist for?',
        answer:
          'It runs on a trolley with the hoist body beside the beam rather than hanging below it. That keeps the hook close to the beam, so it lifts higher in buildings with little height above the crane runway.',
      },
  {
    question: 'What capacities are available?',
    answer:
      'The maker lists three frame sizes for this hoist but its table gives no load rating. Tell us the load, lift and duty and we will confirm the capacity on the quotation; do not lift with it until you have that rating in writing.',
  },
  {
    question: 'What lifting heights are available?',
    answer:
      'Each frame size is listed for lifts of 6, 9, 12, 18, 24 and 30 m. The frame length grows with the lift, because the drum carries more rope.',
  },
  {
    question: 'Which supply does it need?',
    answer:
      'Electric wire rope hoists are specified to your supply. State the voltage, phase and frequency on the RFQ, with the control you want.',
  },
  {
    question: 'Does it need inspecting in the UAE?',
    answer:
      "Yes. Lifting equipment must be thoroughly examined by an approved or accredited third party at least every 12 months, under Abu Dhabi's CoP 34.0 and Dubai Municipality's GU48 guideline.",
  },
]

const HOISTS: Entry[] = [
  {
    sku: 'IH-LR-EH-FM',
    was: 'Foot-Mounted Electric Wire Rope Hoist — 2/1 Reeving',
    seoDescription:
      'Foot-mounted electric wire rope hoist, 2/1 reeving, three frame sizes, lifts of 6 to 30 m. Capacity confirmed on quotation. Request a quote.',
    descriptionShort:
      'Foot-mounted electric wire rope hoist with 2/1 reeving, bolted down by its feet for fixed lifting points. Three frame sizes, each for lifts of 6 to 30 m; capacity and supply confirmed on the quotation.',
    descriptionLong: [
      p(
        'A foot-mounted electric wire rope hoist with 2/1 reeving. Instead of running on a beam, it is bolted down by its feet to a floor, wall, platform or frame, and lifts through a fixed point.'
      ),
      p(
        'The maker builds it in three frame sizes, each for lifts of 6, 9, 12, 18, 24 and 30 m. The frame lengthens with the lift, because the drum carries more rope.'
      ),
      h3('2/1 reeving'),
      p(
        'The hook hangs on two falls of wire rope: from the drum down round the sheave in the bottom block and back up to the frame. Each fall carries half the load and the hook rises at half the rope speed, so a hoist reeved 2/1 lifts more, more slowly, than the same hoist reeved 1/1.'
      ),
      h3('Load rating'),
      p(
        '<strong>No load rating is published for this range.</strong> The maker gives frame dimensions but no capacity. Tell us the load, lift and duty and we will confirm the rating with the quotation. Do not use it to lift until you have that rating in writing.'
      ),
      h3('Choosing a hoist'),
      p(
        'Choose on capacity, lift, lifting speed and duty, and state your supply voltage, phase and frequency and the control you want on the RFQ. Allow for how often the hoist will run: duty, not capacity alone, sets how long it lasts.'
      ),
      h3('Inspection'),
      p(
        "In the UAE, lifting equipment must be thoroughly examined by an approved or accredited third party at least every 12 months, under Abu Dhabi's CoP 34.0 and Dubai Municipality's GU48 guideline."
      ),
      h3('Ordering'),
      p(
        'Send the capacity, lift, supply and quantity you need, and we will confirm the specification and lead time on the quotation.'
      ),
    ].join(''),
    faqs: hoistFaqs('foot'),
    specs: [
      spec(
        'Identification',
        'Product type',
        'Electric wire rope hoist, foot-mounted',
        'product_type'
      ),
      spec('Identification', 'Sizes', '3 frame sizes', 'sizes_count'),
      spec('Performance', 'Working load limit', 'Load rating on request', 'wll_range'),
      spec('Performance', 'Reeving', '2/1 (two falls)'),
      spec('Dimensions', 'Lifting heights', '6, 9, 12, 18, 24 or 30 m'),
      spec('Construction', 'Lifting medium', 'Steel wire rope'),
      spec('Construction', 'Mounting', 'Foot-mounted, fixed'),
      spec('Commercial', 'Power supply', 'To order: state voltage, phase and frequency'),
    ],
    sources: HOIST_SOURCES,
  },
  {
    sku: 'IH-LR-EH-LH',
    was: 'Low-Headroom Electric Wire Rope Hoist — 2/1 Reeving',
    seoDescription:
      'Low-headroom electric wire rope hoist, 2/1 reeving, three frame sizes for 28a–63c I-beams, lifts of 6 to 30 m. Capacity confirmed on quotation.',
    descriptionShort:
      'Low-headroom electric wire rope hoist with 2/1 reeving: the hoist sits beside the beam to keep the hook high. Three frame sizes for I-beams from 28a to 63c, each for lifts of 6 to 30 m.',
    descriptionLong: [
      p(
        'A low-headroom electric wire rope hoist with 2/1 reeving. It runs on a trolley with the hoist body beside the beam rather than hanging below it, which keeps the hook close to the beam and gains lift in buildings with little height above the runway.'
      ),
      p(
        'The maker builds it in three frame sizes, for beam ranges of 28a to 40c, 32a to 45c and 40a to 63c — Chinese GB/T 706 I-beam sizes — and each for lifts of 6, 9, 12, 18, 24 and 30 m.'
      ),
      h3('2/1 reeving'),
      p(
        'The hook hangs on two falls of wire rope: from the drum down round the sheave in the bottom block and back up to the frame. Each fall carries half the load and the hook rises at half the rope speed.'
      ),
      h3('Load rating'),
      p(
        '<strong>No load rating is published for this range.</strong> The maker gives frame dimensions but no capacity. Tell us the load, lift, beam and duty and we will confirm the rating with the quotation. Do not use it to lift until you have that rating in writing.'
      ),
      h3('Choosing a hoist'),
      p(
        'Give the beam section and flange width, the capacity, lift, lifting and travel speeds and duty, and your supply voltage, phase and frequency. The beam range decides the frame size; check that the trolley suits your beam before ordering.'
      ),
      h3('Inspection'),
      p(
        "In the UAE, lifting equipment must be thoroughly examined by an approved or accredited third party at least every 12 months, under Abu Dhabi's CoP 34.0 and Dubai Municipality's GU48 guideline."
      ),
      h3('Ordering'),
      p(
        'Send the capacity, lift, beam, supply and quantity you need, and we will confirm the specification and lead time on the quotation.'
      ),
    ].join(''),
    faqs: hoistFaqs('low'),
    specs: [
      spec(
        'Identification',
        'Product type',
        'Electric wire rope hoist, low-headroom',
        'product_type'
      ),
      spec('Identification', 'Sizes', '3 frame sizes', 'sizes_count'),
      spec('Performance', 'Working load limit', 'Load rating on request', 'wll_range'),
      spec('Performance', 'Reeving', '2/1 (two falls)'),
      spec('Dimensions', 'Lifting heights', '6, 9, 12, 18, 24 or 30 m'),
      spec(
        'Dimensions',
        'Beam range',
        'I-beams 28a–40c, 32a–45c or 40a–63c (GB/T 706), by frame size'
      ),
      spec('Construction', 'Lifting medium', 'Steel wire rope'),
      spec('Commercial', 'Power supply', 'To order: state voltage, phase and frequency'),
    ],
    sources: HOIST_SOURCES,
  },
]

const CLUSTER_SOURCES = [
  HQ,
  'Towing-equipment suppliers’ descriptions of R, T and mini-J cluster hooks',
]

const clusterFaqs = (rings: 'single' | 'double'): Faq[] => [
  {
    question: 'What is an R-T-J cluster hook?',
    answer:
      'Three towing hooks on a ring: an R hook, a T hook and a J hook. Each fits a different kind of hole or slot in a vehicle frame, so one cluster on a tow chain gives the operator a choice of attachment point.',
  },
  {
    question: 'Single ring or double ring?',
    answer:
      rings === 'double'
        ? 'Both carry the same R, T and J hooks and the same 11,700 lb ultimate load. This double-ring version has a second ring and weighs 1.15 kg against 0.96 kg for the single ring; choose the one that matches how your chain or winch line attaches.'
        : 'Both carry the same R, T and J hooks and the same 11,700 lb ultimate load. This single-ring version weighs 0.96 kg; the double-ring version adds a second ring and weighs 1.15 kg. Choose the one that matches how your chain or winch line attaches.',
  },
  {
    question: 'Is there a working load limit?',
    answer:
      'No load rating is published: the maker gives an ultimate load of 11,700 lb only. Tell us the duty and we will confirm a rating on the quotation. An ultimate (breaking) load is a test figure, never a working limit.',
  },
  {
    question: 'Can it be used for overhead lifting?',
    answer:
      'No. Cluster hooks are towing and recovery hardware for attaching a chain to a vehicle frame. For lifting, use a rated hoist hook or sling hook.',
  },
  {
    question: 'What is it made of?',
    answer: 'Forged carbon steel, quenched and tempered, as the maker states.',
  },
]

const clusterLong = (rings: 'single' | 'double', weight: string) =>
  [
    p(
      `An R-T-J cluster hook on a ${rings} ring: an R hook, a T hook and a J hook forged from carbon steel, quenched and tempered. The maker gives an ultimate load of 11,700 lb and a weight of ${weight}.`
    ),
    h3('What the hooks are for'),
    p(
      'Cluster hooks are towing and recovery hardware. The R hook slides into small or oblong holes in a vehicle frame, the T hook fits oblong slots, and the J hook hooks into smaller holes. With all three on the end of a tow chain, the operator uses whichever fits the frame of the vehicle being recovered.'
    ),
    h3('Load rating'),
    p(
      '<strong>No load rating is published for this range.</strong> The maker gives an ultimate load of 11,700 lb only. Tell us the duty and we will confirm the rating with the quotation. An ultimate load is a test figure, never a working limit.'
    ),
    p('Cluster hooks are not lifting hooks: do not use them for overhead lifting.'),
    h3('Ordering'),
    p(
      'Send the ring type, quantity and the chain you will use it with, and we will confirm the specification and lead time on the quotation. The <a href="/c/lifting-hooks">lifting hooks range</a> also has single T and T-J hooks.'
    ),
  ].join('')

const HOOKS: Entry[] = [
  {
    sku: 'IH-LR-HK-CLD',
    was: 'Cluster Hook R-T-J — Double Ring',
    seoDescription:
      'R-T-J cluster hook, double ring: forged carbon steel R, T and J towing hooks, quenched and tempered, 11,700 lb ultimate load. Request a quote.',
    descriptionShort:
      'R-T-J cluster hook on a double ring: forged carbon steel R, T and J towing hooks, quenched and tempered, with an 11,700 lb ultimate load. For vehicle towing and recovery, not overhead lifting; weight 1.15 kg.',
    descriptionLong: clusterLong('double', '1.15 kg'),
    faqs: clusterFaqs('double'),
    specs: [
      spec(
        'Identification',
        'Product type',
        'Cluster hook — R, T and J hooks, double ring',
        'product_type'
      ),
      spec('Construction', 'Material', 'Forged carbon steel', 'material'),
      spec('Construction', 'Heat treatment', 'Quenched and tempered'),
      spec('Performance', 'Working load limit', 'Load rating on request', 'wll_range'),
      spec(
        'Performance',
        'Minimum breaking load',
        '11,700 lb ultimate load (maker’s figure)',
        'breaking_load_range'
      ),
      spec('Identification', 'Hooks', 'R hook, T hook and J hook'),
      spec('Identification', 'Use', 'Vehicle towing and recovery — not for overhead lifting'),
      spec('Dimensions', 'Weight', '1.15 kg'),
    ],
    sources: CLUSTER_SOURCES,
  },
  {
    sku: 'IH-LR-HK-CLS',
    was: 'Cluster Hook R-T-J — Single Ring',
    seoDescription:
      'R-T-J cluster hook, single ring: forged carbon steel R, T and J towing hooks, quenched and tempered, 11,700 lb ultimate load. Request a quote.',
    descriptionShort:
      'R-T-J cluster hook on a single ring: forged carbon steel R, T and J towing hooks, quenched and tempered, with an 11,700 lb ultimate load. For vehicle towing and recovery, not overhead lifting; weight 0.96 kg.',
    descriptionLong: clusterLong('single', '0.96 kg'),
    faqs: clusterFaqs('single'),
    specs: [
      spec(
        'Identification',
        'Product type',
        'Cluster hook — R, T and J hooks, single ring',
        'product_type'
      ),
      spec('Construction', 'Material', 'Forged carbon steel', 'material'),
      spec('Construction', 'Heat treatment', 'Quenched and tempered'),
      spec('Performance', 'Working load limit', 'Load rating on request', 'wll_range'),
      spec(
        'Performance',
        'Minimum breaking load',
        '11,700 lb ultimate load (maker’s figure)',
        'breaking_load_range'
      ),
      spec('Identification', 'Hooks', 'R hook, T hook and J hook'),
      spec('Identification', 'Use', 'Vehicle towing and recovery — not for overhead lifting'),
      spec('Dimensions', 'Weight', '0.96 kg'),
    ],
    sources: CLUSTER_SOURCES,
  },
]

export const LIFTING: Entry[] = [...ROPES, ...TWINES, ...HOISTS, ...HOOKS]
