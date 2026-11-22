import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { IO_COLORS, IO_RADII, IO_SHADOWS, IO_SIZES, IO_TEXT_ROLES } from '../tokens.generated'

/**
 * tailwind-merge has to know the io- scale. Unconfigured, it reads `text-io-body` (a size) and
 * `text-io-ink` (a colour) as the same group and silently drops one of them (05 §1.3).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...IO_TEXT_ROLES],
      color: [...IO_COLORS],
      radius: [...IO_RADII],
      shadow: [...IO_SHADOWS],
      spacing: [...IO_SIZES],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
