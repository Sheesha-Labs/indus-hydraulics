import type { BlogBlocksInput } from '@indus/domain'

/**
 * Article seed shape.
 *
 * Articles are authored as typed TS files and imported, the same way the 20
 * service cases were. That is deliberate rather than a stopgap: the block
 * array is a discriminated union, so authoring in TypeScript means a malformed
 * block is a compile error at write time instead of a validation failure
 * discovered after publish. It also puts article copy under review in a pull
 * request, which for standards content is the point — a wrong pressure figure
 * should be caught by a reviewer, not by a reader on a rig.
 */
export type BlogArticleSeed = {
  slug: string
  title: string
  excerpt: string
  /** BlogCategory slug — must already exist. */
  categorySlug: string
  /** BlogAuthor slug — must already exist. */
  authorSlug: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  publishedAt: string
  /**
   * Authoring type, not the parsed one: defaults like `highlight` and `done`
   * stay optional here, which is the point of having them.
   */
  bodyBlocks: BlogBlocksInput
}
