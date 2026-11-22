import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * Document scales (Document Kit `scale`): the A4 page is always laid out at 794 × 1123 and scaled as a
 * whole inside a fixed frame, so text stays real text at every size. Fixed classes only: no inline style.
 *
 * full 1 · m .6 (476 × 674, boards) · w .5542 (440 × 622) · thumb .189 (150 × 212, lists) ·
 * z .7 (556 × 786, the Estimate preview).
 */
export type DocScale = 'full' | 'm' | 'w' | 'thumb' | 'z'

export const DOC_SCALES: readonly DocScale[] = ['full', 'm', 'w', 'thumb', 'z']

/** The frame (outer box) and the scale applied to the 794 × 1123 page inside it. */
const FRAME: Record<Exclude<DocScale, 'full'>, { frame: string; page: string }> = {
  m: { frame: 'h-[674px] w-[476px]', page: 'scale-[.6]' },
  w: { frame: 'h-[622px] w-[440px]', page: 'scale-[.5542]' },
  thumb: { frame: 'h-[212px] w-[150px]', page: 'scale-[.189]' },
  z: { frame: 'h-[786px] w-[556px]', page: 'scale-[.7]' },
}

/** Classes for the 794 × 1123 page itself at a scale (the page draws its own shadow only at full). */
export function pageScaleClass(scale: DocScale): string {
  return scale === 'full' ? 'shadow-io-e-page' : cn('origin-top-left', FRAME[scale].page)
}

interface ScaleFrameProps {
  scale: DocScale
  className?: string
  children: ReactNode
}

/** Sizes the box a scaled page sits in. At `full` the page is its own box. */
export default function ScaleFrame({ scale, className, children }: ScaleFrameProps) {
  if (scale === 'full') return <>{children}</>
  return (
    <div
      data-doc-frame={scale}
      className={cn(
        'rounded-io-paper bg-io-card shadow-io-e2 relative flex-none overflow-hidden',
        FRAME[scale].frame,
        className
      )}
    >
      {children}
    </div>
  )
}
