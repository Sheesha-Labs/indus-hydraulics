import type { Metadata } from 'next'
import { db, Prisma } from '@indus/db'

export const metadata: Metadata = { title: 'Query analytics — Indus Admin' }

/**
 * Read-only analytics over `SearchQueryLog`. Three reports:
 *   - Top queries (volume by normalised form, last 30d)
 *   - Zero-result queries (ones that returned nothing — easy wins for synonym groups)
 *   - High-volume / no-click queries (returned results but nobody clicked — UX or relevance issue)
 *
 * All three are aggregated in SQL because the table can grow large and a
 * grouped scan in Prisma would be wasteful.
 */
const WINDOW_DAYS = 30

export default async function QueryAnalyticsPage() {
  // Server component renders once per request — Date.now is the right
  // call for the rolling N-day analytics window.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const [topQueries, zeroResultQueries, noClickQueries, totals] = await Promise.all([
    db.$queryRaw<Array<{ normalized: string; count: bigint; avgResults: number; clicked: bigint }>>(
      Prisma.sql`
        SELECT normalized,
               COUNT(*)::bigint AS count,
               AVG("resultsCount")::float AS "avgResults",
               COUNT(*) FILTER (WHERE "clickedSku" IS NOT NULL)::bigint AS clicked
        FROM search_query_logs
        WHERE "createdAt" >= ${since}
        GROUP BY normalized
        ORDER BY count DESC
        LIMIT 50
      `,
    ),
    db.$queryRaw<Array<{ normalized: string; count: bigint; lastSeen: Date }>>(
      Prisma.sql`
        SELECT normalized,
               COUNT(*)::bigint AS count,
               MAX("createdAt") AS "lastSeen"
        FROM search_query_logs
        WHERE "createdAt" >= ${since}
          AND "resultsCount" = 0
        GROUP BY normalized
        ORDER BY count DESC
        LIMIT 50
      `,
    ),
    db.$queryRaw<Array<{ normalized: string; count: bigint; avgResults: number }>>(
      Prisma.sql`
        SELECT normalized,
               COUNT(*)::bigint AS count,
               AVG("resultsCount")::float AS "avgResults"
        FROM search_query_logs
        WHERE "createdAt" >= ${since}
          AND "resultsCount" > 0
        GROUP BY normalized
        HAVING COUNT(*) >= 5
           AND COUNT(*) FILTER (WHERE "clickedSku" IS NOT NULL) = 0
        ORDER BY count DESC
        LIMIT 50
      `,
    ),
    db.$queryRaw<Array<{ totalQueries: bigint; uniqueQueries: bigint; clickThroughRate: number }>>(
      Prisma.sql`
        SELECT COUNT(*)::bigint AS "totalQueries",
               COUNT(DISTINCT normalized)::bigint AS "uniqueQueries",
               (COUNT(*) FILTER (WHERE "clickedSku" IS NOT NULL)::float
                  / GREATEST(COUNT(*), 1)) AS "clickThroughRate"
        FROM search_query_logs
        WHERE "createdAt" >= ${since}
      `,
    ),
  ])

  const summary = totals[0]
  const totalQueries = summary ? Number(summary.totalQueries) : 0
  const uniqueQueries = summary ? Number(summary.uniqueQueries) : 0
  const ctr = summary ? summary.clickThroughRate : 0

  return (
    <div className="max-w-[960px]">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Tile label={`Queries (last ${WINDOW_DAYS}d)`} value={totalQueries.toLocaleString()} />
        <Tile label="Unique queries" value={uniqueQueries.toLocaleString()} />
        <Tile label="Click-through rate" value={`${(ctr * 100).toFixed(1)}%`} accent />
      </div>

      <Section title={`Top queries (last ${WINDOW_DAYS} days)`}>
        {topQueries.length === 0 ? (
          <Empty>No queries yet.</Empty>
        ) : (
          <Table
            cols={['Query', 'Volume', 'Avg results', 'Click-through']}
            rows={topQueries.map((q) => [
              q.normalized,
              Number(q.count).toLocaleString(),
              q.avgResults != null ? q.avgResults.toFixed(1) : '—',
              `${formatRate(Number(q.clicked), Number(q.count))}`,
            ])}
            mono={[true, false, false, false]}
          />
        )}
      </Section>

      <Section title="Zero-result queries">
        <p className="mb-3 text-[12px] text-ih-muted">
          These returned nothing. Each one is a synonym candidate — define a group on{' '}
          <code>/seo/search/synonyms</code> to fix in one click.
        </p>
        {zeroResultQueries.length === 0 ? (
          <Empty>No zero-result queries — every search found at least one product.</Empty>
        ) : (
          <Table
            cols={['Query', 'Volume', 'Last seen']}
            rows={zeroResultQueries.map((q) => [
              q.normalized,
              Number(q.count).toLocaleString(),
              new Date(q.lastSeen).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              }),
            ])}
            mono={[true, false, false]}
          />
        )}
      </Section>

      <Section title="High volume / no clicks">
        <p className="mb-3 text-[12px] text-ih-muted">
          Queries that ran ≥5 times, returned results, but nobody clicked. UX or relevance issue
          — fix with synonym groups, query redirects, or boosts.
        </p>
        {noClickQueries.length === 0 ? (
          <Empty>Nothing here — click-through looks healthy.</Empty>
        ) : (
          <Table
            cols={['Query', 'Volume', 'Avg results']}
            rows={noClickQueries.map((q) => [
              q.normalized,
              Number(q.count).toLocaleString(),
              q.avgResults != null ? q.avgResults.toFixed(1) : '—',
            ])}
            mono={[true, false, false]}
          />
        )}
      </Section>
    </div>
  )
}

function formatRate(num: number, den: number): string {
  if (den === 0) return '—'
  return `${((num / den) * 100).toFixed(1)}%`
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
        {label}
      </div>
      <div className={`text-[28px] font-medium mt-1 ${accent ? 'text-ih-accent' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 text-center rounded-lg border border-ih-border text-[13px] text-ih-muted">
      {children}
    </div>
  )
}

function Table({
  cols,
  rows,
  mono,
}: {
  cols: string[]
  rows: string[][]
  mono: boolean[]
}) {
  return (
    <div className="border border-ih-border overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-ih-border bg-ih-surface-2">
            {cols.map((c) => (
              <th
                key={c}
                className="text-left px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 ${
                    mono[j] ? 'font-mono text-[12px] text-ih-ink-2' : 'text-ih-muted'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
