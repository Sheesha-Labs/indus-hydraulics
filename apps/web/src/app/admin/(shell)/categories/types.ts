/**
 * The category row this screen works with.
 *
 * Structurally compatible with `CategoryTreeNode` from `@indus/domain` — it has
 * `id`, `parentId`, `position` and `name` — so every tree helper accepts it
 * directly and returns rows carrying the extra admin fields intact. Keeping the
 * shape here rather than in the domain package means the tree maths stays free
 * of counts and template names it has no business knowing about.
 */
export interface Cat {
  id: string
  parentId: string | null
  slug: string
  name: string
  position: number
  isPublished: boolean
  /** Products whose `categoryId` is this row — not including sub-categories. */
  productCount: number
  childCount: number
  /**
   * How many megamenu items link here.
   *
   * Zero on a published category means it is live and indexable but has no
   * click path from the header. See the note in `page.tsx` about why this
   * screen reports that rather than fixing it.
   */
  navItemCount: number
  defaultSpecTemplateId: string | null
  defaultSpecTemplateName: string | null
}

export interface TemplateOption {
  id: string
  name: string
  slug: string
}
