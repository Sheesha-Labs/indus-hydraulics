import type { Metadata } from 'next'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'SEO Audit — Indus Admin' }

/**
 * Audit log viewer. Lists every SEO write across entity meta, redirects,
 * robots, structured-data globals, and bulk operations. The actual audit
 * writer lives in `withSeoAudit` (added in a follow-up commit alongside
 * the AI Suggest drawer); for now the page renders whatever rows exist.
 *
 * Revert is a Phase 2 capability.
 */
export default async function SeoAuditPage() {
  const rows = await db.seoAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-border)] py-16 text-center max-w-[800px]">
        <p className="text-[var(--color-muted)] text-[13px]">
          No audit entries yet. Edits made from the SEO entity drawer or
          infrastructure pages will start populating this log.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[var(--color-border)] overflow-hidden max-w-full">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-deep)]">
            <Th>When</Th>
            <Th>Entity</Th>
            <Th>Field</Th>
            <Th>Before → After</Th>
            <Th>Reason</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--color-border)] last:border-0 align-top hover:bg-[var(--color-deep)]"
            >
              <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-muted)] whitespace-nowrap">
                {row.createdAt.toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-3 py-3 font-mono text-[11px]">
                <div>{row.entityType}</div>
                {row.entityId && (
                  <div className="text-[var(--color-muted)] text-[10px] truncate max-w-[160px]">
                    {row.entityId}
                  </div>
                )}
              </td>
              <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-body)]">
                {row.field}
              </td>
              <td className="px-3 py-3 text-[12px] max-w-[480px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="font-mono text-[11px] text-[var(--color-muted)] whitespace-pre-wrap break-all">
                    {formatValue(row.before)}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-body)] whitespace-pre-wrap break-all">
                    {formatValue(row.after)}
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-[12px] text-[var(--color-muted)]">
                {row.reason ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '(empty)'
  if (typeof v === 'string') return v
  return JSON.stringify(v, null, 2)
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
      {children}
    </th>
  )
}
