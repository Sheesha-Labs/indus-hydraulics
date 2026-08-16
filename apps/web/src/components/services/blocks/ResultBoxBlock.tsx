import type { ResultBoxBlock } from '@indus/domain'

export default function ResultBoxBlockView({ block }: { block: ResultBoxBlock }) {
  const cols = Math.min(block.cells.length, 4)
  return (
    <div className="my-8 rounded-sm bg-ih-navy px-8 pb-7 pt-8 font-sans text-white">
      <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.14em] text-ih-accent">
        {block.label}
      </div>
      <h3 className="mb-4 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em]">{block.title}</h3>
      <p className="m-0 mb-6 max-w-[620px] text-[15px] leading-[1.55] text-[oklch(0.78_0.01_240)]">
        {block.body}
      </p>
      <div
        className="grid gap-px border border-[oklch(0.32_0.01_240)] bg-[oklch(0.32_0.01_240)]"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {block.cells.map((cell, i) => (
          <div key={i} className="bg-ih-navy px-4 py-4.5">
            <div
              className={`text-[26px] font-semibold leading-none tracking-[-0.02em] ${
                cell.style === 'accent' ? 'text-ih-accent' : ''
              }`}
            >
              {cell.value}
              {cell.valueSmall ? (
                <small className="text-sm font-medium text-[oklch(0.65_0.01_240)]">
                  {cell.valueSmall}
                </small>
              ) : null}
            </div>
            <div className="mono mt-2 text-[10px] uppercase tracking-[0.1em] text-[oklch(0.65_0.01_240)]">
              {cell.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
