import 'server-only'
import {
  resolveHeaderState,
  type HeaderMeta,
  type RecordHeaderInput,
  type RecordHeaderState,
  type RecordKind,
} from '@indus/ops-core'
import { cache } from 'react'
import { env, type OpsEnv } from '../lib/env'

export type { RecordHeaderState, RecordKind }

/**
 * The record cockpit's header read (05 §6.2): the enquiries/[ref] and orders/[ref] layouts call it, and a
 * tab page calling it again in the same request costs nothing (React cache()).
 *
 * S02 stub: no query yet. Outside production it returns a neutral fixture for ENQ-2026-0001 (enquiry or
 * tender) and SO-0001 (order) so the shell and the route skeleton have a record to render; in production it
 * returns null, which the layouts turn into notFound(). S09 replaces the body with one query (header, rail
 * and strip seed) mapped through resolveHeaderState.
 */
export const getRecordHeaderState = cache(
  async (kind: RecordKind, ref: string): Promise<RecordHeaderState | null> =>
    recordHeaderFixture(kind, ref, env().APP_ENV)
)

const CLIENT = {
  name: 'Sample Client LLC',
  href: '/clients/00000000-0000-7000-8000-000000000001',
}

const ENQUIRY_META: readonly [HeaderMeta, HeaderMeta, HeaderMeta, HeaderMeta] = [
  { label: 'Client', value: CLIENT.name },
  { label: 'Client ref', value: 'SCL/MM/26-0001' },
  { label: 'Received', value: '14 Sep' },
  { label: 'Client deadline', value: '30 Sep · 8 days left', tone: 'bad' },
]

const ENQUIRY: RecordHeaderInput = {
  kind: 'enquiry',
  ref: 'ENQ-2026-0001',
  clientName: CLIENT.name,
  clientHref: CLIENT.href,
  title: 'Plant turnaround spares — valves, bearings & instruments',
  meta: ENQUIRY_META,
  stage: 'quotes_in',
  cta: { label: 'Compare quotes', href: '/enquiries/ENQ-2026-0001/compare' },
  did: 'sent 4 RFQs, chased Example Valve Co today, 2 quotes captured',
  needCount: 1,
  threadHref: '/mail/clients?record=ENQ-2026-0001',
}

const TENDER: RecordHeaderInput = {
  ...ENQUIRY,
  kind: 'tender',
  title: 'Plant spares tender · SCL/T/2026/001',
  chip: { label: 'Closes in 5 d 22 h', tone: 'warn' },
  cta: { label: 'Open the bid pack', href: '/enquiries/ENQ-2026-0001/tender/bid' },
}

const ORDER: RecordHeaderInput = {
  kind: 'order',
  ref: 'SO-0001',
  enquiryRef: 'ENQ-2026-0001',
  clientName: CLIENT.name,
  clientHref: CLIENT.href,
  title: 'Control valve trims · PO-SCL-0001',
  meta: [
    { label: 'Client', value: CLIENT.name },
    { label: 'Order value', value: 'USD 100,000' },
    { label: 'Quotation', value: 'INDUS/Q10001-R2' },
    { label: 'Client delivery', value: '14 Dec · DAP site · 31 days left' },
  ],
  stage: 'freight',
  cta: { label: 'Book freight', href: '/orders/SO-0001/freight' },
  did: 'compared 3 freight quotes and recommends air consolidation',
  needCount: 1,
  threadHref: '/mail/clients?record=ENQ-2026-0001',
}

/** The S02 fixture, by kind and route ref. Pure, so the production branch is testable. */
export function recordHeaderFixture(
  kind: RecordKind,
  ref: string,
  appEnv: OpsEnv['APP_ENV']
): RecordHeaderState | null {
  if (appEnv === 'production') return null
  if (kind === 'order') return ref === ORDER.ref ? resolveHeaderState(ORDER) : null
  if (ref !== ENQUIRY.ref) return null
  return resolveHeaderState(kind === 'tender' ? TENDER : ENQUIRY)
}
