'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'

/**
 * "Compare modes" (S07-T07): the help article 'autopilot-modes', generated in the database from the catalogue
 * (ops.regenerate_autopilot_modes_article), so it always matches the defaults.
 */
export default function ModesHelp({
  article,
}: {
  article: { title: string; intro: string; points: string[] }
}) {
  const router = useRouter()
  const close = () => router.push('/assistant/autopilot' as Route, { scroll: false })
  return (
    <Modal
      open
      onOpenChange={(o) => {
        if (!o) close()
      }}
      title={article.title}
      width={560}
      actions={
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      }
    >
      <div data-part="modes-help" className="flex flex-col gap-3 text-[13px]">
        <p className="m-0 leading-[1.5]">{article.intro}</p>
        <ol className="m-0 flex max-h-[420px] flex-col gap-1.5 overflow-y-auto pl-[18px] text-[12.5px]">
          {article.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </div>
    </Modal>
  )
}
