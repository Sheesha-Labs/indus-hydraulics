import { Segmented } from '@indus/ops-ui/controls'
import type { HistoryKindFilter } from '../../data/history'

/**
 * Board 113's filter chips: All changes · Money only · Documents only. Links, so the filter lives in the URL
 * and works before hydration; the optional Timeline | History toggle sits beside them on an enquiry.
 */
export default function HistoryFilters({
  kind,
  hrefFor,
  view,
}: {
  kind: HistoryKindFilter
  hrefFor: (k: HistoryKindFilter) => string
  view?: { hrefFor: (v: 'timeline' | 'history') => string }
}) {
  return (
    <span className="flex items-center gap-2">
      {view ? (
        <Segmented<'timeline' | 'history'>
          aria-label="View"
          value="history"
          options={[
            { value: 'timeline', label: 'Timeline' },
            { value: 'history', label: 'History' },
          ]}
          hrefFor={view.hrefFor}
        />
      ) : null}
      <Segmented<HistoryKindFilter>
        aria-label="Changes"
        value={kind}
        options={[
          { value: 'all', label: 'All changes' },
          { value: 'money', label: 'Money only' },
          { value: 'documents', label: 'Documents only' },
        ]}
        hrefFor={hrefFor}
      />
    </span>
  )
}
