import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import AdminTopbar from '../../../../../components/AdminTopbar'
import { Stepper } from '@indus/ui'

export const metadata: Metadata = { title: 'Bulk import — Indus Admin' }

type Props = { params: Promise<{ locale: string }> }

const STEPS = [
  { label: 'Upload', description: 'CSV or XLSX file' },
  { label: 'Map columns', description: 'Match to Indus fields' },
  { label: 'Validate', description: 'Check for errors' },
  { label: 'Commit', description: 'Apply changes' },
]

export default async function BulkImportPage({ params }: Props) {
  const { locale } = await params

  const recentJobs = await db.importJob.findMany({
    where: { entity: 'product' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { startedBy: { select: { name: true } } },
  })

  return (
    <>
      <AdminTopbar
        crumbs={[
          { label: 'Catalogue' },
          { label: 'Products', href: `/${locale}/products` },
          { label: 'Bulk import' },
        ]}
      />
      <div className="px-8 py-6 pb-16">
        <h1 className="text-[24px] font-semibold tracking-tight mb-1">Bulk product import</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">
          Upload a CSV or XLSX file to create or update many products at once.
        </p>

        <div className="bg-white border border-[var(--color-border)] p-6 mb-6">
          <Stepper steps={STEPS} currentStep={1} />
        </div>

        <div className="bg-white border border-[var(--color-border)] p-8 max-w-3xl">
          <h2 className="text-[16px] font-semibold mb-2">Step 1 — Upload your file</h2>
          <p className="text-[13px] text-[var(--color-muted)] mb-5">
            Accepted formats: <span className="font-mono">.csv</span>,{' '}
            <span className="font-mono">.xlsx</span>. Required columns: <span className="font-mono">sku</span>,{' '}
            <span className="font-mono">title</span>. Optional:{' '}
            <span className="font-mono">brand_slug</span>, <span className="font-mono">category_slug</span>,{' '}
            <span className="font-mono">mpn</span>, <span className="font-mono">description_short</span>,{' '}
            <span className="font-mono">status</span>.
          </p>

          <div className="border-2 border-dashed border-[var(--color-border)] bg-[var(--color-deep)] py-12 px-6 text-center">
            <p className="text-[13px] text-[var(--color-muted)] mb-1">
              Drag and drop a CSV/XLSX file here
            </p>
            <p className="font-mono text-[11px] text-[var(--color-caption)]">
              File upload pipeline coming soon — backend storage (R2) is being wired up.
            </p>
          </div>

          <div className="mt-6 p-4 border border-[oklch(0.7_0.15_80)] bg-[oklch(0.98_0.02_80)] text-[12px] leading-relaxed">
            <b className="text-[oklch(0.5_0.15_60)]">Coming soon:</b>
            <ul className="mt-2 ml-4 list-disc text-[var(--color-body)]">
              <li>Step 2 — Map CSV columns to Indus product fields</li>
              <li>Step 3 — Server-side validation with per-row error reporting</li>
              <li>Step 4 — Commit with rollback snapshot stored for 30 days</li>
            </ul>
            <p className="mt-3 text-[var(--color-muted)]">
              In the meantime, products can be created one at a time via{' '}
              <Link href={`/${locale}/products/new`} className="underline">
                + Add product
              </Link>
              .
            </p>
          </div>
        </div>

        {recentJobs.length > 0 && (
          <div className="mt-8 max-w-3xl">
            <h2 className="text-[14px] font-semibold mb-3">Recent imports</h2>
            <div className="bg-white border border-[var(--color-border)]">
              {recentJobs.map((j, i) => (
                <div
                  key={j.id}
                  className={`grid grid-cols-[1fr_120px_120px_120px] gap-3 px-4 py-3 items-center text-[13px] ${
                    i > 0 ? 'border-t border-[var(--color-border)]' : ''
                  }`}
                >
                  <div className="font-mono text-[12px] text-[var(--color-primary)]">{j.code}</div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)] capitalize">
                    {j.status}
                  </div>
                  <div className="text-[12px] text-[var(--color-body)]">
                    {j.startedBy?.name ?? 'System'}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)] text-right">
                    {new Date(j.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
