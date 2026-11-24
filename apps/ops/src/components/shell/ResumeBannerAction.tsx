'use client'

import { BannerAction } from '@indus/ops-ui/status'
import { useState } from 'react'
import { usePauseControls } from './use-pause-controls'

/** "Resume" on the paused banner (board 102 state 2), for the Owner. */
export default function ResumeBannerAction() {
  const { resume } = usePauseControls()
  const [busy, setBusy] = useState(false)
  return (
    <BannerAction
      onClick={() => {
        if (busy) return
        setBusy(true)
        void resume().finally(() => setBusy(false))
      }}
    >
      {busy ? 'Resuming…' : 'Resume'}
    </BannerAction>
  )
}
