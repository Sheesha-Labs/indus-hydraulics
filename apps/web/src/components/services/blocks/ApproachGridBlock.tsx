import type { ApproachGridBlock } from '@indus/domain'

/*
  Literal classes, not an inline gridTemplateColumns.

  An inline style beats every responsive utility, so four phase columns stayed
  four columns on a phone and pushed each case study ~135px sideways. Tailwind
  only emits classes it can see, hence a map of complete literals rather than an
  interpolated name.

  One column on a phone, two from sm, the real count from lg.
*/
const COLS_AT_LG: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

export default function ApproachGridBlockView({ block }: { block: ApproachGridBlock }) {
  return (
    <div
      className={`border-ih-border bg-ih-border my-2 mb-6 grid grid-cols-1 gap-px border font-sans sm:grid-cols-2 ${COLS_AT_LG[Math.min(block.phases.length, 4)] ?? COLS_AT_LG[4]}`}
    >
      {block.phases.map((p, i) => (
        <div key={i} className="bg-ih-surface flex min-h-[220px] flex-col px-5 pt-5 pb-6">
          <span className="mono text-ih-accent text-[11px] tracking-[0.1em] uppercase">
            {p.number}
          </span>
          <h4 className="mt-2 mb-2 text-[17px] leading-tight tracking-[-0.01em]">{p.title}</h4>
          <p className="text-ih-muted m-0 text-[13px] leading-[1.55]">{p.body}</p>
          <div className="mono border-ih-border text-ih-ink mt-auto border-t border-dashed pt-3 text-[10.5px] tracking-[0.08em] uppercase">
            {p.duration}
          </div>
        </div>
      ))}
    </div>
  )
}
