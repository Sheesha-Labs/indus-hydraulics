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

  /** VAT percentage applied to the subtotal. 0 = no VAT line shown. */
  vatRatePct: number
  /** Optional explicit label, e.g. "VAT @ 5%" or "Zero-rated export". */
  vatLabel?: string

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

  /** Optional override for the logo. Defaults to the bundled PNG. */
  logoBase64?: string
}

export type EstimateTotals = {
  subtotal: number
  vatAmount: number
  total: number
}

export function computeTotals(input: Pick<EstimateInput, 'lines' | 'vatRatePct'>): EstimateTotals {
  const subtotal = input.lines.reduce((sum, l) => sum + l.qty * l.rate, 0)
  const vatAmount = subtotal * (input.vatRatePct / 100)
  const total = subtotal + vatAmount
  return {
    subtotal: roundMoney(subtotal),
    vatAmount: roundMoney(vatAmount),
    total: roundMoney(total),
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}
