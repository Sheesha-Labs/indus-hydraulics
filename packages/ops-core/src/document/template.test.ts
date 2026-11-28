import { describe, expect, it } from 'vitest'
import * as F from './__fixtures__/inputs'
import { buildDn, buildOa, buildPo, buildQuotation, buildRfq } from './builders'
import { paginate } from './paginate'
import {
  createClientSafeOrderDoc,
  createClientSafeQuotation,
  createSupplierSafePo,
  createSupplierSafeRfq,
} from './safe'
import {
  KIND_BLOCKS,
  KIND_COLUMNS,
  TEMPLATE_KINDS,
  applyTemplate,
  defaultTemplate,
  parseTemplateDefinition,
  templateOptions,
  type TemplateDefinition,
} from './template'
import type { DocBlock, HouseDocument } from './types'

const withBlock = (d: TemplateDefinition, key: string, patch: object): TemplateDefinition => ({
  ...d,
  blocks: d.blocks.map((b) => (b.key === key ? { ...b, ...patch } : b)),
})
const move = (d: TemplateDefinition, key: string, before: string): TemplateDefinition => {
  const b = d.blocks.find((x) => x.key === key)!
  const rest = d.blocks.filter((x) => x.key !== key)
  rest.splice(
    rest.findIndex((x) => x.key === before),
    0,
    b
  )
  return { ...d, blocks: rest }
}
const kinds = (d: HouseDocument) => d.blocks.map((b: DocBlock) => b.t)

describe('template definition (board 57)', () => {
  it.each(TEMPLATE_KINDS)('the default %s template is valid', (kind) => {
    expect(parseTemplateDefinition(kind, defaultTemplate(kind))).toMatchObject({ ok: true })
  })

  it('refuses supplier, cost and margin columns, as columns and as smuggled keys', () => {
    const base = defaultTemplate('quotation')
    for (const col of ['supplier', 'cost', 'margin', 'landed', 'supplierName'])
      expect(
        parseTemplateDefinition('quotation', { ...base, columns: [...base.columns, col] })
      ).toMatchObject({ ok: false })
    expect(parseTemplateDefinition('quotation', { ...base, cost: true })).toMatchObject({
      ok: false,
    })
    expect(
      parseTemplateDefinition('quotation', {
        ...base,
        blocks: base.blocks.map((b) => ({ ...b, settings: { margin: true } })),
      })
    ).toMatchObject({ ok: false })
  })

  it('columns come from the audience: no supplier part number on a quotation, no client code on an RFQ', () => {
    const q = defaultTemplate('quotation')
    expect(
      parseTemplateDefinition('quotation', { ...q, columns: [...q.columns, 'partNo'] })
    ).toEqual({
      ok: false,
      error: '"partNo" is not a column this document can print.',
    })
    const r = defaultTemplate('rfq')
    expect(
      parseTemplateDefinition('rfq', { ...r, columns: [...r.columns, 'clientPartNo'] })
    ).toMatchObject({ ok: false })
    expect(
      parseTemplateDefinition('quotation', { ...q, columns: [...q.columns, 'origin', 'hsCode'] })
    ).toMatchObject({ ok: true })
  })

  it('required blocks and columns cannot be switched off', () => {
    for (const key of ['letterhead', 'header', 'lines', 'totals', 'footer'])
      expect(
        parseTemplateDefinition('oa', withBlock(defaultTemplate('oa'), key, { on: false }))
      ).toMatchObject({ ok: false, error: expect.stringMatching(/cannot be switched off/) })
    const inv = defaultTemplate('invoice')
    expect(
      parseTemplateDefinition('invoice', {
        ...inv,
        columns: inv.columns.filter((c) => c !== 'amount'),
      })
    ).toEqual({ ok: false, error: 'Amount must stay in the line table.' })
  })

  it('supplier kinds have no bank block, and one cannot be added', () => {
    expect(KIND_BLOCKS.rfq).not.toContain('bank')
    expect(KIND_BLOCKS.po).not.toContain('bank')
    const po = defaultTemplate('po')
    const withBank = {
      ...po,
      blocks: [...po.blocks.slice(0, -1), { key: 'bank', on: true }, po.blocks.at(-1)!],
    }
    expect(parseTemplateDefinition('po', withBank)).toEqual({
      ok: false,
      error: 'Supplier PO has no bank details block.',
    })
  })

  it('fixed blocks stay in place; body blocks reorder freely', () => {
    const oa = defaultTemplate('oa')
    expect(parseTemplateDefinition('oa', move(oa, 'footer', 'lines'))).toMatchObject({ ok: false })
    expect(parseTemplateDefinition('oa', move(oa, 'letterhead', 'totals'))).toMatchObject({
      ok: false,
    })
    expect(parseTemplateDefinition('oa', move(oa, 'bank', 'terms'))).toMatchObject({ ok: true })
    const twice = [...oa.blocks.slice(0, -1), oa.blocks[4]!, oa.blocks.at(-1)!]
    expect(parseTemplateDefinition('oa', { ...oa, blocks: twice })).toMatchObject({ ok: false })
  })

  it('packing lists and delivery notes print a fixed table', () => {
    expect(KIND_COLUMNS.dn).toBeNull()
    expect(
      parseTemplateDefinition('dn', { ...defaultTemplate('dn'), columns: ['no'] })
    ).toMatchObject({ ok: false })
  })
})

describe('applyTemplate', () => {
  const oaDef = defaultTemplate('oa')
  const build = (def: TemplateDefinition) =>
    applyTemplate(
      buildOa(createClientSafeOrderDoc(F.OA), {
        ...F.CTX,
        template: { ...F.CTX.template, ...templateOptions('oa', def) },
      }),
      def
    )

  it('the default template leaves the built document as it was', () => {
    const plain = buildOa(createClientSafeOrderDoc(F.OA), F.CTX)
    const out = build(oaDef)
    expect(kinds(out)).toEqual(kinds(plain))
    expect(out.page).toEqual({ size: 'A4' })
  })

  it('reorders the body: bank above terms', () => {
    expect(kinds(build(oaDef))).toEqual(['table', 'totals', 'section', 'terms', 'bank'])
    expect(kinds(build(move(oaDef, 'bank', 'terms')))).toEqual([
      'table',
      'totals',
      'bank',
      'section',
      'terms',
    ])
  })

  it('switches: terms off drops its heading too; disclaimer and signature live in the bank block', () => {
    expect(kinds(build(withBlock(oaDef, 'terms', { on: false })))).toEqual([
      'table',
      'totals',
      'bank',
    ])
    const noDisc = build(
      withBlock(withBlock(oaDef, 'disclaimer', { on: false }), 'signature', { on: false })
    )
    expect(noDisc.blocks.at(-1)).toMatchObject({ t: 'bank', disclaimer: null, sign: false })
    const noBank = build(withBlock(oaDef, 'bank', { on: false }))
    expect(noBank.blocks.slice(-2)).toEqual([
      { t: 'remark', text: 'Material is supplied as offered.' },
      { t: 'sign', lead: 'Best regards,', name: 'Owner Example' },
    ])
  })

  it('parties and subject switch off; the subject prints upper case when set', () => {
    const def = withBlock(oaDef, 'parties', { on: false })
    const out = build(def)
    expect(out.party).toEqual([])
    const dn = buildDn(createClientSafeOrderDoc(F.DELIVERY_NOTE), F.CTX)
    const subj = { ...dn, subject: { text: 'Delivery to site' } }
    expect(applyTemplate(subj, defaultTemplate('dn')).subject?.text).toBe('DELIVERY TO SITE')
    expect(
      applyTemplate(subj, withBlock(defaultTemplate('dn'), 'subject', { on: false })).subject
    ).toBeUndefined()
  })

  it("the delivery note's Received by box is the signature block", () => {
    const dn = buildDn(createClientSafeOrderDoc(F.DELIVERY_NOTE), F.CTX)
    const off = applyTemplate(dn, withBlock(defaultTemplate('dn'), 'signature', { on: false }))
    expect(kinds(off)).toEqual(['table'])
  })

  it('columns: Origin and Client part no. reach the OA and the quotation through the builder', () => {
    const def = {
      ...oaDef,
      columns: ['no', 'description', 'clientPartNo', 'qty', 'origin', 'rate', 'amount'],
    }
    const table = build(def).blocks.find((b) => b.t === 'table') as Extract<
      DocBlock,
      { t: 'table' }
    >
    expect(table.cols).toEqual([
      '#',
      'Item & description',
      'Your code',
      'Qty',
      'Origin',
      'Rate',
      'Amount',
    ])
    const qDef = {
      ...defaultTemplate('quotation'),
      columns: ['no', 'description', 'qty', 'origin', 'amount'],
    }
    const q = buildQuotation(createClientSafeQuotation(F.QUOTATION), {
      ...F.CTX,
      template: templateOptions('quotation', qDef),
    })
    expect(q.items.cols).toEqual(['#', 'Item & description', 'Qty', 'Origin', 'Amount'])
  })

  it('supplier columns: a part-number column on the RFQ, the PO keeps its prices', () => {
    const rDef = {
      ...defaultTemplate('rfq'),
      columns: ['no', 'description', 'partNo', 'qty', 'uom', 'rate'],
    }
    const rfq = buildRfq(createSupplierSafeRfq(F.RFQ), {
      ...F.CTX,
      template: templateOptions('rfq', rDef),
    })
    const t = rfq.blocks[0] as Extract<DocBlock, { t: 'table' }>
    expect(t.cols).toEqual(['#', 'Description', 'Part no.', 'Qty', 'UoM', 'Your price'])
    const po = buildPo(createSupplierSafePo(F.PO), {
      ...F.CTX,
      template: templateOptions('po', defaultTemplate('po')),
    })
    expect((po.blocks[0] as Extract<DocBlock, { t: 'table' }>).cols).toEqual([
      '#',
      'Item & description',
      'Qty',
      'UoM',
      'Rate',
      'Amount',
    ])
  })

  it('the quotation: bank and terms notes switch by block; pending lines print the chosen note', () => {
    const qDef = defaultTemplate('quotation')
    const build = (def: TemplateDefinition) =>
      applyTemplate(
        buildQuotation(createClientSafeQuotation(F.QUOTATION), {
          ...F.CTX,
          template: { ...F.CTX.template, ...templateOptions('quotation', def) },
        }),
        def
      )
    expect(build(qDef).notes.map((n) => n.label)).toEqual([
      'Payment',
      'Delivery',
      'Bank',
      'Disclaimer',
    ])
    expect(build(withBlock(qDef, 'terms', { on: false })).notes.map((n) => n.label)).toEqual([
      'Bank',
      'Disclaimer',
    ])
    expect(build(withBlock(qDef, 'bank', { on: false })).notes.map((n) => n.label)).toEqual([
      'Payment',
      'Delivery',
      'Disclaimer',
    ])
    const tba = build({ ...qDef, pendingLines: 'to_be_advised' })
    expect(tba.items.rows.some((r) => r.cells.some((c) => c.v === 'To be advised'))).toBe(true)
  })

  it('lines on page 1 caps the first page; Letter paper holds fewer rows', () => {
    const q = buildQuotation(createClientSafeQuotation(F.QUOTATION), F.CTX)
    const capped = paginate(
      applyTemplate(q, { ...defaultTemplate('quotation'), linesOnFirstPage: 4 })
    )
    expect(capped[0]!.data.items.rows).toHaveLength(4)
    const many = {
      ...q,
      items: { ...q.items, rows: Array.from({ length: 60 }, () => q.items.rows[0]!) },
    }
    const a4 = paginate(applyTemplate(many, defaultTemplate('quotation')))
    const letter = paginate(
      applyTemplate(many, { ...defaultTemplate('quotation'), pageSize: 'Letter' })
    )
    expect(letter[0]!.data.items.rows.length).toBeLessThan(a4[0]!.data.items.rows.length)
  })
})
