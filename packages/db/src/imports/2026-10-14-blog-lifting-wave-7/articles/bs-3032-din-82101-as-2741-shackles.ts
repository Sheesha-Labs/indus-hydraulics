import type { BlogArticleSeed } from '../shared'

/**
 * Non-US shackle standards contractors meet in the Gulf. Checked 2026-10-14: BS 3032:1958
 * withdrawn 15 Aug 2001 (superseded by BS 6994, itself withdrawn) — NSAI store; EN 13889 scope
 * (SIS); AS 2741-2002 grades and marking; DIN 82101 scope only (forms NOT described — not
 * verified). Ranges from live listings; our DIN 82101 listing is dimensions-only (rating on request).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bs-3032-din-82101-as-2741-shackles',
  title: 'BS 3032, DIN 82101, AS 2741 and EN 13889 shackles: the non-US standards explained',
  excerpt:
    'Not every shackle on a Gulf project is a US pattern. British-specified jobs ask for BS 3032, marine and shipyard work for DIN 82101, Australian-engineered projects for AS 2741 Grade S, and European lifting gear is made to EN 13889. What each standard covers, which are current, how they are rated and marked, and what to order when a drawing names one of them.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'BS 3032, DIN 82101, AS 2741, EN 13889 Shackles Explained',
  seoDescription:
    'The non-US shackle standards explained: BS 3032 (withdrawn but still specified), DIN 82101 shipbuilding shackles, AS 2741 Grade S and M, and EN 13889 grade 6 — scope, ratings, marking and how to order against each.',
  focusKeyword: 'bs 3032 shackle',
  publishedAt: '2026-10-14T08:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'BS 3032 was withdrawn in 2001 but is still written on drawings; shackles are still made and sold to its pattern.',
        'DIN 82101 is a German shipbuilding standard for dee shackles used in lifting, towing and lashing.',
        'AS 2741 covers forged shackles in Grade M (4) and Grade S (6), marked with maker, grade, WLL and a certificate identifier.',
        'EN 13889 covers forged grade 6 dee and bow shackles from 0.5 t to 25 t with threaded pins.',
        'When a drawing names a standard, order to it — and ask for the certificate to state it.',
      ],
    },
    {
      type: 'lead',
      html: 'Gulf projects are designed in London, Hamburg, Perth and Houston, and the drawings carry each office’s habits. A rigging schedule from a British consultant asks for BS 3032 shackles; a shipyard specification names DIN 82101; an Australian-designed plant calls for AS 2741 Grade S; European lifting gear arrives marked EN 13889. They are not interchangeable with US patterns by size, and one of them is not even a current standard. This guide sorts them out. For the US patterns, see <a href="/blog/g-209-vs-g-2130-vs-g-213-shackle">G-209, G-2130 and G-213</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The four standards at a glance.', anchor: 'overview' },
    {
      type: 'comparison_table',
      caption: 'Non-US shackle standards',
      columns: ['Standard', 'Status and scope', 'Our range'],
      rows: [
        { cells: ['BS 3032 (UK)', 'Higher-tensile steel shackles; withdrawn 2001, still specified', 'Large bow and small dee, screw collar pin, 0.25–10.75 t'] },
        { cells: ['DIN 82101 (Germany)', 'Dee shackles for shipbuilding: lifting, towing, lashing', 'Galvanised, M4 to M140 body sizes; rating on request'] },
        { cells: ['AS 2741 (Australia)', 'Forged shackles, Grade M (4) and Grade S (6)', 'Grade S, screw pin 0.33–55 t; safety pin 2–150 t'], highlight: true },
        { cells: ['EN 13889 (Europe)', 'Forged grade 6 dee and bow shackles, 0.5–25 t, threaded pins', 'European large bow and dee shackles'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'BS 3032: withdrawn, still specified.', anchor: 'bs-3032' },
    {
      type: 'paragraph',
      html: 'BS 3032 (1958) covered higher-tensile steel shackles. It was withdrawn in 2001, and its listed successor, BS 6994, was withdrawn too. Yet “BS 3032” still appears on British-origin rigging schedules and maintenance lists, and shackles are still made to its dimensions and ratings — usually with a screw collar pin, in large-bow and small-dee forms. When you order one, you are buying to a pattern rather than to a current standard: make sure the shackle is marked with its WLL and comes with a test certificate. Our <a href="/p/bs-3032-shackle-with-screw-collar-pin">BS 3032 shackles</a> run from 0.25 t to 10.75 t.',
    },
    {
      type: 'direct_answer',
      question: 'Is BS 3032 still a current standard?',
      answer:
        'No. BS 3032 was withdrawn in 2001, and the standard listed as its replacement, BS 6994, was also withdrawn. Shackles are still made and sold to the BS 3032 pattern, so treat it as a pattern: check each shackle is marked with its working load limit and supplied with a test certificate.',
    },

    { type: 'section_head', number: '/03', title: 'DIN 82101: shipbuilding shackles.', anchor: 'din-82101' },
    {
      type: 'paragraph',
      html: 'DIN 82101 is a German shipbuilding standard for dee shackles used for lifting, towing and lashing aboard ship and in yards. It defines several forms with different pin arrangements and a long series of body sizes; its ratings depend on form and size, so check the standard or the certificate for the form you order. Our <a href="/p/shackle-din-82101-form-a-b-and-c-pattern-galvanized">galvanised DIN 82101 shackles</a> run from M4 to M140 body sizes, and their load ratings are confirmed on request. For marine use, see <a href="/blog/stainless-vs-galvanized-rigging-gulf">stainless vs galvanised rigging in the Gulf</a>.',
    },

    { type: 'section_head', number: '/04', title: 'AS 2741: Grade S and Grade M.', anchor: 'as-2741' },
    {
      type: 'paragraph',
      html: 'AS 2741 covers forged shackles in two quality grades: Grade M (also called 4) and Grade S (also called 6), the higher-strength grade used for most lifting. It requires each shackle to be marked with the maker’s name or mark, the grade, the working load limit and an identifier that links it to its test certificate. Our Grade S shackles come with <a href="/p/grade-s-shackle-as-2741-screw-pin">screw pins</a> (5–63 mm, 0.33–55 t) and <a href="/p/grade-s-shackle-as-2741-safety-pin">safety pins</a> (13–102 mm, 2–150 t), in bow and dee forms.',
    },

    { type: 'section_head', number: '/05', title: 'EN 13889: the European standard.', anchor: 'en-13889' },
    {
      type: 'paragraph',
      html: 'EN 13889 covers forged steel dee and bow shackles, grade 6, for general lifting, from 0.5 t to 25 t WLL, and applies only to shackles with threaded pins. It is the standard behind much European-made lifting gear. Our <a href="/p/large-bow-shackle-european-type">European large bow</a> and <a href="/p/large-dee-shackle-european-type">large dee</a> shackles, and the <a href="/p/galvanized-shackle-italian-type">Italian-type galvanised shackles</a>, follow European dimensions; check the certificate for the standard each is supplied against.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Same size, different numbers.',
      body: 'A 25 mm AS 2741 Grade S shackle, a 1" G-209 pattern shackle and a European 25 mm shackle are not rated the same. Compare the WLL on each listing’s size table, never the nominal size — see the shackle size and capacity chart.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What replaced BS 3032?', answer: 'It was listed as superseded by BS 6994, which was itself withdrawn in 2001. Shackles are still made to the BS 3032 pattern.' },
        { question: 'What is a DIN 82101 shackle?', answer: 'A dee shackle to the German shipbuilding standard, used for lifting, towing and lashing on ships and in yards.' },
        { question: 'What does Grade S mean on a shackle?', answer: 'The higher-strength quality grade (also called grade 6) in the Australian standard AS 2741; Grade M (grade 4) is the lower.' },
        { question: 'What is EN 13889?', answer: 'The European standard for forged steel grade 6 dee and bow shackles for general lifting, 0.5 t to 25 t, with threaded pins.' },
        { question: 'Can I substitute a G-209 for a BS 3032 shackle?', answer: 'Only if the rigging engineer approves it: dimensions and ratings differ. Order to the standard on the drawing, or ask for an approved equivalent.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Shackles to non-US standards',
      skus: ['IH-LR-SH-B3032SSCP', 'IH-LR-SH-SD82101FB', 'IH-LR-SH-SSA2741SP2', 'IH-LR-SH-SSA2741SP', 'IH-LR-SH-EBOW', 'IH-LR-SH-EDEE', 'IH-LR-SH-IGS', 'IH-LR-SH-JIS'],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'BS 3032, DIN 82101, AS 2741, European, Italian and JIS shackles alongside US patterns.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'marine',
      label: 'Marine and offshore',
      blurb: 'Shipyard and deck rigging hardware.',
    },
    {
      type: 'related_articles',
      slugs: ['g-209-vs-g-2130-vs-g-213-shackle', 'shackle-size-and-capacity-chart', 'shackle-markings-explained', 'shackle-buying-guide-uae', 'stainless-vs-galvanized-rigging-gulf'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Standards status and scope from national standards bodies’ listings (BS 3032, EN 13889, AS 2741, DIN 82101) as of 14 October 2026. Ranges from the live Indus listings.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering to a specific standard?',
      body: 'Send the standard, form or grade, sizes and quantities. We will confirm what can be supplied against it, with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
