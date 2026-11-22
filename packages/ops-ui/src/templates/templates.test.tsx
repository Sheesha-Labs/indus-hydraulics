import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import T1Index from './T1Index'
import T2Record, { type T2RecordProps } from './T2Record'
import T3Mail from './T3Mail'
import T4Review, { type T4BatchBar, type T4ReviewProps } from './T4Review'
import T5Document from './T5Document'
import T6Compare from './T6Compare'

// Templates are layout only: these tests read the static markup for slot order, landmarks and the grid
// tracks the L2 reference specifies (05 §5).

const mark = (name: string) => <i data-mark={name} />

/** The data-mark names in document order. */
function order(html: string): string[] {
  return [...html.matchAll(/data-mark="([^"]+)"/g)].map((m) => m[1]!)
}

/** The data-slot names in document order. */
function slots(html: string): string[] {
  return [...html.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]!)
}

describe('T1Index', () => {
  it('renders header, banner, list then preview, the preview as a labelled aside', () => {
    const html = renderToStaticMarkup(
      <T1Index header={mark('header')} banner={mark('banner')} preview={mark('preview')}>
        {mark('table')}
      </T1Index>
    )
    expect(order(html)).toEqual(['header', 'banner', 'table', 'preview'])
    expect(html).toContain('<aside data-slot="preview" aria-label="Preview"')
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-preview)]')
    expect(html).toContain('px-io-page-x py-4')
  })

  it('is one column and draws no banner or preview region without them', () => {
    const html = renderToStaticMarkup(<T1Index header={mark('header')}>{mark('table')}</T1Index>)
    expect(slots(html)).toEqual(['header', 'body', 'list'])
    expect(html).not.toContain('<aside')
    expect(html).toContain('grid-cols-[minmax(0,1fr)]')
  })
})

describe('T2Record', () => {
  it('renders header, strip, banner, tab body then the 330 rail', () => {
    const html = renderToStaticMarkup(
      <T2Record
        header={mark('header')}
        strip={mark('strip')}
        banner={mark('banner')}
        rail={mark('rail')}
      >
        {mark('tab')}
      </T2Record>
    )
    expect(order(html)).toEqual(['header', 'strip', 'banner', 'tab', 'rail'])
    expect(html).toContain('<aside data-slot="rail" aria-label="Record facts"')
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-rail)]')
    expect(html).toContain('gap-4')
  })

  it('bleeds edge to edge for a document tab, with no rail', () => {
    const html = renderToStaticMarkup(
      <T2Record header={mark('header')} strip={mark('strip')} body="bleed">
        {mark('tab')}
      </T2Record>
    )
    expect(html).toContain('data-body="bleed"')
    expect(html).not.toContain('px-io-page-x')
    expect(html).not.toContain('<aside')
    const bleedWithRail = {
      header: null,
      strip: null,
      children: null,
      body: 'bleed',
      rail: mark('rail'),
    } as const
    // @ts-expect-error a bleed body has no rail
    const props: T2RecordProps = bleedWithRail
    expect(props.body).toBe('bleed')
  })
})

describe('T3Mail', () => {
  it('renders header, banner, folders (nav), list, reading in order with the 210 · 400 · 1fr grid', () => {
    const html = renderToStaticMarkup(
      <T3Mail
        header={mark('header')}
        banner={mark('banner')}
        folders={mark('folders')}
        list={mark('list')}
        reading={mark('reading')}
      />
    )
    expect(order(html)).toEqual(['header', 'banner', 'folders', 'list', 'reading'])
    expect(html).toContain('<nav data-slot="folders" aria-label="Mail folders"')
    expect(html).toContain('grid-cols-[var(--io-w-folders)_var(--io-w-threads)_minmax(0,1fr)]')
    // Folders and list are white panes; the reading pane is on paper. Each scrolls on its own.
    const pane = (slot: string) =>
      html.match(new RegExp(`data-slot="${slot}"[^>]*class="([^"]+)"`))![1]!
    expect(pane('folders')).toContain('bg-io-card')
    expect(pane('list')).toContain('bg-io-card')
    expect(pane('reading')).toContain('bg-io-paper')
    for (const s of ['folders', 'list', 'reading']) expect(pane(s)).toContain('overflow-y-auto')
  })
})

describe('T4Review', () => {
  it('renders header, banner, the chasers batch bar, queue, then detail (440 · 1fr)', () => {
    const html = renderToStaticMarkup(
      <T4Review
        header={mark('header')}
        banner={mark('banner')}
        batch={{ batchKind: 'chasers', children: mark('batch') }}
        queue={mark('queue')}
        detail={mark('detail')}
      />
    )
    expect(order(html)).toEqual(['header', 'banner', 'batch', 'queue', 'detail'])
    expect(html).toContain('data-batch-kind="chasers"')
    expect(html).toContain('grid-cols-[var(--io-w-queue)_minmax(0,1fr)]')
  })

  it('accepts a batch bar for chasers only, at the type level', () => {
    // @ts-expect-error quotations are never batched
    const quotations: T4ReviewProps['batch'] = { batchKind: 'quotations', children: null }
    // @ts-expect-error supplier RFQs are never batched either
    const rfqs: T4ReviewProps['batch'] = { batchKind: 'rfqs', children: null }
    const bundle: T4ReviewProps = {
      variant: 'bundle',
      header: null,
      detail: null,
      documentTabs: null,
      bundle: null,
      // @ts-expect-error a bundle approves documents in one card; it has no batch bar
      batch: { batchKind: 'chasers', children: null },
    }
    // An untyped caller gets no bar for anything but chasers.
    const html = renderToStaticMarkup(
      <T4Review
        header={null}
        queue={mark('queue')}
        detail={null}
        batch={quotations as unknown as T4BatchBar}
      />
    )
    expect(html).not.toContain('data-slot="batch"')
    expect([rfqs, bundle]).toHaveLength(2)
  })

  it('bundle: document tabs under the header, bundle then detail (1fr · 400)', () => {
    const html = renderToStaticMarkup(
      <T4Review
        variant="bundle"
        header={mark('header')}
        documentTabs={mark('tabs')}
        bundle={mark('bundle')}
        detail={mark('detail')}
      />
    )
    expect(order(html)).toEqual(['header', 'tabs', 'bundle', 'detail'])
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-detail)]')
  })

  it('single-approver: the detail and a 440 side, no queue and no batch bar', () => {
    const html = renderToStaticMarkup(
      <T4Review
        variant="single-approver"
        header={mark('header')}
        detail={mark('detail')}
        side={mark('side')}
      />
    )
    expect(order(html)).toEqual(['header', 'detail', 'side'])
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-queue)]')
    expect(html).not.toContain('data-slot="queue"')
    expect(html).toContain('<aside data-slot="side" aria-label="Status"')
  })
})

describe('T5Document', () => {
  it('renders the 560 well on --io-well, then the side panel', () => {
    const html = renderToStaticMarkup(<T5Document well={mark('well')} side={mark('side')} />)
    expect(order(html)).toEqual(['well', 'side'])
    expect(html).toContain('grid-cols-[var(--io-w-well)_minmax(0,1fr)]')
    expect(html).toContain('bg-io-well')
  })
})

describe('T6Compare', () => {
  it('renders toolbar, grid, foot, then the 380 aside', () => {
    const html = renderToStaticMarkup(
      <T6Compare
        toolbar={mark('toolbar')}
        grid={mark('grid')}
        foot={mark('foot')}
        aside={mark('aside')}
      />
    )
    expect(order(html)).toEqual(['toolbar', 'grid', 'foot', 'aside'])
    expect(html).toContain('grid-cols-[minmax(0,1fr)_var(--io-w-scenarios)]')
    expect(html).toContain('<aside data-slot="aside" aria-label="Scenarios"')
  })

  it('is the grid card full width without an aside', () => {
    const html = renderToStaticMarkup(<T6Compare grid={mark('grid')} />)
    expect(slots(html)).toEqual(['main', 'grid'])
  })
})

describe('templates carry layout only', () => {
  const FILES = ['T1Index', 'T2Record', 'T3Mail', 'T4Review', 'T5Document', 'T6Compare', 'frame']

  it('use no type roles, text colours or kit surfaces beyond the two grounds and the pane rule', () => {
    for (const f of FILES) {
      const src = readFileSync(
        join(import.meta.dir, `${f}${f === 'frame' ? '.ts' : '.tsx'}`),
        'utf8'
      )
      // Only the card and paper grounds, the well, and the pane hairline.
      const io = [...src.matchAll(/\b(?:bg|text|border|shadow|rounded)-io-[a-z0-9-]+/g)].map(
        (m) => m[0]
      )
      const allowed = new Set(['bg-io-card', 'bg-io-paper', 'bg-io-well', 'border-io-line'])
      expect(io.filter((c) => !allowed.has(c)).map((c) => `${f}: ${c}`)).toEqual([])
      expect(/\btext-\[|\bfont-(?:medium|semibold)|\btracking-/.test(src) ? f : null).toBeNull()
      expect(problemsIn(src).map((p) => `${f}: ${p.message}`)).toEqual([])
    }
  })
})
