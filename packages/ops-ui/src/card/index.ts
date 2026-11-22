// Card kit (S01-T05): `@indus/ops-ui/card`. Every part renders on the server. The kit's KV and KPI parts are
// exported as KeyValue and Kpi: JSX names must be PascalCase (lint react/jsx-pascal-case).
export { default as Card, type CardProps } from './Card'
export { default as List, MARK_TEXT, type ListProps } from './List'
export { default as KeyValue, type KVProps } from './KV'
export { default as Stat, type StatProps, type StatRow } from './Stat'
export { default as Kpi, type KPIProps } from './KPI'
export { default as NeedsRow, type NeedsRowProps } from './NeedsRow'
export { default as Person, type PersonProps } from './Person'
export { default as Contact, type ContactProps, type ContactRow } from './Contact'
export { default as Note, type NoteProps } from './Note'
export type { KVLabelWidth, KVPair, ListItem, Mark } from './types'
