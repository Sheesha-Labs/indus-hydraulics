import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'Redirect chains — Indus Admin' }

/**
 * Walks the active `Redirect` table as a graph and reports chains
 * (≥ 2 hops) and cycles. Computed on every page load — the table is
 * small enough that this is cheaper than maintaining a denormalised
 * cache. Each chain row shows the full hop list with the final
 * destination, so admins can flatten in one edit.
 */

type Chain = {
  fromPath: string
  hops: string[]
  /** True when the walk hit a cycle. */
  isCycle: boolean
  /** Total redirect rows traversed (hops.length - 1 for non-cycles). */
  hopCount: number
}

const MAX_HOPS = 16

export default async function RedirectChainsPage() {
  const redirects = await db.redirect.findMany({
    where: { isActive: true },
    select: { id: true, fromPath: true, toPath: true, statusCode: true },
  })

  const byFrom = new Map(redirects.map((r) => [r.fromPath, r.toPath]))
  const chains: Chain[] = []
  for (const r of redirects) {
    const visited = [r.fromPath]
    let current = r.toPath
    let hops = 0
    let isCycle = false
    while (byFrom.has(current) && hops < MAX_HOPS) {
      if (visited.includes(current)) {
        isCycle = true
        visited.push(current)
        break
      }
      visited.push(current)
      current = byFrom.get(current)!
      hops += 1
    }
    if (hops > 0) {
      // Push the final landing path (or the cycle re-entry point).
      if (!isCycle) visited.push(current)
      chains.push({
        fromPath: r.fromPath,
        hops: visited,
        isCycle,
        hopCount: hops,
      })
    }
  }

  // Cycles first, then deepest chains.
  chains.sort((a, b) => {
    if (a.isCycle !== b.isCycle) return a.isCycle ? -1 : 1
    return b.hopCount - a.hopCount
  })

  return (
    <div className="max-w-[960px]">
      <div className="mb-6 max-w-[720px] text-[13px] text-ih-muted">
        Multi-hop redirects waste crawl budget and slow real users. Cycles outright break the
        page. Each row below is a redirect whose target itself redirects — flatten by editing
        the source row to point straight at the final destination.{' '}
        <Link href="/admin/seo/redirects" className="underline">
          ← Back to redirects
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Tile label="Active redirects" value={redirects.length.toLocaleString()} />
        <Tile
          label="Chains (≥ 2 hops)"
          value={chains.filter((c) => !c.isCycle).length.toLocaleString()}
          accent
        />
        <Tile
          label="Cycles"
          value={chains.filter((c) => c.isCycle).length.toLocaleString()}
          danger={chains.some((c) => c.isCycle)}
        />
      </div>

      {chains.length === 0 ? (
        <div className="rounded-lg border border-ih-border py-16 text-center">
          <p className="text-ih-muted text-[13px]">
            No chains or cycles. Every redirect hops exactly once.
          </p>
        </div>
      ) : (
        <div className="border border-ih-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ih-border bg-ih-surface-2">
                <Th>Source</Th>
                <Th>Path</Th>
                <Th>Hops</Th>
              </tr>
            </thead>
            <tbody>
              {chains.map((c) => (
                <tr
                  key={c.fromPath}
                  className={`border-b border-ih-border last:border-0 hover:bg-ih-surface-2 align-top ${
                    c.isCycle ? 'bg-ih-danger-soft/40' : ''
                  }`}
                >
                  <td className="px-3 py-3 font-mono text-[12px] text-ih-ink-2">
                    {c.fromPath}
                    {c.isCycle && (
                      <div className="font-mono text-[10.5px] text-ih-danger-ink uppercase tracking-wider mt-1">
                        cycle
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-ih-muted">
                    {c.hops.map((h, i) => (
                      <span key={i}>
                        {i > 0 && <span className="opacity-50 mx-1">→</span>}
                        <span
                          className={
                            i === c.hops.length - 1 && !c.isCycle ? 'text-ih-ink-2' : ''
                          }
                        >
                          {h}
                        </span>
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] tabular-nums">{c.hopCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Tile({
  label,
  value,
  accent,
  danger,
}: {
  label: string
  value: string
  accent?: boolean
  danger?: boolean
}) {
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
        {label}
      </div>
      <div
        className={`text-[28px] font-medium mt-1 ${
          danger
            ? 'text-ih-danger-ink'
            : accent
              ? 'text-ih-accent'
              : ''
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
      {children}
    </th>
  )
}
