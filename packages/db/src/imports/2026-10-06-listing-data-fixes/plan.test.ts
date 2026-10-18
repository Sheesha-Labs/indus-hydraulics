import { describe, expect, it } from 'vitest'

import {
  applyText,
  inScope,
  planIsEmpty,
  planProduct,
  rewriteProductHrefs,
  type ProductState,
} from './plan'
import { applyPostFix, mapStrings, unlinkAnchor } from './posts'
import {
  BOP_RINGS,
  FIELD_SETS,
  GUARDS,
  PVC_BEND,
  SLUG_MOVES,
  SPEC_RULES,
  TEXT_RULES,
  VARIANT_RULES,
} from './rules'

const RULES = {
  fieldSets: FIELD_SETS,
  text: TEXT_RULES,
  specs: SPEC_RULES,
  variants: VARIANT_RULES,
}

function product(sku: string, over: Partial<ProductState> = {}): ProductState {
  return {
    sku,
    title: '',
    seoTitle: null,
    seoDescription: null,
    descriptionShort: null,
    descriptionLong: null,
    specs: [],
    faqs: [],
    images: [],
    variants: [],
    ...over,
  }
}

describe('applyText', () => {
  it('replaces every literal occurrence and never expands $ in the replacement', () => {
    expect(applyText('6BX and 6BX', { find: '6BX', replace: '$1' })).toEqual({
      text: '$1 and $1',
      hits: 2,
    })
  })

  it('expands groups for a pattern, and refuses one without the g flag', () => {
    expect(
      applyText('ISO 10380:2012 PSL 3 and ISO 10380 PSL 1', {
        find: /ISO 10380(:2012)? PSL [123]/g,
        replace: 'ISO 10380$1',
      })
    ).toEqual({ text: 'ISO 10380:2012 and ISO 10380', hits: 2 })
    expect(() => applyText('x', { find: /x/, replace: 'y' })).toThrow(/g flag/)
  })
})

describe('the rules as data', () => {
  it('has unique ids', () => {
    const ids = [...FIELD_SETS, ...TEXT_RULES, ...SPEC_RULES, ...VARIANT_RULES].map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses stateless scope and guard patterns, and global find patterns', () => {
    for (const r of [...TEXT_RULES, ...SPEC_RULES, ...VARIANT_RULES, ...GUARDS]) {
      if (r.scope instanceof RegExp) expect(r.scope.global).toBe(false)
    }
    for (const g of GUARDS) expect(g.pattern.global).toBe(false)
    for (const r of TEXT_RULES) if (r.find instanceof RegExp) expect(r.find.global).toBe(true)
  })

  it('names each BOP listing once, and moves each slug once to somewhere new', () => {
    expect(new Set(BOP_RINGS.map((r) => r.sku)).size).toBe(BOP_RINGS.length)
    expect(new Set(SLUG_MOVES.map((m) => m.from)).size).toBe(SLUG_MOVES.length)
    expect(new Set(SLUG_MOVES.map((m) => m.to)).size).toBe(SLUG_MOVES.length)
    for (const m of SLUG_MOVES) {
      expect(m.to).not.toBe(m.from)
      expect(m.to).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('keeps the PVC ranges ordered', () => {
    for (const r of Object.values(PVC_BEND)) expect(r.min).toBeLessThan(r.max)
  })
})

describe('real listing text', () => {
  it('turns a 5K flow iron flange from 6BX into 6B, and passes its guards', () => {
    const p = product('IH-FI-FL-BLIND-5K-CAMERON', {
      title: 'Blind Flange, API 6BX 5K, Standard Service',
      descriptionLong:
        '<li>End A: API 6BX 5K flanged (BX ring groove)</li> sizes: <strong>2-1/16 in, 3-1/16 in, 4-1/16 in, 7-1/16 in</strong>. Hydrostatic test at 1.5× shell pressure on every unit.',
      faqs: [
        {
          id: 'f1',
          question: 'What end connections does this product use?',
          answer:
            'End A: API 6BX 5K flanged (BX ring groove). These are API 6A / 6BX flanged ends — ring-joint gasket (RTJ) sealing on a BX-series ring groove. Studs and nuts to match the API 6BX bolting pattern (BSL stud-and-nut sets are sold separately).',
        },
      ],
    })
    const plan = planProduct(p, RULES)
    expect(plan.fields.title).toBe('Blind Flange, API 6B 5K, Standard Service')
    expect(plan.fields.descriptionLong).toContain('API 6B 5K flanged (R or RX ring groove)')
    expect(plan.fields.descriptionLong).toContain('3-1/8 in')
    expect(plan.fields.descriptionLong).toContain('Hydrostatic shell test to API 6A on every unit.')
    expect(plan.faqUpdates[0]?.answer).toContain(
      'on an R or RX ring groove. Studs and nuts to match the API 6B bolting pattern'
    )
    for (const g of GUARDS.filter((g) => inScope(g.scope, p.sku))) {
      for (const text of plan.after) expect(text).not.toMatch(g.pattern)
    }
  })

  it('gives each BOP stack its own ring and drops the sentence from the control unit', () => {
    const faq = (size: string) =>
      `End connections: API 6A. For ring gasket sizing, Indus supplies BX-152 / BX-154 / BX-155 / BX-158 / BX-160 / BX-169 (sized to ${size}) in soft iron (sweet) or Inconel-625-clad (sour service) — see the BOP Spare Parts category. Ask us.`
    const at = (sku: string, size: string) =>
      planProduct(
        product(sku, {
          faqs: [
            { id: 'f', question: 'What end connections does this unit have?', answer: faq(size) },
          ],
        }),
        RULES
      ).faqUpdates[0]?.answer
    expect(at('IH-BOP-RAM-7-5K-DBL-T20-INDUS', '7-1/16"')).toContain(
      'For ring gasket sizing, the 7-1/16" 5K flanges take R-46 or RX-46 rings, which Indus supplies in soft iron'
    )
    expect(at('IH-BOP-CTRL-K80-11STN-INDUS', 'N/A')).toBe('End connections: API 6A. Ask us.')
  })

  it('explains the material-class suffix as an H2S limit', () => {
    const answer =
      'Material class EE-1.5 per API 6A — this captures both the chemistry (sour-service grading: AA = standard, EE = sour with controlled hardness, HH = severe sour with high-alloy / cladded trim) and operating-temperature class. The "-0.5", "-1.5", and "-HF" suffixes indicate temperature ranges within the EE chemistry — refer to API 6A Table 5 / Table 6 for the exact temperature envelopes.'
    const plan = planProduct(
      product('IH-OFV-GATE-3116-10K-HYD-FC-FMC', {
        faqs: [{ id: 'f', question: 'What does the API 6A material class mean?', answer }],
      }),
      RULES
    )
    expect(plan.faqUpdates[0]?.answer).toMatch(
      /^Material class EE-1\.5 per API 6A — the letters set the materials/
    )
    expect(plan.faqUpdates[0]?.answer).toContain('EE-1.5 means 1.5 psia')
  })

  it('fixes size-table values in the wrong unit or row', () => {
    const ropes = planProduct(
      product('IH-LR-FR-NPRHT', {
        variants: [
          { id: 'a', partNumber: 'IH-LR-FR-NPRHT-85MM', dimensions: { size: '85 mm (200-5/8″)' } },
          { id: 'b', partNumber: 'IH-LR-FR-NPRHT-88MM', dimensions: { size: '88 mm (11″)' } },
        ],
      }),
      RULES
    )
    expect(ropes.variantUpdates).toEqual([
      { id: 'a', partNumber: 'IH-LR-FR-NPRHT-85MM', dimensions: { size: '85 mm (10-5/8″)' } },
    ])

    const bollard = planProduct(
      product('IH-LR-BM-MDBI13795', {
        variants: [
          { id: 'a', partNumber: 'DN150', dimensions: { 'wllT@towing': 10, 'wllKn@towing': 540 } },
          { id: 'b', partNumber: '250B', dimensions: { 'wllT@towing': 22, 'wllKn@towing': 216 } },
        ],
      }),
      RULES
    )
    expect(bollard.variantUpdates).toEqual([
      { id: 'a', partNumber: 'DN150', dimensions: { 'wllT@towing': 10, 'wllKn@towing': 98 } },
    ])

    const fender = planProduct(
      product('IH-LR-MF-PFS', {
        variants: [{ id: 'a', partNumber: 'X', dimensions: { size: '500×1000', proofKg: 145 } }],
      }),
      RULES
    )
    expect(fender.variantUpdates[0]?.dimensions).toEqual({ size: '500×1000' })
  })

  it('rewrites the O-ring page and keeps its FAQ count above the score threshold', () => {
    const plan = planProduct(
      product('IH-AD-HSF-009', {
        descriptionLong: '<p>standard Indus zinc-plated carbon-steel construction.</p>',
        specs: [
          { id: 's1', label: 'Material', value: 'Carbon steel (stainless on request)', unit: null },
          {
            id: 's2',
            label: 'Surface Treatment',
            value: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
            unit: null,
          },
        ],
        faqs: [
          {
            id: 'f',
            question: 'Do I need to crimp this onto a hose?',
            answer: 'No — these are tube / port adapters.',
          },
        ],
      }),
      RULES
    )
    expect(plan.fields.descriptionLong).not.toMatch(/carbon[ -]steel|zinc/i)
    expect(plan.specUpdates).toEqual([
      {
        id: 's1',
        label: 'Material',
        value: 'Elastomer — compound matched to the fluid and temperature',
        unit: null,
        detach: false,
      },
      {
        id: 's2',
        label: 'Flange Codes',
        value: 'SAE J518 Code 61 and Code 62',
        unit: null,
        detach: true,
      },
    ])
    expect(plan.faqReplace?.length).toBeGreaterThanOrEqual(5)
  })

  it('leaves a product no rule names untouched', () => {
    const plan = planProduct(
      product('IH-NOT-NAMED', { title: 'API 6BX 5K', descriptionLong: 'PSL 3 ISO 16028' }),
      RULES
    )
    expect(planIsEmpty(plan)).toBe(true)
  })
})

describe('links', () => {
  it('rewrites a moved product slug only where it ends', () => {
    const moves = [
      {
        from: 'blind-flange-api-6bx-5k-standard-service',
        to: 'blind-flange-api-6b-5k-standard-service',
      },
    ]
    const html =
      '<a href="/p/blind-flange-api-6bx-5k-standard-service">a</a> <a href="/p/blind-flange-api-6bx-5k-standard-service-2">b</a>'
    expect(rewriteProductHrefs(html, moves)).toEqual({
      text: '<a href="/p/blind-flange-api-6b-5k-standard-service">a</a> <a href="/p/blind-flange-api-6bx-5k-standard-service-2">b</a>',
      hits: 1,
    })
  })

  it('unlinks an anchor and retiles a category link', () => {
    expect(
      unlinkAnchor(
        'or <a href="/c/hose-clamps-sleeves-ferrules">clamps</a>.',
        '/c/hose-clamps-sleeves-ferrules',
        'clamps'
      )
    ).toEqual({
      html: 'or clamps.',
      hits: 1,
    })
    const r = applyPostFix(
      [{ type: 'category_link', slug: 'specialty-adapters-couplings', label: 'x', blurb: 'y' }],
      {
        slug: 'p',
        kind: 'tile',
        from: 'specialty-adapters-couplings',
        to: { slug: 'hydraulic-adapters', label: 'Hydraulic adapters', blurb: 'z' },
      }
    )
    expect(r).toEqual({
      blocks: [
        {
          type: 'category_link',
          slug: 'hydraulic-adapters',
          label: 'Hydraulic adapters',
          blurb: 'z',
        },
      ],
      hits: 1,
    })
  })

  it('walks nested JSON strings', () => {
    const r = mapStrings({ a: ['/p/x"', { b: '/p/x"' }], n: 1 }, (s) =>
      applyText(s, { find: '/p/x', replace: '/p/y' })
    )
    expect(r).toEqual({ value: { a: ['/p/y"', { b: '/p/y"' }], n: 1 }, hits: 2 })
  })
})
