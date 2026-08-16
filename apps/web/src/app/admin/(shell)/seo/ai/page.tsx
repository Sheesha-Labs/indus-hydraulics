import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/admin-auth'

export const metadata: Metadata = { title: 'AI Generation — Indus Admin' }

/**
 * AI generation overview. Two operational sub-pages:
 *   - /seo/ai/quota   — per-user monthly cap + spend
 *   - /seo/ai/runs    — recent AiSuggestion rows (audit trail)
 *
 * The drawer's per-entity Suggest button is the primary entry point;
 * this page is for monitoring + cost control.
 */
export default async function SeoAiPage() {
  const session = await auth()
  const myUserId = session?.user?.id ?? null

  const [totalSpend, totalSuggestions, acceptanceCount, myQuota] = await Promise.all([
    db.aiSuggestion.aggregate({
      _sum: { costUsdMicros: true, inputTokens: true, outputTokens: true },
      where: { createdAt: { gte: monthStart() } },
    }),
    db.aiSuggestion.count({ where: { createdAt: { gte: monthStart() } } }),
    db.aiSuggestion.count({
      where: { status: 'accepted', createdAt: { gte: monthStart() } },
    }),
    myUserId
      ? db.aiUsageQuota.findUnique({ where: { staffUserId: myUserId } })
      : Promise.resolve(null),
  ])

  const spendMicros = totalSpend._sum.costUsdMicros ?? 0
  const acceptRate =
    totalSuggestions > 0 ? acceptanceCount / totalSuggestions : null

  return (
    <div className="max-w-[960px]">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Tile label="Spend (this month)" value={`$${(spendMicros / 1_000_000).toFixed(2)}`} accent />
        <Tile label="Suggestions generated" value={totalSuggestions.toLocaleString()} />
        <Tile
          label="Acceptance rate"
          value={acceptRate !== null ? `${(acceptRate * 100).toFixed(0)}%` : '—'}
        />
      </div>

      {myQuota && (
        <div className="border border-ih-border p-4 mb-6 max-w-[640px]">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
            Your quota
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 bg-ih-surface-2 overflow-hidden">
                <div
                  className="h-full bg-ih-accent"
                  style={{
                    width: `${Math.min(
                      100,
                      (myQuota.spentThisMonthMicros / myQuota.monthlyUsdCapMicros) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <span className="font-mono text-[12px] tabular-nums text-ih-muted whitespace-nowrap">
              ${(myQuota.spentThisMonthMicros / 1_000_000).toFixed(2)} / $
              {(myQuota.monthlyUsdCapMicros / 1_000_000).toFixed(0)}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 max-w-[640px]">
        <Link
          href="/admin/seo/ai/runs"
          className="flex-1 border border-ih-border p-4 hover:bg-ih-surface-2 transition-colors"
        >
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">
            Suggestion log
          </p>
          <p className="text-[14px] text-ih-ink">Recent generations →</p>
        </Link>
        <Link
          href="/admin/seo/ai/quota"
          className="flex-1 border border-ih-border p-4 hover:bg-ih-surface-2 transition-colors"
        >
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">
            Usage quota
          </p>
          <p className="text-[14px] text-ih-ink">Per-user spend →</p>
        </Link>
      </div>

      <p className="font-mono text-[11px] text-ih-muted mt-6 max-w-[640px]">
        Per-entity &ldquo;Suggest&rdquo; buttons appear next to title / description / focus
        keyword fields in every SEO drawer. Bulk catalogue generation via Anthropic Batches +
        Inngest is a Phase 2 carry-forward.
      </p>
    </div>
  )
}

function monthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">
        {label}
      </div>
      <div className={`text-[28px] font-semibold mt-1 ${accent ? 'text-ih-accent' : ''}`}>
        {value}
      </div>
    </div>
  )
}
