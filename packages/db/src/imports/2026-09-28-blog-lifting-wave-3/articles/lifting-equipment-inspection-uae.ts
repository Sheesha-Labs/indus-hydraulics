import type { BlogArticleSeed } from '../shared'

/**
 * Lifting equipment inspection in the UAE — what the rules actually say.
 *
 * Every regulatory statement was read in the primary document on 2026-09-28:
 *   - ADOSH-SF (formerly OSHAD-SF) CoP 34.0, v4.1, 16 Feb 2026, ADPHC.
 *   - ADS 22/2018, Abu Dhabi Quality & Conformity Council.
 *   - Dubai Municipality DM-HSD-GU48-ECLA2, V5.0, 29 Jan 2025.
 *   - EIAC-RQ-IB-002, Issue 1 Rev 04, 4 Oct 2024.
 *   - PCFC-TRK-EHS-IO-CP-06, Rev 02, Sept 2022 (Trakhees pre-qualification).
 *   - Ministerial Resolution 32 of 1982, Art. 20 (unofficial English, ILO NATLEX).
 *
 * Deliberately left out because they could not be verified: the current
 * Trakhees lifting protocol (IO-11.0) and its colour codes; any DEWA, RTA or
 * Civil Defence lifting rule; ADNOC's lifting standard number; whether MR
 * 32/1982 Art. 20 is still formally in force (hence "long-standing"); any
 * current approved-inspector lists; quarterly colour coding as a UAE norm.
 *
 * Dubai: GU48 says 12 months for all lifting equipment and gear; EIAC's Dubai
 * annex for inspection bodies says 6 months for accessories. The copy states
 * both and does not claim DM itself mandates 6 months.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-equipment-inspection-uae',
  title: 'Lifting equipment inspection in the UAE: what Abu Dhabi and Dubai require',
  excerpt:
    'In Abu Dhabi, lifting accessories must be thoroughly examined by an approved third party at least every six months and lifting equipment every twelve — it is written into the emirate’s code of practice. Dubai requires annual certification by an EIAC-accredited inspector, and accredited inspectors apply six months to accessories. Here is what each document says.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting equipment inspection in the UAE: Abu Dhabi and Dubai rules',
  seoDescription:
    'How often lifting equipment and accessories must be inspected in Abu Dhabi and Dubai, who may certify them, what the certificate must show, and whether colour coding is required.',
  focusKeyword: 'lifting equipment inspection UAE',
  publishedAt: '2026-09-28T15:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Abu Dhabi: lifting accessories and equipment for lifting people at least every 6 months, other lifting equipment at least every 12 months, by a third-party inspection body approved by the QCC (ADOSH-SF CoP 34.0).',
        'Dubai: Dubai Municipality requires lifting equipment and gear to be tested and certified by an EIAC-accredited third party once every 12 months. EIAC’s requirements for those inspectors set 6-month intervals for accessories, manual lifting equipment and people-lifting equipment.',
        'In Jebel Ali and other PCFC areas, the inspection agency must also be pre-qualified and registered with Trakhees EHS.',
        'Every accessory must carry its safe working load. Unmarked gear comes out of service.',
        'None of the Abu Dhabi or Dubai documents we reviewed requires colour coding. Colour tags are a site convention; the certificate is the proof.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask on any UAE site how often slings and shackles must be inspected and you will hear “six months” — usually attributed to the UK’s LOLER regulations. In Abu Dhabi that interval is now written into the emirate’s own code of practice. In Dubai the position takes two documents to read. This guide sets out what each one says, who may do the examination, and what the paperwork has to show.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'This is a guide, not legal advice.',
      body: 'Regulations and their versions change, and free zones and major operators add their own requirements. The documents and versions we relied on are named below; confirm the current requirements with the authority for your site.',
    },

    { type: 'section_head', number: '/01', title: 'The short answer.', anchor: 'short-answer' },
    {
      type: 'comparison_table',
      caption: 'Maximum interval between thorough examinations',
      columns: ['Item', 'Abu Dhabi (CoP 34.0)', 'Dubai-based inspection bodies (EIAC)'],
      rows: [
        { cells: ['Lifting equipment — cranes, forklifts, hoists, winches', '12 months', '12 months'] },
        { cells: ['Equipment for lifting people — MEWPs, man baskets, passenger hoists', '6 months', '6 months'] },
        { cells: ['Lifting accessories — slings, shackles, hooks, eye bolts, clamps, lifting beams', '6 months', '6 months (no load test)'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Dubai Municipality’s own guideline sets a single annual certification for all lifting equipment and gear. The six-month intervals in the Dubai column come from the accreditation requirements EIAC applies to the inspection bodies that do that work. In practice, an accredited inspector in Dubai will put slings and shackles on a six-month cycle.',
    },
    {
      type: 'direct_answer',
      question: 'How often must lifting accessories be inspected in the UAE?',
      answer:
        'In Abu Dhabi, at least every six months by a QCC-approved third-party inspection body, under ADOSH-SF CoP 34.0. In Dubai, Dubai Municipality requires annual certification by an EIAC-accredited third party, and EIAC’s requirements for those inspectors set a six-month interval for accessories such as slings, shackles and hooks. Abu Dhabi also requires daily and weekly checks in between.',
    },

    { type: 'section_head', number: '/02', title: 'Abu Dhabi.', anchor: 'abu-dhabi' },
    {
      type: 'paragraph',
      html: 'Two documents govern lifting in the Emirate of Abu Dhabi. <strong>CoP 34.0, Safe Use of Lifting Equipment and Lifting Accessories</strong>, is part of the Abu Dhabi Occupational Safety and Health System Framework — ADOSH-SF, formerly OSHAD-SF — and applies to all employers in the emirate. It relies on <strong>ADS 22</strong>, the Abu Dhabi specification for inspecting lifting equipment and accessories.',
    },
    {
      type: 'prose',
      html: '<h3>Thorough examination</h3><ul><li>Lifting equipment: examined and tested at least every 12 months.</li><li>Equipment for lifting people: at least every 6 months.</li><li>Lifting accessories: thorough examination at least every 6 months.</li><li>Cranes with a variable radius: a maximum-SWL test at least once every 4 years, and examination after erection at a new location or a structural modification.</li><li>Only third-party inspection bodies approved by the Abu Dhabi Quality &amp; Conformity Council (QCC) may do the work, and ADS 22 requires their inspectors to hold lifting-inspector accreditation from LEEA or an equivalent body.</li></ul><h3>Between examinations</h3><ul><li>Daily visual checks: equipment by the operator, accessories by the slinger or signaller.</li><li>Weekly detailed inspections, recorded in an equipment register and an accessory register kept at each site.</li><li>An accessory suspected of being overloaded comes out of use until an approved third party has examined it.</li></ul><h3>Marking and records</h3><ul><li>Every accessory must show its safe working load, on the item or on a metal tag. Unmarked accessories are removed from service.</li><li>Lifting plans must include copies of the third-party test certificates.</li><li>ADS 22 sets standard certificate forms: LE01 for equipment found safe, LE02 for unsafe, LE03 for a defect report. Defective equipment is quarantined until it is re-certified.</li></ul>',
    },
    {
      type: 'standard_citation',
      standard: 'ADOSH-SF CoP 34.0',
      publisher: 'Abu Dhabi Public Health Centre (ADPHC)',
      title: 'Safe Use of Lifting Equipment and Lifting Accessories',
      clause: '§3.11, §3.12',
      summary:
        'Sets the thorough examination intervals for lifting equipment (12 months), equipment for lifting persons (6 months) and lifting accessories (6 months), restricts that work to QCC-approved third-party inspection bodies, and requires daily and weekly in-service checks, site registers and SWL marking on every accessory.',
      url: 'https://www.adphc.gov.ae/-/media/Project/ADPHC/ADPHC/PDF/OSHAD-SF/Codes-of-Practise/2026/COP-340--Safe-Use-of-Lifting-Equipment-and-Lifting-Accessories-v41-English.pdf',
      edition: 'v4.1, February 2026',
    },
    {
      type: 'standard_citation',
      standard: 'ADS 22/2018',
      publisher: 'Abu Dhabi Quality & Conformity Council',
      title: 'Inspection of Lifting Equipment and Lifting Equipment Accessories',
      summary:
        'Authorises only inspection bodies registered by the QCC, requires them to be independently audited by LEEA or equivalent, allows intervals set under an examination scheme, requires examination after exceptional circumstances, and defines the LE01, LE02 and LE03 certificate forms.',
      url: 'https://qcc.gov.ae/-/media/Project/QCC/QCC/Documents/Quality-Infrastructure-Documents/Abu-Dhabi-Specification/Abu-Dhabi-Specifications/ADS-22---Inspection-of-Lifting-Equipments-and-Lifiting-Equipments-Accessories.pdf',
      edition: 'Issue 2, August 2018',
    },

    { type: 'section_head', number: '/03', title: 'Dubai.', anchor: 'dubai' },
    {
      type: 'paragraph',
      html: 'Dubai Municipality’s <strong>Technical Guidelines for Examination and Certification of Cranes, Hoists, Lifts and Other Lifting Equipment</strong> (DM-HSD-GU48-ECLA2) apply to every establishment using lifting equipment in the emirate. They require:',
    },
    {
      type: 'prose',
      html: '<ul><li>Cranes, hoists, lifts, forklifts and “lifting equipment and gears” tested and certified by a third party accredited by EIAC, the Emirates International Accreditation Centre, once every 12 months.</li><li>A certificate for each item showing its serial number, technical details, the tests done and its SWL, kept at site. Any change to the SWL appears on the certificate.</li><li>The SWL displayed on the equipment.</li><li>Equipment found unsafe taken out of use, and reported to Dubai Municipality’s Health &amp; Safety Department.</li><li>Operators, riggers and signalmen certified by an EIAC-accredited third party, trained at a KHDA-approved institute.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'The inspection bodies themselves are accredited by EIAC to ISO/IEC 17020 under <strong>EIAC-RQ-IB-002</strong>. Its annex for Dubai sets the intervals those inspectors apply: 12 months for cranes, forklifts, hoists and winches; 6 months for equipment that lifts people; 6 months for manual lifting equipment such as chain blocks, pulleys and jacks; and 6 months, without a load test, for lifting accessories.',
    },
    {
      type: 'paragraph',
      html: '<strong>Jebel Ali and PCFC areas.</strong> Trakhees, the regulator for the Ports, Customs and Free Zone Corporation, requires lifting-equipment inspection and certification agencies to be pre-qualified and registered with Trakhees EHS — even if they are already certified at federal or emirate level. Other authorities, including free-zone authorities and Dubai Civil Aviation, regulate lifting within their own areas; check with the one that covers your site.',
    },
    {
      type: 'standard_citation',
      standard: 'DM-HSD-GU48-ECLA2',
      publisher: 'Dubai Municipality',
      title: 'Technical Guidelines for Examination and Certification of Cranes, Hoists, Lifts and Other Lifting Equipment',
      summary:
        'Requires lifting equipment and gear in Dubai to be tested and certified once every 12 months by an EIAC-accredited third party, with a site-kept certificate showing serial number, tests and SWL, the SWL displayed on the equipment, and EIAC-accredited certification of operators, riggers and signalmen.',
      url: 'https://www.dm.gov.ae/documents/hsd-gu48/',
      edition: 'V5.0, January 2025',
    },
    {
      type: 'standard_citation',
      standard: 'EIAC-RQ-IB-002',
      publisher: 'Emirates International Accreditation Centre',
      title: 'Accreditation Requirements for Inspection Bodies working in the field of Lifting Equipment & Lifting Accessories',
      summary:
        'Used with ISO/IEC 17020 to accredit lifting inspection bodies. Its Dubai annex sets 12-month intervals for lifting equipment and 6-month intervals for people-lifting equipment, manual lifting equipment and lifting accessories.',
      url: 'https://eiac.gov.ae/wp-content/uploads/2025/08/EIAC-RQ-IB-002-Lifting-Equipment-Lifting-Accessories.pdf',
      edition: 'Issue 1 Rev 04, October 2024',
    },

    { type: 'section_head', number: '/04', title: 'Federal rules and the other emirates.', anchor: 'federal' },
    {
      type: 'paragraph',
      html: 'A long-standing federal ministerial resolution on protecting workers from work hazards — Resolution 32 of 1982 — requires the maximum load to be displayed on lifting machines, lifts to be tested by an expert at least once a year, and chains, ropes and pulling wires to be inspected at least every six months. Abu Dhabi’s ADS 22 still cites it. For the other emirates and the free zones, the rules of the local authority apply; confirm them before relying on either the Abu Dhabi or the Dubai figures.',
    },

    { type: 'section_head', number: '/05', title: 'Is colour coding required?', anchor: 'colour-coding' },
    {
      type: 'paragraph',
      html: 'Not by any of the Abu Dhabi or Dubai documents above. CoP 34.0, ADS 22, Dubai Municipality’s guideline and EIAC’s requirements all rely on certificates, registers and SWL marking; none prescribes a colour scheme. LEEA, the lifting industry’s trade association, also says in its guidance — written for the UK — that no statutory requirement mandates colour-coded tags.',
    },
    {
      type: 'paragraph',
      html: 'Many sites still colour-tag gear after each examination, and it is a useful visual check. But the colour is a site convention. What proves an item is fit to use is a current certificate in the register that matches the ID and SWL on the item.',
    },

    { type: 'section_head', number: '/06', title: 'Supply certificate versus examination certificate.', anchor: 'certificates' },
    {
      type: 'paragraph',
      html: 'New lifting gear arrives with the <strong>manufacturer’s test certificate</strong>: it records the proof load the item passed when it was made, and ties it to the item by an ID. A <strong>thorough examination certificate</strong> is different: it is issued by the approved or accredited third party and says the item was fit for service on the day it was examined. The first proves the item as manufactured; only the second satisfies the periodic examination rules above.',
    },
    {
      type: 'paragraph',
      html: 'Keep the manufacturer’s certificate with the item’s record for its whole life — inspectors rely on it for the original rating. And check whether your site procedure requires new accessories to be examined and entered in the register before their first lift.',
    },
    {
      type: 'decision_tree',
      heading: 'Before an accessory goes on the hook',
      intro: 'Five checks that follow directly from the rules above.',
      branches: [
        { condition: 'Is the SWL marked on the item or its tag?', outcome: 'If not, it comes out of service.' },
        { condition: 'Is it in the site register, with a current examination certificate?', outcome: 'Within 6 months for accessories in Abu Dhabi, or your inspector’s interval in Dubai.' },
        { condition: 'Does the ID on the item match the certificate?', outcome: 'A certificate for a different item proves nothing about this one.' },
        { condition: 'Has today’s pre-use check been done?', outcome: 'Visual check by the slinger or signaller before use.' },
        { condition: 'Could it have been overloaded since its last examination?', outcome: 'Quarantine it until the third-party inspector has seen it.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Who can certify lifting equipment in Dubai?',
          answer:
            'A third party accredited by EIAC, the Emirates International Accreditation Centre, under Dubai Municipality’s guideline. In Jebel Ali and other PCFC areas the agency must also be pre-qualified and registered with Trakhees EHS.',
        },
        {
          question: 'Who can certify lifting equipment in Abu Dhabi?',
          answer:
            'A third-party inspection body approved by the Abu Dhabi Quality & Conformity Council, whose inspectors hold lifting-inspector accreditation from LEEA or an equivalent body, under CoP 34.0 and ADS 22.',
        },
        {
          question: 'How often do slings and shackles need inspecting?',
          answer:
            'Thorough examination at least every six months in Abu Dhabi, and on the six-month interval EIAC-accredited inspectors apply in Dubai. In Abu Dhabi they also need a daily visual check by the slinger or signaller and a recorded weekly inspection.',
        },
        {
          question: 'Is LOLER law in the UAE?',
          answer:
            'No. LOLER is UK law. But Abu Dhabi’s ADS 22 cites it as a reference, and the UAE intervals — six months for accessories and people-lifting equipment, twelve months for other lifting equipment — follow the same pattern.',
        },
        {
          question: 'Does a manufacturer’s certificate replace the six-monthly examination?',
          answer:
            'No. The manufacturer’s certificate records the proof test at manufacture. The periodic thorough examination is a separate requirement, done by an approved or accredited third party, and it has its own certificate.',
        },
        {
          question: 'Is colour coding of lifting gear mandatory?',
          answer:
            'Not under the Abu Dhabi and Dubai documents reviewed here. Colour tags are a site convention; the certificate and the register are what the rules require.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting & rigging equipment',
      blurb: 'Slings, shackles, hooks, chain and wire rope, supplied from Dubai with the manufacturer’s test certificate.',
    },
    {
      type: 'category_link',
      slug: 'lifting-slings',
      label: 'Lifting slings',
      blurb: 'Wire rope, chain and polyester slings, each tagged with its WLL.',
    },
    {
      type: 'category_link',
      slug: 'rigging-hardware',
      label: 'Rigging hardware',
      blurb: 'Shackles, hooks, master links and eye bolts with SWL marked.',
    },
    {
      type: 'related_articles',
      slugs: ['working-load-limit-vs-breaking-strength', 'types-of-shackles', 'sling-angle-chart', 'wire-rope-clips-installation'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'Checked against ADOSH-SF CoP 34.0 v4.1 (Feb 2026), ADS 22/2018, Dubai Municipality DM-HSD-GU48-ECLA2 V5.0 (Jan 2025), EIAC-RQ-IB-002 Rev 04 (Oct 2024), Trakhees PCFC-TRK-EHS-IO-CP-06 Rev 02 and Ministerial Resolution 32 of 1982. Confirm current versions with the issuing authority.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing gear that failed inspection?',
      body: 'Send the inspector’s defect report or the list of rejected items. We supply replacements from Dubai with the manufacturer’s test certificate, ready for your inspector to examine and register. We do not carry out third-party inspection ourselves.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
