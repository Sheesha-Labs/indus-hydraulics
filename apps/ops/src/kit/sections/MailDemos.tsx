'use client'

import { Composer, type ComposerProps } from '@indus/ops-ui/mail'

// Client island for the Mail specimen: Composer takes its action handlers as functions, which a server
// component cannot pass. These stubs stand in for the S05 send and draft actions; nothing leaves the page.

type ComposerDemoProps = Omit<ComposerProps, 'onSend' | 'onSaveDraft' | 'onDiscard' | 'onAttach'>

export function ComposerDemo(props: ComposerDemoProps) {
  return (
    <Composer
      {...props}
      onSend={async () => ({
        success: true,
        data: { sendId: 'kit-send', undoRemainingMs: 5 * 60_000 },
      })}
      onSaveDraft={async () => ({ success: true, data: { draftId: 'kit-draft' } })}
      onDiscard={() => {}}
      onAttach={() => {}}
    />
  )
}
