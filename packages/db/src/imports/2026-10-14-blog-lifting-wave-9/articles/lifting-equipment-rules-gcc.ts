import type { BlogArticleSeed } from '../shared'

/**
 * GCC overview of lifting equipment rules — honest about what is public. UAE (verified primary docs,
 * memory), Saudi SASO TR Part 3 (read 2026-10-14), Qatar: QatarEnergy lifting service-provider
 * self-assessment (LEEA-qualified inspectors, ISO 17020/17024, permanent inspectors in Qatar — high);
 * QatarEnergy standard QP-PAI-STD-005:2020 cited by a certification body (medium). Oman: MD 286/2008
 * OSH regulation exists (medium); no lifting clauses verified. Kuwait/Bahrain: nothing verified.
 * Baselines: UK LOLER intervals (HSE INDG422, high) and ASME B30.26 (summary).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-equipment-rules-gcc',
  title: 'Lifting equipment rules across the GCC: UAE, Saudi Arabia, Qatar, Oman, Kuwait and Bahrain',
  excerpt:
    'Contractors working across the Gulf meet a patchwork of lifting rules: detailed codes in Abu Dhabi and Dubai, a national technical regulation in Saudi Arabia, client standards that do most of the work in Qatar’s energy sector, and little that is public elsewhere. What each country’s published rules say, what we could not verify, and the baseline most sites fall back on.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting Equipment Rules in the GCC: Country by Country',
  seoDescription:
    'Lifting equipment and rigging rules across the GCC: Abu Dhabi and Dubai codes, Saudi SASO regulation, QatarEnergy requirements, Oman, Kuwait and Bahrain — inspection intervals, inspector qualifications and the LOLER/ASME baseline sites use.',
  focusKeyword: 'lifting equipment regulations gcc',
  publishedAt: '2026-10-14T10:28:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'UAE: Abu Dhabi and Dubai publish detailed lifting codes — 6-month examination of accessories, approved or accredited third-party examiners, registers.',
        'Saudi Arabia: a SASO technical regulation covers lifting equipment and accessories, with conformity and pre-use inspection certificates.',
        'Qatar: in the energy sector, QatarEnergy’s requirements — LEEA-qualified inspectors, ISO 17020-certified inspection bodies — set the bar.',
        'Oman, Kuwait and Bahrain: we found no public lifting-specific rules to cite; client standards govern.',
        'Where local rules are thin, sites commonly work to UK LOLER intervals and ASME B30 standards — and the client contract is usually the strictest layer.',
      ],
    },
    {
      type: 'lead',
      html: 'A contractor with crews in Abu Dhabi, Jubail and Ras Laffan works under three different sets of lifting rules, and a fourth set from each client. Some are detailed public codes; some are national product regulations; some are client standards that are not published at all. This guide sets out what we could verify from public sources in October 2026, country by country, and is clear about where we could not. It is a map, not legal advice — confirm with the authority and your client.',
    },

    { type: 'section_head', number: '/01', title: 'Country by country.', anchor: 'countries' },
    {
      type: 'comparison_table',
      caption: 'Published lifting rules in the GCC (as found October 2026)',
      columns: ['Country', 'What is published', 'Where to look'],
      rows: [
        { cells: ['UAE — Abu Dhabi', 'Lifting code of practice: accessories examined every 6 months, equipment every 12, by approved third parties; registers; SWL marking', 'Abu Dhabi occupational safety framework'], highlight: true },
        { cells: ['UAE — Dubai', 'Municipal guidance: certification at least every 12 months by an accredited third party; certified operators, riggers, signallers', 'Dubai Municipality; accreditation rules'] },
        { cells: ['Saudi Arabia', 'SASO technical regulation: conformity certificate, notified-body inspection before use, periodic examination, Arabic labels', 'SASO; client standards'] },
        { cells: ['Qatar', 'QatarEnergy requirements for lifting service providers: LEEA-qualified inspectors, ISO 17020/17024', 'QatarEnergy; project specifications'] },
        { cells: ['Oman', 'General OSH regulation; no lifting-specific clauses found', 'Ministry of Labour; client standards'] },
        { cells: ['Kuwait, Bahrain', 'No lifting-specific public rules found', 'Client and authority requirements'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What are the lifting equipment inspection requirements in the GCC?',
      answer:
        'They vary. Abu Dhabi requires thorough examination of lifting accessories every 6 months and equipment every 12 by approved third parties; Dubai requires certification at least every 12 months by an accredited third party; Saudi Arabia’s SASO regulation requires inspection before use and periodic examination without setting an interval. Elsewhere, client standards govern, often based on LOLER and ASME B30.',
    },

    { type: 'section_head', number: '/02', title: 'UAE.', anchor: 'uae' },
    {
      type: 'paragraph',
      html: 'The UAE has the most detailed public rules in the region, set at emirate level. Our guide to <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a> covers Abu Dhabi’s and Dubai’s requirements in detail, and <a href="/blog/lifting-equipment-register-uae">the lifting equipment register</a> covers the records they expect.',
    },

    { type: 'section_head', number: '/03', title: 'Saudi Arabia.', anchor: 'saudi' },
    {
      type: 'paragraph',
      html: 'Saudi Arabia regulates lifting equipment and accessories nationally through SASO’s technical regulation, in force since 2022: suppliers need a certificate of conformity; used and newly installed equipment needs a notified-body inspection certificate before use; periodic examination is required; marking and Arabic labels are specified. Client standards — Saudi Aramco’s most prominently — add site requirements. See <a href="/blog/lifting-equipment-rules-saudi-arabia">lifting equipment rules in Saudi Arabia</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Qatar.', anchor: 'qatar' },
    {
      type: 'paragraph',
      html: 'In Qatar’s energy sector, the clearest public requirements come from QatarEnergy. Its self-assessment for lifting equipment service providers asks whether every inspector holds a LEEA or equivalent qualification, whether the company is certified to ISO 17020 (inspection bodies) and ISO 17024 (certification of persons), and requires permanent inspection staff in Qatar. Certification bodies also cite a QatarEnergy standard for lifting equipment and operations (QP-PAI-STD-005), which is not public. Inspection intervals come from that standard, the project specification or the site’s procedures.',
    },

    { type: 'section_head', number: '/05', title: 'Oman, Kuwait and Bahrain.', anchor: 'others' },
    {
      type: 'paragraph',
      html: 'Oman’s occupational safety regulation for establishments under the Labour Law (Ministerial Decision 286/2008, as amended) sets general duties, but we found no public lifting-specific clauses to cite; the major operators’ lifting standards, which govern most heavy lifting, are not public. For Kuwait and Bahrain we found no lifting-specific public rules. In all three, the client’s standards and the project specification govern — ask for them at tender.',
    },

    { type: 'section_head', number: '/06', title: 'The common baseline.', anchor: 'baseline' },
    {
      type: 'paragraph',
      html: 'Where local rules are thin, Gulf sites and client standards commonly draw on two references. The UK’s <strong>LOLER</strong> regime requires thorough examination of lifting accessories at least every 6 months and other lifting equipment every 12 months (or to a competent person’s examination scheme), and after exceptional circumstances such as damage or long periods out of use. The US <strong>ASME B30</strong> standards — B30.9 for slings, B30.10 for hooks, B30.26 for rigging hardware — set inspection levels and removal criteria. See <a href="/blog/asme-b30-26-rigging-hardware-explained">ASME B30.26 explained</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not legal advice.',
      body: 'This is a map of public sources as we found them in October 2026. Rules, client standards and approved-inspector lists change. Confirm requirements with the authority, your client and your inspection body before work starts.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which GCC country has the strictest lifting inspection rules?', answer: 'Among published rules, Abu Dhabi’s code is the most detailed, with 6-monthly examination of lifting accessories by approved third parties. Client standards elsewhere can be as strict.' },
        { question: 'Do Qatar lifting inspectors need LEEA qualifications?', answer: 'QatarEnergy asks lifting service providers whether every inspector holds a LEEA or equivalent qualification.' },
        { question: 'Is LOLER used in the Gulf?', answer: 'It is a UK regulation, but its intervals and principles are widely used as a baseline in Gulf client standards and site procedures.' },
        { question: 'Where do I find Oman or Kuwait lifting rules?', answer: 'We found no public lifting-specific rules; the client’s standards and project specification govern.' },
        { question: 'Can you supply certified rigging across the GCC?', answer: 'Yes, from Dubai, with the manufacturer’s test certificate on rated items. Tell us the documents your client requires.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Certified rigging for GCC projects',
      skus: ['IH-LR-SH-G2130', 'IH-LR-SH-G209', 'IH-LR-CS-G80DOS', 'IH-LR-SY-PRSE', 'IH-LR-G8-MLA', 'IH-LR-CB-A'],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting and rigging',
      blurb: 'Certified slings, shackles, hooks, chain and hoists, shipped across the GCC.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'oil-gas',
      label: 'Oil and gas',
      blurb: 'Certified rigging for plant and shutdown work.',
    },
    {
      type: 'related_articles',
      slugs: ['lifting-equipment-rules-saudi-arabia', 'lifting-equipment-inspection-uae', 'asme-b30-26-rigging-hardware-explained', 'lifting-equipment-register-uae', 'proof-load-testing-lifting-gear'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'UAE codes read September 2026; SASO regulation read October 2026; QatarEnergy service-provider requirements; UK HSE guidance on LOLER. Where nothing public was found we say so. Not legal advice.',
    },
    {
      type: 'cta_block',
      heading: 'Working across the Gulf?',
      body: 'Send the item list and the client’s documentation requirements for each country. We will quote certified rigging that meets them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
