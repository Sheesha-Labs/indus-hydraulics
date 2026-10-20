import type { BlogArticleSeed } from '../shared'

/**
 * Class approvals for crane and winch gearboxes. Checked 2026-10-20 against Dinamic Oil's certificates as published on
 * dinamicoil.com (July 2026 set): DNV TAS00000YS (WD 1000–8000, DNV-ST-0377/0378, SOLAS/LSA, TD -20 °C, conditions incl.
 * bearing life not evaluated, 3.1 material certs, periodical assessment), TAS00001JK (RW 512–3513, incl. DNV-OS-E101
 * drilling facilities, LSA), TAS00000NE (RE 3513 / HRS), TAM000002Y and TAM00000UJ (thruster pinions, slewing ring not
 * included); ABS PDA 22-2218009-1 and 25-0346164 (in-line/right-angle 2/3-stage gearboxes with overhung pinions);
 * BV Mode II works recognition. Expiries as printed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'dnv-type-approval-crane-gearboxes',
  title: 'DNV type approval for crane and winch gearboxes: what it covers and what it does not',
  excerpt:
    'A DNV type approval or an ABS product design assessment on a gearbox saves weeks on a classed crane or winch — if you know what it covers. What type approval, PDA and works recognition mean, what they leave to the project, and which Dinamic Oil drives carry them.',
  categorySlug: 'specification-standards',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DNV Type Approval for Crane Gearboxes and Winch Drives',
  seoDescription:
    'What a DNV type approval or ABS design assessment covers on crane, winch and thruster gearboxes, what is still checked per project, and who holds one.',
  focusKeyword: 'dnv type approval',
  publishedAt: '2026-10-20T19:45:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A type approval says a design meets the class rules within stated limits; each unit may still need its own product certificate.',
        'Read the conditions: rating basis, design temperature, material certificates and what was not assessed.',
        'An ABS product design assessment (PDA) approves a design; ABS still surveys the unit built for your vessel.',
        'A pinion approval does not cover the slewing ring it meshes with.',
        'Check the expiry date — and the revision — against the date your project will be surveyed.',
      ],
    },
    {
      type: 'lead',
      html: 'On a vessel, offshore unit or drilling rig built to class, every lifting appliance — deck crane, davit winch, offshore crane hoist — has to satisfy the class society’s rules, and its gearbox is part of that. When the gearbox already carries a type approval for the right rules, the crane builder submits the certificate instead of the full gear calculation. When it does not, the design is reviewed from scratch. Knowing exactly what a certificate covers decides which path a project takes.',
    },

    { type: 'section_head', number: '/01', title: 'Three kinds of certificate.', anchor: 'kinds' },
    {
      type: 'comparison_table',
      caption: 'What each certificate means',
      columns: ['Certificate', 'Issued for', 'What still happens per project'],
      rows: [
        { cells: ['Type approval (DNV)', 'A product design, within stated ratings and conditions', 'Product certificate for the unit if the rules call for one; installation checked with the appliance'], highlight: true },
        { cells: ['Product design assessment (ABS)', 'A product design, against named ABS rules', 'Unit survey and certification for the vessel'] },
        { cells: ['Works or manufacturer recognition (BV Mode II)', 'The factory’s quality system for a product scope', 'Product approval and certification as the rules require'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Does a DNV type approval mean no further certification is needed?',
      answer:
        'Not always. A type approval confirms the design meets DNV’s rules within the ratings and conditions on the certificate. Depending on the rules and the appliance, the unit supplied may still need a DNV product certificate, and the gearbox is assessed again as part of the crane or winch it is fitted to.',
    },

    { type: 'section_head', number: '/02', title: 'Read the conditions.', anchor: 'conditions' },
    {
      type: 'paragraph',
      html: 'The value of a type approval is in its annex. Dinamic Oil’s DNV certificate for the WD winch drives, for example, lists each size and ratio with its FEM L2-T5 torque, maximum static torque and a separate SOLAS torque for life-saving appliances, a design temperature of −20 °C, case-hardened gear teeth to ISO 6336, 3.1 material certificates and grade 8.8 bolts or better — and states that bearing life was not evaluated. A crane designer using it still has to show the bearing life for the duty, and still has to work within those torques.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Pinion yes, ring no.',
      body: 'DNV’s thruster-pinion approvals cover the pinion only. The slewing ring it drives is submitted for each installation with its own gear data sheet.',
    },

    { type: 'section_head', number: '/03', title: 'Dinamic Oil approvals.', anchor: 'dinamic' },
    {
      type: 'comparison_table',
      caption: 'Dinamic Oil class approvals published in 2026',
      columns: ['Certificate', 'Covers', 'Rules', 'Valid to'],
      rows: [
        { cells: ['DNV TAS00000YS', 'WD 1000 to WD 8000 winch drives (3 stages)', 'DNV-ST-0377, DNV-ST-0378, SOLAS / LSA Code', '21 Nov 2029'] },
        { cells: ['DNV TAS00001JK', 'RW 512 to RW 3513 winch drives', 'DNV-ST-0377, -0378, LSA, DNV-OS-E101 drilling', '1 Jan 2029'], highlight: true },
        { cells: ['DNV TAS00000NE', 'RE 3513 and RE 3513 HRS gearbox', 'DNV-ST-0377, DNV-ST-0378', '5 Mar 2030'] },
        { cells: ['DNV TAM000002Y, TAM00000UJ', 'Pinions for thruster steering', 'DNV ship and HSLC rules', '2 Mar 2031, 22 Sep 2030'] },
        { cells: ['ABS 22-2218009-1, 25-0346164', 'In-line and right-angle 2/3-stage gearboxes with pinion output (thruster steering)', 'ABS ships, offshore units, high-speed craft', '7 Feb 2027, 10 Nov 2030'] },
        { cells: ['BV Mode II', 'Works recognition: gearboxes, winches, orbit motors', 'BV NR320', '13 Mar 2030'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For any other model, Dinamic Oil can obtain project or product approval from DNV, ABS, Lloyd’s Register, Bureau Veritas and other societies, assessed case by case. Tell us the class society, the rules (shipboard, offshore, drilling, LSA) and the appliance at enquiry stage; it changes which model is the efficient choice.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a type approval the same as an API 2C monogram?', answer: 'No. API Spec 2C covers offshore pedestal cranes as a whole. A gearbox type approval is a component approval under a class society’s rules.' },
        { question: 'What is the SOLAS torque on the certificate?', answer: 'A separate, lower torque rating for life-saving appliance winches such as lifeboat davits, which have their own design rules.' },
        { question: 'What happens when a certificate expires?', answer: 'The maker renews it, often with a new revision. A unit supplied while it was valid keeps its certification; new orders need the current one.' },
        { question: 'Do approvals cover high ambient temperatures?', answer: 'Not by default. The certificate states its design temperature; Gulf duty above the standard rating is checked separately.' },
        { question: 'Where can I get the certificates?', answer: 'We send the current certificate and its annex with the quotation for any approved model.' },
      ],
    },
    { type: 'product_embed', heading: 'Type-approved drives', skus: ['IH-DO-WD', 'IH-DO-RW', 'IH-DO-RE', 'IH-DO-SLR'] },
    { type: 'category_link', slug: 'winch-drives', label: 'Winch drives and motor drums', blurb: 'DNV type-approved WD and RW drives.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil and gas', blurb: 'Offshore and drilling-rig equipment.' },
    { type: 'related_articles', slugs: ['winch-drive-vs-motor-drum-vs-complete-winch', 'slewing-drive-selection-guide', 'lifting-gear-test-certificate'] },
    { type: 'as_of_stamp', verifiedOn: '2026-10-20', note: 'Certificate numbers, scopes, conditions and expiry dates as published by Dinamic Oil (July 2026 set).' },
    {
      type: 'cta_block',
      heading: 'Building to class?',
      body: 'Tell us the class society, rules and appliance. We will match an approved Dinamic Oil drive or arrange project approval with the factory.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
