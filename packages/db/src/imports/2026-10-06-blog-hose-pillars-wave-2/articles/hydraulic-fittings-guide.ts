import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The hydraulic fittings pillar: every thread family on the fittings and
 * adapter shelves, how each seals, the standard our listings cite, and the
 * article that goes deeper.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-fittings-guide',
  title: 'Hydraulic fittings and adapters: the complete guide to thread families, seats and seals',
  excerpt:
    'BSP, JIC, ORFS, NPT, NPSM, SAE flare, O-ring boss, metric 24° cone, Japanese 30° and SAE flanges: how each family seals, how to tell them apart, and which standard each one is made to.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T14:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main types of hydraulic fittings?',
      answer:
        'They divide by how they seal. Cone and flare seats: JIC 37°, SAE 45°, BSP 60°, NPSM 60°, metric 24° cone and Japanese 30°. O-ring seals: ORFS face seals, SAE O-ring boss and metric O-ring ports. Bonded seals on BSP parallel ports. Tapered threads that seal on the thread: NPT and BSPT. And four-bolt SAE J518 flanges, Code 61 and Code 62, for large bores. Identify the seat first, then the thread.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'Identify a fitting by its seat before its thread: the seat tells you how it seals, which narrows the family fastest.',
        'Only tapered threads (NPT, BSPT) seal on the thread; every other family has a dedicated seat or seal, and sealant on those is a fault.',
        'Two pairs thread together and do not seal: JIC and ORFS at 9/16"-18 and 1-3/16"-12, and NPT and BSPT at 1/2" and 3/4".',
        'SAE J518 flanges come in Code 61 (to 210 bar on our listings) and Code 62 (to 415 bar), with code-specific clamps.',
        'Adapters bridge families; one correct adapter is fine, a stack of three is a lever on the port and three leak paths.',
        'Stainless 316L versions of most families exist for corrosive duty, usually at a lower pressure rating than carbon steel.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic fitting has three independent properties: the <strong>thread</strong> that holds it together, the <strong>seat or seal</strong> that keeps the oil in, and the gender. A designation such as 9/16"-18 describes only the first, which is why two fittings with the same thread can be entirely different parts. This guide sorts the families we stock by how they seal, names the standards our listings cite for each, and links to the identification, buying and failure articles that go deeper.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The families, by how they seal.',
      anchor: 'families',
    },
    {
      type: 'comparison_table',
      caption: 'Thread families on our shelves',
      columns: ['Family', 'Seal', 'Thread', 'Standard (our listings)'],
      rows: [
        { cells: ['JIC 37°', '37° flare, metal to metal', 'UN/UNF', 'SAE J514, ISO 8434-2'], highlight: true },
        { cells: ['ORFS', 'O-ring in a flat face', 'UN/UNF', 'SAE J1453, ISO 8434-3'] },
        { cells: ['BSP parallel (BSPP)', '60° cone, or bonded seal at the port', 'Whitworth 55°, parallel', 'ISO 228-1'] },
        { cells: ['BSP taper (BSPT)', 'On the thread, with sealant', 'Whitworth 55°, taper', 'ISO 7-1'] },
        { cells: ['NPT', 'On the thread, with sealant', '60°, taper', 'ASME B1.20.1'] },
        { cells: ['NPSM', '60° cone in a swivel', '60°, parallel', 'ASME B1.20.1'] },
        { cells: ['SAE 45° flare / inverted flare', '45° cone', 'UN/UNF', 'SAE J512'] },
        { cells: ['SAE O-ring boss', 'O-ring under the shoulder', 'UN/UNF', 'SAE J1926, ISO 11926'] },
        { cells: ['Metric 24° cone (DIN 2353), L and S series', '24° cone, bite ring or O-ring', 'Metric', 'DIN 2353, ISO 8434-1'] },
        { cells: ['Japanese 30° (JIS, Komatsu)', '30° seat', 'BSP or metric', '—'] },
        { cells: ['SAE J518 flanges, Code 61 / 62', 'O-ring in the flange face', '4-bolt clamp', 'SAE J518, ISO 6162'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The four most common are compared side by side in <a href="/blog/jic-vs-orfs-vs-npt-vs-bsp">JIC against ORFS against NPT against BSP</a>; the flanges in <a href="/blog/sae-j518-code-61-code-62-flanges">SAE J518 Code 61 and Code 62</a>.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Identifying a fitting.',
      anchor: 'identify',
    },
    {
      type: 'paragraph',
      html: 'Start with the seat. A plain cone is JIC, SAE 45°, BSP 60° or metric 24° — the angle separates them, and a seat gauge settles it in seconds. A flat face with an O-ring groove is ORFS. An O-ring under a shoulder is O-ring boss or a metric port. A flat port face with a bonded washer is BSP parallel. A thread that grows in diameter and has no seat at all is NPT or BSPT. Then measure the thread outside diameter with a caliper and the pitch with a gauge — 55° flanks for BSP, 60° for everything else. The method is in <a href="/blog/identify-any-hydraulic-fitting">identify any hydraulic fitting in four steps</a>, the reference table in <a href="/blog/hydraulic-thread-size-and-pitch-reference">thread size and pitch</a>, and what to do without gauges in <a href="/blog/measuring-a-fitting-without-gauges">measuring a fitting without gauges</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Two pairs thread together and leak.',
      body: 'JIC and ORFS share 9/16"-18 and 1-3/16"-12: the parts engage, the cone bottoms on the flat face, and the O-ring has nothing to seal against. NPT and BSPT share pitch at 1/2" and 3/4" but not flank angle, so they start and never seal along the thread. Check the seat, not just the thread.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Which families a machine carries.',
      anchor: 'by-origin',
    },
    {
      type: 'paragraph',
      html: 'A machine\'s fittings follow where it was designed and repaired, not where it works. European machines are largely metric 24° cone with BSP ports; American machines bring JIC, ORFS, O-ring boss and NPT; Japanese and Korean machines carry 30° seats over two thread conventions as well as metric and BSP; Chinese machines are mostly metric 24° cone and BSP parallel with flanges at the pump. The detail is in our origin series: <a href="/blog/fittings-on-european-machines">European</a>, <a href="/blog/fittings-on-american-machines">American</a>, <a href="/blog/fittings-on-a-used-japanese-machine">used Japanese</a>, <a href="/blog/korean-excavator-hydraulic-fittings">Korean</a> and <a href="/blog/fittings-on-a-chinese-excavator">Chinese</a>.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Hose fittings and adapters.',
      anchor: 'hose-fittings',
    },
    {
      type: 'paragraph',
      html: 'A <strong>hose fitting</strong> is crimped onto a hose and carries one thread family at its end — straight, 45° or 90°, female swivel or male. It has to match the hose as well as the port: our braided-hose crimp fittings are listed for 1SN, 2SN, R1AT, R2AT, R16 and R17, our spiral-hose crimp fittings for 4SP and R12 — see <a href="/blog/braided-vs-spiral-hose-fittings">braided against spiral hose fittings</a>. An <strong>adapter</strong> has no hose end; it joins two threads, often of two families. One correct adapter is ordinary engineering; a stack is a lever on the port and a leak path per joint — see <a href="/blog/stacking-hydraulic-adapters">adapter stacking</a> and <a href="/blog/bridging-two-thread-standards">bridging two thread standards</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Flange adapters on our shelf (SAE J518 / ISO 6162)',
      columns: ['Adapter', 'Rating (listing)'],
      rows: [
        { cells: ['Male JIC × Code 61 L-series flange (straight, 45°, 90°)', 'L-series to 210 bar'] },
        { cells: ['JIC male 74° cone × SAE flange (straight, 90°)', 'To 310 bar, manufacturer stated'] },
        { cells: ['Metric male bite type × L-series flange (straight, 90°)', 'L-series, 3,000 psi'] },
        { cells: ['Metric male bite type × S-series flange (straight, 90°)', 'S-series, 6,000 psi'], highlight: true },
        { cells: ['Weld flange connectors, L- and S-series', 'L to 210 bar; S to 415 bar'] },
      ],
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Sealing and make-up.',
      anchor: 'make-up',
    },
    {
      type: 'paragraph',
      html: 'Each family has one correct way to seal, and most leaks come from applying another family\'s habit. Tapered threads take anaerobic sealant, started back from the first thread; straight threads take nothing on the thread and rely on the seat or seal. Bonded seals and O-rings are single-use. Cone seats are made up by turns or flats from finger tight rather than by feel. See <a href="/blog/stopping-an-npt-thread-leak">stopping an NPT leak</a>, <a href="/blog/sealant-on-hydraulic-threads">sealant on hydraulic threads</a>, <a href="/blog/bspp-bonded-seal-sizing">bonded seal sizing</a> and <a href="/blog/hydraulic-fitting-make-up-torque">make-up torque and turns</a>.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Materials, plating and stainless.',
      anchor: 'materials',
    },
    {
      type: 'paragraph',
      html: 'Our carbon steel fittings are zinc-plated with a Cr3+ passivation. On coastal and washdown sites the plating is what wears first, at thread crests and hex corners — see <a href="/blog/plating-and-corrosion-on-fittings">plating and corrosion</a> and <a href="/blog/why-fittings-seize-in-coastal-air">why fittings seize in coastal air</a>. Where plating cannot cope, 316L stainless versions exist for most families — BSP, JIC, ORFS, metric, NPT/NPSM and SAE flanges — passivated rather than plated, usually at a lower pressure rating than carbon steel and prone to galling without anti-seize. See <a href="/blog/ss316l-hydraulic-fittings">316L hydraulic fittings</a> and <a href="/blog/when-stainless-is-worth-it">when stainless is worth it</a>.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Ordering without ambiguity.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'A fitting order that names the family, the thread size, the gender, the seat, the shape and the hose it goes on is answered with a part number rather than questions. Photographs of the end face and down the bore, with a ruler in shot, close most of the rest. See <a href="/blog/what-to-send-for-a-fittings-quote">what to send for a fittings quote</a>, <a href="/blog/photographing-a-hydraulic-fitting">photographing a fitting</a> and <a href="/blog/cross-referencing-a-fitting-part-number">cross-referencing a part number</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between JIC and ORFS?',
          answer:
            'JIC seals on a 37° metal cone; ORFS seals on an O-ring in a flat face. They share two thread sizes, so check the seat before relying on a thread match.',
        },
        {
          question: 'Do BSP and NPT fittings interchange?',
          answer:
            'No. BSP threads have a 55° flank angle and NPT 60°. At 1/2" and 3/4" the pitches match and the parts will start, but they do not seal.',
        },
        {
          question: 'Which fittings need thread sealant?',
          answer:
            'Only tapered threads — NPT and BSPT. Straight-thread families seal on a seat, an O-ring or a bonded washer, and sealant on them prevents the seal from forming.',
        },
        {
          question: 'What is the difference between SAE Code 61 and Code 62 flanges?',
          answer:
            'Code 62 is the high-pressure series. Our listings rate Code 61 parts to 210 bar and Code 62 parts to 415 bar, and their clamp halves are not interchangeable.',
        },
        {
          question: 'Are stainless hydraulic fittings rated the same as steel?',
          answer:
            'Often not. For a given size and design a 316L fitting can carry a lower working pressure than carbon steel. Check the rating of the stainless part itself.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'One hose fitting from each main family',
      skus: ['IH-CF43-JICF', 'IH-CF43-ORFSF', 'IH-CF43-BSPF', 'IH-CF43-DINLF', 'IH-CF43-KOMF', 'IH-CF43-C61', 'IH-PT-NPSM-SWV', 'IH-PT-SAE-MAL-OR'],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hydraulic hose fittings',
      blurb: 'Crimp fittings by thread family, for braided and spiral hose.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'BSP, JIC, ORFS, metric, NPT, DIN 2353 and SAE flange adapters.',
    },
    {
      type: 'category_link',
      slug: 'sae-flange-adapters',
      label: 'SAE flange adapters',
      blurb: 'JIC, metric bite-type and weld connectors to Code 61 and Code 62 flanges.',
    },

    {
      type: 'cta_block',
      heading: 'Holding a fitting you cannot name?',
      body: 'Send photographs of the end face and down the bore with a ruler in shot, the thread diameter and pitch, and where it came from. We will name it and quote the part.',
      quoteLabel: 'Identify a fitting',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Families, seals, standards and ratings checked against our hydraulic fitting and adapter listings.',
    },
  ],
}

export default ARTICLE
