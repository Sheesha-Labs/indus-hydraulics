import { Wallet } from 'lucide-react'
import { cn } from '../lib/cn'

/**
 * The 13 sidebar glyphs, copied verbatim from the handoff's OpsSidebar (the one thing besides token values
 * that is copied from it, CLAUDE.md §12.3), on a 24-unit grid.
 */
const PATHS = {
  today:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 16l2 2 4-4',
  review:
    'M9 3h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  enquiries:
    'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  quotations: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
  orders:
    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12M7.5 4.21l9 5.19',
  suppliers: 'M3 21h18M5 21V9l5 3V9l5 3V4h4v17M9 17h1M14 17h1',
  clients:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  parts: 'M12 2l8.66 5v10L12 22l-8.66-5V7zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  reports: 'M3 3v18h18M8 17v-5M13 17V8M18 17V11',
  autopilot: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  log: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12',
} as const

/** The 13 handoff glyphs plus `money` (lucide Wallet: the handoff has no Money icon, C10). */
export type OpsIconName = keyof typeof PATHS | 'money'

export const OPS_ICON_NAMES = [...(Object.keys(PATHS) as (keyof typeof PATHS)[]), 'money'] as const

export interface OpsIconProps {
  name: OpsIconName
  /** 16 in the expanded sidebar, 18 collapsed. */
  size?: 16 | 18
  className?: string
}

/**
 * Sidebar icon: stroke 1.75, currentColor, decorative (aria-hidden; the link beside it carries the name).
 * Money awaits a design: until then it is lucide Wallet at the same stroke.
 */
export default function OpsIcon({ name, size = 16, className }: OpsIconProps) {
  const cls = cn('flex-none', className)
  if (name === 'money')
    return (
      <Wallet
        aria-hidden="true"
        focusable="false"
        data-icon="money"
        width={size}
        height={size}
        strokeWidth={1.75}
        className={cls}
      />
    )
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-icon={name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
