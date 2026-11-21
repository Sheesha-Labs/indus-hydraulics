// Table kit (S01-T05): `@indus/ops-ui/table`. DataTable and TableSkeleton render on the server;
// DataTableClient (selection, keyboard row movement) is the kit's only client part.
export { default as DataTable } from './DataTable'
export { default as DataTableClient } from './DataTableClient'
export { default as TableSkeleton, type TableSkeletonProps } from './TableSkeleton'
export type {
  ChipColumn,
  Column,
  ColumnType,
  DataTableClientProps,
  DataTableProps,
  RowKind,
  RowTone,
  SortDir,
} from './types'
