/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'

import CategoriesClient from './CategoriesClient'

/**
 * The category tree used to render exactly two levels.
 *
 * `CategoryRows` took its children as a `subRows` prop, and its own recursive
 * call passed `subRows={[]}` — so a grandchild category existed, held products
 * and was reachable on the storefront, but never appeared on /admin/categories
 * at all. Eight of them did. The only visible symptom was a row count that
 * quietly disagreed with the header, which is exactly the kind of thing nobody
 * counts.
 *
 * Typecheck could not see it (`[]` is a valid `Cat[]`), lint could not see it,
 * and no test rendered the component. This one does.
 */

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./actions', () => ({
  createCategory: async () => ({ success: true, data: { id: 'x' } }),
  updateCategory: async () => ({ success: true, data: undefined }),
  deleteCategory: async () => ({ success: true, data: undefined }),
}))

type Cat = Parameters<typeof CategoriesClient>[0]['categories'][number]

function cat(over: Partial<Cat> & Pick<Cat, 'id' | 'name'>): Cat {
  return {
    parentId: null,
    slug: over.name.toLowerCase().replace(/\W+/g, '-'),
    position: 0,
    isPublished: true,
    productCount: 0,
    childCount: 0,
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
    const text = el.textContent ?? ''
    expect(text).toContain('Hoses & Fittings')
    expect(text).toContain('Ferrules')
    expect(text, 'a depth-3 category is missing from the table').toContain(
      'M03400 No-Skive Ferrules',
    )
  })

  test('indents each level further than the last', () => {
    const el = render(TREE)
    // A nested row prefixes its label with a `└` marker in its own span, so
    // match on the label text ending the span rather than equalling it.
    const indent = (name: string) => {
      const span = [...el.querySelectorAll('span')].find((s) =>
        s.textContent?.trim().endsWith(name) && s.className.includes('font-medium'),
      )
      return span?.className ?? ''
    }
    // The padding class lives on the label inside the cell, not the cell:
    // TableCell carries `first:pl-4` and a same-element `pl-*` does not beat it.
    expect(indent('Hoses & Fittings')).toContain('pl-0')
    expect(indent('Ferrules')).toContain('pl-6')
    expect(indent('M03400 No-Skive Ferrules')).toContain('pl-12')
  })

  test('a category whose parent is missing still gets a row', () => {
    const el = render(TREE)
    expect(el.textContent).toContain('Detached Category')
  })

  test('the parent picker shows the full path, not a bare name', () => {
    const el = render(TREE)
    act(() => {
      ;[...el.querySelectorAll('button')]
        .find((b) => b.textContent?.includes('New category'))
        ?.click()
    })
    const options = [...el.querySelectorAll('select[name="parentId"] option')].map((o) =>
      o.textContent?.trim(),
    )
    expect(options).toContain('Hoses & Fittings › Ferrules')
    expect(options).toContain('Hoses & Fittings › Ferrules › M03400 No-Skive Ferrules')
  })
})
