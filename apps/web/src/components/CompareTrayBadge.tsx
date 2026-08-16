'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MAX_COMPARE } from '@indus/domain'
import { clearTray, compareUrl, getTray, removeFromTray, type CompareTrayItem, COMPARE_TRAY_EVENT } from '../lib/compare-tray'

/**
 * The docked compare tray.
 *
 * 02-screen-index.md §06 draws this as a navy bar across the foot of the
 * listing: a count block, a chip per staged product carrying its thumbnail,
 * title, SKU and a dismiss, a dashed slot inviting the next one, and
 * clear-all / compare actions. The artboard positions it absolutely within
 * its board; the index is explicit that "in production it is
 * `position: fixed`".
 *
 * Previously this was a small floating pill in the corner showing only a
 * count — you could not see WHAT you had staged, which is most of the value
 * of a compare tray.
 *
 * Motion: enters from translateY(100%) over 220ms. Honours reduced-motion.
 */
export default function CompareTrayBadge() {
  const [tray, setTray] = useState<CompareTrayItem[]>([])

  useEffect(() => {
    const sync = () => setTray(getTray())
    sync()
    window.addEventListener(COMPARE_TRAY_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(COMPARE_TRAY_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (tray.length === 0) return null

  const remaining = MAX_COMPARE - tray.length

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-[ih-dock_220ms_cubic-bezier(.32,.72,0,1)] border-t border-ih-navy-2 bg-ih-navy motion-reduce:animate-none">
      {/* Count changes are announced — the tray is otherwise a purely visual
          confirmation that a click did anything. 03 §8. */}
      <p aria-live="polite" className="sr-only">
        {tray.length} of {MAX_COMPARE} products staged for comparison
      </p>

      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-5 py-3 sm:px-8 xl:px-12">
        <div className="shrink-0">
          <div className="font-mono text-[22px] leading-none tabular-nums text-white">{tray.length}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ih-steel">
            of {MAX_COMPARE} staged
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-hidden">
          {tray.map((item) => (
            <li
              key={item.sku}
              className="flex items-center gap-2.5 rounded-md border border-ih-navy-2 bg-ih-navy-2/50 py-1.5 pl-1.5 pr-2.5"
            >
              <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-white">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill className="object-contain p-1" sizes="36px" />
                ) : (
                  <span className="font-mono text-[8px] text-ih-muted">IH</span>
                )}
              </span>
              <span className="min-w-0">
                {item.title && (
                  <span className="block max-w-[190px] truncate text-[12.5px] font-medium leading-tight text-white">
                    {item.title}
                  </span>
                )}
                <span className="mt-0.5 block font-mono text-[10.5px] text-[oklch(0.75_0.02_250)]">{item.sku}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFromTray(item.sku)}
                aria-label={`Remove ${item.sku} from compare`}
                className="ml-1 shrink-0 rounded-sm px-1 text-[15px] leading-none text-[oklch(0.75_0.02_250)] transition-colors hover:text-white"
              >
                ×
              </button>
            </li>
          ))}

          {/* The dashed slot. It is not a control — it exists to say the tray
              is not full yet, which is why it carries no click target. */}
          {remaining > 0 && (
            <li
              aria-hidden="true"
              className="flex h-[52px] items-center rounded-md border border-dashed border-ih-navy-2 px-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[oklch(0.68_0.03_250)]"
            >
              add {remaining} more
            </li>
          )}
        </ul>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => clearTray()}
            className="h-10 rounded-md px-3 text-[13.5px] text-[oklch(0.82_0.02_250)] transition-colors hover:text-white"
          >
            Clear all
          </button>
          <Link
            href={compareUrl(tray)}
            className="inline-flex h-10 items-center rounded-md bg-ih-accent px-[18px] text-[13.5px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
          >
            Compare {tray.length}
          </Link>
        </div>
      </div>
    </div>
  )
}
