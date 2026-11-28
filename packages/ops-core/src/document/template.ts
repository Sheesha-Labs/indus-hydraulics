import { z } from 'zod'
import {
  CLIENT_COLUMNS,
  CLIENT_COLUMN_LABEL,
  DEFAULT_HOUSE_CLIENT_COLUMNS,
  DEFAULT_PO_COLUMNS,
  DEFAULT_QUOTATION_COLUMNS,
  DEFAULT_RFQ_COLUMNS,
  SUPPLIER_COLUMNS,
  SUPPLIER_COLUMN_LABEL,
  type ClientColumn,
  type SupplierColumn,
} from './columns'
import type { DocTemplateOptions } from './builders/common'
import type { DocBlock, DocBodyPart, DocKind, DocumentData, HouseDocument } from './types'

/**
 * Document templates (S11-T05, board 57, ADR-14, ADR-27 point 7). A template is database content: block order
 * and switches, the line-table columns, how many lines page 1 holds and the page size. Settings › Document
 * templates edits a draft and publishes it; the next render uses it, with no deploy. Issued files never change.
 *
 * The column vocabulary is the audience's whitelist from columns.ts and nothing else: the schema is strict and
 * the column lists are enums, so "supplier", "cost" or "margin" cannot be stored even by a crafted request.
 */

export const BLOCK_KEYS = [
  'letterhead',
  'header',
  'parties',
  'subject',
  'lines',
  'totals',
  'terms',
  'bank',
  'disclaimer',
  'signature',
  'footer',
] as const
export type BlockKey = (typeof BLOCK_KEYS)[number]

export const BLOCK_LABEL: Record<BlockKey, string> = {
  letterhead: 'Letterhead',
  header: 'Document header',
  parties: 'Parties',
  subject: 'Subject line',
  lines: 'Line table',
  totals: 'Totals',
  terms: 'Terms & conditions',
  bank: 'Bank details',
  disclaimer: 'Disclaimer',
  signature: 'Signature',
  footer: 'Footer',
}

/** Blocks that cannot be switched off (a document without them is not a document). */
export const REQUIRED_BLOCKS: ReadonlySet<BlockKey> = new Set([
  'letterhead',
  'header',
  'lines',
  'totals',
  'footer',
])

/** Blocks drawn in a fixed place by the layout: the top of page 1, and the running footer. */
export const FIXED_BLOCKS: ReadonlySet<BlockKey> = new Set([
  'letterhead',
  'header',
  'parties',
  'subject',
  'footer',
])

export const TEMPLATE_KINDS: readonly DocKind[] = [
  'quotation',
  'oa',
  'pi',
  'invoice',
  'cn',
  'rfq',
  'po',
  'pl',
  'dn',
]

export const KIND_LABEL: Record<DocKind, string> = {
  quotation: 'Client quotation',
  oa: 'Order acknowledgement',
  pi: 'Proforma invoice',
  invoice: 'Tax invoice',
  cn: 'Credit note',
  rfq: 'Supplier RFQ to supplier',
  po: 'Supplier PO',
  pl: 'Packing list',
  dn: 'Delivery note',
}

/** The kind's number sequence (number_sequence.key); numbering is set in Settings › Numbering (C6). */
export const KIND_SEQUENCE: Record<DocKind, string> = {
  quotation: 'quotation',
  oa: 'order_ack',
  pi: 'proforma',
  invoice: 'tax_invoice',
  cn: 'credit_note',
  rfq: 'supplier_rfq',
  po: 'supplier_po',
  pl: 'packing_list',
  dn: 'delivery_note',
}

export type DocAudience = 'client' | 'supplier'
export const audienceOf = (k: DocKind): DocAudience =>
  k === 'rfq' || k === 'po' ? 'supplier' : 'client'

/**
 * The blocks each kind has, in their default order. The Estimate layout clients already receive (P13) has no
 * subject line; supplier documents carry no bank block; packing lists and delivery notes carry no prices.
 */
export const KIND_BLOCKS: Record<DocKind, readonly BlockKey[]> = {
  quotation: [
    'letterhead',
    'header',
    'parties',
    'lines',
    'totals',
    'terms',
    'bank',
    'disclaimer',
    'signature',
    'footer',
  ],
  oa: BLOCK_KEYS,
  pi: BLOCK_KEYS,
  invoice: BLOCK_KEYS,
  cn: BLOCK_KEYS,
  rfq: BLOCK_KEYS.filter((b) => b !== 'bank' && b !== 'totals'),
  po: BLOCK_KEYS.filter((b) => b !== 'bank'),
  pl: ['letterhead', 'header', 'parties', 'subject', 'lines', 'signature', 'footer'],
  dn: ['letterhead', 'header', 'parties', 'subject', 'lines', 'signature', 'footer'],
}

/** What each block prints, for the editor's second column. */
export function blockHint(kind: DocKind, key: BlockKey): string {
  const supplier = audienceOf(kind) === 'supplier'
  switch (key) {
    case 'letterhead':
      return 'Logo, legal name, TRN, address'
    case 'header':
      return kind === 'quotation'
        ? 'Title, number, date, validity, reference, currency'
        : 'Title, number, date, reference'
    case 'parties':
      return supplier
        ? 'Supplier · From'
        : kind === 'dn'
          ? 'Deliver to · From'
          : 'Bill to · Issued by'
    case 'subject':
      return supplier ? 'Our reference and delivery point' : 'From the enquiry title'
    case 'lines':
      return 'The columns below'
    case 'totals':
      return supplier ? 'Sub total, total' : 'Sub total, VAT 5%, total'
    case 'terms':
      return supplier ? 'What we ask the supplier to quote' : "From the client's preset"
    case 'bank':
      return 'The confirmed bank block for the currency'
    case 'disclaimer':
      return 'Standard order disclaimer'
    case 'signature':
      return kind === 'dn' ? 'Received by: name, signature and stamp, date' : 'Signed-in user'
    case 'footer':
      return 'Document number · title · page n / N'
  }
}

/** Line-table columns per kind: what may be chosen, what must stay, the default. Null: fixed by the layout. */
export interface KindColumns {
  audience: DocAudience
  options: readonly (ClientColumn | SupplierColumn)[]
  required: readonly (ClientColumn | SupplierColumn)[]
  defaults: readonly (ClientColumn | SupplierColumn)[]
}

const clientCols = (defaults: readonly ClientColumn[], required: readonly ClientColumn[]) => ({
  audience: 'client' as const,
  options: CLIENT_COLUMNS,
  required,
  defaults,
})

export const KIND_COLUMNS: Record<DocKind, KindColumns | null> = {
  quotation: clientCols(DEFAULT_QUOTATION_COLUMNS, ['no', 'description', 'qty']),
  oa: clientCols(DEFAULT_HOUSE_CLIENT_COLUMNS, ['no', 'description', 'qty', 'amount']),
  pi: clientCols(DEFAULT_HOUSE_CLIENT_COLUMNS, ['no', 'description', 'qty', 'amount']),
  invoice: clientCols(DEFAULT_HOUSE_CLIENT_COLUMNS, ['no', 'description', 'qty', 'rate', 'amount']),
  cn: clientCols(DEFAULT_HOUSE_CLIENT_COLUMNS, ['no', 'description', 'qty', 'amount']),
  rfq: {
    audience: 'supplier',
    options: SUPPLIER_COLUMNS.filter((c) => c !== 'amount'),
    required: ['no', 'description', 'qty'],
    defaults: DEFAULT_RFQ_COLUMNS,
  },
  po: {
    audience: 'supplier',
    options: SUPPLIER_COLUMNS,
    required: ['no', 'description', 'qty', 'rate', 'amount'],
    defaults: DEFAULT_PO_COLUMNS,
  },
  pl: null,
  dn: null,
}

export function columnLabel(kind: DocKind, c: ClientColumn | SupplierColumn): string {
  if (audienceOf(kind) === 'supplier') {
    if (kind === 'rfq' && c === 'rate') return 'Your price'
    return SUPPLIER_COLUMN_LABEL[c as SupplierColumn]
  }
  if (c === 'clientPartNo') return 'Client part no.'
  if (c === 'delivery') return 'Delivery'
  return CLIENT_COLUMN_LABEL[c as ClientColumn]
}

export const PENDING_LINES = ['price_to_follow', 'to_be_advised'] as const
export type PendingLines = (typeof PENDING_LINES)[number]
export const PENDING_NOTE: Record<PendingLines, string> = {
  price_to_follow: 'Price to follow',
  to_be_advised: 'To be advised',
}

export const PAGE_SIZES = ['A4', 'Letter'] as const
export type PageSize = (typeof PAGE_SIZES)[number]

const ALL_COLUMNS = [...new Set([...CLIENT_COLUMNS, ...SUPPLIER_COLUMNS])] as [string, ...string[]]

const blockSchema = z
  .object({
    key: z.enum(BLOCK_KEYS),
    on: z.boolean(),
    settings: z.object({ upperCase: z.boolean().optional() }).strict().optional(),
  })
  .strict()

/** The stored shape (document_template.definition, with pageSize on its own column). */
export const templateDefinitionSchema = z
  .object({
    blocks: z.array(blockSchema).min(1).max(BLOCK_KEYS.length),
    columns: z.array(z.enum(ALL_COLUMNS)).max(ALL_COLUMNS.length),
    linesOnFirstPage: z.union([z.literal('auto'), z.number().int().min(1).max(40)]),
    pendingLines: z.enum(PENDING_LINES),
    pageSize: z.enum(PAGE_SIZES),
  })
  .strict()

export type TemplateBlock = z.infer<typeof blockSchema>
export type TemplateDefinition = z.infer<typeof templateDefinitionSchema>

/** The definition a kind starts from: every block on in its default order, the default columns. */
export function defaultTemplate(kind: DocKind): TemplateDefinition {
  return {
    blocks: KIND_BLOCKS[kind].map((key) =>
      key === 'subject' ? { key, on: true, settings: { upperCase: true } } : { key, on: true }
    ),
    columns: [...(KIND_COLUMNS[kind]?.defaults ?? [])],
    linesOnFirstPage: 'auto',
    pendingLines: 'price_to_follow',
    pageSize: 'A4',
  }
}

export type TemplateCheck =
  { ok: true; definition: TemplateDefinition } | { ok: false; error: string }

/**
 * Validate a definition for a kind: the strict schema, then the kind's rules. Blocks must be exactly the
 * kind's blocks, each once; required blocks on; the fixed blocks stay in place (top four first, footer
 * last); columns only from the kind's whitelist, required ones present.
 */
export function parseTemplateDefinition(kind: DocKind, input: unknown): TemplateCheck {
  const parsed = templateDefinitionSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const where = issue?.path.length ? ` (${issue.path.join('.')})` : ''
    return { ok: false, error: `This template is not valid${where}.` }
  }
  const d = parsed.data
  const allowed = KIND_BLOCKS[kind]
  const keys = d.blocks.map((b) => b.key)
  if (new Set(keys).size !== keys.length) return { ok: false, error: 'A block appears twice.' }
  const extra = keys.find((k) => !allowed.includes(k))
  if (extra)
    return {
      ok: false,
      error: `${KIND_LABEL[kind]} has no ${BLOCK_LABEL[extra].toLowerCase()} block.`,
    }
  const missing = allowed.find((k) => !keys.includes(k))
  if (missing) return { ok: false, error: `${BLOCK_LABEL[missing]} is missing.` }
  const off = d.blocks.find((b) => REQUIRED_BLOCKS.has(b.key) && !b.on)
  if (off) return { ok: false, error: `${BLOCK_LABEL[off.key]} cannot be switched off.` }
  const fixedOrder = allowed.filter((k) => FIXED_BLOCKS.has(k))
  const actualFixed = keys.filter((k) => FIXED_BLOCKS.has(k))
  if (fixedOrder.join() !== actualFixed.join() || keys.at(-1) !== 'footer')
    return {
      ok: false,
      error: 'The letterhead, header, parties, subject and footer stay in place.',
    }
  const top = fixedOrder.filter((k) => k !== 'footer')
  if (keys.slice(0, top.length).join() !== top.join())
    return {
      ok: false,
      error: 'The letterhead, header, parties, subject and footer stay in place.',
    }

  const cols = KIND_COLUMNS[kind]
  if (!cols) {
    if (d.columns.length) return { ok: false, error: 'This layout prints a fixed line table.' }
  } else {
    const bad = d.columns.find((c) => !(cols.options as readonly string[]).includes(c))
    if (bad) return { ok: false, error: `"${bad}" is not a column this document can print.` }
    if (new Set(d.columns).size !== d.columns.length)
      return { ok: false, error: 'A column appears twice.' }
    const need = cols.required.find((c) => !(d.columns as string[]).includes(c))
    if (need) return { ok: false, error: `${columnLabel(kind, need)} must stay in the line table.` }
  }
  return { ok: true, definition: d }
}

const isOn = (def: TemplateDefinition, key: BlockKey) =>
  def.blocks.find((b) => b.key === key)?.on ?? false

/**
 * What the builders take from a template: the columns and the pending-line note. Block switches are applied
 * afterwards by applyTemplate (so a disclaimer survives the bank block being switched off).
 */
export function templateOptions(kind: DocKind, def: TemplateDefinition): DocTemplateOptions {
  return {
    ...(KIND_COLUMNS[kind] ? { columns: def.columns } : {}),
    pendingNote: PENDING_NOTE[def.pendingLines],
  }
}

/** The template block a house body block belongs to. */
function partOf(blocks: readonly DocBlock[], i: number): DocBodyPart {
  const b = blocks[i]!
  if (b.part) return b.part
  switch (b.t) {
    case 'table':
    case 'slips':
      return 'lines'
    case 'totals':
      return 'totals'
    case 'terms':
      return 'terms'
    case 'bank':
      return 'bank'
    case 'sign':
      return 'signature'
    case 'section': {
      // A numbered heading belongs to what follows it.
      const next = blocks.slice(i + 1).find((x) => x.t !== 'section')
      return next ? partOf(blocks, blocks.indexOf(next)) : 'terms'
    }
    case 'remark':
      return i > 0 ? partOf(blocks, i - 1) : 'lines'
  }
}

const BODY_PARTS: readonly DocBodyPart[] = [
  'lines',
  'totals',
  'terms',
  'bank',
  'disclaimer',
  'signature',
]

/**
 * Apply a template's block order and switches to built DocumentData (columns and the bank switch were
 * applied by the builder through templateOptions). Fixed blocks keep their place; body blocks follow the
 * template's order. The bank block carries the disclaimer and the signature: with the bank off, a disclaimer
 * that is on prints as a remark and a signature that is on prints on its own.
 */
export function applyTemplate<T extends DocumentData>(data: T, def: TemplateDefinition): T {
  const on = (k: BlockKey) => isOn(def, k)
  const page = {
    size: def.pageSize,
    ...(def.linesOnFirstPage === 'auto' ? {} : { firstPageRows: def.linesOnFirstPage }),
  }
  if (data.layout === 'estimate') {
    const notes = data.notes.filter((n) => !n.part || on(n.part))
    return {
      ...data,
      page,
      billTo: on('parties') ? data.billTo : { label: data.billTo.label, name: '', lines: [] },
      notes,
      signer: on('signature') ? data.signer : '',
    }
  }
  const house = data as HouseDocument
  const order = def.blocks.map((b) => b.key as string)
  const rank = (p: DocBodyPart) => {
    const i = order.indexOf(p === 'disclaimer' ? 'bank' : p)
    return i < 0 ? BODY_PARTS.indexOf(p) + 100 : i
  }
  const tagged: { part: DocBodyPart; block: DocBlock; i: number }[] = []
  house.blocks.forEach((b, i) => {
    const part = partOf(house.blocks, i)
    if (b.t === 'bank') {
      const disclaimer = b.disclaimer
      const signature = b.sign
      if (!on('bank')) {
        if (on('disclaimer') && disclaimer)
          tagged.push({ part: 'disclaimer', block: { t: 'remark', text: disclaimer }, i })
        if (on('signature') && signature)
          tagged.push({
            part: 'signature',
            block: { t: 'sign', lead: signature.lead, name: signature.name },
            i,
          })
        return
      }
      tagged.push({
        part,
        block: {
          ...b,
          ...(on('disclaimer') ? {} : { disclaimer: null }),
          ...(on('signature') ? {} : { sign: false }),
        },
        i,
      })
      return
    }
    if (!on(part)) return
    tagged.push({ part, block: b, i })
  })
  const blocks = tagged.sort((a, b) => rank(a.part) - rank(b.part) || a.i - b.i).map((x) => x.block)
  const { subject, ...rest } = house
  const upper = def.blocks.find((b) => b.key === 'subject')?.settings?.upperCase
  return {
    ...rest,
    page,
    party: on('parties') ? house.party : [],
    ...(subject && on('subject')
      ? { subject: upper ? { ...subject, text: subject.text.toUpperCase() } : subject }
      : {}),
    blocks,
  } as T
}
