import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Demco DM mud gate valve parts, from the 17 repair kit listings and the DM
 * family research done for them (seat designs, part number formats, kit
 * numbers, wear ring bores). The 2" gate listing says it fits both families;
 * the 1887 numbers it carries are DM 2000–5000 parts, so it is not embedded
 * here and is flagged for correction.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'mud-gate-valve-repair-kits',
  title: 'Mud gate valve repair kits: telling Demco DM 2000–5000 parts from DM 7500 parts',
  excerpt:
    'Demco DM mud gate valves come in two families that share no seats, gates or kits. How to tell a DM 5000 from a DM 7500 by its seat, its part numbers and its kit number before ordering repair parts.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T01:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Do DM 5000 and DM 7500 gate valves use the same repair kit?',
      answer:
        'No. The DM 2000, 3000 and 5000 psi valves use a one-piece moulded seat assembly and 4-digit part numbers, with kits numbered J025216. The DM 7500 uses a ring-type seat insert that locks into separate body wear rings, 7-digit part numbers, and kits numbered J025177. Seats, gates and kits do not cross between the two families, so identify the family from the stamped part number or the seat design before ordering.',
    },
    {
      type: 'key_takeaways',
      items: [
        'DM 2000/3000/5000: one-piece seat assembly — an elastomer cylinder with two locating pins, a gate slot and moulded-in wear inserts.',
        'DM 7500: a seat insert of 410 stainless rings in elastomer, locking into two separate body wear rings.',
        'DM 2000–5000 parts carry 4-digit numbers such as 1876, 1887 and 2207; DM 7500 parts 7-digit numbers such as 2171267-01.',
        'DM 2000–5000 kits are J025216; DM 7500 kits are J025177-00X74 (minor) and -10X74 (major), where X is the size.',
        'The stamp beats the description. A gate stamped 1887-002 is a 2" DM 2000–5000 gate whatever a listing calls it.',
      ],
    },
    {
      type: 'lead',
      html: 'DM mud gate valves sit on the mud manifolds and standpipes of a great many rigs, and their seats and gates wear on a predictable cycle. The trap when ordering spares is that the line comes in <strong>two families that look alike from outside</strong> and share no wear parts. Order a kit for the wrong family and it will not go into the valve.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two families.',
      anchor: 'families',
    },
    {
      type: 'comparison_table',
      caption: 'Demco DM 2000–5000 against DM 7500',
      columns: ['Feature', 'DM 2000 / 3000 / 5000', 'DM 7500'],
      rows: [
        { cells: ['Seat', 'One-piece seat assembly: elastomer cylinder, two locating pins, gate slot, moulded-in metal wear inserts', 'Seat insert of 410 stainless rings in elastomer, locking into two separate AISI 4142 body wear rings'], highlight: true },
        { cells: ['Gate', 'Nickel-plated steel as standard; 316 stainless option', 'Alloy steel, usually a black finish'] },
        { cells: ['Part numbers', '4-digit Demco numbers, e.g. 1876, 1887, 1931, 2207', '7-digit numbers, e.g. 2171267-01, 2139742-01'] },
        { cells: ['Repair kits', 'J025216 series', 'J025177-00X74 minor, -10X74 major'] },
        { cells: ['Elastomers on our listings', 'Buna-N standard, Viton', 'Buna-N standard, HNBR, Viton'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Telling them apart.',
      anchor: 'identify',
    },
    {
      type: 'paragraph',
      html: 'The quickest test is the seat. A DM 2000–5000 seat is a single moulded piece with two pins and a slot for the gate; a DM 7500 seat is a ring insert that sits inside a separate steel wear ring in the body. The next test is the number stamped on the part: four digits and a dash suffix (1887-002, 2207-021) is the 2000–5000 family, while seven digits and a -01 suffix (2171112-01) is the 7500 family. Cameron numbering adds a J00 prefix to the four-digit parts, so J002207-021 and 2207-021 are the same seat.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Part numbers by size.',
      anchor: 'part-numbers',
    },
    {
      type: 'paragraph',
      html: 'For the DM 2000–5000 family, the 2" seat assembly is the 1876 series in ductile iron, steel or 316 stainless with Buna-N or Viton, the 2" gate is 1887-002 (nickel-plated) or 1887-008 (316 stainless), the stem 1931-002 or -008, and the stem seal assembly 1949-001 or -006; the 4" full-port steel and Buna-N seat is 2207-021. For the DM 7500, the gates are 2171112-01 (3"), 2171267-01 (4") and 2171108-01 (5"), and the seat inserts include 2139742-01 (2") and 2139746-01 (4"). The DM 7500 wear ring sets the minimum bore: 1.97 in, 2.98 in, 3.97 in and 5.17 in for 2", 3", 4" and 5".',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Reading a kit number.',
      anchor: 'kits',
    },
    {
      type: 'paragraph',
      html: 'DM 7500 kits follow a pattern that encodes the size: J025177-00X74 is a minor kit and J025177-10X74 a major kit, with X the size in inches. So J025177-00274 is the 2" minor kit, J025177-00474 the 4" minor and J025177-10474 the 4" major. DM 2000–5000 kits are in the J025216 series — J025216-13221 is listed as a 4" major kit — but the size code in that series is not consistent between sources, so confirm the valve size and series rather than decoding the number.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The stamp beats the listing.',
      body: 'Surplus and marketplace listings regularly mislabel DM parts: we have seen a gate sold as 3" that was stamped 1887-002, a 2" DM 2000–5000 gate. Identify parts by the stamped number and the seat design, and send a photograph of both with the enquiry.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering repair parts.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Send the valve size, the pressure series (2000, 3000, 5000 or 7500 psi), any number stamped on the body, gate or seat, and the elastomer the service needs. Each of our listings states the makes we can supply for that part — Demco and unbranded aftermarket on most — so say which you require. Complete mud gate valves are listed at 7,500 psi from 1-13/16" to 5" with butt-weld, flanged or union ends; the wider gate valve markings are covered in <a href="/blog/api-6a-nameplate-markings">reading an API 6A nameplate</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between a DM 5000 and a DM 7500 seat?',
          answer:
            'The DM 5000 seat is a one-piece moulded assembly with two locating pins and a gate slot. The DM 7500 uses a ring-type insert of 410 stainless rings in elastomer that locks into separate body wear rings.',
        },
        {
          question: 'What is kit J025177-00474?',
          answer:
            'The 4" minor repair kit for the DM 7500 mud gate valve. J025177-10474 is the 4" major kit.',
        },
        {
          question: 'Is 2207-021 the same part as J002207-021?',
          answer:
            'Yes — the J00 prefix is Cameron numbering for the same 4" full-port steel and Buna-N seat for the DM 2000–5000 family.',
        },
        {
          question: 'Which gate fits a 4" DM 7500?',
          answer:
            '2171267-01. The DM 2000–5000 gates in the 1887 series do not fit a DM 7500.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'DM repair kits and parts',
      skus: [
        'IH-GVRK-DM7K5-KIT-2',
        'IH-GVRK-DM7K5-KIT-3',
        'IH-GVRK-DM-KIT-4',
        'IH-GVRK-DM5K-SEAT-2',
        'IH-GVRK-DM5K-SEAT-4',
        'IH-GVRK-DM7K5-SEAT-2',
        'IH-GVRK-DM7K5-GATE-4',
        'IH-GVRK-DM-STEM-PACKING',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Mud gate valves, 7,500 psi',
      skus: ['IH-OFV-GATE-2916-7K5', 'IH-OFV-GATE-3-7K5', 'IH-OFV-GATE-4-7K5', 'IH-OFV-GATE-5-7K5'],
    },
    {
      type: 'category_link',
      slug: 'gate-valve-repair-kits',
      label: 'Gate valve repair kits and parts',
      blurb: 'DM 2000–5000 and DM 7500 kits, seats, gates, stems and packing.',
    },
    {
      type: 'category_link',
      slug: 'oilfield-gate-valves',
      label: 'Oilfield gate valves',
      blurb: 'Mud gate valves and API 6A gate valves.',
    },

    {
      type: 'cta_block',
      heading: 'Rebuilding mud gate valves?',
      body: 'Send the valve size and series and a photograph of the stamped gate or seat. We will confirm the family and quote the kits and parts.',
      quoteLabel: 'Quote DM repair kits',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Seat designs, part numbers, kit numbers and wear ring bores checked against our gate valve repair kit listings and the DM family records behind them.',
    },
  ],
}

export default ARTICLE
