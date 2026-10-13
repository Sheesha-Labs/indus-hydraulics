import type { BlogArticleSeed } from '../shared'

/**
 * Fire hose requirements under the UAE Fire and Life Safety Code, with Saudi SBC 801 and Qatar
 * QCDD for comparison. Checked 2026-10-13: UAE code text read from the 2017 edition (the 2018
 * edition and its Abu Dhabi amendments are in force — clause numbers are therefore NOT quoted);
 * SBC 801-CR-18 §905; QCDD-FPD/PROD Rev. 13 (Aug 2024). Not legal advice; no approval claimed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fire-hose-requirements-uae-civil-defence',
  title: 'Fire hose requirements in the UAE: what the Civil Defence code asks for hose reels, racks and risers',
  excerpt:
    'In the UAE, fire hose is not chosen from a catalogue alone: the Fire and Life Safety Code sets hose types, sizes and lengths for reels, racks and landing valves, and requires equipment to be listed, approved and registered by Civil Defence. A plain guide to what the code asks for, how Saudi Arabia and Qatar compare, and what to send a supplier.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'UAE Fire Hose Requirements: Civil Defence Code Explained',
  seoDescription:
    'What the UAE Fire and Life Safety Code requires for fire hose reels, hose racks, landing valves and riser hose — sizes, lengths, cabinet spacing and Civil Defence approval — with Saudi SBC 801 and Qatar QCDD compared.',
  focusKeyword: 'uae civil defence fire hose requirements',
  publishedAt: '2026-10-13T17:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The UAE Fire and Life Safety Code (2018 edition, with later Abu Dhabi amendments) governs fire hose in buildings.',
        'Equipment must be listed, approved and registered by Civil Defence, and installed by Civil Defence-approved contractors.',
        'The code describes hose reels with 25 mm × 30 m reinforced rubber hose, hose racks with 40 mm × 30 m lay flat hose, and 65 mm landing valves for the fire service.',
        'Class I standpipe and dry-riser hose is double-jacket, synthetic-fibre reinforced.',
        'Saudi Arabia follows SBC 801 and NFPA 14; Qatar requires products listed or approved by bodies QCDD recognises.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask for “a fire hose” in Dubai or Abu Dhabi and the right answer starts with questions: for a hose reel or a hose rack, for occupants or for Civil Defence, and listed by whom? The UAE Fire and Life Safety Code of Practice answers most of them. This guide summarises what it says about hose, based on the published text as we read it in October 2026. The code is amended from time to time and the authority’s reading is the one that counts, so confirm with your fire consultant or approved contractor before ordering.',
    },

    { type: 'section_head', number: '/01', title: 'The code and who enforces it.', anchor: 'code' },
    {
      type: 'paragraph',
      html: 'The <strong>UAE Fire and Life Safety Code of Practice</strong> is issued by UAE Civil Defence. The current edition took effect in September 2018, and Abu Dhabi Civil Defence has since issued amendments to it. Its fire protection systems chapter covers standpipes, hose reels, hose cabinets and landing valves. Two principles run through it: equipment must be <strong>listed, approved and registered by Civil Defence</strong>, and installation is carried out by <strong>Civil Defence-approved fire protection contractors</strong>. A hose that meets a foreign standard but is not registered for the UAE market will not pass inspection.',
    },
    {
      type: 'direct_answer',
      question: 'Does fire hose need Civil Defence approval in the UAE?',
      answer:
        'Yes. The UAE Fire and Life Safety Code requires fire protection equipment, including fire hose, to be listed, approved and registered by Civil Defence, and installed by Civil Defence-approved contractors. Confirm the product’s registration with the supplier before ordering.',
    },

    { type: 'section_head', number: '/02', title: 'What the code asks for.', anchor: 'requirements' },
    {
      type: 'comparison_table',
      caption: 'Fire hose equipment described in the UAE Fire and Life Safety Code (as published; confirm against the current edition)',
      columns: ['Equipment', 'Hose', 'Who uses it', 'Notes'],
      rows: [
        { cells: ['Hose reel', '25 mm × 30 m reinforced rubber hose on a rotating drum', 'Occupants (Class II)', 'Semi-rigid hose that can be used without unrolling fully'] },
        { cells: ['Hose rack', '40 mm × 30 m fire hose, folded vertically', 'Occupants (Class II)', 'Lay flat hose in the cabinet'], highlight: true },
        { cells: ['Landing valve', '65 mm instantaneous outlet; 65 mm × 30 m hose on dry risers', 'Civil Defence and trained firefighters (Class I)', 'Near the stair; mounted 900–1200 mm above floor'] },
        { cells: ['Class III', 'Both of the above', 'Both', 'Combined occupant and fire service system'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The code also sets coverage and placement: every part of a floor should be within 30 m of a fire hose cabinet, and cabinets sit within a short distance of the exit stair door. Cabinets carry signage in Arabic and English. Class I and dry-riser hose is <strong>double-jacket, synthetic-fibre reinforced</strong> — see <a href="/blog/single-vs-double-jacket-fire-hose">single vs double jacket fire hose</a> — and hose is specified at 30 m lengths.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Reel hose is not lay flat.',
      body: 'Hose reels use semi-rigid reinforced rubber hose that stays round on the drum. Hose racks, landing valve hose and dry-riser hose are lay flat. We supply lay flat rack, cabinet and riser hose and couplings; tell us if you also need reel hose.',
    },

    { type: 'section_head', number: '/03', title: 'Saudi Arabia and Qatar compared.', anchor: 'gcc' },
    {
      type: 'paragraph',
      html: '<strong>Saudi Arabia</strong> regulates fire protection through the Saudi Building Code, SBC 801. Its standpipe section requires installation to <strong>NFPA 14</strong>, Class III standpipes in taller and deeper buildings, and — for Class II systems — every part of the building within 9 m of a nozzle on 30 m of hose; 25 mm hose is permitted in light-hazard occupancies if it is listed and approved. Hose cabinets must not be blocked or obscured and must be signed. Product conformity falls under SASO’s technical regulation for fire control materials and equipment.',
    },
    {
      type: 'paragraph',
      html: '<strong>Qatar</strong> Civil Defence (QCDD) requires regulated fire safety products to be listed, labelled or approved to international or local standards by certification bodies it recognises — the published list includes scopes for fire hose, non-percolating lay flat hose, lay flat hose systems, hose reels and landing valves — and treats certificates as valid only if the product is designed, installed, tested and maintained to accepted standards.',
    },

    { type: 'section_head', number: '/04', title: 'What to send a supplier.', anchor: 'ordering' },
    {
      type: 'prose',
      html: '<ol><li><strong>The equipment</strong> — hose rack, landing valve or dry riser — and the class of system.</li><li><strong>Bore and length</strong>: 40 mm or 65 mm, usually 30 m.</li><li><strong>Jacket and liner</strong>: single or double jacket; see <a href="/blog/fire-hose-liner-materials">fire hose liner materials</a>.</li><li><strong>Couplings</strong> to match the landing valves and branch pipes on site.</li><li><strong>The approval required</strong>: UAE Civil Defence registration, QCDD-accepted certification, or the listing your consultant specifies.</li><li><strong>The emirate or country</strong>, because amendments and authorities differ.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size fire hose is used in UAE hose cabinets?', answer: 'The code describes 40 mm × 30 m lay flat hose on hose racks and 25 mm × 30 m reinforced rubber hose on hose reels, with 65 mm outlets and hose for the fire service.' },
        { question: 'How long is a fire hose in a UAE building?', answer: '30 m for reel, rack and landing valve hose, as described in the code.' },
        { question: 'Who can install fire hose cabinets in the UAE?', answer: 'Civil Defence-approved fire protection contractors.' },
        { question: 'Which standard does Saudi Arabia use for standpipes?', answer: 'SBC 801 requires standpipes to be installed to NFPA 14, with its own requirements for classes, coverage and cabinets.' },
        { question: 'Are your fire hoses Civil Defence approved?', answer: 'No approval is published for these lines. Tell us the approval you need and we will confirm what can be supplied against it before quoting.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lay flat fire hose and couplings',
      skus: ['IH-LF-FRU', 'IH-LF-FDN', 'IH-LF-FDE', 'IH-LF-FSU', 'IH-LF-FSN', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'jacketed-fire-hoses',
      label: 'Jacketed fire hoses',
      blurb: 'Rack, cabinet, single and double jacket fire hose.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Fire hose supply to Saudi Arabia',
      blurb: 'Fire hose and couplings for SBC 801 projects.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'qatar',
      label: 'Fire hose supply to Qatar',
      blurb: 'Fire hose for Qatar projects, quoted against QCDD-accepted certification.',
    },
    {
      type: 'related_articles',
      slugs: ['single-vs-double-jacket-fire-hose', 'fire-hose-cabinet-maintenance', 'fire-hose-liner-materials', 'lay-flat-hose-couplings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'UAE Fire and Life Safety Code as published text read in October 2026; SBC 801 standpipe section; QCDD approved certification bodies list (Aug 2024). Not legal advice — confirm with Civil Defence or your consultant.',
    },
    {
      type: 'cta_block',
      heading: 'Fitting out fire hose cabinets?',
      body: 'Send the cabinet schedule, hose bore and length, couplings and the approval required. We will confirm what can be supplied against it before quoting.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
