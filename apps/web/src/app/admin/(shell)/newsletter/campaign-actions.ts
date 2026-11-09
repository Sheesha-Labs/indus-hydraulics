'use server'

import { db, Prisma } from '@indus/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { auth } from '../../../../lib/admin-auth'
import { normaliseDesign } from '../../../../lib/newsletter/blocks/document'
import { RECORD_KINDS } from '../../../../lib/newsletter/blocks/types'
import { EDITABLE_STATUSES, campaignDraftSchema, type CampaignDraft, type CampaignStatus } from '../../../../lib/newsletter/campaign'
import { audienceSize, campaignProblemsLive, renderPreview, sendTest } from '../../../../lib/newsletter/campaigns'
import { searchRecords, type RecordOption } from '../../../../lib/newsletter/records'
import { senderSettingsSchema } from '../../../../lib/newsletter/sender'
import { STARTERS, starterDraft, type Starter } from '../../../../lib/newsletter/starters'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

/**
 * Newsletter campaign actions (Phase 3): drafts, preview, test send,
 * templates, sender settings. Writing and testing: NEWSLETTER_WRITE. Sender
 * settings: NEWSLETTER_SEND. Sending itself arrives in Phase 4.
 */

const CAMPAIGNS = '/admin/newsletter'
const TEMPLATES = '/admin/newsletter/templates'

function failure(err: unknown, what: string): Result<never> {
  // Say the first problem in words; the forms here show one message line.
  if (err instanceof z.ZodError) return fail('VALIDATION', err.issues[0]?.message ?? 'Check the form.')
  try {
    return failFromError(err)
  } catch {
    console.error(`[newsletter-campaign] ${what} failed`, err instanceof Error ? err.message : err)
    return fail('INTERNAL', `Could not ${what}. Try again.`)
  }
}

/** Content columns from a validated draft: blocks get a normalised design, rich keeps no design. */
function contentData(d: CampaignDraft) {
  return {
    subject: d.subject.trim(),
    preheader: d.preheader.trim(),
    format: d.format,
    design: d.format === 'blocks' ? (normaliseDesign(d.design) as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
    bodyHtml: d.format === 'rich' ? d.bodyHtml : '',
  }
}

// ── Create ─────────────────────────────────────────────────────────────

const createSchema = z.union([
  z.object({ starter: z.enum(STARTERS) }),
  z.object({ templateId: z.string().uuid() }),
  z.object({ duplicateOf: z.string().uuid() }),
])

export async function createCampaignAction(input: { starter: Starter } | { templateId: string } | { duplicateOf: string }): Promise<Result<never>> {
  let id: string
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const parsed = createSchema.parse(input)
    let data: Prisma.NewsletterCampaignUncheckedCreateInput
    if ('starter' in parsed) {
      const d = await starterDraft(parsed.starter)
      data = { ...contentData(d), audience: 'all', listIds: [] }
    } else if ('templateId' in parsed) {
      const t = await db.newsletterTemplate.findUnique({ where: { id: parsed.templateId } })
      if (!t) return fail('NOT_FOUND', 'That template no longer exists.')
      data = {
        subject: t.subject,
        preheader: t.preheader,
        format: t.format,
        design: t.design ?? Prisma.DbNull,
        bodyHtml: t.bodyHtml,
        audience: 'all',
        listIds: [],
      }
    } else {
      const c = await db.newsletterCampaign.findUnique({ where: { id: parsed.duplicateOf } })
      if (!c) return fail('NOT_FOUND', 'That newsletter no longer exists.')
      data = {
        subject: c.subject,
        preheader: c.preheader,
        format: c.format,
        design: c.design ?? Prisma.DbNull,
        bodyHtml: c.bodyHtml,
        audience: c.audience,
        listIds: c.listIds,
      }
    }
    const row = await db.newsletterCampaign.create({
      data: { ...data, createdById: session.user.id, updatedById: session.user.id },
      select: { id: true },
    })
    id = row.id
    revalidatePath(CAMPAIGNS)
  } catch (err) {
    return failure(err, 'create the newsletter')
  }
  redirect(`${CAMPAIGNS}/campaigns/${id}`)
}

// ── Save, preview, test ────────────────────────────────────────────────

export type SaveResult = { savedAt: string; problems: Record<string, string>; audienceSize: number }

export async function saveCampaignAction(id: string, draft: CampaignDraft): Promise<Result<SaveResult>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const d = campaignDraftSchema.parse(draft)
    const current = await db.newsletterCampaign.findUnique({ where: { id }, select: { status: true } })
    if (!current) return fail('NOT_FOUND', 'That newsletter no longer exists.')
    if (!EDITABLE_STATUSES.includes(current.status as CampaignStatus)) {
      return fail('PRECONDITION_FAILED', 'This newsletter has already been sent and can no longer be changed.')
    }
    const now = new Date()
    // Conditional on still being editable: a send starting between the read
    // and this write must win.
    const r = await db.newsletterCampaign.updateMany({
      where: { id, status: { in: ['draft', 'scheduled'] } },
      data: { ...contentData(d), audience: d.audience, listIds: d.listIds, updatedById: session.user.id, updatedAt: now },
    })
    if (r.count === 0) return fail('PRECONDITION_FAILED', 'This newsletter started sending and can no longer be changed.')
    const [problems, size] = await Promise.all([campaignProblemsLive(d), audienceSize(d.audience, d.listIds)])
    revalidatePath(CAMPAIGNS)
    return ok({ savedAt: now.toISOString(), problems, audienceSize: size })
  } catch (err) {
    return failure(err, 'save the newsletter')
  }
}

export async function previewCampaignAction(
  draft: CampaignDraft,
  recipient: 'subscriber' | 'list' = 'subscriber',
): Promise<Result<{ subject: string; html: string; missingRecords: number }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const d = campaignDraftSchema.parse(draft)
    const r = await renderPreview(d, recipient === 'list' ? 'list' : 'subscriber')
    return ok({ subject: r.subject, html: r.html, missingRecords: r.missingRecords })
  } catch (err) {
    return failure(err, 'render the preview')
  }
}

export async function sendTestAction(id: string, draft: CampaignDraft): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const d = campaignDraftSchema.parse(draft)
    if (!d.subject.trim()) return fail('VALIDATION', 'Write a subject before sending a test.')
    const staff = await db.staffUser.findUnique({ where: { id: session.user.id }, select: { email: true } })
    if (!staff?.email) return fail('NOT_FOUND', 'Your account has no email address to send the test to.')
    const r = await sendTest(id, d, staff.email)
    if (!r.ok) return fail('INTERNAL', r.error)
    return ok({ message: `Test sent to ${staff.email}.` })
  } catch (err) {
    return failure(err, 'send the test')
  }
}

/** Deletes a draft or a cancelled newsletter. A sent one stays: it is the record of what went out. */
export async function deleteCampaignAction(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const r = await db.newsletterCampaign.deleteMany({ where: { id, status: { in: ['draft', 'cancelled'] } } })
    if (r.count === 0) return fail('PRECONDITION_FAILED', 'Only a draft or a cancelled newsletter can be deleted.')
    revalidatePath(CAMPAIGNS)
  } catch (err) {
    return failure(err, 'delete the newsletter')
  }
  redirect(CAMPAIGNS)
}

export async function duplicateCampaignAction(id: string): Promise<Result<never>> {
  return createCampaignAction({ duplicateOf: id })
}

// ── Records picker ─────────────────────────────────────────────────────

export async function searchRecordsAction(kind: string, q: string): Promise<Result<RecordOption[]>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const k = z.enum(RECORD_KINDS).parse(kind)
    return ok(await searchRecords(k, z.string().max(100).parse(q)))
  } catch (err) {
    return failure(err, 'search')
  }
}

// ── Templates ──────────────────────────────────────────────────────────

const templateSchema = z.object({
  name: z.string().trim().min(1, 'Name the template.').max(120),
  description: z.string().trim().max(400).default(''),
})

export async function saveAsTemplateAction(
  campaignId: string,
  input: { name: string; description: string },
): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const meta = templateSchema.parse(input)
    const c = await db.newsletterCampaign.findUnique({ where: { id: campaignId } })
    if (!c) return fail('NOT_FOUND', 'That newsletter no longer exists.')
    await db.newsletterTemplate.create({
      data: {
        ...meta,
        subject: c.subject,
        preheader: c.preheader,
        format: c.format,
        design: c.design ?? Prisma.DbNull,
        bodyHtml: c.bodyHtml,
        createdById: session.user.id,
      },
    })
    revalidatePath(TEMPLATES)
    return ok({ message: `Saved as the template “${meta.name}”.` })
  } catch (err) {
    return failure(err, 'save the template')
  }
}

export async function renameTemplateAction(id: string, _prev: unknown, formData: FormData): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const meta = templateSchema.parse({ name: formData.get('name'), description: formData.get('description') ?? '' })
    const r = await db.newsletterTemplate.updateMany({ where: { id }, data: { ...meta, updatedAt: new Date() } })
    if (r.count === 0) return fail('NOT_FOUND', 'That template no longer exists.')
    revalidatePath(TEMPLATES)
    return ok({ message: 'Saved.' })
  } catch (err) {
    return failure(err, 'save the template')
  }
}

export async function deleteTemplateAction(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const r = await db.newsletterTemplate.deleteMany({ where: { id } })
    if (r.count === 0) return fail('NOT_FOUND', 'Already deleted.')
    revalidatePath(TEMPLATES)
    return ok({ message: 'Deleted.' })
  } catch (err) {
    return failure(err, 'delete the template')
  }
}

// ── Sender settings ────────────────────────────────────────────────────

export async function saveSenderSettingsAction(_prev: unknown, formData: FormData): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const s = senderSettingsSchema.parse({
      fromName: formData.get('fromName'),
      fromLocal: formData.get('fromLocal'),
      replyTo: formData.get('replyTo'),
    })
    await db.newsletterSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...s, updatedById: session.user.id },
      update: { ...s, updatedById: session.user.id },
    })
    revalidatePath(`${CAMPAIGNS}/settings`)
    return ok({ message: 'Saved. The next newsletter sends from this address.' })
  } catch (err) {
    return failure(err, 'save the sender')
  }
}
