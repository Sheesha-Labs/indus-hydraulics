import 'server-only'
import {
  resolveHeaderState,
  type HeaderMeta,
  type RecordHeaderInput,
  type RecordHeaderState,
  type RecordKind,
} from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
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
    (kind === 'enquiry' ? await enquiryHeader(ref) : null) ??
    recordHeaderFixture(kind, ref, env().APP_ENV)
)

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const fmtDay = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

/**
 * S08-T06: an enquiry created in Ops (from an email card, an upload or typed lines) has a real header, so the
 * Overview stub can show it. One read. S09 replaces this with the full cockpit query (rail, strip, CTA).
 */
async function enquiryHeader(ref: string): Promise<RecordHeaderState | null> {
  const e = await opsDb.enquiry.findUnique({
    where: { ref },
    select: {
      ref: true,
      title: true,
      clientRef: true,
      receivedAt: true,
      deadline: true,
      stage: true,
      client: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
  })
  if (!e) return null
  const days = e.deadline ? Math.ceil((e.deadline.getTime() - Date.now()) / 86_400_000) : null
  const deadline: HeaderMeta = e.deadline
    ? {
        label: 'Client deadline',
        value: `${fmtDay(e.deadline)} · ${days !== null && days >= 0 ? `${days} day${days === 1 ? '' : 's'} left` : 'passed'}`,
        ...(days !== null && days <= 7 ? { tone: 'bad' as const } : {}),
      }
    : { label: 'Client deadline', value: 'Not stated' }
  return resolveHeaderState({
    kind: 'enquiry',
    ref: e.ref,
    clientName: e.client?.name ?? 'Client not set',
    clientHref: e.client ? `/clients/${e.client.id}` : '/clients',
    title: e.title,
    meta: [
      { label: 'Client', value: e.client?.name ?? 'Not set' },
      { label: 'Client ref', value: e.clientRef ?? '—' },
      { label: 'Received', value: fmtDay(e.receivedAt) },
      deadline,
    ],
    stage: e.stage,
    did: `created with ${e._count.lines} line${e._count.lines === 1 ? '' : 's'}`,
    threadHref: `/mail/clients?record=${e.ref}`,
  })
}

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
