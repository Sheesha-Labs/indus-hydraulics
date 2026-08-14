import type { Metadata } from 'next'
import { auth } from '../../../../lib/auth'
import { db } from '@indus/db'
import AddressBook from '../../../../components/AddressBook'

export const metadata: Metadata = { title: 'Address Book' }

export default async function AddressesPage() {
  const session = await auth()

  const [addresses, account] = await Promise.all([
    db.accountAddress.findMany({
      where: { accountId: session!.user.accountId },
      orderBy: [{ isDefaultShip: 'desc' }, { isDefaultBill: 'desc' }, { createdAt: 'asc' }],
    }),
    db.account.findUnique({
      where: { id: session!.user.accountId },
      select: { requiresAddressApproval: true },
    }),
  ])

  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-tight mb-6">Addresses</h1>
      <AddressBook
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          kind: a.kind,
          attention: a.attention ?? undefined,
          lines: (a.lines as string[]) ?? [],
          city: a.city,
          region: a.region ?? undefined,
          postalCode: a.postalCode ?? undefined,
          countryCode: a.countryCode,
          phone: a.phone ?? undefined,
          isDefaultShip: a.isDefaultShip,
          isDefaultBill: a.isDefaultBill,
          approvedAt: a.approvedAt ?? undefined,
        }))}
        requiresApproval={account?.requiresAddressApproval ?? false}
      />
    </div>
  )
}
