import { Card } from '@indus/ops-ui/card'
import { Chip } from '@indus/ops-ui/status'
import {
  SignOutDeviceButton,
  SignOutEverywhereButton,
} from '../../../../components/settings/team/DeviceActions'
import { deviceSub } from '../../../../components/settings/team/labels'
import type { DeviceRow } from '../../../../data/team-security'

type Props = { devices: DeviceRow[]; now: Date }

/**
 * Board 84 "Devices and sessions" (S03-T02): the signed-in person's live sessions, this device first with
 * its tag, every other one with Sign out, then Sign out everywhere. The page mounts it at #devices.
 */
export default function DevicesSection({ devices, now }: Props) {
  const others = devices.filter((d) => !d.current).length
  return (
    <Card as="div" eyebrow="Devices and sessions">
      <ul aria-label="Signed-in devices" className="m-0 flex list-none flex-col p-0">
        {devices.map((d) => (
          <li
            key={d.id}
            data-session={d.current ? 'current' : 'other'}
            className="border-io-line grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b py-2 text-[12.5px]"
          >
            <span className="flex min-w-0 flex-col leading-[1.35]">
              <span className="text-io-ink truncate font-medium">{d.deviceLabel}</span>
              <span className="text-io-ink-3 truncate">{deviceSub(d, now)}</span>
            </span>
            {d.current ? (
              <Chip tone="ok" label="This device" />
            ) : (
              <SignOutDeviceButton sessionId={d.id} label={d.deviceLabel} />
            )}
          </li>
        ))}
      </ul>
      {devices.length === 0 ? (
        <p className="text-io-ink-3 m-0 py-2 text-[12.5px]">No devices are signed in.</p>
      ) : null}
      <SignOutEverywhereButton others={others} />
    </Card>
  )
}
