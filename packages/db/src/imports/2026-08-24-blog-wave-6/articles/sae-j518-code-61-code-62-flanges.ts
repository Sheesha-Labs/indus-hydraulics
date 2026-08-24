import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'sae-j518-code-61-code-62-flanges',
  title: 'SAE J518 Code 61 and Code 62 flanges: telling them apart before you order',
  excerpt:
    'Two split-flange halves for the same bore, one rated for far more pressure than the other, and almost nothing on the part to say which is which. The measurement that settles it takes ten seconds.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'SAE J518 Code 61 vs Code 62 flange — how to tell which you have',
  seoDescription:
    'The difference between SAE J518 Code 61 standard series and Code 62 high pressure series split flanges, why they are not interchangeable, and how to identify one from bolt spacing.',
  focusKeyword: 'code 61 vs code 62 flange',
  publishedAt: '2026-08-24T17:28:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Code 61 is the standard-pressure series and Code 62 the high-pressure series of the same SAE J518 four-bolt split flange design.',
        'For the same bore, Code 62 uses a larger bolt circle, larger bolts and a thicker flange head. That is what you measure.',
        'They are not interchangeable in either direction. Code 61 clamps will not fit a Code 62 head, and a Code 61 head in a Code 62 application is under-rated.',
        'The seal is an O-ring in the flange head groove, not the flange face. A flange assembled without it, or with the wrong section, leaks immediately.',
        'Both series come in the same nominal bore sizes, so the size stamped on the part tells you nothing about which series it is.',
      ],
    },
    {
      type: 'lead',
      html: 'Threaded connectors run out of sense somewhere around one inch: the nut gets unreasonable to torque and the thread carries the whole load. Above that, hydraulics moves to a four-bolt split flange, and the whole family sits under one SAE standard with two pressure series that look almost the same in a photograph and cost a shipment when confused.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two series, one standard.',
      anchor: 'two-series',
    },
    {
      type: 'comparison_table',
      caption: 'The practical differences',
      columns: ['Property', 'Code 61 — standard series', 'Code 62 — high pressure series'],
      rows: [
        { cells: ['Also called', '3000 psi series', '6000 psi series'], highlight: true },
        { cells: ['Bolt circle for a given bore', 'Smaller', 'Larger'] },
        { cells: ['Bolt size for a given bore', 'Smaller', 'Larger'] },
        { cells: ['Flange head thickness', 'Thinner', 'Thicker'] },
        {
          cells: [
            'Typical application',
            'Return lines, lower-pressure pump ports, most mobile suction and case drains',
            'Pump and motor pressure ports on high-pressure circuits',
          ],
        },
        {
          cells: [
            'Bore sizes offered',
            'The wider range, including the largest sizes',
            'Concentrated in the smaller and mid sizes',
          ],
        },
        { cells: ['Interchangeable with the other series', 'No', 'No'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The rated pressure depends on size as well as series.',
      body: 'The familiar 3000 and 6000 psi labels are shorthand for the series, not a single figure that applies across every bore in it. Working pressure falls as bore increases within each series. Take the rating for the specific size from the manufacturer catalogue for the part you are buying, not from the series nickname.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Identifying what is on the machine.',
      anchor: 'identifying',
    },
    {
      type: 'decision_tree',
      heading: 'Which series is this flange?',
      intro:
        'Measure rather than judge by eye. The two series look similar photographed alone and obvious side by side, and you will rarely have both.',
      branches: [
        {
          condition:
            'Measure the distance between the centres of two diagonally opposite bolt holes',
          outcome: 'This is the number that identifies the series for a given bore.',
          detail:
            'Compare it against the manufacturer dimension table for that nominal size. For the same bore, the Code 62 figure is always the larger of the two.',
        },
        {
          condition: 'Check the bolt size in the clamp halves',
          outcome: 'A second confirmation, and easier in the field.',
          detail:
            'Code 62 uses a larger bolt than Code 61 for the same bore. If someone has previously fitted the wrong bolts this test misleads, so treat it as confirmation rather than proof.',
        },
        {
          condition: 'Measure flange head thickness',
          outcome: 'Code 62 heads are visibly thicker.',
          detail: 'Useful when the flange is still on a hose and the clamps are elsewhere.',
        },
        {
          condition: 'Still ambiguous',
          outcome: 'Photograph the head against a rule and send it with the bore size.',
          detail:
            'Ambiguity here is normal, and getting it wrong costs a shipment and a machine day.',
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'One more distinction to keep separate in your head: <strong>split-flange codes are not pipe flange classes.</strong> An ANSI or DIN pipe flange with a bolt ring around the whole circumference is a different fastening system, is specified by class and standard, and has nothing to do with SAE J518.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The O-ring does the sealing.',
      anchor: 'the-o-ring',
    },
    {
      type: 'paragraph',
      html: 'A split flange does not seal metal to metal. The flange head carries a groove holding an O-ring that is squeezed against the flat port face as the clamps are drawn down. Two consequences: <strong>the port face must be flat and unmarked</strong>, and the O-ring must be the correct section for the groove.',
    },
    {
      type: 'comparison_table',
      caption: 'Flange sealing faults',
      columns: ['Fault', 'How it presents'],
      rows: [
        { cells: ['O-ring omitted', 'Gross leak on first pressurisation'], highlight: true },
        {
          cells: ['O-ring pinched between head and port face', 'Weeps from one side of the flange'],
        },
        {
          cells: ['Clamps tightened unevenly', 'Weeps from the side tightened last'],
          highlight: true,
        },
        {
          cells: ['Scored or corroded port face', 'Weeps regardless of how the bolts are torqued'],
        },
        { cells: ['Wrong elastomer for the fluid', 'Seals, then fails after weeks of service'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Tighten flange bolts in a cross pattern, in stages.',
      body: 'Four bolts drawn down one at a time cock the head and pinch the O-ring on one side. Snug all four, then torque in a diagonal sequence in two or three passes to the manufacturer figure for the bolt size and grade. This is the most common cause of a flange that weeps despite being correctly specified.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a Code 61 and Code 62 hydraulic flange?',
      answer:
        'Both are four-bolt split flanges under SAE J518. Code 61 is the standard-pressure series and Code 62 the high-pressure series. For the same bore, Code 62 has a larger bolt circle, larger bolts and a thicker flange head, so the two are not interchangeable in either direction. Identify which you have by measuring the bolt hole spacing against the manufacturer dimension table for that bore.',
    },
    {
      type: 'standard_citation',
      standard: 'SAE J518',
      publisher: 'SAE International',
      title: 'Hydraulic Flanged Tube, Pipe, and Hose Connections, 4-Bolt Split Flange Type',
      summary:
        'Defines the four-bolt split flange connection in two pressure series, referred to in the trade as Code 61 and Code 62. It sets flange head and port dimensions for each series and each bore, which is why dimensions — not appearance — are what identify a part.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 6162',
      publisher: 'ISO',
      title: 'Hydraulic fluid power — Flange connections with split or one-piece flange clamps',
      summary:
        'The international counterpart, published in parts covering the standard and high pressure series. Relevant when a machine is specified to ISO rather than SAE — the connections correspond closely, but confirm the dimension table for the specific size rather than assuming equivalence.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-sae-flanges',
      label: 'Hydraulic SAE flanges',
      blurb: 'Split flange heads and clamp kits by series and bore.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'Flange O-rings in the correct section and material.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I use Code 62 clamps on a Code 61 flange head?',
          answer:
            'No. The bolt spacing differs, so the clamp halves will not line up with the port bolt holes. Even where they could be forced to fit, the clamp would not bear correctly on the head.',
        },
        {
          question: 'Is it safe to fit a Code 61 flange on a circuit that used Code 62?',
          answer:
            'No. The Code 62 port exists because the pressure demands it. Fitting the standard series into a high-pressure application means the connection is under-rated, and a flange failure at that pressure is a serious event.',
        },
        {
          question: 'The port face is slightly scored. Can I still use it?',
          answer:
            'Light marking outside the O-ring contact band is usually tolerable. A radial score crossing the contact band is a leak path and needs the port face repaired or the component replaced.',
        },
        {
          question: 'How do I know which bolts to use?',
          answer:
            'Use the size, grade and length specified by the flange manufacturer, and torque them to the figure for that bolt. Longer bolts bottom out; shorter ones do not achieve full thread engagement; lower grades stretch.',
        },
        {
          question: 'What about the square seal I have seen on some machines?',
          answer:
            'Some manufacturers use a captive square-section or profiled seal in place of a standard O-ring in their own flange heads. Match the seal to the flange head it came from rather than assuming a round O-ring of the same nominal size will do.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Standard designations checked as published. Dimensions are deliberately not reproduced here — take them from the catalogue for the part being bought.',
    },
    {
      type: 'cta_block',
      heading: 'Measure it once, and send us the number.',
      body: 'Bolt hole spacing plus bore size identifies the series without argument. Send those two figures, or a photograph of the head against a rule, and we will confirm before anything is shipped.',
      quoteLabel: 'Check a flange',
    },
  ],
}

export default ARTICLE
