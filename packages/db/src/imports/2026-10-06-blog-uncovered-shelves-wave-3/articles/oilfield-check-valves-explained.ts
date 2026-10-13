import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Check valves and drill pipe float valves, read from the 22 check valve and
 * 7 float valve listings: type, ends, ratings, trims, float sizes, sub
 * connections and dimensions. The 2" Figure 602 swing check is listed at
 * 5,000 psi, below the figure's 6,000 psi, so its rating is not quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oilfield-check-valves-explained',
  title: 'Oilfield check valves explained: dart, swing and wafer checks, and drill pipe float valves',
  excerpt:
    'Check valves stop flow reversing — on a treating line, at the pump discharge and inside the drill string. How dart, swing and wafer checks close, how a float valve is sized to its sub, and why a check valve is never an isolation valve.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T01:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What types of check valve are used in well service?',
      answer:
        'Three on treating lines: dart checks, where a spring-loaded dart closes against a seat; swing checks, where a hinged flapper swings shut against reverse flow; and wafer checks that fit between flanges. Inside the drill string, a float valve in the bit or float sub does the same job with a flapper or a plunger. On our listings, 1502 dart and swing checks are rated 15,000 psi standard and 10,000 psi sour, and float valves 7,500 psi.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Dart checks close a spring-loaded dart on a seat; swing checks close a hinged flapper. Both stop reverse flow.',
        'Our 1502 dart and swing checks are 15,000 psi for standard service and 10,000 psi for sour.',
        'Wafer checks fit between API 6A flanges: 3-1/16" at 10,000 and 15,000 psi and 3-1/8" at 5,000 psi on our listings.',
        'Float valves are sized to the float sub: 2F-3R for a 3-1/2" Reg sub up to 6F for 8-5/8" Reg.',
        'A check valve is not an isolation valve. Never rely on one to hold pressure while a line is opened.',
      ],
    },
    {
      type: 'lead',
      html: 'Pumps stop, lines fail and wells kick. In each case fluid wants to run the wrong way, back towards equipment and people. A check valve is the part of the line that <strong>lets flow through in one direction only</strong>, and the oilfield uses several kinds, each suited to where it sits — in the treating iron, at a flanged connection, or deep in the drill string above the bit.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Dart, swing and wafer.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'Check valves on our listings',
      columns: ['Type', 'How it closes', 'Examples we list'],
      rows: [
        { cells: ['Dart check', 'Spring-loaded dart against a seat', '2" 1502, 15,000 psi; 3" 1502 sour, 10,000 psi'], highlight: true },
        { cells: ['Swing check, in-line', 'Hinged flapper swung shut by reverse flow', '2" and 3" 1502, 15,000 psi; 2" 206, 2,000 psi'] },
        { cells: ['Swing check, tee body', 'Hinged flapper in a tee-shaped body', '3" and 4" 1502, 15,000 psi; ASME Class 150 and 600 RF'] },
        { cells: ['Wafer check (Type R)', 'Disc between two flanges', '3-1/16" 10K and 15K, 3-1/8" 5K, API 6A flanged'] },
        { cells: ['Float valve', 'Flapper or plunger in the bit or float sub', 'Sizes 2F-3R to 6F, 7,500 psi'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Dart and swing checks on treating iron.',
      anchor: 'iron',
    },
    {
      type: 'paragraph',
      html: 'A dart check holds a dart against its seat with a spring; forward flow pushes it open and the spring and any reverse flow push it shut, so it closes quickly and positively. A swing check hangs a flapper on a hinge that forward flow swings out of the way, giving a straighter path through the valve. On our listings the dart checks have F6NM darts with 316 stainless or, for sour service, Inconel 625 body inserts; the 1502 swing checks have 316 stainless discs on 17-4PH hinges. Union-ended checks take the rating of their figure — see <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Flanged and wafer checks.',
      anchor: 'flanged',
    },
    {
      type: 'paragraph',
      html: 'Where a check sits at a flanged connection — at a wellhead outlet or in a permanent manifold — it is usually a flanged body or a wafer between two flanges. Our Type R wafer checks are API 6A, in 3-1/16" at 10,000 and 15,000 psi and 3-1/8" at 5,000 psi, at PSL 1 or PSL 3 and PR1, most with F6NM discs and Inconel 625 overlay seats. For process piping, the ASME raised-face swing checks are rated by class to API 6D: 3" Class 150 at 285 psi and 3" Class 600 at 1,480 psi, both sour service.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Drill pipe float valves.',
      anchor: 'float',
    },
    {
      type: 'paragraph',
      html: 'A float valve sits in a recess in the float sub or bit sub, just above the bit, and stops mud, cuttings and well fluid flowing back up the drill string. Model G is a flapper valve and Model F a plunger valve; the ported versions, GA and FA, have a small port through the valve. Each size is made for a sub recess: the valve OD, length and baffle-plate recess must match the sub, which is why our listings give all three alongside the connections the sub is cut for. The listings give a 7,500 psi working pressure for Model F and G valves.',
    },
    {
      type: 'comparison_table',
      caption: 'Float valve sizes on our listings',
      columns: ['Size', 'Float or bit sub connection', 'Valve OD × length'],
      rows: [
        { cells: ['2F-3R', '3-1/2" API Reg; 2-7/8" API IF', '2-13/32 in × 6-1/2 in'] },
        { cells: ['4R', '4-1/2" API Reg', '3-15/32 in × 8-5/16 in'], highlight: true },
        { cells: ['4F', '4-1/2" API FH; 4" API IF', '3-21/32 in × 12 in'] },
        { cells: ['5R', '5-1/2" API Reg; 4-1/2" API IF', '3-7/8 in × 9-3/4 in'] },
        { cells: ['5F-6R', '6-5/8" and 7-5/8" API Reg; 5-1/2" API FH and IF', '4-25/32 in × 11-3/4 in'] },
        { cells: ['6F', '8-5/8" API Reg; 6-5/8" API FH and IF', '5-11/16 in × 14-5/8 in'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A check valve is not an isolation valve.',
      body: 'A check valve can leak back past a worn seat or a flapper held open by debris. Before opening any line, isolate it with a closed valve that is rated for the pressure, bleed it down and confirm zero pressure — never trust a check valve to hold.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Installing and ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Every check valve has a flow direction, marked on the body; one installed backwards blocks the line or, worse, fails to protect it. For treating-line checks, give the type, size, end figure and gender, and the service. For float valves, give the size or the float sub connection and recess, and the model — flapper or plunger, ported or plain. The rest of the treating line is covered in <a href="/blog/flow-iron-explained">flow iron explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between a dart check and a swing check?',
          answer:
            'A dart check closes a spring-loaded dart onto a seat; a swing check closes a hinged flapper. The dart closes more positively; the swing check gives a straighter flow path.',
        },
        {
          question: 'What pressure are 1502 check valves rated for?',
          answer:
            'Our 1502 dart and swing checks are 15,000 psi for standard service and 10,000 psi for sour service.',
        },
        {
          question: 'Which float valve fits a 4-1/2" Reg bit sub?',
          answer:
            'Size 4R, which our listing gives for a 4-1/2" API Reg float or bit sub, in Model FA, G and GA.',
        },
        {
          question: 'What does a ported float valve do?',
          answer:
            'It has a small port through the valve. Specify ported (GA or FA) or plain according to the drilling programme.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Check valves',
      skus: [
        'IH-OFV-CHK-DART-2-1502FM-15K-STD-SPM',
        'IH-OFV-CHK-DART-3-1502FM-10K-SOUR-WOM',
        'IH-OFV-CHK-SWING-IL-2-1502FM-15K-STD-WOM',
        'IH-OFV-CHK-SWING-TE-4-1502FM-15K-STD-WOM',
        'IH-OFV-CHK-TYPER-3116-15K-PSL3-STREAMFLO',
        'IH-OFV-CHK-SWING-TE-3-600RF-1480-SOUR-CAMERON',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Drill pipe float valves',
      skus: ['IH-DPFV-2F-3R', 'IH-DPFV-4R', 'IH-DPFV-4F', 'IH-DPFV-5R', 'IH-DPFV-5F-6R', 'IH-DPFV-6F'],
    },
    {
      type: 'category_link',
      slug: 'oilfield-check-valves',
      label: 'Oilfield check valves',
      blurb: 'Dart, swing and wafer checks with union, API and ASME ends.',
    },
    {
      type: 'category_link',
      slug: 'oilfield-float-valves',
      label: 'Float valves',
      blurb: 'Drill pipe float valves from 2F-3R to 6F.',
    },

    {
      type: 'cta_block',
      heading: 'Need check or float valves?',
      body: 'Send the type, size, ends and service for treating-line checks, or the float sub connection and model for float valves. We will quote valves and spare internals.',
      quoteLabel: 'Quote check valves',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Types, ends, ratings, trims, float sizes, connections and dimensions checked against our check valve and float valve listings.',
    },
  ],
}

export default ARTICLE
