import type { ReactNode } from 'react'
import { SectionHead } from './SectionHead'

interface KitSectionProps {
  /** Sheet section id (f01–f07, k00–k12) or a kit key; tests screenshot [data-kit-section=id]. */
  id: string
  crumb: string
  title: string
  text?: string
  /** 'pending' until the kit task lands; visual tests skip pending sections. */
  status?: 'built' | 'pending'
  children: ReactNode
}

/**
 * One specimen section: the sheet's section head, then the white spec card (L0/L1 .cv-cs / .cv-spec).
 */
export default function KitSection({
  id,
  crumb,
  title,
  text,
  status = 'built',
  children,
}: KitSectionProps) {
  return (
    <section
      id={id}
      data-kit-section={id}
      data-kit-status={status}
      className="border-io-sheet-line flex flex-col gap-7 border-b px-16 py-14"
    >
      <SectionHead crumb={crumb} title={title} {...(text ? { text } : {})} />
      <div
        data-kit-part="spec"
        className="rounded-io-8 border-io-sheet-line bg-io-card shadow-io-e1 flex w-[1440px] flex-col gap-[22px] border px-8 py-7"
      >
        {children}
      </div>
    </section>
  )
}

/** Shown in a spec card until its kit task is built. */
export function Pending({ task, what }: { task: string; what: string }) {
  return (
    <p className="text-io-body text-io-ink-3">
      {what} lands in {task}.
    </p>
  )
}
