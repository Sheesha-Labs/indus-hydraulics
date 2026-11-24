import { sendGate } from '../../server/mail-send/gate'
import { reconcile } from '../../server/mail-send/reconcile'
import { sendOnce } from '../../server/mail-send/send-once'
import { computeSlot } from '../../server/mail-send/slot'
import { registerStalenessGate } from '../../server/assistant/staleness'
import { defineOpsFunction } from '../define'

// S06-T01: a queued send whose proposal went stale stops in the gate ('stale'). The definitions say how each
// action reads its current versions.
import '../../server/assistant/actions'
registerStalenessGate()
import { emitEvent } from '../emit'

/**
 * ops.mail.send (S04-T06, ADR-07, 08-map-integrations §1.9): one run per outbound row.
 *
 *   undo-window   sleep until undoUntil (the five minutes the server owns)
 *   next-slot     the send slot (hours, supplier morning, chaser rules, Ramadan, holidays, cap)
 *   send-window   sleep until the slot
 *   gate          re-check everything; wait → wait for the resume event (or the cap reset) and request a fresh
 *                 run; stop → done (the gate wrote the status)
 *   send          claim → send once → record
 *   reconcile     only after an ambiguous result: now, and again five minutes later. NEVER a resend.
 *
 * retries: 0 — a failed step fails the run, it is not repeated (a repeat could send twice). cancelOn saves a
 * wake-up after Undo; the database status is the authority either way. Concurrency 1 per mailbox: one send at a
 * time from each mailbox. Pause is enforced by the gate (held, then re-gated on ops/assistant.resumed, C22), so the
 * wrapper's own pause handling is off.
 */
export const mailSend = defineOpsFunction(
  {
    id: 'ops.mail.send',
    retries: 0,
    lane: 'live',
    perKey: { key: 'event.data.mailboxId', limit: 1 },
    cancelOn: [{ event: 'ops/mail.send.cancelled', match: 'data.outboundId' }],
    pause: 'exempt',
  },
  { event: 'ops/mail.send.requested' },
  async ({ event, step }) => {
    const outboundId = String(event.data.outboundId)
    const mailboxId = String(event.data.mailboxId)
    const undoUntil = String(event.data.undoUntil ?? new Date().toISOString())

    if (new Date(undoUntil).getTime() > Date.now()) await step.sleepUntil('undo-window', undoUntil)

    const slot = await step.run('next-slot', () => computeSlot(outboundId))
    if (new Date(slot.at).getTime() > Date.now()) await step.sleepUntil('send-window', slot.at)

    const gate = await step.run('gate', () => sendGate(outboundId))
    if (gate.kind === 'stop') return { outboundId, stopped: gate.reason }
    if (gate.kind === 'wait') {
      if (gate.until) {
        await step.sleepUntil('wait-until', gate.until)
      } else if (gate.resumeEvent) {
        await step.waitForEvent('wait-for-resume', {
          event: gate.resumeEvent,
          timeout: '7d',
          ...(gate.match ? { match: gate.match } : {}),
        })
      }
      // A fresh run re-computes the slot and re-runs the gate (the row is still pending; nothing was sent).
      await step.run('re-request', () =>
        emitEvent({
          name: 'ops/mail.send.requested',
          id: `send:${outboundId}:${gate.reason}:${Date.now()}`,
          data: { outboundId, mailboxId, undoUntil: new Date().toISOString() },
        })
      )
      return { outboundId, waited: gate.reason }
    }

    const result = await step.run('send', () => sendOnce(outboundId))
    if (result.kind !== 'ambiguous') return { outboundId, result: result.kind }

    const first = await step.run('reconcile-1', () => reconcile(outboundId))
    if (first.kind !== 'unknown') return { outboundId, result: 'sent', reconciled: true }
    await step.sleep('reconcile-gap', '5m')
    const second = await step.run('reconcile-2', () => reconcile(outboundId))
    return { outboundId, result: second.kind === 'sent' ? 'sent' : 'unknown', reconciled: true }
  }
)
