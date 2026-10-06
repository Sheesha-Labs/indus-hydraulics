/**
 * Catalogue links for the articles that had none.
 *
 * On 2026-10-05, 26 published articles linked to no product and no category:
 * all seven GCC-compliance pieces, most of the fittings-buying series and six
 * failure-analysis posts — the posts with the most commercial intent, sending
 * it nowhere. Each now gets what the rest of the blog already carries:
 *
 *   - `category_link` blocks after the FAQ, which also feed the shelf pages'
 *     "Written about this range" lists through `syncBlogPostLinks`;
 *   - a `product_embed` before the FAQ where the article names a product;
 *   - a few links inside the prose, on words the article already uses.
 *
 * Phrases are matched exactly as they appear in the article; a phrase that is
 * not found fails the run rather than being skipped. Every SKU, category and
 * article named here is checked against the live tables before anything is
 * written.
 *
 * Three leads also lose a sentence that an earlier keyword pass duplicated —
 * see `DEDUPES`.
 */

export type InlineLink = { phrase: string; href: string }

export type PostLinkPlan = {
  inline: InlineLink[]
  embed?: { heading: string; skus: string[]; note?: string }
  categories: Array<{ slug: string; label: string; blurb: string }>
}

const ADAPTERS = {
  slug: 'hydraulic-adapters',
  label: 'Hydraulic adapters',
  blurb: 'JIC, ORFS, BSP, metric, NPT and SAE flange adapters, stocked in Dubai.',
}
const HOSE_FITTINGS = {
  slug: 'hydraulic-fittings',
  label: 'Hose fittings',
  blurb: 'Crimp ends by thread family — BSP, JIC, ORFS, metric and NPT/SAE.',
}
const HYDRAULIC_HOSE = {
  slug: 'hydraulic-hoses',
  label: 'Hydraulic hose',
  blurb: 'Bulk hose and made-up assemblies, by construction standard.',
}
const INDUSTRIAL_HOSE = {
  slug: 'industrial-hose-suppliers-uae',
  label: 'Industrial hose',
  blurb: 'Suction, delivery, chemical, steam and air hose, with couplings.',
}
const STAINLESS = {
  slug: 'stainless-steel-hydraulic-fittings',
  label: 'SS316L hydraulic fittings',
  blurb: 'JIC, BSP, ORFS, metric and SAE ends in 316L stainless, for matched-material joints.',
}

export const POST_LINK_PLANS: Record<string, PostLinkPlan> = {
  'air-or-sea-for-a-fittings-order': {
    inline: [
      { phrase: 'a pallet of hose', href: '/c/hydraulic-hoses' },
      { phrase: 'a bag of adapters', href: '/c/hydraulic-adapters' },
    ],
    categories: [ADAPTERS, HOSE_FITTINGS],
  },
  // The "clamps" in this hydraulic order are not the industrial hose clamps
  // that shelf holds; that link was removed by 2026-10-06-listing-data-fixes.
  'certificate-of-origin-gcc-duty': {
    inline: [{ phrase: 'adapters', href: '/c/hydraulic-adapters' }],
    categories: [HYDRAULIC_HOSE, INDUSTRIAL_HOSE],
  },
  'consolidating-fittings-with-a-hose-order': {
    inline: [
      { phrase: 'a pallet of hose', href: '/c/hydraulic-hoses' },
      { phrase: 'the adapters it needs', href: '/c/hydraulic-adapters' },
    ],
    embed: {
      heading: 'Hose ends that ship with an assembly order',
      skus: ['IH-BSP-FEM-60-90', 'IH-JIC-FEM-37', 'IH-ORFS-FEM', 'IH-MF-FEM-74-90'],
    },
    categories: [
      { ...HYDRAULIC_HOSE, blurb: 'Bulk hose and made-up assemblies to travel with the fittings.' },
      ADAPTERS,
    ],
  },
  'crimping-on-site-or-adapting': {
    inline: [{ phrase: 'made-up assembly', href: '/c/hydraulic-hoses' }],
    embed: {
      heading: 'Ferrules matched to the hose they crimp onto',
      skus: ['IH-CF-NS-1SN2SN', 'IH-CF-NS-R2T2SN', 'IH-CF-SK-4SP', 'IH-CF-SK-4SH-1016'],
      note: 'A ferrule belongs to one hose construction. Mixing a ferrule, fitting and hose that were never qualified together is the risk the callout above describes.',
    },
    categories: [
      {
        slug: 'crimp-ferrules',
        label: 'Crimp ferrules',
        blurb: 'Skive and no-skive ferrules, listed by the hose construction they suit.',
      },
      { ...ADAPTERS, blurb: 'For the adapting route: JIC, ORFS, BSP and metric adapters.' },
    ],
  },
  'cross-referencing-a-fitting-part-number': {
    inline: [{ phrase: 'Two adapters with identical threads and seats', href: '/c/hydraulic-adapters' }],
    categories: [
      ADAPTERS,
      { ...HOSE_FITTINGS, blurb: 'Crimp ends identified from measurements, not from a part number alone.' },
    ],
  },
  'damaged-port-repair-or-scrap': {
    inline: [{ phrase: 'an adapter that can be replaced on its own', href: '/c/hydraulic-adapters' }],
    categories: [
      { ...ADAPTERS, label: 'Port adapters', blurb: 'Replace the adapter, not the block — JIC, ORFS, BSP and metric.' },
      {
        slug: 'sae-flange-adapters',
        label: 'SAE flange adapters',
        blurb: 'L-series (3,000 psi) and S-series (6,000 psi) flange connections.',
      },
    ],
  },
  'dirt-ingress-in-transit-and-storage': {
    inline: [{ phrase: 'an assembly without caps', href: '/c/hydraulic-hoses' }],
    categories: [HYDRAULIC_HOSE, HOSE_FITTINGS],
  },
  'galvanic-corrosion-in-fittings': {
    inline: [{ phrase: 'Match materials through the joint', href: '/c/stainless-steel-hydraulic-fittings' }],
    embed: {
      heading: '316L stainless ends for matched-material joints',
      skus: ['IH-SS-JIC-001', 'IH-SS-BSP-013', 'IH-SS-ORFS-005'],
      note: 'A stainless end belongs in a stainless or compatible port. Fitted alone into a plated system it moves the corrosion rather than ending it.',
    },
    categories: [STAINLESS],
  },
  'gcc-import-documents-for-hose': {
    inline: [{ phrase: 'proof-test certificates', href: '/blog/hose-assembly-test-certificate' }],
    categories: [HYDRAULIC_HOSE, INDUSTRIAL_HOSE],
  },
  'gulf-conformity-mark-hose-fittings': {
    inline: [
      { phrase: 'proof-test certificate', href: '/blog/hose-assembly-test-certificate' },
      { phrase: 'material certificates', href: '/blog/material-test-certificate-en-10204' },
    ],
    categories: [HYDRAULIC_HOSE, HOSE_FITTINGS],
  },
  'hose-assembly-test-certificate': {
    inline: [
      { phrase: 'Traceability', href: '/blog/verifying-a-genuine-hydraulic-hose' },
      { phrase: 'Assemblies leaving Dubai', href: '/c/hydraulic-hoses' },
    ],
    embed: {
      heading: 'Constructions we assemble',
      skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-4SP', 'IH-HOSE-4SH', 'IH-HOSE-R13'],
    },
    categories: [{ ...HYDRAULIC_HOSE, blurb: 'Assemblies crimped, pressure-tested and tagged in Dubai.' }],
  },
  'inspecting-fittings-on-arrival': {
    inline: [
      { phrase: 'buying fittings against a stated rating', href: '/c/hydraulic-fittings' },
      { phrase: 'loose adapters', href: '/c/hydraulic-adapters' },
    ],
    categories: [HOSE_FITTINGS, ADAPTERS],
  },
  'measuring-a-fitting-without-gauges': {
    inline: [],
    categories: [
      { slug: 'jic-37-hose-fittings', label: 'JIC 37° fittings', blurb: '37° flare seat on UN/UNF threads.' },
      { slug: 'bsp-hose-fittings', label: 'BSP fittings', blurb: '60° cone, flat-seat and multiseal BSP ends.' },
      {
        slug: 'metric-hose-fittings',
        label: 'Metric fittings',
        blurb: '60° cone, 74° cone, flat-seat and multiseal metric ends.',
      },
      { slug: 'orfs-hose-fittings', label: 'ORFS fittings', blurb: 'Flat face with an O-ring, on UN threads.' },
    ],
  },
  'nace-mr0175-hose-documentation': {
    inline: [{ phrase: 'sour-service items', href: '/c/oil-gas-hoses' }],
    embed: {
      heading: 'Oilfield hose in this service range',
      skus: ['IH-OG-DRL-006', 'IH-OG-WCT-001', 'IH-OG-WCT-002'],
      note: 'Sour-service suitability is confirmed against your fluid data, not assumed from a catalogue listing — see the callouts above.',
    },
    categories: [
      {
        slug: 'oil-gas-hoses',
        label: 'Oil & gas hose',
        blurb: 'Drilling, well-control and well-service hose, documented for the service it enters.',
      },
      {
        slug: 'well-control-hoses',
        label: 'Well control hose (API 16C)',
        blurb: 'Choke and kill lines and BOP control hose.',
      },
    ],
  },
  'over-tightened-fitting-diagnosis': {
    inline: [
      { phrase: 'the existing article on make-up', href: '/blog/hydraulic-fitting-make-up-torque' },
      { phrase: 'a cone, a flat face or an O-ring', href: '/c/hydraulic-fittings' },
    ],
    categories: [
      { ...ADAPTERS, label: 'Replacement adapters', blurb: 'For the joint past saving — JIC, ORFS, BSP and metric adapters.' },
      HOSE_FITTINGS,
    ],
  },
  'reading-a-weeping-joint': {
    inline: [{ phrase: 'flats-from-finger-tight method', href: '/blog/hydraulic-fitting-make-up-torque' }],
    categories: [
      HOSE_FITTINGS,
      {
        slug: 'orfs-hose-fittings',
        label: 'ORFS fittings',
        blurb: 'O-ring face seal ends, where the O-ring is the first thing to inspect.',
      },
    ],
  },
  'reusing-fittings-in-a-rebuild': {
    inline: [{ phrase: 'hold the common ends in stock', href: '/c/hydraulic-fittings' }],
    categories: [{ ...HOSE_FITTINGS, label: 'Hose ends', blurb: 'The common ends worth holding in stock, by thread family.' }, ADAPTERS],
  },
  'saber-certificate-for-hydraulic-hose': {
    inline: [
      { phrase: 'a bulk hose', href: '/c/hydraulic-hoses' },
      { phrase: 'a quick coupler', href: '/c/quick-couplers' },
    ],
    categories: [
      { ...HYDRAULIC_HOSE, blurb: 'Bulk hose and assemblies for Saudi consignments, with part numbers at quotation.' },
    ],
  },
  'sealant-on-hydraulic-threads': {
    inline: [{ phrase: 'on a taper', href: '/c/npt-adapters' }],
    categories: [
      { slug: 'npt-adapters', label: 'NPT adapters', blurb: 'Tapered NPT ends — the family where a thread sealant belongs.' },
      { slug: 'orfs-hose-fittings', label: 'ORFS fittings', blurb: 'Face-seal ends that seal on an O-ring, never on a sealant.' },
    ],
  },
  'storing-fittings-and-seals-on-site': {
    inline: [],
    categories: [
      { ...HOSE_FITTINGS, blurb: 'Steel ends that store well, by thread family.' },
      ADAPTERS,
    ],
  },
  'substituting-a-fitting-safely': {
    inline: [{ phrase: 'the correct part on the next order', href: '/c/hydraulic-adapters' }],
    categories: [ADAPTERS, HOSE_FITTINGS],
  },
  'vendor-approval-for-hose-supply': {
    inline: [{ phrase: 'a replacement hose', href: '/c/hydraulic-hoses' }],
    categories: [
      { ...HYDRAULIC_HOSE, blurb: 'Named-manufacturer hose, documented for operator regimes.' },
      {
        slug: 'oil-gas-hoses',
        label: 'Oil & gas hose',
        blurb: 'Drilling, well-control (API 16C) and well-service hose.',
      },
    ],
  },
  'verifying-a-genuine-hydraulic-hose': {
    inline: [
      { phrase: 'printed layline', href: '/blog/how-to-read-a-hose-layline' },
      { phrase: 'buy assemblies from whoever will document them', href: '/c/hydraulic-hoses' },
    ],
    embed: {
      heading: 'Constructions we stock',
      skus: ['IH-HOSE-R1-1SN', 'IH-HOSE-R2-2SN', 'IH-HOSE-4SP', 'IH-HOSE-4SH'],
    },
    categories: [{ ...HYDRAULIC_HOSE, blurb: 'Bulk hose by construction standard, layline intact.' }],
  },
  'water-well-drilling-rig-fittings': {
    inline: [
      { phrase: 'Adapters are useful', href: '/c/hydraulic-adapters' },
      { phrase: 'bulk hose and ends', href: '/c/hydraulic-hoses' },
    ],
    embed: {
      heading: 'Hose and ends for a rig spares kit',
      skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-4SP', 'IH-CF-NS-R2T2SN', 'IH-JIC-FEM-37'],
    },
    categories: [HYDRAULIC_HOSE, ADAPTERS],
  },
  'what-to-send-for-a-fittings-quote': {
    inline: [{ phrase: 'a useful cross-check', href: '/blog/cross-referencing-a-fitting-part-number' }],
    categories: [HOSE_FITTINGS, ADAPTERS],
  },
  'why-fittings-seize-in-coastal-air': {
    inline: [{ phrase: 'we have written it separately', href: '/blog/removing-a-seized-hydraulic-fitting' }],
    embed: {
      heading: '316L stainless ends for coastal sites',
      skus: ['IH-SS-JIC-004', 'IH-SS-BSP-002', 'IH-SS-ORFS-002'],
      note: 'Fit them into a stainless or compatible port — one stainless end in a plated system moves the corrosion rather than ending it.',
    },
    categories: [STAINLESS],
  },
}

/**
 * Sentences an earlier keyword pass duplicated in an article's opening.
 * `remove` is deleted once, exactly; `replace` swaps one passage for another.
 */
export const DEDUPES: Record<string, { blockType: 'lead'; remove?: string; replace?: [string, string] }> = {
  'certificate-of-origin-gcc-duty': {
    blockType: 'lead',
    remove:
      'The certificate of origin is the least discussed document on a Gulf consignment and the one most often assumed to be a formality. ',
  },
  'verifying-a-genuine-hydraulic-hose': {
    blockType: 'lead',
    remove: 'Verification is usually discussed as a counterfeiting problem, which makes it sound rare and dramatic. ',
  },
  'fittings-on-american-machines': {
    blockType: 'lead',
    replace: [
      'bring the inch families with them, and they arrive as a group rather than one at a time.',
      'bring the inch families with them.',
    ],
  },
}
