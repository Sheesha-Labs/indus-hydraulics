import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Wellhead stack and surface test trees, read from the 15 wellhead and 7 STT
 * listings: component type, pressure class, bore, valve count, actuation,
 * material class, PSL and PR. Some wellhead listings gave 6BX flange and ring
 * designations that did not match API 6A at those sizes, so the article quotes
 * none of them; corrected by 2026-10-06-listing-data-fixes, which also moved
 * the 5K tree to its 6B slug.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'wellhead-components-explained',
  title: 'Wellhead components explained: casing head to christmas tree, and the surface test tree',
  excerpt:
    'A wellhead is a stack of pressure-containing parts, each holding a string of pipe and sealing an annulus. What each component does from the casing head up, how the christmas tree is arranged, and where a surface test tree fits.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T01:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main components of a wellhead?',
      answer:
        'From the bottom up: the casing head, fixed to the surface casing, which carries the next casing string on a casing hanger; one or more casing spools for each further string; the tubing head, which holds the tubing hanger; a tubing head adapter; and the christmas tree of valves that controls flow from the well, topped by a tree cap. Each part seals the annulus around the string it carries and is rated to API 6A.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Casing head → casing spool(s) → tubing head → tubing head adapter → christmas tree → tree cap.',
        'Hangers carry the strings: slip-type casing hangers grip the casing; mandrel tubing hangers thread onto the tubing.',
        'A conventional tree has five valves: two master valves, a swab valve and two wing valves.',
        'A frac tree has a larger bore for stimulation — our 15,000 psi frac tree is 7-1/16".',
        'A surface test tree is a temporary flowhead for testing, coiled tubing, snubbing and frac work, with hydraulically actuated gate valves.',
      ],
    },
    {
      type: 'lead',
      html: 'Every string of casing run into a well has to be hung off at the surface and sealed, and the final string of tubing has to be held and controlled. The wellhead is the stack of forged bodies that does that, <strong>one component per string</strong>, with the christmas tree on top controlling what comes out. Read from the bottom up, the stack follows the order in which the well was drilled and completed.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The stack, from the bottom up.',
      anchor: 'stack',
    },
    {
      type: 'comparison_table',
      caption: 'Wellhead components on our listings',
      columns: ['Component', 'What it does', 'On our listings'],
      rows: [
        { cells: ['Casing head', 'Lowest body, on the surface casing; holds the next casing hanger', '3,000 psi multi-bowl'] },
        { cells: ['Casing spool', 'Holds each further casing string and seals its annulus', '5,000 and 10,000 psi'] },
        { cells: ['Tubing head', 'Holds the tubing hanger and seals the tubing annulus', '5,000, 10,000 and 15,000 psi; 10,000 psi sour'], highlight: true },
        { cells: ['Tubing head adapter', 'Joins the tubing head to the tree', '5,000 psi bottom × 10,000 psi top'] },
        { cells: ['Christmas tree', 'Valves that control flow from the well', '5,000 and 10,000 psi; 10,000 psi sour'] },
        { cells: ['Frac tree', 'Large-bore tree for stimulation', '7-1/16" at 15,000 psi'] },
        { cells: ['Hangers', 'Carry casing and tubing strings', 'Slip-type casing hanger, 11" × 7"; mandrel tubing hanger, 10,000 psi'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Hangers and annulus seals.',
      anchor: 'hangers',
    },
    {
      type: 'paragraph',
      html: 'A hanger transfers the weight of a string into the wellhead body and seals the annulus around it. A slip-type casing hanger grips the casing with toothed slips and packs off the annulus — ours is listed for 7" casing in an 11" casing-head bowl, with hardened slip teeth. A mandrel hanger is threaded onto the string and landed in the bowl, which gives a positive seal and a defined bore; our mandrel tubing hanger is rated 10,000 psi. Outlets on the heads and spools give access to each annulus for monitoring and pumping.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The christmas tree.',
      anchor: 'tree',
    },
    {
      type: 'paragraph',
      html: 'Our conventional trees are five-valve assemblies: two master valves on the vertical bore, a swab valve above them for access to the well, and two wing valves on the side outlets leading to the flowline and choke. The trees are listed in 2-9/16" at 5,000 psi and 3-1/16" at 10,000 psi, with a 10,000 psi sour tree in material class EE. The frac tree is a different animal: a 7-1/16" bore at 15,000 psi, PSL 3 and PR2, sized for the rates and pressures of a fracturing job rather than for production.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Surface test trees.',
      anchor: 'stt',
    },
    {
      type: 'paragraph',
      html: 'A surface test tree, or flowhead, is a temporary tree used during well testing and intervention. Our listings cover five configurations: conventional frac trees with two master, one swab and two wing valves at 10,000 psi sour and 15,000 psi; a wellhead-mounted tree at 15,000 psi; a coiled-tubing tree with a pack-off and an integral shear/seal BOP; a snubbing tree with ram-type strippers; and a 7-1/16" subsea tree with retainer valves, listed to API 17D. The surface trees have a 5-1/8" vertical bore and hydraulic gate valves on a 3,000 psi pilot; on the frac and wellhead-mounted trees the swab valve is manual.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Ratings are per component, and the lowest one governs.',
      body: 'A tree rated 10,000 psi on a 5,000 psi tubing head is a 5,000 psi wellhead below the adapter. Check the rated working pressure, material class and temperature class of every body, flange and valve in the stack, and match replacements to all three.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Classes and documents.',
      anchor: 'classes',
    },
    {
      type: 'paragraph',
      html: 'Wellhead equipment carries the same API 6A markings as valves: our listings are temperature class P, material class AA for standard service and EE for sour, PSL 2 or PSL 3, and PR1 or PR2. What those codes mean is in <a href="/blog/api-6a-nameplate-markings">reading an API 6A nameplate</a>. Flanged connections between components each need the correct ring and bolting — see <a href="/blog/ring-joint-gaskets-r-rx-bx">ring joint gaskets</a> — and every component should travel with its material and test certificates.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between a casing head and a tubing head?',
          answer:
            'The casing head is the lowest part of the wellhead, on the surface casing, and holds the next casing string. The tubing head sits higher in the stack and holds the tubing hanger that carries the production tubing.',
        },
        {
          question: 'How many valves are on a christmas tree?',
          answer:
            'Our conventional trees have five: two master valves, one swab valve and two wing valves.',
        },
        {
          question: 'What is a surface test tree used for?',
          answer:
            'Temporary well control during testing and intervention — frac, coiled tubing, snubbing and well testing — as a flowhead with hydraulically actuated valves.',
        },
        {
          question: 'What is a tubing head adapter?',
          answer:
            'The piece that joins the tubing head to the christmas tree. Ours adapts a 5,000 psi tubing head flange to a 10,000 psi tree connection.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Wellhead equipment',
      skus: [
        'IH-WH-CH-API-3K-STREAMFLO',
        'IH-WH-CS-API-10K-FMC',
        'IH-WH-TH-API-10K-FMC',
        'IH-WH-THA-API-5K-10K-STREAMFLO',
        'IH-WH-XT-API-10K-FMC',
        'IH-WH-XT-FT-API-15K-FMC',
        'IH-WH-SCH-API-5K-CAMERON',
        'IH-WH-MTH-API-10K-FMC',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Surface test trees',
      skus: [
        'IH-STT-FRAC-1502-15K-STD-FMC',
        'IH-STT-WHSTT-1502-15K-STD-INDUS',
        'IH-STT-CT-1502-15K-STD-HALLIBURTON',
        'IH-STT-SNUB-1502-10K-STD-FMC',
        'IH-STT-FRAC-1502-10K-SOUR-HALLIBURTON',
      ],
    },
    {
      type: 'category_link',
      slug: 'wellhead',
      label: 'Wellhead equipment',
      blurb: 'Casing heads and spools, tubing heads, hangers and trees.',
    },
    {
      type: 'category_link',
      slug: 'surface-test-trees',
      label: 'Surface test trees',
      blurb: 'Frac, wellhead-mounted, coiled-tubing, snubbing and subsea trees.',
    },

    {
      type: 'cta_block',
      heading: 'Sourcing wellhead equipment?',
      body: 'Send the component, size, pressure class, material and temperature class, PSL, PR and end connections, or the existing nameplate. We will quote with documentation.',
      quoteLabel: 'Quote wellhead equipment',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Component types, pressures, bores, valve counts, actuation and classes checked against our wellhead and surface test tree listings.',
    },
  ],
}

export default ARTICLE
