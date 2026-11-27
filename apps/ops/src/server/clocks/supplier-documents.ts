import 'server-only'
import { opsDb } from '@indus/ops-db'
import { requestAction } from '../assistant/request'
import { raiseNotification } from '../notify/raise'
import { getSetting } from '../settings/get'
import { registerClock } from './registry'
// The tick runs in its own process: the actions it requests must be registered there.
import '../assistant/actions/remind-supplier-documents'

/**
 * The supplier document request clocks (S10-T04, board 50), run by ops.clocks.tick every 15 minutes:
 *
 *   supplier_docs.reminder  an open request whose next reminder is due → #16 remind_supplier_documents (proposed in
 *                           Review, from purchase@ in the request thread), then the next one 4 days later
 *   supplier_docs.expiry    an open request past its expiry → status expired, and a notification "Upload link expired
 *                           for <supplier>" with "Send a new link" on the supplier's Documents
 */
registerClock<{ id: string; supplierId: string; remindersSent: number }>({
  key: 'supplier_docs.reminder',
  due: (now, limit) =>
    opsDb.supplierDocumentRequest.findMany({
      where: {
        status: 'open',
        remindersOn: true,
        nextReminderAt: { lte: now },
        expiresAt: { gt: now },
      },
      orderBy: { nextReminderAt: 'asc' },
      take: limit,
      select: { id: true, supplierId: true, remindersSent: true },
    }),
  async fire(r, now) {
    const { reminderEveryDays } = await getSetting('supplier_docs.request')
    // Move the clock first: a failed request is not retried every 15 minutes.
    const moved = await opsDb.supplierDocumentRequest.updateMany({
      where: { id: r.id, status: 'open', nextReminderAt: { lte: now } },
      data: { nextReminderAt: new Date(now.getTime() + reminderEveryDays * 86_400_000) },
    })
    if (!moved.count) return 'moved'
    await requestAction({
      actionKey: 'remind_supplier_documents',
      subjectType: 'company',
      subjectId: r.supplierId,
      trigger: 'clock',
      origin: 'live',
      sourceVersion: `request:${r.id}:${r.remindersSent + 1}`,
    })
    return 'reminder requested'
  },
  async nextExpected(now) {
    const r = await opsDb.supplierDocumentRequest.findFirst({
      where: { status: 'open', remindersOn: true, nextReminderAt: { gt: now } },
      orderBy: { nextReminderAt: 'asc' },
      select: { id: true, nextReminderAt: true },
    })
    return r?.nextReminderAt
      ? { key: `docs:${r.id}`, at: r.nextReminderAt, text: 'Supplier document reminder' }
      : null
  },
})

registerClock<{ id: string; supplierId: string }>({
  key: 'supplier_docs.expiry',
  due: (now, limit) =>
    opsDb.supplierDocumentRequest.findMany({
      where: { status: 'open', expiresAt: { lte: now } },
      orderBy: { expiresAt: 'asc' },
      take: limit,
      select: { id: true, supplierId: true },
    }),
  async fire(r) {
    const moved = await opsDb.supplierDocumentRequest.updateMany({
      where: { id: r.id, status: 'open' },
      data: { status: 'expired', nextReminderAt: null },
    })
    if (!moved.count) return 'already closed'
    const c = await opsDb.company.findUnique({
      where: { id: r.supplierId },
      select: { name: true },
    })
    await raiseNotification({
      event: 'other',
      severity: 'warning',
      title: `Upload link expired for ${c?.name ?? 'a supplier'}`,
      body: 'Send a new link from the supplier’s Documents.',
      dedupeKey: `supplier-docs-expired:${r.id}`,
      subjectType: 'company',
      subjectId: r.supplierId,
      audience: 'all',
    })
    return 'expired'
  },
})
