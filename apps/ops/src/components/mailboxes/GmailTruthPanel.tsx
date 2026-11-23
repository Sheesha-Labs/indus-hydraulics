import { Tag } from '@indus/ops-ui/status'
import type { ParsedArticle } from '../../lib/help-article'

/**
 * Board 88 · "Gmail stays the truth" (not a route): a collapsible explainer at the foot of Settings › Mailboxes.
 * Its words come from the help article `gmail-stays-the-truth` (database content, editable in Help), so the
 * page renders nothing when the article is missing.
 */
export default function GmailTruthPanel({
  article,
}: {
  article: (ParsedArticle & { title: string }) | null
}) {
  if (!article) return null
  return (
    <details
      data-part="gmail-truth"
      className="bg-io-card border-io-line rounded-io-card group border px-4.5 py-3.5"
    >
      <summary className="io-focus text-io-ink rounded-io-ctl flex cursor-pointer list-none items-center justify-between gap-3 text-[13.5px] font-medium">
        {article.title}
        <span className="text-io-accent text-[12.5px] font-normal group-open:hidden">Show</span>
        <span className="text-io-accent hidden text-[12.5px] font-normal group-open:inline">
          Hide
        </span>
      </summary>
      <div className="flex flex-col gap-3 pt-3">
        <p className="text-io-ink-2 m-0 text-[13px] leading-[1.55]">{article.intro}</p>
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {article.points.map((point, i) => (
            <li key={point} className="flex items-start gap-3 text-[13px] leading-[1.5]">
              <span
                aria-hidden="true"
                className="bg-io-accent rounded-io-pill flex size-5 flex-none items-center justify-center text-[11px] font-semibold text-white tabular-nums"
              >
                {i + 1}
              </span>
              <span className="text-io-ink">{point}</span>
            </li>
          ))}
        </ol>
        {article.later ? (
          <div className="border-io-stroke rounded-io-card flex flex-col gap-1.5 border border-dashed px-4 py-3">
            <span className="flex items-center gap-2">
              <Tag kind="level">Future concept</Tag>
              <span className="text-io-ink-3 text-[12px]">Not part of this release</span>
            </span>
            <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.55]">
              {article.later.replace(/\s*Not part of this release\.?$/, '')}
            </p>
          </div>
        ) : null}
      </div>
    </details>
  )
}
