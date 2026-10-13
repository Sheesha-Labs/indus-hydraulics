import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Fire hose standards compared. Checked 2026-10-13 from standards-body listings: EN 14540:2014,
 * EN 671-1/-2:2012, EN 694:2014 (SIS), BS 6391:2009 scope (SFS/BSI), DIN 14811:2008 + A1/A2
 * (DIN Media), DIN 14333:2023 Storz PN 16, NFPA 1961 → NFPA 1960 (2024), NFPA 1962 service tests.
 * NOT stated (paywalled/unverified): DIN 14811 class definitions and pressures, BS 6391 official
 * Type wording (given as commonly described), exact marking lists.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fire-hose-standards-en-14540-bs-6391-nfpa',
  title: 'Fire hose standards compared: EN 14540, EN 671, BS 6391, DIN 14811 and NFPA',
  excerpt:
    'A fire hose tender can ask for EN 14540, BS 6391, DIN 14811, EN 694 or NFPA 1961 — and they are not interchangeable. Each covers a different kind of hose for a different user. A plain map of the European, British, German and American standards for lay flat and reel hose, what each one covers, and how to specify against them.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Fire Hose Standards: EN 14540, BS 6391, DIN 14811, NFPA',
  seoDescription:
    'Which fire hose standard applies: EN 14540 and EN 671-2 for building hose systems, EN 694 and EN 671-1 for hose reels, BS 6391 and DIN 14811 for fire service lay flat hose, NFPA 1961/1960 and 1962 — scopes, pressures and how to specify.',
  focusKeyword: 'fire hose standards',
  publishedAt: '2026-10-13T21:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Building hose (for occupants) and fire service hose (for firefighters) have different standards.',
        'EN 14540 covers lay flat hose for fixed building systems (25–52 mm, up to 15 bar); EN 671-2 covers the hose system it goes in.',
        'EN 694 covers semi-rigid hose for hose reels; EN 671-1 covers the reels.',
        'BS 6391 (UK) and DIN 14811 (Germany) cover fire service lay flat delivery hose; there is no published European EN for it.',
        'NFPA 1961 (now part of NFPA 1960) classifies hose by use; NFPA 1962 sets in-service testing.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask three fire engineers for “standard fire hose” and you may get three different standards. A hose rack in an office corridor, a hose reel in a shopping centre, an attack line on a German appliance and a supply line on an American engine are all fire hose — and each is specified to a different document. Getting the standard right is the first line of any fire hose specification, because it decides construction, size, pressure, test and marking.',
    },

    { type: 'section_head', number: '/01', title: 'The map.', anchor: 'map' },
    {
      type: 'comparison_table',
      caption: 'Fire hose standards at a glance (scopes as published by the standards bodies)',
      columns: ['Standard', 'Covers', 'Key limits', 'Used for'],
      rows: [
        { cells: ['EN 14540:2014', 'Non-percolating lay flat hose for fixed systems', '25–52 mm bore, up to 15 bar, −20 to +60 °C', 'Hose in EN 671-2 wall hose systems'], highlight: true },
        { cells: ['EN 671-2:2012', 'Hose systems with lay flat hose in buildings', 'Permanently connected, for occupants', 'Hose cabinets and racks'] },
        { cells: ['EN 694:2014', 'Semi-rigid hose for fixed systems', '19 and 25 mm up to 12 bar; 33 mm up to 7 bar', 'Hose reel hose'] },
        { cells: ['EN 671-1:2012', 'Hose reels with semi-rigid hose in buildings', 'Manual and automatic reels', 'Hose reels'] },
        { cells: ['BS 6391:2009', 'Non-percolating lay flat delivery hose and assemblies', 'Up to 15 bar (normally ≤ 10 bar), to −20 °C, Types 1, 2 and 3', 'UK fire and rescue and industrial hose, BS 336 couplings'] },
        { cells: ['DIN 14811:2008', 'Lay flat delivery hose for pumps and fire vehicles', 'Three classes, 14 sizes, to −25 °C', 'German fire service (C 42, C 52, B, A sizes)'] },
        { cells: ['NFPA 1961 → NFPA 1960 (2024)', 'Fire hose by use: attack, occupant-use, forestry, supply', 'Marked service test pressure; proof test twice that', 'North American and many international specs'] },
        { cells: ['NFPA 1962', 'Care, use, inspection and service testing of hose', 'Service test ≥ 300 psi attack/forestry, 200 psi supply', 'In-service testing'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between EN 14540 and BS 6391?',
      answer:
        'EN 14540 covers lay flat hose for fixed building hose systems used by occupants (25–52 mm, up to 15 bar), the hose in an EN 671-2 cabinet. BS 6391 covers lay flat delivery hose for firefighting — the hose used by fire and rescue services and industrial fire teams — in Types 1, 2 and 3, up to 15 bar.',
    },

    { type: 'section_head', number: '/02', title: 'Building hose: EN 671 and its hoses.', anchor: 'building' },
    {
      type: 'paragraph',
      html: 'In buildings, Europe separates <strong>hose reels</strong> from <strong>hose systems</strong>. A hose reel (EN 671-1) carries semi-rigid hose to EN 694 that stays round on the drum and can be used without unrolling fully — the easiest equipment for an untrained occupant. A hose system (EN 671-2) carries lay flat hose to EN 14540, folded or rolled in a cabinet, which delivers more water but must be fully run out before use. Both are permanently connected to the water supply. Our <a href="/p/rack-and-cabinet-fire-hose">rack and cabinet fire hose</a> is lay flat for this kind of service; tell us the standard and approval your installation requires.',
    },

    { type: 'section_head', number: '/03', title: 'Fire service hose: BS 6391 and DIN 14811.', anchor: 'fire-service' },
    {
      type: 'paragraph',
      html: 'There is no published European standard for fire service delivery hose. A draft (prEN 1924) failed its formal vote at CEN in 2004 and the project was cancelled; Germany revised its national standard and published it as <strong>DIN 14811</strong>, which divides hose into three classes by construction, covers 14 inside diameters including the familiar C 42, C 52, B and A sizes, and rates hose for use down to −25 °C. German hose is joined with Storz couplings, now standardised in DIN 14333 (PN 16). In the UK, <strong>BS 6391</strong> covers non-percolating lay flat delivery hose in Types 1, 2 and 3 for working pressures up to 15 bar — normally no more than 10 bar — with BS 336 instantaneous couplings. Types are commonly described as uncoated (Type 1), externally coated against absorption (Type 2) and with an elastomeric cover (Type 3), the last being the usual choice for fire and rescue services.',
    },
    {
      type: 'figure',
      imageId: FIG['fig-storz-sizes'],
      captionPrefix: 'FIG. 01',
      caption: 'Storz couplings in several sizes: in German practice the hose standard and the coupling standard are specified together.',
      aspectRatio: '16/9',
    },

    { type: 'section_head', number: '/04', title: 'NFPA: classified by use.', anchor: 'nfpa' },
    {
      type: 'paragraph',
      html: 'In North America, and in many Gulf specifications, hose is classified by who uses it and how. NFPA 1961 — consolidated in 2024 into NFPA 1960 — covers attack hose for trained firefighters, occupant-use hose on standpipes, forestry hose for wildland fire and large-diameter supply hose. Each hose is marked with its service test pressure, and the factory proof test is twice that figure. NFPA 1962 sets the in-service regime: service tests of at least 300 psi for attack and forestry hose and 200 psi for supply hose, or the marked pressure; never the proof pressure in the field. Our guide to <a href="/blog/fire-hose-cabinet-maintenance">fire hose cabinet maintenance</a> covers the intervals.',
    },

    { type: 'section_head', number: '/05', title: 'Specifying against a standard.', anchor: 'specifying' },
    {
      type: 'prose',
      html: '<ol><li><strong>Name the standard and its edition</strong> — and the type or class within it.</li><li><strong>Give the bore and length</strong> in the standard’s own terms (C 52, 45 mm, 1-3/4").</li><li><strong>Name the couplings</strong> — Storz, BS 336 instantaneous, NST or other — and who fits them.</li><li><strong>State the approval or certification</strong> required: third-party certification, a civil defence listing, a fire service framework.</li><li><strong>Ask for the marking</strong> each standard requires on the hose, and for the test certificates.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Construction is not certification.',
      body: 'A hose built like a BS 6391 Type 3 or a DIN 14811 hose is not certified to it unless it has been tested and marked. No approval is published for our lines; tell us the standard and certification you need and we will confirm what can be supplied against it.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is there a European standard for fire service hose?', answer: 'No published EN. The draft prEN 1924 was cancelled in 2004; Germany published DIN 14811 and the UK uses BS 6391.' },
        { question: 'What pressure is EN 14540 hose rated for?', answer: 'Up to 15 bar maximum working pressure, in bores from 25 to 52 mm, for use from −20 to +60 °C.' },
        { question: 'What is the difference between EN 671-1 and EN 671-2?', answer: 'EN 671-1 covers hose reels with semi-rigid hose; EN 671-2 covers hose systems with lay flat hose. Both are for occupants in buildings.' },
        { question: 'What does a BS 6391 Type 3 hose mean?', answer: 'Type 3 is commonly described as a lay flat hose with an elastomeric external cover, the type most used by UK fire and rescue services. Check the standard for the formal definition.' },
        { question: 'Has NFPA 1961 been replaced?', answer: 'It was consolidated with other hose and equipment standards into NFPA 1960 in 2024.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Fire hose and couplings',
      skus: ['IH-LF-FRU', 'IH-LF-FDE', 'IH-LF-FDN', 'IH-LF-FSU', 'IH-LF-FSN', 'IH-LF-FFE', 'IH-LF-FFN', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'jacketed-fire-hoses',
      label: 'Jacketed fire hoses',
      blurb: 'Single and double jacket, cabinet and forestry fire hose.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Fire hose supply to the UK',
      blurb: 'Fire hose quoted against BS 6391 and EN 14540 requirements.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'germany',
      label: 'Fire hose supply to Germany',
      blurb: 'Fire hose and Storz couplings for German users.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Fire hose supply to Saudi Arabia',
      blurb: 'Fire hose quoted against NFPA-based Saudi requirements.',
    },
    {
      type: 'related_articles',
      slugs: ['single-vs-double-jacket-fire-hose', 'fire-hose-liner-materials', 'fire-hose-requirements-uae-civil-defence', 'fire-hose-cabinet-maintenance'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Scopes from SIS, BSI/SFS and DIN Media listings and NFPA documents as available on 13 October 2026. Class pressures and marking lists are in the paid standards.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying fire hose to a standard?',
      body: 'Send the standard, type or class, bore, length, couplings and certification required. We will confirm what can be supplied against it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
