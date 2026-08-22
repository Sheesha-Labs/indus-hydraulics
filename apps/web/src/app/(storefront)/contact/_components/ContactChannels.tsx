import type { ReactNode } from 'react'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import OpeningHours from './OpeningHours'
import type { HoursRow } from './hours'

export type ChannelKind = 'whatsapp' | 'phone' | 'email' | 'office'

export type Channel = {
  kind: ChannelKind
  label: string
  /** The line the reader acts on — a number, an address, an email. */
  value: string
  /** Multi-line values (an address) render each line on its own row. */
  lines?: string[]
  href: string | null
  external?: boolean
  note: string | null
}

const ICONS: Record<ChannelKind, LucideIcon> = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
  office: MapPin,
}

/**
 * The contact rail: one hairline-separated row per channel, each an icon, a
 * label, the value at reading size, and a note about what to expect.
 *
 * This replaced three bordered cards carrying emoji glyphs and a hardcoded
 * green — the emoji rendered as a different picture on every platform, and the
 * "Online now" badge asserted staffing at 3 a.m. The live opening-hours row
 * underneath now makes that claim honestly, from the same week the
 * LocalBusiness JSON-LD publishes.
 */
export default function ContactChannels({
  channels,
  hoursRows,
  hoursLabel,
}: {
  channels: Channel[]
  hoursRows: HoursRow[]
  hoursLabel: string
}) {
  return (
    <div className="flex flex-col">
      {channels.map((channel) => {
        const Icon = ICONS[channel.kind]
        const body: ReactNode = channel.lines ? (
          <address className="not-italic leading-[1.55] text-[15px]">
            {channel.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        ) : (
          <span className="text-[18px] tracking-[-0.01em]">{channel.value}</span>
        )

        return (
          <div key={channel.kind} className="flex gap-4 border-t border-ih-border py-5">
            <Icon size={19} strokeWidth={1.6} aria-hidden className="mt-0.5 shrink-0 text-ih-accent" />
            <div className="min-w-0 flex-1">
              <div className="eyebrow">{channel.label}</div>
              <div className="mt-1.5 min-w-0 break-words">
                {channel.href ? (
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="text-ih-ink transition-colors hover:text-ih-accent"
                  >
                    {body}
                  </a>
                ) : (
                  <span className="text-ih-ink">{body}</span>
                )}
              </div>
              {channel.note ? <p className="mt-1.5 text-[12.5px] text-ih-muted">{channel.note}</p> : null}
            </div>
          </div>
        )
      })}
      <OpeningHours rows={hoursRows} label={hoursLabel} />
    </div>
  )
}
