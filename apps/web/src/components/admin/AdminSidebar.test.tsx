/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'

let pathname = '/admin'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))
// next/image needs the Next runtime; a plain <img> is enough to assert on.
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))
vi.mock('../../app/admin/sign-in/actions', () => ({ adminSignOutAction: vi.fn() }))

import AdminSidebar from './AdminSidebar'

// This Node/jsdom pairing leaves window.localStorage undefined; an in-memory
// stand-in is all the sidebar needs.
const store = new Map<string, string>()
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  },
})

let container: HTMLDivElement | null = null
let root: Root | null = null

function render(ui: React.ReactElement) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root!.render(ui))
  return container
}

afterEach(() => {
  pathname = '/admin'
  window.localStorage.clear()
  // Unmount inside act so React's pending work finishes before jsdom is torn
  // down; otherwise a scheduled task fires against a missing `window`.
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
})

describe('AdminSidebar brand', () => {
  test('shows the storefront logo and "Admin panel", not the old version tag', () => {
    const el = render(
      <AdminSidebar
        userName="Ayush Bhatia"
        userRole="super_admin"
        logoUrl="https://cdn.example/indus-logo.png"
        logoStyle="logo_only"
        brandName="Indus Hydraulics"
      />,
    )
    const logo = el.querySelector('img')
    expect(logo?.getAttribute('src')).toBe('https://cdn.example/indus-logo.png')
    expect(logo?.getAttribute('alt')).toBe('Indus Hydraulics')
    expect(el.textContent).toContain('Admin panel')
    expect(el.textContent).not.toMatch(/v1\.0\.0/i)
  })

  test('falls back to the typeset mark when no logo is uploaded', () => {
    const el = render(
      <AdminSidebar
        userName="Ayush Bhatia"
        userRole="super_admin"
        logoUrl={null}
        logoStyle="logo_only"
        brandName="Indus Hydraulics"
      />,
    )
    expect(el.textContent).toContain('Indus Hydraulics')
    expect(el.textContent).toContain('Admin panel')
  })
})

const sidebar = () => (
  <AdminSidebar
    userName="Ayush Bhatia"
    userRole="super_admin"
    logoUrl={null}
    logoStyle="logo_only"
    brandName="Indus Hydraulics"
  />
)

function sectionButton(el: HTMLElement, name: string) {
  const button = [...el.querySelectorAll('button[aria-expanded]')].find((b) => b.textContent?.trim() === name)
  if (!button) throw new Error(`no section button ${name}`)
  return button as HTMLButtonElement
}

describe('AdminSidebar folding groups', () => {
  test('opens only the group holding the current page', () => {
    pathname = '/admin/spec-templates'
    const el = render(sidebar())
    expect(sectionButton(el, 'Catalogue').getAttribute('aria-expanded')).toBe('true')
    for (const name of ['Operations', 'Content', 'System']) {
      expect(sectionButton(el, name).getAttribute('aria-expanded')).toBe('false')
    }
    expect(el.querySelector('a[aria-current="page"]')?.textContent).toBe('Spec templates')
  })

  test('a folded group is inert, so its links leave the tab order', () => {
    pathname = '/admin'
    const el = render(sidebar())
    const panel = document.getElementById(sectionButton(el, 'Operations').getAttribute('aria-controls')!)
    expect(panel?.hasAttribute('inert')).toBe(true)
    expect(panel?.textContent).toContain('Enquiries')
  })

  test('toggling opens and closes a group and remembers it', () => {
    const el = render(sidebar())
    const ops = sectionButton(el, 'Operations')
    act(() => ops.click())
    expect(ops.getAttribute('aria-expanded')).toBe('true')
    expect(JSON.parse(window.localStorage.getItem('ih-admin-nav-open')!)).toContain('Operations')
    act(() => ops.click())
    expect(ops.getAttribute('aria-expanded')).toBe('false')
  })

  test('restores saved groups but never hides the current page', () => {
    window.localStorage.setItem('ih-admin-nav-open', JSON.stringify(['Content']))
    pathname = '/admin/rfqs/RFQ-1'
    const el = render(sidebar())
    expect(sectionButton(el, 'Content').getAttribute('aria-expanded')).toBe('true')
    expect(sectionButton(el, 'Operations').getAttribute('aria-expanded')).toBe('true')
    expect(sectionButton(el, 'Catalogue').getAttribute('aria-expanded')).toBe('false')
  })

  test('the group holding the current page can still be folded by hand', () => {
    pathname = '/admin/products'
    const el = render(sidebar())
    const catalogue = sectionButton(el, 'Catalogue')
    expect(catalogue.getAttribute('aria-expanded')).toBe('true')
    act(() => catalogue.click())
    expect(catalogue.getAttribute('aria-expanded')).toBe('false')
    act(() => catalogue.click())
    expect(catalogue.getAttribute('aria-expanded')).toBe('true')
  })
})
