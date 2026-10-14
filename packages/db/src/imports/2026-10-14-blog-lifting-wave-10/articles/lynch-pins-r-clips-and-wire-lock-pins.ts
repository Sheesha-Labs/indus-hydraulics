import type { BlogArticleSeed } from '../shared'

/**
 * Retaining pins. Facts from our own listings (definitions, materials, no WLL published). Checked
 * 2026-10-14: a maker's warnings — if designed for a cotter pin it shall be used; bolt-type shackles
 * always with nut and cotter (high); repeated lifts → split pin on bolt-type shackles (second maker,
 * high); lynch pins marked "not for lifting applications" by a lifting supplier (medium). No load
 * rating for wire lock / R-clip pins found either way — stated as "not load-rated" from our listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lynch-pins-r-clips-and-wire-lock-pins',
  title: 'Lynch pins, R-clips, hitch pins and wire lock pins: retaining pins, not lifting points',
  excerpt:
    'The small pins that hold bigger pins in place — lynch pins, R-clips, wire lock pins, hitch pins and cotters — keep trailers hitched, shackle bolts captive and machinery assembled. What each one is, where it belongs, and why none of them is a load-rated lifting component.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lynch Pin vs R-Clip vs Wire Lock Pin: Retaining Pins Explained',
  seoDescription:
    'Lynch pins, R-clips, hitch pins, wire lock pins and cotter pins explained: how each retains a pin, where to use them, galvanised vs stainless, and why retaining pins are never used as load-bearing lifting parts.',
  focusKeyword: 'lynch pin vs r clip',
  publishedAt: '2026-10-14T10:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Retaining pins stop a load-bearing pin or bolt from working loose — they do not carry the load.',
        'A lynch pin has a spring ring; an R-clip is a single piece of spring wire; a wire lock pin has a locking wire that swings over the end.',
        'Hitch pins carry towing and machinery loads and are retained by a lynch pin, R-clip or wire lock pin.',
        'On bolt-type shackles, fit the nut and its cotter every time.',
        'None of these pins is load-rated for lifting; we publish dimensions, not WLLs, for them.',
      ],
    },
    {
      type: 'lead',
      html: 'Every pinned joint on a trailer hitch, a three-point linkage or a bolt-type shackle depends on something small to keep the pin in. Lose the retainer and the pin walks out. These parts are cheap and easy to overlook — which is why the right one, fitted every time, matters. This guide explains the family and draws the line between a retaining pin and a lifting component.',
    },

    { type: 'section_head', number: '/01', title: 'The family.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Retaining pins and what they do',
      columns: ['Pin', 'How it retains', 'Typical use'],
      rows: [
        { cells: ['Lynch pin', 'A spring ring snaps over the end of the pin it retains', 'Hitch pins, axles, linkage pins'] },
        { cells: ['R-clip (coil tension or snap pin)', 'A single spring wire clips through a cross-hole and over the pin', 'Clevis and hitch pins, quick removal'] },
        { cells: ['Wire lock pin', 'A locking wire swings over the pin end so it cannot shake out', 'Pins under vibration'], highlight: true },
        { cells: ['Hitch pin (straight or bent)', 'The load pin itself, retained by one of the above', 'Towing, trailers, implements'] },
        { cells: ['Cotter (split) pin', 'Bent ends through a cross-hole', 'Shackle nuts, castellated nuts'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a lynch pin and an R-clip?',
      answer:
        'A lynch pin has a spring ring that snaps over the end of the pin it retains; an R-clip is a single piece of spring wire that clips through a cross-hole and over the pin. Both fit and remove quickly. A wire lock pin adds a wire that swings over the end, so it cannot shake out under vibration.',
    },

    { type: 'section_head', number: '/02', title: 'On lifting gear.', anchor: 'lifting' },
    {
      type: 'paragraph',
      html: 'In lifting, retainers have one job: to keep the load pin where it belongs. A bolt-type shackle is used with its nut <em>and</em> cotter pin — makers state that where a part is designed for a cotter, it must be fitted, and their rule for bolt-type shackles is to always use the nut and cotter. Replace a lost cotter with one of the right size, never with wire or a nail. See <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a> and <a href="/blog/g-209-vs-g-2130-vs-g-213-shackle">G-209 vs G-2130 vs G-213</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Not a lifting point.',
      body: 'Never lift on a hitch pin, lynch pin, R-clip or wire lock pin, or use one in place of a shackle pin. These are retaining or machinery pins, not load-rated lifting components. Our listings give their dimensions only, with no working load limit.',
    },

    { type: 'section_head', number: '/03', title: 'Material and finish.', anchor: 'material' },
    {
      type: 'paragraph',
      html: 'Our retaining pins are carbon steel with an electro-galvanised (zinc-plated) finish, with stainless steel versions in AISI 304 or 316 for marine and washdown use. Galvanised pins are cheap and easily replaced; stainless resists corrosion where pins sit in salt air. See <a href="/blog/stainless-vs-galvanized-rigging-gulf">stainless vs galvanized rigging in the Gulf</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a wire lock pin used for?', answer: 'To retain a pin where vibration could shake a clip loose — the locking wire swings over the end and holds it.' },
        { question: 'Can a hitch pin be used for lifting?', answer: 'No. Hitch pins are towing and machinery pins, not load-rated lifting components.' },
        { question: 'Do bolt-type shackles need a cotter pin?', answer: 'Yes. Use the nut and cotter pin every time.' },
        { question: 'What sizes do wire lock pins come in?', answer: 'Our galvanised and stainless wire lock pins each come in 72 sizes, listed with dimensions.' },
        { question: 'Galvanised or stainless?', answer: 'Galvanised for general use; stainless (304 or 316) where pins sit in salt air or washdown.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Retaining and hitch pins',
      skus: ['IH-LR-RP-WLPG', 'IH-LR-RP-WLPSS', 'IH-LR-RP-LP', 'IH-LR-RP-CTSP', 'IH-LR-RP-BHP', 'IH-LR-RP-ZPHPLPC'],
    },
    {
      type: 'category_link',
      slug: 'rigging-pins',
      label: 'Rigging pins',
      blurb: 'Lynch pins, R-clips, hitch pins and wire lock pins.',
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
      slugs: ['how-to-rig-a-shackle-correctly', 'g-209-vs-g-2130-vs-g-213-shackle', 'snap-hooks-and-quick-links', 'stainless-vs-galvanized-rigging-gulf', 'commercial-grade-vs-lifting-grade-shackles'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Pin types, materials and sizes from the live Indus listings; cotter-pin rules from shackle makers’ published warnings.',
    },
    {
      type: 'cta_block',
      heading: 'Stocking the store?',
      body: 'Send the pin types and sizes. Retaining pins quote alongside your rigging order.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
