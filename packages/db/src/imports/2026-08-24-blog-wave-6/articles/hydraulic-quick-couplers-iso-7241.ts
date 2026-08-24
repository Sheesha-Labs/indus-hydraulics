import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-quick-couplers-iso-7241',
  title: 'Quick couplers: ISO 7241 A, B and flat-face, and why yours will not connect',
  excerpt:
    'Two couplers of the same nominal size, the same thread and the same brand will refuse to mate if one is Series A and the other Series B. Here is how to tell which you have before you order.',
  categorySlug: 'hose-assembly',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic quick coupler types — ISO 7241 A vs B vs flat face',
  seoDescription:
    'Why a half-inch coupler will not connect to another half-inch coupler: interchange series explained, ISO 7241 Series A and B against ISO 16028 flat-face, and how to identify one from a photograph.',
  focusKeyword: 'hydraulic quick coupler types',
  publishedAt: '2026-08-24T17:12:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Nominal size does not determine whether two couplers mate. The interchange series does.',
        'ISO 7241 Series A and Series B are both poppet couplers, both come in the same nominal sizes, and they never intermate.',
        'The body thread is a port connection, not an interchange marking. Two couplers with identical threads can be from different series.',
        'ISO 16028 flat-face is the standard on modern attachment circuits: less spillage, less trapped air, and a face that can be wiped clean.',
        'Agricultural tractor remotes are ISO 5675, which is a different profile again and is not ISO 7241 Series A despite looking similar.',
      ],
    },
    {
      type: 'lead',
      html: 'Almost every "these do not fit and they are both half inch" thread on the internet is the same problem. The bore size in the part number describes flow capacity. Whether two halves latch is decided by the coupling profile — the poppet, the sleeve, the locking ball track — and that is a completely separate specification that is very rarely printed on the part.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The three families you will meet.',
      anchor: 'three-families',
    },
    {
      type: 'comparison_table',
      caption: 'What each one is for',
      columns: ['Family', 'Where it is normally found', 'Recognisable by'],
      rows: [
        {
          cells: [
            'ISO 7241 Series A',
            'General industrial, older mobile equipment, workshop rigs',
            'Slim body, poppet recessed well inside the female',
          ],
          highlight: true,
        },
        {
          cells: [
            'ISO 7241 Series B',
            'Heavier industrial duty, many machine tool circuits',
            'Visibly stockier body for the same bore than Series A',
          ],
          highlight: true,
        },
        {
          cells: [
            'ISO 16028 flat-face',
            'Skid steers, excavator attachments, anything with frequent changeover',
            'Both halves present a flush flat face when uncoupled',
          ],
        },
        {
          cells: [
            'ISO 5675',
            'Agricultural tractor rear remotes',
            'Pull-break design, sized for tractor spool blocks',
          ],
        },
        {
          cells: [
            'Screw-to-connect',
            'High impulse, breakers, hammers, high residual pressure',
            'Threaded collar instead of a sliding sleeve',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Series A and Series B are the same standard and still do not mate.',
      body: 'ISO 7241 defines more than one interchange profile. Two couplers can both be compliant, both be nominally half inch, and be mechanically incapable of latching to each other. Compliance with the standard is not compatibility with another compliant part.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Identifying what is already on the machine.',
      anchor: 'identifying',
    },
    {
      type: 'decision_tree',
      heading: 'Working out which coupler you have',
      intro: 'In order, because each step removes more of the possibilities than the one after it.',
      branches: [
        {
          condition: 'Is the uncoupled face flat and flush on both halves?',
          outcome: 'Flat-face — ISO 16028 or a proprietary flat-face profile.',
          detail:
            'Flat-face is visually unmistakable and is the only family you can identify with confidence from a distance.',
        },
        {
          condition: 'Does it have a threaded collar rather than a sliding sleeve?',
          outcome: 'Screw-to-connect. Specify by the manufacturer profile.',
          detail:
            'These exist because they connect under residual pressure and survive impulse. They are almost never cross-compatible between makers.',
        },
        {
          condition: 'Poppet type, and it is on a farm tractor rear remote?',
          outcome: 'Assume ISO 5675 until measured otherwise.',
          detail: 'Superficially similar to Series A, dimensionally not the same.',
        },
        {
          condition: 'Poppet type, industrial or mobile machine',
          outcome: 'Series A or Series B — this is where measurement is unavoidable.',
          detail:
            'Measure the male tip diameter and the female sleeve outside diameter, and compare both against a manufacturer interchange chart for that nominal size. The body thread will not answer it.',
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'The single most useful habit: <strong>when a coupler is replaced, replace both halves as a pair.</strong> Mixing a new female onto an old male of unknown series is how a machine ends up with three incompatible quick-connect standards and no record of which is which.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Why flat-face won the attachment market.',
      anchor: 'flat-face',
    },
    {
      type: 'comparison_table',
      caption: 'Poppet against flat-face, on a machine that changes attachments daily',
      columns: ['Property', 'Poppet (Series A / B)', 'Flat-face (ISO 16028)'],
      rows: [
        {
          cells: ['Oil lost per disconnect', 'A measurable dribble each time', 'Close to none'],
          highlight: true,
        },
        { cells: ['Air drawn in on connect', 'Yes, in the poppet cavity', 'Very little'] },
        {
          cells: [
            'Can be wiped clean before mating',
            'Not properly — dirt sits in the recess',
            'Yes, both faces wipe flat',
          ],
          highlight: true,
        },
        {
          cells: [
            'Behaviour in a dusty yard',
            'Contamination enters with every changeover',
            'Much better',
          ],
        },
        { cells: ['Cost per pair', 'Lower', 'Higher'] },
        { cells: ['Pressure drop for the same bore', 'Higher', 'Lower'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Why will my hydraulic quick couplers not connect?',
      answer:
        'Because they are different interchange series, not different sizes. ISO 7241 Series A and Series B share nominal sizes but have different internal profiles and never mate, and flat-face ISO 16028 mates with neither. Match the series, not the bore size or the body thread — and if the coupler is already pressurised, trapped pressure will also stop it connecting.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'If it will not push home, stop pushing.',
      body: 'A coupler that refuses to seat is either the wrong series or has pressure trapped behind the poppet. Forcing it with a hammer or a lever damages the ball track and produces a coupler that latches but releases under load. Trapped pressure has its own release procedure, and it is not force.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Specifying a replacement.',
      anchor: 'specifying',
    },
    {
      type: 'comparison_table',
      caption: 'What we need to supply the right half',
      columns: ['Detail', 'Why it matters'],
      rows: [
        {
          cells: [
            'Interchange series or a photograph of the mating half',
            'Decides whether it will latch at all',
          ],
          highlight: true,
        },
        { cells: ['Nominal size', 'Decides flow capacity, not compatibility'] },
        { cells: ['Body port thread and gender', 'How it attaches to the hose or the manifold'] },
        {
          cells: [
            'Working pressure of the circuit',
            'Flat-face and poppet ranges differ by series and size',
          ],
        },
        {
          cells: [
            'Whether it must connect under residual pressure',
            'Points to screw-to-connect or a pressure-eliminator design',
          ],
          highlight: true,
        },
        {
          cells: [
            'Fluid and duty',
            'Seal material — the coupler seals are the part that fails first',
          ],
        },
      ],
    },
    {
      type: 'standard_citation',
      standard: 'ISO 7241',
      publisher: 'ISO',
      title: 'Hydraulic fluid power — Quick-action couplings',
      summary:
        'Specifies dimensions and requirements for quick-action couplings, including the separate interchange profiles commonly referred to in the trade as Series A and Series B. The important consequence for a buyer: two couplings can both conform and still be mechanically incompatible.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 16028',
      publisher: 'ISO',
      title: 'Hydraulic fluid power — Flush-face type, quick-action couplings',
      summary:
        'The flat-face standard used on attachment circuits. Its defining feature is that both halves present a flush face when uncoupled, which is why it loses almost no fluid on disconnect and can be wiped clean before mating.',
    },
    {
      type: 'category_link',
      slug: 'quick-couplers',
      label: 'Hydraulic quick couplers',
      blurb: 'Poppet and flat-face, supplied as matched pairs.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'Coupler seal kits and dust caps.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I connect an ISO 7241 Series A coupler to a Series B one?',
          answer:
            'No. They are different interchange profiles. No adapter converts one to the other in place; you change one half so both are the same series.',
        },
        {
          question: 'Both couplers are 1/2 inch. Why does that not mean they fit?',
          answer:
            'The size refers to nominal bore and therefore flow capacity. Latching depends on the coupling profile, which is a separate specification and is usually not marked on the part.',
        },
        {
          question: 'Are flat-face couplers worth the extra cost?',
          answer:
            'On anything that changes attachments regularly, yes — the saving is in contamination and spilled oil rather than in the coupler itself. On a fixed circuit that is disconnected twice a year, the case is much weaker.',
        },
        {
          question: 'My coupler leaks a few drops every time I disconnect. Is it faulty?',
          answer:
            'On a poppet coupler that is normal behaviour, not a fault. If the loss is more than a few drops, or it weeps while connected, the seals have gone and the pair should be replaced.',
        },
        {
          question: 'What is a pressure-eliminator or decompression coupler?',
          answer:
            'A design that vents or mechanically overcomes residual pressure in the male half so it can be connected after the circuit has been left standing. Worth specifying on attachment circuits that sit in the sun.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Standard designations checked as published. Series identification reflects bench practice rather than a published gauge method.',
    },
    {
      type: 'cta_block',
      heading: 'Send a photograph of both halves.',
      body: 'Series is identifiable from a square-on photograph of the mating faces plus the nominal size. Send both halves and we will tell you what you have before anything is ordered.',
      quoteLabel: 'Identify a coupler',
    },
  ],
}

export default ARTICLE
