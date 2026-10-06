import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Pillar for the flow iron shelves — flow line, fittings, adapters, manifolds,
 * API flanges — read from their 84 listings: figure, working pressure,
 * service class, material, temperature, configuration and lengths. Swivel
 * styles are named as the listings name them; the article does not define
 * styles beyond what the listings say.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'flow-iron-explained',
  title: 'Flow iron explained: pup joints, swivels, fittings, adapters and manifolds on a treating line',
  excerpt:
    'The temporary high-pressure line between the pumps and the well is built from a handful of parts joined by hammer unions. What each part does, integral against welded, standard against sour, and what keeps a treating line safe.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T01:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is flow iron?',
      answer:
        'Flow iron — also called treating iron or frac iron — is the temporary high-pressure pipework rigged between pumping equipment and the wellhead for fracturing, cementing, acidizing and well testing. It is built from pup joints, swivel joints, tees, crosses, elbows and adapters joined by hammer unions, and is rated by union figure: 602 at 6,000 psi, 1002 at 10,000 psi and 1502 at 15,000 psi on our standard-service listings, with sour-service versions derated.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A treating line is pup joints, swivels, fittings and adapters joined by hammer unions, rigged up and down for each job.',
        'Rating follows the union figure: 602 at 6,000 psi, 1002 at 10,000 psi, 1502 at 15,000 psi on our standard listings.',
        'Standard-service iron is listed in tempered 4130/4140 for −29 °C to 121 °C; sour-service iron in hardness-controlled 4130, material class EE, for −29 °C to 82 °C.',
        'Integral pup joints are forged in one piece with no welds; our 1502 integral pups run 2 ft to 20 ft.',
        'Every temporary high-pressure line must be restrained. A separating joint at 15,000 psi is lethal.',
      ],
    },
    {
      type: 'lead',
      html: 'A frac or cement job puts thousands of psi through pipework that was laid out on the ground that morning and will be taken apart that evening. That pipework is flow iron, and it is built from a short list of parts that <strong>all join with the same hammer union</strong>, so the whole line can be rearranged to suit each location. The parts are simple; the discipline around them is what keeps people safe.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The parts of a treating line.',
      anchor: 'parts',
    },
    {
      type: 'comparison_table',
      caption: 'Flow iron on our listings',
      columns: ['Part', 'What it does', 'Examples we list'],
      rows: [
        { cells: ['Pup joint', 'Straight length of iron with union ends', '1502 integral, 2 ft to 20 ft; 602 integral, 2 ft to 20 ft; 1002 integral, 2 ft to 15 ft'], highlight: true },
        { cells: ['Swivel joint', 'Lets the line turn and flex between fixed points', '1502 Styles 10, 20, 30, 50 and 100; 602 Style 50; reel swivel Style 40'] },
        { cells: ['Fittings', 'Tees, crosses, wyes and long-radius elbows for direction and branches', '1502 and 602 tees and crosses; 1502 wye laterals; LR 90° elbows'] },
        { cells: ['Spacer spool', 'Short length to close a gap', '602 and 1502, 6 in to 24 in'] },
        { cells: ['Blast joint', 'Heavy-walled pup with a hardfaced bore where erosion is worst', '1502 2", tungsten-carbide bore, 1 ft to 5 ft'] },
        { cells: ['Data header', 'Instrument ports for pressure and temperature', '1502 with three or four ports; 602 with two'] },
        { cells: ['Adapters', 'Change gender, size or end type', 'Crossovers; API flange × 1502 female adapters'] },
        { cells: ['Manifolds', 'Distribute, choke or divert flow', 'Choke, diverter and multi-well manifolds'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Integral against welded.',
      anchor: 'integral',
    },
    {
      type: 'paragraph',
      html: 'An integral pup joint is forged as a single body with the union ends formed on it — our 1502 integral listings describe it as "no welds — forged single-piece body". A welded pup joins union subs to a length of pipe with butt welds; our 206 sour pup joint is built that way, with schedule XH welds. Integral iron removes the weld as a place for a crack to start, which is why it dominates the high-pressure figures, and threaded double-end (DET) designs let a damaged sub be replaced. Lengths on our listings run from 1 ft to 20 ft depending on figure and design.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Swivels, loops and erosion.',
      anchor: 'swivels',
    },
    {
      type: 'paragraph',
      html: 'Pumps vibrate, trucks settle and a wellhead does not sit at the height of the pump discharge, so a rigid line would be loaded at every joint. Swivel joints take that movement: our listings run from single-axis styles to the three-axis Style 50 and the heavy-duty Style 100, plus a Style 40 reel swivel for hose reels. A hose loop does the same job with flexible hose — our 1502 loop is stainless-braid hose with forged union ends, 2" from 6 ft to 20 ft. Wherever the flow changes direction, sand-laden fluid erodes the wall from the inside; long-radius elbows and hardfaced blast joints are there to slow that wear.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Pressure class and sour service.',
      anchor: 'service',
    },
    {
      type: 'paragraph',
      html: 'Every part carries the rating of its union figure, and a line is only as strong as its weakest component. Standard-service iron on our listings is forged 4130/4140 alloy steel, tempered, rated −20 °F to 250 °F (−29 °C to 121 °C). Sour-service iron is hardness-controlled 4130 to NACE MR0175, API 6A material class EE, rated −20 °F to 180 °F (−29 °C to 82 °C), and is often derated: our 1502 sour pup joints, swivels and crosses are 10,000 psi rather than 15,000. The figures themselves are explained in <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Restrain the line. Clear the area.',
      body: 'A treating line that parts under pressure whips with enough force to kill. Restrain the iron along its length and at each end with a restraint system made for treating iron, keep people out of the line of fire during pressure tests and pumping, and never strike or tighten a union under pressure.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Adapters and flanges.',
      anchor: 'adapters',
    },
    {
      type: 'paragraph',
      html: 'Adapters connect iron to everything that is not iron. Crossovers change gender or size within a figure — 1502 male × male, female × female, male × female and reducers such as 4" × 3". Adapter flanges take a 1502 female union onto an API 6BX flange at 10,000 or 15,000 psi, typically where the line meets a wellhead or a frac tree, and a double flange adapter joins an ANSI 2500 ring-joint flange to a 1502 union, rated 6,170 psi. Flanged joints need the right ring: see <a href="/blog/ring-joint-gaskets-r-rx-bx">R, RX and BX ring joint gaskets</a>.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Manifolds.',
      anchor: 'manifolds',
    },
    {
      type: 'paragraph',
      html: 'Manifolds turn a single line into a system. Choke manifolds reduce pressure through a fixed or adjustable bean, in single-stage and dual-stage forms; diverter manifolds split one inlet into two outlets with isolation valves; multi-well manifolds distribute frac fluid to four or eight wells, with plug valves isolating each one; and spring-loaded or pilot-operated relief valves guard pumps and iron against overpressure. These are engineered to the spread rather than bought off the shelf. Choke trims and bean sizes are covered in <a href="/blog/positive-vs-adjustable-chokes">positive and adjustable chokes</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between flow iron and frac iron?',
          answer:
            'They describe the same thing: temporary high-pressure pipework joined by hammer unions. "Frac iron" refers to its use on fracturing jobs, "treating iron" to well treatment generally.',
        },
        {
          question: 'What is an integral pup joint?',
          answer:
            'A pup joint forged as one piece with its union ends, with no welds. Our 1502 integral pups are listed from 2 ft to 20 ft.',
        },
        {
          question: 'Why is sour-service flow iron rated lower?',
          answer:
            'Sour service needs hardness-controlled steel to resist cracking from hydrogen sulphide, which carries a lower rating. Our 1502 sour iron is 10,000 psi against 15,000 psi for standard service.',
        },
        {
          question: 'What does a swivel joint do?',
          answer:
            'It lets the line rotate at the joint, so movement and misalignment between pumps, iron and wellhead do not load the unions.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Flow line',
      skus: [
        'IH-FI-PJ-1502-MF-INT-15K-STD-FMC',
        'IH-FI-PJ-602-MF-INT-6K-STD-FMC',
        'IH-FI-SJ-1502-S50-3AX-15K-STD-FMC',
        'IH-FI-BJ-1502-MF-INT-15K-STD-HALLIBURTON',
        'IH-FI-HL-1502-15K-STD-FMC',
        'IH-FI-DH-1502-15K-STD-CAMERON',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Fittings and adapters',
      skus: [
        'IH-FI-TE-1502-MFF-15K-STD-SPM',
        'IH-FI-CR-1502-MMMF-15K-STD-SPM',
        'IH-FI-EL-1502-90LR-MF-15K-STD-SPM',
        'IH-FI-XO-1502-RED-15K-STD-FMC',
        'IH-FI-AF-15K-1502-CAMERON',
        'IH-FI-PJ-1502-FM-INT-10K-SOUR-ANSON',
      ],
    },
    {
      type: 'category_link',
      slug: 'flow-iron-flow-line',
      label: 'Flow line',
      blurb: 'Pup joints, swivels, spools, blast joints, hose loops and data headers.',
    },
    {
      type: 'category_link',
      slug: 'flow-iron-fittings-suppliers-uae',
      label: 'Flow iron fittings',
      blurb: 'Tees, crosses, wyes, elbows, caps and flange bolting.',
    },
    {
      type: 'category_link',
      slug: 'flow-iron-adapters',
      label: 'Flow iron adapters',
      blurb: 'Crossovers, adapter flanges and double studded adapters.',
    },
    {
      type: 'category_link',
      slug: 'flow-iron-manifolds',
      label: 'Manifolds',
      blurb: 'Choke, diverter and multi-well manifolds.',
    },
    {
      type: 'category_link',
      slug: 'oilfield-restraint-systems',
      label: 'Restraint systems',
      blurb: 'Restraint clamps for treating iron.',
    },

    {
      type: 'cta_block',
      heading: 'Building or replacing a treating line?',
      body: 'Send the figure, the service (standard or sour), the line sizes and the layout or parts list. We will quote the iron, unions, restraints and documents as one package.',
      quoteLabel: 'Quote flow iron',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Figures, pressures, materials, temperature ratings, lengths and configurations checked against our flow iron listings.',
    },
  ],
}

export default ARTICLE
