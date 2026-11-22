// States kit (S01-T06): `@indus/ops-ui/states`. EmptyState, InlineState and TableSkeleton render on the
// server; ErrorState (the body of every error.tsx) and OfflineState are client parts.
export { default as EmptyState, type EmptyStateProps } from './EmptyState'
export {
  EMPTY_COPY,
  EMPTY_LISTS,
  type EmptyAction,
  type EmptyCopy,
  type EmptyList,
} from './empty-copy'
// The Table kit owns TableSkeleton (the kit's Loading part); re-exported, not duplicated.
export { default as TableSkeleton, type TableSkeletonProps } from '../table/TableSkeleton'
export {
  default as ErrorState,
  ERROR_DEFAULT,
  errorDetails,
  type ErrorStateProps,
} from './ErrorState'
export { default as OfflineState, OFFLINE_DEFAULT, type OfflineStateProps } from './OfflineState'
export {
  default as InlineState,
  INLINE_DEFAULT_TEXT,
  type InlineKind,
  type InlineStateProps,
} from './InlineState'
export type { HeadingLevel } from './StateBox'
