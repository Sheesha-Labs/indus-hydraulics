'use client'

import { Panel } from '@indus/ui'

import type { CampaignStatus } from '../../../lib/newsletter/campaign'

type Props = {
  id: string
  status: CampaignStatus
  canSend: boolean
  /** Nothing in the send gate and nothing unsaved. */
  ready: boolean
  audienceSize: number
}

/**
 * Where "Send now" and "Schedule" live. Phase 3 ships the composer without
 * them; Phase 4 replaces this panel with the real controls and the report.
 */
export default function CampaignSendPanel({ ready, audienceSize }: Props) {
  return (
    <Panel>
      <h2 className="mb-1 text-[15px] font-medium text-ih-ink">Send</h2>
      <p className="text-[13.5px] text-ih-ink-2">
        {ready
          ? `Ready for ${audienceSize.toLocaleString('en-US')} ${audienceSize === 1 ? 'person' : 'people'}. Sending is switched on in the next release.`
          : 'Fix what is listed above first.'}
      </p>
    </Panel>
  )
}
