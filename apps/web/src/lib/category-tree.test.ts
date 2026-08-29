import { describe, expect, it } from 'vitest'
import { ancestorTrail, descendantIds, indexTree, type CategoryNode } from './category-tree'

/**
 * These replace two loops that each issued one query per tree level. The
 * behaviour they encode — cycle safety, unpublished handling, ordering — used
 * to be spread across those loops and was never tested, because testing it
 * meant a database.
 */
const node = (id: string, parentId: string | null, isPublished = true): CategoryNode => ({
  id,
  parentId,
  isPublished,
  slug: `${id}-slug`,
  name: id.toUpperCase(),
})

//  root ─ mid ─ leaf
//       └ other (unpublished) ─ hidden-child
const TREE = [
  node('root', null),
  node('mid', 'root'),
  node('leaf', 'mid'),
  node('other', 'root', false),
  node('hidden-child', 'other'),
]
const { byId, children } = indexTree(TREE)

describe('ancestorTrail', () => {
  it('returns the path root-first, inclusive of the category itself', () => {
    expect(ancestorTrail(byId, 'leaf').map((n) => n.slug)).toEqual([
      'root-slug',
      'mid-slug',
      'leaf-slug',
    ])
  })

  it('is just the root for a root category', () => {
    expect(ancestorTrail(byId, 'root').map((n) => n.slug)).toEqual(['root-slug'])
  })

  it('keeps unpublished ancestors, and reports that they are unpublished', () => {
    // Hiding a rung would silently reparent the category in the reader's eyes.
    const trail = ancestorTrail(byId, 'hidden-child')
    expect(trail.map((n) => n.slug)).toEqual(['root-slug', 'other-slug', 'hidden-child-slug'])
    expect(trail.find((n) => n.slug === 'other-slug')?.isPublished).toBe(false)
  })

  it('stops on a cycle instead of spinning to the depth cap', () => {
    // parentId is editable from the admin tree, so this is reachable.
    const cyclic = indexTree([node('a', 'b'), node('b', 'a')]).byId
    const trail = ancestorTrail(cyclic, 'a')
    expect(trail).toHaveLength(2)
    expect(new Set(trail.map((n) => n.slug)).size).toBe(2)
  })

  it('survives a self-parent', () => {
    const selfish = indexTree([node('x', 'x')]).byId
    expect(ancestorTrail(selfish, 'x').map((n) => n.slug)).toEqual(['x-slug'])
  })

  it('stops cleanly when a parent row is missing', () => {
    const orphan = indexTree([node('kid', 'ghost')]).byId
    expect(ancestorTrail(orphan, 'kid').map((n) => n.slug)).toEqual(['kid-slug'])
  })

  it('returns nothing for an unknown id', () => {
    expect(ancestorTrail(byId, 'nope')).toEqual([])
  })
})

describe('descendantIds', () => {
  it('includes the root and every published descendant', () => {
    expect(descendantIds(children, 'root').sort()).toEqual(['leaf', 'mid', 'root'])
  })

  it('cuts an unpublished branch entirely, children included', () => {
    // Matches the replaced query, where each level filtered on isPublished —
    // so a published child of an unpublished parent stays hidden.
    const ids = descendantIds(children, 'root')
    expect(ids).not.toContain('other')
    expect(ids).not.toContain('hidden-child')
  })

  it('includes the root even when the root itself is unpublished', () => {
    // The caller has already decided the page is worth rendering.
    expect(descendantIds(children, 'other')).toContain('other')
  })

  it('is just the id for a leaf', () => {
    expect(descendantIds(children, 'leaf')).toEqual(['leaf'])
  })

  it('does not loop forever on a cycle', () => {
    const looped = indexTree([node('p', null), node('q', 'p'), node('p2', 'q')]).children
    expect(descendantIds(looped, 'p').length).toBeLessThan(10)
  })
})
