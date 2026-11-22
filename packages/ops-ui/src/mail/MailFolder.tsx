import { cn } from '../lib/cn'
import type { MailFolderProps } from './types'

/**
 * Mail kit `km-fd`: one folder in the mail rail. 6×10, r 6, 12.5px; active = navy with white text and
 * aria-current="page"; the count is 11.5px at .7 opacity, or, with `warn`, a warn-tint pill 600 (Unsure,
 * Needs you). A link, so the folder is in the URL.
 */
export default function MailFolder({
  label,
  count,
  warn = false,
  active = false,
  href,
}: MailFolderProps) {
  return (
    <a
      href={href}
      data-part="mail-folder"
      {...(active ? { 'aria-current': 'page' as const } : {})}
      className={cn(
        'rounded-io-ctl io-focus flex w-full items-center justify-between px-2.5 py-1.5 text-[12.5px]',
        active ? 'bg-io-navy text-white' : 'hover:bg-io-fill'
      )}
    >
      <span>{label}</span>
      {count === undefined ? null : warn ? (
        <span className="rounded-io-pill bg-io-warn-tint text-io-pill-warn-ink h-io-chip-sm grid min-w-5 place-items-center px-1.5 text-[11px] font-semibold">
          {count}
        </span>
      ) : (
        <span className="text-[11.5px] opacity-70">{count}</span>
      )}
    </a>
  )
}
