import type { BlogArticleSeed } from '../shared'

/**
 * What to send for a rigging hardware quotation. General procurement practice; facts reused from
 * earlier verified waves (pattern numbers, certificates, UAE examination). No claims about lead
 * times or stock levels beyond the site-wide ex-stock statement already used in listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'rigging-hardware-rfq-checklist',
  title: 'Rigging hardware RFQ checklist: what to send for a fast, accurate quote',
  excerpt:
    'A rigging enquiry that says “shackles 1 inch, 50 nos; slings 3 t, 20 nos” will get a quote — but probably not for what the site needs. Pattern, pin, grade, sling type, length, end fittings, certificate and delivery all change the answer. A one-page checklist for contractors’ procurement teams and site stores, with a sample enquiry.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Rigging Hardware RFQ Checklist: What to Send for a Quote',
  seoDescription:
    'What to include in a rigging hardware enquiry: pattern or standard, size and WLL, pin type, sling type, length and end fittings, finish, certificates, third-party inspection, quantities and delivery — with a sample RFQ.',
  focusKeyword: 'rigging equipment quote',
  publishedAt: '2026-10-14T10:24:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'For hardware, give the pattern or standard, body and pin type, and WLL — not just a size.',
        'For slings, give the type, WLL, effective length, end fittings and number of legs.',
        'State the finish, the certificates you need and whether third-party inspection is required before delivery.',
        'Give quantities, required date and delivery point — site, store or camp.',
        'A photo or the item’s markings answers most questions on a replacement.',
      ],
    },
    {
      type: 'lead',
      html: 'Rigging is quoted fast when the enquiry is specific and slowly when it is not. “Shackle 1 inch” could be a 5.5 t commercial shackle, an 8.5 t G-209 or a 12.5 t alloy shackle; “3 t sling 4 m” could be a round sling, a webbing sling or a wire rope sling with any of a dozen end fittings. Each back-and-forth costs a day. This checklist covers what a supplier needs to quote the right item first time.',
    },

    { type: 'section_head', number: '/01', title: 'Hardware: shackles, hooks, links, turnbuckles.', anchor: 'hardware' },
    {
      type: 'comparison_table',
      caption: 'What to send for rigging hardware',
      columns: ['Item', 'What we need', 'Example'],
      rows: [
        { cells: ['Pattern or standard', 'US pattern, BS, DIN, AS or EN', 'G-2130 / AS 2741 Grade S'] },
        { cells: ['Body and pin', 'Anchor or chain; screw, bolt or round pin', 'Anchor, bolt type'] },
        { cells: ['Size and WLL', 'Nominal size and the rating you need', '1" — 8.5 t'], highlight: true },
        { cells: ['Turnbuckle ends', 'Hook, eye, jaw or stub, each end', 'Jaw and eye'] },
        { cells: ['Finish', 'Galvanised, self-coloured, stainless', 'Hot-dip galvanised'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The <a href="/blog/shackle-buying-guide-uae">shackle buying guide</a> and <a href="/blog/how-to-choose-and-tension-a-turnbuckle">turnbuckle guide</a> explain each choice.',
    },

    { type: 'section_head', number: '/02', title: 'Slings.', anchor: 'slings' },
    {
      type: 'comparison_table',
      caption: 'What to send for slings',
      columns: ['Item', 'What we need', 'Example'],
      rows: [
        { cells: ['Type', 'Round, webbing, chain or wire rope', 'Grade 80 chain sling'] },
        { cells: ['WLL', 'Vertical WLL, or the load and angle', '5.3 t, two-leg'] },
        { cells: ['Effective length', 'Bearing point to bearing point', '3 m'] },
        { cells: ['Legs and ends', 'Number of legs; hooks, links, eyes', 'Master link, sling hooks with latches'] },
        { cells: ['Standard', 'EN 1492, EN 818, EN 13414, ASME B30.9', 'EN 818-4'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What information do I need to get a rigging equipment quote?',
      answer:
        'For hardware: the pattern or standard, body and pin type, size and WLL, and finish. For slings: type, WLL, effective length, number of legs and end fittings. For both: quantities, certificates required, any third-party inspection, the required date and the delivery point.',
    },

    { type: 'section_head', number: '/03', title: 'Documents and inspection.', anchor: 'documents' },
    {
      type: 'prose',
      html: '<ul><li><strong>Certificate</strong>: the manufacturer’s test certificate comes as standard with rated items; say if you need anything more, such as a material certificate or a declaration of conformity — see <a href="/blog/lifting-gear-test-certificate">lifting gear test certificates</a>.</li><li><strong>Third-party inspection</strong>: if the site or client requires inspection by an approved third party before delivery or before first use, say so.</li><li><strong>Marking and tagging</strong>: any ID, colour tag or register format your site uses — see the <a href="/blog/lifting-equipment-register-uae">lifting equipment register</a>.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'A sample enquiry.', anchor: 'sample' },
    {
      type: 'paragraph',
      html: '<em>“Project: utilities package, Ruwais. Shackles: G-2130 bolt-type anchor, galvanised — 20 × 1" (8.5 t), 30 × 3/4" (4.75 t). Turnbuckles: drop-forged, jaw and eye, 3/4" × 9", 10 pcs, with lock nuts. Slings: Grade 80 two-leg chain slings, 7 mm, 2 m, master link and sling hooks with latches, 6 pcs; round slings 3 t × 4 m, 20 pcs. Manufacturer’s certificates required; third-party inspection by the site’s approved inspector after delivery. Deliver to site store by 10 November.”</em> That enquiry has everything needed for an accurate first quote.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why do suppliers ask for the shackle pattern?', answer: 'Because the same nominal size carries different ratings in different patterns and grades — for example 5.5 t, 8.5 t or 12.5 t at 1".' },
        { question: 'What is effective length on a sling?', answer: 'The length from bearing point to bearing point — for example from the inside of the master link to the inside of the hook.' },
        { question: 'Do rated items come with certificates?', answer: 'Yes, our rated items ship with the manufacturer’s test certificate.' },
        { question: 'Can you arrange third-party inspection?', answer: 'Tell us your site’s requirement with the enquiry and we will confirm what we can arrange.' },
        { question: 'Can I send a photo instead of specifications?', answer: 'For a replacement, yes — a photo of the item and its markings answers most questions.' },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting and rigging',
      blurb: 'Every shackle, sling, hook, chain and hoist we supply.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['shackle-buying-guide-uae', 'site-mobilisation-rigging-kit', 'lifting-gear-test-certificate', 'lifting-equipment-register-uae', 'types-of-lifting-slings', 'how-to-choose-and-tension-a-turnbuckle'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Checklist reflects what a supplier needs to quote rigging accurately. Ratings in examples from the live Indus size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Ready to send your enquiry?',
      body: 'Use the checklist, attach photos for replacements, and we will come back with a quotation.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
