import type { Metadata } from 'next'
import { buildBreadcrumbLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import PressureConverter from '../../../../components/tools/PressureConverter'
import ToolPageHeader from '../../../../components/tools/ToolPageHeader'
import { pageMetadata, urlFor } from '../../../../lib/seo'

const TITLE = 'Hydraulic pressure converter — psi, bar and MPa'
const DESCRIPTION =
  'Convert hydraulic working pressure between psi, bar and MPa. Exact conversion factors, no rounding built in.'

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/tools/pressure-converter',
})

export default function PressureConverterPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Tools', url: urlFor('/tools') },
            { name: 'Pressure converter', url: urlFor('/tools/pressure-converter') },
          ],
        })}
      />
      <ToolPageHeader
        title="Pressure converter"
        intro="The same hose is quoted in bar on a European datasheet, psi on an API document and MPa on a CIS one. This converts between all three."
      />
      <div className="max-w-[760px] pb-20">
        <PressureConverter />
      </div>
    </>
  )
}
