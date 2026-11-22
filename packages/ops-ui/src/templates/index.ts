// Templates (L2, 05 §5): `@indus/ops-ui/templates`. Layout components made only of containers: typed
// ReactNode slots, grid tracks from the width tokens, the card / paper grounds and min-h-0 scroll regions.
// No colours beyond the two grounds and no type styles; screens fill the slots with kit parts.
// S02-T04: T1–T6. S02-T05 adds T7–T12 and X1 below.
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
