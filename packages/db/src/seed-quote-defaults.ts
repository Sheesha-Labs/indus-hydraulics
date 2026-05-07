/**
 * One-shot seed for the Quote-Out feature: backfills StoreSettings with
 * Indus Hydraulics' legal entity, signature, sender config, and quote defaults.
 *
 * Idempotent: only fills fields that are currently null/empty; will not
 * overwrite values an admin has edited in the UI.
 *
 * Run: pnpm --filter @indus/db tsx src/seed-quote-defaults.ts
 */
import { db } from './index'

async function main() {
  const existing = await db.storeSettings.findFirst()

  const defaults = {
    legalName: 'Indus Hydraulic Power Trading LLC',
    vatTrn: '100548997400003',
    registeredAddressLines: [
      'Office No 310 Al Hilal Bank Building, Al Nahda Street',
      'Al Quasis-2, Dubai',
      'Dubai 87556',
      'United Arab Emirates',
    ],
    registeredCountryCode: 'AE',
    defaultVatRatePct: '5.00',

    signatureName: 'Krishan Bhatia',
    signatureTitle: 'Managing Director',
    signaturePhone: '+971 52 2477942',
    signatureEmail: 'sales@indushydraulics.me',

    quoteFromEmail: 'sales@indushydraulics.me',
    quoteFromName: 'Indus Hydraulics Sales',
    internalAlertEmails: ['sales@indushydraulics.me', 'ayushkbhatia@gmail.com'],

    defaultQuoteValidityDays: 30,
    defaultQuoteTerms:
      'DELIVERY: DDP destination\nPAYMENT: Advance with order\nPRICE VALID FOR FULL 30 DAYS ONLY.',
    defaultQuoteDisclaimer:
      'Once the order is confirmed and processed, the same cannot be changed or cancelled. Material will be supplied as per the offer quoted. Please review it carefully & clarify all your points and technical details before placing your valuable order.',
  }

  if (!existing) {
    await db.storeSettings.create({
      data: { name: 'Indus Hydraulics', defaultCurrency: 'AED', ...defaults },
    })
    console.log('✓ created StoreSettings with quote defaults')
    return
  }

  // Only fill empty fields (don't clobber admin edits).
  const patch: Record<string, unknown> = {}
  const e = existing as unknown as Record<string, unknown>
  for (const [k, v] of Object.entries(defaults)) {
    const cur = e[k]
    const isEmptyArray = Array.isArray(cur) && cur.length === 0
    if (cur == null || cur === '' || isEmptyArray) {
      patch[k] = v
    }
  }

  if (Object.keys(patch).length === 0) {
    console.log('• StoreSettings already populated, nothing to backfill')
    return
  }

  await db.storeSettings.update({ where: { id: existing.id }, data: patch })
  console.log(`✓ backfilled ${Object.keys(patch).length} StoreSettings field(s):`, Object.keys(patch).join(', '))
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
