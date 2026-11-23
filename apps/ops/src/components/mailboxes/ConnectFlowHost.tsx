'use client'

import { Button } from '@indus/ops-ui/controls'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import ConnectMailboxModal, {
  type ConnectMailboxModalProps,
  type ConnectRole,
} from './ConnectMailboxModal'

/**
 * Opens the board 86 flow: from a button (fresh, or a Reconnect / Grant send permission for one mailbox), or by
 * itself when Google's callback lands back on the page with `?step=4&outcome=…`. Closing clears the query so a
 * reload does not reopen it.
 */
export type ConnectFlowHostProps = Omit<ConnectMailboxModalProps, 'open' | 'onOpenChange'> & {
  /** Button label; omit to render no trigger (the callback case only). */
  trigger?: ReactNode
  triggerVariant?: 'primary' | 'secondary' | 'link'
  /** Open at step 1 with this role and address (Reconnect, Grant send permission, a setup card). */
  preset?: { role: ConnectRole; address: string; step?: 1 | 2 }
  /** Opened by the callback redirect. */
  openOnLoad?: boolean
  basePath: '/settings/mailboxes' | '/setup/mailboxes'
}

export default function ConnectFlowHost({
  trigger,
  triggerVariant = 'secondary',
  preset,
  openOnLoad = false,
  basePath,
  ...modal
}: ConnectFlowHostProps) {
  const router = useRouter()
  const [open, setOpen] = useState(openOnLoad)
  const [key, setKey] = useState(0)
  const initial =
    open && !openOnLoad && preset
      ? { step: preset.step ?? 1, role: preset.role, address: preset.address }
      : modal.initial
  return (
    <>
      {trigger ? (
        <Button
          variant={triggerVariant}
          onClick={() => {
            setKey((k) => k + 1)
            setOpen(true)
          }}
        >
          {trigger}
        </Button>
      ) : null}
      {open ? (
        <ConnectMailboxModal
          key={key}
          {...modal}
          {...(initial ? { initial } : {})}
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next && openOnLoad) router.replace(basePath)
          }}
        />
      ) : null}
    </>
  )
}
