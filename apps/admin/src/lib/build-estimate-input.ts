import { db } from '@indus/db'
import type { EstimateInput, EstimateLine } from '@indus/pdf'

/**
 * Build an EstimateInput from an RFQ for preview/send. Pulls branding,
 * signature, and quote defaults from StoreSettings; pulls line data from
 * RfqLine.engineerUnitPrice (falls back to customerTargetPrice for preview
 * before engineer review).
 */
export async function buildEstimateInputFromRfq(rfqCode: string): Promise<EstimateInput | null> {
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
  // any other country → zero-rated export.
  const isUaeShipTo = rfq.shipToAddress?.countryCode?.toUpperCase() === 'AE'
  const settingsVatRate = settings?.defaultVatRatePct ? Number(settings.defaultVatRatePct) : 5
  const vatRatePct = isUaeShipTo ? settingsVatRate : 0
  const vatLabel = isUaeShipTo ? `VAT @ ${vatRatePct.toFixed(0)}%` : undefined

  // Build address arrays with safe fallbacks
  const billToLines: string[] = []
  if (rfq.shipToAddress) {
    const addr = rfq.shipToAddress
    const addrLines = (addr.lines as string[] | null) ?? []
    billToLines.push(...addrLines)
    const cityRegion = [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', ')
    if (cityRegion) billToLines.push(cityRegion)
    if (addr.countryCode) billToLines.push(addr.countryCode)
  }

  const validityDays = settings?.defaultQuoteValidityDays ?? 30
  const estimateDate = new Date()
  const expiryDate = new Date(estimateDate.getTime() + validityDays * 24 * 60 * 60 * 1000)

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

  const termsLines = (settings?.defaultQuoteTerms ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    documentTitle: 'Estimate',
    code: rfq.code,
    estimateDate,
    expiryDate,
    ...(rfq.subject ? { subject: rfq.subject } : {}),
    billTo: { name: rfq.account.legalName, addressLines: billToLines },
    lines,
    currency: 'AED',
    vatRatePct,
    ...(vatLabel ? { vatLabel } : {}),
    ...(settings?.defaultQuoteNotes ? { notes: settings.defaultQuoteNotes } : {}),
    ...(termsLines.length ? { termsLines } : {}),
    ...(settings?.defaultQuoteDisclaimer ? { disclaimer: settings.defaultQuoteDisclaimer } : {}),
    branding,
    signature,
  }
}
