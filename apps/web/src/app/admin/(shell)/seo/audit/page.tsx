import type { Metadata } from 'next'
import { db } from '@indus/db'
import RevertButton from './RevertButton'

export const metadata: Metadata = { title: 'SEO Audit — Indus Admin' }

/**
 * Audit log viewer. Lists every SEO write across entity meta, redirects,
 * robots, and global SEO settings. Each row carries a Revert button
 * (wired through `revertChange` server action) that re-applies the
 * `before` value and writes a new audit row tagged `reason: 'reverted'`.
 */
export default async function SeoAuditPage() {
  const rows = await db.seoAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Resolve actor names in one round-trip rather than N+1.
  const actorIds = Array.from(
    new Set(rows.map((r) => r.actorId).filter((id): id is string => !!id))
  )
  const actors = actorIds.length
    ? await db.staffUser.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      })
    : []
  const actorById = new Map(actors.map((a) => [a.id, a.name]))

  if (rows.length === 0) {
    return (
      <div className="border-ih-border max-w-[800px] rounded-lg border py-16 text-center">
        <p className="text-ih-muted text-[13px]">
          No audit entries yet. Edits made from the SEO entity drawer or infrastructure pages will
          start populating this log.
        </p>
      </div>
    )
  }

  return (
    <div className="border-ih-border max-w-full overflow-hidden rounded-lg border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-ih-border bg-ih-surface-2 border-b">
            <Th>When</Th>
            <Th>Actor</Th>
            <Th>Entity</Th>
            <Th>Field</Th>
            <Th>Before → After</Th>
            <Th>Reason</Th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const actorName = row.actorId ? (actorById.get(row.actorId) ?? null) : null
            const isRevert = row.reason === 'reverted'
            const isInfra = row.entityType.startsWith('global:') || row.entityType === 'redirect'
            return (
              <tr
                key={row.id}
                className={`border-ih-border hover:bg-ih-surface-2 border-b align-top last:border-0 ${
                  isInfra ? 'bg-[oklch(0.98_0.02_70)]/40' : ''
                }`}
              >
                <td className="text-ih-muted px-3 py-3 text-[11px] whitespace-nowrap tabular-nums">
                  {row.createdAt.toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="text-ih-ink-2 px-3 py-3 text-[11px] tabular-nums">
                  {actorName ?? <span className="text-ih-muted">system</span>}
                </td>
                <td className="px-3 py-3 text-[11px] tabular-nums">
                  <div className={isInfra ? 'text-ih-warning-ink' : ''}>{row.entityType}</div>
                  {row.entityId && (
                    <div className="text-ih-muted max-w-[160px] truncate text-[11px]">
                      {row.entityId}
                    </div>
                  )}
                </td>
                <td className="text-ih-ink-2 px-3 py-3 text-[11px] tabular-nums">{row.field}</td>
                <td className="max-w-[480px] px-3 py-3 text-[12px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-ih-muted text-[11px] break-all whitespace-pre-wrap tabular-nums">
                      {formatValue(row.before)}
                    </div>
                    <div className="text-ih-ink-2 text-[11px] break-all whitespace-pre-wrap tabular-nums">
                      {formatValue(row.after)}
                    </div>
                  </div>
                </td>
                <td className="text-ih-muted px-3 py-3 text-[12px]">{row.reason ?? '—'}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  {!isRevert && (
                    <RevertButton
                      auditLogId={row.id}
                      beforeSummary={`${row.field} = ${formatValue(row.before)}`}
                    />
                  )}
                </td>
              </tr>
            )
          })}
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
    <th className="text-ih-muted px-3 py-2.5 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
      {children}
    </th>
  )
}
