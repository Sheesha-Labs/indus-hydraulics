/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import FooterEditor, { type FooterEditorData } from './FooterEditor'

/**
 * The footer editor sends the WHOLE footer on every save, and the server
 * replaces every row from what it receives. That makes the payload this
 * component builds the single point where the site's footer can be silently
 * damaged: a field dropped on the way out is not a field left alone, it is a
 * field deleted, and the only symptom is a link that quietly stops appearing.
 *
 * So these tests assert on the payload rather than on the markup. Each one
 * pins a way that payload has a live opportunity to be wrong.
 */

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Typed with the argument it actually receives: without it `mock.calls[0]` is
// the empty tuple, and every payload assertion below is a cast from `undefined`.
const saveFooter = vi.fn<(input: unknown) => Promise<{ success: true; data: undefined }>>(
  async () => ({ success: true as const, data: undefined }),
)
vi.mock('./actions', () => ({ saveFooter: (input: unknown) => saveFooter(input) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))
// The picker fetches targets through a server action; this screen's payload
// logic does not depend on what it returns.
vi.mock('../navigation/[menuSlug]/LinkTargetPicker', () => ({
  default: () => null,
}))

function data(over: Partial<FooterEditorData> = {}): FooterEditorData {
  return {
    brand: { tagline: 'Trusted since 2003.', certificationLine: 'ISO 9001:2015 Certified' },
    contact: {
      contactLocationLabel: 'Dubai HQ',
      contactPhone: '+971 52 2477942',
      contactEmail: 'sales@indushydraulics.me',
      contactHours: 'Mon–Fri 09:00–18:00 GST',
    },
    legal: {
      footerLegalLine: '',
      links: [{ label: 'Privacy', customUrl: '/privacy', openInNewTab: false, isVisible: true }],
    },
    columns: [
      {
        label: 'Products',
        isVisible: true,
        links: [
          {
            label: 'Hydraulic Pumps',
            linkType: 'category',
            customUrl: '',
            categoryId: 'cat-1',
            brandId: null,
            industryId: null,
            cmsPageId: null,
            productId: null,
            target: { label: 'Hydraulic Pumps', sublabel: '/c/hydraulic-pumps' },
            openInNewTab: false,
            isVisible: true,
          },
        ],
      },
    ],
    socials: [
      { label: 'LinkedIn', platform: 'linkedin', href: 'https://linkedin.com/company/x', isVisible: true },
    ],
    ...over,
  }
}

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

function render(props: Parameters<typeof FooterEditor>[0]) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<FooterEditor {...props} />)
  })
}

function saveButton(): HTMLButtonElement {
  const button = [...container.querySelectorAll('button')].find((b) =>
    b.textContent?.includes('Save footer'),
  )
  if (!button) throw new Error('no save button')
  return button as HTMLButtonElement
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

/**
 * Click Save and let the transition it starts finish.
 *
 * The plain `click` above leaves `startTransition`'s async work in flight, so
 * the state it sets afterwards lands outside `act` and React warns. Awaiting a
 * turn of the microtask queue inside `act` settles it.
 */
async function save() {
  await act(async () => {
    saveButton().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await Promise.resolve()
  })
}

function type(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value')!.set!
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function field(label: string): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)
  if (!el) throw new Error(`no field labelled ${label}`)
  return el
}

beforeEach(() => {
  saveFooter.mockClear()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('FooterEditor', () => {
  test('Save is inert until something changes, then enabled', async () => {
    render({ data: data(), canEditSettings: true, legalFallbackEntity: 'Indus LLC' })
    expect(saveButton().disabled).toBe(true)

    type(field('Column heading'), 'Catalogue')
    expect(saveButton().disabled).toBe(false)
  })

  test('sends the whole footer, not just the edited part', async () => {
    render({ data: data(), canEditSettings: true, legalFallbackEntity: 'Indus LLC' })
    type(field('Column heading'), 'Catalogue')
    await save()

    const payload = saveFooter.mock.calls[0]![0] as Record<string, unknown>
    expect(Object.keys(payload).sort()).toEqual(['brand', 'columns', 'contact', 'legal', 'socials'])
    // The untouched sections must survive a save that only edited a heading.
    expect(payload.socials).toEqual([
      { label: 'LinkedIn', platform: 'linkedin', href: 'https://linkedin.com/company/x', isVisible: true },
    ])
    expect(payload.contact).toEqual(data().contact)
  })

  test('a link keeps its resolved target id, and drops the display-only label', async () => {
    render({ data: data(), canEditSettings: true, legalFallbackEntity: 'Indus LLC' })
    type(field('Column heading'), 'Catalogue')
    await save()

    const payload = saveFooter.mock.calls[0]![0] as {
      columns: { links: Record<string, unknown>[] }[]
    }
    const link = payload.columns[0]!.links[0]!
    expect(link.categoryId).toBe('cat-1')
    expect(link.linkType).toBe('category')
    // `target` is re-resolved server-side on every load; sending it back would
    // make an unrelated category rename read as an unsaved edit.
    expect(link).not.toHaveProperty('target')
    expect(link).not.toHaveProperty('uid')
  })

  test('changing a link type clears the old target rather than leaving it behind', async () => {
    render({ data: data(), canEditSettings: true, legalFallbackEntity: 'Indus LLC' })
    const select = container.querySelector<HTMLSelectElement>('[aria-label="Link type"]')!
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!
      setter.call(select, 'custom_url')
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await save()

    const payload = saveFooter.mock.calls[0]![0] as {
      columns: { links: Record<string, unknown>[] }[]
    }
    const link = payload.columns[0]!.links[0]!
    expect(link.linkType).toBe('custom_url')
    // A stale categoryId here outranks customUrl in `resolveHref` and would
    // send the link somewhere the editor never chose.
    expect(link.categoryId).toBeNull()
  })

  test('a pasted profile URL fills in the platform and the name', async () => {
    render({
      data: data({ socials: [] }),
      canEditSettings: true,
      legalFallbackEntity: 'Indus LLC',
    })
    const add = [...container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Add profile'),
    )!
    click(add)
    type(field('Profile URL'), 'https://www.instagram.com/indushydraulics')
    await save()

    const payload = saveFooter.mock.calls[0]![0] as { socials: Record<string, unknown>[] }
    expect(payload.socials[0]).toMatchObject({
      platform: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/indushydraulics',
    })
  })

  test('a platform the editor picked is not overwritten by a later paste', async () => {
    render({
      data: data({
        socials: [{ label: 'Careers', platform: 'linkedin', href: '', isVisible: true }],
      }),
      canEditSettings: true,
      legalFallbackEntity: 'Indus LLC',
    })
    // A link shortener would guess as `other`; the explicit choice must win.
    type(field('Profile URL'), 'https://lnk.example/abc')
    await save()

    const payload = saveFooter.mock.calls[0]![0] as { socials: Record<string, unknown>[] }
    expect(payload.socials[0]).toMatchObject({ platform: 'linkedin', label: 'Careers' })
  })

  test('a role without SETTINGS_WRITE cannot edit brand, contact or the legal line', async () => {
    render({ data: data(), canEditSettings: false, legalFallbackEntity: 'Indus LLC' })

    const locked = ['footer-tagline', 'footer-certification', 'footer-phone', 'footer-email', 'footer-legal-line']
    for (const id of locked) {
      const el = container.querySelector<HTMLInputElement>(`#${id}`)
      expect(el, id).not.toBeNull()
      expect(el!.disabled, id).toBe(true)
    }
    // …but the links on the same screen stay editable for them.
    expect(field('Column heading').disabled).toBe(false)
  })

  test('removing every column still saves an explicit empty list', async () => {
    render({ data: data(), canEditSettings: true, legalFallbackEntity: 'Indus LLC' })
    click(container.querySelector('[aria-label="Remove Products"]')!)
    await save()

    const payload = saveFooter.mock.calls[0]![0] as { columns: unknown[] }
    expect(payload.columns).toEqual([])
  })
})
