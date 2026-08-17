'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@indus/db'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { invalidateBlogPosts } from '../../../../lib/cache-tags'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

/**
 * Row actions for the Blog Editor list.
 *
 * Three states a post can be moved between from the list, each reversible
 * except the last:
 *
 *   archived — off the site, keeps its slug reserved. Un-archiving returns it
 *              to draft rather than straight back to live: going public again
 *              should be a deliberate act, not a side effect of undo.
 *   trashed  — `deletedAt` set. Out of the list, restorable from the Trash tab.
 *   deleted  — the row is gone. Only from the trash, and only for the roles
 *              that can already delete catalogue rows.
 *
 * Every one of these forces `isPublished` false, which is the flag every
 * storefront read filters on. That is what makes "archive" and "trash" take
 * effect on the site without a second gate on every public query.
 */

function revalidateBlog(slug?: string) {
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  if (slug) revalidatePath(`/blog/${slug}`)
  // The homepage rail and the blog index read through `unstable_cache` on the
  // `blog-posts` tag; without this purge the post lingers there.
  invalidateBlogPosts()
}

async function loadPost(id: string) {
  return db.blogPost.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, status: true, deletedAt: true },
  })
}

export async function setBlogPostArchived(
  id: string,
  archived: boolean,
): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const post = await loadPost(id)
    if (!post) return fail('NOT_FOUND', 'Post not found')

    const next = archived ? 'archived' : 'draft'
    if (post.status === next) return fail('VALIDATION', `Already ${next}.`)

    await db.blogPost.update({
      where: { id },
      data: { status: next, isPublished: false },
    })

    revalidateBlog(post.slug)
    return ok({
      message: archived
        ? `"${post.title}" archived.`
        : `"${post.title}" moved back to draft.`,
    })
  } catch (err) {
    return failFromError(err)
  }
}

/** Soft delete — out of the list and off the site, restorable from Trash. */
export async function trashBlogPost(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const post = await loadPost(id)
    if (!post) return fail('NOT_FOUND', 'Post not found')
    if (post.deletedAt) return fail('VALIDATION', 'Already in the trash.')

    await db.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    })

    revalidateBlog(post.slug)
    return ok({ message: `"${post.title}" moved to trash.` })
  } catch (err) {
    return failFromError(err)
  }
}

export async function restoreBlogPost(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const post = await loadPost(id)
    if (!post) return fail('NOT_FOUND', 'Post not found')
    if (!post.deletedAt) return fail('VALIDATION', 'Not in the trash any more.')

    // Back to draft, never straight back to published — the same reasoning as
    // un-archiving. `status` may still read `published` from before it was
    // trashed, and leaving it there would show a green pill on a post that is
    // not on the site.
    await db.blogPost.update({
      where: { id },
      data: { deletedAt: null, status: 'draft', isPublished: false },
    })

    revalidateBlog(post.slug)
    return ok({ message: `"${post.title}" restored as a draft.` })
  } catch (err) {
    return failFromError(err)
  }
}

/**
 * Permanent delete. Only from the trash, so it takes two deliberate steps, and
 * only for the roles trusted with catalogue deletes — a `cms_editor` can trash
 * a post but cannot destroy it.
 */
export async function deleteBlogPostPermanently(
  id: string,
): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_DELETE)
    const post = await loadPost(id)
    if (!post) return fail('NOT_FOUND', 'Post not found')
    if (!post.deletedAt) return fail('VALIDATION', 'Move it to the trash first.')

    // The join rows cascade (see BlogPostProduct / BlogPostCategory), so the
    // post's product embeds and linked categories go with it.
    await db.blogPost.delete({ where: { id } })

    revalidateBlog(post.slug)
    return ok({ message: `"${post.title}" deleted for good.` })
  } catch (err) {
    return failFromError(err)
  }
}
