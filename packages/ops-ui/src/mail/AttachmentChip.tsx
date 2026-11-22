import { cn } from '../lib/cn'
import type { FileType } from '../types'
import type { AttachmentChipProps } from './types'

/** Type label colour: PDF bad-solid, XLS/CSV ok, DOC accent, the rest neutral. */
const TYPE_INK: Record<FileType, string> = {
  PDF: 'text-io-bad-solid',
  XLS: 'text-io-ok',
  CSV: 'text-io-ok',
  DOC: 'text-io-accent',
  IMG: 'text-io-ink-2',
  MAIL: 'text-io-ink-2',
}

/**
 * Mail kit `km-att`: 5×9, r 6, line border, 11px; type label 9.5px 700; size ink-3. Unavailable (the file
 * is not stored yet, or was purged) is a dashed border and says so in words. The kit greys it to ink-4,
 * which fails AA on white; the name stays ink-3 so it can still be read. With `href` it is a link.
 */
export default function AttachmentChip({
  fileType,
  name,
  size,
  href,
  unavailable = false,
}: AttachmentChipProps) {
  const body = (
    <>
      <b className={cn('text-[9.5px] font-bold', TYPE_INK[fileType])}>{fileType}</b>
      {name}
      {size ? <span className="text-io-ink-3">{size}</span> : null}
      {unavailable ? <span className="sr-only">(not available)</span> : null}
    </>
  )
  const cls = cn(
    'rounded-io-ctl bg-io-card inline-flex items-center gap-[7px] border px-[9px] py-[5px] text-[11px] leading-[1.45] whitespace-nowrap',
    unavailable ? 'border-io-line text-io-ink-3 border-dashed' : 'border-io-line'
  )
  if (href && !unavailable) {
    return (
      <a href={href} data-part="attachment" className={cn(cls, 'io-focus hover:border-io-stroke')}>
        {body}
      </a>
    )
  }
  return (
    <span
      data-part="attachment"
      data-state={unavailable ? 'unavailable' : 'available'}
      className={cls}
    >
      {body}
    </span>
  )
}
