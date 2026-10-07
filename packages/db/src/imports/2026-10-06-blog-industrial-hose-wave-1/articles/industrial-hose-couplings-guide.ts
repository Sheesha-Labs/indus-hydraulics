import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The couplings pillar: every coupling family on the industrial hose shelves,
 * how to tell them apart, and where each article goes deeper.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'industrial-hose-couplings-guide',
  title: 'Industrial hose couplings: how to identify and choose every common family',
  excerpt:
    'Cam and groove, Storz, Bauer, Guillemin, GOST, claw, ground joint, EN 14420, KC and flanges. How to tell them apart in thirty seconds, which duty each one suits, and how the coupling sets the rating.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T13:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What types of industrial hose couplings are there?',
      answer:
        'Two kinds: gendered couplings, where a male half meets a female half — cam and groove, Bauer, ring lock, ground joint, threaded unions — and symmetrical couplings, where identical heads lock together — Storz, Guillemin, Barcelona, GOST, Geka and universal claw couplings. Then there are plain hose ends: KC nipples, shank couplings, EN 14420 fittings and flanges, held in the hose by a clamp, ferrule or sleeve.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'First question: are the two halves different (gendered) or identical (symmetrical)?',
        'Symmetrical couplings of different countries do not connect: Storz, Guillemin, Barcelona and GOST each fit only themselves.',
        'Size a symmetrical coupling by its face — a Storz head by its lug distance — not by the hose bore.',
        'The coupling often sets the assembly rating: our cam and groove range steps from 250 psi at 2" to 75 psi at 6".',
        'A plain hose end is only as strong as the clamp, ferrule or sleeve that holds it.',
      ],
    },
    {
      type: 'lead',
      html: 'Industrial hose couplings come in more families than any other hose end, because every industry and almost every country settled on its own. The good news is that they sort quickly. One question — <strong>are the two halves the same or different?</strong> — divides them into two groups, and a second look at the face, the lugs or the thread names the family. This guide does that sorting and points to the detail on each.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Gendered or symmetrical.',
      anchor: 'gendered-symmetrical',
    },
    {
      type: 'paragraph',
      html: 'A <strong>gendered</strong> coupling has a male half and a female half: a cam and groove adapter and coupler, a Bauer male tip and female ring, a ground joint stem and spud. Two of the same half will not connect, so a hose needs the right half at each end. A <strong>symmetrical</strong> coupling uses identical heads: any two Storz heads of one size lock together, as do any two Guillemin, Barcelona, GOST, Geka or universal claw heads of one type. Symmetry is why those families dominate fire and site-air service, where nobody wants to be holding the wrong end.',
    },
    {
      type: 'comparison_table',
      caption: 'The families on our shelves',
      columns: ['Family', 'Type', 'Typical duty', 'Our sizes / rating'],
      rows: [
        { cells: ['Cam and groove', 'Gendered', 'Tanker, pump, chemical and fuel transfer', '1/2" – 12"; 250 → 75 psi by size'], highlight: true },
        { cells: ['Dry disconnect', 'Gendered, valved', 'No-spill chemical and fuel transfer', '1-1/2" – 3"; to 150 psi'] },
        { cells: ['Storz', 'Symmetrical', 'Fire, water, large-bore supply', '1" – 6"; rating not published'] },
        { cells: ['Guillemin', 'Symmetrical', 'French fire, water and industrial', '3/4" – 4"; rating not published'] },
        { cells: ['GOST, Barcelona, Geka', 'Symmetrical', 'Russian, Spanish and small water hose', '1/4" – 6" by pattern'] },
        { cells: ['Bauer, ring lock', 'Gendered, lever', 'Irrigation, slurry, dewatering', '2" – 12"; 150 psi on flanged Bauer'] },
        { cells: ['Universal claw, crowfoot', 'Symmetrical', 'Compressed air and water', '1/4" – 2"; 150 psi where published'] },
        { cells: ['Ground joint', 'Gendered, metal seat', 'Steam and air', '1/2" – 4"; rating not published'] },
        { cells: ['EN 14420-5 + DIN 2817 clamp', 'Threaded tail + safety clamp', 'Chemical, oil and steam transfer', '1/2" – 4"'] },
        { cells: ['KC nipples, shank couplings', 'Plain hose ends', 'General transfer and suction', '1/8" – 12"'] },
        { cells: ['ASME B16.5 flanges', 'Bolted', 'Fixed pipework, tank nozzles', '1/2" – 24"; Class 150 / 300'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Identifying a coupling in thirty seconds.',
      anchor: 'identify',
    },
    {
      type: 'decision_tree',
      heading: 'Which coupling is this?',
      intro: 'Look at the face first, then the back.',
      branches: [
        {
          condition: 'Two cam arms on a female half, a plain grooved spigot on the male?',
          outcome: 'Cam and groove. Read the letter: A, E, F are adapters; B, C, D are couplers.',
        },
        {
          condition: 'Identical heads with two hook-shaped lugs that lock with a quarter turn?',
          outcome: 'Storz. Measure the lug distance to size it.',
        },
        {
          condition: 'Identical heads with claws and a lock ring, French specification?',
          outcome: 'Guillemin, the French pattern (NF E 29-572).',
        },
        {
          condition: 'Small symmetrical claw head with two or four lugs on an air line?',
          outcome: 'Universal (Chicago) or crowfoot coupling — check the type: American, European or Australian.',
        },
        {
          condition: 'A rounded male tip, a female ring with two levers?',
          outcome: 'Bauer — or ring lock, which looks similar and does not interchange.',
        },
        {
          condition: 'A stem with a spherical seat, a wing nut and a spud, no gasket?',
          outcome: 'Ground joint — the classic steam coupling.',
        },
        {
          condition: 'A serrated tail and a thread or flange, no coupling face?',
          outcome: 'A KC nipple, shank coupling or EN 14420-5 fitting — the clamp makes the joint.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Transfer: cam and groove and dry disconnects.',
      anchor: 'transfer',
    },
    {
      type: 'paragraph',
      html: 'Cam and groove is the default for tankers, pumps and chemical transfer, listed to MIL A-A-59326 and EN 14420-7. Its letter code is decoded in <a href="/blog/cam-and-groove-coupling-types">cam and groove coupling types</a>, including the pressure curve that makes the coupling the limit on a large line. Where a joint must part without a drip, a dry disconnect closes a valve in each half before the faces separate — see <a href="/blog/tanker-loading-and-vapour-recovery-hose">tanker loading and vapour recovery hose</a>.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Fire and water: the symmetrical patterns.',
      anchor: 'symmetrical',
    },
    {
      type: 'paragraph',
      html: 'Each country\'s fire service chose its own symmetrical coupling, and none fits another. <a href="/blog/storz-coupling-sizes">Storz</a> is sized by lug distance — 115 mm for 4", 148 mm for 5", 160 mm for 6" on our listings — and takes a grey suction or black pressure gasket. <a href="/blog/guillemin-couplings-explained">Guillemin</a>, standardised in France as NF E 29-572, adds a lock ring. <a href="/blog/gost-barcelona-and-geka-couplings">GOST, Barcelona and Geka</a> cover Russia and the CIS, Spain and small water hose. Crossing between them means a threaded adapter of each pattern.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Irrigation, slurry and dewatering: Bauer.',
      anchor: 'bauer',
    },
    {
      type: 'paragraph',
      html: 'Lines that are laid and moved every day use a lever coupling. <a href="/blog/bauer-couplings-explained">Bauer couplings</a> lock with a lever ring and tolerate some misalignment; our zinc-plated steel range runs 2" to 12", with ASA Class 150 flange backs. Ring lock couplings work the same way and are not interchangeable with Bauer.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Air and steam.',
      anchor: 'air-steam',
    },
    {
      type: 'paragraph',
      html: 'Site air runs on <a href="/blog/universal-air-couplings-explained">universal claw couplings</a>, which must be pinned with a safety clip and restrained with a whip check, because air stores energy that oil does not — the hose side is in <a href="/blog/compressed-air-hose-selection">compressed air hose selection</a>. Steam needs a joint with no rubber in it: the <a href="/blog/ground-joint-steam-couplings">ground joint coupling</a> seals metal to metal, while European plant uses EN 14423 clamp couplings.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Plain ends, clamps and flanges.',
      anchor: 'plain-ends',
    },
    {
      type: 'paragraph',
      html: 'Many hoses end in a plain serrated tail with a thread or a flange: <a href="/blog/kc-nipples-and-shank-couplings">KC nipples and shank couplings</a>, or <a href="/blog/en-14420-hose-fittings-explained">EN 14420-5 GA and GI fittings</a> under a DIN 2817 safety clamp. On all of them the joint is made by what is clamped around the hose — the subject of <a href="/blog/industrial-hose-clamps">industrial hose clamps</a>. Where the hose meets fixed pipework, it ends in a flange matched for size, class and face, covered in <a href="/blog/flanged-hose-connections">flanged hose connections</a>. Composite hose has its own spiral-tail fittings, in <a href="/blog/composite-hose-explained">composite hose explained</a>.',
    },

    {
      type: 'section_head',
      number: '/08',
      title: 'The coupling sets the rating.',
      anchor: 'rating',
    },
    {
      type: 'paragraph',
      html: 'Every coupling has its own pressure rating, and it is often lower than the hose\'s. Our cam and groove halves are rated 250 psi to 2", 150 psi at 3"–4" and 75 psi at 5"–6", and several crowfoot ends at 150 psi; for Storz, Guillemin, Bauer and most crowfoot parts the manufacturers publish no rating, so we confirm one for your duty. Shanks held by band clamps are limited by the clamps. Rate and mark every assembly at its weakest component, and pressure-test it as an assembly.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Gaskets are part of the coupling.',
      body: 'Most couplings seal on a gasket or an O-ring. Choose its material against the medium and temperature just as you chose the hose; a compatible hose with the wrong gasket leaks at the coupling.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the most common industrial hose coupling?',
          answer:
            'For transfer work, cam and groove. For fire and water, the national symmetrical coupling — Storz across much of Europe, Guillemin in France, Barcelona in Spain, GOST in Russia and the CIS.',
        },
        {
          question: 'Do Storz and Guillemin couplings connect?',
          answer:
            'No. Both are symmetrical, but the faces are different patterns. Join them through threaded adapters of each pattern.',
        },
        {
          question: 'How do I measure an industrial hose coupling?',
          answer:
            'By its face, not the hose: a Storz head by its lug distance, a cam and groove half by its nominal size and type letter, a thread by its diameter and pitch.',
        },
        {
          question: 'Which coupling suits steam?',
          answer:
            'A ground joint coupling, which seals metal to metal with no gasket, or a European EN 14423 clamp coupling. Never a worm-drive band.',
        },
        {
          question: 'Why is my coupling rated lower than my hose?',
          answer:
            'Because the force on a coupling rises with the bore. Our cam and groove range steps from 250 psi at 2" to 75 psi at 6", and the assembly is rated at its weakest part.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'One coupling from each family',
      skus: [
        'IH-CGC-STD-C',
        'IH-STZ-STORZ-COUPLING-LONG-SHANK',
        'IH-GUI-GUILLEMIN-COUPLING-LONG-HOSE-SHANK',
        'IH-BC-SHANK-COMPLETE',
        'IH-UAC-US-HOSE',
        'IH-GJ-GROUND-JOINT-COMPLETE-SET',
        'IH-EN5-SS-GI-SERRATED',
        'IH-KC-KC-NIPPLE',
      ],
    },
    {
      type: 'category_link',
      slug: 'cam-and-groove-couplings',
      label: 'Cam and groove couplings',
      blurb: 'Types A to F, DC and DP, self-locking and CrimpTEK.',
    },
    {
      type: 'category_link',
      slug: 'storz-couplings',
      label: 'Storz couplings',
      blurb: 'Storz heads, adapters, FDC fittings and gaskets.',
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps, sleeves and ferrules',
      blurb: 'The parts that make a plain hose end hold.',
    },

    {
      type: 'cta_block',
      heading: 'Cannot name the coupling in your hand?',
      body: 'Send a photograph of the face and the back, with a ruler in shot, and the hose bore. We will name the family and size, and quote the matching half or an adapter.',
      quoteLabel: 'Identify a coupling',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Families, sizes, ratings and standards checked against our industrial coupling listings.',
    },
  ],
}

export default ARTICLE
