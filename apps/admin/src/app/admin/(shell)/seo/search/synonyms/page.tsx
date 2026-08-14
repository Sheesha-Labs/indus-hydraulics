import type { Metadata } from 'next'
import { db } from '@indus/db'
import SynonymsClient from './SynonymsClient'

export const metadata: Metadata = { title: 'Synonyms — Indus Admin' }

export default async function SynonymsPage() {
  const rows = await db.searchSynonym.findMany({
    orderBy: [{ group: 'asc' }, { term: 'asc' }],
    select: { group: true, term: true, isActive: true },
  })

  // Group rows in code so the client component can render one row per group.
  const groups = new Map<string, { terms: string[]; isActive: boolean }>()
  for (const r of rows) {
    const existing = groups.get(r.group)
    if (existing) {
      existing.terms.push(r.term)
      // A group counts as active if any of its rows are active. (We toggle
      // them all together, so this is just a safety reduction.)
      existing.isActive = existing.isActive || r.isActive
    } else {
      groups.set(r.group, { terms: [r.term], isActive: r.isActive })
    }
  }

  return (
    <SynonymsClient
      groups={Array.from(groups.entries()).map(([group, data]) => ({
        group,
        terms: data.terms,
        isActive: data.isActive,
      }))}
    />
  )
}
