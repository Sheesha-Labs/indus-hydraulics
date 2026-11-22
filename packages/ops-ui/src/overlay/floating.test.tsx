/**
 * @vitest-environment jsdom
 */
import './test-env'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import { MenuFrame, ModalFrame, ToastFrame } from './Frames'
import Menu, { blocksOf, type MenuEntry } from './Menu'
import Popover from './Popover'
import Tooltip from './Tooltip'

afterEach(cleanup)

const ITEMS: MenuEntry[] = [
  { type: 'item', label: 'Open' },
  { type: 'item', label: 'Open in new tab', shortcut: '⌘↵', href: '/enquiries/1' },
  { type: 'separator' },
  { type: 'item', label: 'Link to enquiry…' },
  { type: 'item', label: 'Move to…' },
  { type: 'item', label: 'Merge with…', disabled: true },
  { type: 'separator' },
  { type: 'group', label: 'Assistant' },
  { type: 'item', label: 'Explain this', shortcut: '?' },
  { type: 'item', label: 'Undo last action', shortcut: '⌘Z' },
  { type: 'separator' },
  { type: 'item', label: 'Delete draft', danger: true },
]

const active = () => document.activeElement as HTMLElement | null

describe('Menu', () => {
  function setup(onSelect = vi.fn<() => void>()) {
    const items = ITEMS.map((e) =>
      e.type === 'item' && e.label === 'Move to…' ? { ...e, onSelect } : e
    )
    render(<Menu trigger={<button type="button">Row actions</button>} items={items} />)
    return { trigger: screen.getByRole('button', { name: 'Row actions' }), onSelect }
  }

  it('opens from the keyboard with focus on the first item; arrows move and wrap', async () => {
    const { trigger } = setup()
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    const menu = screen.getByRole('menu')
    expect(active()).toHaveTextContent('Open')
    await userEvent.keyboard('{ArrowDown}')
    expect(active()).toHaveTextContent('Open in new tab')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    // loop: from the first item, up wraps to the last
    expect(active()).toHaveTextContent('Delete draft')
    expect(menu.contains(active())).toBe(true)
  })

  it('skips disabled items and finds items by typeahead', async () => {
    const { trigger } = setup()
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('m')
    expect(active()).toHaveTextContent('Move to…')
    await userEvent.keyboard('{ArrowDown}')
    // "Merge with…" is disabled: skipped
    expect(active()).toHaveTextContent('Explain this')
    // Typeahead matches the label only, never the shortcut text.
    await userEvent.keyboard('{Escape}{Enter}d')
    expect(active()).toHaveTextContent('Delete draft')
    expect(screen.getByRole('menuitem', { name: 'Merge with…' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('selecting runs the item and Escape returns focus to the trigger', async () => {
    const { trigger, onSelect } = setup()
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('m{Enter}')
    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).toBeNull()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(active()).toBe(trigger)
  })

  it('renders links, shortcuts, a labelled group, separators and the danger item', async () => {
    const { trigger } = setup()
    await userEvent.click(trigger)
    const link = screen.getByRole('menuitem', { name: /Open in new tab/ })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/enquiries/1')
    expect(link).toHaveTextContent('⌘↵')
    expect(screen.getByRole('group', { name: 'Assistant' })).toContainElement(
      screen.getByRole('menuitem', { name: /Explain this/ })
    )
    expect(screen.getAllByRole('separator')).toHaveLength(3)
    expect(screen.getByRole('menuitem', { name: 'Delete draft' })).toHaveAttribute('data-danger')
  })

  it('blocksOf groups items after a heading until the next separator', () => {
    expect(blocksOf(ITEMS).map((b) => b.kind)).toEqual([
      'items',
      'separator',
      'items',
      'separator',
      'group',
      'separator',
      'items',
    ])
  })
})

describe('Popover', () => {
  it('opens on click, is named by its title, Escape closes and returns focus', async () => {
    const onClick = vi.fn<() => void>()
    render(
      <Popover
        trigger={<button type="button">Landed cost</button>}
        title="Landed cost"
        action={{ label: 'Open breakdown', onClick }}
      >
        <span>Supplier price + freight + duty.</span>
      </Popover>
    )
    const trigger = screen.getByRole('button', { name: 'Landed cost' })
    await userEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Landed cost' })
    expect(dialog.contains(active())).toBe(true)
    expect(within(dialog).getByRole('button', { name: /Open breakdown/ })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(active()).toBe(trigger)
  })

  it('a button action runs and closes the popover', async () => {
    const onClick = vi.fn<() => void>()
    render(
      <Popover
        trigger={<button type="button">More</button>}
        title="2 more"
        action={{ label: 'See all', onClick }}
      >
        <span>Two more banners.</span>
      </Popover>
    )
    await userEvent.click(screen.getByRole('button', { name: 'More' }))
    await userEvent.click(screen.getByRole('button', { name: /See all/ }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('Tooltip', () => {
  it('opens on keyboard focus and describes a trigger that already has its own name', async () => {
    render(
      <Tooltip content="Explains the landed-cost figure">
        <button type="button" aria-label="About landed cost">
          i
        </button>
      </Tooltip>
    )
    const trigger = screen.getByRole('button', { name: 'About landed cost' })
    await userEvent.tab()
    expect(active()).toBe(trigger)
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('Explains the landed-cost figure')
    // Supplementary only: the name is the trigger's own, the tooltip is a description.
    expect(trigger).toHaveAccessibleName('About landed cost')
    expect(trigger).toHaveAccessibleDescription('Explains the landed-cost figure')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('still frames', () => {
  it('render from the server with no dialog roles and no live behaviour', () => {
    const html = renderToStaticMarkup(
      <>
        <ModalFrame
          title="Block Example Valve Co?"
          tone="danger"
          consequences={['A', 'B']}
          actions={null}
        >
          <p>Body</p>
        </ModalFrame>
        <ToastFrame kind="success" title="Sent" action="Undo" />
        <MenuFrame items={ITEMS} />
      </>
    )
    expect(html).toContain('data-frame="modal"')
    expect(html).toContain('text-io-bad')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('role="menu"')
    expect(html).not.toContain('style=')
    expect(html).toContain('Done: </span>Sent')
  })
})
