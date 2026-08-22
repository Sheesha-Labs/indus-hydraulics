import Link from 'next/link'
import {
  MARKET_PAGE_RECORDS,
  marketBySlug,
  primaryRoute,
  transitScore,
} from '@indus/domain'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { requireStaff } from '../../../../lib/staff-session'

export const metadata = { title: 'Export markets' }

/**
 * The forwarder-review queue.
 *
 * Forty-six export-market pages are written; two are live. The rest are held
 * back because their regulatory prose — conformity schemes, document owners,
 * sequencing, transit bands, freight ladders — was written for the design and
 * has not been checked by anyone who moves freight for a living.
 *
 * This is the worklist for that review, and the only place the state is
 * visible. Without it "held back pending sign-off" is a comment in a data file
 * that nobody reads and no market ever leaves.
 *
 * Releasing one is still a code change (`released: true` on the record) rather
 * than a toggle here, deliberately: it is a claim going public, it should
 * arrive with a commit message and a reviewer, and it takes ten seconds.
 */
export default async function AdminMarketsPage() {
  await requireStaff()

  const rows = MARKET_PAGE_RECORDS.map((page) => {
    const market = marketBySlug(page.slug)
    return {
      slug: page.slug,
      name: market?.name ?? page.slug,
      code: market?.countryCode ?? '',
      currency: page.currency,
      mode: primaryRoute(page.map).mode,
      transit: page.freight[0].transit,
      days: transitScore(page.freight[0].transit),
      entry: page.map.crossing.name,
      released: page.released,
      verified: page.regulatoryCopy === 'verified',
    }
  })

  const pending = rows.filter((r) => !r.released)
  const live = rows.filter((r) => r.released)

  return (
    <AdminPageShell
      title="Export markets"
      breadcrumbs={`${rows.length} pages written · ${live.length} live · ${pending.length} awaiting forwarder sign-off`}
      bodyClassName="flex flex-col gap-6"
    >
      <div className="rounded-lg border border-ih-warning bg-ih-warning-soft px-4 py-3">
        <p className="text-[13px] leading-[1.55] text-ih-warning-ink">
          Regulatory copy on every market except Saudi Arabia was written for the design and has not
          been verified. Read the draft, get the conformity sequence checked by the forwarder, then
          ask for it to be released. A page that misstates a conformity sequence is worse than one
          that omits it, because a buyer acts on it.
        </p>
      </div>

      <MarketTable heading="Awaiting review" rows={pending} />
      <MarketTable heading="Live" rows={live} />
    </AdminPageShell>
  )
}

type Row = {
  slug: string
  name: string
  code: string
  currency: string
  mode: string
  transit: string
  days: number
  entry: string
  released: boolean
  verified: boolean
}

function MarketTable({ heading, rows }: { heading: string; rows: Row[] }) {
  if (rows.length === 0) return null
  return (
    <section>
      <h2 className="mb-3 text-[15px] font-medium tracking-[-0.01em]">
        {heading} <span className="mono text-[12px] text-ih-muted">· {rows.length}</span>
      </h2>
      <div className="overflow-x-auto rounded-lg border border-ih-border">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ih-border bg-ih-surface-2">
              {['Market', 'Code', 'Primary mode', 'Transit', 'Entry point', 'Quoted in', 'Copy'].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="mono px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug} className="border-b border-ih-border last:border-b-0 hover:bg-ih-surface-2">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/markets/${row.slug}`}
                    className="font-medium text-ih-accent hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="mono px-3 py-2 text-ih-ink-2">{row.code}</td>
                <td className="mono px-3 py-2 text-ih-ink-2">{row.mode}</td>
                <td className="mono px-3 py-2 text-ih-ink-2">{row.transit}</td>
                <td className="px-3 py-2 text-ih-muted">{row.entry}</td>
                <td className="mono px-3 py-2 text-ih-ink-2">{row.currency}</td>
                <td className="px-3 py-2">
                  {/* Colour never carries the meaning on its own — the word does. */}
                  <span
                    className={`mono text-[11px] uppercase tracking-[0.08em] ${
                      row.verified ? 'text-ih-success-ink' : 'text-ih-warning-ink'
                    }`}
                  >
                    {row.verified ? 'verified' : 'unverified'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
