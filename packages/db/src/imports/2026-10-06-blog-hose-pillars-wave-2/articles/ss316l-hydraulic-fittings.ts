import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The 316L stainless fitting range, read from its ten sub-shelves. The decision
 * of whether to use stainless is `when-stainless-is-worth-it`; this is what is
 * in the range and how it differs in use. The metric listings cite ISO 6149-1
 * and DIN 3852-2, which are port standards rather than 24° cone hose-end
 * standards, so no standard is quoted for them.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ss316l-hydraulic-fittings',
  title: '316L stainless hydraulic fittings: what the range covers, and how it behaves differently',
  excerpt:
    'BSP, JIC, ORFS, metric, NPT and NPSM, SAE flanges, standpipes and banjos, all in passivated 316L. What each family covers, the pressure and bolting rules on the flanges, and the galling problem.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T14:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which hydraulic fittings are available in 316L stainless steel?',
      answer:
        'In our range: BSP (60° cone, flat seat and BSPT, G1/8 to G2), JIC 37° (−04 to −32), ORFS (−04 to −16), metric 24° cone (M10 to M42), NPT and NPSM (1/8" to 2"), SAE J518 flanges in Code 61 (to 210 bar) and Code 62 (to 415 bar), DIN 2353 standpipes, banjos, double-hex fittings and hydrowashing parts. All are 316L, passivated rather than plated.',
    },
    {
      type: 'key_takeaways',
      items: [
        '316L is low-carbon, molybdenum-bearing stainless, passivated instead of plated — there is no coating to wear off at the threads.',
        'The range mirrors the carbon steel families: BSP, JIC, ORFS, metric 24°, NPT / NPSM and SAE flanges.',
        'Our stainless SAE flanges are rated to 210 bar in Code 61 with SAE J429 Grade 5 bolts, and 415 bar in Code 62 with Grade 8 bolts.',
        'Stainless threads gall; use an anti-seize on the threads, never on the seat, and make up by turns rather than force.',
        'A stainless fitting can carry a lower rating than its carbon steel equivalent — check the part, not the family.',
      ],
    },
    {
      type: 'lead',
      html: 'Stainless hydraulic fittings are bought for one reason — corrosion — and used in places where plated steel gives up: offshore decks, coastal plant, food and pharmaceutical washdown, chemical service. Our 316L range covers <strong>the same thread families as carbon steel</strong>, so a stainless upgrade rarely means changing the port. What it does change is how the parts are made up, and sometimes what they are rated for.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What is in the range.',
      anchor: 'range',
    },
    {
      type: 'comparison_table',
      caption: 'Our 316L hydraulic fittings',
      columns: ['Family', 'Styles', 'Sizes', 'Standard (listing)'],
      rows: [
        { cells: ['BSP', 'Swivel female 60° cone (± O-ring), flat seat, male 60°, BSPT male; straight, 45°, 90°', 'G1/8 – G2', 'ISO 228-1, ISO 7-1'] },
        { cells: ['JIC 37°', 'Swivel female, male, male with O-ring; straight, 45°, 90° compact', '−04 to −32', 'SAE J514, ISO 8434-2'], highlight: true },
        { cells: ['ORFS', 'Swivel female, double-hex swivel, male; straight, 45°, 90°', '−04 to −16', 'SAE J1453, ISO 8434-3'] },
        { cells: ['Metric 24° cone', 'Female swivel with O-ring, male stud; straight, 45°', 'M10×1 – M42×2', '—'] },
        { cells: ['NPT / NPSM', 'NPT male; NPSM swivel female 60° cone, straight, 45°, 90°', '1/8" – 2"', 'ASME B1.20.1'] },
        { cells: ['SAE J518 flange fittings', 'Code 61 straight, 45°, 90°; Code 62 straight, 45°, 90°', '1/2" – 2"', 'SAE J518, ISO 6162'] },
        { cells: ['SAE flanges for hose', 'Flange, counter-flange, split flange, seal kits', '1/2" – 2"', 'SAE J518, ISO 6162'] },
        { cells: ['Standpipes', 'DIN 2353 24° cone, gas tube, welding, double crimp', 'Tube OD 6 – 42 mm, L and S', 'DIN 2353, ISO 8434-1'] },
        { cells: ['Banjos', 'BSP and metric banjos with bonded seals', 'G1/8 – G3/4; M10 – M22', 'DIN 7642'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Within those families the less common shapes are listed too: metric 24° cone female swivels and male studs, double-hexagon swivel females in BSP, JIC and NPSM, BSP and metric banjos, and the standpipes and nuts made for hydrowashing machines.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Flanges: the bolt grade matters.',
      anchor: 'flanges',
    },
    {
      type: 'paragraph',
      html: 'Our 316L SAE flange fittings follow SAE J518 and ISO 6162. The Code 61 parts are rated up to 210 bar (3,000 psi) and bolted with SAE J429 Grade 5 bolts as a minimum; the Code 62 parts up to 415 bar (6,000 psi) with Grade 8 bolts. The flanges, counter-flanges and split flanges for hose are listed with an L-series rating of 210 bar and an S-series rating of 415 bar, and spare seal kits are sized by flange. The bolt grade is part of the rating: a Code 62 flange on Grade 5 bolts is not a 415 bar joint. The Code 61 / Code 62 distinction itself is covered in <a href="/blog/sae-j518-code-61-code-62-flanges">SAE J518 Code 61 and Code 62</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Galling, and how to avoid it.',
      anchor: 'galling',
    },
    {
      type: 'paragraph',
      html: 'Stainless threads cold-weld under load more readily than plated steel — the two surfaces pick up, the joint seizes during make-up, and both parts can be destroyed. The mitigations are ordinary: a suitable <a href="/c/molykote-pastes">anti-seize paste</a> on the threads and never on the sealing face, correct make-up by turns or flats from finger tight rather than brute force, and not repeatedly assembling and dismantling the same pair. A workshop meeting stainless for the first time should know this before its first seized joint.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the rating of the stainless part.',
      body: 'For a given size and design, a 316L fitting can carry a lower working pressure than its carbon steel counterpart. Substituting by dimension on a high-pressure line can lower the joint\'s rating while feeling like an upgrade.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Mixed metals and where to use it.',
      anchor: 'mixed',
    },
    {
      type: 'paragraph',
      html: 'A stainless fitting screwed into a plated steel port makes a galvanic couple, and in salt air the plated side corrodes faster. Sometimes that is still the right trade; where the exposure is severe, match materials through the joint. The judgement of where stainless earns its cost — and where it is a downgrade — is in <a href="/blog/when-stainless-is-worth-it">when stainless is worth it</a> and <a href="/blog/galvanic-corrosion-in-fittings">galvanic corrosion in fittings</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is 316L better than 304 for hydraulic fittings?',
          answer:
            'For corrosive and chloride-bearing environments, generally yes: 316L contains molybdenum, which improves pitting resistance. Our stainless hydraulic range is 316L throughout.',
        },
        {
          question: 'Are 316L fittings plated?',
          answer:
            'No. They are passivated, leaving the steel\'s own corrosion-resistant oxide layer — there is no coating to wear off at the threads.',
        },
        {
          question: 'What bolts do stainless SAE Code 62 flanges need?',
          answer:
            'Our listings specify SAE J429 Grade 8 bolts for Code 62 (to 415 bar) and Grade 5 minimum for Code 61 (to 210 bar).',
        },
        {
          question: 'Why do stainless fittings seize during assembly?',
          answer:
            'Galling: stainless surfaces cold-weld under load. Use anti-seize on the threads, make up by turns rather than force, and avoid repeated assembly of the same pair.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: '316L hydraulic fittings',
      skus: ['IH-SS-BSP-013', 'IH-SS-JIC-001', 'IH-SS-ORFS-005', 'IH-SS-MET-001', 'IH-SS-NPT-001', 'IH-SS-SAE-006', 'IH-SS-SP-006', 'IH-SS-BJ-001'],
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-hydraulic-fittings',
      label: 'Stainless steel hydraulic fittings',
      blurb: 'The full 316L range by family.',
    },
    {
      type: 'category_link',
      slug: 'ss316l-sae-fittings',
      label: '316L SAE flange fittings',
      blurb: 'Code 61 and Code 62 straight, 45° and 90° flange fittings.',
    },
    {
      type: 'category_link',
      slug: 'ss316l-standpipes',
      label: '316L standpipes',
      blurb: 'DIN 2353 24° cone, gas tube, welding and double-crimp standpipes.',
    },

    {
      type: 'cta_block',
      heading: 'Moving a machine to stainless?',
      body: 'Send the fittings it carries now, the pressures and the environment. We will quote the 316L equivalents, confirm their ratings, and flag any joint where stainless is the wrong answer.',
      quoteLabel: 'Quote stainless fittings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Families, styles, sizes, ratings, bolting and standards checked against our 316L fitting listings.',
    },
  ],
}

export default ARTICLE
