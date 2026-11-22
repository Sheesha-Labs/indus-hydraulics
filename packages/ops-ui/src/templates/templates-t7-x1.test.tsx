import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import T7Settings from './T7Settings'
import T8Today, { type T8TodayProps } from './T8Today'
import T9Wizard, { type T9WizardProps } from './T9Wizard'
import T10Gantt from './T10Gantt'
import T11Auth from './T11Auth'
import T12Client from './T12Client'
import X1Exception from './X1Exception'

// S02-T05: templates T7–T12 and X1, layout only. Static markup for slot order, landmarks and the grid
// tracks of the L2 reference (05 §5) and of boards 195–200 for X1.

const mark = (name: string) => <i data-mark={name} />

function order(html: string): string[] {
  return [...html.matchAll(/data-mark="([^"]+)"/g)].map((m) => m[1]!)
}

/** The class attribute of the element carrying data-slot="<slot>". */
function slotClass(html: string, slot: string): string {
  return html.match(new RegExp(`data-slot="${slot}"[^>]*class="([^"]+)"`))![1]!
}

describe('T7Settings', () => {
  it('renders header, banner, the 220 sub-nav (nav) beside the sections', () => {
    const html = renderToStaticMarkup(
      <T7Settings header={mark('header')} banner={mark('banner')} subnav={mark('subnav')}>
        {mark('sections')}
      </T7Settings>
    )
    expect(order(html)).toEqual(['header', 'banner', 'subnav', 'sections'])
    expect(html).toContain('<nav data-slot="subnav" aria-label="Settings sections"')
    expect(html).toContain('grid-cols-[var(--io-w-subnav)_minmax(0,1fr)]')
    expect(slotClass(html, 'subnav')).toContain('bg-io-card')
    expect(slotClass(html, 'sections')).toContain('px-8 py-2')
  })
})

describe('T8Today', () => {
  it('owner: needs you, then came in · late two up, and the 320 rail', () => {
    const html = renderToStaticMarkup(
      <T8Today
        header={mark('header')}
        needsYou={mark('needs')}
        cameIn={mark('came')}
        late={mark('late')}
        rail={mark('rail')}
      />
    )
    expect(order(html)).toEqual(['header', 'needs', 'came', 'late', 'rail'])
    expect(html).toContain('data-variant="owner"')
    expect(html).toContain('<section data-slot="needs-you" aria-label="Needs you"')
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-today-rail)]')
    expect(html).toContain('grid grid-cols-2 items-start gap-3.5')
    expect(html).toContain('<aside data-slot="rail" aria-label="At a glance"')
  })

  it('first-run: the setup checklist takes the needs-you place', () => {
    const html = renderToStaticMarkup(
      <T8Today
        variant="first-run"
        header={mark('header')}
        setup={mark('setup')}
        rail={mark('rail')}
      />
    )
    expect(order(html)).toEqual(['header', 'setup', 'rail'])
    expect(html).not.toContain('data-slot="needs-you"')
    expect(html).not.toContain('data-slot="came-in"')
  })

  it('dashboard: a KPI row and a two-column card grid, no rail', () => {
    const html = renderToStaticMarkup(
      <T8Today variant="dashboard" header={mark('header')} kpis={mark('kpis')}>
        {mark('cards')}
      </T8Today>
    )
    expect(order(html)).toEqual(['header', 'kpis', 'cards'])
    expect(slotClass(html, 'cards')).toContain('grid-cols-2')
    expect(html).not.toContain('<aside')
  })

  it('types each variant’s slots', () => {
    // @ts-expect-error the owner home needs its needs-you stack
    const noNeeds: T8TodayProps = { header: null, cameIn: null, late: null, rail: null }
    const dash = { variant: 'dashboard', header: null, children: null, rail: null } as const
    // @ts-expect-error the dashboard has no rail
    const dashRail: T8TodayProps = dash
    expect([noNeeds, dashRail]).toHaveLength(2)
  })
})

describe('T9Wizard', () => {
  it('centred: a 760 card on paper, steps on top, the title as h1, back · skip · next in the foot', () => {
    const html = renderToStaticMarkup(
      <T9Wizard
        brand={mark('brand')}
        progress={mark('progress')}
        steps={mark('steps')}
        title="Bring in your history"
        back={mark('back')}
        saved={mark('saved')}
        skip={mark('skip')}
        next={mark('next')}
      >
        {mark('fields')}
      </T9Wizard>
    )
    expect(order(html)).toEqual([
      'brand',
      'progress',
      'steps',
      'fields',
      'back',
      'saved',
      'skip',
      'next',
    ])
    expect(html).toContain('data-layout="centred"')
    expect(html).toContain('w-io-wizard')
    expect(html).toContain('<h1 class="io-display text-io-record">Bring in your history</h1>')
    expect(html).toMatch(/data-template="T9"[^>]*class="bg-io-paper/)
  })

  it('rail (setup, boards 79–83): the 280 step rail, fields 3 : 2 with the live preview, a foot bar', () => {
    const html = renderToStaticMarkup(
      <T9Wizard
        layout="rail"
        brand={mark('brand')}
        steps={mark('steps')}
        railFoot={mark('rail-foot')}
        eyebrow="Setup 1 of 6"
        title="Company and documents"
        aside={mark('preview')}
        saved={mark('saved')}
        skip={mark('later')}
        back={mark('back')}
        next={mark('next')}
      >
        {mark('fields')}
      </T9Wizard>
    )
    expect(order(html)).toEqual([
      'brand',
      'steps',
      'rail-foot',
      'fields',
      'preview',
      'saved',
      'later',
      'back',
      'next',
    ])
    expect(html).toContain('grid-cols-[var(--io-w-wizard-rail)_minmax(0,1fr)]')
    expect(html).toContain('<nav data-slot="steps" aria-label="Setup steps">')
    expect(html).toContain('grid-cols-[minmax(0,3fr)_minmax(0,2fr)]')
    expect(html).toContain('<aside data-slot="aside" aria-label="Live preview"')
  })

  it('takes a preview aside only on the rail layout', () => {
    const centred = { steps: null, title: '', children: null, next: null, aside: null } as const
    // @ts-expect-error the centred card has no aside
    const centredAside: T9WizardProps = centred
    expect(centredAside.title).toBe('')
  })
})

describe('T10Gantt', () => {
  it('renders header, banner, controls then the chart full width', () => {
    const html = renderToStaticMarkup(
      <T10Gantt header={mark('header')} banner={mark('banner')} controls={mark('controls')}>
        {mark('gantt')}
      </T10Gantt>
    )
    expect(order(html)).toEqual(['header', 'banner', 'controls', 'gantt'])
    expect(html).toContain('grid-cols-[minmax(0,1fr)]')
    expect(html).toContain('px-io-page-x py-4')
  })
})

describe('T11Auth', () => {
  it('is the page main: a 400 card centred on paper, the footer inside the card', () => {
    const html = renderToStaticMarkup(<T11Auth footer={mark('footer')}>{mark('form')}</T11Auth>)
    expect(order(html)).toEqual(['form', 'footer'])
    expect(html).toMatch(/^<main id="content" data-template="T11"/)
    expect(html).toContain('min-h-screen')
    expect(slotClass(html, 'card')).toContain('w-io-auth')
    expect(html).not.toContain('data-part="sidebar"')
  })
})

describe('T12Client', () => {
  const html = renderToStaticMarkup(
    <T12Client
      brandBar={mark('brand')}
      banner={mark('banner')}
      eyebrow="Quotation · INDUS/Q10001-R2"
      title="Annual turnaround spares"
      document={mark('lines')}
      summary={mark('totals')}
      actions={mark('actions')}
      note={mark('note')}
    />
  )

  it('renders the brand bar (header), banner, then main: document, summary, actions, note', () => {
    expect(order(html)).toEqual(['brand', 'banner', 'lines', 'totals', 'actions', 'note'])
    expect(html).toContain('<header data-slot="brand-bar"')
    expect(html).toContain('<main id="content" data-slot="body"')
    expect(html).toContain('<h1 class="io-display text-io-record lg:text-io-section">')
  })

  it('is one column below 1024 and 1fr · 340 from 1024 (lg)', () => {
    const body = slotClass(html, 'body')
    expect(body).toContain('grid-cols-[minmax(0,1fr)] ')
    expect(body).toContain('lg:grid-cols-[minmax(0,1fr)_var(--io-w-client-aside)]')
    expect(body).toContain('px-4')
    expect(body).toContain('lg:px-14')
    // `lg` is Tailwind's 64rem (1024px): the Ops theme wipes colours, fonts, radii and shadows, never the
    // breakpoints, so the switch happens at 1024 exactly.
    const theme = readFileSync(join(import.meta.dir, '../styles/theme.css'), 'utf8')
    expect(theme).not.toMatch(/--breakpoint/)
  })

  it('puts the actions in a bar stuck to the bottom of a phone screen, static from 1024', () => {
    const actions = slotClass(html, 'actions')
    expect(actions).toContain('sticky bottom-0')
    expect(actions).toContain('lg:static')
  })
})

describe('X1Exception', () => {
  it('renders header, banner, the decision column then the 420 drafted-emails aside', () => {
    const html = renderToStaticMarkup(
      <X1Exception
        header={mark('header')}
        banner={mark('banner')}
        main={mark('decision')}
        side={mark('drafts')}
      />
    )
    expect(order(html)).toEqual(['header', 'banner', 'decision', 'drafts'])
    expect(html).toContain('<section data-slot="main" aria-label="Decision"')
    expect(html).toContain('<aside data-slot="side" aria-label="Drafted emails"')
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-exception-side)]')
    expect(slotClass(html, 'body')).toContain('gap-5')
    expect(slotClass(html, 'body')).toContain('pt-5 pb-7')
  })

  it('wide: a 440 side (boards 196, 201)', () => {
    const html = renderToStaticMarkup(
      <X1Exception variant="wide" header={null} main={null} side={null} />
    )
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-exception-side-wide)]')
  })
})

describe('T7–T12 and X1 carry layout only', () => {
  const FILES = [
    'T7Settings',
    'T8Today',
    'T9Wizard',
    'T10Gantt',
    'T11Auth',
    'T12Client',
    'X1Exception',
  ]
  // The grounds and pane rules, plus the card surface of the three page-level cards (T9 centred, T11)
  // and T12's sticky bar. Type: only the display face of a string title and the eyebrow role.
  const ALLOWED = new Set([
    'bg-io-card',
    'bg-io-paper',
    'border-io-line',
    'rounded-io-dialog',
    'shadow-io-e1',
  ])

  it('use no colours, type roles or surfaces beyond the grounds, the pane rule and the page cards', () => {
    for (const f of FILES) {
      const src = readFileSync(join(import.meta.dir, `${f}.tsx`), 'utf8')
      const io = [...src.matchAll(/\b(?:bg|text|border|shadow|rounded)-io-[a-z0-9-]+/g)].map(
        (m) => m[0]
      )
      const titles = new Set(['text-io-record', 'text-io-section'])
      expect(io.filter((c) => !ALLOWED.has(c) && !titles.has(c)).map((c) => `${f}: ${c}`)).toEqual(
        []
      )
      expect(/\btext-\[|\bfont-(?:medium|semibold)|\btracking-/.test(src) ? f : null).toBeNull()
      expect(problemsIn(src).map((p) => `${f}: ${p.message}`)).toEqual([])
    }
  })
})
