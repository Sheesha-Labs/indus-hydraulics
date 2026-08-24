import type { Metadata } from 'next'
import {
  QUALITY_CONTROL_ENQUIRY,
  QUALITY_CONTROL_PAGE,
  buildBreadcrumbLd,
  type JsonLd as JsonLdData,
} from '@indus/domain'
import { JsonLd, buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import QualityControlLanding from '../../../components/quality-control/QualityControlLanding'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../lib/seo'
import { getStoreSettings } from '../../../lib/store-settings'

/**
 * `/quality-control` — what is tested, on what, at which stage.
 *
 * A static route with its content frozen in `@indus/domain/quality-control-page`
 * for the same reason as `/manufacturing`: the instrument names, standards
 * designations and twelve checks are claims about a real production line.
 *
 * The only data fetched is the contact block, so the phone number and sales
 * address track store settings rather than being frozen alongside the standards.
 */

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: QUALITY_CONTROL_PAGE.seo.title,
    description: QUALITY_CONTROL_PAGE.seo.description,
    path: QUALITY_CONTROL_PAGE.path,
  })
}

/**
 * `HowTo` over the three inspection stages, flattened to their twelve checks.
 *
 * The stages are the procedure; the checks are its steps. Emitting three
 * separate `HowTo` graphs of four steps each would describe three unrelated
 * procedures rather than one inspection regime, so the stage name prefixes each
 * step instead — which is also how the page reads them out.
 *
 * `HowToStep.text` is the check's own body, visible on the page verbatim. The
 * laboratory grid gets no markup: a list of instruments is not a procedure, and
 * inventing `HowTo` for it would be markup that describes nothing the page does.
 */
function buildInspectionHowToLd(): JsonLdData {
  const page = QUALITY_CONTROL_PAGE
  const steps = page.stages.items.flatMap((stage) =>
    stage.checks.map((check) => ({
      '@type': 'HowToStep',
      name: `${stage.name} — ${check.title}`,
      text: check.body,
    }))
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Pipe fitting inspection regime',
    description: page.stages.lede,
    url: urlFor(page.path),
    step: steps.map((step, i) => ({ ...step, position: i + 1 })),
  }
}

export default async function QualityControlPageRoute() {
  const page = QUALITY_CONTROL_PAGE
  const settings = await getStoreSettings()
  const pageUrl = urlFor(page.path)

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Services', url: urlFor('/services') },
            { name: page.breadcrumbLabel, url: pageUrl },
          ],
        })}
      />
      <JsonLd data={buildInspectionHowToLd()} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': pageUrl,
          name: page.seo.title,
          description: page.seo.description,
          url: pageUrl,
          isPartOf: { '@id': `${urlFor('/')}#website` },
          about: { '@id': ORG_ID },
        }}
      />

      <QualityControlLanding
        page={page}
        enquiry={QUALITY_CONTROL_ENQUIRY}
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        whatsappHref={buildWhatsappHref(
          settings.contactPhone,
          `Enquiry: ${SITE_NAME} inspection scope and documents`
        )}
        mailtoHref={buildMailtoHref(settings.contactEmail, 'Inspection scope enquiry')}
      />
    </>
  )
}
