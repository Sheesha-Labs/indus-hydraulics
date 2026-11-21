import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import {
  DrawerFrame,
  DrawerSection,
  MenuFrame,
  ModalFrame,
  PopoverFrame,
  ToastFrame,
  TooltipFrame,
  type MenuEntry,
  type ToastKind,
} from '@indus/ops-ui/overlay'
import type { ReactNode } from 'react'
import { OVERLAY, REFS } from '../fixtures'
import { DockedDrawerDemo, LiveOverlays } from './OverlayDemos'

/** Set to 'built' when S01-T07 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/overlay; inside the L1 mirror (section k10)
 * they are hidden so the card matches the sheet.
 */
function Row({
  name,
  code,
  note,
  full = false,
  children,
}: {
  name: string
  code: string
  note?: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k10]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

const MENU = OVERLAY.menu as readonly MenuEntry[]
const MENU_STATES = OVERLAY.menuStates as readonly MenuEntry[]

/**
 * Overlay kit specimen (L1 section k10): still frames of every part in the sheet's rows and sizes, with
 * neutral samples; then, on /_kit/overlay only, the live Radix parts behind their triggers, the docked
 * drawer, the other toast kinds and menu states.
 */
export default function OverlaySpecimen() {
  return (
    <>
      {/* ---- L1 k10 mirror ---- */}
      <Row name="Modal" code='part="Modal"' note="Consequences listed before a destructive action">
        <div className="flex w-[620px] flex-col gap-2.5">
          <div className="bg-io-scrim flex h-[380px] w-full items-center justify-center p-8">
            <ModalFrame
              tone="danger"
              title={OVERLAY.block.title}
              consequences={OVERLAY.block.consequences}
              actions={
                <>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="destructive">{OVERLAY.block.confirm}</Button>
                </>
              }
            >
              <p>{OVERLAY.block.text}</p>
            </ModalFrame>
          </div>
        </div>
      </Row>
      <Row name="Drawer" code='part="Drawer"' note="Why? drawer, record peek, settings detail">
        <div className="flex w-[560px] flex-col gap-2.5">
          <div className="bg-io-scrim flex h-[560px] w-full justify-end">
            <DrawerFrame
              eyebrow={OVERLAY.why.eyebrow}
              title={OVERLAY.why.title}
              tabs={OVERLAY.why.tabs}
              footer={
                <>
                  <Button variant="primary">Accept</Button>
                  <Button variant="secondary">Change supplier…</Button>
                </>
              }
            >
              {OVERLAY.why.sections.map((s) => (
                <DrawerSection key={s.heading} heading={s.heading}>
                  <p>{s.text}</p>
                </DrawerSection>
              ))}
            </DrawerFrame>
          </div>
        </div>
      </Row>
      <Row name="Toast · Menu · Popover" code='part="Toast|Menu|Popover|Tooltip"'>
        <div className="flex w-[520px] flex-col gap-2.5">
          {OVERLAY.toasts.map((t) => (
            <div key={t.title}>
              <ToastFrame kind={t.kind} title={t.title} action={t.action} />
            </div>
          ))}
        </div>
        <MenuFrame items={MENU} />
        <div className="flex w-[340px] flex-col gap-2.5">
          <PopoverFrame title={OVERLAY.popover.title} action={OVERLAY.popover.action}>
            {OVERLAY.popover.text.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </PopoverFrame>
          <div>
            <TooltipFrame content={OVERLAY.tooltip} />
          </div>
        </div>
      </Row>

      {/* ---- /_kit/overlay only ---- */}
      <Row
        full
        name="Live"
        code="Modal · ConfirmDialog · Drawer · Menu · Popover · Tooltip · useToast"
        note="Radix: focus trapped in modals, Escape closes the top-most layer, focus returns to the trigger. The confirm fails once, then succeeds. Toasts: F6 moves focus into them."
      >
        <div id="overlay-live" className="contents">
          <LiveOverlays />
        </div>
      </Row>
      <Row
        full
        name="Modal · widths"
        code="width={480|520|560}"
        note="Neutral tone, a note in the foot, no consequences."
      >
        {([480, 560] as const).map((w) => (
          <ModalFrame
            key={w}
            width={w}
            title={`${w} wide`}
            note={`Currently on ${REFS.enquiry}`}
            actions={<Button variant="primary">Link</Button>}
          >
            <p>The thread moves to the enquiry you pick; nothing is sent.</p>
          </ModalFrame>
        ))}
      </Row>
      <Row
        full
        name="Drawer · docked"
        code="modal={false} width={420}"
        note="No scrim and no trap; the shell's layout slot pushes the content aside (S02)."
      >
        <DockedDrawerDemo />
      </Row>
      <Row
        full
        name="Toast · kinds"
        code="kind=info|warning · undo"
        note="Undo counts down from the server's remaining milliseconds."
      >
        <div className="flex flex-col gap-2.5">
          {OVERLAY.moreToasts.map((t) => (
            <div key={t.title}>
              <ToastFrame
                kind={t.kind as ToastKind}
                title={t.title}
                {...('action' in t ? { action: t.action } : {})}
              />
            </div>
          ))}
        </div>
      </Row>
      <Row
        full
        name="Menu · states"
        code="disabled · href · danger"
        note="Disabled items are skipped."
      >
        <div id="overlay-menu">
          <MenuFrame items={MENU_STATES} width={280} />
        </div>
      </Row>
    </>
  )
}
