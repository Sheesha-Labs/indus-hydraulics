import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import KIT_PARTS from './__fixtures__/kit-parts.json'
import * as ui from './index'

/**
 * Export coverage (S01-T10): every part the handoff's components/*.md lists is exported from the barrel and
 * from its kit's own entry point. The part names were parsed once into __fixtures__/kit-parts.json (names
 * only); a local-only test below re-parses the handoff to prove the fixture is still current.
 */
type Kit = keyof typeof KIT_PARTS

/** The Shell kit (SectionHead, Sidebar, …) is built in S02. */
const NOT_YET: readonly Kit[] = ['shell']

/**
 * Parts exported under another name, each for a documented reason. Every other part is exported under its
 * own name.
 */
const RENAMED: Partial<Record<Kit, Record<string, { as: readonly string[]; why: string }>>> = {
  controls: {
    Tabs: {
      as: ['LinkTabs', 'PaneTabs'],
      why: 'split by behaviour: route tabs are links, in-page panes are Radix Tabs (05 §3.1)',
    },
    Search: {
      as: ['SearchTrigger', 'SearchInput'],
      why: 'the command-bar trigger and the inline filter field are separate client parts',
    },
  },
  status: {
    Stage: { as: ['StageTrack'], why: 'names what it draws; "Stage" is a status word' },
    Dot: {
      as: ['AssistantPill'],
      why: 'the kit part is the Assistant status pill, not a bare dot',
    },
    Bar: { as: ['ProgressBar'], why: '"Bar" collides with the Chart kit bars' },
    Vocabulary: {
      as: ['StatusVocabulary'],
      why: 'qualified so the barrel name says which vocabulary',
    },
  },
  table: {
    Table: {
      as: ['DataTable', 'DataTableClient'],
      why: 'the kit file lists no parts (the kit is one table grammar); server table + client selection',
    },
  },
  card: {
    KV: { as: ['KeyValue'], why: 'JSX names must be PascalCase (lint react/jsx-pascal-case)' },
    KPI: { as: ['Kpi'], why: 'JSX names must be PascalCase (lint react/jsx-pascal-case)' },
  },
  assistant: {
    Why: { as: ['WhyList'], why: 'a part name that reads as a noun in JSX' },
    Checks: { as: ['CheckList'], why: 'distinct from the Status kit Check mark' },
    Preview: { as: ['ProposalPreview'], why: 'scoped to the proposal card' },
    Confidence: { as: ['ConfidenceLine'], why: 'Confidence is the shared type (05 §3.0)' },
    Option: {
      as: ['OptionCard', 'OptionGroup'],
      why: 'one option card plus the radio group that owns the choice',
    },
    Source: { as: ['SourceQuote'], why: 'a part name that reads as a noun in JSX' },
    Unsure: { as: ['UnsureRow'], why: 'Unsure is a Confidence value' },
  },
  mail: {
    Folder: { as: ['MailFolder'], why: 'qualified for the barrel' },
    Message: { as: ['MailMessage'], why: 'qualified for the barrel' },
    Email: {
      as: ['RenderedEmail', 'SandboxedBody'],
      why: 'the recipient view, and the sandboxed frame every inbound body renders in',
    },
    Attachment: { as: ['AttachmentChip'], why: 'qualified for the barrel' },
  },
  document: {
    Page: { as: ['DocumentPage'], why: 'qualified for the barrel' },
    Viewer: { as: ['DocumentViewer'], why: 'qualified for the barrel' },
  },
  timeline: {
    Activity: { as: ['ActivityFeed'], why: 'a part name that reads as a noun in JSX' },
    Steps: { as: ['WizardSteps'], why: 'distinct from the Status kit stage track' },
  },
  form: {
    Section: { as: ['FormSection'], why: 'Section would shadow the HTML element name in JSX' },
  },
  overlay: {
    Toast: {
      as: ['ToastProvider', 'useToast'],
      why: 'toasts are raised through a provider and its hook (server-owned undo countdown)',
    },
  },
  states: {
    Empty: { as: ['EmptyState'], why: 'qualified for the barrel' },
    Loading: {
      as: ['TableSkeleton'],
      why: 'loading is a skeleton of the real layout; the Table kit owns it',
    },
    Error: { as: ['ErrorState'], why: 'Error would shadow the global' },
    Offline: { as: ['OfflineState'], why: 'qualified for the barrel' },
    Inline: { as: ['InlineState'], why: 'qualified for the barrel' },
  },
  chart: {
    Bars: { as: ['BarList'], why: 'names the layout (labelled horizontal bars)' },
    Stacked: { as: ['StackedBar'], why: 'a part name that reads as a noun in JSX' },
    Trend: { as: ['TrendChart'], why: 'a part name that reads as a noun in JSX' },
    FX: { as: ['FxTag'], why: 'JSX names must be PascalCase; it renders a tag' },
    VAT: { as: ['VatBlock'], why: 'JSX names must be PascalCase; it renders a block' },
  },
}

const exported = (mod: Record<string, unknown>, name: string): boolean =>
  typeof mod[name] === 'function' || (typeof mod[name] === 'object' && mod[name] !== null)

const kits = (Object.keys(KIT_PARTS) as Kit[]).filter((k) => !NOT_YET.includes(k))

describe('@indus/ops-ui', () => {
  it('exports its name', () => {
    expect(ui.OPS_UI).toBe('@indus/ops-ui')
  })

  it('the fixture lists all 13 kits and only part names', () => {
    expect(Object.keys(KIT_PARTS)).toHaveLength(13)
    for (const parts of Object.values(KIT_PARTS))
      for (const p of parts) expect(p).toMatch(/^[A-Z][A-Za-z]*$/)
  })

  it.each(kits)('every %s part is exported from the barrel and from its kit entry', async (kit) => {
    const entry = (await import(`./${kit}/index.ts`)) as Record<string, unknown>
    const barrel = ui as unknown as Record<string, unknown>
    const missing: string[] = []
    for (const part of KIT_PARTS[kit]) {
      for (const name of RENAMED[kit]?.[part]?.as ?? [part]) {
        if (!exported(barrel, name)) missing.push(`${part} → ${name} (barrel)`)
        if (!exported(entry, name)) missing.push(`${part} → ${name} (@indus/ops-ui/${kit})`)
      }
    }
    expect(missing).toEqual([])
  })

  it('every rename names a part the fixture lists, with a reason', () => {
    for (const [kit, map] of Object.entries(RENAMED))
      for (const [part, { as, why }] of Object.entries(map)) {
        expect(KIT_PARTS[kit as Kit], `${kit}.${part}`).toContain(part)
        expect(as.length).toBeGreaterThan(0)
        expect(why.length).toBeGreaterThan(10)
      }
  })

  const handoff = process.env.OPS_DESIGN_REF_DIR
    ? join(process.env.OPS_DESIGN_REF_DIR, 'components')
    : ''
  // Local only: the handoff is never in the repo or CI.
  it.skipIf(!(handoff && existsSync(handoff)))(
    'kit-parts.json matches the part lists in the handoff components/*.md',
    () => {
      const parsed: Record<string, string[]> = {}
      for (const file of readdirSync(handoff).toSorted()) {
        const m = /^\d+ (\w+)\.md$/.exec(file)
        if (!m) continue
        const text = readFileSync(join(handoff, file), 'utf8')
        const section = /^## Parts\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(text)?.[1] ?? ''
        const parts = [...section.matchAll(/^- `(\w+)`/gm)].map((p) => p[1]!)
        // A kit file without a Parts list (Table) is one part named after the kit.
        parsed[m[1]!.toLowerCase()] = parts.length > 0 ? parts : [m[1]!]
      }
      expect(KIT_PARTS).toEqual(parsed)
    }
  )
})
