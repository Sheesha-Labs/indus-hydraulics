'use client'

import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { pauseAssistantAction, resumeAssistantAction } from '../../actions/assistant-pause'

/**
 * "Pause everything" and "Resume" for the Owner (S05-T08): the pill popover, the command bar and the paused
 * banner call these. A toast says what changed; the page refreshes so the banner and the pill follow.
 */
export function usePauseControls(): { pause: () => Promise<void>; resume: () => Promise<void> } {
  const router = useRouter()
  const { toast } = useToast()
  const pause = useCallback(async () => {
    const res = await pauseAssistantAction({})
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({ kind: 'success', title: 'Assistant paused. Nothing is read or sent until you resume.' })
    router.refresh()
  }, [router, toast])
  const resume = useCallback(async () => {
    const res = await resumeAssistantAction({})
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({ kind: 'success', title: 'Assistant resumed. Held sends are re-checked first.' })
    router.refresh()
  }, [router, toast])
  return { pause, resume }
}
