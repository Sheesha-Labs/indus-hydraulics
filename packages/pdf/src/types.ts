export type EstimateLine = {
  description: string
  qty: number
  rate: number
}

export type EstimateInput = {
  /** "Estimate" or "Quote" — set per StoreSettings convention. */
  documentTitle: string
  /** Document number, e.g. "INDUS/Q26386" or "RFQ-2026-0042" for previews. */
  code: string
  /** Optional revision suffix shown next to code (e.g. "r2"). */
  revisionLabel?: string
  estimateDate: Date
  expiryDate?: Date
  /** Free-text "Reference#" line shown in the metadata block (e.g. "REVISED OFFER FOR …"). */
  referenceLine?: string
  /** Free-text subject below metadata (e.g. "OFFER FOR GEOSLUDGE BAG AP 200-300KG"). */
  subject?: string

  billTo: {
    name: string
    addressLines: string[]
  }

  lines: EstimateLine[]

  currency: string

  /** VAT percentage applied to the (post-discount) subtotal. 0 = no VAT line shown. */
  vatRatePct: number
  /** Optional explicit label, e.g. "VAT @ 5%" or "Zero-rated export". */
  vatLabel?: string

  /** Optional global discount applied to subtotal. Renders only if > 0. */
  discountTotal?: number
  /** Optional shipping charge added to total. Renders only if > 0. */
  shipping?: number

  notes?: string
  /** Multi-line terms (each line rendered without a bullet). */
  termsLines?: string[]
  disclaimer?: string

  branding: {
    legalName: string
    vatTrn?: string | null
    addressLines: string[]
  }

  signature: {
    name: string
    title: string
    company: string
    phone?: string | null
    email?: string | null
    addressLines?: string[]
  }

  /** Bank details rendered in PDF page-2 footer. Block hidden if all fields are null/empty. */
  bank?: {
    accountName?: string | null
    accountNo?: string | null
    bankName?: string | null
    branch?: string | null
    iban?: string | null
    swift?: string | null
  } | null

  /** Optional override for the logo. Defaults to the bundled PNG. */
  logoBase64?: string
}

export type EstimateTotals = {
  subtotal: number
  discountTotal: number
  vatAmount: number
  shipping: number
  total: number
}

export function computeTotals(
  input: Pick<EstimateInput, 'lines' | 'vatRatePct' | 'discountTotal' | 'shipping'>,
): EstimateTotals {
  const subtotal = input.lines.reduce((sum, l) => sum + l.qty * l.rate, 0)
  const discountTotal = input.discountTotal ?? 0
  // VAT is computed on the post-discount amount (matches UAE FTA convention).
  const vatAmount = (subtotal - discountTotal) * (input.vatRatePct / 100)
  const shipping = input.shipping ?? 0
  const total = subtotal - discountTotal + vatAmount + shipping
  return {
    subtotal: roundMoney(subtotal),
    discountTotal: roundMoney(discountTotal),
    vatAmount: roundMoney(vatAmount),
    shipping: roundMoney(shipping),
    total: roundMoney(total),
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}
