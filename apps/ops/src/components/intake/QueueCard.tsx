import { Chip } from '@indus/ops-ui/status'
import type { QueueBatch } from '../../data/intake'
import QueueRowAction from './QueueRowAction'

const FILL: Record<string, string> = {
  acc: 'fill-io-accent',
  navy: 'fill-io-navy',
  ok: 'fill-io-ok-solid',
  warn: 'fill-io-warn-solid',
  bad: 'fill-io-bad-solid',
}

/** Board 14's processing queue (S08-T03): one row per file with its meta, progress, state and verb. */
export default function QueueCard({ batch, title }: { batch: QueueBatch; title?: string }) {
  const n = batch.rows.length
  return (
    <section
      aria-label={title ?? 'Processing queue'}
      data-part="intake-queue"
      className="rounded-io-card border-io-line bg-io-card border"
    >
      <header className="border-io-line flex items-center justify-between border-b px-[18px] py-3.5">
        <h2 className="text-io-ink-3 m-0 text-[10.5px] font-medium tracking-[0.12em] uppercase">
          {title ?? 'Processing queue'} · {n} {n === 1 ? 'file' : 'files'}
        </h2>
        <span className="text-io-ink-3 text-[12px]">
          Uploaded by {batch.uploadedBy} · {batch.at}
        </span>
      </header>
      <ul className="m-0 list-none p-0">
        {batch.rows.map((r) => (
          <li
            key={r.id}
            data-state={r.status}
            className="border-io-line grid grid-cols-[36px_minmax(0,1fr)_220px_120px_88px] items-center gap-x-6 border-b px-[18px] py-3.5 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className="rounded-io-tag border-io-line bg-io-paper block h-11 w-9 border"
            />
            <span className="min-w-0">
              <span className="block truncate text-[13px]">{r.name}</span>
              <span className="text-io-ink-3 block truncate text-[12px]">{r.meta}</span>
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <svg aria-hidden="true" className="block h-[3px] w-full">
                <rect width="100%" height="3" rx="1.5" className="fill-io-fill" />
                <rect width={`${r.bar.pct}%`} height="3" rx="1.5" className={FILL[r.bar.tone]} />
              </svg>
              <span className="text-io-ink-2 truncate text-[12px]">{r.result}</span>
            </span>
            <span>
              <Chip tone={r.chip.tone} label={r.chip.label} />
            </span>
            <span className="text-right">
              <QueueRowAction row={r} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
