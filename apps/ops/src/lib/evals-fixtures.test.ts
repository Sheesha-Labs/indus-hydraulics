import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CLASSIFY_MODEL_CLASSES, MAIL_CLASSES } from '@indus/ops-core'
import { scoreClassify } from '../../evals/scorers/classify'
import { scoreLink } from '../../evals/scorers/link'

/**
 * The synthetic eval fixtures are public (S05-T04, CLAUDE.md §12): fictional text, reserved example domains
 * only (RFC 2606: .example, .test, example.com/.org/.net), unique ids, valid expected classes, and the sizes
 * the plan asks for (≥ 60 classify, ≥ 30 link).
 */
const ROOT = join(import.meta.dir, '../../evals/fixtures/synthetic')

function load(suite: string): Array<Record<string, unknown>> {
  const dir = join(ROOT, suite)
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .flatMap(
      (f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Array<Record<string, unknown>>
    )
}

const RESERVED = /(\.example|\.test|(^|\.)example\.(com|org|net))$/

describe('synthetic eval fixtures', () => {
  const classify = load('classify')
  const link = load('link')

  it('are big enough', () => {
    expect(classify.length).toBeGreaterThanOrEqual(60)
    expect(link.length).toBeGreaterThanOrEqual(30)
  })

  it('have unique ids and valid expectations', () => {
    expect(new Set(classify.map((c) => c.id)).size).toBe(classify.length)
    expect(new Set(link.map((c) => c.id)).size).toBe(link.length)
    for (const c of classify) {
      expect([...MAIL_CLASSES, 'unsure']).toContain(c.expect)
    }
    expect(CLASSIFY_MODEL_CLASSES).toContain('unsure')
  })

  it('use reserved example domains only', () => {
    for (const c of classify) {
      const domain = String(c.from).split('@')[1] ?? ''
      expect(RESERVED.test(domain), `${String(c.id)}: ${domain}`).toBe(true)
    }
    const text = JSON.stringify([...classify, ...link])
    for (const m of text.matchAll(/[a-z0-9.-]+@([a-z0-9.-]+)/gi)) {
      expect(RESERVED.test(m[1]!.toLowerCase()), m[0]).toBe(true)
    }
  })
})

describe('eval scorers', () => {
  it('classify: accuracy over the confident, unsure rate over all', () => {
    const s = scoreClassify(
      [
        { id: 'a', expect: 'client_enquiry' },
        { id: 'b', expect: 'supplier_quote' },
        { id: 'c', expect: 'unsure' },
        { id: 'd', expect: 'payment' },
      ],
      [
        { id: 'a', predicted: 'client_enquiry' },
        { id: 'b', predicted: 'supplier_other' },
        { id: 'c', predicted: null },
        { id: 'd', predicted: null },
      ]
    )
    expect(s).toMatchObject({
      confident: 2,
      correctConfident: 1,
      unsure: 2,
      accuracy: 0.5,
      unsureRate: 0.5,
      passes: false,
    })
    expect(s.misses.map((m) => m.id)).toEqual(['b', 'd'])
  })

  it('link: precision of links made, coverage of expected links', () => {
    const s = scoreLink(
      [
        { id: 'a', expect: 'enquiry:1' },
        { id: 'b', expect: null },
        { id: 'c', expect: 'enquiry:3' },
      ],
      [
        { id: 'a', predicted: 'enquiry:1' },
        { id: 'b', predicted: null },
        { id: 'c', predicted: null },
      ]
    )
    expect(s).toMatchObject({ linked: 1, precision: 1, coverage: 0.5, passes: true })
  })
})
