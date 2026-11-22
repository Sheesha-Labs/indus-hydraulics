import { Field, type FieldProps } from '@indus/ops-ui/form'
import { SignoffTag } from '@indus/ops-ui/status'
import type { SignoffStatus } from '../../server/settings/registry'

export type SettingFieldProps = FieldProps & {
  /** The row's `signoffStatus` (from `getSettingEntry`): `awaiting` adds the sign-off tag. */
  signoff: SignoffStatus
}

/**
 * A form Field for a value that lives in `ops.settings_entry` (ADR-28). When the row is still the
 * seeded default awaiting the Owner's sign-off, "Default · awaiting sign-off" sits under the
 * field. The value itself comes from the page (`getSettingEntry`), never from a constant here.
 */
export default function SettingField({ signoff, ...field }: SettingFieldProps) {
  return (
    <div data-part="setting-field" data-signoff={signoff} className="flex min-w-0 flex-col gap-1.5">
      <Field {...(field as FieldProps)} />
      {signoff === 'awaiting' ? <SignoffTag className="self-start" /> : null}
    </div>
  )
}
