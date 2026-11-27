import { renderFixtures } from '@indus/ops-core/src/document/__fixtures__/kinds'
import { DOC_SCALES, DocumentPages, type DocScale } from '@indus/ops-ui/document'
import { notFound } from 'next/navigation'

/**
 * /_kit/documents/[kind] (S11-T03): every page of one fixture (full scale, or ?scale=m|w|thumb|z), paginated
 * exactly as its PDF (/api/kit/documents/[kind]/pdf). The raster and text parity tests compare the two.
 */
export default async function KitDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>
  searchParams: Promise<{ scale?: string }>
}) {
  const [{ kind }, sp] = await Promise.all([params, searchParams])
  const scale: DocScale = DOC_SCALES.includes(sp.scale as DocScale)
    ? (sp.scale as DocScale)
    : 'full'
  const f = renderFixtures().find((x) => x.name === kind)
  if (!f) notFound()
  return (
    <main id="content" data-built="kit-document" data-kind={f.name} className="px-8 py-7">
      <h1 className="sr-only">
        {f.data.title} {f.data.no}
      </h1>
      <DocumentPages
        data={f.data}
        letterhead={f.letterhead}
        scale={scale}
        {...(f.draft ? { stamp: 'Draft' as const } : {})}
      />
    </main>
  )
}
