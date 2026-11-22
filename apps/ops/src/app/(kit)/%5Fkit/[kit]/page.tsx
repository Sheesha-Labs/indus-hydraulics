import { notFound } from 'next/navigation'
import KitSection from '../../../../kit/KitSection'
import { kitBySlug } from '../../../../kit/registry'

/** /_kit/<kit>: one kit's full specimen. */
export default async function KitPage({ params }: { params: Promise<{ kit: string }> }) {
  const entry = kitBySlug((await params).kit)
  if (!entry) notFound()
  const { Specimen, ...k } = entry
  return (
    <main>
      <KitSection id={k.slug} crumb={k.crumb} title={k.title} text={k.text} status={k.status}>
        <Specimen />
      </KitSection>
    </main>
  )
}
