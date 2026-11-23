import { Toggle } from '@indus/ops-ui/controls'
import { FlagToggle } from '../../../../components/settings/team/TeamActions'
import { CAPABILITIES, CAPABILITY_KEYS, type HelperFlag } from '../../../../lib/access-core'
import { firstName } from '../../../../lib/setup-steps'
import { removalNote, type OpenWork } from '../../../../server/access/team-core'

type Props = {
  helper: { id: string; name: string; flags: Record<HelperFlag, boolean> } | null
  ownerName: string | null
  /** pricing.defaults floorPct; null when the reader may not see margins. */
  floorPct: number | null
  /** The Owner may switch the Helper's toggles here; a Helper sees them locked. */
  manage: boolean
  helperWork: OpenWork
}

const CELL = 'border-io-line h-10 border-b px-4 text-left align-middle'

function label(text: string, floorPct: number | null): string {
  return text.replace('{floor}', floorPct === null ? 'margin' : `${floorPct}%`)
}

/**
 * Board 84 "What each role can do" (S03-T03), drawn from the capability map in lib/access-core.ts, the
 * same map can() and defineAction enforce: the seven board rows, Owner then Helper · <first name>.
 * The Helper's "Only if you allow it" rows carry the toggle (the Owner's to switch; locked for a Helper).
 */
export default function PermissionsTable({
  helper,
  ownerName,
  floorPct,
  manage,
  helperWork,
}: Props) {
  const rows = CAPABILITY_KEYS.filter((c) => CAPABILITIES[c].inTable)
  const helperPerson = helper
    ? { id: helper.id, name: helper.name, firstName: firstName(helper.name) }
    : null
  return (
    <section
      aria-labelledby="roles-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col overflow-hidden border"
    >
      <h2 id="roles-title" className="io-eyebrow border-io-line m-0 border-b px-4 py-4">
        What each role can do
      </h2>
      <table className="w-full table-fixed border-collapse text-[13px]">
        <colgroup>
          <col />
          <col className="w-[172px]" />
          <col className="w-[256px]" />
        </colgroup>
        <thead className="bg-io-paper">
          <tr>
            <th scope="col" className={CELL}>
              <span className="sr-only">Capability</span>
            </th>
            <th scope="col" className={`${CELL} io-eyebrow`}>
              Owner
            </th>
            <th scope="col" className={`${CELL} io-eyebrow`}>
              {helperPerson ? `Helper · ${helperPerson.firstName}` : 'Helper'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((capability) => {
            const def = CAPABILITIES[capability]
            const rule = def.helper
            return (
              <tr key={capability} data-capability={capability}>
                <th scope="row" className={`${CELL} text-io-ink font-normal`}>
                  {label(def.label, floorPct)}
                </th>
                <td className={CELL}>Yes</td>
                <td className={CELL}>
                  {rule.kind === 'always' ? (
                    'Yes'
                  ) : rule.kind === 'never' ? (
                    <span className="text-io-bad">Never</span>
                  ) : rule.kind === 'read_only' ? (
                    'No · read only'
                  ) : (
                    <span className="flex items-center gap-2">
                      Only if you allow it
                      {helper && helperPerson && manage ? (
                        <FlagToggle helper={helperPerson} flag={rule.flag} flags={helper.flags} />
                      ) : helper && helperPerson ? (
                        <Toggle
                          checked={helper.flags[rule.flag]}
                          aria-label={`${def.label} · ${helperPerson.firstName} (only the Owner changes this)`}
                          disabled
                        />
                      ) : null}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-io-ink-3 m-0 px-4 py-3 text-[12px] leading-[1.45]">
        {helperPerson && ownerName
          ? removalNote(firstName(ownerName), helperPerson.firstName, helperWork)
          : 'A helper sees enquiries, supplier quotes and costs, and only what you allow beyond that.'}
      </p>
    </section>
  )
}
