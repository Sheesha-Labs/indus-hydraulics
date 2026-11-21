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
  const acceptRate = totalSuggestions > 0 ? acceptanceCount / totalSuggestions : null

  return (
    <div className="max-w-[960px]">
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Tile
          label="Spend (this month)"
          value={`$${(spendMicros / 1_000_000).toFixed(2)}`}
          accent
        />
        <Tile label="Suggestions generated" value={totalSuggestions.toLocaleString()} />
        <Tile
          label="Acceptance rate"
          value={acceptRate !== null ? `${(acceptRate * 100).toFixed(0)}%` : '—'}
        />
      </div>

      {myQuota && (
        <div className="border-ih-border mb-6 max-w-[640px] rounded-lg border p-4">
          <p className="text-ih-muted mb-2 text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
            Your quota
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="bg-ih-surface-2 h-2 overflow-hidden">
                <div
                  className="bg-ih-accent h-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (myQuota.spentThisMonthMicros / myQuota.monthlyUsdCapMicros) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-ih-muted text-[12px] whitespace-nowrap tabular-nums">
              ${(myQuota.spentThisMonthMicros / 1_000_000).toFixed(2)} / $
              {(myQuota.monthlyUsdCapMicros / 1_000_000).toFixed(0)}
            </span>
          </div>
        </div>
      )}

      <div className="flex max-w-[640px] gap-3">
        <Link
          href="/admin/seo/ai/runs"
          className="border-ih-border hover:bg-ih-surface-2 flex-1 rounded-lg border p-4 transition-colors"
        >
          <p className="text-ih-muted mb-1 text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
            Suggestion log
          </p>
          <p className="text-ih-ink text-[14px]">Recent generations →</p>
        </Link>
        <Link
          href="/admin/seo/ai/quota"
          className="border-ih-border hover:bg-ih-surface-2 flex-1 rounded-lg border p-4 transition-colors"
        >
          <p className="text-ih-muted mb-1 text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
            Usage quota
          </p>
          <p className="text-ih-ink text-[14px]">Per-user spend →</p>
        </Link>
      </div>

      <p className="text-ih-muted mt-6 max-w-[640px] text-[11px] tabular-nums">
        Per-entity &ldquo;Suggest&rdquo; buttons appear next to title / description / focus keyword
        fields in every SEO drawer. Bulk catalogue generation via Anthropic Batches + Inngest is a
        Phase 2 carry-forward.
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
    <div className="border-ih-border bg-ih-surface rounded-lg border p-4">
      <div className="text-ih-muted text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
        {label}
      </div>
      <div className={`mt-1 text-[28px] font-medium ${accent ? 'text-ih-accent' : ''}`}>
        {value}
      </div>
    </div>
  )
}
