'use client'

import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactElement } from 'react'
import { cn } from '../lib/cn'
import { LAYER, tooltipBubble } from './styles'

export interface TooltipProps {
  /** Supplementary text. Never the only place information lives. */
  content: string
  /**
   * One focusable element with an accessible name of its own (visible text or aria-label). The tooltip
   * adds a description; it never names the control.
   */
  children: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Default 400ms (Radix default 700 felt slow on the boards). */
  delayMs?: number
  className?: string
}

/**
 * Overlay kit `Tooltip` on Radix Tooltip: opens on hover and on keyboard focus, closes on Escape and on
 * leave, wires aria-describedby. Navy, radius 6, 12px, e-tip. Carries its own Provider so a tooltip works
 * anywhere; the shell may add one Provider above everything to share the skip-delay between tooltips.
 */
export default function Tooltip({
  content,
  children,
  side = 'top',
  delayMs = 400,
  className,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayMs}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            collisionPadding={8}
            className={cn(tooltipBubble, LAYER.tooltip, className)}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
