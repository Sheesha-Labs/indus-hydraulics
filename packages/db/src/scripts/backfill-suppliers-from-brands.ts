/**
 * Seed the supplier ledger from the brands we already carry.
 *
 * These are the zero-research suppliers: we already trade with them, we know
 * the country, and twelve of them are authorised-distributor relationships.
 * Starting the ledger here means the first enquiries hit real rows rather than
 * an empty table and a cold web search.
 *
 * Idempotent — keyed on slug, safe to re-run. Deliberately does NOT invent
 * contact details: brands carry no email or phone, and a guessed
 * `sales@<domain>` address is exactly the kind of unverified contact that
 * burns sender reputation. Contacts get added by a human or by research that
 * records an evidenceUrl.
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/backfill-suppliers-from-brands.ts
 */

import { db } from '../index'

/** Best-effort domain from a website URL. Null rather than a guess. */
function domainOf(website: string | null): string | null {
  if (!website) return null
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    return url.hostname.replace(/^www\./, '').toLowerCase() || null
  } catch {
    return null
  }
}

async function main() {
  const brands = await db.brand.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      country: true,
      isAuthorizedDistributor: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  })

  console.log(`${brands.length} brands found`)

  let created = 0
  let updated = 0

  for (const brand of brands) {
    const slug = `brand-${brand.slug}`
    const existing = await db.supplier.findUnique({ where: { slug }, select: { id: true } })

    const data = {
      name: brand.name,
      country: brand.country,
      // A brand we distribute is a manufacturer to us, whether or not the
      // relationship is a formal authorised one.
      kind: 'manufacturer' as const,
      origin: 'brand' as const,
      isAuthorizedDistributor: brand.isAuthorizedDistributor,
      brandId: brand.id,
    }

    if (existing) {
      await db.supplier.update({ where: { id: existing.id }, data })
      updated += 1
    } else {
      await db.supplier.create({ data: { ...data, slug, domain: null, website: null } })
      created += 1
    }
  }

  const total = await db.supplier.count()
  const authorised = await db.supplier.count({ where: { isAuthorizedDistributor: true } })
  const withContacts = await db.supplier.count({ where: { contacts: { some: {} } } })

  console.log(`created ${created}, updated ${updated}`)
  console.log(`ledger now holds ${total} suppliers, ${authorised} authorised, ${withContacts} with a contact`)
  console.log('No contacts were invented — every brand row lacks an email, and a guessed address is worse than none.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())

export { domainOf }
