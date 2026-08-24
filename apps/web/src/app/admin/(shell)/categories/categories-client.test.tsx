/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import CategoriesClient from './CategoriesClient'
import type { Cat } from './types'

/**
 * What this file is guarding.
 *
 * The original version existed because `CategoryRows` passed `subRows={[]}` to
 * its own recursive call, so the tree rendered exactly two levels — eight
 * depth-3 categories existed, held products, were reachable on the storefront,
 * and never appeared on this page at all. Typecheck could not see it (`[]` is a
 * valid `Cat[]`), lint could not see it, and nothing rendered the component.
 *
 * That test survives here as "renders every level". The rest cover what the
 * rewrite added — folding, search and selection — because those are the parts
 * that decide whether 192 categories are workable at all, and none of them is
 * visible to typecheck either.
 *
 * The drag itself is NOT tested here. @dnd-kit needs a real pointer with a 4px
 * activation distance, which jsdom does not provide and Playwright's synthetic
 * drag does not clear. The maths behind the drag is pure and lives in
 * `@indus/domain/category-tree`, where `category-tree.test.ts` covers it
 * directly — that is the meaningful assertion, not a simulated mousedown.
 */

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./actions', () => ({
  createCategory: async () => ({ success: true, data: { id: 'x' } }),
  updateCategory: async () => ({ success: true, data: undefined }),
  deleteCategory: async () => ({ success: true, data: undefined }),
  moveCategory: async () => ({ success: true, data: undefined }),
  bulkSetPublished: async () => ({ success: true, data: { count: 1 } }),
  bulkMoveCategories: async () => ({ success: true, data: { count: 1 } }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
}))

function cat(over: Partial<Cat> & Pick<Cat, 'id' | 'name'>): Cat {
  return {
    parentId: null,
    slug: over.name.toLowerCase().replace(/\W+/g, '-'),
    position: 0,
    isPublished: true,
    productCount: 0,
    childCount: 0,
    navItemCount: 1,
    defaultSpecTemplateId: null,
    defaultSpecTemplateName: null,
    ...over,
  }
}

const TREE: Cat[] = [
  cat({ id: 'root', name: 'Hoses & Fittings', childCount: 1 }),
  cat({ id: 'hub', name: 'Ferrules', parentId: 'root', childCount: 1 }),
  cat({ id: 'leaf', name: 'M03400 No-Skive Ferrules', parentId: 'hub', productCount: 1 }),
  cat({ id: 'orphan', name: 'Detached Category', parentId: 'missing-parent' }),
]

let host: HTMLDivElement | null = null
let root: ReturnType<typeof createRoot> | null = null

function render(categories: Cat[]): HTMLDivElement {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => {
    root!.render(<CategoriesClient categories={categories} templates={[]} />)
  })
  return host
}

/** Click the first button whose visible text contains `text`. */
function click(el: HTMLElement, text: string): void {
  const button = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(text))
  if (!button) throw new Error(`no button matching "${text}"`)
  act(() => button.click())
}

function type(el: HTMLElement, selector: string, value: string): void {
  const input = el.querySelector<HTMLInputElement>(selector)
  if (!input) throw new Error(`no input matching "${selector}"`)
  act(() => {
    // React tracks the previous value on the DOM node and swallows an event
    // whose value it thinks is unchanged, so the native setter has to be used
    // rather than assigning `input.value` directly.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )!.set!
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

/** Visible category names, in rendered order. */
function rowNames(el: HTMLElement): string[] {
  return [...el.querySelectorAll('[role="treeitem"]')].map(
    (r) => r.getAttribute('data-category-name') ?? '',
  )
}

function row(el: HTMLElement, name: string): HTMLElement {
  const found = el.querySelector<HTMLElement>(`[data-category-name="${name}"]`)
  if (!found) throw new Error(`no row for "${name}"`)
  return found
}

/**
 * jsdom in this setup ships no `localStorage`, and the fold state is persisted
 * through it — so without a stub every test here would exercise the component's
 * storage-unavailable fallback rather than the behaviour it is checking.
 */
const memoryStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      store = {}
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length
    },
  } satisfies Storage
})()

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  })
  memoryStorage.clear()
})

afterEach(() => {
  // Unmount inside act(), or React finishes the tree after jsdom is gone and
  // every test file after this one sees "window is not defined".
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

describe('admin category tree', () => {
  test('renders every level, not just root and child', () => {
    const el = render(TREE)
    click(el, 'Expand all')
    const text = el.textContent ?? ''
    expect(text).toContain('Hoses & Fittings')
    expect(text).toContain('Ferrules')
    expect(text, 'a depth-3 category is missing from the tree').toContain(
      'M03400 No-Skive Ferrules',
    )
  })

  test('nesting is reported as aria-level, one-based', () => {
    const el = render(TREE)
    click(el, 'Expand all')
    const levelOf = (name: string) =>
      [...el.querySelectorAll('[role="treeitem"]')]
        .find((r) => r.textContent?.includes(name))
        ?.getAttribute('aria-level')
    expect(levelOf('Hoses & Fittings')).toBe('1')
    expect(levelOf('Ferrules')).toBe('2')
    expect(levelOf('M03400 No-Skive Ferrules')).toBe('3')
  })

  test('a category whose parent is missing still gets a row', () => {
    // An orphan the editor cannot see is an orphan nobody can re-home.
    const el = render(TREE)
    expect(el.textContent).toContain('Detached Category')
  })

  test('branches start folded, so 192 categories are not one wall of rows', () => {
    const el = render(TREE)
    const names = rowNames(el)
    expect(names).toContain('Hoses & Fittings')
    expect(names.join(' ')).not.toContain('M03400')
  })

  test('expanding a root reveals its children', () => {
    const el = render(TREE)
    const expand = el.querySelector<HTMLButtonElement>(
      '[aria-label="Expand Hoses & Fittings"]',
    )
    expect(expand).not.toBeNull()
    act(() => expand!.click())
    expect(rowNames(el)).toContain('Ferrules')
  })

  test('the fold state survives a remount', () => {
    const first = render(TREE)
    click(first, 'Expand all')
    expect(rowNames(first)).toContain('M03400 No-Skive Ferrules')

    act(() => root?.unmount())
    host?.remove()

    // A drag triggers router.refresh(), which re-renders this component. If the
    // fold reset each time, every move would spring the whole tree open and
    // lose the editor's place.
    const second = render(TREE)
    expect(rowNames(second)).toContain('M03400 No-Skive Ferrules')
  })

  test('search keeps the ancestors of a match so depth still reads as a tree', () => {
    const el = render(TREE)
    type(el, 'input[placeholder="Name or slug…"]', 'M03400')
    const names = rowNames(el)
    expect(names).toContain('M03400 No-Skive Ferrules')
    expect(names).toContain('Ferrules')
    expect(names).toContain('Hoses & Fittings')
    expect(names).not.toContain('Detached Category')
  })

  test('search finds a category by slug, not only by name', () => {
    const el = render(TREE)
    type(el, 'input[placeholder="Name or slug…"]', 'detached-category')
    expect(rowNames(el)).toContain('Detached Category')
  })

  test('dragging is disabled while a search is active', () => {
    // The rows around a drop target would not be the ones on screen, so the
    // projection would compute against neighbours the editor cannot see.
    const el = render(TREE)
    type(el, 'input[placeholder="Name or slug…"]', 'Ferrules')
    const handles = [...el.querySelectorAll<HTMLButtonElement>('[aria-label^="Reorder"]')]
    expect(handles.length).toBeGreaterThan(0)
    expect(handles.every((h) => h.disabled)).toBe(true)
  })

  test('selecting a row opens the bulk bar', () => {
    const el = render(TREE)
    const box = el.querySelector<HTMLInputElement>('[aria-label="Select Hoses & Fittings"]')
    act(() => box!.click())
    expect(el.textContent).toContain('1 selected')
    expect(el.textContent).toContain('Unpublish')
  })

  test('a live category with no megamenu item is called out', () => {
    const el = render([
      cat({ id: 'lonely', name: 'Unlinked Category', navItemCount: 0 }),
    ])
    expect(el.textContent).toContain('not in the megamenu')
    expect(el.querySelector('[title*="no megamenu item links to it"]')).not.toBeNull()
  })

  test('a draft category with no megamenu item is not called out', () => {
    // Drafts are not on the storefront at all, so "unreachable from the header"
    // is not a finding about them — it would just be noise on every new row.
    const el = render([
      cat({ id: 'draft', name: 'Draft Category', navItemCount: 0, isPublished: false }),
    ])
    expect(el.textContent).not.toContain('not in the megamenu')
  })

  test('the parent picker shows the full path, not a bare name', () => {
    const el = render(TREE)
    click(el, '+ New category')
    const options = [...el.querySelectorAll('select[name="parentId"] option')].map((o) =>
      o.textContent?.trim(),
    )
    expect(options).toContain('Hoses & Fittings › Ferrules')
    expect(options).toContain('Hoses & Fittings › Ferrules › M03400 No-Skive Ferrules')
  })

  test('the edit form offers no position box', () => {
    // Order is a drag now. A stray position input would post 0 on every save
    // and silently move the row to the top of its siblings.
    const el = render(TREE)
    click(el, '+ New category')
    expect(el.querySelector('input[name="position"]')).toBeNull()
  })

  test('a category cannot be offered itself as a parent', () => {
    const el = render(TREE)
    // Scoped to a named row on purpose: roots sort by position then name, so
    // "Detached Category" is the first row, not "Hoses & Fittings".
    click(row(el, 'Hoses & Fittings'), 'Edit')
    const options = [...el.querySelectorAll('select[name="parentId"] option')].map((o) =>
      o.textContent?.trim(),
    )
    expect(options).not.toContain('Hoses & Fittings')
    // …nor anything inside it, which would be a cycle.
    expect(options).not.toContain('Hoses & Fittings › Ferrules')
  })

  test('rolled-up product counts include descendants', () => {
    const el = render(TREE)
    // The root owns nothing directly but has one product two levels down.
    expect(
      row(el, 'Hoses & Fittings').querySelector('[title*="including sub-categories"]')
        ?.textContent,
    ).toContain('1')
  })
})
