'use client'

import type { HelperFlag } from '../../../lib/access-core'
import { CAPABILITIES, FLAG_CAPABILITY, HELPER_FLAGS } from '../../../lib/access-core'
import { Button, Toggle } from '@indus/ops-ui/controls'
import { ConfirmDialog, Modal, useToast } from '@indus/ops-ui/overlay'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  beginTransfer,
  endAfterTransfer,
  removeHelperAction,
  resendInviteAction,
  revokeInviteAction,
  transferOwnershipAction,
  updatePermissionsAction,
} from '../../../app/(console)/settings/team/actions/team'
import { useConfirm } from '../../shell/confirm'
import InviteForm from './InviteForm'

/**
 * Board 84's Team card controls (S03-T03). The Owner sees them; a Helper sees the page read-only (the
 * page does not render these for them, and every action refuses them on the server anyway).
 */
type Flags = Record<HelperFlag, boolean>
type Person = { id: string; name: string; firstName: string }

/** "Invite a helper": the page's one primary, opening the invite form in a Modal. */
export function InviteHelperButton({
  domain,
  disabled,
}: {
  domain: string
  disabled?: string | undefined
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  if (disabled) {
    return (
      <span className="flex items-center gap-2">
        <span id="invite-disabled" className="text-io-ink-3 text-[12px]">
          {disabled}
        </span>
        <Button variant="primary" disabled aria-describedby="invite-disabled">
          Invite a helper
        </Button>
      </span>
    )
  }
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Invite a helper"
      trigger={<Button variant="primary">Invite a helper</Button>}
      actions={null}
    >
      <InviteForm
        domain={domain}
        onSent={(sent) => {
          setOpen(false)
          toast({
            kind: 'success',
            title:
              sent.mail === 'failed'
                ? `Invite created for ${sent.email}, but the email did not go. Use Resend.`
                : `Invite sent to ${sent.email}.`,
          })
        }}
        secondary={
          <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        }
      />
    </Modal>
  )
}

/**
 * Transfer ownership. The button asks the server first (beginTransfer): within 10 minutes of signing
 * in it comes back with `?transfer=1` and the dialog opens; otherwise it is the sign-in card first.
 */
export function TransferOwnership({
  helper,
  ownerFirstName,
  open: initiallyOpen,
}: {
  helper: Person | null
  ownerFirstName: string
  open: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(initiallyOpen && helper !== null)
  if (!helper) {
    return (
      <Button size="sm" disabled aria-describedby="transfer-needs-helper">
        Transfer ownership
        <span id="transfer-needs-helper" className="sr-only">
          : invite a helper first
        </span>
      </Button>
    )
  }
  return (
    <>
      <form action={beginTransfer}>
        <Button type="submit" size="sm">
          Transfer ownership
        </Button>
      </form>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) router.replace('/settings/team')
        }}
        title={`Make ${helper.name} the Owner?`}
        text="There is one Owner at a time."
        consequences={[
          `${helper.firstName} becomes the Owner: client quotations, approvals, payments and settings.`,
          `${ownerFirstName} becomes the Helper, with every permission off until the new Owner turns them on.`,
          'Both of you are signed out now and sign in again with the new roles.',
        ]}
        confirmLabel="Transfer ownership"
        busyLabel="Transferring…"
        onConfirm={async () => {
          const result = await transferOwnershipAction({ toUserId: helper.id })
          if (result.success) await endAfterTransfer()
          return result
        }}
      />
    </>
  )
}

/** Permissions: the Helper's three toggles, saved together. */
export function PermissionsButton({ helper, flags }: { helper: Person; flags: Flags }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Flags>(flags)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setDraft(flags)
          setError(null)
        }
      }}
      title={`Permissions · ${helper.name}`}
      trigger={
        <Button size="sm">
          Permissions<span className="sr-only"> for {helper.name}</span>
        </Button>
      }
      note="Changes apply on their next page."
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            busy={pending}
            onClick={() =>
              start(async () => {
                const result = await updatePermissionsAction({
                  userId: helper.id,
                  next: draft,
                  expected: flags,
                })
                if (result.success) {
                  setOpen(false)
                  toast({ kind: 'success', title: `Permissions saved for ${helper.firstName}.` })
                  router.refresh()
                } else {
                  setError(result.error)
                }
              })
            }
          >
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {HELPER_FLAGS.map((flag) => {
          const def = CAPABILITIES[FLAG_CAPABILITY[flag]]
          return (
            <Toggle
              key={flag}
              checked={draft[flag]}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, [flag]: v }))}
              label={def.label}
              sub={def.sub}
            />
          )
        })}
        {error ? (
          <Banner tone="bad" className="px-3 py-2.5 text-[12.5px]">
            {error}
          </Banner>
        ) : null}
      </div>
    </Modal>
  )
}

/** One toggle in "What each role can do", saved at once (Owner only). */
export function FlagToggle({
  helper,
  flag,
  flags,
}: {
  helper: Person
  flag: HelperFlag
  flags: Flags
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [checked, setChecked] = useState(flags[flag])
  const [pending, start] = useTransition()
  return (
    <Toggle
      checked={checked}
      disabled={pending}
      aria-label={`${CAPABILITIES[FLAG_CAPABILITY[flag]].label} · ${helper.firstName}`}
      onCheckedChange={(v) => {
        setChecked(v)
        start(async () => {
          const result = await updatePermissionsAction({
            userId: helper.id,
            next: { ...flags, [flag]: v },
            expected: flags,
          })
          if (result.success) {
            router.refresh()
          } else {
            setChecked(!v)
            toast({ kind: 'error', title: result.error })
          }
        })
      }}
    />
  )
}

/** Remove: confirm with the consequences, then the 84b banner if the guard refuses. */
export function RemoveButton({
  person,
  consequence,
}: {
  person: Person
  /** "Their open work moves to …" (reassignOpenWork's counts). */
  consequence: string
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { toast } = useToast()
  const [refusal, setRefusal] = useState<string | null>(null)
  return (
    <>
      <Button
        size="sm"
        variant="danger"
        onClick={async () => {
          let message: string | null = null
          const done = await confirm({
            title: `Remove ${person.name}?`,
            consequences: [
              consequence,
              `${person.firstName} is signed out everywhere at once and cannot sign in again.`,
              'You can invite them again later.',
            ],
            confirmLabel: 'Remove',
            busyLabel: 'Removing…',
            onConfirm: async () => {
              const result = await removeHelperAction({ userId: person.id })
              if (result.success && result.data.outcome === 'last_owner') {
                message = result.data.message
              }
              return result
            },
          })
          if (message) {
            setRefusal(message)
          } else if (done) {
            toast({ kind: 'success', title: `${person.name} no longer has access.` })
            router.refresh()
          }
        }}
      >
        Remove<span className="sr-only"> {person.name}</span>
      </Button>
      {refusal ? (
        <Banner tone="warn" announce className="col-span-full px-3 py-2.5 text-[12.5px]">
          {refusal}
        </Banner>
      ) : null}
    </>
  )
}

export function ResendInviteButton({ inviteId, email }: { inviteId: string; email: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, start] = useTransition()
  return (
    <Button
      size="sm"
      busy={pending}
      onClick={() =>
        start(async () => {
          const result = await resendInviteAction({ inviteId })
          if (result.success) {
            toast({
              kind: 'success',
              title: `New invite sent to ${email}. The old link no longer works.`,
            })
            router.refresh()
          } else {
            toast({ kind: 'error', title: result.error })
          }
        })
      }
    >
      Resend<span className="sr-only"> the invite to {email}</span>
    </Button>
  )
}

export function RevokeInviteButton({ inviteId, email }: { inviteId: string; email: string }) {
  const router = useRouter()
  const confirm = useConfirm()
  const { toast } = useToast()
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        const done = await confirm({
          title: `Revoke the invite to ${email}?`,
          consequences: ['The link stops working at once.', 'You can send a new invite later.'],
          confirmLabel: 'Revoke',
          busyLabel: 'Revoking…',
          onConfirm: () => revokeInviteAction({ inviteId }),
        })
        if (done) {
          toast({ kind: 'success', title: `Invite to ${email} revoked.` })
          router.refresh()
        }
      }}
    >
      Revoke<span className="sr-only"> the invite to {email}</span>
    </Button>
  )
}
