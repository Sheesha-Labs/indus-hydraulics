import type { Metadata } from 'next'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'AI usage quota — Indus Admin' }

/**
 * Per-user monthly spend and cap. Read-only for now — adjusting caps is
 * a Phase 2 carry-forward; for v1 the default $50/mo per user is set in
 * the action layer (`ensureQuota` in seo/ai/actions.ts).
 */
export default async function AiQuotaPage() {
  const quotas = await db.aiUsageQuota.findMany({ orderBy: { spentThisMonthMicros: 'desc' } })
  const ids = quotas.map((q) => q.staffUserId)
  const users = ids.length
    ? await db.staffUser.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, email: true },
      })
    : []
  const userById = new Map(users.map((u) => [u.id, u]))

  if (quotas.length === 0) {
    return (
      <div className="border border-dashed border-ih-border py-16 text-center max-w-[800px]">
        <p className="text-ih-muted text-[13px]">
          No AI usage yet. Quota rows are created on first use.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-ih-border overflow-hidden max-w-[800px]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-ih-border bg-ih-surface-2">
            <Th>User</Th>
            <Th>Spent</Th>
            <Th>Cap</Th>
            <Th>Resets</Th>
          </tr>
        </thead>
        <tbody>
          {quotas.map((q) => {
            const u = userById.get(q.staffUserId)
            const pct = q.monthlyUsdCapMicros > 0
              ? (q.spentThisMonthMicros / q.monthlyUsdCapMicros) * 100
              : 0
            /*
              Plain CSS values: this feeds an inline style, where Tailwind's
              underscore-for-space arbitrary-value syntax is not valid CSS.
              The old values were 'oklch(0.5_0.18_25)' etc., so the bar
              painted NOTHING above 60% — and the else-branch fell through to
              a hard-coded oklch(0.62 0.16 45), which is the v1 orange this
              migration removed.
            */
            const tone =
              pct >= 90
                ? 'var(--color-ih-danger)'
                : pct >= 60
                  ? 'var(--color-ih-warning)'
                  : 'var(--color-ih-accent)'
            return (
              <tr
                key={q.id}
                className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
              >
                <td className="px-3 py-3">
                  <div className="text-ih-ink-2">{u?.name ?? '(unknown)'}</div>
                  <div className="font-mono text-[11px] text-ih-muted">{u?.email ?? q.staffUserId}</div>
                </td>
                <td className="px-3 py-3" style={{ minWidth: 220 }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-ih-surface-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${Math.min(100, pct)}%`, background: tone }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-ih-muted tabular-nums whitespace-nowrap">
                      ${(q.spentThisMonthMicros / 1_000_000).toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono text-[12px] tabular-nums">
                  ${(q.monthlyUsdCapMicros / 1_000_000).toFixed(0)}
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-ih-muted">
                  {q.resetAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">
      {children}
    </th>
  )
}
