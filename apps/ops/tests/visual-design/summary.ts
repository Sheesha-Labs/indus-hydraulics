import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ParityRow } from './compare'

const ORDER: ParityRow['group'][] = [
  'Boards 74/75',
  'Templates',
  'Shell surfaces',
  'L1 k00',
  'L1 sheet',
  'L0 sheet',
]

/**
 * Writes $OPS_EVIDENCE_DIR/visual/<sprint>/summary.md from the rows the parity specs recorded
 * (compare.ts recordParity). Run by the Playwright global teardown; a no-op when nothing was recorded.
 */
export function writeSummary(): string | null {
  const base = process.env.OPS_EVIDENCE_DIR
  if (!base) return null
  const sprint = process.env.OPS_SPRINT ?? 's01'
  const dir = join(base, 'visual', sprint)
  const rowsDir = join(dir, 'parity')
  if (!existsSync(rowsDir)) return null
  const rows = readdirSync(rowsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(rowsDir, f), 'utf8')) as ParityRow & { at: string })
  if (rows.length === 0) return null
  const body: string[] = []
  let fails = 0
  for (const g of ORDER) {
    const inGroup = rows
      .filter((r) => r.group === g)
      .sort((a, b) => a.board.localeCompare(b.board, 'en', { numeric: true }))
    if (inGroup.length === 0) continue
    body.push(
      `## ${g}`,
      '',
      '| Board | Ratio | Compared area | Limit | Result | Masks and notes | Run (UTC) |',
      '|---|---|---|---|---|---|---|'
    )
    for (const r of inGroup) {
      const pass = r.ratio <= r.limit
      if (!pass) fails++
      const cells = [
        r.board,
        r.ratio.toFixed(4),
        r.area,
        String(r.limit),
        pass ? 'pass' : '**FAIL**',
        r.note,
        r.at.slice(0, 16).replace('T', ' '),
      ].map((c) => c.replace(/\|/g, '\\|'))
      body.push(`| ${cells.join(' | ')} |`)
    }
    body.push('')
  }
  const lines = [
    `# Design parity — ${sprint}`,
    '',
    'Written by `apps/ops/tests/visual-design/summary.ts` from the last run of each check (`bun run --filter @indus/ops test:visual:design`). Ratio = share of the compared pixels that differ (pixelmatch threshold 0.1; anti-aliased pixels are not counted). The ours/ref/diff PNGs of each check sit next to this file.',
    '',
    `**${rows.length} checks: ${rows.length - fails} pass, ${fails} fail.**`,
    '',
    ...body,
  ]
  const file = join(dir, 'summary.md')
  writeFileSync(file, lines.join('\n'))
  return file
}
