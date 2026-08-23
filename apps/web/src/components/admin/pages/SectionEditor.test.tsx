/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { SectionDef, StoredSection } from '@indus/domain'

import SectionEditor, { type EditorSection, type SaveResult } from './SectionEditor'

/**
 * The editor is the only surface between a content manager and every marketing
 * page on the site, and none of what it does is visible to the type-checker:
 * a section that renders no controls, a hide toggle that edits the wrong row,
 * or a Save that posts the ORIGINAL document instead of the edited one all
 * compile, lint and render perfectly.
 *
 * These tests are about the payload and the wiring, not the pixels.
 */

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// `useRouter` throws outside an App Router tree. The editor calls
// `router.refresh()` after a successful save so the page's "edited" stamp
// updates; the refresh itself is not what these tests are about.
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))

// The media picker reaches for a server action on mount. Nothing here picks an
// image, but the module is imported transitively by the field editors.
vi.mock('../../../app/admin/(shell)/media/actions', () => ({
  getMediaById: async () => ({ success: true, data: null }),
  searchMediaForPicker: async () => ({ success: true, data: [] }),
}))

function def(over: Partial<SectionDef> & Pick<SectionDef, 'key' | 'label'>): SectionDef {
  return {
    description: `The ${over.label} band.`,
    fields: [{ key: 'heading', label: 'Heading', kind: 'text', max: 60 }],
    defaults: { heading: `${over.label} heading` },
    ...over,
  }
}

const SECTIONS: EditorSection[] = [
  {
    key: 'hero',
    def: def({ key: 'hero', label: 'Hero', locked: true }),
    enabled: true,
    values: { heading: 'Hero heading' },
  },
  {
    key: 'usp',
    def: def({ key: 'usp', label: 'Promise strip' }),
    enabled: true,
    values: { heading: 'Promise heading' },
  },
  {
    key: 'blog',
    def: def({ key: 'blog', label: 'Blog teaser', dataNote: 'Cards come from the blog.' }),
    enabled: false,
    values: { heading: 'Blog heading' },
  },
]

let host: HTMLDivElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let saved: StoredSection[] | null = null
let resetCalls = 0

function render(initial: EditorSection[] = SECTIONS): HTMLDivElement {
  saved = null
  resetCalls = 0
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => {
    root!.render(
      <SectionEditor
        pageId="home"
        pageLabel="Home"
        path="/"
        initial={initial}
        seeds={{}}
        usingDefaults={false}
        actions={{
          save: async (_id, sections): Promise<SaveResult> => {
            saved = sections
            return { status: 'ok', message: 'Saved.' }
          },
          reset: async (): Promise<SaveResult> => {
            resetCalls += 1
            return { status: 'ok', message: 'Reset.' }
          },
        }}
      />,
    )
  })
  return host
}

function button(el: HTMLElement, label: string): HTMLButtonElement {
  const found = [...el.querySelectorAll('button')].find(
    (b) => b.textContent?.trim().startsWith(label) || b.getAttribute('aria-label') === label,
  )
  if (!found) throw new Error(`No button matching "${label}"`)
  return found
}

afterEach(() => {
  // Unmount inside act(), or React finishes the tree after jsdom is gone and
  // every test file after this one sees "window is not defined".
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

describe('section editor', () => {
  test('lists every section with its label and description', () => {
    const text = render().textContent ?? ''
    expect(text).toContain('Hero')
    expect(text).toContain('Promise strip')
    expect(text).toContain('Blog teaser')
    expect(text).toContain('3 sections')
    expect(text).toContain('1 hidden')
  })

  test('a locked section offers no drag handle and no hide toggle', () => {
    const el = render()
    expect([...el.querySelectorAll('button')].some((b) => b.getAttribute('aria-label') === 'Reorder Hero')).toBe(false)
    // The eye is rendered for every row, but disabled on a locked one.
    const eye = [...el.querySelectorAll('button')].find(
      (b) => b.getAttribute('aria-label') === 'Hide section',
    )
    expect(eye?.disabled).toBe(true)
  })

  test('an unlocked section is draggable', () => {
    const el = render()
    expect(
      [...el.querySelectorAll('button')].some(
        (b) => b.getAttribute('aria-label') === 'Reorder Promise strip',
      ),
    ).toBe(true)
  })

  test('Save is inert until something changes', () => {
    const el = render()
    expect(button(el, 'Save').disabled).toBe(true)
  })

  test('hiding a section enables Save and posts enabled:false for that row only', async () => {
    const el = render()
    act(() => {
      // Row 2 — the first row's toggle is disabled because the hero is locked.
      const toggles = [...el.querySelectorAll('button')].filter(
        (b) => b.getAttribute('aria-label') === 'Hide section' && !b.disabled,
      )
      toggles[0]!.click()
    })
    expect(button(el, 'Save').disabled).toBe(false)
    await act(async () => {
      button(el, 'Save').click()
    })
    expect(saved).not.toBeNull()
    expect(saved!.map((s) => [s.key, s.enabled])).toEqual([
      ['hero', true],
      ['usp', false],
      ['blog', false],
    ])
  })

  test('expanding a section reveals its fields and its data note', () => {
    const el = render()
    act(() => {
      ;[...el.querySelectorAll('button')]
        .find((b) => b.textContent?.includes('Blog teaser'))
        ?.click()
    })
    const text = el.textContent ?? ''
    expect(text).toContain('Cards come from the blog.')
    const input = el.querySelector<HTMLInputElement>('input[type="text"], input:not([type])')
    expect(input?.value).toBe('Blog heading')
  })

  test('an edited field reaches the save payload', async () => {
    const el = render()
    act(() => {
      ;[...el.querySelectorAll('button')]
        .find((b) => b.textContent?.includes('Promise strip'))
        ?.click()
    })
    const input = el.querySelector<HTMLInputElement>('input:not([type="checkbox"])')!
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )!.set!
      setter.call(input, 'Reworded promise')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => {
      button(el, 'Save').click()
    })
    expect(saved!.find((s) => s.key === 'usp')!.values.heading).toBe('Reworded promise')
  })

  test('a section with no fields says so rather than rendering an empty form', () => {
    const el = render([
      {
        key: 'live',
        def: {
          key: 'live',
          label: 'Live data',
          description: 'Nothing to edit.',
          fields: [],
          defaults: {},
        },
        enabled: true,
        values: {},
      },
    ])
    act(() => {
      ;[...el.querySelectorAll('button')]
        .find((b) => b.textContent?.includes('Live data'))
        ?.click()
    })
    expect(el.textContent).toContain('Nothing to edit here')
  })

  test('reset asks first and only fires on confirm', async () => {
    const el = render()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await act(async () => {
      button(el, 'Reset to defaults').click()
    })
    expect(resetCalls).toBe(0)
    confirmSpy.mockReturnValue(true)
    await act(async () => {
      button(el, 'Reset to defaults').click()
    })
    expect(resetCalls).toBe(1)
    confirmSpy.mockRestore()
  })
})
