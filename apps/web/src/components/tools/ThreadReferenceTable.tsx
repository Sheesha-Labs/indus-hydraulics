import {
  THREAD_FAMILY_LABEL,
  THREAD_FAMILY_NOTE,
  type ThreadFamily,
  type ThreadReading,
} from '@indus/domain'

type Group = { family: Exclude<ThreadFamily, 'unknown'>; rows: ThreadReading[] }

/**
 * The port threads this catalogue actually carries, as a reference table.
 *
 * Server-rendered, no client JavaScript, no filter widget — everything
 * interactive already sits in the tool above it, and this half of the page is
 * the half meant to be read, quoted and linked to.
 *
 * The `Parts` column is what a textbook cannot print: how many stocked variants
 * wear each thread. It is also the sort order, so the threads a fitter meets
 * daily are the ones at the top of each group rather than the ones that happen
 * to sort first alphabetically.
 */
export default function ThreadReferenceTable({ groups }: { groups: Group[] }) {
  if (groups.length === 0) return null

  const designations = groups.reduce((n, g) => n + g.rows.length, 0)
  const variants = groups.reduce((n, g) => n + g.rows.reduce((m, r) => m + r.variants, 0), 0)

  return (
    <section className="max-w-[900px] pb-20">
      <h2 className="font-serif text-[30px] font-normal leading-[1.15] tracking-[-0.02em] text-ih-ink">
        Every port thread in this catalogue
      </h2>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-[1.7] text-ih-ink-2">
        {designations} thread designations across {variants.toLocaleString('en-GB')} stocked parts,
        taken from the port of every fitting we carry. Most thread charts are textbook extracts;
        this one is what actually turns up on parts, so the sizes you meet most often are the ones
        at the top of each group.
      </p>
      <p className="mt-3 max-w-[68ch] text-[15px] leading-[1.7] text-ih-ink-2">
        A designation identifies the <strong className="font-medium text-ih-ink">thread</strong>, not
        the fitting. JIC, ORFS and SAE O-ring boss all run the same UNF threads, and an unprefixed
        1/2&quot;-14 is NPT or BSP taper with nothing in the label to say which. The notes under each
        heading say what is still open rather than picking for you.
      </p>

      {groups.map((group) => (
        <div key={group.family} className="mt-10">
          <h3 className="mono text-[11px] font-medium uppercase tracking-[0.13em] text-ih-ink">
            {THREAD_FAMILY_LABEL[group.family]}
            <span className="ml-2 text-ih-muted">
              {group.rows.length} {group.rows.length === 1 ? 'designation' : 'designations'}
            </span>
          </h3>
          <p className="mt-2 max-w-[68ch] text-[14px] leading-[1.65] text-ih-ink-2">
            {THREAD_FAMILY_NOTE[group.family]}
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-ih-border">
            <table className="w-full border-collapse text-[14px]">
              <caption className="sr-only">
                {THREAD_FAMILY_LABEL[group.family]} port threads stocked by Indus Hydraulics, with
                nominal size, pitch, and the number of catalogue parts carrying each.
              </caption>
              <thead>
                <tr className="bg-ih-surface-2">
                  <th scope="col" className="mono px-4 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.1em] text-ih-muted">
                    Designation
                  </th>
                  <th scope="col" className="mono px-4 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.1em] text-ih-muted">
                    Nominal size
                  </th>
                  <th scope="col" className="mono px-4 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.1em] text-ih-muted">
                    Pitch
                  </th>
                  <th scope="col" className="mono px-4 py-2.5 text-right text-[10.5px] font-medium uppercase tracking-[0.1em] text-ih-muted">
                    Parts
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.key} className="border-t border-ih-border">
                    <th scope="row" className="mono px-4 py-2.5 text-left text-[13px] font-medium text-ih-ink">
                      {row.designation}
                    </th>
                    <td className="mono px-4 py-2.5 text-[13px] text-ih-ink-2">{row.size}</td>
                    <td className="mono px-4 py-2.5 text-[13px] text-ih-ink-2">{row.pitch}</td>
                    <td className="mono px-4 py-2.5 text-right text-[13px] text-ih-muted">
                      {row.variants}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="mt-10 max-w-[68ch] text-[13px] leading-[1.65] text-ih-muted">
        Counted from the live catalogue and refreshed hourly. Designations we could not read to a
        standard — bare sizes with no pitch, weld preps, and oilfield LP threads, whose label carries
        no pitch — are left out rather than guessed at.
      </p>
    </section>
  )
}
