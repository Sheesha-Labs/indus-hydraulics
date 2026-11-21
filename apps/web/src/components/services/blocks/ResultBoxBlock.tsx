import type { ResultBoxBlock } from '@indus/domain'

/*
  Literal classes, not an inline gridTemplateColumns.

  An inline style beats every responsive utility, so four result cells stayed
  four columns at 390px — each cell ended up ~69px wide and the row pushed the
  case study ~90px past the viewport. Tailwind only emits classes it can see, so
  this is a map of complete literals rather than an interpolated name.

  Two columns on a phone, the real count from sm.
*/
const COLS_AT_SM: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
}

export default function ResultBoxBlockView({ block }: { block: ResultBoxBlock }) {
  const cols = Math.min(block.cells.length, 4)
  return (
    <div className="sc-on-dark bg-ih-navy my-8 rounded-[var(--radius-lg)] px-6 pt-7 pb-6 font-sans text-white sm:px-8 sm:pt-8 sm:pb-7">
      <div className="text-ih-steel mb-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
        {block.label}
      </div>
      <h3 className="mb-4 text-[24px] leading-[1.15] font-semibold tracking-[-0.02em] text-white sm:text-[28px]">
        {block.title}
      </h3>
      <p className="m-0 mb-6 max-w-[620px] text-[15px] leading-[1.55] text-[oklch(0.78_0.01_240)]">
        {block.body}
      </p>
      <div
        className={`grid grid-cols-2 gap-px border border-[oklch(0.32_0.01_240)] bg-[oklch(0.32_0.01_240)] ${COLS_AT_SM[cols] ?? COLS_AT_SM[4]}`}
      >
        {block.cells.map((cell, i) => (
          <div key={i} className="bg-ih-navy px-4 py-4.5">
            <div
              // Every figure is white (owner call, 2026-11-19): the accent
              // blue on navy read as a different, dimmer kind of number.
              className="text-[26px] leading-none font-semibold tracking-[-0.02em] text-white tabular-nums"
            >
              {cell.value}
              {cell.valueSmall ? (
                <small className="text-sm font-medium text-[oklch(0.65_0.01_240)]">
                  {cell.valueSmall}
                </small>
              ) : null}
            </div>
            <div className="mt-2 text-[11px] font-medium tracking-[0.08em] text-[oklch(0.72_0.01_240)] uppercase">
              {cell.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
