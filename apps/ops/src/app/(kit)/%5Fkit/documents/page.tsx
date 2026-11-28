import { renderFixtures } from '@indus/ops-core/src/document/__fixtures__/kinds'
import type { Route } from 'next'
import Link from 'next/link'

/**
 * /_kit/documents (S11-T03): every document kind built from the neutral fixtures, on screen and as PDF. Kit
 * only (the (kit) layout 404s in production and without OPS_KIT=1).
 */
export default function KitDocumentsPage() {
  return (
    <main id="content" className="px-8 py-7">
      <h1 className="text-io-ink m-0 mb-4 text-[20px] font-medium">Documents</h1>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {renderFixtures().map((f) => (
          <li key={f.name} className="flex gap-4 text-[13px]">
            <Link className="io-focus text-io-accent" href={`/_kit/documents/${f.name}` as Route}>
              {f.data.title} · {f.name}
            </Link>
            <a className="io-focus text-io-ink-3" href={`/api/kit/documents/${f.name}/pdf`}>
              PDF
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
