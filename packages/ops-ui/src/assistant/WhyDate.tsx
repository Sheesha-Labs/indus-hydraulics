import { cn } from '../lib/cn'

/**
 * Assistant kit "Why <date>" (S08-T07, board 93): how a date the Assistant put in an email was worked out, one
 * line per step with its figure in medium weight, the last line the conclusion. Shared; data only.
 */
export interface WhyDateProps {
  title: string
  steps: ReadonlyArray<{ label: string; value: string; note?: string | undefined }>
  className?: string
}

export default function WhyDate({ title, steps, className }: WhyDateProps) {
  const last = steps.length - 1
  return (
    <section
      aria-label={title}
      data-part="why-date"
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex flex-col gap-2 border px-5 py-4',
        className
      )}
    >
      <h3 className="io-eyebrow m-0">{title}</h3>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.5]">
        {steps.map((s, i) => (
          <li key={s.label}>
            {i === last ? (
              <>
                {s.label} <b className="font-medium">{s.value}</b>
                {s.note ? `, ${s.note}` : ''}.
              </>
            ) : (
              <>
                {s.label}: <b className="font-medium">{s.value}</b>
                {s.note ? <span className="text-io-ink-2"> {s.note}</span> : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
