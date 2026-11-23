'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  signOutDeviceAction,
  signOutEverywhereAction,
} from '../../../app/(console)/settings/team/actions/sessions'
import { useConfirm } from '../../shell/confirm'

/**
 * Board 84 "Devices and sessions" buttons. Sign out ends one other device at once (a toast says so);
 * Sign out everywhere confirms first, listing what happens, and keeps this device signed in.
 */
export function SignOutDeviceButton({ sessionId, label }: { sessionId: string; label: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, start] = useTransition()
  return (
    <Button
      size="sm"
      variant="secondary"
      busy={pending}
      onClick={() =>
        start(async () => {
          const result = await signOutDeviceAction({ sessionId })
          if (result.success) {
            toast({ kind: 'success', title: `Signed out ${label}.` })
            router.refresh()
          } else {
            toast({ kind: 'error', title: result.error })
          }
        })
      }
    >
      Sign out<span className="sr-only"> {label}</span>
    </Button>
  )
}

export function SignOutEverywhereButton({ others }: { others: number }) {
  const router = useRouter()
  const confirm = useConfirm()
  const { toast } = useToast()
  return (
    <Button
      size="sm"
      variant="danger"
      className="mt-1 self-start"
      disabled={others === 0}
      onClick={async () => {
        const done = await confirm({
          title: 'Sign out everywhere else?',
          consequences: [
            `${others === 1 ? 'Your other device is' : `Your ${others} other devices are`} signed out at once.`,
            'Coming back there needs Google, or your password and authenticator code.',
            'This device stays signed in.',
          ],
          confirmLabel: 'Sign out everywhere',
          busyLabel: 'Signing out…',
          onConfirm: () => signOutEverywhereAction({}),
        })
        if (done) {
          toast({ kind: 'success', title: 'Signed out everywhere else.' })
          router.refresh()
        }
      }}
    >
      Sign out everywhere
    </Button>
  )
}
