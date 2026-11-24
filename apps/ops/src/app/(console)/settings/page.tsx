import type { Route } from 'next'
import Link from 'next/link'
import Arrives from '../../../components/skeleton/Arrives'
import { getAwaitingSignoff } from '../../../data/signoff-list'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/**
 * Board 212 · Settings home (T7 body; the layout draws the header and sub-nav). S07-T07 lists every default
 * awaiting the Owner's sign-off, by area, each linking to where it is confirmed; the rest of the board (every
 * setting by group and the integrations) arrives with S34.
 */
export default async function SettingsPage() {
  const user = await requireOpsUser().catch(signInFor(`/settings`))
  const areas = user.role === 'owner' ? await getAwaitingSignoff() : []
  return (
    <div className="flex flex-col gap-5">
      {areas.length ? (
        <section
          data-part="awaiting-signoff"
          aria-labelledby="awaiting-title"
          className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5"
        >
          <h2 id="awaiting-title" className="io-eyebrow m-0 font-normal">
            Default · awaiting sign-off · {areas.reduce((n, a) => n + a.count, 0)}
          </h2>
          <p className="text-io-ink-3 m-0 text-[12.5px]">
            Values shipped as defaults. Each one is in use; confirm or change it where it lives.
          </p>
          {areas.map((a) => (
            <div key={a.area} className="border-io-line flex flex-col gap-1.5 border-t pt-3">
              <h3 className="m-0 text-[13px] font-medium">
                {a.area} <span className="text-io-ink-3 font-normal tabular-nums">· {a.count}</span>
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[12.5px]">
                {a.items.map((i) => (
                  <li key={`${a.area}:${i.label}`}>
                    <Link
                      href={i.href as Route}
                      className="io-focus rounded-io-tag text-io-accent hover:underline"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
      <Arrives
        sprint="S34"
        what="Board 212: every setting by group, and the state of each integration."
      />
    </div>
  )
}
