import type { Metadata } from 'next'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'AI suggestions log — Indus Admin' }

/**
 * Recent AiSuggestion rows. Read-only audit view — every Suggest call
 * lands here regardless of accept/reject, so admins can spot e.g. a
 * model regression where every suggestion is being rejected.
 */
export default async function AiRunsPage() {
  const rows = await db.aiSuggestion.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const actorIds = Array.from(
    new Set(rows.map((r) => r.createdById).filter((id): id is string => !!id)),
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
      <div className="border border-dashed border-[var(--color-border)] py-16 text-center max-w-[800px]">
        <p className="text-[var(--color-muted)] text-[13px]">
          No AI suggestions yet. Click &ldquo;Suggest&rdquo; in any SEO drawer to generate one.
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
            <Th>Actor</Th>
            <Th>Entity</Th>
            <Th>Field</Th>
            <Th>Output</Th>
            <Th>Status</Th>
            <Th>Cost</Th>
            <Th>Cache</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const actorName = row.createdById ? actorById.get(row.createdById) ?? null : null
            return (
              <tr
                key={row.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-deep)] align-top"
              >
                <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-muted)] whitespace-nowrap">
                  {row.createdAt.toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-3 py-3 text-[12px] text-[var(--color-body)]">
                  {actorName ?? <span className="text-[var(--color-muted)]">system</span>}
                </td>
                <td className="px-3 py-3 font-mono text-[11px]">
                  <div>{row.entityType}</div>
                  <div className="text-[var(--color-muted)] text-[10px] truncate max-w-[160px]">
                    {row.entityId}
                  </div>
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-body)]">
                  {row.field}
                </td>
                <td className="px-3 py-3 text-[12px] max-w-[360px] whitespace-pre-wrap break-words">
                  {row.output}
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-muted)] tabular-nums whitespace-nowrap">
                  ${(row.costUsdMicros / 1_000_000).toFixed(4)}
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-muted)] tabular-nums">
                  {row.cacheHitRatio !== null
                    ? `${(row.cacheHitRatio * 100).toFixed(0)}%`
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'accepted'
      ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
      : status === 'rejected'
        ? 'text-[oklch(0.5_0.18_25)] bg-[oklch(0.97_0.04_25)]'
        : status === 'superseded'
          ? 'text-[var(--color-muted)] bg-[var(--color-deep)]'
          : 'text-[oklch(0.5_0.14_70)] bg-[oklch(0.96_0.05_70)]'
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tone}`}>
      {status}
    </span>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
      {children}
    </th>
  )
}
