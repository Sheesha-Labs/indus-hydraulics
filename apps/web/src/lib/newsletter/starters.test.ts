import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('./records', () => ({
  latestRecordIds: async (kind: string, n: number) =>
    Array.from({ length: Math.min(n, 2) }, (_, i) => ({ id: `${kind}-${i}`, label: `${kind} ${i}`, hint: '' })),
}))

const { STARTERS, STARTER_META, starterDraft } = await import('./starters')
const { normaliseDesign, recordRefs } = await import('./blocks/document')
const { campaignProblems } = await import('./campaign')

describe('starters', () => {
  it('every starter has copy and survives normalisation intact', async () => {
    for (const s of STARTERS) {
      expect(STARTER_META[s].label).toBeTruthy()
      const d = await starterDraft(s)
      const design = normaliseDesign(d.design)
      expect(design.blocks.length).toBe((d.design as { blocks: unknown[] }).blocks.length)
    }
  })

  it('fills record blocks with the latest records', async () => {
    const refs = recordRefs(normaliseDesign((await starterDraft('new-stock')).design))
    expect(refs).toEqual([{ kind: 'product', ids: ['product-0', 'product-1'] }])
  })

  it('leaves only the subject — and the announcement body — for staff to write', async () => {
    const ok = { missingRecords: 0, listsFound: 0 }
    for (const s of STARTERS) {
      const p = campaignProblems({ ...(await starterDraft(s)), subject: 'May update' }, ok)
      if (s === 'blank') expect(p.body).toBe('Add at least one block.')
      else if (s === 'announcement') expect(p.body).toMatch(/template text/)
      else expect(p).toEqual({})
    }
  })
})
