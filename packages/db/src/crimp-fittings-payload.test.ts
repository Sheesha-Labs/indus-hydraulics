import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guards on the frozen crimp fitting payload.
 *
 * Parker crimp numbers read `<style+series>-<END dash>-<HOSE dash>` —
 * `10643-6-4` is a -6 end on -4 hose — which is the reverse of our own
 * `<hose><port>` part-number suffix. The payload once carried all 193
 * asymmetric sizes with the two swapped, and a swapped number looks exactly
 * as plausible as a right one, so the order is pinned here.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const payload = JSON.parse(
  readFileSync(path.join(HERE, '../data/crimp-fittings/catalogue.json'), 'utf8'),
) as {
  products: {
    sku: string
    competitorRefs: string[]
    variants: {
      partNumber: string
      hoseDash: number
      portDash: number | null
      competitorMpn: string | null
    }[]
  }[]
}

const withMpn = payload.products.flatMap((p) =>
  p.variants.filter((v) => v.competitorMpn).map((v) => ({ sku: p.sku, refs: p.competitorRefs, v })),
)

describe('crimp fitting competitor numbers', () => {
  test('there are per-size numbers to check', () => {
    expect(withMpn.length).toBeGreaterThan(400)
  })

  test('every per-size number is <series ref>-<end dash>-<hose dash>', () => {
    const wrong = withMpn
      .filter(({ refs, v }) => {
        const m = v.competitorMpn!.match(/^(.+)-(\d+)-(\d+)$/)
        return (
          !m ||
          !refs.includes(m[1]!) ||
          Number(m[2]) !== v.portDash ||
          Number(m[3]) !== v.hoseDash
        )
      })
      .map(({ v }) => `${v.partNumber} ${v.competitorMpn}`)
    expect(wrong).toEqual([])
  })
})
