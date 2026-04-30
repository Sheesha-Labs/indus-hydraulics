'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../../../lib/auth'
import { db } from '@indus/db'

export async function addAddress(formData: FormData) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  const locale = (formData.get('locale') as string) ?? 'en'
  const label = formData.get('label') as string
  const kind = (formData.get('kind') as string) ?? 'ship_to'
  const attention = (formData.get('attention') as string | null) || undefined
  const line1 = formData.get('line1') as string
  const line2 = (formData.get('line2') as string | null) || ''
  const city = formData.get('city') as string
  const region = (formData.get('region') as string | null) || undefined
  const postalCode = (formData.get('postalCode') as string | null) || undefined
  const countryCode = formData.get('countryCode') as string
  const phone = (formData.get('phone') as string | null) || undefined

  const lines = [line1, line2].filter(Boolean)

  await db.accountAddress.create({
    data: {
      accountId: session.user.accountId,
      label,
      kind: kind as never,
      attention,
      lines,
      city,
      region,
      postalCode,
      countryCode,
      phone,
    },
  })

  revalidatePath(`/${locale}/account/addresses`)
}

export async function setDefaultAddress(addressId: string, kind: 'ship' | 'bill', locale: string) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  if (kind === 'ship') {
    await db.$transaction([
      db.accountAddress.updateMany({
        where: { accountId: session.user.accountId },
        data: { isDefaultShip: false },
      }),
      db.accountAddress.update({
        where: { id: addressId, accountId: session.user.accountId },
        data: { isDefaultShip: true },
      }),
    ])
  } else {
    await db.$transaction([
      db.accountAddress.updateMany({
        where: { accountId: session.user.accountId },
        data: { isDefaultBill: false },
      }),
      db.accountAddress.update({
        where: { id: addressId, accountId: session.user.accountId },
        data: { isDefaultBill: true },
      }),
    ])
  }

  revalidatePath(`/${locale}/account/addresses`)
}

export async function deleteAddress(addressId: string, locale: string) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  await db.accountAddress.delete({
    where: { id: addressId, accountId: session.user.accountId },
  })

  revalidatePath(`/${locale}/account/addresses`)
}
