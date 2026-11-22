'use client'

import { ErrorState, OfflineState } from '@indus/ops-ui/states'

// Client islands for the States specimen: ErrorState and OfflineState take handlers (onRetry), which a
// server component cannot pass. The handlers do nothing here.

const noop = () => {}

/** 10:41 in Asia/Dubai, the kit's "last saved" time. */
const LAST_SYNCED = new Date('2026-09-30T06:41:00Z')

export function ErrorDemo({ bare = false }: { bare?: boolean }) {
  return (
    <ErrorState
      title="Couldn’t load enquiries"
      text="The server didn’t answer. Nothing was lost; your last changes were saved at 10:41."
      errorId="2611-0419"
      onRetry={noop}
      headingLevel={3}
      bare={bare}
    />
  )
}

export function OfflineDemo({ align = 'left' }: { align?: 'left' | 'center' }) {
  return <OfflineState lastSynced={LAST_SYNCED} onRetry={noop} headingLevel={3} align={align} />
}
