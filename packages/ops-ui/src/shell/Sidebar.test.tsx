/**
 * @vitest-environment jsdom
 */
import '../overlay/test-env'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { act, cleanup, render, screen, userEvent, within } from '../lib/test-dom'
import { ShellLiveProvider } from './live'
import Sidebar, { type SidebarProps } from './Sidebar'

afterEach(() => {
  cleanup()
  // jsdom has no Cookie Store API, so the sidebar falls back to document.cookie and so does the reset.
  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = 'ops_sidebar=; max-age=0; path=/'
})

const OWNER = {
  name: 'Owner Example',
  initials: 'OE',
  role: 'owner',
  roleLabel: 'Owner',
  mailbox: 'sales@',
} as const
const HELPER = {
  name: 'Helper Example',
  initials: 'HE',
  role: 'helper',
  roleLabel: 'Helper · sourcing',
  mailbox: 'purchase@',
} as const
const ADMIN = 'https://example.test/admin'

function props(over: Partial<SidebarProps> = {}): SidebarProps {
  return {
    user: OWNER,
    active: 'review',
    badges: { today: 6, review: 14, mail: 3 },
    assistant: 'running',
    collapsed: false,
    signOutAction: vi.fn<(f: FormData) => void>(),
    persist: false,
    ...over,
  }
}

const nav = () => screen.getByRole('navigation', { name: 'Main' })
const active = () => document.activeElement as HTMLElement | null

describe('Sidebar · expanded', () => {
  it('lists the destinations in board order with Money after Orders', () => {
    render(<Sidebar {...props({ badges: {} })} />)
    const names = within(nav())
      .getAllByRole('link')
      .map((a) => a.textContent)
    expect(names).toEqual([
      'Today',
      'Review',
      'Mail',
      'Enquiries',
      'Quotations',
      'Orders',
      'Money',
      'Suppliers',
      'Clients',
      'Parts',
      'Reports',
      'Autopilot',
      'Assistant log',
    ])
    expect(screen.getByRole('link', { name: 'Money' })).toHaveAttribute('href', '/money')
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
    expect(within(nav()).getAllByRole('group')).toHaveLength(5)
  })

  it('marks only the active item with aria-current="page"', () => {
    render(<Sidebar {...props({ active: 'money' })} />)
    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName('Money')
  })

  it('puts badge counts in the accessible name, not only in the pill', () => {
    render(<Sidebar {...props()} />)
    expect(screen.getByRole('link', { name: 'Review, 14 waiting' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Today, 6 waiting' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enquiries' })).toBeInTheDocument()
  })

  it('takes live counts from ShellLiveProvider over the rendered ones, and opens the command bar', async () => {
    const openCommand = vi.fn<() => void>()
    render(
      <ShellLiveProvider value={{ badges: { review: 2, mail: 0 }, openCommand }}>
        <Sidebar {...props()} />
      </ShellLiveProvider>
    )
    expect(screen.getByRole('link', { name: 'Review, 2 waiting' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mail' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Search/ }))
    expect(openCommand).toHaveBeenCalledOnce()
  })

  it('prints who is signed in and the mailbox, or a dash without one', () => {
    const { unmount } = render(<Sidebar {...props()} />)
    expect(screen.getByText('Signed in as Owner Example · sales@')).toBeInTheDocument()
    unmount()
    render(<Sidebar {...props({ user: { ...HELPER, mailbox: null } })} />)
    expect(screen.getByText('Signed in as Helper Example · —')).toBeInTheDocument()
  })
})

describe('Sidebar · Assistant pill', () => {
  it('shows the worst current state (C23)', () => {
    render(<Sidebar {...props({ assistant: ['running', 'paused', 'unsure'] })} />)
    const pill = screen.getByRole('button', { name: 'Paused by you' })
    expect(pill).toHaveAttribute('data-status', 'paused')
    expect(pill).toHaveTextContent('Paused by you')
  })

  it('opens Pause everything for the Owner and only the state for the Helper', async () => {
    const onPause = vi.fn<() => void>()
    const { unmount } = render(
      <Sidebar {...props({ onPause, assistantSummary: '37 actions this week · last 2 min ago' })} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Assistant · running' }))
    expect(screen.getByText('37 actions this week · last 2 min ago')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Pause everything' }))
    expect(onPause).toHaveBeenCalledOnce()
    unmount()
    render(<Sidebar {...props({ user: HELPER, onPause })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Assistant · running' }))
    expect(screen.queryByRole('button', { name: 'Pause everything' })).toBeNull()
    expect(
      screen.getByText('Only the Owner can pause or resume the Assistant.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Autopilot/ })).toHaveAttribute(
      'href',
      '/assistant/autopilot'
    )
  })

  it('offers Resume to the Owner while paused', async () => {
    const onResume = vi.fn<() => void>()
    render(<Sidebar {...props({ assistant: ['running', 'paused'], onResume })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Paused by you' }))
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(onResume).toHaveBeenCalledOnce()
  })
})

describe('Sidebar · profile menu', () => {
  it('shows Website admin ↗ to the Helper only, in a new tab', async () => {
    const { unmount } = render(<Sidebar {...props({ user: HELPER, websiteAdminHref: ADMIN })} />)
    await userEvent.click(screen.getByRole('button', { name: /account menu/ }))
    const admin = screen.getByRole('menuitem', { name: /Website admin/ })
    expect(admin).toHaveAttribute('href', ADMIN)
    expect(admin).toHaveAttribute('target', '_blank')
    expect(admin.getAttribute('rel')).toContain('noopener')
    unmount()
    render(<Sidebar {...props({ websiteAdminHref: ADMIN })} />)
    await userEvent.click(screen.getByRole('button', { name: /account menu/ }))
    expect(screen.queryByRole('menuitem', { name: /Website admin/ })).toBeNull()
    expect(screen.getAllByRole('menuitem').map((m) => m.textContent)).toEqual([
      'Profile',
      'Devices',
      'Sign out',
    ])
  })

  it('moves with the arrows and Escape returns focus to the avatar button', async () => {
    render(<Sidebar {...props()} />)
    const trigger = screen.getByRole('button', { name: 'Owner Example, Owner: account menu' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(active()).toHaveTextContent('Profile')
    await userEvent.keyboard('{ArrowDown}')
    expect(active()).toHaveTextContent('Devices')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    // loop: past Sign out, back to Profile
    expect(active()).toHaveTextContent('Profile')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(active()).toBe(trigger)
  })

  it('signs out through a form that posts to the server action', async () => {
    render(<Sidebar {...props()} />)
    await userEvent.click(screen.getByRole('button', { name: /account menu/ }))
    const signOut = screen.getByRole('menuitem', { name: 'Sign out' })
    expect(signOut).toHaveAttribute('type', 'submit')
    expect(signOut.closest('form')).not.toBeNull()
  })
})

describe('Sidebar · collapsed', () => {
  it('gives every icon-only item a name of its own and a tooltip on focus', async () => {
    render(<Sidebar {...props({ collapsed: true })} />)
    const links = within(nav()).getAllByRole('link')
    expect(links).toHaveLength(13)
    for (const a of links) expect(a).toHaveAccessibleName(/^[A-Z]/)
    const orders = screen.getByRole('link', { name: 'Orders' })
    await act(async () => {
      orders.focus()
    })
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Orders')
    expect(screen.getByRole('link', { name: 'Review, 14 waiting' })).toBeInTheDocument()
    // Search still opens the command bar (⌘K works collapsed too).
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Meta+K'
    )
  })

  it('toggles with a button that reports aria-expanded and stores the choice in ops_sidebar', async () => {
    render(<Sidebar {...props({ persist: true })} />)
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(toggle)
    const expand = screen.getByRole('button', { name: 'Expand sidebar' })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    expect(document.querySelector('[data-part="sidebar"]')).toHaveAttribute(
      'data-collapsed',
      'true'
    )
    expect(document.cookie).toContain('ops_sidebar=collapsed')
    await userEvent.click(expand)
    expect(document.cookie).toContain('ops_sidebar=expanded')
  })

  it('does not write the cookie when persist is off (specimens)', async () => {
    render(<Sidebar {...props()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(document.cookie).not.toContain('ops_sidebar')
  })
})

describe('Sidebar · server render', () => {
  it('renders the width the cookie asked for, so nothing shifts on load', () => {
    const wide = renderToStaticMarkup(<Sidebar {...props()} />)
    const narrow = renderToStaticMarkup(<Sidebar {...props({ collapsed: true })} />)
    expect(wide).toContain('w-io-sidebar ')
    expect(narrow).toContain('w-io-sidebar-collapsed')
    expect(narrow).toContain('data-collapsed="true"')
  })

  it('uses only io- classes that resolve to tokens', () => {
    const html = [
      renderToStaticMarkup(<Sidebar {...props({ preview: { menuOpen: true } })} />),
      renderToStaticMarkup(<Sidebar {...props({ collapsed: true, preview: { tip: 'orders' } })} />),
    ].join('')
    const classes = [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).join(' ')
    expect(problemsIn(classes)).toEqual([])
  })

  it('draws the specimen stills: the open avatar menu and a collapsed tooltip', () => {
    const menu = renderToStaticMarkup(
      <Sidebar {...props({ user: HELPER, websiteAdminHref: ADMIN, preview: { menuOpen: true } })} />
    )
    expect(menu).toContain('data-frame="profile-menu"')
    expect(menu).toContain('Website admin')
    const tip = renderToStaticMarkup(
      <Sidebar {...props({ collapsed: true, preview: { tip: 'orders' } })} />
    )
    expect(tip).toContain('data-frame="tooltip"')
  })
})
