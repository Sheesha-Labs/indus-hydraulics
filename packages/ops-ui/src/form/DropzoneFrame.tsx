import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

export type DropzoneLook = 'ready' | 'over' | 'idle'

export interface DropzoneFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** ready: dashed accent on the dropzone ground; over: solid on accent-tint; idle: stroke on paper. */
  look: DropzoneLook
  title: ReactNode
  text: ReactNode
  /** The "Choose files" button. */
  action: ReactNode
}

const LOOK: Record<DropzoneLook, string> = {
  ready: 'border-io-accent bg-io-dropzone border-dashed',
  over: 'border-io-accent bg-io-accent-tint border-solid',
  idle: 'border-io-stroke bg-io-paper border-dashed',
}

/**
 * Form kit Dropzone (`kf-dz`), the still frame: 1.5px border r 10, title and text on the left, the button
 * on the right. Shared. Dropzone draws it with live drag state; specimens draw the `over` look with it.
 */
export default function DropzoneFrame({
  look,
  title,
  text,
  action,
  className,
  ...rest
}: DropzoneFrameProps) {
  return (
    <div
      {...rest}
      data-part="dropzone-frame"
      data-state={look}
      className={cn(
        'rounded-io-card flex w-full items-center justify-between gap-4 border-[1.5px] px-4 py-3.5 text-[12.5px] leading-[1.45]',
        LOOK[look],
        className
      )}
    >
      <span className="min-w-0">
        <b className="block text-[13px] font-medium">{title}</b>
        <span className="text-io-ink-2">{text}</span>
      </span>
      {action}
    </div>
  )
}
