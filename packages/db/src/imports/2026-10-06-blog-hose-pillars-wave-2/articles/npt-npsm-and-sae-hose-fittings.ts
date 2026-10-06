import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * NPT, NPSM, SAE 45° flare, inverted flare and O-ring boss hose fittings, read
 * from the 11 listings on that shelf and the four 316L NPT / NPSM listings.
 * The NPT male listing also cites ISO 7-1, which is the BSP taper standard;
 * that citation is not repeated.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'npt-npsm-and-sae-hose-fittings',
  title: 'NPT, NPSM and SAE hose fittings: taper, swivel, flare and O-ring boss',
  excerpt:
    'Five American hose-end families that get confused because they share inch sizes. Which seals on the thread, which on a cone, which on an O-ring — and how to tell NPT from NPSM before it leaks.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T14:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between NPT and NPSM fittings?',
      answer:
        'NPT is a tapered pipe thread that seals on the thread itself, with sealant. NPSM is a straight pipe thread of the same size and pitch that does not seal on the thread at all: an NPSM swivel seals on a 60° cone inside the nut. An NPSM female swivel will screw onto an NPT male and seal on its chamfer, which is why the two are paired on hose ends — but an NPSM male in an NPT port will never seal.',
    },
    {
      type: 'key_takeaways',
      items: [
        'NPT (ASME B1.20.1) is a taper that seals on the thread with sealant; our NPT male hose fittings run 1/8" to 2".',
        'NPSM is straight: our NPSM male swivel seals on a 60° internal cone, 1/4" to 2" — the seal is on the cone, not the thread.',
        'SAE 45° flare (SAE J512) seals on a 45° cone; our female and male ends run −04 to −12.',
        'SAE inverted flare puts the 45° cone inside the fitting body; our ends run −03 to −10.',
        'SAE O-ring boss (SAE J1926, ISO 11926) seals on an O-ring under the shoulder; our male ends run −04 to −24.',
      ],
    },
    {
      type: 'lead',
      html: 'American hydraulics uses five hose-end families that share inch sizes and get swapped for each other with depressing regularity: NPT, NPSM, SAE 45° flare, SAE inverted flare and SAE O-ring boss. The way to keep them straight is the same as for every other family — <strong>ask where it seals</strong> — and each of the five gives a different answer.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Five families, five seals.',
      anchor: 'families',
    },
    {
      type: 'comparison_table',
      caption: 'On our NPT / NPSM / SAE shelf',
      columns: ['Family', 'Where it seals', 'Our sizes', 'Standard (listing)'],
      rows: [
        { cells: ['NPT male', 'On the tapered thread, with sealant', '1/8" – 2"', 'ASME B1.20.1'] },
        { cells: ['NPSM male swivel', '60° cone inside the swivel nut', '1/4" – 2"', 'SAE J514, ASME B1.20.1'], highlight: true },
        { cells: ['SAE 45° flare, female swivel and male', '45° cone seat', '−04 to −12 (7/16-20 to 1-1/16-14)', 'SAE J512'] },
        { cells: ['SAE inverted flare (straight, 45°, 90°)', '45° female cone inside the body', '−03 to −10 (3/8-24 to 5/8-18)', 'SAE J512'] },
        { cells: ['SAE O-ring boss male, and male boss swivel', 'O-ring under the shoulder; threads bottom out', '−04 to −24', 'SAE J1926, ISO 11926'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'NPT and NPSM: same thread form, different job.',
      anchor: 'npt-npsm',
    },
    {
      type: 'paragraph',
      html: 'NPT tapers along its length, so the male wedges into the female and the thread flanks themselves make the seal — which is why NPT needs a sealant and why it can only be made up once or twice before the thread distorts. NPSM uses the same 60° thread form and pitch cut straight, so it cannot seal on the thread; our NPSM male swivel seals on a 60° cone instead. On hose assemblies the common pairing is an NPSM female swivel on the hose screwed onto an NPT male adapter, where the swivel\'s cone seals against the NPT male\'s 30° chamfer: no sealant, and it can be broken and remade.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Taper or straight? Check before anything else.',
      body: 'Run a straight edge along the male thread, or start a nut by hand and see whether it runs freely down the length. A straight male in a tapered port never seals and gets tightened until something cracks. Never put sealant on an NPSM, JIC, ORFS or O-ring boss thread.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'SAE 45° flare and inverted flare.',
      anchor: 'flare',
    },
    {
      type: 'paragraph',
      html: 'SAE 45° flare is the older cousin of JIC: a 45° cone instead of 37°, on UN/UNF threads from 7/16-20 to 1-1/16-14, common on refrigeration, fuel and low-pressure lines and on older machinery. Its threads overlap JIC\'s in several sizes, so a 45° female will start on a 37° male and leak. Inverted flare moves the 45° cone inside the fitting body and threads a male tube nut into it — the arrangement on brake and fuel lines — in our range from −03 to −10, straight, 45° and 90°. Our flare ends are listed to SAE J512.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'SAE O-ring boss.',
      anchor: 'orb',
    },
    {
      type: 'paragraph',
      html: 'An O-ring boss port has a straight UN/UNF thread and a spot face; the male fitting carries an O-ring in a groove under its shoulder, and the threads bottom out as the O-ring is squeezed into the port\'s chamfer. It is the standard port on American valves, pumps and cylinders and one of the most leak-tight connections there is, provided the O-ring is new and the right size. Our O-ring male and male boss swivel hose fittings run −04 to −24 to SAE J1926 and ISO 11926; the braided and spiral crimp ranges also carry O-ring boss male ends.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Stainless versions.',
      anchor: 'stainless',
    },
    {
      type: 'paragraph',
      html: 'For corrosive and washdown duty, our 316L range lists an NPT male pipe straight and NPSM swivel female 60° cone fittings — straight, 45° and 90° — from 1/8" to 2", passivated rather than plated. A double-hexagonal NPSM swivel female adds a second hex for wrenching. The thread rules are identical; stainless threads gall more readily, so use an appropriate anti-seize on the threads and not on the seat.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Does an NPSM fitting need thread sealant?',
          answer:
            'No. NPSM seals on a 60° cone in the swivel nut, not on the thread. Sealant on the thread can stop the cone from seating.',
        },
        {
          question: 'Can an NPSM female swivel go on an NPT male?',
          answer:
            'Yes. The swivel\'s 60° cone seals on the NPT male\'s chamfer. That is the usual hose-end pairing. The reverse — an NPSM male in an NPT port — will not seal.',
        },
        {
          question: 'Is SAE 45° flare the same as JIC?',
          answer:
            'No. SAE flare uses a 45° seat and JIC a 37° seat. Several thread sizes overlap, so the two will engage and leak.',
        },
        {
          question: 'What is an O-ring boss fitting?',
          answer:
            'A straight-thread fitting that seals on an O-ring under its shoulder against the port\'s chamfer, to SAE J1926 / ISO 11926. Our male ends run −04 to −24.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'NPT, NPSM and SAE hose fittings',
      skus: [
        'IH-PT-NPT-MAL',
        'IH-PT-NPSM-SWV',
        'IH-PT-SAE-FEM-45',
        'IH-PT-SAE-MAL-45',
        'IH-PT-INV-FLARE',
        'IH-PT-SAE-MAL-OR',
        'IH-PT-SAE-MBS-OR',
        'IH-SS-NPT-001',
      ],
    },
    {
      type: 'category_link',
      slug: 'npt-npsm-sae-hose-fittings',
      label: 'NPT / NPSM / SAE hose fittings',
      blurb: 'NPT male, NPSM swivel, SAE 45° and inverted flare, O-ring boss.',
    },
    {
      type: 'category_link',
      slug: 'npt-adapters',
      label: 'NPT adapters',
      blurb: 'NPT male and female adapters to every other family.',
    },
    {
      type: 'category_link',
      slug: 'ss316l-npt-npsm-fittings',
      label: '316L NPT and NPSM fittings',
      blurb: 'Passivated 316L NPT male and NPSM swivel fittings, 1/8" to 2".',
    },

    {
      type: 'cta_block',
      heading: 'Not sure whether it is NPT or NPSM?',
      body: 'Send a photograph of the male thread side-on and of the end face, with the outside diameter. We will name the family and quote the matching end or adapter.',
      quoteLabel: 'Identify a fitting',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Families, seals, sizes and standards checked against our NPT / NPSM / SAE and 316L NPT-NPSM listings.',
    },
  ],
}

export default ARTICLE
