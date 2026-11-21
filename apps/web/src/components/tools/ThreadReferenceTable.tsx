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
      <h2 className="text-ih-ink font-serif text-[30px] leading-[1.15] font-normal tracking-[-0.02em]">
        Every port thread in this catalogue
      </h2>
      <p className="text-ih-ink-2 mt-4 max-w-[68ch] text-[15px] leading-[1.7]">
        {designations} thread designations across {variants.toLocaleString('en-GB')} stocked parts,
        taken from the port of every fitting we carry. Most thread charts are textbook extracts;
        this one is what actually turns up on parts, so the sizes you meet most often are the ones
        at the top of each group.
      </p>
      <p className="text-ih-ink-2 mt-3 max-w-[68ch] text-[15px] leading-[1.7]">
        A designation identifies the <strong className="text-ih-ink font-medium">thread</strong>,
        not the fitting. JIC, ORFS and SAE O-ring boss all run the same UNF threads, and an
        unprefixed 1/2&quot;-14 is NPT or BSP taper with nothing in the label to say which. The
        notes under each heading say what is still open rather than picking for you.
      </p>

      {groups.map((group) => (
        <div key={group.family} className="mt-10">
          <h3 className="mono text-ih-ink text-[11px] font-medium tracking-[0.13em] uppercase">
            {THREAD_FAMILY_LABEL[group.family]}
            <span className="text-ih-muted ml-2">
              {group.rows.length} {group.rows.length === 1 ? 'designation' : 'designations'}
            </span>
          </h3>
          <p className="text-ih-ink-2 mt-2 max-w-[68ch] text-[14px] leading-[1.65]">
            {THREAD_FAMILY_NOTE[group.family]}
          </p>
          <div className="border-ih-border mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-[14px]">
              <caption className="sr-only">
                {THREAD_FAMILY_LABEL[group.family]} port threads stocked by Indus Hydraulics, with
                nominal size, pitch, and the number of catalogue parts carrying each.
              </caption>
              <thead>
                <tr className="bg-ih-surface-2">
                  <th
                    scope="col"
                    className="mono text-ih-muted px-4 py-2.5 text-left text-[10.5px] font-medium tracking-[0.1em] uppercase"
                  >
                    Designation
                  </th>
                  <th
                    scope="col"
                    className="mono text-ih-muted px-4 py-2.5 text-left text-[10.5px] font-medium tracking-[0.1em] uppercase"
                  >
                    Nominal size
                  </th>
                  <th
                    scope="col"
                    className="mono text-ih-muted px-4 py-2.5 text-left text-[10.5px] font-medium tracking-[0.1em] uppercase"
                  >
                    Pitch
                  </th>
                  <th
                    scope="col"
                    className="mono text-ih-muted px-4 py-2.5 text-right text-[10.5px] font-medium tracking-[0.1em] uppercase"
                  >
                    Parts
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.key} className="border-ih-border border-t">
                    <th
                      scope="row"
                      className="mono text-ih-ink px-4 py-2.5 text-left text-[13px] font-medium"
                    >
                      {row.designation}
                    </th>
                    <td className="mono text-ih-ink-2 px-4 py-2.5 text-[13px]">{row.size}</td>
                    <td className="mono text-ih-ink-2 px-4 py-2.5 text-[13px]">{row.pitch}</td>
                    <td className="mono text-ih-muted px-4 py-2.5 text-right text-[13px]">
                      {row.variants}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="text-ih-muted mt-10 max-w-[68ch] text-[13px] leading-[1.65]">
        Counted from the live catalogue and refreshed hourly. Designations we could not read to a
        standard — bare sizes with no pitch, weld preps, and oilfield LP threads, whose label
        carries no pitch — are left out rather than guessed at.
      </p>
    </section>
  )
}
