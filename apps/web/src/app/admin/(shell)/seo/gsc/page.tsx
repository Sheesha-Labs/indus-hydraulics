import type { Metadata } from 'next'
import { db } from '@indus/db'
import { GSC_PAGE_TOTAL_QUERY } from '@indus/domain'
import { checkGscAccess, readGscConfig } from '../../../../../lib/gsc'
import SyncNowButton from './SyncNowButton'

export const metadata: Metadata = { title: 'Google Search Console — Indus Admin' }
export const dynamic = 'force-dynamic'

/**
 * Search Console status.
 *
 * The sync itself is `gsc.daily.sync` in inngest/gscSync.ts, running at 05:00.
 * This page exists to answer one question — is it working, and if not, which
 * of the three setup steps is outstanding — so it calls the API live rather
 * than inferring readiness from whether env vars are present. A key that is
 * set but not authorised on the property looks identical to a working one
 * from the environment alone, and that is the failure mode people actually
 * hit.
 */
export default async function GscPage() {
  const config = readGscConfig()

  const [pageRows, queryRows, latest, earliest, access] = await Promise.all([
    db.gscMetricDaily.count({ where: { query: GSC_PAGE_TOTAL_QUERY } }),
    db.gscMetricDaily.count({ where: { NOT: { query: GSC_PAGE_TOTAL_QUERY } } }),
    db.gscMetricDaily.findFirst({ orderBy: { date: 'desc' }, select: { date: true } }),
    db.gscMetricDaily.findFirst({ orderBy: { date: 'asc' }, select: { date: true } }),
    config.ok ? checkGscAccess() : Promise.resolve({ ok: false, detail: config.reason }),
  ])

  const fmt = (d: Date | null | undefined) =>
    d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="max-w-[820px]">
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Page rows" value={pageRows.toLocaleString()} />
        <Tile label="Query rows" value={queryRows.toLocaleString()} />
        <Tile label="Earliest" value={fmt(earliest?.date)} />
        <Tile label="Latest" value={fmt(latest?.date)} />
      </div>

      <div
        className={`mb-6 border px-4 py-3 text-[13px] ${
          access.ok
            ? 'border-ih-border bg-ih-surface-2 text-ih-ink-2'
            : 'border-ih-border bg-ih-surface text-ih-ink-2'
        }`}
      >
        <span className="mono mr-2 text-[10.5px] font-medium uppercase tracking-[0.12em]">
          {access.ok ? 'Connected' : 'Not connected'}
        </span>
        {access.detail}
      </div>

      <div className="mb-6">
        <SyncNowButton disabled={!access.ok} />
      </div>

      <div className="border-ih-border bg-ih-surface border p-6">
        <h2 className="mb-2 text-[15px] font-medium">Setup</h2>
        <p className="text-ih-muted mb-4 text-[13px]">
          The sync runs nightly at 05:00 and backfills roughly the full retention window on its
          first successful run — the property has been verified for some time, so Google already
          holds the history. Until the credential is configured the job logs why it skipped and does
          nothing.
        </p>

        <ol className="text-ih-ink-2 mb-5 list-decimal space-y-3 pl-5 text-[13px]">
          <li>
            In Google Cloud, create a <strong>service account</strong> and download a JSON key.
            Enable the <em>Google Search Console API</em> on the same project. No OAuth consent
            screen is needed — this is a server-to-server credential.
          </li>
          <li>
            In Search Console, open <strong>Settings → Users and permissions → Add user</strong> and
            add the service account address with <strong>Full</strong> or{' '}
            <strong>Restricted</strong> access:
            <pre className="mono bg-ih-surface-2 mt-1 p-2 text-[11px] leading-relaxed">
              {config.ok ? config.config.clientEmail : 'the client_email from the JSON key'}
            </pre>
          </li>
          <li>
            Set two environment variables in Vercel (Production), then redeploy:
            <pre className="mono bg-ih-surface-2 mt-1 whitespace-pre-wrap p-2 text-[11px] leading-relaxed">
              {`GSC_SITE_URL=https://indushydraulics.com/
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}`}
            </pre>
            <span className="text-ih-muted mt-1 block">
              The whole JSON key goes in as one line. A URL-prefix property needs the trailing
              slash; a domain property is written{' '}
              <code className="mono">sc-domain:example.com</code>. They are different properties
              with different data.
            </span>
          </li>
        </ol>

        <p className="text-ih-muted text-[13px]">
          This page checks the credential against the API on every load, so refreshing it after each
          step tells you whether that step worked. Once it reads Connected,{' '}
          <strong>Sync now</strong> runs the job immediately rather than waiting for 05:00 — which
          is the difference between confirming the setup in a minute and confirming it tomorrow.
        </p>
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-ih-border bg-ih-surface border p-4">
      <div className="mono text-ih-muted text-[10.5px] uppercase tracking-[0.1em]">{label}</div>
      <div className="mt-1 text-[22px] font-medium">{value}</div>
    </div>
  )
}
