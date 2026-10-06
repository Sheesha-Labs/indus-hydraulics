import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The oilfield hose pillar: API 7K, 16C, 16D and 17J, the well service and
 * low-pressure ranges, and the documents that travel with them — read from the
 * 36 oil and gas hose listings. Standards are named as our listings name them;
 * where a listing says "cross-reference" or "equivalent", so does the article.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oilfield-hose-guide',
  title: 'Oilfield hose: API 7K, 16C, 16D and 17J, and which hose each one governs',
  excerpt:
    'Rotary and vibrator, choke and kill, BOP control, subsea, stimulation, frac and low-pressure rig hose. Which API standard governs each, the pressures and temperatures on our listings, and the documents that must travel with them.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which API standards cover oilfield hose?',
      answer:
        'Four do most of the work. API 7K covers rotary, vibrator and related drilling hose — 5,000 psi working on our listings. API 16C covers choke and kill and well control lines — 10,000 psi working. API 16D covers BOP control systems, including hose that must keep working in a fire. API 17J, with ISO 13628-2, covers subsea flexible pipe, such as LMRP choke and kill hoses at 15,000 psi. Well service, frac and low-pressure rig hose sit around them.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'API 7K: rotary and vibrator hose, 5,000 psi WP and 12,500 psi minimum burst on our listings; mud booster 3,000 / 7,500 psi.',
        'API 16C: choke and kill lines, 10,000 psi WP and 15,000 psi MBP, with the liner chosen for temperature — PA to 100 or 130 °C, fluoropolymer to 130 °C.',
        'API 16D: BOP control hose that survives 704 °C for 30 minutes, demonstrated by test (ISO 15540).',
        'API 17J / ISO 13628-2: subsea LMRP hoses at 15,000 psi.',
        'Design factors are thinner than hydraulic hose — which is why inspection, testing and recertification carry so much weight.',
        'On oilfield orders the document pack is part of the product; specify it with the enquiry.',
      ],
    },
    {
      type: 'lead',
      html: 'Rig hose is not one category with different pressure ratings. Separate API specifications cover separate duties, each written around a different failure — a rotary hose whipping on the drill floor, a choke line containing a kick, a BOP control line burning. The engineering, the testing and the paperwork differ with each, and so does the margin between working pressure and failure. This guide maps the hose on a rig to <strong>the standard that governs it</strong>, with the figures from our listings, and links to the detail.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Which standard governs which hose.',
      anchor: 'map',
    },
    {
      type: 'comparison_table',
      caption: 'Oilfield hose on our listings',
      columns: ['Duty', 'Standard (listing)', 'Rating', 'Bore'],
      rows: [
        { cells: ['Rotary and vibrator hose', 'API 7K Grade D', '5,000 psi WP, 12,500 psi MBP', '2" – 5"'], highlight: true },
        { cells: ['Mud booster hose', 'API 7K-equivalent', '3,000 psi WP, 7,500 psi MBP', '3" – 5"'] },
        { cells: ['Choke and kill / well control', 'API 16C (with API 17J)', '10,000 psi WP, 15,000 psi MBP', '2" – 4"'] },
        { cells: ['BOP control hose (Fireshield 5000)', 'API Spec 16D, API RP 17H, ISO 15540', '5,000 psi WP; 704 °C for 30 min', '1/4" – 1"'] },
        { cells: ['Subsea LMRP choke, kill and conduit', 'API 17J, API 16C, ISO 13628-2', '15,000 psi WP', '2" – 4"'] },
        { cells: ['Well stimulation and acidizing', 'API 7K / 17J, NACE MR-0175', '15,000 psi WP', '2" – 3"'] },
        { cells: ['Frac hose assemblies', 'API 7K, API 16C (cross-reference)', '15,000 psi WP', '3" – 5"'] },
        { cells: ['Riser tensioner and compensator', 'API 7K (cross-reference)', '5,000 psi WP, 12,500 psi MBP', '1" – 4"'] },
        { cells: ['Low-pressure rig hose (Black Gold)', 'Maker\'s series specification', '300 – 400 psi WP', '1" – 6"'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The three main rig standards are compared in <a href="/blog/api-7k-16c-16d-which-standard">API 7K, 16C and 16D: which standard governs which hose</a>.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'API 7K: rotary and vibrator hose.',
      anchor: 'api-7k',
    },
    {
      type: 'paragraph',
      html: 'The rotary hose is the largest flexible item on most rigs. Our API 7K rotary and vibrator hoses are all 5,000 psi working with a 12,500 psi minimum burst, 2" to 5", and differ by coupling method — bonded, crimped or swaged, set at manufacture and not a field choice — and by liner: oil-resistant NBR for mud, cement-resistant NBR for cementing, and HNBR for high-temperature and sour service to +121 °C with NACE MR-0175. The mud booster hose is a separate construction at 3,000 psi. Restraint is part of the installation. See <a href="/blog/api-7k-rotary-vibrator-hose">API 7K rotary and vibrator hose</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'API 16C: choke, kill and well control.',
      anchor: 'api-16c',
    },
    {
      type: 'paragraph',
      html: 'Choke and kill lines contain a well, and they are engineered closer to their limit than a hydraulic hose. Ours are all 10,000 psi working with a 15,000 psi minimum burst; the specification conversation is about temperature and medium, which is what the liner decides — polyamide to 100 °C or, in the heat-resistant grade, 130 °C; Tauroflon fluoropolymer to 130 °C with NACE MR-0175 for sour wells. Sour service applies to the whole assembly, flanged ends included. See <a href="/blog/api-16c-choke-and-kill-lines">API 16C choke and kill lines</a>.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'API 16D: hose that must work in a fire.',
      anchor: 'api-16d',
    },
    {
      type: 'paragraph',
      html: 'BOP control hose has a second requirement on top of pressure: it must still operate the stack while the rig is burning. Our Fireshield 5000 BOP control hose is rated 5,000 psi and listed to survive 704 °C (1,300 °F) for 30 minutes per API Spec 16D and API RP 17H, demonstrated by the ISO 15540 fire test. The Megashield 5000 assemblies carry the same 16D and ISO 15540 basis from 1/4" to 2". See <a href="/blog/bop-control-hose-fire-resistance">BOP control hose fire resistance</a>.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Subsea, well service and offshore motion.',
      anchor: 'subsea-service',
    },
    {
      type: 'paragraph',
      html: 'Below the LMRP, API 17J with ISO 13628-2 takes over: our subsea LMRP hoses for choke, kill and hydraulic conduit are rated 15,000 psi with HNBR or FKM liners and corrosion-resistant armour, and the subsea hydraulic conduit hose 5,000 psi. Around the well, stimulation, acidizing and frac hoses run at 15,000 psi, the well test production hose at 10,000 psi for sour service, and the burner and flare boom hose at 5,000 psi to +200 °C — see <a href="/blog/well-service-and-stimulation-hose">well service and stimulation hose</a>. On floating rigs, riser tensioner and drill string compensator hoses cycle all day — see <a href="/blog/riser-tensioner-and-compensator-hose">riser tensioner and compensator hose</a>.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Low-pressure rig hose.',
      anchor: 'low-pressure',
    },
    {
      type: 'paragraph',
      html: 'Most hose on a rig is not pressure-control hose at all: drill water, potable water, fuel, mud and oil, and bulk material at 300 to 400 psi. Our Black Gold series covers each in discharge (D) and suction-discharge (SD) form — the SD versions with a helical wire for suction — from 1" to 6", −40 to +82 °C, with a potable water grade listed as NSF 61 / FDA-compatible. The Flameshield low-pressure hose adds a flame-resistant cover at 250 to 500 psi. Rated for far less, these still need the right compound for the fluid and the right coupling.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Thin margins, strict inspection.',
      anchor: 'margins',
    },
    {
      type: 'paragraph',
      html: 'A hydraulic hose is built to a 4:1 design factor. API 7K rotary hose sits at 2.5:1 between working pressure and minimum burst on our listings, and API 16C choke and kill lines at 1.5:1. That is deliberate: the margin that is not in the design comes from inspection, pressure testing and recertification on schedule, and from handling discipline on the rig. A higher-rated oilfield hose is not a more forgiving one.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never field-build a pressure-control assembly.',
      body: 'API 16C lines are qualified as complete assemblies with their ends, and rotary hose couplings are applied under controlled conditions at manufacture. A mobile unit at a wellsite cannot legitimately produce either, and anyone offering to is offering an unqualified assembly.',
    },

    {
      type: 'section_head',
      number: '/08',
      title: 'Documents are part of the product.',
      anchor: 'documents',
    },
    {
      type: 'paragraph',
      html: 'On oilfield orders the paperwork is part of the goods: an assembly without its pack cannot be installed, and most of the pack cannot be reconstructed afterwards. Specify the documentation clause with the enquiry — test certificates, material certificates, NACE statements, traceability — alongside the engineering. See <a href="/blog/oilfield-hose-document-pack">the oilfield hose document pack</a>, <a href="/blog/nace-mr0175-hose-documentation">NACE MR0175 documentation</a> and <a href="/blog/rig-site-hose-replacement-abu-dhabi">rig-site hose replacement</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What pressure is an API 7K rotary hose rated for?',
          answer:
            'Our API 7K rotary and vibrator hoses are 5,000 psi working with a 12,500 psi minimum burst, from 2" to 5".',
        },
        {
          question: 'What is the difference between API 16C and API 16D hose?',
          answer:
            'API 16C covers choke and kill and well control lines — ours are 10,000 psi working. API 16D covers BOP control systems, including control hose that must work in a fire; ours is rated 5,000 psi and 704 °C for 30 minutes.',
        },
        {
          question: 'Which standard covers subsea choke and kill hose?',
          answer:
            'API 17J with ISO 13628-2. Our subsea LMRP hoses are rated 15,000 psi working.',
        },
        {
          question: 'Why are oilfield hose design factors lower than hydraulic hose?',
          answer:
            'They are engineered closer to their limit and rely on inspection, testing and recertification for the margin. API 7K sits at 2.5:1 and API 16C at 1.5:1 on our listings, against 4:1 for hydraulic hose.',
        },
        {
          question: 'Can rotary hose be assembled on site?',
          answer:
            'No. The coupling method is applied at manufacture and is part of what the assembly is qualified as. Replace rotary and choke and kill assemblies as complete, certified units.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Across the oilfield hose shelves',
      skus: [
        'IH-OG-DRL-001',
        'IH-OG-DRL-006',
        'IH-OG-WCT-001',
        'IH-OG-WCT-002',
        'IH-OG-WCT-006',
        'IH-OG-WCT-005',
        'IH-OG-WSV-005',
        'IH-OG-LP-006',
      ],
    },
    {
      type: 'category_link',
      slug: 'oil-gas-hoses',
      label: 'Oil and gas hose',
      blurb: 'Drilling, well control, well service, tensioner and low-pressure rig hose.',
    },
    {
      type: 'category_link',
      slug: 'well-control-hoses',
      label: 'Well control hose (API 16C)',
      blurb: 'Choke and kill lines, BOP control hose and subsea LMRP hose.',
    },
    {
      type: 'category_link',
      slug: 'low-pressure-oilfield-hoses',
      label: 'Low-pressure oilfield hose',
      blurb: 'Black Gold water, fuel, mud and bulk material hose, and Flameshield hose.',
    },

    {
      type: 'cta_block',
      heading: 'Replacing rig hose?',
      body: 'Send the duty, the standard, the bore, the end connections and the documentation clause. We will quote the certified assembly with its pack.',
      quoteLabel: 'Quote oilfield hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Standards, pressures, temperatures and bores checked against our oil and gas hose listings.',
    },
  ],
}

export default ARTICLE
