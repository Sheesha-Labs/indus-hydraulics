import type { BlogArticleSeed } from '../shared'
import { MOORING_WEIGHT, SHIP_STUD_WEIGHT } from '../charts'

/**
 * Anchor chain weight. Tables are the live listing rows (../charts.ts). The ship anchor chain listing
 * follows a stockist's "weight for stud link anchor chain" sheet (kg/m and kg per 27.5 m); the mooring
 * chain listing's kg/m follows the same stockist's "weight for stud link and studless chain" sheet.
 * The two sheets disagree by about 5–7% (76 mm: 135 vs 126 kg/m) — said so in the article. The
 * 0.0219 d² / 0.020 d² approximations are our fit to the second sheet (no source prints a formula).
 * Fitting weights from the first sheet's per-piece columns.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-weight-chart',
  title: 'Anchor chain weight per metre and per shot: stud link and studless, 12.5 to 178 mm',
  excerpt:
    'How much anchor and mooring chain weighs: kilograms per metre and per 27.5 m shot for stud link and studless chain, the number of links in a shot, what the shackles and swivels weigh, a simple formula for any size, and why two published weight tables differ.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Chain Weight per Metre and Shot',
  seoDescription:
    'Anchor chain weight chart: kg per metre and per 27.5 m shot for stud link and studless chain from 12.5 to 178 mm, links per shot and a quick formula.',
  focusKeyword: 'anchor chain weight',
  publishedAt: '2026-11-08T09:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Stud link chain weighs roughly 0.0219 × d² kg per metre, with d in mm: 76 mm chain is about 126 kg/m, or 3.5 t per 27.5 m shot.',
        'Studless chain is about 0.020 × d² kg/m — some 8 to 9% lighter than stud link of the same size.',
        'Weight rises with the square of the diameter: doubling the size from 50 to 100 mm takes a shot from about 1.5 t to 6 t.',
        'Published tables differ by 5 to 7%. Use them for planning; use the certificate weight for windlass, locker and transport design.',
        'A shot of 76 mm chain has 89 links; a shot of 50 mm chain has 135.',
      ],
    },
    {
      type: 'lead',
      html: 'Chain weight decides more than shipping cost. It sets the load on the windlass and the deck, the space and strength of the chain locker, how much of a mooring line’s pull is spent holding up its own weight, and how many shots fit on a truck. This page gives the weights we list, size by size, and a formula good enough to estimate any size you need.',
    },
    {
      type: 'figure',
      imageId: '792d1fb9-b027-481f-9a1e-8e88e28eef07',
      caption: 'Stud link chain in a chain yard: a single 27.5 m shot of 76 mm chain weighs about three and a half tonnes.',
      aspectRatio: '16/9',
    },
    {
      type: 'direct_answer',
      question: 'How much does anchor chain weigh per metre?',
      answer:
        'Stud link anchor chain weighs about 0.0219 × d² kg/m, with d the diameter in mm: 32 mm about 22 kg/m, 50 mm about 55 kg/m, 76 mm about 126 kg/m and 102 mm about 228 kg/m. A 27.5 m shot weighs 27.5 times that. Studless chain is about 8 to 9% lighter.',
    },

    { type: 'section_head', number: '/01', title: 'Stud link and studless chain, kg per metre.', anchor: 'per-metre' },
    {
      type: 'paragraph',
      html: 'Weights from our <a href="/p/stud-link-offshore-mooring-chain-grades-orq-r3-r3s-r4-r4s-and-r5">stud link</a> and <a href="/p/studless-offshore-mooring-chain-grades-orq-r3-r3s-r4-r4s-and-r5">studless mooring chain</a> listings. Weight does not depend on grade — a 76 mm R4 link weighs the same as a 76 mm U2 link of the same shape.',
    },
    {
      type: 'comparison_table',
      caption: 'Stud link and studless chain — weight per metre (kg) and links per 27.5 m',
      columns: ['mm', 'inch', 'Stud link kg/m', 'Studless kg/m', 'Links per shot'],
      rows: MOORING_WEIGHT,
    },

    { type: 'section_head', number: '/02', title: 'Ship anchor chain, kg per shot.', anchor: 'per-shot' },
    {
      type: 'paragraph',
      html: 'Weights per 27.5 m length from our <a href="/p/stud-link-anchor-chain-grades-u1-u2-and-u3">stud link anchor chain</a> listing, which follows a different published table — note the 5 to 7% difference from the table above (135 against 126 kg/m at 76 mm). Neither is wrong: link shape and stud design vary between mills, and makers say their tabled weights may vary between models.',
    },
    {
      type: 'comparison_table',
      caption: 'Stud link anchor chain, grades U1–U3 — weight per metre and per 27.5 m shot (kg)',
      columns: ['mm', 'inch', 'kg/m', 'kg per shot', 'Links per shot'],
      rows: SHIP_STUD_WEIGHT,
    },

    { type: 'section_head', number: '/03', title: 'A formula for any size.', anchor: 'formula' },
    {
      type: 'callout',
      tone: 'note',
      title: 'Estimating chain weight.',
      body: 'Stud link: W ≈ 0.0219 × d² kg/m. Studless: W ≈ 0.020 × d² kg/m. Per shot, multiply by 27.5. Example: 64 mm stud link is 0.0219 × 4,096 ≈ 90 kg/m, or about 2.5 t per shot. These are our fit to a published table and match it closely from about 40 mm upward; they run a little light on the heavier tables.',
    },

    { type: 'section_head', number: '/04', title: 'Fittings add weight.', anchor: 'fittings' },
    {
      type: 'comparison_table',
      caption: 'Approximate weight per piece (kg), from a published fitting table',
      columns: ['Chain', 'Common link', 'End link', 'Kenter shackle', 'Anchor shackle', 'Swivel forerunner'],
      rows: [
        { cells: ['22 mm', '0.93', '1.28', '1.6', '4.0', '8.21'] },
        { cells: ['50 mm', '11', '17', '18', '41', '115'] },
        { cells: ['76 mm', '39', '59', '58', '141', '392'] },
        { cells: ['100 mm', '88', '130', '150', '335', '827'] },
        { cells: ['162 mm', '375', '560', '660', '1,450', '3,635'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'A Kenter shackle weighs about the same as an end link, and a complete <a href="/p/swivel-forerunner-anchor-chain-grades-u2-and-u3">swivel forerunner</a> about ten common links. For a full cable, add one <a href="/p/kenter-shackle-grades-u2-and-u3">Kenter shackle</a> per shot, the forerunner and the anchor shackle to the chain weight. How the cable is put together is in <a href="/blog/anchor-chain-cable-arrangement">the arrangement of a chain cable</a>, and the space it takes in <a href="/blog/chain-locker-volume">chain locker volume</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much does a shot of anchor chain weigh?', answer: 'About 27.5 × 0.0219 × d² kg for stud link chain: roughly 1.5 t at 50 mm, 3.5 t at 76 mm and 6.3 t at 102 mm.' },
        { question: 'Does a higher grade weigh more?', answer: 'No. Weight depends on diameter and link shape, not grade. A higher grade carries more at the same weight.' },
        { question: 'How many links are in a shot of chain?', answer: 'It depends on size: 89 links at 76 mm, 135 at 50 mm, 43 at 162 mm.' },
        { question: 'Why do weight tables disagree?', answer: 'Link proportions and stud design vary between mills, so published tables differ by a few percent. Use the certificate weight for design.' },
        { question: 'How much lighter is studless chain?', answer: 'About 8 to 9% at the same diameter.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Chain and fittings',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-MR-MC-SL', 'IH-MR-MC-SS', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-SFACGU2U3'],
    },
    { type: 'category_link', slug: 'anchor-chain', label: 'Anchor chain', blurb: 'Stud link and studless ship anchor chain, grades U1 to U3.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-size-chart', 'chain-locker-volume', 'stud-link-vs-studless-chain', 'anchor-chain-cable-arrangement'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Weights from our live listings, which follow two published weight tables that differ by 5–7%; the formula is our fit. Tabled weights are approximate — the certificate governs.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a chain delivery?',
      body: 'Send the size, grade and number of shots. We will quote the chain with weights and packing for transport.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
