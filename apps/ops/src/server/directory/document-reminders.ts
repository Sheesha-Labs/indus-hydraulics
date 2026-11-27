import 'server-only'
import {
  documentLabel,
  dueReminders,
  isWorkingDay,
  localDateKey,
  newlyExpired,
  type WeekendTable,
} from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { requestAction } from '../assistant/request'
import { holidaysFor } from '../mail-send/slot'
import { raiseNotification } from '../notify/raise'
import { getSetting } from '../settings/get'
import { createDocumentRequest } from './document-request'
import { suspendLapsedPage } from './line-card'

/**
 * ops.reminders.documents (S10-T06/T08, C18, architecture §4.8): once a day at 08:00 Dubai, one function, steps:
 *
 *   mark-expired        documents past expiry become 'expired' once
 *   suspend-lapsed      line cards whose covering documents all expired are suspended; a valid replacement
 *                       reinstates them (T06)
 *   supplier-reminders  documents at 60, 30 or 7 days: per supplier, one #16 reminder (proposed in Review) with a
 *                       fresh /u link for the due kinds; each threshold counts as sent only when the email leaves
 *   indus-reminders     Indus's own documents: a notification per threshold, never an email
 *   rescreen-due        suppliers whose re-screen date has come: a notification for the Helper
 *
 * Nothing goes on a day that is not a working day in the UAE: reminders fall on the next working day.
 */
export const PAGE = 500

/** Today as a UTC midnight date of the Dubai calendar day. */
export function dubaiToday(now = new Date()): Date {
  return new Date(`${localDateKey(now, 'Asia/Dubai')}T00:00:00.000Z`)
}

export async function workingToday(today: Date): Promise<boolean> {
  const [weekends, holidays] = await Promise.all([
    getSetting('calendar.country_weekends') as Promise<WeekendTable>,
    holidaysFor(['AE'], today, 2),
  ])
  return isWorkingDay(
    { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1, day: today.getUTCDate() },
    'AE',
    holidays,
    weekends
  )
}

export async function markExpired(today: Date): Promise<number> {
  const docs = await opsDb.complianceDocument.findMany({
    where: { expiresAt: { lt: today }, status: { not: 'expired' }, archivedAt: null },
    take: PAGE,
    select: {
      id: true,
      companyId: true,
      kind: true,
      expiresAt: true,
      archivedAt: true,
      remindersSentDays: true,
      createdAt: true,
      status: true,
    },
  })
  const ids = newlyExpired(docs, today)
  if (ids.length)
    await opsDb.complianceDocument.updateMany({
      where: { id: { in: ids } },
      data: { status: 'expired' },
    })
  return ids.length
}

export async function suspendLapsed(
  today: Date
): Promise<{ suspended: number; reinstated: number }> {
  let cursor = ''
  let suspended = 0
  let reinstated = 0
  for (let i = 0; i < 20; i++) {
    const page = await suspendLapsedPage(cursor, today, PAGE)
    suspended += page.suspended
    reinstated += page.reinstated
    if (!page.nextCursor) break
    cursor = page.nextCursor
  }
  return { suspended, reinstated }
}

const OPEN_ACTION = [
  'proposed',
  'later',
  'running',
  'queued',
  'approved',
  'edited_approved',
] as const

/** One reminder per supplier with due documents; skipped while an earlier one is still waiting in Review. */
export async function supplierReminders(
  today: Date,
  working = true
): Promise<{ requested: number; suppliers: string[] }> {
  if (!working) return { requested: 0, suppliers: [] }
  const { thresholds } = await getSetting('documents.reminders')
  const horizon = new Date(today.getTime() + Math.max(...thresholds) * 86_400_000)
  const docs = await opsDb.complianceDocument.findMany({
    where: {
      companyId: { not: null },
      archivedAt: null,
      expiresAt: { gte: today, lte: horizon },
      company: { isSupplier: true, archivedAt: null },
    },
    take: PAGE,
    select: {
      id: true,
      companyId: true,
      kind: true,
      expiresAt: true,
      archivedAt: true,
      remindersSentDays: true,
      createdAt: true,
    },
  })
  const due = dueReminders(docs, today, { thresholds, isWorkingDay: () => true })
  const bySupplier = new Map<string, string[]>()
  for (const d of due)
    bySupplier.set(d.companyId!, [
      ...(bySupplier.get(d.companyId!) ?? []),
      docs.find((x) => x.id === d.documentId)!.kind,
    ])
  const dateKey = today.toISOString().slice(0, 10)
  const suppliers: string[] = []
  for (const [supplierId, kinds] of bySupplier) {
    const waiting = await opsDb.assistantAction.count({
      where: {
        actionKey: 'remind_supplier_documents',
        subjectId: supplierId,
        state: { in: [...OPEN_ACTION] },
      },
    })
    if (waiting) continue
    const open = await opsDb.supplierDocumentRequest.findFirst({
      where: { supplierId, status: 'open', expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, requestedKinds: true },
    })
    const requestId =
      open && kinds.every((k) => open.requestedKinds.includes(k))
        ? open.id
        : (
            await createDocumentRequest(
              { supplierId, kinds, remindersOn: false, draftEmail: false },
              null
            )
          ).requestId
    await requestAction({
      actionKey: 'remind_supplier_documents',
      subjectType: 'company',
      subjectId: supplierId,
      trigger: 'cron',
      origin: 'live',
      sourceVersion: `expiry:${requestId}:${dateKey}`,
    })
    suppliers.push(supplierId)
  }
  return { requested: suppliers.length, suppliers }
}

/** Indus's own documents: a notification per threshold (dedupe company-doc:<id>:<threshold>), never an email. */
export async function indusReminders(today: Date, working = true): Promise<number> {
  if (!working) return 0
  const { thresholds } = await getSetting('documents.reminders')
  const docs = await opsDb.complianceDocument.findMany({
    where: { companyId: null, archivedAt: null, expiresAt: { gte: today } },
    take: PAGE,
    select: {
      id: true,
      companyId: true,
      kind: true,
      title: true,
      issuer: true,
      expiresAt: true,
      archivedAt: true,
      remindersSentDays: true,
      createdAt: true,
    },
  })
  const due = dueReminders(docs, today, { thresholds, isWorkingDay: () => true })
  for (const d of due) {
    const doc = docs.find((x) => x.id === d.documentId)!
    await raiseNotification({
      event: 'document_expiring',
      severity: d.threshold <= 7 ? 'warning' : 'info',
      title: `${doc.title || documentLabel(doc.kind)} expires in ${d.daysLeft} days${doc.issuer ? ` · ${doc.issuer}` : ''}`,
      body: 'Renew it before it lapses; Settings › Company documents holds the file.',
      dedupeKey: `company-doc:${doc.id}:${d.threshold}`,
      audience: 'all',
    })
    const after = [
      ...new Set([...doc.remindersSentDays, ...thresholds.filter((t) => t >= d.threshold)]),
    ].sort((a, b) => b - a)
    await opsDb.complianceDocument.update({
      where: { id: doc.id },
      data: { remindersSentDays: after, lastReminderAt: new Date() },
    })
  }
  return due.length
}

/** Suppliers whose re-screen date has come: one notification each per day. */
export async function rescreenDue(today: Date): Promise<number> {
  const rows = await opsDb.supplierProfile.findMany({
    where: {
      rescreenDueAt: { lte: today },
      tier: { not: 'blocked' },
      company: { archivedAt: null },
    },
    take: PAGE,
    select: { companyId: true, company: { select: { name: true } } },
  })
  for (const r of rows)
    await raiseNotification({
      event: 'other',
      severity: 'info',
      title: `Re-screen ${r.company.name}`,
      body: 'The screening is 90 days old: run the checklist again before the next PO.',
      dedupeKey: `rescreen:${r.companyId}:${today.toISOString().slice(0, 10)}`,
      subjectType: 'company',
      subjectId: r.companyId,
      audience: 'all',
    })
  return rows.length
}
