'use client'

import { Button } from '@indus/ops-ui/controls'
import { Menu, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { itsRealAction } from '../../app/(console)/mail/actions/its-real'

/**
 * "It's real" on a phishing card (board 96): the person says what the email really is. The flag is cleared,
 * the choice is logged as theirs and teaches a preference.
 */
export default function ItsRealMenu({
  messageId,
  classes,
}: {
  messageId: string
  classes: Array<{ value: string; label: string }>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [refreshing, start] = useTransition()

  async function choose(cls: string) {
    setBusy(true)
    try {
      const res = await itsRealAction({ messageId, cls: cls as never })
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      toast({ kind: 'success', title: res.data.learned ?? 'Marked real' })
      start(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Menu
      trigger={
        <Button variant="secondary" busy={busy || refreshing}>
          It’s real
        </Button>
      }
      items={classes.map((c) => ({
        type: 'item' as const,
        label: c.label,
        onSelect: () => void choose(c.value),
      }))}
    />
  )
}
