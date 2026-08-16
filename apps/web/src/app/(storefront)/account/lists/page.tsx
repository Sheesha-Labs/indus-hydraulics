import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../../lib/auth'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'Saved Lists' }

async function createList(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user?.accountId) throw new Error('Not authenticated')

  const name = formData.get('name') as string

  if (!name.trim()) return

  const list = await db.savedList.create({
    data: {
      accountId: session.user.accountId,
      ownerContactId: session.user.id,
      name: name.trim(),
    },
  })

  redirect(`/account/lists/${list.id}`)
}

export default async function SavedListsPage() {
  const session = await auth()

  const lists = await db.savedList.findMany({
    where: { accountId: session!.user.accountId },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Saved lists</h1>

        <form action={createList} className="flex border border-ih-border bg-ih-surface h-9">
          <input
            name="name"
            type="text"
            required
            placeholder="New list name…"
            className="w-44 px-3 bg-transparent text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none"
          />
          <button type="submit" className="px-3 border-l border-ih-border font-mono text-[11px] text-white bg-ih-accent hover:opacity-90">
            Create
          </button>
        </form>
      </div>

      {lists.length === 0 ? (
        <div className="py-16 border border-dashed border-ih-border text-center">
          <div className="text-[40px] mb-3 opacity-20">📋</div>
          <p className="text-ih-muted text-[13px]">No saved lists yet. Create one to build a BOM or track recurring orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/account/lists/${list.id}`}
              className="block border border-ih-border bg-ih-surface p-4 hover:border-ih-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[15px] font-semibold leading-snug mb-1">{list.name}</div>
                  {list.description && (
                    <p className="text-[12px] text-ih-muted leading-[1.4]">{list.description}</p>
                  )}
                </div>
                <div className="shrink-0 font-mono text-[11px] text-ih-muted bg-ih-bg px-2 py-0.5 border border-ih-border">
                  {list._count.items} items
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-ih-border flex items-center justify-between">
                <div className="font-mono text-[10px] text-ih-muted-2 capitalize">
                  {list.visibility}
                </div>
                <div className="font-mono text-[11px] text-ih-muted">
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
