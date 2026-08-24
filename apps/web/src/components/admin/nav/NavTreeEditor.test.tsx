/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  diffNavDraft,
  NAV_SURFACES,
  type NavDraftItem,
} from '@indus/domain'

import NavTreeEditor from './NavTreeEditor'

/**
 * The tree editor holds a whole menu in local state and one Save writes the
 * difference. Two things therefore have to be true of every interaction, and
 * neither is visible by looking at the screen:
 *
 *   · the array stays in tree order, because `flattenDraft` reads position
 *     from array order — an editor that displays one order and saves another
 *     only reveals it after a reload;
 *
 *   · an edit touches the rows it claims to. At 323 megamenu rows a bug that
 *     marks everything dirty is indistinguishable from a working editor until
 *     the save rewrites the entire menu.
 *
 * So these assert on the array the editor produces, and on the diff against
 * what it started with.
 */

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./LinkTargetPicker', () => ({
  default: () => null,
}))

function node(over: Partial<NavDraftItem> & Pick<NavDraftItem, 'uid'>): NavDraftItem {
  return {
    id: over.uid,
    parentUid: null,
    label: over.uid,
    linkType: 'custom_url',
    customUrl: `/${over.uid}`,
    categoryId: null,
    brandId: null,
    industryId: null,
    cmsPageId: null,
    productId: null,
    iconName: null,
    badge: null,
    description: null,
    openInNewTab: false,
    isVisible: true,
    promoImageId: null,
    promoHeading: null,
    promoBody: null,
    promoLinkUrl: null,
    ...over,
  }
}

/** Two sections, three links each — the megamenu's shape in miniature. */
function megamenuish(): NavDraftItem[] {
  const out: NavDraftItem[] = []
  for (const section of ['s1', 's2']) {
    out.push(node({ uid: section, linkType: 'none', customUrl: null }))
    for (let i = 0; i < 3; i += 1) {
      out.push(node({ uid: `${section}l${i}`, parentUid: section }))
    }
  }
  return out
}

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>
let latest: NavDraftItem[]

function render(items: NavDraftItem[], surface = NAV_SURFACES.primary_megamenu) {
  latest = items
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  const Harness = ({ value }: { value: NavDraftItem[] }) => (
    <NavTreeEditor
      surface={surface}
      items={value}
      onChange={(next) => {
        latest = next
        act(() => root.render(<Harness value={next} />))
      }}
    />
  )
  act(() => root.render(<Harness value={items} />))
}

function click(el: Element) {
  act(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
}

function byLabel(selector: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[aria-label="${selector}"]`)
  if (!el) throw new Error(`no element labelled "${selector}"`)
  return el
}

function labelInputs(): HTMLInputElement[] {
  return [...container.querySelectorAll<HTMLInputElement>('input[aria-label$="label"]')]
}

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('NavTreeEditor', () => {
  test('opens collapsed — a megamenu shows its sections, not all 323 rows', () => {
    render(megamenuish())
    // Two sections visible, six links hidden behind them.
    expect(labelInputs()).toHaveLength(2)
  })

  test('expanding a section mounts only that section’s children', () => {
    render(megamenuish())
    click(byLabel('Expand s1'))
    // 2 sections + 3 children of s1. s2's children stay unmounted.
    expect(labelInputs()).toHaveLength(5)
  })

  test('removing a section removes its children too', () => {
    render(megamenuish())
    click(byLabel('Remove s1'))
    expect(latest.map((i) => i.uid)).toEqual(['s2', 's2l0', 's2l1', 's2l2'])
  })

  test('removing a section deletes its whole subtree and renumbers what is left', () => {
    render(megamenuish())
    click(byLabel('Remove s1'))
    const diff = diffNavDraft(megamenuish(), latest)
    // All four rows go. The database would cascade the children anyway, but
    // the draft must drop them too or they linger pointing at a parent that is
    // no longer there.
    expect(diff.deletedIds.sort()).toEqual(['s1', 's1l0', 's1l1', 's1l2'])
    // s2 really did move — it is position 0 now — so exactly one row is
    // rewritten, and its three links are not.
    expect(diff.updated.map((u) => u.uid)).toEqual(['s2'])
    expect(diff.updated[0]!.position).toBe(0)
  })

  test('adding a child inserts it in tree order, not at the end of the array', () => {
    render(megamenuish())
    // A megamenu section takes "Group" children; its links take "Link"
    // children. This is the section's own button.
    click([...container.querySelectorAll('button')].find((b) => b.textContent === 'Add group')!)
    const order = latest.map((i) => i.uid)
    // The new row belongs after s1's last link and BEFORE s2 — appending to
    // the array would file it under the wrong section until the next reload,
    // and mark every row in between as moved.
    expect(order.slice(0, 4)).toEqual(['s1', 's1l0', 's1l1', 's1l2'])
    expect(order[4]!.startsWith('new-')).toBe(true)
    expect(order[5]).toBe('s2')
  })

  test('a new row is a create and nothing else is touched', () => {
    render(megamenuish())
    click(byLabel('Expand s1'))
    click([...container.querySelectorAll('button')].find((b) => b.textContent === 'Add group')!)
    const diff = diffNavDraft(megamenuish(), latest)
    expect(diff.created).toHaveLength(1)
    expect(diff.updated).toEqual([])
    expect(diff.deletedIds).toEqual([])
  })

  test('toggling visibility changes one row', () => {
    render(megamenuish())
    click(byLabel('Hide s1'))
    const diff = diffNavDraft(megamenuish(), latest)
    expect(diff.updated.map((u) => u.uid)).toEqual(['s1'])
    expect(latest.find((i) => i.uid === 's1')!.isVisible).toBe(false)
  })

  test('changing link type clears every stale target id', () => {
    const items = [
      node({ uid: 'a', linkType: 'category', categoryId: 'cat-1', customUrl: null }),
    ]
    render(items)
    const select = byLabel('a link type') as HTMLSelectElement
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!
      setter.call(select, 'custom_url')
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    // A leftover categoryId outranks customUrl in `resolveHref`, sending the
    // link somewhere the editor never chose.
    expect(latest[0]!.categoryId).toBeNull()
    expect(latest[0]!.linkType).toBe('custom_url')
  })

  test('marks a row the storefront will never draw', () => {
    // The megamenu is a fixed three-column panel; depth 3 is retained and
    // silently dropped. ~83 live rows are in exactly this state.
    const deep = [
      node({ uid: 'a', linkType: 'none', customUrl: null }),
      node({ uid: 'b', parentUid: 'a', linkType: 'none', customUrl: null }),
      node({ uid: 'c', parentUid: 'b', linkType: 'none', customUrl: null }),
      node({ uid: 'd', parentUid: 'c' }),
    ]
    render(deep)
    click(byLabel('Expand a'))
    click(byLabel('Expand b'))
    click(byLabel('Expand c'))
    expect(container.textContent).toContain('Saved, but never shown')
  })

  test('a footer column says “Column”, a megamenu section says “Section”', () => {
    render([node({ uid: 'x', linkType: 'none', customUrl: null })], NAV_SURFACES.footer_main)
    expect(byLabel('Column label')).toBeTruthy()
    act(() => root.unmount())
    container.remove()

    render([node({ uid: 'x', linkType: 'none', customUrl: null })], NAV_SURFACES.primary_megamenu)
    expect(byLabel('Section label')).toBeTruthy()
  })

  test('a flat surface offers no child rows', () => {
    // Header items have no second level — the header is one row of links.
    render([node({ uid: 'x' })], NAV_SURFACES.primary_header)
    const addChild = [...container.querySelectorAll('button')].filter((b) =>
      b.textContent?.startsWith('Add link') && b.textContent !== 'Add link',
    )
    expect(addChild).toHaveLength(0)
  })
})
