import type { DecimalString } from '../money/decimal'

/**
 * Builder inputs that cannot cross audiences (S11-T01, ADR-13, CLAUDE.md §10).
 *
 * Client documents (quotation, OA, PI, PL, DN, tax invoice, credit note) are built only from a ClientSafe*
 * input, which names every supplier, cost and margin field as `never`. Supplier documents (RFQ, PO) are built
 * only from a SupplierSafe* input, which names every client field as `never`. The brand is a unique symbol
 * that only the factories below can attach, so a builder cannot be handed a hand-rolled object either, and
 * each factory also refuses a forbidden key at run time (an `as` cast upstream cannot smuggle one in).
 *
 * Money and quantities are decimal strings (never floats); the builders compute and format.
 */

/** Keys that identify a supplier or our cost. Never in a client document's input, at any depth. */
export const CLIENT_FORBIDDEN_KEYS = [
  'supplier',
  'supplierId',
  'supplierName',
  'supplierRef',
  'supplierPartNumber',
  'supplierOfferRef',
  'cost',
  'unitCost',
  'costAed',
  'landed',
  'landedCost',
  'landedAed',
  'margin',
  'marginPct',
  'internalNote',
] as const
export type ClientForbiddenKey = (typeof CLIENT_FORBIDDEN_KEYS)[number]

/** Keys that identify the client. Never in a supplier document's input, at any depth. */
export const SUPPLIER_FORBIDDEN_KEYS = [
  'client',
  'clientId',
  'clientName',
  'clientRef',
  'clientPartNumber',
  'clientItemCode',
  'clientPo',
  'billTo',
  'shipTo',
  'site',
  'vessel',
  'project',
  'enquiryRef',
] as const
export type SupplierForbiddenKey = (typeof SUPPLIER_FORBIDDEN_KEYS)[number]

type Forbid<K extends string> = Partial<Record<K, never>>

export type VatTreatment = 'standard' | 'zero_rated'
export type LineState = 'priced' | 'price_to_follow' | 'not_quoted'

export interface PartyInput {
  label: string
  name: string
  lines: string[]
}

/** One line of a client document. `rate` is the client price; there is nowhere to put a cost. */
export interface ClientLineInput extends Forbid<ClientForbiddenKey> {
  lineNo: number
  partNumber?: string
  description: string
  /** The client's own code for the line, printed back to the client. */
  clientPartNumber?: string
  qty: DecimalString
  uom: string
  rate?: DecimalString
  /** Delivery in weeks from PO ("6", "Ex stock"). */
  delivery?: string
  vat?: VatTreatment
  origin?: string
  hsCode?: string
  state: LineState
  /** "Not quoted · <reason>"; the reason the client sees. */
  note?: string
  /** PL / DN: the package numbers this line travels in ("1–3"). */
  packages?: string
}

/** One line of a supplier document: our line ref and the cleaned description that was sent, never the client's. */
export interface SupplierLineInput extends Forbid<SupplierForbiddenKey> {
  lineNo: number
  /** Our internal line reference ("Ref 2611-01"). */
  ourRef: string
  partNumber?: string
  /** supplier_rfq_line.sentDescription: cleaned of client identity before it was ever sent. */
  description: string
  qty: DecimalString
  uom: string
  /** PO only: the supplier's own offered price. */
  rate?: DecimalString
  delivery?: string
  targetDate?: string
}

interface ClientDocBase extends Forbid<ClientForbiddenKey> {
  /** null while unissued: the preview passes `previewNumber`. */
  number: string | null
  previewNumber?: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  currency: string
  billTo: PartyInput
  subject?: string
  lines: ClientLineInput[]
  /** AED per unit of `currency`: the AED VAT line when the document is not in AED and VAT applies. */
  aedRate?: DecimalString
  footLabel?: string
}

export interface QuotationInput extends ClientDocBase {
  /** 1 for R1 … ; absent for the first issue. */
  revision?: number
  /** A supplementary quotation takes its own number and says so. */
  supplementary?: boolean
  validity?: string
  clientRef?: string
  incoterm?: string
  discount?: DecimalString
  freight?: DecimalString
  notes?: { label: string; text: string }[]
}

export interface OaInput extends ClientDocBase {
  kind: 'oa'
  clientPo: string
  quotationRef?: string
  delivery?: string
}
export interface PiInput extends ClientDocBase {
  kind: 'pi'
  clientPo: string
  /** "30" for 30%. */
  advancePct: DecimalString
}
export interface InvoiceInput extends ClientDocBase {
  kind: 'invoice'
  clientPo: string
  deliveryNote?: string
  /** Advance already received against this order, deducted from the total. */
  advancePaid?: DecimalString
  advanceRef?: string
  paymentDue?: string
}
export interface CreditNoteInput extends ClientDocBase {
  kind: 'cn'
  invoiceRef: string
  reason: string
}
export interface ShippingDocInput extends ClientDocBase {
  kind: 'pl' | 'dn'
  clientPo: string
  /** 1, 2 … : the shipment's own suffix "-01". */
  shipmentNo: number
  packages?: number
  grossKg?: DecimalString
  from: PartyInput
}
export type OrderDocInput = OaInput | PiInput | InvoiceInput | CreditNoteInput | ShippingDocInput

interface SupplierDocBase extends Forbid<SupplierForbiddenKey> {
  date: string
  currency?: string
  supplier: PartyInput
  from: PartyInput
  /** Indus's delivery point ("Dubai, UAE"), never the client's site. */
  deliveryPoint: string
  lines: SupplierLineInput[]
  footLabel?: string
  subject?: string
}
export interface RfqInput extends SupplierDocBase {
  /** IH-RFQ-… */
  ref: string
  replyBy: string
}
export interface PoInput extends SupplierDocBase {
  /** INDUS/PO… or null for a preview. */
  number: string | null
  previewNumber?: string
  /** The supplier's own offer reference (theirs, so it may be printed back to them). */
  offerRef?: string
  deliverBy?: string
  currency: string
}

declare const CLIENT_SAFE: unique symbol
declare const SUPPLIER_SAFE: unique symbol
type ClientSafe<T> = T & { readonly [CLIENT_SAFE]: true }
type SupplierSafe<T> = T & { readonly [SUPPLIER_SAFE]: true }

export type ClientSafeQuotation = ClientSafe<QuotationInput>
export type ClientSafeOrderDoc<T extends OrderDocInput = OrderDocInput> = ClientSafe<T>
export type SupplierSafeRfq = SupplierSafe<RfqInput>
export type SupplierSafePo = SupplierSafe<PoInput>

/** Every key at every depth of a plain value. */
function keysDeep(v: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) for (const x of v) keysDeep(x, out)
  else if (v && typeof v === 'object')
    for (const [k, x] of Object.entries(v)) {
      out.add(k)
      keysDeep(x, out)
    }
  return out
}

export class CrossAudienceError extends Error {
  constructor(
    readonly audience: 'client' | 'supplier',
    readonly keys: string[]
  ) {
    super(`A ${audience} document cannot carry: ${keys.join(', ')}`)
  }
}

function refuse(v: object, forbidden: readonly string[], audience: 'client' | 'supplier'): void {
  const keys = keysDeep(v)
  const hit = forbidden.filter((k) => keys.has(k))
  if (hit.length) throw new CrossAudienceError(audience, hit)
}

export function createClientSafeQuotation(i: QuotationInput): ClientSafeQuotation {
  refuse(i, CLIENT_FORBIDDEN_KEYS, 'client')
  return i as ClientSafeQuotation
}
export function createClientSafeOrderDoc<T extends OrderDocInput>(i: T): ClientSafeOrderDoc<T> {
  refuse(i, CLIENT_FORBIDDEN_KEYS, 'client')
  return i as ClientSafeOrderDoc<T>
}
export function createSupplierSafeRfq(i: RfqInput): SupplierSafeRfq {
  refuse(i, SUPPLIER_FORBIDDEN_KEYS, 'supplier')
  return i as SupplierSafeRfq
}
export function createSupplierSafePo(i: PoInput): SupplierSafePo {
  refuse(i, SUPPLIER_FORBIDDEN_KEYS, 'supplier')
  return i as SupplierSafePo
}
