import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guard (S09-T01): `server/enquiry/transition.ts` is the only writer of `enquiry.stage`, `enquiry_line.status`
 * and `lead.stage`. Every other file moves them through changeEnquiryStage / changeLineStatus /
 * changeLeadStage, so the machine is asked and the move is recorded.
 *
 * Scans apps/ops/src (not tests): a Prisma update, updateMany or upsert on enquiry, enquiryLine or lead whose
 * call text sets the field after `data:` / `update:` (including the `{ status }` shorthand), and raw SQL
 * `UPDATE ops.<table> SET … "<field>" =`.
 */
const SRC = join(import.meta.dir, '..', '..')
const ALLOWED = new Set(['server/enquiry/transition.ts'])

const MODELS: Record<string, string> = { enquiry: 'stage', enquiryLine: 'status', lead: 'stage' }
const TABLES: Record<string, string> = { enquiry: 'stage', enquiry_line: 'status', lead: 'stage' }

function callText(src: string, open: number): string {
  let depth = 0
  let i = open
  for (; i < src.length; i++) {
    if (src[i] === '(') depth++
    else if (src[i] === ')' && --depth === 0) break
  }
  return src.slice(open, i + 1)
}

function stageWrites(src: string): string[] {
  const hits: string[] = []
  const re = /\.\s*(enquiry|enquiryLine|lead)\s*\.\s*(update|updateMany|upsert)\s*\(/g
  for (let m = re.exec(src); m; m = re.exec(src)) {
    const field = MODELS[m[1]!]!
    const text = callText(src, m.index + m[0].length - 1)
    const at = text.search(/\b(data|update)\s*:/)
    if (at === -1) continue
    if (new RegExp(`[{,]\\s*${field}\\s*[:,}]`).test(text.slice(at)))
      hits.push(`line ${src.slice(0, m.index).split('\n').length}: ${m[1]}.${m[2]} sets ${field}`)
  }
  const sql = /UPDATE\s+ops\.(enquiry_line|enquiry|lead)\b([\s\S]*?)(;|`)/gi
  for (let m = sql.exec(src); m; m = sql.exec(src)) {
    const field = TABLES[m[1]!.toLowerCase()]!
    if (new RegExp(`"?${field}"?\\s*=`).test(m[2]!))
      hits.push(
        `line ${src.slice(0, m.index).split('\n').length}: SQL UPDATE ops.${m[1]} sets ${field}`
      )
  }
  return hits
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === 'node_modules' ? [] : files(p)
    return /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) ? [p] : []
  })
}

describe('stage and status are written only by transition.ts', () => {
  it('the scanner sees direct writes and ignores reads and other fields', () => {
    expect(
      stageWrites(`await tx.enquiry.update({ where: { id }, data: { stage: 'won' } })`)
    ).toHaveLength(1)
    expect(
      stageWrites(`t.enquiryLine.updateMany({ where: { id }, data: { status, heldReason } })`)
    ).toHaveLength(1)
    expect(
      stageWrites(`t.enquiryLine.updateMany({ where: { status: 'open' }, data: { heldReason } })`)
    ).toEqual([])
    expect(
      stageWrites(`tx.lead.upsert({ where, create: {}, update: { stage: 'new' } })`)
    ).toHaveLength(1)
    expect(stageWrites(`tx.enquiry.update({ where: { id }, data: { title: 'x' } })`)).toEqual([])
    expect(stageWrites('`UPDATE ops.enquiry SET "stage" = $1 WHERE id = $2`')).toHaveLength(1)
    expect(stageWrites('`UPDATE ops.enquiry_line SET "heldReason" = null`')).toEqual([])
  })

  const all = files(SRC).map((p) => relative(SRC, p))
  it.each(all.filter((f) => !ALLOWED.has(f)))('%s does not write stage or status', (f) => {
    expect(stageWrites(readFileSync(join(SRC, f), 'utf8'))).toEqual([])
  })

  it('transition.ts is still the writer', () => {
    expect(
      stageWrites(readFileSync(join(SRC, 'server/enquiry/transition.ts'), 'utf8')).length
    ).toBe(3)
  })
})
