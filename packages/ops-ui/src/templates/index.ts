// Templates (L2, 05 §5): `@indus/ops-ui/templates`. Layout components made only of containers: typed
// ReactNode slots, grid tracks from the width tokens, the card / paper grounds and min-h-0 scroll regions.
// No colours beyond the two grounds and no type styles (except the string titles of T9 and T12, set in
// the display face, and the eyebrow of T9 rail and T12); screens fill the slots with kit parts.
// S02-T04: T1–T6; S02-T05: T7–T12 and X1. T9 (centred), T11 and T12 render outside AppShell.
export { default as T1Index, type T1IndexProps } from './T1Index'
export { default as T2Record, type T2RecordProps } from './T2Record'
export { default as T3Mail, type T3MailProps } from './T3Mail'
export {
  default as T4Review,
  type T4BatchBar,
  type T4BatchKind,
  type T4BundleProps,
  type T4QueueProps,
  type T4ReviewProps,
  type T4SingleApproverProps,
} from './T4Review'
export { default as T5Document, type T5DocumentProps } from './T5Document'
export { default as T6Compare, type T6CompareProps } from './T6Compare'
export { default as T7Settings, type T7SettingsProps } from './T7Settings'
export { default as T8Today, type T8TodayProps } from './T8Today'
export { default as T9Wizard, type T9WizardProps } from './T9Wizard'
export { default as T10Gantt, type T10GanttProps } from './T10Gantt'
export { default as T11Auth, type T11AuthProps } from './T11Auth'
export { default as T12Client, type T12ClientProps } from './T12Client'
export { default as X1Exception, type X1ExceptionProps } from './X1Exception'
