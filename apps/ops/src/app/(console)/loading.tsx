// Not the table barrel: see components/route/SegmentLoading.tsx (CSP nonce).
import TableSkeleton from '@indus/ops-ui/table/skeleton'

/** The console's fallback while a page without its own loading.tsx streams in (05 §6.4). */
export default function ConsoleLoading() {
  return (
    <div className="px-io-page-x py-6">
      <TableSkeleton rows={6} cols={5} label="Loading…" />
    </div>
  )
}
