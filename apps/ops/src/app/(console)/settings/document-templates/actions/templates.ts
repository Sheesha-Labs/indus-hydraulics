'use server'

import { TEMPLATE_KINDS, templateDefinitionSchema, type DocKind } from '@indus/ops-core'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { AuditEntry } from '../../../../../lib/audit'
import { defineAction } from '../../../../../lib/define-action'
import {
  discardTemplateDraft,
  publishTemplate,
  purgeTemplate,
  saveTemplateDraft,
  templateSubjectId,
} from '../../../../../server/documents/templates'

/**
 * Board 57 actions (S11-T05). Owner only; the Helper sees the page read-only (219). The definition is parsed
 * twice: here by the strict schema (an unknown key, or a "supplier", "cost" or "margin" column, never reaches
 * the server code), then by the kind's rules in the service. Publishing purges the kind's cache tag.
 */
const PATH = '/settings/document-templates'
const kind = z.enum(TEMPLATE_KINDS as [DocKind, ...DocKind[]])
const stamp = z.string().min(1).max(64)

const audit = (k: DocKind, field: string, before: unknown, after: unknown) => ({
  subjectType: 'settings' as const,
  subjectId: templateSubjectId(k),
  kind: 'settings' as const,
  field: `document_template.${k}.${field}`,
  before: before as NonNullable<AuditEntry['before']>,
  after: after as NonNullable<AuditEntry['after']>,
})

export const saveTemplateDraftAction = defineAction({
  name: 'documentTemplates.saveDraft',
  schema: z.object({ kind, definition: templateDefinitionSchema, stamp }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await saveTemplateDraft(ctx.tx!, input.kind, input.definition, input.stamp)
    revalidatePath(`${PATH}/${input.kind}`)
    return out
  },
  audit: (input, out) =>
    audit(input.kind, 'draft', out.before, { version: out.version, ...input.definition }),
})

export const publishTemplateAction = defineAction({
  name: 'documentTemplates.publish',
  schema: z.object({ kind, stamp }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await publishTemplate(ctx.tx!, input.kind, input.stamp, ctx.user)
    purgeTemplate(input.kind)
    revalidatePath(PATH)
    revalidatePath(`${PATH}/${input.kind}`)
    return out
  },
  audit: (input, out) =>
    audit(
      input.kind,
      'published',
      { version: out.previousVersion, id: out.previousId },
      { version: out.version, id: out.id }
    ),
})

export const discardTemplateDraftAction = defineAction({
  name: 'documentTemplates.discardDraft',
  schema: z.object({ kind, stamp }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    await discardTemplateDraft(ctx.tx!, input.kind, input.stamp)
    revalidatePath(`${PATH}/${input.kind}`)
    return { discarded: true }
  },
  audit: (input) => audit(input.kind, 'draft', { draft: true }, { draft: null }),
})
