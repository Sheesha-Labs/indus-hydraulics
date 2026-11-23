'use client'

import { Toggle } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setMailboxPermissionsAction } from '../../app/(console)/settings/mailboxes/actions/mailbox'

/**
 * Board 85 "What the Assistant may do here". Read, drafts, send and labels save as soon as they change (Owner
 * only); a capability Google did not grant is locked off with the reason. Archive is drawn, Off and locked:
 * there is no action that can turn it on. Drafts stay in Operations (no Gmail Drafts mirror in v1, G12).
 */
type Perms = { read: boolean; drafts: boolean; send: boolean; labels: boolean }

export default function PermissionToggles({
  mailboxId,
  value,
  allowed,
  sendSub,
  archiveSub,
  canManage,
}: {
  mailboxId: string
  value: Perms
  allowed: Perms
  sendSub: string
  archiveSub: string
  canManage: boolean
}) {
  const [perms, setPerms] = useState(value)
  const [pending, start] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function change(key: keyof Perms, on: boolean) {
    const before = perms
    const next = { ...perms, [key]: on }
    if (key === 'read' && !on) Object.assign(next, { drafts: false, send: false, labels: false })
    setPerms(next)
    start(async () => {
      const res = await setMailboxPermissionsAction({ mailboxId, ...next })
      if (!res.success) {
        setPerms(before)
        toast({ kind: 'error', title: res.error })
        return
      }
      router.refresh()
    })
  }

  const notGranted = 'Google did not grant this. Reconnect the mailbox to allow it.'
  const rows: Array<{ key: keyof Perms; label: string; sub: string }> = [
    { key: 'read', label: 'Read mail and attachments', sub: 'Needed for everything else' },
    { key: 'drafts', label: 'Create drafts', sub: 'Drafts stay in Operations' },
    { key: 'send', label: 'Send', sub: sendSub },
    { key: 'labels', label: 'Add labels', sub: 'The Indus/ labels on the right' },
  ]

  return (
    <div className="flex flex-col" aria-busy={pending || undefined}>
      <span className="io-eyebrow mb-1.5">What the Assistant may do here</span>
      {rows.map((r) => {
        const lockedReason = !allowed[r.key]
          ? r.key === 'send' && allowed.read
            ? 'This role never sends, or Google did not grant sending.'
            : notGranted
          : !canManage
            ? 'Only the Owner changes this.'
            : null
        return (
          <div key={r.key} className="border-io-line border-b py-2.5">
            <Toggle
              checked={perms[r.key] && allowed[r.key]}
              onCheckedChange={(on) => change(r.key, on)}
              label={r.label}
              sub={r.sub}
              disabled={pending || !!lockedReason}
              className="flex w-full flex-row-reverse justify-between"
            />
          </div>
        )
      })}
      <div className="py-2.5">
        <Toggle
          checked={false}
          label="Archive"
          sub={archiveSub}
          disabled
          aria-label="Archive (always off)"
          className="flex w-full flex-row-reverse justify-between"
        />
      </div>
    </div>
  )
}
