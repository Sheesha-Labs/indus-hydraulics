import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Pillar: choosing and tensioning turnbuckles. Checked 2026-10-14: FF-T-791b types/forms/classes
 * (everyspec PDF; spec cancelled, replaced by ASTM F1145); Crosby turnbuckle catalogue ("in-line
 * pull only", lock nuts, 5:1 design factor, hook-end ratings lower); Green Pin user instructions
 * (in-line only, use locking nuts, never swap end fittings); ASME B30.26 turnbuckle provisions as
 * summarised by a rigging distributor (stated as a summary). Ratings from live size tables.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-choose-and-tension-a-turnbuckle',
  title: 'How to choose and tension a turnbuckle: end fittings, ratings, locking and inspection',
  excerpt:
    'A turnbuckle looks simple — two threads and a body — but the end fittings change its rating by half, an unlocked one can spin itself loose, and it is built for straight pulls only. How to choose the end fittings, body and size, read the rating, tension it properly, lock it, and know when to take it out of service.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Choose and Tension a Turnbuckle (Ratings, Locking)',
  seoDescription:
    'Choosing a turnbuckle: hook, eye, jaw and stub ends and their ratings, open vs closed body, FF-T-791 and ASTM F1145 classes, sizing, tensioning, locking with jam nuts or wire, and inspection and removal criteria.',
  focusKeyword: 'how to tension a turnbuckle',
  publishedAt: '2026-10-14T08:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Turnbuckles are for straight, in-line pulls only — never side loads.',
        'Hook ends are rated well below eye and jaw ends of the same size: in our drop-forged range, 3/4" is 3,000 lb with hooks against 5,200 lb with eyes or jaws.',
        'Size the turnbuckle on its rated load for the end fittings you use, not on the thread size.',
        'Engage the threads fully, tension by turning the body with a spanner on its flats, then lock it — jam nuts or wire — so it cannot back off.',
        'Inspect before use and periodically; take it out of service for bent frames, damaged threads, cracks or missing markings.',
      ],
    },
    {
      type: 'lead',
      html: 'Turnbuckles hold guy wires, brace steel frames, tension cables on facades and shade structures, lash cargo and tune rigging. One right-hand and one left-hand thread let the body draw both ends together, and the same simplicity hides the three ways turnbuckles go wrong: the wrong end fittings for the load, a side pull that bends the frame, and vibration that slowly unwinds an unlocked body. Our guide to <a href="/blog/turnbuckle-types">turnbuckle types</a> covers the shapes; this one covers choosing and using them.',
    },

    { type: 'section_head', number: '/01', title: 'End fittings decide the rating.', anchor: 'end-fittings' },
    {
      type: 'comparison_table',
      caption: 'Drop-forged turnbuckle (US type) — working load limit by end fitting, from our live size table',
      columns: ['Size', 'Eye or jaw ends', 'Hook ends'],
      rows: [
        { cells: ['1/4" × 4"', '500 lb', '400 lb'] },
        { cells: ['5/16" × 4-1/2"', '800 lb', '700 lb'] },
        { cells: ['3/4" × 9"', '5,200 lb', '3,000 lb'], highlight: true },
        { cells: ['1-1/4" × 6"', '15,200 lb', '6,500 lb'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Hooks are quick to attach but open under load; makers rate them well below eyes and jaws, and many sellers say hook-end turnbuckles are not for overhead lifting. <strong>Eyes</strong> take a shackle; <strong>jaws</strong> take a fixed plate or lug; <strong>stub ends</strong> are welded on. US Federal Specification FF-T-791 — now replaced by ASTM F1145 — classes them as eye and eye, hook and hook, hook and eye, jaw and jaw, jaw and eye, and stub ends, in open-body, pipe-body and rigging-body types. See <a href="/blog/din-1480-vs-din-1478-turnbuckle">DIN 1480 vs DIN 1478</a> for the European open and closed bodies.',
    },
    {
      type: 'direct_answer',
      question: 'Which turnbuckle end fitting is strongest?',
      answer:
        'Eye and jaw ends carry the full rating for the size; hook ends are rated lower — in our drop-forged range, a 3/4" turnbuckle is rated 5,200 lb with eyes or jaws and 3,000 lb with hooks. Use eye or jaw ends wherever the connection is permanent, safety-critical or overhead.',
    },

    { type: 'section_head', number: '/02', title: 'Choosing the size.', anchor: 'size' },
    {
      type: 'paragraph',
      html: 'Work out the maximum tension the turnbuckle will see — the design load of the guy, brace or lashing — and choose a turnbuckle whose rated load for <em>your</em> end fittings is at least that. Then check that every other part of the line matches: the wire rope, the clips or ferrules, the thimble and the shackle or anchor at each end. The line is only as strong as its weakest part. For guy wires and cable bracing, see <a href="/blog/turnbuckles-for-guy-wires-and-cable-bracing">turnbuckles for guy wires and cable bracing</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Tensioning.', anchor: 'tensioning' },
    {
      type: 'prose',
      html: '<ol><li><strong>Open it out</strong> to its maximum length before fitting, so there is take-up for tensioning.</li><li><strong>Engage the threads fully.</strong> Each end’s thread should be fully engaged in the body; on closed bodies, inspection holes or marks show engagement.</li><li><strong>Connect in a straight line</strong>, with nothing bearing on the body or pulling it sideways.</li><li><strong>Turn the body</strong> with a spanner on its flats — not by twisting the rope or the end fittings.</li><li><strong>Stop at the design tension</strong>; if the frame starts to bend or deform, release the tension and replace the turnbuckle.</li></ol>',
    },

    { type: 'section_head', number: '/04', title: 'Locking it.', anchor: 'locking' },
    {
      type: 'figure',
      imageId: FIG['fig-turnbuckle-lock'],
      captionPrefix: 'FIG. 01',
      caption: 'Jam nuts tightened against the frame, with a safety wire looped from the anchor to the end fitting: a turnbuckle that cannot back off unnoticed.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'Vibration and wind slowly turn an unlocked turnbuckle. Lock it at final adjustment: tighten <strong>jam (lock) nuts</strong> against the body where fitted, or pass <strong>locking wire</strong> through the body and end fittings, or both. Makers say to always use the locking nuts provided and to keep lock nuts compatible with the end threads; for long-term installations the turnbuckle must be secured permanently. Never replace an end fitting with one not designed for that turnbuckle.',
    },

    { type: 'section_head', number: '/05', title: 'Inspection and removal.', anchor: 'inspection' },
    {
      type: 'paragraph',
      html: 'Inspect visually before use, and periodically — ASME B30.26, as summarised by industry, calls for periodic inspection at least yearly in normal service and more often in severe service. Take a turnbuckle out of service for missing or illegible markings; heat damage or weld spatter; excessive pitting or corrosion; a bent, twisted, stretched, cracked or broken body or end; 10% loss of original dimension; damaged or worn threads; or any unauthorised welding or modification. See <a href="/blog/lifting-gear-rejection-criteria">lifting gear rejection criteria</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can turnbuckles be side loaded?', answer: 'No. Makers rate turnbuckles for straight, in-line pulls only.' },
        { question: 'How do you stop a turnbuckle from loosening?', answer: 'Tighten the jam nuts against the body, pass locking wire through the body and end fittings, or both.' },
        { question: 'How do you tension a turnbuckle?', answer: 'With the threads fully engaged and the line straight, turn the body with a spanner on its flats until the design tension is reached, then lock it.' },
        { question: 'Are hook turnbuckles safe for overhead lifting?', answer: 'Hook ends are rated lower and many sellers say hook-end turnbuckles are not for overhead lifting. Use eye or jaw ends.' },
        { question: 'What replaced FF-T-791?', answer: 'The US federal specification was cancelled and replaced by ASTM F1145.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Rated turnbuckles',
      skus: ['IH-LR-TB-US', 'IH-LR-TB-D1480', 'IH-LR-TB-D1478TG', 'IH-LR-TB-IT', 'IH-LR-TB-GRSCB', 'IH-LR-TB-SSDFTUS', 'IH-LR-TB-RSJJ', 'IH-LR-TB-HLT'],
    },
    {
      type: 'category_link',
      slug: 'turnbuckles-rigging-screws',
      label: 'Turnbuckles and rigging screws',
      blurb: 'Drop-forged, DIN 1480, DIN 1478, Italian and stainless turnbuckles and rigging screws.',
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
      slugs: ['turnbuckle-types', 'din-1480-vs-din-1478-turnbuckle', 'turnbuckles-for-guy-wires-and-cable-bracing', 'commercial-grade-vs-lifting-grade-shackles', 'lifting-gear-rejection-criteria'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'FF-T-791b classes (cancelled; replaced by ASTM F1145); turnbuckle makers’ published warnings; ASME B30.26 as summarised by industry. Ratings from the live Indus size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Need turnbuckles?',
      body: 'Send the end fittings, size or required load, and quantities. We will quote rated turnbuckles with lock nuts and certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
