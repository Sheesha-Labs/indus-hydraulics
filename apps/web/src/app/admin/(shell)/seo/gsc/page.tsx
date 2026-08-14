import type { Metadata } from 'next'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'Google Search Console — Indus Admin' }

/**
 * GSC integration. Schema is in place (`GscMetricDaily`); the OAuth
 * flow + daily sync function need real Google client credentials, which
 * have to be provisioned in the GCP console — so this page is a
 * configuration dashboard rather than an inline wizard.
 *
 * Once GOOGLE_OAUTH_CLIENT_ID / _SECRET are set, a follow-up commit
 * will add:
 *   - /api/gsc/oauth/start  — redirect to Google's consent screen
 *   - /api/gsc/oauth/callback — exchange code → refresh token, store on
 *     a new `GscConnection` row
 *   - Inngest cron `gsc.daily.sync` paginating searchanalytics.query
 *     into `GscMetricDaily` rows
 *   - Inspector grid join on URL → impressions / CTR / position
 */
export default async function GscPage() {
  const [metricsCount, lastSync] = await Promise.all([
    db.gscMetricDaily.count(),
    db.gscMetricDaily.findFirst({ orderBy: { date: 'desc' }, select: { date: true } }),
  ])

  const oauthConfigured = !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET
  )

  return (
    <div className="max-w-[800px]">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Tile label="Metric rows captured" value={metricsCount.toLocaleString()} />
        <Tile
          label="Last sync"
          value={
            lastSync
              ? lastSync.date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Never'
          }
        />
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6">
        <h2 className="text-[16px] font-semibold mb-2">
          {oauthConfigured ? 'OAuth configured — connection pending' : 'Setup required'}
        </h2>
        <p className="text-[13px] text-[var(--color-muted)] mb-4">
          GSC integration pulls per-URL clicks / impressions / CTR / position daily and joins
          them into the Inspector grid. The schema is in place; the OAuth flow needs a Google
          Cloud client.
        </p>

        <ol className="list-decimal pl-5 text-[13px] text-[var(--color-body)] space-y-2 mb-5">
          <li>
            Create a Google Cloud project + OAuth client (Web application). Authorized redirect
            URI: <code className="font-mono text-[11px] bg-[var(--color-deep)] px-1.5 py-0.5">
              {process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'}/admin/api/gsc/oauth/callback
            </code>.
          </li>
          <li>
            Enable the &ldquo;Search Console API&rdquo; on that project.
          </li>
          <li>
            Add to admin .env:
            <pre className="font-mono text-[11px] bg-[var(--color-deep)] p-2 mt-1 leading-relaxed">{`GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GSC_PROPERTY_URL=https://indushydraulics.com/`}</pre>
          </li>
          <li>
            Open this page after restart to start the OAuth flow (the Connect button appears
            once env vars are set).
          </li>
        </ol>

        <div
          className={`px-4 py-3 border ${
            oauthConfigured
              ? 'border-[oklch(0.75_0.12_70)]/40 bg-[oklch(0.96_0.05_70)]/40 text-[oklch(0.5_0.14_70)]'
              : 'border-[var(--color-border)] bg-[var(--color-deep)] text-[var(--color-muted)]'
          } text-[13px]`}
        >
          {oauthConfigured ? (
            <>
              OAuth env vars detected. The OAuth start endpoint and Inngest sync function will
              ship in a follow-up commit — they need to land together so the daily cron has
              somewhere to write.
            </>
          ) : (
            <>
              Google client credentials not set. Configure the env vars above to unlock the
              connection flow.
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
        {label}
      </div>
      <div className="text-[28px] font-semibold mt-1">{value}</div>
    </div>
  )
}
