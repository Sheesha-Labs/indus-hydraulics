'use server'

import { db, Prisma } from '@indus/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { auth } from '../../../../lib/admin-auth'
import { normaliseDesign } from '../../../../lib/newsletter/blocks/document'
import { RECORD_KINDS } from '../../../../lib/newsletter/blocks/types'
import { EDITABLE_STATUSES, campaignDraftSchema, type CampaignDraft, type CampaignStatus } from '../../../../lib/newsletter/campaign'
import { audienceSize, campaignProblemsLive, draftOf, renderPreview, sendTest } from '../../../../lib/newsletter/campaigns'
import { searchRecords, type RecordOption } from '../../../../lib/newsletter/records'
import { senderSettingsSchema } from '../../../../lib/newsletter/sender'
import { STARTERS, starterDraft, type Starter } from '../../../../lib/newsletter/starters'
import { NEWSLETTER_SEND_EVENT } from '../../../../inngest/newsletterSend'
import { inngest } from '../../../../inngest/client'
import { PACE_OPTIONS } from '../../../../lib/newsletter/send'
import { ROLES, hasRole, requireRole } from '../../../../lib/rbac'
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

export type SaveResult = { savedAt: string; problems: Record<string, string>; audienceSize: number; unscheduled: boolean }

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
    // A scheduled newsletter was approved by someone who may send. An edit by
    // someone who may not (a cms_editor) takes it back to a draft, so they
    // cannot change what — or who — a manager scheduled.
    const unschedule = current.status === 'scheduled' && !hasRole(session, ROLES.NEWSLETTER_SEND)
    // Conditional on still being editable: a send starting between the read
    // and this write must win.
    const r = await db.newsletterCampaign.updateMany({
      where: { id, status: { in: ['draft', 'scheduled'] } },
      data: {
        ...contentData(d),
        audience: d.audience,
        listIds: d.listIds,
        updatedById: session.user.id,
        updatedAt: now,
        ...(unschedule ? { status: 'draft' as const, scheduledAt: null } : {}),
      },
    })
    if (r.count === 0) return fail('PRECONDITION_FAILED', 'This newsletter started sending and can no longer be changed.')
    const [problems, size] = await Promise.all([campaignProblemsLive(d), audienceSize(d.audience, d.listIds)])
    revalidatePath(CAMPAIGNS)
    if (unschedule) revalidatePath(`${CAMPAIGNS}/campaigns/${id}`)
    return ok({ savedAt: now.toISOString(), problems, audienceSize: size, unscheduled: unschedule })
  } catch (err) {
    return failure(err, 'save the newsletter')
  }
}

export async function previewCampaignAction(
  draft: CampaignDraft,
  recipient: 'subscriber' | 'list' = 'subscriber',
): Promise<Result<{ subject: string; html: string; text: string; missingRecords: number }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const d = campaignDraftSchema.parse(draft)
    const r = await renderPreview(d, recipient === 'list' ? 'list' : 'subscriber')
    return ok({ subject: r.subject, html: r.html, text: r.text, missingRecords: r.missingRecords })
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

// ── Send, schedule, cancel (Phase 4) ───────────────────────────────────

const sendOptionsSchema = z.object({
  maxPerHour: z.number().int().refine((n) => (PACE_OPTIONS as readonly number[]).includes(n), 'Pick a sending pace.'),
  dryRun: z.boolean(),
})

/** The checks every send and schedule makes, on the saved row. */
async function readyToSend(id: string): Promise<Result<{ size: number }>> {
  const row = await db.newsletterCampaign.findUnique({ where: { id } })
  if (!row) return fail('NOT_FOUND', 'That newsletter no longer exists.')
  if (row.status !== 'draft' && row.status !== 'scheduled') return fail('PRECONDITION_FAILED', 'This newsletter has already been sent.')
  const draft = draftOf(row)
  const problems = await campaignProblemsLive(draft)
  const first = Object.values(problems)[0]
  if (first) return fail('PRECONDITION_FAILED', first)
  const size = await audienceSize(draft.audience, draft.listIds)
  if (size === 0) return fail('PRECONDITION_FAILED', 'Nobody to send to: no confirmed subscribers or active list contacts in the audience.')
  return ok({ size })
}

/**
 * Start sending now. Requires NEWSLETTER_SEND — writing a newsletter does not
 * let someone mail everyone (Bazar bug 3). The send itself starts in the
 * Inngest function, whose start step is atomic: a double click sends once.
 */
export async function sendNowAction(id: string, options: { maxPerHour: number; dryRun: boolean }): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const opts = sendOptionsSchema.parse(options)
    const ready = await readyToSend(id)
    if (!ready.success) return ready
    await db.newsletterCampaign.updateMany({
      where: { id, status: { in: ['draft', 'scheduled'] } },
      data: { ...opts, sentById: session.user.id, updatedById: session.user.id },
    })
    await inngest.send({ name: NEWSLETTER_SEND_EVENT, data: { campaignId: id } })
    revalidatePath(`${CAMPAIGNS}/campaigns/${id}`)
    revalidatePath(CAMPAIGNS)
    return ok({
      message: opts.dryRun
        ? `Rehearsal started for ${ready.data.size.toLocaleString('en-US')} people — nothing will be emailed.`
        : `Sending to ${ready.data.size.toLocaleString('en-US')} people has started.`,
    })
  } catch (err) {
    return failure(err, 'start the send')
  }
}

const MIN_LEAD_MS = 5 * 60 * 1000
const MAX_LEAD_MS = 60 * 24 * 60 * 60 * 1000

export async function scheduleAction(
  id: string,
  options: { at: string; maxPerHour: number; dryRun: boolean },
): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const opts = sendOptionsSchema.parse(options)
    const at = new Date(z.string().datetime().parse(options.at))
    const lead = at.getTime() - Date.now()
    if (lead < MIN_LEAD_MS) return fail('VALIDATION', 'Pick a time at least five minutes from now.')
    if (lead > MAX_LEAD_MS) return fail('VALIDATION', 'Pick a time within the next 60 days.')
    const ready = await readyToSend(id)
    if (!ready.success) return ready
    const r = await db.newsletterCampaign.updateMany({
      where: { id, status: { in: ['draft', 'scheduled'] } },
      data: { ...opts, status: 'scheduled', scheduledAt: at, sentById: session.user.id, updatedById: session.user.id },
    })
    if (r.count === 0) return fail('PRECONDITION_FAILED', 'This newsletter has already been sent.')
    // The event fires at `ts`; the run checks the campaign is still
    // scheduled for exactly this time, so rescheduling needs no cancel.
    await inngest.send({ name: NEWSLETTER_SEND_EVENT, data: { campaignId: id, scheduledAt: at.toISOString() }, ts: at.getTime() })
    revalidatePath(`${CAMPAIGNS}/campaigns/${id}`)
    revalidatePath(CAMPAIGNS)
    return ok({ message: `Scheduled for ${at.toUTCString()}.` })
  } catch (err) {
    return failure(err, 'schedule the newsletter')
  }
}

export async function unscheduleAction(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const r = await db.newsletterCampaign.updateMany({
      where: { id, status: 'scheduled' },
      data: { status: 'draft', scheduledAt: null },
    })
    if (r.count === 0) return fail('PRECONDITION_FAILED', 'It is not scheduled any more.')
    revalidatePath(`${CAMPAIGNS}/campaigns/${id}`)
    revalidatePath(CAMPAIGNS)
    return ok({ message: 'Unscheduled — back to a draft.' })
  } catch (err) {
    return failure(err, 'unschedule the newsletter')
  }
}

/** Stop a send in progress at the next batch. What has gone, has gone. */
export async function cancelSendAction(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const r = await db.newsletterCampaign.updateMany({
      where: { id, status: 'sending' },
      data: { status: 'cancelled', cancelledAt: new Date() },
    })
    if (r.count === 0) return fail('PRECONDITION_FAILED', 'It is not sending any more.')
    revalidatePath(`${CAMPAIGNS}/campaigns/${id}`)
    revalidatePath(CAMPAIGNS)
    return ok({ message: 'Cancelling — it stops before the next batch.' })
  } catch (err) {
    return failure(err, 'cancel the send')
  }
}
