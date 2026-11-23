import 'server-only'
import { createHash, createHmac } from 'node:crypto'
import { opsDb } from '@indus/ops-db'
import { formatDate, formatTime } from '@indus/ops-ui/format'
import { UAParser } from 'ua-parser-js'
import { opsUrl, sendSystemEmail } from '../mail/system-email'
import { newDeviceEmail } from '../mail/system-templates'

/**
 * Devices (board 84 "Devices and sessions", C42, S03-T02): what a sign-in's browser is called, where it
 * came from, a keyed device hash, and the new-device security email.
 *
 * - The label is "<browser> on <OS or device>": "Chrome on macOS", "Safari on iPad", "Edge on Windows".
 * - City and country come from Vercel's `x-vercel-ip-city` (URI-encoded) and `x-vercel-ip-country`
 *   headers; locally they are absent and stay null. The client address itself is never stored.
 * - `deviceHash` = sha256(salt ‖ browser family ‖ OS family ‖ device type), the salt derived from
 *   OPS_AUTH_SECRET. Families, not versions, so a browser update is not a new device; this also means
 *   two Macs running Chrome share a hash, which only ever suppresses a notice, never grants anything.
 */
export type DeviceInfo = {
  label: string
  browser: string
  os: string
  /** ua-parser's device type ('mobile', 'tablet', …) or 'desktop'. */
  type: string
}

const BROWSER_NAMES: Readonly<Record<string, string>> = {
  'Mobile Safari': 'Safari',
  'Chrome Headless': 'Chrome',
  'Chrome WebView': 'Chrome',
  'Mobile Chrome': 'Chrome',
  'Mobile Firefox': 'Firefox',
  'Samsung Browser': 'Samsung Internet',
}

const OS_NAMES: Readonly<Record<string, string>> = {
  'Mac OS': 'macOS',
  'Chromium OS': 'ChromeOS',
}

/** "Chrome on macOS". Unknown parts read "Unknown browser" / "an unknown device", never blank. */
export function describeDevice(userAgent: string | null | undefined): DeviceInfo {
  const ua = (userAgent ?? '').slice(0, 512)
  const { browser, os, device } = new UAParser(ua).getResult()
  const browserName = browser.name ? (BROWSER_NAMES[browser.name] ?? browser.name) : ''
  const osName = os.name ? (OS_NAMES[os.name] ?? os.name) : ''
  const type = device.type ?? 'desktop'
  // iPhone and iPad say more than "iOS"; other phones and tablets are named by their OS.
  const model =
    device.vendor === 'Apple' && /^(iPhone|iPad|iPod)$/.test(device.model ?? '')
      ? device.model!
      : ''
  const where = model || osName
  const label = browserName
    ? where
      ? `${browserName} on ${where}`
      : browserName
    : where
      ? `Unknown browser on ${where}`
      : 'Unknown browser'
  return { label, browser: browserName || 'unknown', os: where || 'unknown', type }
}

function deviceSalt(secret: string): Buffer {
  return createHmac('sha256', secret).update('ops.device-hash.v1').digest()
}

export function deviceHash(info: DeviceInfo, secret = process.env.OPS_AUTH_SECRET ?? ''): string {
  return createHash('sha256')
    .update(deviceSalt(secret))
    .update(`${info.browser.toLowerCase()}\n${info.os.toLowerCase()}\n${info.type}`)
    .digest('hex')
}

export type RequestLocation = { city: string | null; country: string | null }

function decodeHeader(value: string | null): string | null {
  const raw = value?.trim()
  if (!raw) return null
  try {
    return decodeURIComponent(raw).slice(0, 80) || null
  } catch {
    return raw.slice(0, 80)
  }
}

/** City and ISO country from Vercel's geo headers (absent locally). */
export function requestLocation(h: Pick<Headers, 'get'>): RequestLocation {
  const country = h.get('x-vercel-ip-country')?.trim().toUpperCase() ?? ''
  return {
    city: decodeHeader(h.get('x-vercel-ip-city')),
    // ops.user_session has CHECK (country ~ '^[A-Z]{2}$').
    country: /^[A-Z]{2}$/.test(country) ? country : null,
  }
}

/** A device seen within this many days is not new. */
export const KNOWN_DEVICE_DAYS = 90

/** "23 Nov 2026 08:41 GST" (Asia/Dubai). */
export function gstStamp(at: Date): string {
  return `${formatDate(at, { now: at, year: 'always' })} ${formatTime(at)} GST`
}

/**
 * After a sign-in: when no OTHER session of this user with the same device hash was created in the last
 * 90 days, email the user a security notice (system sender, kind auth_security_notice, one per session).
 * The sign-in's own auth_event row (kind sign_in, with city and country) records the event; the
 * outbound_email row records the notice.
 */
export async function noticeIfNewDevice(input: {
  userId: string
  sessionId: string
  deviceHash: string
  deviceLabel: string
  city: string | null
  at: Date
}): Promise<'sent' | 'known'> {
  const since = new Date(input.at.getTime() - KNOWN_DEVICE_DAYS * 86_400_000)
  const seen = await opsDb.userSession.findFirst({
    where: {
      userId: input.userId,
      deviceHash: input.deviceHash,
      createdAt: { gte: since },
      id: { not: input.sessionId },
    },
    select: { id: true },
  })
  if (seen) return 'known'
  const user = await opsDb.user.findUnique({
    where: { id: input.userId },
    select: { email: true },
  })
  if (!user) return 'known'
  await sendSystemEmail({
    kind: 'auth_security_notice',
    to: user.email,
    ...newDeviceEmail({
      device: input.deviceLabel,
      city: input.city,
      when: gstStamp(input.at),
      devicesUrl: opsUrl('/settings/team#devices'),
    }),
    idempotencyKey: `auth.new_device:${input.sessionId}`,
  })
  return 'sent'
}
