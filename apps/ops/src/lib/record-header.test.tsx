import { resolveHeaderState, type EnquiryStage, type RecordKind } from '@indus/ops-core'
import { RecordHeader } from '@indus/ops-ui/shell'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { recordHeaderFixture } from '../data/cockpit'
import { recordTabItems, tabsFor } from './record-tabs'

/**
 * The three record header kinds with the real tab sets (C8, C9, C11), rendered as the record layouts will
 * render them from getRecordHeaderState (S02-T07 wires the layouts).
 */
function renderKind(kind: RecordKind, ref: string, activeTab: string): string {
  const s = recordHeaderFixture(kind, ref, 'local')!
  return renderToStaticMarkup(
    <RecordHeader
      kind={s.kind}
      crumb={
        s.kind === 'order'
          ? { label: 'Orders', href: '/orders' }
          : { label: 'Enquiries', href: '/enquiries' }
      }
      client={{ label: s.clientName, href: s.clientHref }}
      reference={s.enquiryRef}
      title={s.title}
      meta={s.meta}
      stage={s.stage}
      tabs={recordTabItems(s.kind, s.ref)}
      activeTab={activeTab}
      {...(s.chip ? { chip: s.chip } : {})}
      {...(s.threadHref ? { threadHref: s.threadHref } : {})}
      logActivityHref="?log=1"
      cta={s.cta && 'href' in s.cta ? s.cta : { label: s.cta?.label ?? '', href: '#' }}
    />
  )
}

/** The <nav> holding the record's tabs. */
function tabNav(html: string): string {
  const m = /<nav aria-label="(?:Enquiry|Order|Tender) sections"[^>]*>([\s\S]*?)<\/nav>/.exec(html)
  if (!m) throw new Error('no tab nav')
  return m[1]!
}

const hrefs = (nav: string) => [...nav.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1])

describe('RecordHeader kinds', () => {
  it.each([
    ['enquiry', 'ENQ-2026-0001', 'overview', 11],
    ['order', 'SO-0001', 'freight', 9],
    ['tender', 'ENQ-2026-0001', 'timeline', 12],
  ] as const)('%s renders its tab set as links with aria-current on %s', (kind, ref, active, n) => {
    const html = renderKind(kind, ref, active)
    const nav = tabNav(html)
    expect(hrefs(nav)).toEqual(tabsFor(kind).map((t) => t.href(ref)))
    expect(hrefs(nav)).toHaveLength(n)
    const current = [...nav.matchAll(/<a [^>]*aria-current="page"[^>]*>([^<]+)/g)]
    expect(current.map((m) => m[1])).toEqual([tabsFor(kind).find((t) => t.key === active)!.label])
    expect(html).not.toContain('role="tab"')
  })

  it.each(['enquiry', 'order', 'tender'] as const)(
    '%s has exactly one primary action and one h1',
    (kind) => {
      const html = renderKind(kind, kind === 'order' ? 'SO-0001' : 'ENQ-2026-0001', 'overview')
      expect(html.match(/data-variant="primary"/g)).toHaveLength(1)
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    }
  )

  it('the order header keeps the enquiry number in its crumb (C11)', () => {
    const html = renderKind('order', 'SO-0001', 'freight')
    expect(html).toMatch(/<b aria-current="page"[^>]*>ENQ-2026-0001<\/b>/)
    expect(hrefs(tabNav(html))[0]).toBe('/orders/SO-0001/confirmation')
  })

  it.each([
    ['new', 'Enquiry'],
    ['qualifying', 'Enquiry'],
    ['pricing', 'Quotes in'],
    ['quoted', 'Quoted'],
    ['regretted', 'Won / Lost / Regretted'],
    ['won', 'Won / Lost / Regretted'],
  ] as const)(
    'stored stage %s shows the C7 display stage %s',
    (stored: EnquiryStage, shown: string) => {
      const s = resolveHeaderState({
        kind: 'enquiry',
        ref: 'ENQ-2026-0001',
        clientName: 'Sample Client LLC',
        clientHref: '/clients/1',
        title: 'Plant spares',
        meta: [
          { label: 'Client', value: 'Sample Client LLC' },
          { label: 'Client ref', value: 'SCL/0001' },
          { label: 'Received', value: '14 Sep' },
          { label: 'Client deadline', value: '30 Sep' },
        ],
        stage: stored,
      })
      const html = renderToStaticMarkup(
        <RecordHeader
          kind="enquiry"
          crumb={{ label: 'Enquiries', href: '/enquiries' }}
          client={{ label: s.clientName, href: s.clientHref }}
          reference={s.enquiryRef}
          title={s.title}
          meta={s.meta}
          stage={s.stage}
          tabs={recordTabItems('enquiry', s.ref)}
          activeTab="overview"
          cta={{ label: 'Next step', href: '/enquiries/ENQ-2026-0001' }}
        />
      )
      const step = /<li[^>]*aria-current="step"[^>]*>([\s\S]*?)<\/li>/.exec(html)
      expect(step?.[1]?.replace(/<[^>]+>/g, '')).toBe(shown)
    }
  )
})
