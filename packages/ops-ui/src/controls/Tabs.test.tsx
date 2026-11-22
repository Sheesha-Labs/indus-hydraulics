/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import LinkTabs, { type TabItem } from './LinkTabs'
import PaneTabs from './PaneTabs'
import { tabItem, tabList } from './styles'

afterEach(cleanup)

const PANES: TabItem[] = [
  { key: 'reasons', label: 'Reasons' },
  { key: 'sources', label: 'Sources', count: 3 },
  { key: 'history', label: 'History' },
]

function Controlled({ onChange }: { onChange: (k: string) => void }) {
  const [tab, setTab] = useState('reasons')
  return (
    <PaneTabs
      aria-label="Drawer"
      items={PANES}
      value={tab}
      onValueChange={(k) => {
        setTab(k)
        onChange(k)
      }}
    >
      <p>Panel {tab}</p>
    </PaneTabs>
  )
}

describe('tab recipes', () => {
  it.each([
    ['pane', 'horizontal'],
    ['pane', 'vertical'],
    ['record', 'horizontal'],
    ['record', 'vertical'],
  ] as const)('%s/%s uses only defined io- classes', (tabsStyle, orientation) => {
    expect(
      problemsIn(`${tabList({ tabsStyle, orientation })} ${tabItem({ tabsStyle, orientation })}`)
    ).toEqual([])
  })
})

describe('PaneTabs', () => {
  it('is an ARIA tablist; the current tab owns the visible panel', () => {
    render(<Controlled onChange={() => {}} />)
    expect(screen.getByRole('tablist', { name: 'Drawer' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Reasons' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel reasons')
  })

  it('arrow keys move and select; Home and End jump', async () => {
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Reasons' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Sources 3' })).toHaveFocus()
    expect(onChange).toHaveBeenLastCalledWith('sources')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel sources')

    await userEvent.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith('history')
    await userEvent.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith('reasons')
  })
})

describe('LinkTabs', () => {
  it('is a nav of links, the current one aria-current="page"', () => {
    render(
      <LinkTabs
        aria-label="Record sections"
        tabsStyle="record"
        active="compare"
        items={[
          { key: 'overview', label: 'Overview', href: '?tab=overview' },
          { key: 'compare', label: 'Compare', href: '?tab=compare' },
        ]}
      />
    )
    expect(screen.getByRole('navigation', { name: 'Record sections' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.getByRole('link', { name: 'Compare' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
  })

  it('vertical orientation stacks the links', () => {
    render(
      <LinkTabs
        aria-label="Settings"
        tabsStyle="pane"
        orientation="vertical"
        active="a"
        items={[{ key: 'a', label: 'A', href: '?s=a' }]}
      />
    )
    expect(screen.getByRole('navigation', { name: 'Settings' })).toHaveClass('flex-col')
  })
})
