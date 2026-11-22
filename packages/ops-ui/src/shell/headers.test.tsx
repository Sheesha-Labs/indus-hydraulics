/**
 * @vitest-environment jsdom
 */
import '../overlay/test-env'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { act, cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import BannerSlot, { SYSTEM_BANNER_ORDER, type SystemBanner } from '../status/BannerSlot'
import AssistantStrip from './AssistantStrip'
import { ShellLiveProvider } from './live'
import NotificationBell from './NotificationBell'
import PageHeader from './PageHeader'
import RecordHeader, { type RecordHeaderProps } from './RecordHeader'
import { activeTabKey, adjacentTabHref, type RecordTab } from './record-tabs'
import TodayHeader from './TodayHeader'

// RecordTabs is activeTabKey(useSelectedLayoutSegments()). Outside a Next.js router the hook returns null
// (no layout context), so the URL-following half is covered through activeTabKey below and the rendering
// through a fixed `activeTab`. (Mocking next/navigation does not hold under the parallel, module-isolated
// test run: another file may load it first.)
afterEach(cleanup)

const TABS: RecordTab[] = [
  { key: 'overview', label: 'Overview', segment: '', href: '/enquiries/ENQ-2026-0001' },
  {
    key: 'lines',
    label: 'Lines',
    segment: 'lines',
    href: '/enquiries/ENQ-2026-0001/lines',
    count: 12,
  },
  {
    key: 'compare',
    label: 'Compare',
    segment: 'compare',
    href: '/enquiries/ENQ-2026-0001/compare',
  },
]

const TENDER: RecordTab[] = [
  {
    key: 'timeline',
    label: 'Timeline',
    segment: 'tender/timeline',
    href: '/enquiries/ENQ-2026-0001/tender/timeline',
  },
  { key: 'bid', label: 'Bid', segment: 'tender/bid', href: '/enquiries/ENQ-2026-0001/tender/bid' },
  { key: 'lines', label: 'Lines', segment: 'lines', href: '/enquiries/ENQ-2026-0001/lines' },
]

function header(over: Partial<RecordHeaderProps> = {}): RecordHeaderProps {
  return {
    kind: 'enquiry',
    crumb: { label: 'Enquiries', href: '/enquiries' },
    client: { label: 'Sample Client LLC', href: '/clients/1' },
    reference: 'ENQ-2026-0001',
    title: 'Plant spares',
    meta: [
      { label: 'Client', value: 'Sample Client LLC' },
      { label: 'Client ref', value: 'SCL/0001' },
      { label: 'Received', value: '14 Sep' },
      { label: 'Client deadline', value: '30 Sep · 8 days left', tone: 'bad' },
    ],
    threadHref: '/mail/clients?record=ENQ-2026-0001',
    stage: { flow: 'enquiry', current: 'Quotes in' },
    tabs: TABS,
    logActivityHref: '?log=1',
    cta: { label: 'Compare quotes', href: '/enquiries/ENQ-2026-0001/compare' },
    ...over,
  }
}

describe('record tab helpers', () => {
  it('picks the tab for the selected segments, skipping route groups', () => {
    expect(activeTabKey(TABS, [])).toBe('overview')
    expect(activeTabKey(TABS, ['lines'])).toBe('lines')
    expect(activeTabKey(TABS, ['(record)', 'compare'])).toBe('compare')
    expect(activeTabKey(TABS, ['compare', 'IH-RFQ-2611-P01'])).toBe('compare')
    expect(activeTabKey(TENDER, ['tender', 'bid'])).toBe('bid')
    expect(activeTabKey(TABS, ['questions'])).toBeUndefined()
    expect(activeTabKey(TABS, null)).toBeUndefined()
  })

  it('finds the neighbours for [ and ] without wrapping', () => {
    expect(adjacentTabHref(TABS, 'lines', 1)).toBe('/enquiries/ENQ-2026-0001/compare')
    expect(adjacentTabHref(TABS, 'lines', -1)).toBe('/enquiries/ENQ-2026-0001')
    expect(adjacentTabHref(TABS, 'compare', 1)).toBeUndefined()
    expect(adjacentTabHref(TABS, 'overview', -1)).toBeUndefined()
    expect(adjacentTabHref(TABS, 'nope', 1)).toBeUndefined()
  })
})

describe('RecordHeader', () => {
  it('renders the tabs as links, the active one aria-current="page" (not an ARIA tablist)', () => {
    render(<RecordHeader {...header({ activeTab: 'lines' })} />)
    const nav = screen.getByRole('navigation', { name: 'Enquiry sections' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual(TABS.map((t) => t.href))
    expect(within(nav).getByRole('link', { current: 'page' })).toHaveTextContent('Lines12')
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.queryByRole('tablist')).toBeNull()
  })

  it('without a router or a fixed tab, marks no tab as current', () => {
    render(<RecordHeader {...header()} />)
    const nav = screen.getByRole('navigation', { name: 'Enquiry sections' })
    expect(within(nav).queryByRole('link', { current: 'page' })).toBeNull()
  })

  it('publishes the [ / ] neighbours for the hotkey registry', () => {
    const { container } = render(<RecordHeader {...header({ activeTab: 'lines' })} />)
    const tabs = container.querySelector('[data-record-tabs]')!
    expect(tabs.getAttribute('data-prev-href')).toBe('/enquiries/ENQ-2026-0001')
    expect(tabs.getAttribute('data-next-href')).toBe('/enquiries/ENQ-2026-0001/compare')
  })

  it('has one primary action and the title as its only h1', () => {
    const { container } = render(<RecordHeader {...header()} />)
    expect(container.querySelectorAll('[data-variant="primary"]')).toHaveLength(1)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('Plant spares')
    expect(screen.getByRole('link', { name: 'Log activity' })).toHaveAttribute(
      'data-variant',
      'secondary'
    )
  })

  it('accepts a client element as the one primary action', () => {
    const { logActivityHref: _, ...rest } = header()
    const { container } = render(
      <RecordHeader
        {...rest}
        cta={
          <button type="button" data-variant="primary">
            Send for approval
          </button>
        }
      />
    )
    expect(container.querySelectorAll('[data-variant="primary"]')).toHaveLength(1)
    expect(screen.queryByRole('link', { name: 'Log activity' })).toBeNull()
  })

  it('crumb, meta, deadline tone and the Mail thread link', () => {
    render(<RecordHeader {...header()} />)
    const crumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(crumb).getByRole('link', { name: 'Enquiries' })).toHaveAttribute(
      'href',
      '/enquiries'
    )
    expect(within(crumb).getByText('ENQ-2026-0001')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('30 Sep · 8 days left')).toHaveClass('text-io-bad')
    expect(screen.getByRole('link', { name: 'Open thread in Mail ↗' })).toHaveAttribute(
      'href',
      '/mail/clients?record=ENQ-2026-0001'
    )
  })

  it('tender kind adds the navy Tender chip before its own chip', () => {
    render(
      <RecordHeader
        {...header({
          kind: 'tender',
          tabs: TENDER,
          activeTab: 'timeline',
          chip: { label: 'Closes in 5 d 22 h', tone: 'warn' },
        })}
      />
    )
    expect(screen.getByText('Tender')).toHaveAttribute('data-tone', 'navy')
    expect(screen.getByText('Closes in 5 d 22 h')).toHaveAttribute('data-tone', 'warn')
    expect(screen.getByRole('navigation', { name: 'Tender sections' })).toBeInTheDocument()
  })

  it.each([
    ['Enquiry', 'Enquiry'],
    ['Quotes in', 'Quotes in'],
    ['Regretted', 'Won / Lost / Regretted'],
  ] as const)('stage %s lights %s', (current, shown) => {
    render(<RecordHeader {...header({ stage: { flow: 'enquiry', current } })} />)
    const track = screen.getByRole('list', { name: 'Enquiry stage' })
    expect(track.querySelector('[aria-current="step"]')).toHaveTextContent(shown)
  })

  it('uses only io- classes that resolve', () => {
    const html = renderToStaticMarkup(
      <RecordHeader {...header({ kind: 'tender', chip: { label: 'Bank change', tone: 'warn' } })} />
    )
    expect(problemsIn(html)).toEqual([])
  })
})

describe('PageHeader', () => {
  it('title is the h1; steps, filters and summary render in their rows', () => {
    render(
      <PageHeader
        crumb="Selling"
        title="Quotations"
        meta="Last changed 2 days ago"
        tag="Level 2"
        steps={[
          { label: 'Mailboxes', state: 'done' },
          { label: 'Review', state: 'current' },
          { label: 'Import', state: 'todo' },
        ]}
        actions={<button type="button">Export</button>}
        filters={<span>Filters here</span>}
        summary="Awaiting decision: USD 600,000"
      />
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quotations')
    const steps = screen.getByRole('list', { name: 'Steps' })
    expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent('Review')
    expect(screen.getByText('Filters here')).toBeInTheDocument()
    expect(screen.getByText('Awaiting decision: USD 600,000')).toBeInTheDocument()
  })

  it('omits the search and filter rows when not given', () => {
    const html = renderToStaticMarkup(<PageHeader title="Reports" />)
    expect(html).not.toContain('border-t')
    expect(problemsIn(html)).toEqual([])
  })
})

describe('TodayHeader and the bell', () => {
  it('greeting is the h1; the pill and the bell with its count in the name', () => {
    render(
      <TodayHeader
        greeting="Good morning, Owner · Thursday 14 Nov"
        assistant="paused"
        notificationCount={3}
      />
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Good morning, Owner')
    expect(screen.getByText('Paused by you')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeInTheDocument()
  })

  it('the bell calls its own opener, else the shell provider’s', async () => {
    const own = vi.fn<() => void>()
    render(<NotificationBell count={0} onOpen={own} />)
    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(own).toHaveBeenCalledTimes(1)
    cleanup()

    const shell = vi.fn<() => void>()
    render(
      <ShellLiveProvider value={{ openNotifications: shell }}>
        <NotificationBell count={120} />
      </ShellLiveProvider>
    )
    const bell = screen.getByRole('button', { name: 'Notifications, 120 unread' })
    expect(bell).toHaveTextContent('99+')
    await userEvent.click(bell)
    expect(shell).toHaveBeenCalledTimes(1)
  })
})

describe('AssistantStrip', () => {
  it('shows what it did and links what needs a person to Review', () => {
    render(
      <AssistantStrip
        recordKey="record:ENQ-2026-0001"
        did="sent 4 RFQs, 2 quotes captured"
        need={{ label: '1 thing needs you', href: '/review?record=ENQ-2026-0001' }}
      />
    )
    expect(screen.getByText('Assistant')).toBeInTheDocument()
    expect(screen.getByText('sent 4 RFQs, 2 quotes captured')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /1 thing needs you/ })).toHaveAttribute(
      'href',
      '/review?record=ENQ-2026-0001'
    )
  })

  it('asks for fresh data when its live key moves after the first reading', () => {
    const onStale = vi.fn<() => void>()
    const strip = (n: number | undefined) => (
      <ShellLiveProvider value={n === undefined ? {} : { live: { 'record:ENQ-2026-0001': n } }}>
        <AssistantStrip recordKey="record:ENQ-2026-0001" did="did" onStale={onStale} />
      </ShellLiveProvider>
    )
    const { rerender } = render(strip(undefined))
    act(() => rerender(strip(4)))
    expect(onStale).not.toHaveBeenCalled()
    act(() => rerender(strip(4)))
    expect(onStale).not.toHaveBeenCalled()
    act(() => rerender(strip(5)))
    expect(onStale).toHaveBeenCalledTimes(1)
  })

  it('falls back to the shell provider’s refresh', () => {
    const refresh = vi.fn<() => void>()
    const strip = (n: number) => (
      <ShellLiveProvider value={{ live: { 'record:SO-0001': n }, refresh }}>
        <AssistantStrip recordKey="record:SO-0001" did="did" />
      </ShellLiveProvider>
    )
    const { rerender } = render(strip(1))
    act(() => rerender(strip(2)))
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})

describe('BannerSlot strip placement', () => {
  const ALL: SystemBanner[] = [...SYSTEM_BANNER_ORDER].reverse().map((kind) => ({
    kind,
    props: { tone: kind === 'mailbox-disconnected' ? 'bad' : 'info', children: `${kind} notice` },
  }))

  it('orders all six kinds, shows the most severe as a 40px strip and the rest behind +5 more', async () => {
    const { container } = render(<BannerSlot placement="strip" banners={ALL} />)
    expect(container.querySelector('[data-part="banner-slot"]')).toHaveAttribute(
      'data-placement',
      'strip'
    )
    const top = container.querySelector('[data-part="banner"]')!
    expect(top).toHaveTextContent('mailbox-disconnected notice')
    expect(top).toHaveClass('h-io-strip')
    expect(container.querySelectorAll('[data-part="banner"]')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: '+5 more' }))
    const list = screen.getByRole('list', { name: 'More system notices' })
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    ).toEqual(SYSTEM_BANNER_ORDER.slice(1).map((k) => `${k} notice`))
  })
})
