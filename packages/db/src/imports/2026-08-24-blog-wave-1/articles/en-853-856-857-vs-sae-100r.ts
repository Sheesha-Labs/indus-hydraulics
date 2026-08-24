import type { BlogArticleSeed } from '../shared'

/**
 * The cross-reference article. Every pairing published here is one our own
 * catalogue asserts on a specific product — the `standard` field in
 * HOSE_SIZE_TABLES, which reads e.g. "EN 853 2SN / SAE 100R2AT".
 *
 * Where that field names one standard only, the article says there is no
 * pairing rather than supplying the "obvious" one. 4SP is the case that
 * matters: the internet routinely equates it with SAE 100R12 and our source
 * does not, so neither do we.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'en-853-856-857-vs-sae-100r',
  title: 'EN 853, 856 and 857 against SAE 100R: what actually cross-references',
  excerpt:
    'Two of these pairings are real and printed on the same hose. Several of the equivalences circulating in the trade are not. Here is which is which, and what to do about the grades that have no counterpart.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'EN 853 vs SAE 100R — hydraulic hose standard cross-reference',
  seoDescription:
    'EN 853 1SN and 2SN, EN 856 4SP and 4SH, EN 857 1SC and 2SC set against the SAE 100R series. Which pairings are genuine, which are approximations, and which do not exist.',
  focusKeyword: 'en 853 vs sae 100r',
  publishedAt: '2026-08-24T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'EN 853 1SN and SAE 100R1AT are a genuine pairing, and so are EN 853 2SN and SAE 100R2AT — the hose we stock is certified to both and printed with both.',
        'EN 857 1SC and 2SC have no SAE counterpart. They are compact constructions defined only in the European standard.',
        'EN 856 4SP and 4SH have no direct SAE equivalent either. Equating 4SP with SAE 100R12 is common in the trade and is an approximation, not a cross-reference.',
        'SAE 100R7 pairs with EN 855 R7 — a different EN number from the wire-hose standards, which is why it is often missed.',
        'Where no pairing exists, compare on bore, working pressure and bend radius. That comparison is always valid; a designation swap sometimes is not.',
      ],
    },
    {
      type: 'lead',
      html: 'A drawing from a German machine builder says 2SN. The spare in the store says R2AT. Somebody has to decide whether those are the same hose before the machine goes back together, and the answer is genuinely yes — which makes it all the more damaging that the same confident logic gets applied to 4SP and R12, where the answer is no.',
    },

    { type: 'section_head', number: '/01', title: 'Two standards bodies, one hose.', anchor: 'two-bodies' },
    {
      type: 'paragraph',
      html: 'EN 853, EN 856 and EN 857 are European standards for wire-reinforced hydraulic hose. SAE J517 defines the 100R series in the United States. They were written independently, and for the two oldest constructions — single and double wire braid — they converged closely enough that manufacturers certify one hose to both and print both designations on the cover.',
    },
    {
      type: 'paragraph',
      html: 'That convergence is real but it is <strong>a property of specific products, not a rule about the standards.</strong> Our own catalogue records it per construction, and where it records only one designation, that is the information — not an omission to be helpfully filled in.',
    },
    {
      type: 'comparison_table',
      caption: 'What our catalogue actually asserts, construction by construction',
      columns: ['Construction', 'EN designation', 'SAE designation', 'Pairing'],
      rows: [
        { cells: ['Single wire braid', 'EN 853 1SN', 'SAE 100R1AT', 'Genuine — both on the hose'], highlight: true },
        { cells: ['Double wire braid', 'EN 853 2SN', 'SAE 100R2AT', 'Genuine — both on the hose'], highlight: true },
        { cells: ['Compact single braid', 'EN 857 1SC', '—', 'No SAE counterpart'] },
        { cells: ['Compact double braid', 'EN 857 2SC', '—', 'No SAE counterpart'] },
        { cells: ['Four-spiral', 'EN 856 4SP', '—', 'No direct SAE counterpart'] },
        { cells: ['Four-spiral, heavy', 'EN 856 4SH', '—', 'No direct SAE counterpart'] },
        { cells: ['Four/six-spiral', '—', 'SAE 100R13', 'SAE only'] },
        { cells: ['Six-spiral', '—', 'SAE 100R15', 'SAE only'] },
        { cells: ['Thermoplastic', 'EN 855 R7', 'SAE 100R7', 'Genuine — both on the hose'], highlight: true },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The 4SP-equals-R12 problem.', anchor: 'the-4sp-problem' },
    {
      type: 'paragraph',
      html: 'Search for a cross-reference table and most of them will put EN 856 4SP opposite SAE 100R12. The two are broadly comparable in intent — four-spiral, high pressure, large bore — and in many applications one will do the other’s job. But they are separately specified constructions with different dimensional and performance requirements, and <strong>“will usually do the job” is not the same claim as “is the equivalent of”.</strong>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Where the approximation bites.',
      body: 'Outside diameter. A hose swap that is fine on pressure can still fail at the crimp, because the ferrule and die were selected for the other construction’s OD. If you are substituting across the 4SP/R12 boundary, the fitting and crimp specification have to be re-checked against the hose actually in your hand — not carried over from the drawing.',
    },
    {
      type: 'direct_answer',
      question: 'Is EN 856 4SP the same as SAE 100R12?',
      answer:
        'No. Both are four-spiral high-pressure constructions and they overlap heavily in application, but they are separate specifications with different dimensional requirements. Treat the substitution as an engineering decision to be checked at the bore, pressure and outside diameter you actually need — not as a designation swap.',
    },

    { type: 'section_head', number: '/03', title: 'Compare on the figures, not the designation.', anchor: 'compare-figures' },
    {
      type: 'paragraph',
      html: 'When there is no clean pairing, the honest comparison is the one that was always valid: <strong>same bore, then pressure, then bend radius.</strong> Here are the spiral constructions we stock set against each other at the sizes they share.',
    },
    {
      type: 'comparison_table',
      caption: 'Spiral constructions at common bores — working pressure in bar',
      columns: ['Construction', '−12', '−16', '−20', '−24', '−32'],
      rows: [
        { cells: ['EN 856 4SP', '350', '320', '210', '210', '210'] },
        { cells: ['EN 856 4SH', '420', '380', '350', '300', '250'], highlight: true },
        { cells: ['SAE 100R13', '350', '350', '350', '350', '350'] },
        { cells: ['SAE 100R15', '420', '420', '420', '420', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read across and the practical answer appears without any cross-reference table at all. At −20 and above, 4SP falls to 210 bar while R13 holds 350 — so a machine drawing calling for 4SP at −24 is asking for a hose that will be comfortably outperformed by the SAE alternative, not merely matched by it. <strong>The figures settle the substitution question that the designations cannot.</strong>',
    },
    {
      type: 'standard_citation',
      standard: 'EN 853',
      publisher: 'CEN (European Committee for Standardization)',
      title: 'Rubber hoses and hose assemblies — Wire braid reinforced hydraulic type — Specification',
      summary:
        'Specifies the wire-braid constructions designated 1SN and 2SN, including dimensions, pressure requirements and test methods. It is the European counterpart to the wire-braid portion of SAE J517, and the two align closely enough that a single hose is routinely certified to both — which is a fact about manufactured product, not a formal equivalence between the documents.',
    },
    {
      type: 'standard_citation',
      standard: 'SAE J517',
      publisher: 'SAE International',
      title: 'Hydraulic Hose',
      summary:
        'Defines the SAE 100R series. Each 100R designation is a separate specification setting minimum performance for a stated construction; the numbering reflects the order of standardisation rather than any ranking of capability. Minimum performance means two conforming hoses can differ materially in cover, temperature range and dimensions.',
    },

    { type: 'section_head', number: '/04', title: 'Using this in practice.', anchor: 'in-practice' },
    {
      type: 'decision_tree',
      heading: 'A drawing names a designation you cannot source',
      intro: 'Work down until one applies.',
      branches: [
        { condition: 'It is 1SN, 2SN or R7', outcome: 'The pairing is genuine. Source the counterpart with confidence.', detail: 'The hose we stock carries both designations on the cover, so the substitution is visible to whoever inspects it later.' },
        { condition: 'It is 1SC or 2SC', outcome: 'There is no SAE equivalent to look for — these are compact constructions specific to EN 857.', detail: 'If the drawing chose compact, it probably chose it for the bend radius. Substituting a standard braid grade may not physically route.', sku: 'IH-HOSE-2SC' },
        { condition: 'It is 4SP or 4SH', outcome: 'Compare at the bore against R13 and R15 rather than looking for a designation match.', detail: 'Check outside diameter as well as pressure — the crimp specification does not carry across a construction change.', sku: 'IH-HOSE-4SH' },
        { condition: 'The pressure is unclear from the drawing', outcome: 'Stop and establish it before substituting anything.', detail: 'A designation swap made without knowing the working pressure at the actual bore is a guess wearing a part number.' },
      ],
    },
    { type: 'product_embed', heading: 'The constructions compared here', skus: ['IH-HOSE-R1-1SN', 'IH-HOSE-R2-2SN', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH', 'IH-HOSE-R13'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I fit an R2AT hose where the drawing says 2SN?', answer: 'On the constructions we stock, yes — the same hose is certified to both and printed with both. Confirm the bore and the fitting termination as you would for any replacement, and check the cover marking on the hose in your hand rather than assuming it from the catalogue.' },
        { question: 'Does EN 857 have an American equivalent at all?', answer: 'Not as a designation. Compact constructions are defined in EN 857 and the SAE series has no counterpart specification. The closest SAE grade on pressure will usually be bulkier and need a larger bend radius, which is normally the reason the compact grade was specified.' },
        { question: 'Why do cross-reference tables disagree with each other?', answer: 'Because most of them are listing approximate application equivalence, not certified dual conformity, and they rarely say which. A table that pairs every EN grade with an SAE one is telling you about intent, not about what is printed on the hose.' },
        { question: 'Which designation should we put on our own drawings?', answer: 'Whichever one your supply chain can actually buy, plus the bore, the working pressure and the fitting ends. A designation on its own has never been a complete specification, and adding the three figures removes the entire cross-reference problem.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'EN 853, EN 856, EN 857 and SAE 100R constructions, stocked in Dubai.' },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Designation pairings and pressure figures from the Intertraco (Italia) S.p.A. hydraulic hose catalogue, for the constructions we stock. Pairings shown are those the source asserts on a specific product.',
    },
    { type: 'cta_block', heading: 'Holding a drawing you cannot source against?', body: 'Send the designation, the bore and the working pressure. We will tell you what genuinely cross-references, what is an approximation worth checking, and what has no counterpart at all.', quoteLabel: 'Check a cross-reference' },
  ],
}

export default ARTICLE
