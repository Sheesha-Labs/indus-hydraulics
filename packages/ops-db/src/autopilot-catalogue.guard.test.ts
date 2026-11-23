import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Guard: the Autopilot catalogue in SQL agrees with the code (ADR-10, apps/ops/CLAUDE.md §17).
 *
 * Parses EVERY migration in packages/ops-db/migrations that inserts into ops.autopilot_action_def —
 * S03-T06's `…_ops_autopilot_catalogue_seed.sql` now, and each later `<ts>_ops_sNN_action_defs.sql` as
 * it lands — and fails when:
 *   * the union of inserted keys differs from ACTION_KEYS, or a key is inserted more than once;
 *   * a row's lockedLevel / maxLevel differs from LOCKED_LEVELS / MAX_LEVELS (FIXED_RULES included);
 *   * a key in SENDS_EXTERNALLY defaults above Draft and ask under Careful (CAREFUL_SEND_EXCEPTIONS
 *     aside) or has no autopilot_setting insert;
 *   * a key in PRICED_CLIENT_SENDS is neither locked nor capped at Draft and ask;
 *   * a default, or a seeded setting level, is one its own row would refuse.
 *
 * A later sprint adds a key with one INSERT … ON CONFLICT DO NOTHING in its action_defs migration, the
 * key in ACTION_KEYS and, if it emails anyone outside Indus, in SENDS_EXTERNALLY — in one commit.
 *
 * ops-db may not depend on ops-core (package-deps.test.ts), so the rules are loaded from the source
 * file at test time, by path.
 */

type Level = 'off' | 'suggest' | 'draft_and_ask' | 'do_and_tell' | 'do_quietly' | 'never'
type Mode = 'careful' | 'balanced' | 'hands_off'
type DefRow = {
  key: string
  configurable: boolean
  lockedLevel: Level | null
  maxLevel: Level | null
  defaultCareful: Level
  defaultBalanced: Level
  defaultHandsOff: Level
  position: number
  label: string
  description: string | null
  ruleText: string | null
  file: string
}
type SettingRow = { key: string; level: Level; rules: string; file: string }
type ResultLike = { success: boolean }
type Autopilot = {
  ACTION_KEYS: readonly string[]
  CATALOGUE_KEYS: readonly string[]
  SENDS_EXTERNALLY: readonly string[]
  PRICED_CLIENT_SENDS: readonly string[]
  FIXED_RULES: Record<string, Level>
  LOCKED_LEVELS: Record<string, Level>
  MAX_LEVELS: Record<string, Level>
  AUTOPILOT_MODES: readonly Mode[]
  actionPosition: (key: string) => number
  validateLevel: (
    def: { key: string; lockedLevel: Level | null; maxLevel: Level | null },
    level: Level
  ) => ResultLike
  presetLevels: (mode: Mode, defs: readonly DefRow[]) => Map<string, Level>
  carefulSendViolations: (defs: readonly DefRow[]) => string[]
}

const MIGRATIONS = join(import.meta.dirname, '..', 'migrations')
const AUTOPILOT_SRC = join(
  import.meta.dirname,
  '..',
  '..',
  'ops-core',
  'src',
  'autopilot',
  'index.ts'
)

// ── A small SQL reader: INSERT INTO <table> (cols) VALUES (…), (…) [ON CONFLICT …]; ──────────────

type Value = string | number | boolean | null

/** Strip `-- …` comments outside string literals. */
function stripComments(sql: string): string {
  let out = ''
  let inString = false
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i]
    if (inString) {
      out += c
      if (c === "'") {
        if (sql[i + 1] === "'") {
          out += "'"
          i++
        } else inString = false
      }
      continue
    }
    if (c === "'") {
      inString = true
      out += c
      continue
    }
    if (c === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++
      out += '\n'
      continue
    }
    out += c
  }
  return out
}

/** Read the tuples after VALUES until the statement's end (`;` or ON CONFLICT). */
function readTuples(sql: string, start: number): Value[][] {
  const rows: Value[][] = []
  let i = start
  let row: Value[] | null = null
  let token = ''
  const pushToken = () => {
    const t = token.trim()
    token = ''
    if (!row || t === '') return
    if (/^null$/i.test(t)) row.push(null)
    else if (/^true$/i.test(t)) row.push(true)
    else if (/^false$/i.test(t)) row.push(false)
    else if (/^-?\d+(\.\d+)?$/.test(t)) row.push(Number(t))
    // An expression such as now(): kept as its text.
    else if (/^[a-z_][a-z0-9_.]*\(.*\)$/i.test(t)) row.push(t)
    else throw new Error(`unsupported SQL value: ${t}`)
  }
  let depth = 0
  while (i < sql.length) {
    const c = sql[i]
    if (row === null) {
      if (c === '(') row = []
      else if (c === ';' || /^on\s+conflict/i.test(sql.slice(i, i + 12))) break
      i++
      continue
    }
    if (c === "'") {
      let s = ''
      i++
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          s += "'"
          i += 2
        } else if (sql[i] === "'") {
          i++
          break
        } else s += sql[i++]
      }
      // A cast after a literal ('{}'::jsonb) keeps the literal.
      const cast = /^::[a-z_."]+/i.exec(sql.slice(i))
      if (cast) i += cast[0].length
      row.push(s)
      continue
    }
    if (c === '(') depth++
    if (c === ')' && depth > 0) {
      depth--
      token += c
      i++
      continue
    }
    if (c === ',' && depth === 0) {
      pushToken()
      i++
      continue
    }
    if (c === ')') {
      pushToken()
      rows.push(row)
      row = null
      i++
      continue
    }
    token += c
    i++
  }
  return rows
}

const INSERT =
  /insert\s+into\s+(?:"?ops"?\.)?"?(autopilot_action_def|autopilot_setting)"?\s*\(([^)]*)\)\s*values/gi

function readInserts(file: string): { table: string; rows: Record<string, Value>[] }[] {
  const sql = stripComments(readFileSync(join(MIGRATIONS, file), 'utf8'))
  const out: { table: string; rows: Record<string, Value>[] }[] = []
  for (const m of sql.matchAll(INSERT)) {
    const cols = (m[2] ?? '').split(',').map((c) => c.trim().replace(/"/g, ''))
    const tuples = readTuples(sql, (m.index ?? 0) + m[0].length)
    out.push({
      table: m[1] ?? '',
      rows: tuples.map((t) => {
        if (t.length !== cols.length) {
          throw new Error(
            `${file}: ${t.length} values for ${cols.length} columns (${String(t[0])})`
          )
        }
        return Object.fromEntries(cols.map((c, i) => [c, t[i] ?? null]))
      }),
    })
  }
  return out
}

const files = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith('.sql'))
  .sort()
const parsed = files.map((file) => ({ file, inserts: readInserts(file) }))
const defFiles = parsed.filter((p) => p.inserts.some((i) => i.table === 'autopilot_action_def'))

const defs: DefRow[] = defFiles.flatMap(({ file, inserts }) =>
  inserts
    .filter((i) => i.table === 'autopilot_action_def')
    .flatMap((i) =>
      i.rows.map((r) => ({
        key: String(r.key),
        configurable:
          r.configurable === null || r.configurable === undefined ? true : r.configurable === true,
        lockedLevel: (r.lockedLevel ?? null) as Level | null,
        maxLevel: (r.maxLevel ?? null) as Level | null,
        defaultCareful: r.defaultCareful as Level,
        defaultBalanced: r.defaultBalanced as Level,
        defaultHandsOff: r.defaultHandsOff as Level,
        position: Number(r.position ?? 0),
        label: String(r.label),
        description: (r.description ?? null) as string | null,
        ruleText: (r.ruleText ?? null) as string | null,
        file,
      }))
    )
)

const settings: SettingRow[] = parsed.flatMap(({ file, inserts }) =>
  inserts
    .filter((i) => i.table === 'autopilot_setting')
    .flatMap((i) =>
      i.rows.map((r) => ({
        key: String(r.actionKey),
        level: r.level as Level,
        rules: String(r.rules ?? '{}'),
        file,
      }))
    )
)

describe('Autopilot catalogue guard', () => {
  let ap: Autopilot
  const byKey = new Map(defs.map((d) => [d.key, d]))

  beforeAll(async () => {
    ap = (await import(pathToFileURL(AUTOPILOT_SRC).href)) as Autopilot
  })

  it(`parses ${defFiles.length} migration file(s) that insert into autopilot_action_def`, () => {
    expect(defFiles.length).toBeGreaterThanOrEqual(1)
    expect(defFiles[0]?.file).toMatch(/_ops_autopilot_catalogue_seed\.sql$/)
    // Every later file is a sprint's own action_defs migration.
    for (const { file } of defFiles.slice(1)) expect(file).toMatch(/_ops_s\d{2}_action_defs\.sql$/)
  })

  it('inserts every key once, across every migration', () => {
    const seen = new Map<string, string[]>()
    for (const d of defs) seen.set(d.key, [...(seen.get(d.key) ?? []), d.file])
    const twice = [...seen].filter(([, f]) => f.length > 1).map(([k, f]) => `${k}: ${f.join(', ')}`)
    // A key is inserted by one migration only.
    expect(twice).toEqual([])
  })

  it('inserts exactly ACTION_KEYS', () => {
    const sql = [...new Set(defs.map((d) => d.key))].sort()
    expect(sql).toEqual([...ap.ACTION_KEYS].sort())
  })

  it('numbers the catalogue rows 1–32 and the rest from 101, each position once', () => {
    for (const d of defs) expect([d.key, d.position]).toEqual([d.key, ap.actionPosition(d.key)])
    expect(new Set(defs.map((d) => d.position)).size).toBe(defs.length)
  })

  it('locks exactly the rows code locks, at the same level (FIXED_RULES included)', () => {
    for (const d of defs) {
      expect([d.key, d.lockedLevel]).toEqual([d.key, ap.LOCKED_LEVELS[d.key] ?? null])
    }
    for (const [key, level] of Object.entries(ap.FIXED_RULES)) {
      expect(byKey.get(key)?.lockedLevel).toBe(level)
    }
  })

  it('caps exactly the rows code caps', () => {
    for (const d of defs) {
      expect([d.key, d.maxLevel]).toEqual([d.key, ap.MAX_LEVELS[d.key] ?? null])
    }
  })

  it('every priced client send is locked or capped at Draft and ask', () => {
    for (const key of ap.PRICED_CLIENT_SENDS) {
      const d = byKey.get(key)
      const held = d?.lockedLevel === 'draft_and_ask' || d?.maxLevel === 'draft_and_ask'
      expect([key, held]).toEqual([key, true])
    }
  })

  it('no external send defaults above Draft and ask under Careful (exceptions aside)', () => {
    expect(ap.carefulSendViolations(defs)).toEqual([])
  })

  it('every external send has a seeded setting', () => {
    const seeded = new Set(settings.map((s) => s.key))
    expect(ap.SENDS_EXTERNALLY.filter((k) => !seeded.has(k))).toEqual([])
  })

  it('seeds one setting per definition, at the Careful default', () => {
    expect(settings.map((s) => s.key).sort()).toEqual(defs.map((d) => d.key).sort())
    for (const s of settings)
      expect([s.key, s.level]).toEqual([s.key, byKey.get(s.key)?.defaultCareful])
  })

  it('chase_suppliers needs the first chaser approved under Careful', () => {
    const chase = settings.find((s) => s.key === 'chase_suppliers')
    expect(JSON.parse(chase?.rules ?? '{}')).toEqual({ firstNeedsApproval: true })
  })

  it('every default is a level its own row allows, and every preset applies', () => {
    for (const d of defs) {
      for (const level of [d.defaultCareful, d.defaultBalanced, d.defaultHandsOff]) {
        expect([d.key, level, ap.validateLevel(d, level).success]).toEqual([d.key, level, true])
      }
    }
    for (const mode of ap.AUTOPILOT_MODES) expect(() => ap.presetLevels(mode, defs)).not.toThrow()
  })

  it('carries a label for every row and never mentions WhatsApp (open item 4)', () => {
    for (const d of defs) {
      expect([d.key, d.label.trim().length > 0]).toEqual([d.key, true])
      expect(`${d.label} ${d.description ?? ''} ${d.ruleText ?? ''}`).not.toMatch(/whatsapp/i)
    }
  })
})
