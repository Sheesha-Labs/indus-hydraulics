'use server'

/**
 * Save and reset for one sub-page's section document.
 *
 * The master-page action's twin, keyed by kind + record slug instead of a
 * page key. Kept separate rather than generalised into one action with a
 * discriminator: a server action is a public HTTP endpoint, and one that takes
 * "which family of page is this" as an argument is one validation slip away
 * from writing a market document under a master-page key.
 *
 * Auth: ROLES.CMS_WRITE (super_admin / manager / cms_editor).
 */

import { revalidatePath } from 'next/cache'
import { db } from '@indus/db'
import {
  defaultDocument,
  isSubPageKind,
  subPageContentKey,
  subPageDef,
  validateSections,
  type StoredSection,
  type SubPageKind,
} from '@indus/domain'
import { auth } from '../../../../../../../lib/admin-auth'
import { invalidatePageContent } from '../../../../../../../lib/cache-tags'
import { ROLES, requireRole } from '../../../../../../../lib/rbac'

export type SaveSubPageResult =
  | { status: 'ok'; message: string }
  | { status: 'invalid'; message: string; issues: string[] }
  | { status: 'error'; message: string }

/** `market:nigeria` — the editor's single `pageId` string, split back here. */
function parseId(pageId: string): { kind: SubPageKind; slug: string } | null {
  const [kind, ...rest] = pageId.split(':')
  const slug = rest.join(':')
  if (!kind || !slug || !isSubPageKind(kind)) return null
  return { kind, slug }
}

async function editorId(): Promise<{ id: string } | { error: SaveSubPageResult }> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    return { id: session.user.id }
  } catch {
    return {
      error: {
        status: 'error',
        message: 'Your account can’t edit pages. Ask an administrator for content access.',
      },
    }
  }
}

async function persist(
  kind: SubPageKind,
  slug: string,
  sections: StoredSection[],
  staffId: string,
): Promise<SaveSubPageResult> {
  const key = subPageContentKey(kind, slug)
  try {
    await db.pageContent.upsert({
      where: { key },
      create: { key, kind, sections: sections as unknown as object[], updatedById: staffId },
      update: { sections: sections as unknown as object[], updatedById: staffId },
    })
  } catch (error) {
    console.error(`[pages] failed to save ${kind} "${slug}"`, error)
    return { status: 'error', message: 'The database rejected the change. Try again.' }
  }

  invalidatePageContent()
  revalidatePath(`/markets/${slug}`)
  revalidatePath(`/admin/pages/sub/${kind}/${slug}`)
  revalidatePath(`/admin/pages/sub/${kind}`)
  return { status: 'ok', message: 'Saved.' }
}

export async function saveSubPage(
  pageId: string,
  sections: StoredSection[],
): Promise<SaveSubPageResult> {
  const editor = await editorId()
  if ('error' in editor) return editor.error

  const parsed = parseId(pageId)
  if (!parsed) return { status: 'error', message: 'Unknown page.' }

  // The record's name only labels the validation issues, so the slug standing
  // in for it is harmless — and it saves a query on every save.
  const def = subPageDef(parsed.kind, { name: parsed.slug, slug: parsed.slug })
  const result = validateSections(def, sections)
  if (!result.ok) {
    return {
      status: 'invalid',
      message: 'Fix these before saving.',
      issues: result.issues.map((i) => `${i.section} · ${i.field}: ${i.message}`),
    }
  }

  return persist(parsed.kind, parsed.slug, result.sections, editor.id)
}

/** Drop every override — the page goes back to the template's own wording. */
export async function resetSubPage(pageId: string): Promise<SaveSubPageResult> {
  const editor = await editorId()
  if ('error' in editor) return editor.error

  const parsed = parseId(pageId)
  if (!parsed) return { status: 'error', message: 'Unknown page.' }

  const def = subPageDef(parsed.kind, { name: parsed.slug, slug: parsed.slug })
  return persist(parsed.kind, parsed.slug, defaultDocument(def), editor.id)
}
