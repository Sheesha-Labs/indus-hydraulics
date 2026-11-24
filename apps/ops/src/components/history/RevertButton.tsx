'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { revertChangeAction } from '../../actions/revert-change'

/**
 * "Revert to before Assistant change" on a History row (S06-T07, board 114 part 4). Not destructive: the
 * reversal is a new row and the Assistant's version stays, so it runs at once (no confirm).
 */
export default function RevertButton({ eventId, field }: { eventId: string; field: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  async function revert() {
    setBusy(true)
    try {
      const r = await revertChangeAction({ eventId })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: `Reverted ${field.toLowerCase()} · logged as ${r.data.ref}` })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button
      size="sm"
      variant="secondary"
      busy={busy}
      className="self-start"
      onClick={() => void revert()}
    >
      Revert to before Assistant change
    </Button>
  )
}
