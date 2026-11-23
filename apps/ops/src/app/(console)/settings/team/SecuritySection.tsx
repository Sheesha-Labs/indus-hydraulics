import { Card } from '@indus/ops-ui/card'
import { Button, Toggle } from '@indus/ops-ui/controls'
import {
  BackupCodesPanel,
  PasswordPanel,
} from '../../../../components/settings/team/SecurityPanels'
import { signInLabel } from '../../../../components/settings/team/labels'
import type { SecurityState } from '../../../../data/team-security'
import { startTotpSetup } from '../../../(auth)/sign-in/actions'
import { beginSecurityChange, type SecurityChange } from './actions/sessions'

type Props = {
  security: SecurityState
  now: Date
  /** The panel `?security=` asks for, already checked against the 10-minute window by the page. */
  open: SecurityChange | null
}

const TWO_STEP_NOTE = 'Always on for password sign-in. Google sign-in uses Google’s own 2-step.'

/**
 * Board 84 "Security" (S03-T02): two-step verification, the last two sign-ins from auth_event, and the
 * changes that need a recent sign-in (password, backup codes), which open their panel here. Setting up
 * the authenticator is T01's enrolment (startTotpSetup → /sign-in/two-factor/setup → back here).
 * "Download my data" arrives with Data settings (S34). The page mounts it at #security.
 */
export default function SecuritySection({ security, now, open }: Props) {
  return (
    <Card as="div" eyebrow="Security">
      <div className="flex items-center justify-between gap-2.5 text-[13px]">
        <span>Two-step verification</span>
        {security.totpOn ? (
          <span className="text-io-ink-3 flex items-center gap-2 text-[12px]">
            On · authenticator
            <Toggle
              checked
              aria-label="Two-step verification is on"
              locked={{ reason: TWO_STEP_NOTE }}
            />
          </span>
        ) : (
          <span className="text-io-ink-3 flex items-center gap-2 text-[12px]">
            Off
            <form action={startTotpSetup}>
              <input type="hidden" name="next" value="/settings/team#security" />
              <Button type="submit" size="sm" variant="secondary">
                Set up<span className="sr-only"> two-step verification</span>
              </Button>
            </form>
          </span>
        )}
      </div>
      <span className="text-io-ink-3 text-[12px] leading-[1.45]">{TWO_STEP_NOTE}</span>
      <dl className="m-0 flex flex-col">
        <SignInRow label="Last sign-in" value={security.lastSignIn} now={now} />
        <SignInRow label="Before that" value={security.beforeThat} now={now} />
      </dl>

      {open === 'password' ? (
        <PasswordPanel hasPassword={security.hasPassword} totpOn={security.totpOn} />
      ) : open === 'backup-codes' ? (
        <BackupCodesPanel />
      ) : (
        <div className="flex flex-wrap gap-2">
          <form action={beginSecurityChange}>
            <input type="hidden" name="change" value="password" />
            <Button type="submit" size="sm" variant="secondary">
              {security.hasPassword ? 'Change password' : 'Set a password'}
            </Button>
          </form>
          {security.totpOn ? (
            <form action={beginSecurityChange}>
              <input type="hidden" name="change" value="backup-codes" />
              <Button type="submit" size="sm" variant="secondary">
                Regenerate backup codes
              </Button>
            </form>
          ) : null}
        </div>
      )}
      {security.totpOn ? (
        <span className="text-io-ink-3 text-[12px]">
          {security.backupCodesLeft === 1
            ? '1 backup code left'
            : `${security.backupCodesLeft} backup codes left`}
        </span>
      ) : null}
      <span className="flex items-center gap-2 text-[12.5px]">
        <Button variant="link" disabled aria-describedby="download-data-note">
          Download my data ↗
        </Button>
        <span id="download-data-note" className="text-io-ink-3 text-[12px]">
          Arrives with Data settings
        </span>
      </span>
    </Card>
  )
}

function SignInRow({
  label,
  value,
  now,
}: {
  label: string
  value: SecurityState['lastSignIn']
  now: Date
}) {
  return (
    <div className="border-io-line flex justify-between gap-2.5 border-b py-1.5 text-[13px]">
      <dt className="text-io-ink-3">{label}</dt>
      <dd className="m-0 text-right">{value ? signInLabel(value, now) : '—'}</dd>
    </div>
  )
}
