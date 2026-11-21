import type { Metadata } from 'next'
import { db } from '@indus/db'
import ImportClient from './ImportClient'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Bulk import — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function BulkImportPage({ params }: Props) {
  await params

  const recentJobs = await db.importJob.findMany({
    where: { entity: 'product' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { startedBy: { select: { name: true } } },
  })

  return (
    <AdminPageShell
      title="Bulk product import"
      sub="Create or update many products from a spreadsheet"
    >
      {/* The full explanation stays in the body — three sentences do not fit
            the 11.5px subtitle slot, and this is the text people actually read
            before uploading. */}
      <p className="text-ih-muted mb-6 text-[13px]">
        Upload a spreadsheet to create or update many products at once. Existing rows (matched by
        SKU) get updated; new ones get created. Errors are reported per-row before any DB changes
        happen.
      </p>

      <ImportClient />

      {recentJobs.length > 0 && (
        <div className="mt-10 max-w-5xl">
          <h2 className="mb-3 text-[14px] font-medium">Recent imports</h2>
          <div className="border-ih-border bg-ih-surface rounded-lg border">
            <div className="text-ih-muted border-ih-border grid grid-cols-[1fr_120px_120px_140px_120px] gap-3 border-b px-4 py-2.5 text-[11px] tracking-[0.04em] uppercase tabular-nums">
              <div>Code</div>
              <div>Status</div>
              <div>By</div>
              <div className="text-right">Rows (✓ / ✗)</div>
              <div className="text-right">When</div>
            </div>
            {recentJobs.map((j) => (
              <div
                key={j.id}
                className="border-ih-border grid grid-cols-[1fr_120px_120px_140px_120px] items-center gap-3 border-t px-4 py-3 text-[13px]"
              >
                <div className="text-ih-ink text-[12px] tabular-nums">{j.code}</div>
                <div className="text-ih-muted text-[11px] capitalize tabular-nums">{j.status}</div>
                <div className="text-ih-ink-2 text-[12px]">{j.startedBy?.name ?? 'System'}</div>
                <div className="text-ih-muted text-right text-[11px] tabular-nums">
                  {j.rowsToCreate + j.rowsToUpdate} / {j.rowsWithErrors}
                </div>
                <div className="text-ih-muted text-right text-[11px] tabular-nums">
                  {new Date(j.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminPageShell>
  )
}
