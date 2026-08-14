'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '../../../../lib/auth'
import { db, nextRfqCode } from '@indus/db'

export async function updateItemQty(itemId: string, qty: number, listId: string) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  if (qty < 1) return

  await db.savedListItem.update({
    where: { id: itemId },
    data: { quantity: qty },
  })

  revalidatePath(`/account/lists/${listId}`)
}

export async function removeItem(itemId: string, listId: string) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  await db.savedListItem.update({
    where: { id: itemId },
    data: { deletedAt: new Date() },
  })

  revalidatePath(`/account/lists/${listId}`)
}

export async function restoreItem(itemId: string, listId: string) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  await db.savedListItem.update({
    where: { id: itemId },
    data: { deletedAt: null },
  })

  revalidatePath(`/account/lists/${listId}`)
}

export async function addComment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  const listId = formData.get('listId') as string
  const body = formData.get('body') as string

  if (!body.trim()) return

  await db.savedListComment.create({
    data: {
      savedListId: listId,
      actorType: 'contact',
      contactId: session.user.id,
      body: body.trim(),
    },
  })

  revalidatePath(`/account/lists/${listId}`)
}

export async function convertToRfq(listId: string) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  const list = await db.savedList.findUnique({
    where: { id: listId, accountId: session.user.accountId },
    include: {
      items: {
        where: { deletedAt: null },
        include: { product: { select: { id: true, sku: true } } },
      },
    },
  })

  if (!list || list.items.length === 0) throw new Error('No items to convert')

  const rfq = await db.$transaction(async (tx) => {
    const code = await nextRfqCode(tx)
    return tx.rfq.create({
      data: {
        code,
        accountId: session.user.accountId,
        submittedByContactId: session.user.id,
        subject: `From saved list: ${list.name}`,
        status: 'draft',
        lines: {
          create: list.items.map((item, i) => ({
            productId: item.productId,
            requestedQty: item.quantity,
            position: i,
          })),
        },
      },
    })
  })

  redirect(`/quote?from_list=${listId}&rfq=${rfq.code}`)
}

export async function updateListName(formData: FormData) {
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  const listId = formData.get('listId') as string
  const name = formData.get('name') as string

  await db.savedList.update({
    where: { id: listId, accountId: session.user.accountId },
    data: { name: name.trim() },
  })

  revalidatePath(`/account/lists/${listId}`)
}
