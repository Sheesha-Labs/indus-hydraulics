import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import RecordCockpit from '../../../../components/record/RecordCockpit'
import StateRecordHeader, {
  RecordRailSkeleton,
  RecordStrip,
} from '../../../../components/record/StateRecordHeader'
import { getRecordHeaderState } from '../../../../data/cockpit'
import { orderRef, routeParam } from '../../../../lib/route-params'

/**
 * The order cockpit (T2 kind order, board 75, C11): RecordHeader with the nine order tabs, the Assistant
 * strip and the rail. `review` (board 194, T4 bundle) and `exceptions/[kind]` (195–201, X1) are pages of
 * the order with their own template, so the cockpit steps aside for them. An unknown or malformed SO
 * number is notFound() (the orders segment shows board 211's "not imported" state); in production the
 * S02 stub returns null until S09.
 *
 * Not an authorization boundary (CLAUDE.md §4.2): every page under it calls requireOpsUser() itself.
 */
export default async function OrderLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ ref: string }>
}) {
  const ref = routeParam(orderRef, (await params).ref)
  const state = await getRecordHeaderState('order', ref)
  if (!state) notFound()
  return (
    <RecordCockpit
      header={<StateRecordHeader state={state} />}
      strip={<RecordStrip state={state} />}
      rail={<RecordRailSkeleton />}
      bare={['review', 'exceptions']}
    >
      {children}
    </RecordCockpit>
  )
}
