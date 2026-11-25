/**
 * Board 92 · "Terms found in the email, not in the PDF" (S08-T06): the commercial terms #4 read from the cover
 * email, each as the client wrote it. They go on the enquiry and print on the quotation; the attached RFQ often
 * lists only the items. Server-safe.
 */
export interface CoverTerm {
  label: string
  value: string
}

export default function CoverEmailTerms({
  terms,
  note = 'These go on the enquiry and print on the quotation. The PDF only lists the items.',
}: {
  terms: readonly CoverTerm[]
  note?: string
}) {
  return (
    <section
      aria-label="Terms found in the email"
      data-part="cover-email-terms"
      className="rounded-io-card border-io-mark-line bg-io-warn-tint flex flex-col gap-2 border px-4 py-4"
    >
      <h2 className="text-io-warn m-0 text-[10.5px] font-medium tracking-[0.12em] uppercase">
        Terms found in the email, not in the PDF
      </h2>
      <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
        {terms.map((t) => (
          <div key={t.label} className="contents">
            <dt className="text-io-ink-2">{t.label}</dt>
            <dd className="m-0">{t.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-io-ink-2 m-0 text-[12px]">{note}</p>
    </section>
  )
}
