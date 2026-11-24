'use client'

import { AssistantStrip, type AssistantStripProps } from '@indus/ops-ui/shell'
import { useShell } from '../shell/Providers'

/**
 * The record's Assistant strip with its control (S06-T08, S03a): the ASSISTANT tag opens the docked panel on
 * this record; Escape in the panel returns focus here.
 */
export default function RecordAssistantStrip(
  props: Omit<AssistantStripProps, 'onOpenPanel' | 'panelOpen'>
) {
  const shell = useShell()
  return (
    <AssistantStrip
      {...props}
      panelOpen={shell.panels.assistant}
      onOpenPanel={() =>
        shell.panels.assistant ? shell.close('assistant') : shell.open('assistant')
      }
    />
  )
}
