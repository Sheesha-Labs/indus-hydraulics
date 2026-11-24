'use client'

import { Button } from '@indus/ops-ui/controls'
import { Menu, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  changeTypeAction,
  markNotBusinessAction,
  unlinkAction,
} from '../../app/(console)/mail/actions/mail'

/**
 * Board 91 "Not right?": the person corrects the Assistant. Change type (a menu of the classes), Link to… (the
 * S05-T06 modal, opened by search param), Unlink (each linked record) and Not business. Every correction is
 * logged as "Overridden by <initials>", teaches a preference and relabels the message in Gmail.
 */
export interface CorrectionsProps {
  messageId: string
  current: string
  classes: Array<{ value: string; label: string }>
  records: Array<{ subjectType: string; subjectId: string; label: string }>
  linkHref: string
}

const LINKABLE = new Set([
  'enquiry',
  'supplier_rfq',
  'quotation',
  'order',
  'supplier_po',
  'company',
])

export default function MailCorrections({
  messageId,
  current,
  classes,
  records,
  linkHref,
}: CorrectionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [refreshing, start] = useTransition()
  const pending = busy || refreshing

  // The toast is raised before the refresh, outside its transition: inside it, React would hold the toast
  // until the whole page had re-rendered.
  async function run(label: string, fn: () => Promise<{ success: boolean; error?: string }>) {
    setBusy(true)
    try {
      const res = await fn()
      if (!res.success) {
        toast({ kind: 'error', title: res.error ?? 'That did not work' })
        return
      }
      toast({ kind: 'success', title: label })
      start(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  const unlinkable = records.filter((r) => LINKABLE.has(r.subjectType))
  return (
    <div className="flex flex-wrap gap-2" aria-busy={pending}>
      <Menu
        trigger={<Button variant="secondary">Change type</Button>}
        items={classes
          .filter((c) => c.value !== current)
          .map((c) => ({
            type: 'item' as const,
            label: c.label,
            onSelect: () =>
              void run(`✓ Filed as ${c.label}`, () =>
                changeTypeAction({ messageId, cls: c.value as never })
              ),
          }))}
      />
      <Button variant="secondary" onClick={() => router.push(linkHref as never, { scroll: false })}>
        Link to…
      </Button>
      {unlinkable.length === 1 ? (
        <Button
          variant="secondary"
          busy={pending}
          onClick={() =>
            void run(`Unlinked from ${unlinkable[0]!.label}`, () =>
              unlinkAction({
                messageId,
                subjectType: unlinkable[0]!.subjectType as never,
                subjectId: unlinkable[0]!.subjectId,
              })
            )
          }
        >
          Unlink
        </Button>
      ) : unlinkable.length > 1 ? (
        <Menu
          trigger={<Button variant="secondary">Unlink</Button>}
          items={unlinkable.map((r) => ({
            type: 'item' as const,
            label: r.label,
            onSelect: () =>
              void run(`Unlinked from ${r.label}`, () =>
                unlinkAction({
                  messageId,
                  subjectType: r.subjectType as never,
                  subjectId: r.subjectId,
                })
              ),
          }))}
        />
      ) : null}
      {current !== 'not_business' ? (
        <Button
          variant="secondary"
          busy={pending}
          onClick={() =>
            void run('✓ Marked not business', () => markNotBusinessAction({ messageId }))
          }
        >
          Not business
        </Button>
      ) : null}
    </div>
  )
}
