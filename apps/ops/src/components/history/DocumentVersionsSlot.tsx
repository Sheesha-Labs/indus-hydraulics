import type { ReactNode } from 'react'

/**
 * Board 113's right column: the record's document versions. S06 draws the slot with its heading; S11 fills it
 * (the quotation's drafts and revisions, each with a "Sent to client" marker and the email it went in).
 */
export default function DocumentVersionsSlot({ children }: { children?: ReactNode }) {
  return (
    <aside
      aria-label="Document versions"
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0">Document versions</h2>
      {children ?? (
        <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.5]">
          Quotation drafts and supplier RFQ versions appear here once there are any. “Sent to
          client” marks each version that left, with the email it went in.
        </p>
      )}
    </aside>
  )
}
