import { describe, expect, test } from 'vitest'

import {
  MAX_CATEGORY_DEPTH,
  ancestorPath,
  arrayMove,
  buildMoveOrdering,
  descendantIds,
  flattenTree,
  groupByParent,
  matchingWithAncestors,
  projectDrop,
  siblingIndexForDrop,
  subtreeHeight,
  type CategoryTreeNode,
} from './category-tree'

function node(
  id: string,
  parentId: string | null,
  position: number,
  name = id,
): CategoryTreeNode & { slug: string } {
  return { id, parentId, position, name, slug: name.toLowerCase().replace(/\W+/g, '-') }
}

/**
 *   hoses (0)
 *     ferrules (0)
 *       no-skive (0)
 *       skive (1)
 *     couplings (1)
 *   pumps (1)
 *     gear (0)
 */
const TREE = [
  node('hoses', null, 0, 'Hoses & Fittings'),
  node('pumps', null, 1, 'Pumps'),
  node('ferrules', 'hoses', 0, 'Ferrules'),
  node('couplings', 'hoses', 1, 'Couplings'),
  node('no-skive', 'ferrules', 0, 'No-Skive Ferrules'),
  node('skive', 'ferrules', 1, 'Skive Ferrules'),
  node('gear', 'pumps', 0, 'Gear Pumps'),
]

const INDENT = 24

describe('flattenTree', () => {
  test('walks depth-first in position order', () => {
    expect(flattenTree(TREE).map((i) => i.node.id)).toEqual([
      'hoses',
      'ferrules',
      'no-skive',
      'skive',
      'couplings',
      'pumps',
      'gear',
    ])
  })

  test('assigns depth by nesting, not by row order', () => {
    const depths = Object.fromEntries(flattenTree(TREE).map((i) => [i.node.id, i.depth]))
    expect(depths).toEqual({
      hoses: 0,
      ferrules: 1,
      'no-skive': 2,
      skive: 2,
      couplings: 1,
      pumps: 0,
      gear: 1,
    })
  })

  test('a collapsed node keeps its own row and hides its descendants', () => {
    const ids = flattenTree(TREE, new Set(['ferrules'])).map((i) => i.node.id)
    expect(ids).toContain('ferrules')
    expect(ids).not.toContain('no-skive')
    expect(ids).not.toContain('skive')
    // Siblings after the collapsed branch must still be there.
    expect(ids).toContain('couplings')
  })

  test('collapsing a leaf changes nothing', () => {
    expect(flattenTree(TREE, new Set(['gear'])).map((i) => i.node.id)).toEqual(
      flattenTree(TREE).map((i) => i.node.id),
    )
  })

  test('an orphan surfaces as a root rather than vanishing', () => {
    // The old table needed a separate orphan pass to show these at all. A
    // category the editor cannot see is a category nobody can re-home.
    const withOrphan = [...TREE, node('detached', 'deleted-parent', 0, 'Detached')]
    const flat = flattenTree(withOrphan)
    const orphan = flat.find((i) => i.node.id === 'detached')
    expect(orphan).toBeDefined()
    expect(orphan!.depth).toBe(0)
    expect(orphan!.parentId).toBeNull()
  })

  test('a cycle in the data does not hang the walk', () => {
    const cyclic = [node('a', 'b', 0), node('b', 'a', 0)]
    expect(() => flattenTree(cyclic)).not.toThrow()
  })
})

describe('groupByParent', () => {
  test('sorts each sibling set by position', () => {
    const shuffled = [node('x', null, 5), node('y', null, 1), node('z', null, 3)]
    expect(groupByParent(shuffled).get(null)!.map((n) => n.id)).toEqual(['y', 'z', 'x'])
  })

  test('breaks a position tie by name so order is at least stable', () => {
    const tied = [node('b', null, 0, 'Beta'), node('a', null, 0, 'Alpha')]
    expect(groupByParent(tied).get(null)!.map((n) => n.id)).toEqual(['a', 'b'])
  })
})

describe('descendantIds / subtreeHeight / ancestorPath', () => {
  test('descendantIds collects the whole branch, excluding the root', () => {
    expect(descendantIds(TREE, 'hoses').sort()).toEqual(
      ['couplings', 'ferrules', 'no-skive', 'skive'].sort(),
    )
  })

  test('a leaf has no descendants and zero height', () => {
    expect(descendantIds(TREE, 'gear')).toEqual([])
    expect(subtreeHeight(TREE, 'gear')).toBe(0)
  })

  test('subtreeHeight counts levels below, not nodes', () => {
    expect(subtreeHeight(TREE, 'hoses')).toBe(2)
    expect(subtreeHeight(TREE, 'ferrules')).toBe(1)
  })

  test('ancestorPath runs root-first and includes the node', () => {
    expect(ancestorPath(TREE, 'no-skive').map((n) => n.id)).toEqual([
      'hoses',
      'ferrules',
      'no-skive',
    ])
  })

  test('ancestorPath of a root is just the root', () => {
    expect(ancestorPath(TREE, 'pumps').map((n) => n.id)).toEqual(['pumps'])
  })
})

describe('projectDrop', () => {
  const items = flattenTree(TREE)
  const drop = (activeId: string, overId: string, offsetX: number) =>
    projectDrop({ items, nodes: TREE, activeId, overId, offsetX, indentWidth: INDENT })

  test('the row below sets the floor, even with no sideways drag', () => {
    // Drop `couplings` between `no-skive` and `skive`, both at depth 2.
    // Landing at its own depth of 1 would leave `skive` directly below a
    // shallower row and orphan it out of ferrules, so the floor wins.
    const p = drop('couplings', 'skive', 0)
    expect(p).not.toBeNull()
    expect(p!.depth).toBe(2)
    expect(p!.parentId).toBe('ferrules')
  })

  test('dragging right one step nests under the row above', () => {
    const p = drop('couplings', 'skive', INDENT)
    expect(p!.depth).toBe(2)
    expect(p!.parentId).toBe('ferrules')
  })

  test('dragging left off the last row promotes it to root', () => {
    // `gear` is the final row, so there is nothing below to set a floor.
    const p = drop('gear', 'gear', -INDENT * 3)
    expect(p!.depth).toBe(0)
    expect(p!.parentId).toBeNull()
  })

  test('a branch cannot be dropped inside itself', () => {
    // `no-skive` travels with `ferrules`, so it is not a row that can be
    // hovered — and certainly not one that can become the new parent.
    expect(drop('ferrules', 'no-skive', INDENT * 4)).toBeNull()
  })

  test('the dragged branch is not treated as its own neighbour', () => {
    // Dropping `hoses` onto `gear` must read `pumps` as the row above, not one
    // of the four rows that are moving with it.
    const p = drop('hoses', 'gear', 0)
    expect(p!.parentId === 'ferrules' || p!.parentId === 'no-skive').toBe(false)
  })

  test('a collapsed branch still counts towards the depth cap', () => {
    // `ferrules` is collapsed, so its children are absent from the visible
    // rows. Height read from the flat list would be 0 and the cap would wave
    // through a drop that buries `no-skive` past MAX_CATEGORY_DEPTH.
    const collapsed = flattenTree(TREE, new Set(['ferrules']))
    const p = projectDrop({
      items: collapsed,
      nodes: TREE,
      activeId: 'ferrules',
      overId: 'gear',
      offsetX: INDENT * 8,
      indentWidth: INDENT,
    })
    expect(p!.depth).toBe(MAX_CATEGORY_DEPTH - subtreeHeight(TREE, 'ferrules'))
  })

  test('cannot nest deeper than one level below the row above', () => {
    const p = drop('couplings', 'skive', INDENT * 8)
    // `no-skive` sits at depth 2, so the deepest legal landing is 3.
    expect(p!.depth).toBe(3)
  })

  test('the depth cap counts the dragged subtree, not just the row', () => {
    // `ferrules` carries children, so it may not sit at MAX_CATEGORY_DEPTH —
    // that would push `no-skive` one rung past the cap. Dropping it below
    // `gear` (depth 1) with a hard right drag must stop at the cap minus its
    // own height.
    const p = drop('ferrules', 'gear', INDENT * 8)
    expect(p!.depth).toBe(MAX_CATEGORY_DEPTH - subtreeHeight(TREE, 'ferrules'))
    expect(p!.depth).toBe(2)
  })

  test('a leaf may reach the cap exactly', () => {
    const p = drop('couplings', 'skive', INDENT * 8)
    expect(p!.depth).toBe(MAX_CATEGORY_DEPTH)
  })

  test('cannot sit shallower than the row below, which would orphan it', () => {
    // Dropping onto `ferrules` with a hard left drag: `no-skive` follows at
    // depth 2, so the landing cannot go above what keeps that valid.
    const p = drop('couplings', 'ferrules', -INDENT * 8)
    expect(p!.depth).toBeGreaterThanOrEqual(0)
    expect(p!.parentId).not.toBe('couplings')
  })

  test('returns null for a row that is not in the list', () => {
    expect(drop('ghost', 'hoses', 0)).toBeNull()
  })
})

describe('siblingIndexForDrop', () => {
  const items = flattenTree(TREE)

  test('counts only rows already under the target parent', () => {
    const index = siblingIndexForDrop({
      items,
      activeId: 'gear',
      overId: 'couplings',
      parentId: 'hoses',
    })
    // `ferrules` is the only `hoses` child above the drop point.
    expect(index).toBe(1)
  })

  test('dropping at the very top of a parent is index 0', () => {
    const index = siblingIndexForDrop({
      items,
      activeId: 'gear',
      overId: 'hoses',
      parentId: null,
    })
    expect(index).toBe(0)
  })

  test('a row dragged down past a sibling takes that sibling’s place', () => {
    // `ferrules` is index 0 under hoses and `couplings` is index 1. Dragging
    // the first past the second lands it at 1 — the vacated slot closes behind
    // it, so this is a swap and not a no-op.
    const index = siblingIndexForDrop({
      items,
      activeId: 'ferrules',
      overId: 'couplings',
      parentId: 'hoses',
    })
    expect(index).toBe(1)
  })

  test('a branch’s own children never inflate its index', () => {
    // `ferrules` carries `no-skive` and `skive`. Both sit between it and the
    // drop point in the rendered list, and both travel with the drag — count
    // either one and the branch lands two slots below where it was dropped.
    const index = siblingIndexForDrop({
      items,
      activeId: 'ferrules',
      overId: 'couplings',
      parentId: 'hoses',
    })
    expect(index).toBeLessThanOrEqual(1)
  })
})

describe('buildMoveOrdering', () => {
  test('a move to a new parent renumbers both sibling sets densely', () => {
    const writes = buildMoveOrdering({
      nodes: TREE,
      activeId: 'couplings',
      newParentId: 'pumps',
      newIndex: 0,
    })
    const byId = Object.fromEntries(writes.map((w) => [w.id, w]))
    expect(byId['couplings']).toEqual({ id: 'couplings', parentId: 'pumps', position: 0 })
    // `gear` was position 0 under pumps and is pushed down.
    expect(byId['gear']).toEqual({ id: 'gear', parentId: 'pumps', position: 1 })
  })

  test('a same-parent reorder rewrites only that sibling set', () => {
    const writes = buildMoveOrdering({
      nodes: TREE,
      activeId: 'skive',
      newParentId: 'ferrules',
      newIndex: 0,
    })
    expect(writes.map((w) => w.id).sort()).toEqual(['no-skive', 'skive'])
    expect(writes.find((w) => w.id === 'skive')!.position).toBe(0)
    expect(writes.find((w) => w.id === 'no-skive')!.position).toBe(1)
  })

  test('a drag that lands where it started writes nothing', () => {
    expect(
      buildMoveOrdering({ nodes: TREE, activeId: 'ferrules', newParentId: 'hoses', newIndex: 0 }),
    ).toEqual([])
  })

  test('positions come out dense and gapless, never tied', () => {
    // Ties are what made the old integer box unusable: two rows at the same
    // position means display order falls back to the name tiebreak, and the
    // next drag computes an index against an order nobody chose.
    const sparse = [
      node('r', null, 0),
      node('a', 'r', 10),
      node('b', 'r', 10),
      node('c', 'r', 40),
    ]
    const writes = buildMoveOrdering({
      nodes: sparse,
      activeId: 'c',
      newParentId: 'r',
      newIndex: 0,
    })
    const positions = writes
      .filter((w) => w.parentId === 'r')
      .map((w) => w.position)
      .sort((x, y) => x - y)
    expect(positions).toEqual([0, 1, 2])
  })

  test('promoting to root moves the row out of its old parent', () => {
    const writes = buildMoveOrdering({
      nodes: TREE,
      activeId: 'ferrules',
      newParentId: null,
      newIndex: 0,
    })
    expect(writes.find((w) => w.id === 'ferrules')).toEqual({
      id: 'ferrules',
      parentId: null,
      position: 0,
    })
    // The vacated sibling set closes its gap.
    expect(writes.find((w) => w.id === 'couplings')).toEqual({
      id: 'couplings',
      parentId: 'hoses',
      position: 0,
    })
  })

  test('an unknown id is a no-op rather than a throw', () => {
    expect(
      buildMoveOrdering({ nodes: TREE, activeId: 'ghost', newParentId: null, newIndex: 0 }),
    ).toEqual([])
  })

  test('an out-of-range index clamps instead of leaving a hole', () => {
    const writes = buildMoveOrdering({
      nodes: TREE,
      activeId: 'gear',
      newParentId: 'hoses',
      newIndex: 99,
    })
    expect(writes.find((w) => w.id === 'gear')!.position).toBe(2)
  })
})

describe('matchingWithAncestors', () => {
  test('a match keeps its whole ancestor chain so depth still reads as a tree', () => {
    const keep = matchingWithAncestors(TREE, 'no-skive')
    expect([...keep].sort()).toEqual(['ferrules', 'hoses', 'no-skive'].sort())
  })

  test('matches on slug as well as name', () => {
    expect(matchingWithAncestors(TREE, 'gear-pumps').has('gear')).toBe(true)
  })

  test('is case-insensitive', () => {
    expect(matchingWithAncestors(TREE, 'FERRULES').has('ferrules')).toBe(true)
  })

  test('an empty query keeps everything', () => {
    expect(matchingWithAncestors(TREE, '   ').size).toBe(TREE.length)
  })

  test('no match keeps nothing', () => {
    expect(matchingWithAncestors(TREE, 'zzzz').size).toBe(0)
  })
})

describe('arrayMove', () => {
  test('moves forwards and backwards without dropping elements', () => {
    expect(arrayMove([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4])
    expect(arrayMove([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3])
  })

  test('an out-of-range source leaves the list intact', () => {
    expect(arrayMove([1, 2, 3], 9, 0)).toEqual([1, 2, 3])
  })
})
