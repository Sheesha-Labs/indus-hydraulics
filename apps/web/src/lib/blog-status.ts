/**
 * The status vocabulary shared by the blog list and the editor's publish card.
 *
 * A PLAIN module, deliberately. This used to live in `BlogPublishCard.tsx`,
 * which carries `'use client'` — and the list page, a Server Component, called
 * `displayStatus` during render. Every export of a client module is a client
 * *reference* on the server, so the call threw at request time:
 *
 *   Attempted to call displayStatus() from the server but displayStatus is on
 *   the client. It's not possible to invoke a client function from the server.
 *
 * It typechecked, linted, built and passed every test — the page is dynamic, so
 * nothing prerendered it and nothing else reaches the boundary. Only serving
 * the page does. Anything both sides need lives here from now on.
 */

/**
 * `BlogPostStatus` in the database also has `scheduled`. Nothing writes it and
 * nothing honours it — publishing sets `isPublished` true immediately, and no
 * storefront read filters on `publishedAt <= now`, so a future-dated post is
 * live the moment it is published. A label that cannot be reached is worse than
 * an absent feature: it claims one.
 *
 * Restore it the day scheduling is real. It needs a `publishedAt <= now` filter
 * on all seven read sites plus a job to flip the flag.
 */
export type PublishStatus = 'draft' | 'published' | 'archived'

export const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const STATUS_STYLE: Record<PublishStatus, string> = {
  draft: 'text-ih-muted bg-ih-surface-2',
  published: 'text-[color:var(--color-ih-success)] bg-ih-success-soft',
  archived: 'text-ih-muted-2 bg-ih-surface-3',
}

/**
 * The status a row should DISPLAY.
 *
 * `status` and `isPublished` can disagree on a row written before the two were
 * kept in lockstep, and the enum still carries `scheduled`. Both resolve to
 * Draft: whatever the column says, a post the site is not serving is a draft to
 * the person looking at the list.
 */
export function displayStatus(status: string, isPublished: boolean): PublishStatus {
  if (status === 'archived') return 'archived'
  if (status === 'published' && isPublished) return 'published'
  return 'draft'
}
