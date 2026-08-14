import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'Media library — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ kind?: string }>
}

const KIND_FILTERS = ['', 'image', 'document', 'cad'] as const

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default async function MediaLibraryPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams
  const kindFilter = sp.kind ?? ''

  const media = await db.media.findMany({
    where: kindFilter ? { kind: kindFilter as never } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { productImages: true, productDocuments: true },
      },
    },
    take: 200,
  })

  const totals = await db.media.groupBy({ by: ['kind'], _count: { _all: true } })

  return (
    <div className="px-8 py-6 pb-16">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Media library</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              {media.length} {media.length === 1 ? 'asset' : 'assets'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-6">
          {KIND_FILTERS.map((k) => {
            const count =
              k === ''
                ? totals.reduce((s, t) => s + t._count._all, 0)
                : totals.find((t) => t.kind === k)?._count._all ?? 0
            const url = `/media${k ? `?kind=${k}` : ''}`
            return (
              <Link
                key={k}
                href={url}
                className={`px-3 py-1.5 font-mono text-[11px] border transition-colors capitalize ${
                  kindFilter === k
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-body)]'
                }`}
              >
                {k || 'All'} <span className="opacity-70">({count})</span>
              </Link>
            )
          })}
        </div>

        {media.length === 0 ? (
          <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
            <p className="text-[var(--color-muted)] mb-1">No media assets yet.</p>
            <p className="font-mono text-[11px] text-[var(--color-caption)]">
              Upload images and documents from a product&apos;s Images / Documents tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {media.map((m) => {
              const usage = m._count.productImages + m._count.productDocuments
              return (
                <div
                  key={m.id}
                  className="bg-white border border-[var(--color-border)] flex flex-col"
                >
                  <div className="aspect-square bg-[var(--color-deep)] grid place-items-center text-[var(--color-caption)] font-mono text-[11px]">
                    {m.kind === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.storagePath}
                        alt={m.alt ?? m.originalFilename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="uppercase tracking-[0.1em]">{m.kind}</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1">
                    <div className="text-[12px] font-medium text-[var(--color-primary)] truncate">
                      {m.originalFilename}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-muted)] flex justify-between">
                      <span>{formatBytes(m.bytes)}</span>
                      <span>used {usage}×</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
