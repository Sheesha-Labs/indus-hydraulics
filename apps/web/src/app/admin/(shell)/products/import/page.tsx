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
        <p className="text-[13px] text-ih-muted mb-6">
          Upload a spreadsheet to create or update many products at once. Existing rows (matched by SKU) get updated;
          new ones get created. Errors are reported per-row before any DB changes happen.
        </p>

        <ImportClient />

        {recentJobs.length > 0 && (
          <div className="mt-10 max-w-5xl">
            <h2 className="text-[14px] font-medium mb-3">Recent imports</h2>
            <div className="bg-ih-surface border border-ih-border">
              <div className="grid grid-cols-[1fr_120px_120px_140px_120px] gap-3 px-4 py-2.5 text-[11px] font-mono uppercase tracking-[0.04em] text-ih-muted border-b border-ih-border">
                <div>Code</div>
                <div>Status</div>
                <div>By</div>
                <div className="text-right">Rows (✓ / ✗)</div>
                <div className="text-right">When</div>
              </div>
              {recentJobs.map((j) => (
                <div
                  key={j.id}
                  className="grid grid-cols-[1fr_120px_120px_140px_120px] gap-3 px-4 py-3 items-center text-[13px] border-t border-ih-border"
                >
                  <div className="font-mono text-[12px] text-ih-ink">{j.code}</div>
                  <div className="font-mono text-[11px] text-ih-muted capitalize">{j.status}</div>
                  <div className="text-[12px] text-ih-ink-2">{j.startedBy?.name ?? 'System'}</div>
                  <div className="font-mono text-[11px] text-right text-ih-muted">
                    {j.rowsToCreate + j.rowsToUpdate} / {j.rowsWithErrors}
                  </div>
                  <div className="font-mono text-[11px] text-ih-muted text-right">
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
