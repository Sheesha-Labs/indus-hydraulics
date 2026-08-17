'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from './lib/utils'

/**
 * Design language v2 — tooltip.
 *
 * The default export is deliberately a single self-contained component rather
 * than the Radix part set. Radix requires a `Tooltip.Provider` somewhere above
 * every tooltip; forgetting it throws at render, and the codebase has no root
 * provider to forget it in. Bundling one per tooltip costs nothing measurable
 * and removes a whole class of "works in my page, crashes in yours".
 * `TooltipParts` is exported for the rare case that needs shared delay
 * behaviour across a group.
 *
 * ⚠ A DISABLED TRIGGER FIRES NO POINTER EVENTS.
 *
 * This is the single most common way to get a tooltip wrong, and it is exactly
 * the media library's main use ("you can't delete this, here's why"). A
 * disabled `<button>` emits no pointerenter, so neither Radix nor a native
 * `title` on the button will ever show. Wrap it instead — the wrapper is not
 * disabled, so it hears the pointer:
 *
 *   <Tooltip label="In use — detach it first.">
 *     <span className="inline-flex cursor-not-allowed">
 *       <Button disabled …/>
 *     </span>
 *   </Tooltip>
 *
 * `disabledChild` does this wrapping for you and is the preferred spelling.
 */

const TooltipParts = {
  Provider: TooltipPrimitive.Provider,
  Root: TooltipPrimitive.Root,
  Trigger: TooltipPrimitive.Trigger,
  Portal: TooltipPrimitive.Portal,
  Content: TooltipPrimitive.Content,
  Arrow: TooltipPrimitive.Arrow,
}

export interface TooltipProps {
  /** Tooltip text. When empty or nullish the child renders bare, with no wrapper. */
  label: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  /** ms before the tooltip opens. Radix default is 700; 400 suits dense admin rows. */
  delayDuration?: number
  /**
   * Wraps the child in a non-disabled span so the tooltip still opens over a
   * disabled control. See the warning above.
   */
  disabledChild?: boolean
  className?: string
}

export function Tooltip({
  label,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 400,
  disabledChild = false,
  className,
}: TooltipProps) {
  // No label means no tooltip — return the child untouched rather than
  // rendering an empty bubble on hover.
  if (label === null || label === undefined || label === '') return <>{children}</>

  const trigger = disabledChild ? (
    <span className="inline-flex cursor-not-allowed">{children}</span>
  ) : (
    children
  )

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              // Inverted chip: ink ground, paper text. Reads over both the
              // surface and imagery, which a bordered light bubble does not.
              'z-50 max-w-[280px] rounded-md bg-ih-ink px-2.5 py-1.5',
              'font-sans text-[12px] leading-[1.45] text-white',
              'shadow-2 select-none',
              'data-[state=delayed-open]:animate-[ih-fade-in_100ms_ease-out]',
              'data-[state=closed]:animate-[ih-fade-out_80ms_ease-in]',
              'motion-reduce:animate-none',
              className
            )}
          >
            {label}
            <TooltipPrimitive.Arrow className="fill-ih-ink" width={10} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { TooltipParts }
