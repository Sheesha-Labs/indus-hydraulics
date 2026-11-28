/**
 * DocumentData: the one model behind every document Indus issues (ADR-14). The HTML DocumentPage
 * (`@indus/ops-ui/document`) and the PDF renderer (`@indus/ops-pdf`) both draw from it, so the page on
 * screen and the file in Gmail cannot disagree. Builders per kind arrive in S11 (see builders/README.md).
 *
 * Money and quantities are already-formatted strings here: builders format them with the ops-core money
 * helpers; renderers never compute.
 */

/** Every kind of document Indus issues. Received paper (client POs, supplier quotes) is never re-rendered. */
export type DocKind = 'quotation' | 'rfq' | 'oa' | 'pi' | 'po' | 'pl' | 'dn' | 'invoice' | 'cn'

/**
 * One table cell. In the description column `bold` is the part number line and `sub` the small line below;
 * `muted` greys a cell; `span` is a colspan (a "Price to follow" note across the price columns).
 */
export interface DocCell {
  v: string
  sub?: string
  bold?: string
  muted?: boolean
  span?: number
}

/** Row state: a line priced later, a line highlighted (Why?, PO check), or a gap row ("Lines 5–11"). */
export type DocRowFlag = 'to-follow' | 'highlight' | 'gap'

export interface DocTableRow {
  cells: DocCell[]
  flag?: DocRowFlag
}

export interface DocTotalRow {
  label: string
  value: string
  grand?: boolean
}

export interface DocSign {
  lead: string
  name: string
  role: string
}

/**
 * Which template block (board 57) a body block belongs to, when its type does not say: a "Received by" box
 * of terms rows is the signature, not the terms. Templates reorder and switch body blocks by this.
 */
export type DocBodyPart = 'lines' | 'totals' | 'terms' | 'bank' | 'disclaimer' | 'signature'

/** The ordered body of a house-layout document. */
export type DocBlock = { part?: DocBodyPart } & (
  | { t: 'table'; cols: string[]; rows: DocTableRow[]; descCol?: number /* default 1 */ }
  | { t: 'totals'; words?: string; rows: DocTotalRow[] }
  | { t: 'section'; n: string; title: string }
  | { t: 'terms'; rows: { label: string; value: string }[] }
  | {
      t: 'bank'
      showLabel?: boolean
      /** null hides the disclaimer; undefined shows none either (the wording is data, not code). */
      disclaimer?: string | null
      sign?: DocSign | false
      side?: { label: string; text: string }
    }
  | { t: 'sign'; lead: string; name: string }
  | { t: 'slips'; boxes: { title: string; fields: string[] }[] }
  | { t: 'remark'; text: string }
)

export type DocTableBlock = Extract<DocBlock, { t: 'table' }>

/**
 * The issuing company's letterhead. It comes from the database (Settings › Company, `ops-company`
 * Storage), NEVER from code: the repository is public. Fixtures use obviously fake values only.
 */
export interface Letterhead {
  legalName: string
  addressLines: string[]
  trn: string
  phone: string
  mailbox: string
  logo: { src: string; width: number; height: number }
  bank: { lines: string[] }
  stampSrc?: string
  signatureSrc?: string
}

export interface DocHeader {
  kind: DocKind
  eyebrow: string
  title: string
  no: string
  meta: { label: string; value: string }[]
  /** Middle of the running footer ("Valves & actuators"). */
  footLabel: string
  /** From the template (board 57): the paper, and a cap on the line-table rows on page 1. */
  page?: { size: 'A4' | 'Letter'; firstPageRows?: number }
}

export interface DocParty {
  label: string
  name: string
  lines: string[]
}

export interface HouseDocument extends DocHeader {
  layout: 'house'
  party: DocParty[]
  subject?: { label?: string; text: string }
  blocks: DocBlock[]
}

/** The client quotation, in the Zoho Estimate look clients already receive (P13). */
export interface EstimateDocument extends DocHeader {
  layout: 'estimate'
  billTo: DocParty
  items: DocTableBlock
  totals: DocTotalRow[]
  /** The record's own notes, then the terms, the bank and the disclaimer, each tagged with its block. */
  notes: { label: string; text: string; part?: DocBodyPart }[]
  signer: string
  /** Revision of `no`: "2", "R2" or "-R2" all render as "-R2" (ADR-15: revisions keep the base). */
  revision?: string
}

export type DocumentData = HouseDocument | EstimateDocument

// ---------------------------------------------------------------------------------------------------
// Safe lines (CLAUDE.md §10, hard rules 1 and 2). Builders for client output take only ClientSafe*
// types; builders for supplier output take only SupplierSafe* types. Each type names the fields of the
// other side as `never`, so an object carrying one is a compile error even when it is passed as a
// variable (structural typing would otherwise let the extra field through).

/** Fields that identify the client. Never on anything bound for a supplier. */
interface NoClientIdentity {
  clientName?: never
  clientRef?: never
  clientPartNumber?: never
  clientItemCode?: never
  site?: never
  vessel?: never
  project?: never
  enquiryRef?: never
}

/** Fields that identify the supplier or our cost. Never on anything bound for a client. */
interface NoSupplierOrCost {
  supplier?: never
  supplierName?: never
  supplierRef?: never
  supplierPartNumber?: never
  cost?: never
  unitCost?: never
  landed?: never
  landedCost?: never
  margin?: never
  marginPct?: never
}

/** One line of a client-facing document (quotation, OA, PI, invoice, DN, client page). */
export interface ClientSafeLine extends NoSupplierOrCost {
  lineNo: number
  partNumber: string
  description: string
  /** The client's own item code for the line, shown back to the client. */
  clientPartNumber?: string
  qty: string
  uom: string
  /** Formatted unit price and amount; absent while the line is "to follow". */
  unitPrice?: string
  amount?: string
  leadWeeks?: string
  taxRate?: string
  state: 'priced' | 'to-follow' | 'not-quoted'
  /** Client-facing note, e.g. "Price to follow" or the reason a line is not quoted. */
  note?: string
}

/** One line of a supplier-facing document (RFQ, PO). Carries our line ref, never the client's. */
export interface SupplierSafeLine extends NoClientIdentity {
  lineNo: number
  /** Our internal line reference ("Ref 2611-01"), never a client reference. */
  ourRef: string
  partNumber?: string
  description: string
  qty: string
  uom: string
  /** Filled on a PO; blank on an RFQ. */
  unitPrice?: string
  amount?: string
}
