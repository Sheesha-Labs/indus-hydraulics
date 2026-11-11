/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/admin' }))
// next/image needs the Next runtime; a plain <img> is enough to assert on.
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))
vi.mock('../../app/admin/sign-in/actions', () => ({ adminSignOutAction: vi.fn() }))

import AdminSidebar from './AdminSidebar'

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
