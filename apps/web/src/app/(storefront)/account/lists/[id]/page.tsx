import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../../lib/auth'
import { db } from '@indus/db'
import { mediaUrl } from '../../../../../lib/media'
import SavedListClient from '../../../../../components/SavedListClient'

export const metadata: Metadata = { title: 'Saved List' }

type Props = {
  params: Promise<{ id: string }>
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default async function SavedListDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const list = await db.savedList.findUnique({
    where: { id, accountId: session!.user.accountId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              title: true,
              brand: { select: { name: true } },
              images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } },
            },
          },
        },
        orderBy: [{ deletedAt: 'asc' }, { position: 'asc' }],
      },
      comments: {
        include: { contact: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!list) notFound()

  const activeItems = list.items.filter((i) => !i.deletedAt)
  const deletedItems = list.items.filter((i) => i.deletedAt)
  const undoItems = deletedItems.filter(
    (i) => new Date().getTime() - new Date(i.deletedAt!).getTime() < 30 * 24 * 60 * 60 * 1000
  )

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3.5 font-mono text-[12px] text-[var(--color-muted)] mb-4">
        <Link href={`/account`} className="hover:text-[var(--color-primary)]">Account</Link>
        <span className="opacity-40">/</span>
        <Link href={`/account/lists`} className="hover:text-[var(--color-primary)]">Saved lists</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)] truncate max-w-[200px]">{list.name}</span>
      </nav>

      {/* Title block */}
      <header className="flex justify-between items-end gap-6 pb-5 border-b border-[var(--color-border)] mb-0">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center mb-2">
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)] uppercase">SAVED LIST · BOM</span>
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] mb-2">{list.name}</h1>
          {list.description && (
            <p className="text-[13px] text-[var(--color-muted)] leading-[1.6] max-w-[680px]">{list.description}</p>
          )}
          <div className="font-mono text-[13px] text-[var(--color-muted)] mt-1.5">
            {activeItems.length} SKUs · Updated {timeAgo(new Date(list.updatedAt))}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="h-8 px-4 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
            Export CSV
          </button>
          <button className="h-8 px-4 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
            Share ▾
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex justify-between items-center py-[18px] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3.5">
          <label className="flex items-center gap-2 text-[12px] text-[var(--color-muted)] cursor-pointer">
            <input type="checkbox" className="accent-[var(--color-accent)]" />
            Select all ({activeItems.length})
          </label>
          <span className="w-px h-[18px] bg-[var(--color-border)]" />
          <div className="flex gap-1.5">
            <button className="h-7 px-2.5 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] transition-colors">Update qty ▾</button>
            <button className="h-7 px-2.5 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] transition-colors">Move to list ▾</button>
            <button className="h-7 px-2.5 border border-[var(--color-border)] font-mono text-[11px] hover:bg-[var(--color-deep)] transition-colors" style={{ color: 'oklch(0.55 0.18 25)' }}>Remove</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-8 px-4 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
            + Add SKU
          </button>
          {activeItems.length > 0 && (
            <form action={async () => {
              'use server'
              const { convertToRfq } = await import('./actions')
              await convertToRfq(list.id)
            }}>
              <button
                type="submit"
                className="h-8 px-4 flex items-center bg-[var(--color-accent)] text-white font-mono text-[11px] hover:opacity-90 transition-opacity"
              >
                RFQ all {activeItems.length} →
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-8 mt-6" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
        {/* Items */}
        <div>
          {activeItems.length === 0 ? (
            <div className="py-12 border border-dashed border-[var(--color-border)] text-center mb-4">
              <p className="text-[var(--color-muted)] text-[13px]">No items in this list.</p>
              <Link href={`/c`} className="mt-3 inline-block font-mono text-[12px] text-[var(--color-accent)] hover:underline">
                Browse products →
              </Link>
            </div>
          ) : (
            <SavedListClient
              listId={list.id}
              items={activeItems.map((item) => ({
                id: item.id,
                sku: item.product.sku,
                title: item.product.title,
                brand: item.product.brand?.name,
                qty: item.quantity,
                note: item.note ?? undefined,
                imageUrl: item.product.images[0]
                  ? mediaUrl(item.product.images[0].media.storagePath)
                  : undefined,
              }))}
            />
          )}

          {/* Undo removed items */}
          {undoItems.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-2">
                Recently removed (undo within 30 days)
              </p>
              <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                {undoItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-[var(--color-deep)]">
                    <div>
                      <span className="text-[13px] text-[var(--color-muted)] line-through">{item.product.title}</span>
                      <span className="font-mono text-[11px] text-[var(--color-caption)] ml-2">{item.product.sku}</span>
                    </div>
                    <form action={async () => {
                      'use server'
                      const { restoreItem } = await import('./actions')
                      await restoreItem(item.id, list.id)
                    }}>
                      <button type="submit" className="font-mono text-[11px] text-[var(--color-accent)] hover:underline">
                        Undo
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments sidebar */}
        <div className="sticky top-[88px]">
          <h2 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">Comments</h2>

          <div className="space-y-3 mb-4">
            {list.comments.map((c) => (
              <div key={c.id} className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-semibold text-[var(--color-primary)]">
                    {c.contact ? `${c.contact.firstName} ${c.contact.lastName}` : 'Staff'}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-muted)]">
                    {timeAgo(new Date(c.createdAt))}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-body)] leading-[1.5]">{c.body}</p>
              </div>
            ))}
            {list.comments.length === 0 && (
              <p className="text-[13px] text-[var(--color-caption)]">No comments yet.</p>
            )}
          </div>

          <form action={addComment}>
            <input type="hidden" name="listId" value={list.id} />
            <textarea
              name="body"
              rows={3}
              placeholder="Add a comment…"
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none mb-2"
            />
            <button type="submit" className="h-8 px-4 bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px] hover:bg-[var(--color-body)] transition-colors">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

async function addComment(formData: FormData) {
  'use server'
  const { addComment: action } = await import('./actions')
  await action(formData)
}
