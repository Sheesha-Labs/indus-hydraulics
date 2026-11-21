'use client'

import { Button } from '@indus/ops-ui/controls'
import {
  ConfirmDialog,
  Drawer,
  DrawerSection,
  Menu,
  Modal,
  Popover,
  ToastProvider,
  Tooltip,
  useToast,
  type ActionResult,
  type MenuEntry,
} from '@indus/ops-ui/overlay'
import { Info, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { OVERLAY, REFS } from '../fixtures'

// Client islands for the Overlay specimen: the live Radix parts behind real triggers. Closed at rest, so
// the visual baseline shows only the triggers; the e2e and axe specs open them.

const UNDO_WINDOW_MS = 5 * 60 * 1000
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function LiveOverlays() {
  return (
    <ToastProvider>
      <div className="flex flex-wrap items-center gap-3">
        <ModalDemo />
        <ConfirmDemo />
        <DrawerDemo />
        <Menu
          trigger={
            <Button variant="secondary" icon={MoreHorizontal}>
              Row menu
            </Button>
          }
          items={OVERLAY.menu as readonly MenuEntry[]}
        />
        <Popover
          trigger={<Button variant="secondary">Landed cost</Button>}
          title={OVERLAY.popover.title}
          action={{ label: OVERLAY.popover.action, href: '#overlay-live' }}
        >
          {OVERLAY.popover.text.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </Popover>
        <Tooltip content="Explains the landed-cost figure">
          <Button variant="ghost" icon={Info} aria-label="About landed cost" />
        </Tooltip>
        <ToastButtons />
      </div>
    </ToastProvider>
  )
}

function ModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="secondary">Open modal</Button>}
      title="Link to an enquiry"
      note={`Currently on ${REFS.enquiry}`}
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Link
          </Button>
        </>
      }
    >
      <p>The thread and its attachments move to the enquiry you pick; nothing is sent.</p>
    </Modal>
  )
}

function ConfirmDemo() {
  const [open, setOpen] = useState(false)
  const [tries, setTries] = useState(0)
  // The first attempt fails so the inline error can be seen; the second succeeds.
  const onConfirm = async (): Promise<ActionResult> => {
    await wait(600)
    setTries((n) => n + 1)
    return tries === 0
      ? { success: false, error: 'The supplier changed while you were looking. Try again.' }
      : { success: true, data: null }
  }
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="danger">Block supplier…</Button>}
      title={OVERLAY.block.title}
      text={<p>{OVERLAY.block.text}</p>}
      consequences={OVERLAY.block.consequences}
      confirmLabel={OVERLAY.block.confirm}
      busyLabel="Blocking…"
      onConfirm={onConfirm}
    />
  )
}

function DrawerDemo() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('reasons')
  const [inner, setInner] = useState(false)
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="secondary">Why?</Button>}
      eyebrow={OVERLAY.why.eyebrow}
      title={OVERLAY.why.title}
      tabs={{
        items: [
          { key: 'reasons', label: 'Reasons' },
          { key: 'sources', label: 'Sources', count: 3 },
          { key: 'history', label: 'History' },
        ],
        value: tab,
        onValueChange: setTab,
      }}
      footer={
        <>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Accept
          </Button>
          <Modal
            open={inner}
            onOpenChange={setInner}
            trigger={<Button variant="secondary">Change supplier…</Button>}
            title="Change supplier for line 5"
            actions={
              <Button variant="ghost" onClick={() => setInner(false)}>
                Cancel
              </Button>
            }
          >
            <p>
              Pick another quote for this line. Escape closes this modal and leaves the drawer open.
            </p>
          </Modal>
        </>
      }
    >
      {tab === 'reasons' ? (
        OVERLAY.why.sections.map((s) => (
          <DrawerSection key={s.heading} heading={s.heading}>
            <p>{s.text}</p>
          </DrawerSection>
        ))
      ) : (
        <p>Nothing here yet in the specimen.</p>
      )}
    </Drawer>
  )
}

function ToastButtons() {
  const { toast } = useToast()
  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            kind: 'success',
            title: `Quotation ${REFS.quotationRevised} sent`,
            undo: {
              remainingMs: UNDO_WINDOW_MS,
              onUndo: async () => {
                await wait(400)
                return { success: true, data: null }
              },
            },
          })
        }
      >
        Toast with undo
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            kind: 'error',
            title: 'Couldn’t reach Zoho Books',
            action: { label: 'Retry', onAction: () => undefined },
          })
        }
      >
        Error toast
      </Button>
    </>
  )
}

/** The docked (modal={false}) drawer, rendered where it is placed, as the shell's panel slot will. */
export function DockedDrawerDemo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex h-[360px] items-stretch gap-3">
      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false}
        width={420}
        eyebrow="Panel"
        title="Assistant"
        footer={<Button variant="secondary">Open Assistant log</Button>}
      >
        <DrawerSection heading="Docked">
          <p>No scrim and no focus trap: the page stays usable beside it.</p>
        </DrawerSection>
      </Drawer>
      {open ? null : (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Show the docked panel
        </Button>
      )}
    </div>
  )
}
