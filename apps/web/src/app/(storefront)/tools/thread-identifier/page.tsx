import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import ThreadIdentifier from '../../../../components/tools/ThreadIdentifier'
import ThreadReferenceTable from '../../../../components/tools/ThreadReferenceTable'
import ToolPageHeader from '../../../../components/tools/ToolPageHeader'
import { getThreadReference } from '../../../../lib/thread-reference-data'
import { pageMetadata, urlFor } from '../../../../lib/seo'

const DESCRIPTION =
  'Identify a hydraulic fitting from taper, thread angle and seat, then check the designation against every port thread in a working distributor catalogue.'

/**
 * Hourly, and prerendered.
 *
 * The reference table below the tool is read from the live catalogue, so the
 * page has to revalidate — but it is a grouped count that changes when an
 * importer runs, not per request, and this page is a linkable asset that wants
 * to be static for crawlers.
 */
export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Hydraulic thread identifier',
  description: DESCRIPTION,
  path: '/tools/thread-identifier',
})

export default async function ThreadIdentifierPage() {
  const groups = await getThreadReference()
  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Tools', url: urlFor('/tools') },
            { name: 'Thread identifier', url: urlFor('/tools/thread-identifier') },
          ],
        })}
      />
      <ToolPageHeader
        title="Thread identifier"
        intro="Three questions, working from geometry rather than dimensions — taper, thread angle and seat. Answer them with a caliper and a pitch gauge."
      />
      <div className="max-w-[760px] pb-8">
        <ThreadIdentifier />
      </div>
      <p className="max-w-[760px] pb-10 text-[14px] leading-[1.6] text-ih-muted">
        For the full method, including what each family seals on and the pairing that leaks, read{' '}
        <Link href="/blog/identify-any-hydraulic-fitting" className="text-ih-accent hover:underline">
          how to identify any hydraulic fitting in four steps
        </Link>
        .
      </p>

      <ThreadReferenceTable groups={groups} />
    </>
  )
}
