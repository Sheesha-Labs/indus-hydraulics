import type { BlogArticleSeed } from '../shared'

/**
 * The site lifting register. UAE facts from memory uae-lifting-inspection-rules (verified 2026-09-28
 * in primary documents): Abu Dhabi CoP 34 v4.1 (registers, daily/weekly checks, 6-month accessories,
 * 12-month equipment, QCC-approved examiners, SWL marking); ADS 22/2018 forms LE01–LE03; Dubai GU48
 * (12-monthly EIAC-accredited certification) and EIAC-RQ-IB-002 Dubai annex (6 months accessories).
 * Colour coding not statutory (LEEA). Register fields are general good practice, not a form.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-equipment-register-uae',
  title: 'The lifting equipment register: what to record, and how to keep it right on a UAE site',
  excerpt:
    'Every lifting accessory on a UAE site needs a history: what it is, what it is rated for, where its certificate is and when it was last examined. The lifting register is where that lives. What the register should record, how to run it from delivery to retirement, how it ties to Abu Dhabi’s and Dubai’s inspection rules, and the gaps that fail audits.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting Equipment Register: What to Record (UAE Sites)',
  seoDescription:
    'How to set up and run a lifting equipment register on a UAE site: the fields to record, unique IDs, certificates and examination dates, Abu Dhabi and Dubai inspection intervals, quarantine and retirement, and common audit gaps.',
  focusKeyword: 'lifting equipment register',
  publishedAt: '2026-10-14T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The register is the site’s record of every lifting item: identity, rating, certificate, examinations, location and status.',
        'Give every item a unique ID, marked or tagged on the item, that matches the register line and its certificate.',
        'Abu Dhabi’s lifting code requires site registers, daily and weekly checks, and thorough examination of accessories every 6 months by approved third parties.',
        'Record the next examination date and flag items before they lapse — an out-of-date item is out of service.',
        'Quarantine, repair and retirement must be recorded too, so a rejected item can never drift back into use.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask a site to produce the history of the shackle on the crane hook right now, and the answer shows whether its lifting management works. A good register answers in seconds: the shackle’s ID, its rating, the certificate it came with, when it was last examined and by whom, and when it is due again. A poor one — or none — means an inspector, an auditor or an incident investigation will find the gap first. This guide sets out what a lifting register should contain and how to run it.',
    },

    { type: 'section_head', number: '/01', title: 'What the rules ask for.', anchor: 'rules' },
    {
      type: 'paragraph',
      html: 'In Abu Dhabi, the occupational safety code of practice for lifting equipment and accessories requires site registers, daily and weekly in-service checks, and thorough examination by third parties approved for the purpose: every 12 months for lifting equipment, and every 6 months for lifting accessories and equipment for lifting people. Every accessory must show its safe working load; an unmarked accessory comes out of service. The emirate’s standard for lifting examinations also defines the certificate forms examiners issue. In Dubai, municipal guidance requires certification at least every 12 months by an accredited third party, and the accreditation rules set 6-month intervals for accessories. See <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.',
    },
    {
      type: 'direct_answer',
      question: 'What should a lifting equipment register contain?',
      answer:
        'For each item: a unique ID, a description and type, the working load limit, the maker and certificate reference, the date it entered service, each thorough examination with its date, examiner and result, the next examination due, its current location or holder, and its status — in service, quarantined, under repair or retired.',
    },

    { type: 'section_head', number: '/02', title: 'The fields.', anchor: 'fields' },
    {
      type: 'comparison_table',
      caption: 'A lifting register line — recommended fields',
      columns: ['Field', 'Example'],
      rows: [
        { cells: ['Unique ID', 'SH-0142 (tagged or stamped on the item)'], highlight: true },
        { cells: ['Description', 'Bolt-type anchor shackle, G-2130 pattern, 1"'] },
        { cells: ['WLL', '8.5 t'] },
        { cells: ['Maker and traceability code', 'As marked on the item'] },
        { cells: ['Supply certificate', 'Manufacturer’s test certificate number and date'] },
        { cells: ['Into service', 'Date and issuing storekeeper'] },
        { cells: ['Examinations', 'Date, examiner, report number, result'] },
        { cells: ['Next examination due', 'Date — flagged 30 days ahead'] },
        { cells: ['Location or holder', 'Crane 2 rigging crew / store bin 4'] },
        { cells: ['Status', 'In service / quarantined / under repair / retired'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Running it, from delivery to retirement.', anchor: 'process' },
    {
      type: 'prose',
      html: '<ol><li><strong>Receive</strong>: check the item against the order and certificate, read its markings — see <a href="/blog/shackle-markings-explained">shackle markings explained</a> — and reject anything unmarked.</li><li><strong>Register and tag</strong>: assign the ID, record the line, file the certificate.</li><li><strong>Issue and return</strong>: issue only registered, in-date items; record who has them.</li><li><strong>Check</strong>: daily and weekly checks by users, with defects reported and items quarantined.</li><li><strong>Examine</strong>: book third-party thorough examinations before the due date; record each report.</li><li><strong>Repair or retire</strong>: record any repair and re-examination, or destroy and retire the item so it cannot return.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Colour coding is a tool, not a rule.',
      body: 'Many sites colour-tag lifting gear to show which examination period it is in. The Abu Dhabi and Dubai documents we read do not require it, and the UK lifting association notes there is no statutory requirement — but where used, the register, not the colour, is the record.',
    },

    { type: 'section_head', number: '/04', title: 'Where registers fail audits.', anchor: 'gaps' },
    {
      type: 'prose',
      html: '<ul><li>Items on site that are not in the register at all.</li><li>IDs on items that do not match any register line or certificate.</li><li>Examinations overdue, with the items still in use.</li><li>Rejected items with no record of destruction — they find their way back.</li><li>Certificates that do not cover the item received: wrong size, type or batch.</li><li>Hire or subcontractor gear brought onto site without entering the register.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a lifting register required in the UAE?', answer: 'Abu Dhabi’s lifting code of practice requires site registers along with daily and weekly checks and periodic third-party examination. Check your emirate and client requirements.' },
        { question: 'How often must lifting accessories be examined in Abu Dhabi?', answer: 'Every 6 months by approved third parties, with lifting equipment every 12 months.' },
        { question: 'Does subcontractor rigging go in the register?', answer: 'It should — anything lifted with on your site needs to be identified, certified and in date.' },
        { question: 'What happens to rejected lifting gear?', answer: 'It is quarantined, then repaired and re-examined or destroyed, with the outcome recorded so it cannot return to service.' },
        { question: 'Do new items come with what the register needs?', answer: 'Rated items should arrive marked with WLL and size and with the manufacturer’s test certificate. Ours do.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Marked, certified rigging',
      skus: ['IH-LR-SH-G2130', 'IH-LR-SH-G209', 'IH-LR-SY-PRSE', 'IH-LR-CS-G80DOS', 'IH-LR-G8-MLA', 'IH-LR-CB-A'],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting and rigging',
      blurb: 'Certified slings, shackles, hooks, chain and hoists from Dubai.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
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
      slugs: ['lifting-equipment-inspection-uae', 'lifting-gear-test-certificate', 'lifting-gear-rejection-criteria', 'site-mobilisation-rigging-kit', 'shackle-markings-explained', 'sling-colour-code-chart'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Abu Dhabi lifting code of practice and examination standard, and Dubai municipal and accreditation guidance, read in the primary documents in September 2026. Register fields are recommended practice.',
    },
    {
      type: 'cta_block',
      heading: 'Setting up a register?',
      body: 'Every rated item we supply ships marked with its WLL and with the manufacturer’s test certificate, ready for your register. Send your list and we will quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
