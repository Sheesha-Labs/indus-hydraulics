/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { MediaUsage } from '@indus/domain'
import { ToastProvider } from '@indus/ui'

import { MediaDetailDialog } from './detail-dialog'
import type { MediaDetail } from './types'

/**
 * The first component test in this repo, and the reason jsdom is now a
 * devDependency.
 *
 * CLAUDE.md §10.5 requires every overlay to own its focus trap, role /
 * aria-modal, Escape handling and focus restoration. Those are delegated to
 * Radix, which means a Radix upgrade can quietly change them — and nothing
 * else in the tree would notice. Typecheck, lint and the existing static guard
 * tests are all blind to it: the contract only exists once the thing renders.
 *
 * It also pins the part of the panel most likely to be broken by a refactor —
 * that a usage with no admin editor renders as text rather than a dead link.
 */

// React refuses to treat this as a test environment without the flag, and
// warns on every act() call. It is a global rather than a config option.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh() {}, push() {} }) }))
vi.mock('../actions', () => ({ updateMediaMeta: async () => ({ success: true, data: {} }) }))

function usage(over: Partial<MediaUsage> = {}): MediaUsage {
  return {
    kind: 'product',
    id: 'p1',
    label: 'R1 1SN Single Wire Braid Hydraulic Hose',
    role: 'Image',
    href: '/admin/products/p1/edit',
    live: true,
    internal: false,
    ...over,
  }
}

const DETAIL: MediaDetail = {
  id: 'm1',
  originalFilename: 'HP001.png',
  alt: 'Brass hydraulic hose fitting',
  caption: null,
  kind: 'image',
  bytes: 184320,
  createdAt: new Date('2026-05-01'),
  storagePath: 'https://example.test/HP001.png',
  mimeType: 'image/png',
  width: 1200,
  height: 900,
  createdAtLabel: '1 May 2026',
  uploadedByName: 'Ayush Bhatia',
  state: 'live',
  usages: [
    usage(),
    usage({ kind: 'blog_post', label: 'Choosing a hose', role: 'Hero', href: '/admin/blog/b1', live: false }),
    // No admin editor exists for a service case.
    usage({ kind: 'service_case', label: 'Offshore BOP rebuild', role: 'In body', href: null, live: false }),
  ],
}

async function render(detail: MediaDetail | null, canEdit = true) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => {
    createRoot(host).render(
      <ToastProvider>
        <MediaDetailDialog detail={detail} canEdit={canEdit} onClose={() => {}} />
      </ToastProvider>
    )
  })
  return host
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('media detail dialog', () => {
  test('renders nothing until a file is selected', async () => {
    await render(null)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  test('satisfies the overlay accessibility contract', async () => {
    await render(DETAIL)
    const panel = document.querySelector('[role="dialog"]')
    expect(panel, 'no element with role=dialog').not.toBeNull()
    expect(panel!.getAttribute('aria-modal')).toBe('true')

    // The accessible name must be the filename and the description the usage
    // summary — an unlabelled dialog announces as "dialog" and nothing else.
    const name = document.getElementById(panel!.getAttribute('aria-labelledby') ?? '')
    const desc = document.getElementById(panel!.getAttribute('aria-describedby') ?? '')
    expect(name?.textContent).toBe('HP001.png')
    expect(desc?.textContent).toBe('1 product · 1 service case · 1 blog post')
  })

  test('hides the rest of the page from assistive tech while open', async () => {
    const behind = document.createElement('main')
    document.body.appendChild(behind)
    await render(DETAIL)
    // Radix does this rather than relying on aria-modal alone. If an upgrade
    // drops it, a screen reader can wander into the page behind the dialog.
    expect(behind.getAttribute('aria-hidden')).toBe('true')
  })

  test('links each usage to its editor, and renders plain text where none exists', async () => {
    await render(DETAIL)
    const rows = [...document.querySelectorAll('[role="dialog"] li')]
    expect(rows).toHaveLength(3)

    const hrefs = [...document.querySelectorAll('[role="dialog"] li a')].map((a) =>
      a.getAttribute('href')
    )
    expect(hrefs).toEqual(['/admin/products/p1/edit', '/admin/blog/b1'])

    // A service case has no admin editor. It must still be listed — it is
    // holding the file — but as text, not a link that goes nowhere.
    const serviceRow = rows.find((r) => r.textContent?.includes('Offshore BOP rebuild'))
    expect(serviceRow, 'service case usage missing from the list').toBeTruthy()
    expect(serviceRow!.querySelector('a')).toBeNull()
  })

  test('orders live usages first', async () => {
    await render(DETAIL)
    const first = document.querySelector('[role="dialog"] li')
    expect(first?.textContent).toContain('R1 1SN Single Wire Braid Hydraulic Hose')
  })

  test('a role without write access gets no editing controls', async () => {
    await render(DETAIL, false)
    const inputs = document.querySelectorAll('[role="dialog"] input, [role="dialog"] textarea')
    expect(inputs.length).toBeGreaterThan(0)
    for (const el of inputs) expect((el as HTMLInputElement).disabled).toBe(true)
    const buttons = [...document.querySelectorAll('[role="dialog"] button')].map((b) => b.textContent)
    expect(buttons).not.toContain('Save changes')
  })
})
