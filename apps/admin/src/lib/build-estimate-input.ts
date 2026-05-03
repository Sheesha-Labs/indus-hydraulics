import { db } from '@indus/db'
import type { EstimateInput, EstimateLine } from '@indus/pdf'

/**
 * Per-quote overrides set by the engineer in the Send-Quote composer. All
 * fields are optional; unset values fall back to RFQ data + StoreSettings.
 */
export type EstimateOverrides = {
  code?: string
  revisionLabel?: string
  estimateDate?: Date
  expiryDate?: Date
  validityDays?: number
  subject?: string | null
  referenceLine?: string | null
  notes?: string | null
  termsText?: string | null
  disclaimer?: string | null
  /** Override VAT %; if undefined, the UAE-vs-export rule decides. */
  vatRatePct?: number
  /** Global discount (AED). Renders on PDF + included in computed total. */
  discountTotal?: number
  /** Shipping (AED). Renders on PDF + included in computed total. */
  shipping?: number
}

/**
 * Build an EstimateInput from an RFQ for preview/send. Pulls branding,
 * signature, and quote defaults from StoreSettings; pulls line data from
 * RfqLine.engineerUnitPrice (falls back to customerTargetPrice for preview
 * before engineer review). Composer overrides take precedence.
 */
export async function buildEstimateInputFromRfq(
  rfqCode: string,
  overrides: EstimateOverrides = {},
): Promise<EstimateInput | null> {
  const [rfq, settings] = await Promise.all([
    db.rfq.findUnique({
      where: { code: rfqCode },
      include: {
        account: { select: { legalName: true } },
        shipToAddress: true,
        lines: {
          orderBy: { position: 'asc' },
          include: { product: { select: { sku: true, title: true, brand: { select: { name: true } } } } },
        },
      },
    }),
    db.storeSettings.findFirst(),
  ])

  if (!rfq) return null

  const lines: EstimateLine[] = rfq.lines.map((l) => {
    const brand = l.product.brand?.name ? `Make: ${l.product.brand.name}` : ''
    const description = [
      l.product.title,
      l.product.sku ? `SKU: ${l.product.sku}` : '',
      brand,
      l.engineerNotes ?? '',
    ]
      .filter(Boolean)
      .join('\n')

    const rate = Number(l.engineerUnitPrice ?? l.customerTargetPrice ?? 0)
    return { description, qty: l.requestedQty, rate }
  })

  // VAT rule: UAE ship-to → use settings.defaultVatRatePct (default 5%);
  // any other country → zero-rated export. Composer override wins if set.
  const isUaeShipTo = rfq.shipToAddress?.countryCode?.toUpperCase() === 'AE'
  const settingsVatRate = settings?.defaultVatRatePct ? Number(settings.defaultVatRatePct) : 5
  const computedVatRate = isUaeShipTo ? settingsVatRate : 0
  const vatRatePct = overrides.vatRatePct ?? computedVatRate
  const vatLabel = vatRatePct > 0 ? `VAT @ ${vatRatePct.toFixed(0)}%` : undefined

  const billToLines: string[] = []
  if (rfq.shipToAddress) {
    const addr = rfq.shipToAddress
    const addrLines = (addr.lines as string[] | null) ?? []
    billToLines.push(...addrLines)
    const cityRegion = [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', ')
    if (cityRegion) billToLines.push(cityRegion)
    if (addr.countryCode) billToLines.push(addr.countryCode)
  }

  const validityDays = overrides.validityDays ?? settings?.defaultQuoteValidityDays ?? 30
  const estimateDate = overrides.estimateDate ?? new Date()
  const expiryDate =
    overrides.expiryDate ?? new Date(estimateDate.getTime() + validityDays * 24 * 60 * 60 * 1000)

  const branding = {
    legalName: settings?.legalName ?? 'Indus Hydraulic Power Trading LLC',
    vatTrn: settings?.vatTrn ?? null,
    addressLines: (settings?.registeredAddressLines as string[] | null) ?? [],
  }

  const signature = {
    name: settings?.signatureName ?? 'Krishan Bhatia',
    title: settings?.signatureTitle ?? 'Managing Director',
    company: branding.legalName,
    phone: settings?.signaturePhone ?? null,
    email: settings?.signatureEmail ?? null,
    addressLines: branding.addressLines,
  }

  const bank = settings
    ? {
        accountName: settings.bankAccountName ?? null,
        accountNo: settings.bankAccountNo ?? null,
        bankName: settings.bankName ?? null,
        branch: settings.bankBranch ?? null,
        iban: settings.bankIban ?? null,
        swift: settings.bankSwift ?? null,
      }
    : null

  const termsText = overrides.termsText ?? settings?.defaultQuoteTerms ?? ''
  const termsLines = termsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  // Pick subject — composer can override; otherwise use RFQ.subject.
  const resolvedSubject = overrides.subject !== undefined ? overrides.subject : rfq.subject
  const resolvedNotes = overrides.notes !== undefined ? overrides.notes : settings?.defaultQuoteNotes ?? null
  const resolvedDisclaimer =
    overrides.disclaimer !== undefined ? overrides.disclaimer : settings?.defaultQuoteDisclaimer ?? null

  return {
    documentTitle: 'Estimate',
    code: overrides.code ?? rfq.code,
    ...(overrides.revisionLabel ? { revisionLabel: overrides.revisionLabel } : {}),
    estimateDate,
    expiryDate,
    ...(overrides.referenceLine ? { referenceLine: overrides.referenceLine } : {}),
    ...(resolvedSubject ? { subject: resolvedSubject } : {}),
    billTo: { name: rfq.account.legalName, addressLines: billToLines },
    lines,
    currency: 'AED',
    vatRatePct,
    ...(vatLabel ? { vatLabel } : {}),
    ...(overrides.discountTotal !== undefined ? { discountTotal: overrides.discountTotal } : {}),
    ...(overrides.shipping !== undefined ? { shipping: overrides.shipping } : {}),
    ...(resolvedNotes ? { notes: resolvedNotes } : {}),
    ...(termsLines.length ? { termsLines } : {}),
    ...(resolvedDisclaimer ? { disclaimer: resolvedDisclaimer } : {}),
    branding,
    signature,
    bank,
  }
}
