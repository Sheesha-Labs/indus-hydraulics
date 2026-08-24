import { describe, expect, it } from 'vitest'
import {
  collectSubtree,
  diffNavDraft,
  draftDepths,
  flattenDraft,
  isEmptyDiff,
  navRowUnchanged,
  type NavDraftItem,
} from './nav-draft'

function item(over: Partial<NavDraftItem> & Pick<NavDraftItem, 'uid'>): NavDraftItem {
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

/** Two roots, two children under the first. Tree order. */
function tree(): NavDraftItem[] {
  return [
    item({ uid: 'a' }),
    item({ uid: 'a1', parentUid: 'a' }),
    item({ uid: 'a2', parentUid: 'a' }),
    item({ uid: 'b' }),
  ]
}

describe('flattenDraft', () => {
  it('numbers positions per parent, from array order', () => {
    expect(flattenDraft(tree())).toEqual([
      { uid: 'a', parentUid: null, position: 0 },
      { uid: 'a1', parentUid: 'a', position: 0 },
      { uid: 'a2', parentUid: 'a', position: 1 },
      { uid: 'b', parentUid: null, position: 1 },
    ])
  })

  it('ignores whatever position a row claims to have', () => {
    // The array IS the ordering. A drag moves an element and nothing else.
    const moved = [tree()[3]!, tree()[0]!, tree()[1]!, tree()[2]!]
    const flat = flattenDraft(moved)
    expect(flat.find((r) => r.uid === 'b')!.position).toBe(0)
    expect(flat.find((r) => r.uid === 'a')!.position).toBe(1)
  })
})

describe('diffNavDraft', () => {
  it('is empty when nothing changed', () => {
    const diff = diffNavDraft(tree(), tree())
    expect(isEmptyDiff(diff)).toBe(true)
    expect(diff.updated).toEqual([])
  })

  it('reports only the row whose label changed', () => {
    const draft = tree()
    draft[1] = { ...draft[1]!, label: 'Renamed' }
    const diff = diffNavDraft(tree(), draft)
    expect(diff.updated.map((u) => u.uid)).toEqual(['a1'])
    expect(diff.created).toEqual([])
    expect(diff.deletedIds).toEqual([])
  })

  it('reports a reorder as an update on the rows that actually moved', () => {
    const draft = [tree()[0]!, tree()[2]!, tree()[1]!, tree()[3]!]
    const diff = diffNavDraft(tree(), draft)
    expect(diff.updated.map((u) => u.uid).sort()).toEqual(['a1', 'a2'])
    // `a` and `b` did not move, so they are not written.
    expect(diff.updated.map((u) => u.uid)).not.toContain('a')
  })

  it('reports a re-parent', () => {
    const draft = tree()
    draft[1] = { ...draft[1]!, parentUid: 'b' }
    const diff = diffNavDraft(tree(), draft)
    const moved = diff.updated.find((u) => u.uid === 'a1')!
    expect(moved.parentUid).toBe('b')
  })

  it('treats a row with no id as created', () => {
    const draft = [...tree(), item({ uid: 'new', id: null })]
    const diff = diffNavDraft(tree(), draft)
    expect(diff.created.map((c) => c.uid)).toEqual(['new'])
  })

  it('treats an id the original never had as created, not as an update', () => {
    // A stale id would otherwise become an UPDATE against a row this menu may
    // not own — the one way a scoped save could reach outside its own menu.
    const draft = [...tree(), item({ uid: 'ghost', id: 'some-other-menus-row' })]
    const diff = diffNavDraft(tree(), draft)
    expect(diff.updated.map((u) => u.uid)).not.toContain('ghost')
    const createdGhost = diff.created.find((c) => c.uid === 'ghost')!
    expect(createdGhost.id).toBeNull()
  })

  it('reports a removed row by id', () => {
    const draft = tree().filter((i) => i.uid !== 'a2')
    const diff = diffNavDraft(tree(), draft)
    expect(diff.deletedIds).toEqual(['a2'])
  })

  it('does not report a never-saved row as deleted', () => {
    const original = tree()
    const draft = [...tree(), item({ uid: 'tmp', id: null })].filter((i) => i.uid !== 'tmp')
    expect(diffNavDraft(original, draft).deletedIds).toEqual([])
  })

  it('keeps created rows in tree order, so a parent precedes its child', () => {
    const draft = [
      ...tree(),
      item({ uid: 'p', id: null }),
      item({ uid: 'c', id: null, parentUid: 'p' }),
    ]
    const diff = diffNavDraft(tree(), draft)
    expect(diff.created.map((c) => c.uid)).toEqual(['p', 'c'])
  })

  it('notices a visibility toggle and a link retarget', () => {
    const draft = tree()
    draft[0] = { ...draft[0]!, isVisible: false }
    draft[3] = { ...draft[3]!, linkType: 'category', categoryId: 'cat-9', customUrl: null }
    const diff = diffNavDraft(tree(), draft)
    expect(diff.updated.map((u) => u.uid).sort()).toEqual(['a', 'b'])
  })

  it('scales to a megamenu-sized tree without reporting untouched rows', () => {
    const big: NavDraftItem[] = []
    for (let s = 0; s < 6; s += 1) {
      big.push(item({ uid: `s${s}` }))
      for (let g = 0; g < 8; g += 1) {
        big.push(item({ uid: `s${s}g${g}`, parentUid: `s${s}` }))
        for (let l = 0; l < 6; l += 1) {
          big.push(item({ uid: `s${s}g${g}l${l}`, parentUid: `s${s}g${g}` }))
        }
      }
    }
    expect(big.length).toBe(6 + 48 + 288)

    const draft = big.map((i) => (i.uid === 's3g4l2' ? { ...i, label: 'Edited' } : i))
    const diff = diffNavDraft(big, draft)
    // One label change must not rewrite 342 rows.
    expect(diff.updated.map((u) => u.uid)).toEqual(['s3g4l2'])
    expect(diff.created).toEqual([])
    expect(diff.deletedIds).toEqual([])
  })
})

describe('collectSubtree', () => {
  it('returns the row and every descendant, deepest first', () => {
    const items = [
      item({ uid: 'a' }),
      item({ uid: 'a1', parentUid: 'a' }),
      item({ uid: 'a1x', parentUid: 'a1' }),
      item({ uid: 'b' }),
    ]
    expect(collectSubtree(items, 'a')).toEqual(['a1x', 'a1', 'a'])
  })

  it('returns just the row when it has no children', () => {
    expect(collectSubtree(tree(), 'b')).toEqual(['b'])
  })
})

describe('draftDepths', () => {
  it('measures depth from the root', () => {
    const items = [
      item({ uid: 'a' }),
      item({ uid: 'a1', parentUid: 'a' }),
      item({ uid: 'a1x', parentUid: 'a1' }),
    ]
    const depths = draftDepths(items)
    expect(depths.get('a')).toBe(0)
    expect(depths.get('a1')).toBe(1)
    expect(depths.get('a1x')).toBe(2)
  })

  it('does not hang on a cycle in client state', () => {
    const items = [
      item({ uid: 'x', parentUid: 'y' }),
      item({ uid: 'y', parentUid: 'x' }),
    ]
    // A cycle would otherwise recurse until the stack gives out, taking the
    // whole editor down during a render rather than failing a save.
    expect(() => draftDepths(items)).not.toThrow()
  })
})

describe('navRowUnchanged', () => {
  const before = { parentId: 'p', position: 2, label: 'Pumps', isVisible: true, customUrl: '/c/pumps' }

  it('is true when nothing differs', () => {
    expect(
      navRowUnchanged(before, {
        parentId: 'p',
        position: 2,
        columns: { label: 'Pumps', isVisible: true, customUrl: '/c/pumps' },
      }),
    ).toBe(true)
  })

  it('is false when a column differs', () => {
    expect(
      navRowUnchanged(before, {
        parentId: 'p',
        position: 2,
        columns: { label: 'Renamed', isVisible: true, customUrl: '/c/pumps' },
      }),
    ).toBe(false)
  })

  it('is false when only the position moved', () => {
    // Fields identical, placement different — still has to be written, or a
    // drag reorder saves as a no-op and springs back on reload.
    expect(
      navRowUnchanged(before, {
        parentId: 'p',
        position: 0,
        columns: { label: 'Pumps', isVisible: true, customUrl: '/c/pumps' },
      }),
    ).toBe(false)
  })

  it('is false when only the parent moved', () => {
    expect(
      navRowUnchanged(before, {
        parentId: 'other',
        position: 2,
        columns: { label: 'Pumps', isVisible: true, customUrl: '/c/pumps' },
      }),
    ).toBe(false)
  })

  it('is false when a column goes from a value to null', () => {
    expect(
      navRowUnchanged(before, {
        parentId: 'p',
        position: 2,
        columns: { label: 'Pumps', isVisible: true, customUrl: null },
      }),
    ).toBe(false)
  })
})
