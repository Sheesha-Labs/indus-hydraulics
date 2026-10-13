import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Ball valve ratings, read from the 11 oilfield, 10 industrial and 6
 * hydraulic ball valve listings: rating systems used (CWP, WOG, PN, ASME
 * class, union figure, API 6A), floating and trunnion designs, ends and body
 * materials. The 2" Figure 602 floating valve listed a 5K class against a
 * 6,000 psi working pressure, so it is not quoted; its class was corrected to
 * 6K by 2026-10-06-listing-data-fixes.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ball-valve-pressure-ratings-cwp-wog',
  title: 'Ball valve pressure ratings explained: CWP, WOG, PN, ASME class and union figure',
  excerpt:
    'One ball valve says 1,000 WOG, another PN63, another Class 600 and another 1502. What each rating system means, why every rating belongs to a temperature, and how floating and trunnion valves differ.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T02:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What do CWP and WOG mean on a ball valve?',
      answer:
        'CWP is cold working pressure — the maximum pressure at ambient temperature. WOG stands for water, oil, gas and is an older North American marking for the same kind of cold, non-shock rating. Neither is a rating at high temperature: at higher temperatures the allowable pressure falls with the body and seat materials. European valves use PN, nominal pressure in bar, and flanged process valves use ASME classes such as Class 600.',
    },
    {
      type: 'key_takeaways',
      items: [
        'CWP and WOG are cold, non-shock ratings. 1,000 WOG means 1,000 psi at ambient, not at 150 °C.',
        'PN is nominal pressure in bar: PN400 is about 5,800 psi.',
        'ASME classes set pressure by temperature; at ambient, carbon steel Class 150 is 285 psi, Class 300 is 740 psi and Class 600 is 1,480 psi.',
        'Union-ended oilfield valves take their figure\'s rating: our 1502 ball valves are 15,000 psi standard and 10,000 psi sour.',
        'Floating balls seal on the downstream seat; trunnion-mounted balls are held on trunnions with sprung seats, for larger sizes and higher pressures.',
      ],
    },
    {
      type: 'lead',
      html: 'Ball valve ratings are written in at least five different systems, and a single size on our industrial shelf can carry several at once — CWP 4,000 psi, 1,000 WOG, PN63. They are not interchangeable, and <strong>every one of them is tied to a temperature</strong> whether or not the marking says so. Knowing which system a number belongs to is the difference between a valve that holds and one that weeps at the stem.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Five rating systems.',
      anchor: 'systems',
    },
    {
      type: 'comparison_table',
      caption: 'Ball valve ratings on our listings',
      columns: ['Marking', 'What it means', 'Example on our listings'],
      rows: [
        { cells: ['CWP', 'Cold working pressure, psi, at ambient temperature', '1/2" and 3/4" industrial valves, CWP 3,000 psi'], highlight: true },
        { cells: ['WOG', 'Water, oil, gas — an older cold, non-shock rating', '2-1/2" and 3" industrial valves, 1,000 WOG'] },
        { cells: ['PN', 'Nominal pressure in bar', '3/4" hydraulic valve, PN400 (5,800 psi)'] },
        { cells: ['ASME class', 'Pressure–temperature class for flanged valves', '2" Class 150 RF, 285 psi; 4" Class 600 RF, 1,480 psi'] },
        { cells: ['Union figure / API 6A', 'Oilfield ratings by end connection', '2" and 3" 1502 at 15,000 psi; 3-1/8" API 6A 5M flanged'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Every rating has a temperature.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'Metal loses strength as it heats, and polymer seats soften well before the body does. A cold rating — CWP, WOG or the ambient figure of an ASME class — is the most the valve will hold near room temperature; the allowable pressure falls as temperature rises, and the seat may set a lower limit than the body. One of our industrial listings shows the pattern plainly: a 1/2" valve at CWP 3,000 psi and, for another make of the same size, 2,200 psig at 100 °F. When the line is hot, ask for the rating at the operating temperature, not the headline figure.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Floating against trunnion.',
      anchor: 'design',
    },
    {
      type: 'paragraph',
      html: 'In a floating ball valve the ball is held between two seats and line pressure pushes it onto the downstream seat to seal; the force on the seat rises with size and pressure, and so does the operating torque. A trunnion-mounted ball is supported top and bottom on trunnions, and spring-loaded seats press onto it, which keeps torque manageable on larger, higher-pressure valves. Our oilfield listings use floating balls on 2" valves with 206, 602 and 1502 union ends, ASME Class 150 flanges and Schedule 160 butt-weld ends, and trunnion balls on 2", 3" and 4" 1502 valves, a 3-1/8" API 6A 5M flanged valve and a 4" ASME Class 600 valve to API 6D.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'High-pressure hydraulic ball valves.',
      anchor: 'hydraulic',
    },
    {
      type: 'paragraph',
      html: 'Hydraulic ball valves isolate circuits at system pressure, and they are rated in PN or psi for oil service: on our listings PN315 (4,570 psi), PN350 (5,075 psi) and PN400 (5,800 psi), with 6,000 psi and 10,000 psi versions at some sizes. Ends are BSP parallel threads up to 1-1/2" and SAE flanges at 1-1/2" and 2" — the 2" valve is a 3,000 psi SAE split-flange design in ST52-3 steel. Match the end to the port and the rating to the circuit, and see <a href="/blog/sae-j518-code-61-code-62-flanges">SAE J518 Code 61 and Code 62 flanges</a> for the flange side.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A ball valve is not a throttle.',
      body: 'A ball valve held partly open cuts its seats on the high-velocity flow across them, and once a seat is cut the valve no longer shuts off. Use ball valves fully open or fully closed, and control flow with a valve made for it.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering a ball valve.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'If the job is throttling rather than isolation, a globe valve is the usual choice — ours are ASME raised-face valves from Class 150 to Class 1500. For a ball valve, give the size and end connection, the pressure and the temperature together, the fluid, and for oilfield valves the service (standard or sour) and the standard required — our listings cite API 608 for the 2" Class 150 valve, API 6D for the Class 600 trunnion and butt-weld valves, and API 6A for the 3-1/8" 5M flanged valve. Union-ended valves are rated by figure; see <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does 1000 WOG mean?',
          answer:
            '1,000 psi for water, oil or gas at ambient temperature, non-shock. It is not a rating at elevated temperature.',
        },
        {
          question: 'How many psi is PN400?',
          answer:
            'About 5,800 psi. PN is the nominal pressure in bar, and 1 bar is about 14.5 psi.',
        },
        {
          question: 'What is the difference between a floating and a trunnion ball valve?',
          answer:
            'A floating ball is pushed by line pressure onto its downstream seat. A trunnion ball is held on trunnions with spring-loaded seats, which keeps torque lower in large, high-pressure valves.',
        },
        {
          question: 'What pressure is a Class 600 ball valve?',
          answer:
            '1,480 psi at ambient for a carbon steel body, falling as temperature rises. Our 4" Class 600 trunnion valve is listed at 1,480 psi.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Oilfield ball valves',
      skus: [
        'IH-OFV-BALL-2-1502FM-15K-STD-WOM',
        'IH-OFV-BALL-3-1502FM-15K-STD-ANSON',
        'IH-OFV-BALL-2-1502FM-10K-SOUR-WOM',
        'IH-OFV-BALL-4-600RF-1480-SOUR-CAMERON',
        'IH-OFV-BALL-3-5M-FLG-5K-SOUR-WOM',
        'IH-OFV-BALL-2-150RF-285-STD-INDUS',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Hydraulic and industrial ball valves',
      skus: ['IH-HBV-34', 'IH-HBV-1', 'IH-HBV-112', 'IH-HBV-2', 'IH-IBV-12', 'IH-IBV-2'],
    },
    {
      type: 'category_link',
      slug: 'oilfield-ball-valves',
      label: 'Oilfield ball valves',
      blurb: 'Floating and trunnion, union, API and ASME ends.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-ball-valves',
      label: 'Hydraulic ball valves',
      blurb: 'High-pressure valves with BSP and SAE flange ends.',
    },
    {
      type: 'category_link',
      slug: 'industrial-ball-valves',
      label: 'Industrial ball valves',
      blurb: 'Process valves from 1/4" to 4".',
    },

    {
      type: 'cta_block',
      heading: 'Need a ball valve matched to a rating?',
      body: 'Send the size, ends, pressure and temperature, the fluid and any standard required. We will quote a valve rated for the actual conditions.',
      quoteLabel: 'Quote ball valves',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Rating systems, designs, ends, materials and standards checked against our oilfield, industrial and hydraulic ball valve listings.',
    },
  ],
}

export default ARTICLE
