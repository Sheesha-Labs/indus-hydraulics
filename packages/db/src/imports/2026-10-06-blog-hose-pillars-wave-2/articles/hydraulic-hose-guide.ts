import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The hydraulic hose pillar. Every grade figure is from the hose listings —
 * pressure at a stated bore, temperature, bend radius, construction — and every
 * section links to the article that goes deeper.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-guide',
  title: 'Hydraulic hose: the complete guide to constructions, standards, sizes and pressure',
  excerpt:
    'Braid, spiral, compact, thermoplastic and PTFE; SAE 100R against EN 853, 856 and 857; dash sizes and pressure by bore. The hydraulic hose guide, with every figure from the grades we stock.',
  categorySlug: 'specification-standards',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I choose a hydraulic hose?',
      answer:
        'Work from the circuit, not the catalogue. Fix the bore from flow and the dash size, then the working pressure at that bore — ratings fall steeply with size on braided hose — then temperature, fluid, routing and bend radius, then the ends. That points to a construction: two-wire braid such as 2SN for most mobile circuits, compact 2SC where routing is tight, spiral 4SH, R13 or R15 for large-bore high pressure, and thermoplastic or PTFE for special duty.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'A hose\'s pressure rating belongs to a bore, not to the grade: 2SN falls from 400 bar at −04 to 80 bar at −32.',
        'Spiral hose holds its rating across sizes — R13 holds 350 bar from −12 to −32, R15 420 bar to −24 — which is why large-bore high-pressure circuits are spiral.',
        'Compact braid (1SC, 2SC) halves the bend radius of standard braid at the same pressure class.',
        'Most grades are rated −40 to +100 °C; R5, R12, R13 and R15 to +121 °C; PTFE (R14) to +204 °C.',
        'SAE 100R numbers are a catalogue, not a ranking, and only some EN and SAE grades genuinely cross-reference.',
        'Match the fitting and ferrule series to the hose: braided-hose and spiral-hose crimp fittings are different parts.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic hose is three layers doing three jobs: a tube that holds the fluid, reinforcement that holds the pressure, and a cover that protects the reinforcement. Almost everything that distinguishes one hose from another — pressure, bend radius, weight, price — follows from <strong>how the reinforcement is built</strong>. This guide works through the constructions we stock, the standards they are made to, and the order in which to make the choice, linking to the detail on each.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Tube, reinforcement, cover.',
      anchor: 'construction',
    },
    {
      type: 'paragraph',
      html: 'The <strong>tube</strong> on almost every wire-reinforced hose we stock is nitrile (NBR), chosen because it suits mineral hydraulic oil. The <strong>reinforcement</strong> is where the grades divide: textile braid for low pressure, one or two layers of braided steel wire for medium and high pressure, four or six layers of spiralled wire for the highest pressures at large bores. The <strong>cover</strong> is synthetic rubber specified for abrasion, weather or both — our 1SN, 2SN, 2SC, 4SP and 4SH covers are listed as abrasion- and weather-resistant, the spiral R12, R13 and R15 covers as abrasion-resistant, and most carry MSHA acceptance.',
    },
    {
      type: 'comparison_table',
      caption: 'The four reinforcement families',
      columns: ['Family', 'Our grades', 'Where it fits'],
      rows: [
        { cells: ['Textile braid', 'R3, R6', 'Return, suction and low-pressure lines'] },
        { cells: ['Wire braid (one or two layers)', '1SN, 2SN, R5; compact 1SC, 2SC', 'Most mobile and industrial circuits'], highlight: true },
        { cells: ['Wire spiral (four or six layers)', '4SP, 4SH, R12, R13, R15', 'Large-bore, high-pressure, high-impulse circuits'] },
        { cells: ['Thermoplastic / PTFE', 'R7, R8; R14', 'Light weight, non-conductive, chemical or high-temperature duty'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The trade-off between braid and spiral is set out in <a href="/blog/braid-vs-spiral-hydraulic-hose">braid or spiral</a>; the compact constructions in <a href="/blog/compact-hose-1sc-2sc">compact hose</a>.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The standards: SAE J517 and EN 853, 856 and 857.',
      anchor: 'standards',
    },
    {
      type: 'paragraph',
      html: 'Two families of standards cover most hydraulic hose. <strong>SAE J517</strong> defines the 100R series — 100R1AT, 100R2AT, 100R12, 100R13 and so on — numbered in the order the constructions were standardised, which is not the order of anything a buyer cares about. <strong>EN 853</strong> covers wire-braid hose (1SN, 2SN), <strong>EN 856</strong> spiral hose (4SP, 4SH) and <strong>EN 857</strong> compact braid (1SC, 2SC). For the oldest constructions the two converged, so one hose is certified to both and prints both on its layline: our 2SN is EN 853 2SN and SAE 100R2AT. For others they did not, and "4SP equals R12" is a convenience, not an equivalence. ISO 18752 adds a third approach, classing hose by pressure and performance rather than construction.',
    },
    {
      type: 'paragraph',
      html: 'The numbering is untangled in <a href="/blog/sae-100r-hose-types">SAE 100R hose types</a> and the cross-reference question in <a href="/blog/en-853-856-857-vs-sae-100r">EN 853, 856 and 857 against SAE 100R</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Size: the dash number.',
      anchor: 'size',
    },
    {
      type: 'paragraph',
      html: 'Hydraulic hose is sized by its nominal bore in sixteenths of an inch: −04 is 1/4", −08 is 1/2", −16 is 1". DN is the metric nominal equivalent. The dash number describes the bore only — not the outside diameter, which at −08 ranges from 17.2 mm on R14 to 23.0 mm on 4SP across the grades we stock, and not the port thread. SAE 100R5 is the exception, sized on tube outside diameter, so its dash number sits one step out from everyone else\'s. The full table is in <a href="/blog/hydraulic-hose-dash-sizes">hydraulic hose dash sizes</a>.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Pressure belongs to a bore.',
      anchor: 'pressure',
    },
    {
      type: 'paragraph',
      html: 'The single most expensive misunderstanding in hose selection is treating a grade\'s headline pressure as the rating at every size. Braided hose loses rating steeply as the bore rises; spiral hose barely moves. Every grade below is built to a 4:1 design factor, so the minimum burst is four times the working pressure.',
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure by grade and bore (our listings)',
      columns: ['Grade', 'Working pressure', 'Bore range', 'Temperature'],
      rows: [
        { cells: ['1SN / R1AT', '225 bar at −04 → 40 bar at −32', '1/4" – 2"', '−40 to +100 °C'] },
        { cells: ['2SN / R2AT', '400 bar at −04 → 80 bar at −32', '1/4" – 2"', '−40 to +100 °C'], highlight: true },
        { cells: ['2SC (compact)', '400 bar at −04', '1/4" – 1"', '−40 to +100 °C'] },
        { cells: ['4SH', '420 bar at −12 → 250 bar at −32', '3/4" – 2"', '−40 to +100 °C'] },
        { cells: ['R13', '350 bar from −12 to −32', '3/4" – 2"', '−40 to +121 °C'] },
        { cells: ['R15', '420 bar from −12 to −24', '3/4" – 1-1/2"', '−40 to +121 °C'] },
        { cells: ['R5', '210 bar at −04 → 24 bar at −32', '3/16" – 2"', '−40 to +121 °C'] },
        { cells: ['R7 (thermoplastic)', '210 bar at −03 → 70 bar at −16', '1/8" – 1"', '−40 to +93 °C'] },
        { cells: ['R14 (PTFE)', '200 bar at −03 → 65 bar at −16', '3/16" – 1"', '−54 to +204 °C'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Set the hose against the highest pressure the circuit can reach — usually the relief valve setting — not the normal running pressure, and allow for pressure spikes on impulse duty. The per-size figures for every grade are in <a href="/blog/hydraulic-hose-pressure-by-size">hydraulic hose pressure by size</a>.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Temperature, fluid and the outside world.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'Most of our wire-reinforced grades are rated −40 to +100 °C; R5, R12, R13 and R15 to +121 °C; thermoplastic R7 and R8 to +93 °C; R14 PTFE from −54 to +204 °C. Those are fluid temperatures. A hose beside a hot manifold or in Gulf sun ages from the outside as well, and time spent hot is spent — see <a href="/blog/hydraulic-hose-in-uae-heat">hydraulic hose in UAE heat</a>. The NBR tube suits mineral oil; for other fluids, check compatibility, and where nitrile keeps failing, a PTFE or thermoplastic tube changes the problem — see <a href="/blog/hydraulic-hose-tube-swelling">tube swelling</a> and <a href="/blog/ptfe-hose-explained">PTFE hose</a>.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Bend radius and routing.',
      anchor: 'routing',
    },
    {
      type: 'paragraph',
      html: 'Every grade has a minimum bend radius that rises with bore: 2SN needs 100 mm at −04 and 630 mm at −32; 4SH 280 mm at −12 and 700 mm at −32; compact 2SC only 50 mm at −04 and 150 mm at −16. Bending tighter flattens the bore and overloads the reinforcement. Twist is worse: a hose installed with a twist loses life from the first pressurisation, and the layline is the only reliable indicator. Read <a href="/blog/hose-routing-bend-radius-twist">hose routing, bend radius and twist</a> before planning a run.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Ends, ferrules and assembly.',
      anchor: 'ends',
    },
    {
      type: 'paragraph',
      html: 'A hose is only as good as the joint at each end. The fitting and ferrule have to be the series made for the hose: our braided-hose crimp fittings are listed for 1SN, 2SN, R1AT, R2AT, R16 and R17; our spiral-hose crimp fittings for 4SP and R12; 4SH, R13 and R15 take their own skive or interlock ferrules. The crimp is then a measured diameter, specific to that hose, fitting and die. See <a href="/blog/braided-vs-spiral-hose-fittings">braided against spiral hose fittings</a>, the <a href="/blog/hydraulic-hose-assembly-guide">hose assembly guide</a> and the <a href="/blog/hydraulic-fittings-guide">hydraulic fittings guide</a> for the thread families at the other end.',
    },

    {
      type: 'section_head',
      number: '/08',
      title: 'Choosing, in order.',
      anchor: 'choosing',
    },
    {
      type: 'decision_tree',
      heading: 'Size, temperature, application, media, pressure, ends — in that order',
      intro: 'The industry\'s STAMPED mnemonic, applied to the grades we stock.',
      branches: [
        { condition: 'Size: what bore does the flow need?', outcome: 'Set the dash size from the flow and acceptable velocity; the old hose\'s layline or bore is the usual starting point.' },
        { condition: 'Temperature: above +100 °C fluid or radiant heat?', outcome: 'R13, R15 or R5 to +121 °C; R14 PTFE to +204 °C. Otherwise the standard grades to +100 °C.' },
        { condition: 'Application: tight routing or constant flexing?', outcome: 'Compact 1SC or 2SC halves the bend radius of standard braid.', sku: 'IH-HOSE-2SC' },
        { condition: 'Media: not mineral oil?', outcome: 'Check the NBR tube; consider R14 PTFE or a thermoplastic grade.', sku: 'IH-HOSE-R14' },
        { condition: 'Pressure: above roughly 250 bar at −16 or larger?', outcome: 'Spiral: 4SH, R13 (350 bar across sizes) or R15 (420 bar).', sku: 'IH-HOSE-R13' },
        { condition: 'Pressure: moderate, at small to medium bore?', outcome: 'Two-wire braid, 2SN — check the rating at your bore.', sku: 'IH-HOSE-R2-2SN' },
        { condition: 'Ends: which thread family at each end?', outcome: 'Match the fitting series to the hose and the thread to the port; see the fittings guide.' },
      ],
    },

    {
      type: 'section_head',
      number: '/09',
      title: 'Failure, inspection and replacement.',
      anchor: 'failure',
    },
    {
      type: 'paragraph',
      html: 'Hoses rarely fail without leaving evidence: where they failed, what the cover looks like and whether the wire is corroded each point to a cause — see <a href="/blog/why-hydraulic-hoses-fail">why hydraulic hoses fail</a>. A written <a href="/blog/hydraulic-hose-inspection">inspection</a> routine catches abrasion, cover cracking and weeping before they become bursts, and a register turns the failures you do have into a replacement interval. Stored spares age too; see <a href="/blog/hydraulic-hose-shelf-life-storage">shelf life and storage</a>.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never search for a leak with your hand.',
      body: 'Fluid escaping from a pinhole at hydraulic pressure can penetrate skin without a visible wound, and it is a surgical emergency. Depressurise before inspecting, use a piece of card, and get anyone injured to hospital immediately.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between 1SN and 2SN hydraulic hose?',
          answer:
            '1SN has one layer of braided wire, 2SN two. On our listings 1SN runs from 225 bar at −04 to 40 bar at −32, 2SN from 400 bar to 80 bar over the same range.',
        },
        {
          question: 'Is SAE 100R2AT the same as EN 853 2SN?',
          answer:
            'For the hose we stock, yes — it is certified to both and prints both on its layline. Not every EN and SAE pair cross-references that cleanly; 4SP and R12 are separately specified.',
        },
        {
          question: 'When should I use spiral hose instead of braid?',
          answer:
            'At large bores with real pressure, or on high-impulse circuits. Braid loses most of its rating as the bore rises; R13 holds 350 bar from −12 to −32 and R15 holds 420 bar.',
        },
        {
          question: 'What temperature can hydraulic hose handle?',
          answer:
            'Most of our grades are rated −40 to +100 °C; R5, R12, R13 and R15 to +121 °C; R14 PTFE to +204 °C. Those are fluid temperatures — external heat ages the hose too.',
        },
        {
          question: 'What does the dash size mean?',
          answer:
            'The nominal bore in sixteenths of an inch: −08 is 1/2". It says nothing about the outside diameter or the port thread, and SAE 100R5 is sized differently.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'The grades in this guide',
      skus: ['IH-HOSE-R1-1SN', 'IH-HOSE-R2-2SN', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH', 'IH-HOSE-R13', 'IH-HOSE-R15', 'IH-HOSE-R14'],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose',
      blurb: 'Braid, compact, spiral, textile and PTFE hose, −04 to −32.',
    },
    {
      type: 'category_link',
      slug: 'thermoplastic-hoses',
      label: 'Thermoplastic hose',
      blurb: 'R7 and R8 thermoplastic hydraulic hose.',
    },
    {
      type: 'category_link',
      slug: 'crimp-ferrules',
      label: 'Crimp ferrules',
      blurb: 'No-skive, skive, interlock and PTFE ferrules matched to each hose.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying a hose?',
      body: 'Send the bore, the working and relief pressures, the fluid, the temperature and the ends — or a photograph of the old hose\'s layline. We will recommend the grade and quote the tested assembly.',
      quoteLabel: 'Quote hydraulic hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, temperatures, bend radii, bore ranges and standards checked against our hydraulic hose listings.',
    },
  ],
}

export default ARTICLE
