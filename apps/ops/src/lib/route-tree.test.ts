import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import {
  AUTOPILOT_HREF,
  DEVICES_HREF,
  NAV_DESTINATIONS,
  PROFILE_HREF,
} from '@indus/ops-ui/shell/nav'
import { describe, expect, it } from 'vitest'
import { ENQUIRY_TABS, ORDER_TABS, TENDER_TABS } from './record-tabs'
import { SETTINGS_NAV } from './settings-nav'

/**
 * The route tree (S02-T07, 05 §6.1, 10-architecture §6.4): every folder of the plan's table exists, every
 * data segment has its loading / error / not-found (05 §6.4), access is checked in every console page,
 * client pages never read a console session, no stray API route, and every href the app builds resolves
 * to a page.
 *
 * Why the href check is here and not only in typedRoutes: `(console)/@drawer/[...catchAll]` is a page that
 * matches every path, so Next's generated `Route` type accepts any string (a typo included). This test
 * resolves hrefs against the folders instead, ignoring that catch-all.
 */

const SRC = join(import.meta.dirname, '..')
const APP = join(SRC, 'app')

/** Every directory under app/, as a posix path relative to app/ ('' is app/ itself). */
function dirs(root = APP): string[] {
  const out: string[] = []
  const walk = (d: string) => {
    out.push(relative(APP, d).split(sep).join('/'))
    for (const e of readdirSync(d)) {
      const p = join(d, e)
      if (statSync(p).isDirectory()) walk(p)
    }
  }
  walk(root)
  return out
}

const ALL = dirs()
const has = (dir: string, file: string) => existsSync(join(APP, dir, file))
const read = (dir: string, file: string) => readFileSync(join(APP, dir, file), 'utf8')

/** The plan's route table (S02-T07), folder by folder, with the group each sits in. */
const TABLE: readonly string[] = [
  // (auth) · T11
  '(auth)/sign-in',
  '(auth)/sign-in/forgot',
  '(auth)/sign-in/reset/[token]',
  '(auth)/sign-in/invite/[token]',
  '(auth)/sign-in/two-factor',
  '(auth)/sign-in/two-factor/setup',
  // first run · T11 / T9 (decision: its own (setup) group, outside the console shell)
  '(setup)/welcome',
  '(setup)/setup/[step]',
  // (console)
  '(console)/today',
  '(console)/review',
  '(console)/mail',
  '(console)/mail/[folder]',
  '(console)/mail/[folder]/[threadId]',
  '(console)/enquiries',
  '(console)/enquiries/new',
  '(console)/enquiries/intake/[batchId]',
  '(console)/enquiries/leads',
  '(console)/enquiries/leads/[id]',
  '(console)/enquiries/[ref]',
  '(console)/enquiries/[ref]/lines',
  '(console)/enquiries/[ref]/suppliers',
  '(console)/enquiries/[ref]/suppliers/research/[gapId]',
  '(console)/enquiries/[ref]/rfqs',
  '(console)/enquiries/[ref]/rfqs/[rfqRef]',
  '(console)/enquiries/[ref]/questions',
  '(console)/enquiries/[ref]/compare',
  '(console)/enquiries/[ref]/deviations',
  '(console)/enquiries/[ref]/pricing',
  '(console)/enquiries/[ref]/quotation',
  '(console)/enquiries/[ref]/quotation/[rev]',
  '(console)/enquiries/[ref]/files',
  '(console)/enquiries/[ref]/activity',
  '(console)/enquiries/[ref]/tender/[section]',
  '(console)/quotations',
  '(console)/quotations/[no]',
  '(console)/orders',
  '(console)/orders/[ref]',
  ...[
    'confirmation',
    'advance',
    'suppliers',
    'inspection',
    'freight',
    'documents',
    'delivery',
    'invoices',
    'profit',
    'review',
    'exceptions/[kind]',
  ].map((s) => `(console)/orders/[ref]/${s}`),
  '(console)/money',
  '(console)/money/invoices/[no]',
  '(console)/money/payments/[id]',
  '(console)/money/close/[month]',
  '(console)/suppliers',
  '(console)/suppliers/new/[[...step]]',
  '(console)/suppliers/[id]',
  '(console)/suppliers/[id]/[section]',
  '(console)/clients',
  '(console)/clients/[id]',
  '(console)/parts',
  '(console)/parts/[partId]',
  '(console)/reports',
  '(console)/reports/overdue',
  '(console)/reports/winloss',
  '(console)/reports/pipeline',
  ...['autopilot', 'guardrails', 'cost', 'learned', 'log'].map((s) => `(console)/assistant/${s}`),
  '(console)/tasks',
  '(console)/callbacks',
  '(console)/search',
  '(console)/history-import/[[...step]]',
  '(console)/documents/[id]/share',
  '(console)/settings',
  ...[
    'company',
    'bank-accounts',
    'documents',
    'team',
    'notifications',
    'mailboxes',
    'sending',
    'templates',
    'pricing',
    'terms',
    'follow-up',
    'document-templates',
    'numbering',
    'intake',
    'integrations',
    'accounting',
    'privacy',
  ].map((s) => `(console)/settings/${s}`),
  '(console)/why/[evidenceId]',
  '(console)/@drawer/(.)why/[evidenceId]',
  // (client) · T12
  '(client)/q/[token]',
  '(client)/q/[token]/accept',
  '(client)/q/[token]/changes',
  '(client)/q/legacy/[code]',
  '(client)/d/[token]',
  '(client)/s/[token]',
  '(client)/u/[token]',
]

/** Layouts the table names (T2 record cockpits, T3 mail, T7 settings and supplier, Reports tabs). */
const LAYOUTS = [
  '(console)/mail',
  '(console)/enquiries/[ref]',
  '(console)/orders/[ref]',
  '(console)/suppliers/[id]',
  '(console)/reports',
  '(console)/settings',
]

/** Segments outside the data rule: the kit specimens and the drawer slot (which returns null or a drawer). */
const outsideRule = (dir: string) => dir.includes('%5Fkit') || dir.includes('@drawer')

/** Pages that are pure redirects and own no segment of their own. */
const REDIRECT_ONLY = new Set([''])

const GROUPS = ['(auth)', '(setup)', '(console)', '(client)']
const inGroups = (dir: string) => GROUPS.some((g) => dir === g || dir.startsWith(`${g}/`))

/** Folders that render something: a page or a layout. */
const SEGMENTS = ALL.filter(
  (d) => inGroups(d) && !GROUPS.includes(d) && (has(d, 'page.tsx') || has(d, 'layout.tsx'))
)

describe('route tree', () => {
  it('(a) every folder in the S02-T07 table exists with a page', () => {
    const missing = TABLE.filter((d) => !has(d, 'page.tsx'))
    expect(missing).toEqual([])
    expect(LAYOUTS.filter((d) => !has(d, 'layout.tsx'))).toEqual([])
  })

  it('(b) every data segment has loading.tsx, error.tsx and not-found.tsx', () => {
    const lacking = SEGMENTS.filter((d) => !outsideRule(d) && !REDIRECT_ONLY.has(d)).flatMap((d) =>
      ['loading.tsx', 'error.tsx', 'not-found.tsx']
        .filter((f) => !has(d, f))
        .map((f) => `${d}/${f}`)
    )
    expect(lacking).toEqual([])
    // error.tsx is a client component (Next requires it), so each one says so.
    const serverErrors = ALL.filter((d) => has(d, 'error.tsx')).filter(
      (d) => !/^'use client'/.test(read(d, 'error.tsx'))
    )
    expect(serverErrors).toEqual([])
  })

  it('(b) the (console) and (client) groups have their own boundaries, and both are dynamic', () => {
    for (const f of ['error.tsx', 'not-found.tsx']) {
      expect(has('(console)', f)).toBe(true)
      expect(has('(client)', f)).toBe(true)
    }
    for (const g of ['(console)', '(client)', '(setup)'])
      expect(read(g, 'layout.tsx')).toMatch(/export const dynamic = 'force-dynamic'/)
    expect(read('(client)', 'layout.tsx')).toMatch(/robots: \{ index: false, follow: false \}/)
  })

  it('(b) record segments show the "not imported" state (board 211)', () => {
    for (const d of [
      '(console)/enquiries',
      '(console)/enquiries/[ref]',
      '(console)/orders',
      '(console)/orders/[ref]',
      '(console)/quotations/[no]',
      '(console)/suppliers/[id]',
      '(console)/clients/[id]',
      '(console)/parts/[partId]',
      '(console)/mail/[folder]/[threadId]',
    ])
      expect([d, read(d, 'not-found.tsx').includes('RecordNotImported')]).toEqual([d, true])
  })

  it('(c) no folder starts with "_" except the kit (%5Fkit)', () => {
    const private_ = ALL.filter((d) => d.split('/').some((s) => s.startsWith('_')))
    expect(private_).toEqual([])
  })

  it('(d) no API route beyond the four S02 allows, plus the S03-T05 file route', () => {
    const api = ALL.filter((d) => d.startsWith('api') && has(d, 'route.ts')).sort()
    expect(api).toEqual([
      'api/auth/[...nextauth]',
      'api/files/[id]',
      'api/health',
      'api/health/live',
      'api/inngest',
    ])
    // No route handler hides in a page group either.
    expect(ALL.filter((d) => !d.startsWith('api') && has(d, 'route.ts'))).toEqual([])
  })

  it('(e) every signed-in page checks access itself', () => {
    const pages = SEGMENTS.filter(
      (d) => (d.startsWith('(console)') || d.startsWith('(setup)')) && has(d, 'page.tsx')
    )
    expect(pages.length).toBeGreaterThan(90)
    // The drawer catch-all renders nothing for every path (05 §6.3): no data, so no check.
    const unchecked = pages
      .filter((d) => d !== '(console)/@drawer/[...catchAll]')
      .filter((d) => !read(d, 'page.tsx').includes('requireOpsUser('))
    expect(unchecked).toEqual([])
  })

  it('(f) client and sign-in pages never read a console session', () => {
    const pages = SEGMENTS.filter(
      (d) => (d.startsWith('(client)') || d.startsWith('(auth)')) && has(d, 'page.tsx')
    )
    const reading = pages.filter((d) =>
      /requireOpsUser|requireOwner|lib\/auth'|\bauth\(\)|next\/headers/.test(read(d, 'page.tsx'))
    )
    expect(reading).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------------
// Href resolution

/** URL patterns of every page, route groups and slots removed, the drawer catch-all ignored. */
const PATTERNS: RegExp[] = SEGMENTS.filter(
  (d) => has(d, 'page.tsx') && !d.startsWith('(console)/@drawer')
).map((d) => {
  const parts = d.split('/').filter((s) => !/^\(.*\)$/.test(s))
  const re = parts
    .map((s) => {
      if (/^\[\[\.\.\.\w+\]\]$/.test(s)) return '(?:/[^/]+)*'
      if (/^\[\.\.\.\w+\]$/.test(s)) return '(?:/[^/]+)+'
      if (/^\[\w+\]$/.test(s)) return '/[^/]+'
      return `/${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('%5F', '_')}`
    })
    .join('')
  return new RegExp(`^${re || '/'}$`)
})

/** Does a page answer this href (search and hash dropped)? */
const resolves = (href: string) => {
  const path = href.split(/[?#]/)[0]!
  return PATTERNS.some((p) => p.test(path))
}

/** Every `to('…')` / to(`…`) literal in apps/ops/src, ${…} holes filled with a sample segment. */
function toLiterals(): { file: string; href: string }[] {
  const out: { file: string; href: string }[] = []
  const walk = (d: string) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.tsx?$/.test(e) && !/\.test\.tsx?$/.test(e)) {
        const text = readFileSync(p, 'utf8')
        for (const m of text.matchAll(/\bto\(\s*(['`])([^'`]*)\1\s*\)/g))
          out.push({ file: relative(SRC, p), href: m[2]!.replace(/\$\{[^}]+\}/g, 'X') })
      }
    }
  }
  walk(SRC)
  return out
}

describe('route tree · hrefs', () => {
  it('the resolver itself: known paths resolve, near misses do not', () => {
    expect(resolves('/enquiries/ENQ-2026-0001/lines')).toBe(true)
    expect(resolves('/history-import')).toBe(true)
    expect(resolves('/history-import/abc/review')).toBe(true)
    expect(resolves('/enquiries/ENQ-2026-0001/linez')).toBe(false)
    expect(resolves('/settings/teams')).toBe(false)
  })

  it('every record tab href resolves to its folder (enquiry, order, tender)', () => {
    const hrefs = [
      ...ENQUIRY_TABS.map((t) => t.href('ENQ-2026-0001')),
      ...TENDER_TABS.map((t) => t.href('ENQ-2026-0001')),
      ...ORDER_TABS.map((t) => t.href('SO-0001')),
    ]
    expect(hrefs.filter((h) => !resolves(h))).toEqual([])
    // and each tab's segment is the folder below the record layout
    const folders = [
      ...[...ENQUIRY_TABS, ...TENDER_TABS].map((t) => {
        const folder = t.segment.replace(/^tender\/\w+$/, 'tender/[section]')
        return `(console)/enquiries/[ref]${folder ? `/${folder}` : ''}`
      }),
      ...ORDER_TABS.map((t) => `(console)/orders/[ref]/${t.segment}`),
    ]
    expect(folders.filter((f) => !has(f, 'page.tsx'))).toEqual([])
  })

  it('every sidebar destination and menu link opens a page (incl. Money, C10)', () => {
    const hrefs = [
      ...NAV_DESTINATIONS.map((n) => n.href),
      AUTOPILOT_HREF,
      PROFILE_HREF,
      DEVICES_HREF,
    ]
    expect(hrefs.filter((h) => !resolves(h))).toEqual([])
    expect(NAV_DESTINATIONS.map((n) => n.href)).toContain('/money')
  })

  it('every settings sub-nav link opens a page', () => {
    const hrefs = SETTINGS_NAV.flatMap((g) => g.items.map((i) => i.href))
    expect(hrefs.filter((h) => !resolves(h))).toEqual([])
  })

  it('every to() literal in apps/ops resolves to a page', () => {
    const literals = toLiterals()
    expect(literals.length).toBeGreaterThan(30)
    expect(literals.filter((l) => !resolves(l.href))).toEqual([])
  })
})
