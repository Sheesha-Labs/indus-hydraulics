import type { ReactNode } from 'react'

/**
 * The Assistant's card on boards 96 and 97: the ASSISTANT tag and a one-line title, then the body. Server
 * component; the buttons inside are the caller's.
 */
export function AssistantTag() {
  return (
    <span className="bg-io-ink text-io-card rounded-io-tag flex-none px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase">
      Assistant
    </span>
  )
}

export default function AssistantCard({
  title,
  children,
  label,
}: {
  title: string
  children?: ReactNode
  label?: string
}) {
  return (
    <section
      aria-label={label ?? title}
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-2 border px-4 py-3.5"
    >
      <p className="flex items-center gap-2">
        <AssistantTag />
        <span className="text-[13px] font-medium">{title}</span>
      </p>
      {children}
    </section>
  )
}
