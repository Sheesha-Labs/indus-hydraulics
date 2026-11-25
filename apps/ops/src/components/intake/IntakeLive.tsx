'use client'

import { useRouter } from 'next/navigation'
import { useLiveKeys } from '../../lib/live-keys'

/** Refreshes the page when a batch's live key moves (a file changed state, lines were staged). Renders nothing. */
export default function IntakeLive({ batchIds }: { batchIds: readonly string[] }) {
  const router = useRouter()
  useLiveKeys(
    batchIds.map((id) => `record:intake.${id}` as const),
    { onChange: () => router.refresh() }
  )
  return null
}
