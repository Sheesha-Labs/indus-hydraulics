'use server'

/**
 * Save and reset for one master page's section document.
 *
 * Validation lives in `@indus/domain/page-sections` and is generated from the
 * field definitions, so the registry stays the single source of truth for what
 * a page may hold — a section that gains a field gains its rule here for free.
 *
 * Auth: ROLES.CMS_WRITE (super_admin / manager / cms_editor).
 */

import { revalidatePath } from 'next/cache'
import { db } from '@indus/db'
import {
  defaultDocument,
  getMasterPage,
  masterContentKey,
  validateSections,
  type StoredSection,
} from '@indus/domain'
import { auth } from '../../../../../../lib/admin-auth'
import { invalidatePageContent } from '../../../../../../lib/cache-tags'
import { ROLES, requireRole } from '../../../../../../lib/rbac'
import { sanitizeBlogProseHtml } from '../../../../../../lib/blog-prose-html'

export type SaveSectionsResult =
  | { status: 'ok'; message: string }
  | { status: 'invalid'; message: string; issues: string[] }
  | { status: 'error'; message: string }

/**
 * Rich-text fields hold HTML that a storefront page injects with
 * `dangerouslySetInnerHTML`. Nothing between the editor and that injection
 * constrains it — the value arrives as a plain string — so this is the
 * boundary, and it runs on save rather than on render.
 */
function sanitiseRichText(
  pageKey: string,
  sections: StoredSection[],
): StoredSection[] {
  const def = getMasterPage(pageKey)
  if (!def) return sections
  return sections.map((section) => {
    const sectionDef = def.sections.find((d) => d.key === section.key)
    if (!sectionDef) return section
    const richKeys = sectionDef.fields
      .filter((f) => f.kind === 'richtext')
      .map((f) => f.key)
    if (richKeys.length === 0) return section
    const values = { ...section.values }
    for (const key of richKeys) {
      const value = values[key]
      if (typeof value === 'string') values[key] = sanitizeBlogProseHtml(value)
    }
    return { ...section, values }
  })
}

async function persist(
  pageKey: string,
  sections: StoredSection[],
  staffId: string,
): Promise<SaveSectionsResult> {
  const def = getMasterPage(pageKey)
  if (!def) return { status: 'error', message: 'Unknown page.' }

  const key = masterContentKey(pageKey)
  const payload = sanitiseRichText(pageKey, sections)

  try {
    await db.pageContent.upsert({
      where: { key },
      create: {
        key,
        kind: 'master',
        sections: payload as unknown as object[],
        updatedById: staffId,
      },
      update: { sections: payload as unknown as object[], updatedById: staffId },
    })
  } catch (error) {
    console.error(`[pages] failed to save "${pageKey}"`, error)
    return { status: 'error', message: 'The database rejected the change. Try again.' }
  }

  // The storefront caches its section reads under one tag; the admin routes
  // are dynamic but their "edited" stamps come from the same row.
  invalidatePageContent()
  revalidatePath(def.path)
  revalidatePath(`/admin/pages/master/${pageKey}`)
  revalidatePath('/admin/pages')
  return { status: 'ok', message: 'Saved.' }
}

/**
 * `requireRole` throws; a server action returns. Doing the conversion once
 * here keeps both entry points from leaking a stack trace into a toast.
 */
async function editorId(): Promise<{ id: string } | { error: SaveSectionsResult }> {
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

export async function saveMasterPage(
  pageKey: string,
  sections: StoredSection[],
): Promise<SaveSectionsResult> {
  const editor = await editorId()
  if ('error' in editor) return editor.error

  const def = getMasterPage(pageKey)
  if (!def) return { status: 'error', message: 'Unknown page.' }

  const result = validateSections(def, sections)
  if (!result.ok) {
    return {
      status: 'invalid',
      message: 'Fix these before saving.',
      issues: result.issues.map((i) => `${i.section} · ${i.field}: ${i.message}`),
    }
  }

  return persist(pageKey, result.sections, editor.id)
}

/** Drop every override — the page goes back to the wording shipped in code. */
export async function resetMasterPage(pageKey: string): Promise<SaveSectionsResult> {
  const editor = await editorId()
  if ('error' in editor) return editor.error

  const def = getMasterPage(pageKey)
  if (!def) return { status: 'error', message: 'Unknown page.' }

  return persist(pageKey, defaultDocument(def), editor.id)
}
