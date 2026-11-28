'use client'

import { MailFolder } from '@indus/ops-ui/mail'
import { usePathname } from 'next/navigation'
import type { SubNavGroup } from '../../lib/settings-nav'

export interface SubNavProps {
  groups: readonly SubNavGroup[]
}

/**
 * The T7 sub-nav (board 212, C41): group eyebrows over Mail kit folder rows, as the L2 t7a sheet mounts
 * it. Client only to mark the current row from the URL: a layout is not told its child segment. A row
 * whose href carries a #fragment (People › Profile, Devices) is a section of another row's page and is
 * never the current one. T7 wraps this in its `nav` landmark.
 */
export default function SubNav({ groups }: SubNavProps) {
  const pathname = usePathname()
  return (
    <>
      {groups.map((group, i) => (
        <div key={group.label ?? i} className="flex flex-col gap-0.5 pb-2.5">
          {group.label ? <p className="io-eyebrow px-2.5 pt-1.5 pb-1">{group.label}</p> : null}
          {group.items.map((item) => (
            <MailFolder
              key={item.href}
              label={item.label}
              href={item.href}
              active={
                !item.href.includes('#') &&
                (item.href === pathname || pathname.startsWith(`${item.href}/`))
              }
            />
          ))}
        </div>
      ))}
    </>
  )
}
