// Overlay kit (S01-T07): `@indus/ops-ui/overlay`. Radix Dialog, AlertDialog, Popover, DropdownMenu and
// Tooltip own focus trapping, Escape (top-most layer only) and focus return; toasts are our own live
// regions because they carry the server-owned undo countdown (ADR-11).
// Client parts: Modal, ConfirmDialog, Drawer, ToastProvider (+ useToast), Menu, Popover, Tooltip.
// Shared: DrawerSection, Consequences and the still frames (specimens, Help, empty-state pictures).
export { default as Modal, type ModalProps } from './Modal'
export { default as ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog'
export { default as Drawer, type DrawerProps, type DrawerTabs } from './Drawer'
export {
  default as ToastProvider,
  useToast,
  type ToastApi,
  type ToastProviderProps,
} from './ToastProvider'
export type { ToastInput } from './Toast'
export { default as Menu, type MenuEntry, type MenuProps } from './Menu'
export { default as Popover, type PopoverAction, type PopoverProps } from './Popover'
export { default as Tooltip, type TooltipProps } from './Tooltip'
export { Consequences, DrawerSection } from './surfaces'
export {
  DrawerFrame,
  MenuFrame,
  ModalFrame,
  PopoverFrame,
  ToastFrame,
  TooltipFrame,
  type DrawerFrameProps,
  type ModalFrameProps,
} from './Frames'
export type { ActionResult } from './result'
export type { DrawerWidth, MenuWidth, ModalWidth, PopoverWidth, ToastKind } from './styles'
