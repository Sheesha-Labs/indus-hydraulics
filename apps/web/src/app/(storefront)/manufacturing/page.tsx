import type { Metadata } from 'next'
import {
  MANUFACTURING_ENQUIRY,
  MANUFACTURING_PAGE,
  buildBreadcrumbLd,
  type JsonLd as JsonLdData,
} from '@indus/domain'
import { JsonLd, buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import ManufacturingLanding from '../../../components/manufacturing/ManufacturingLanding'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../lib/seo'
import { getStoreSettings } from '../../../lib/store-settings'

/**
 * `/manufacturing` — the capability page behind the fittings we supply.
 *
 * A static route, not a `[slug]` dispatch: there is one manufacturing story and
 * it is not per-industry. The content is a frozen constant in
 * `@indus/domain/manufacturing-page` — see the docblock there for why measured
 * capability figures are code rather than editable copy.
 *
 * The only data this route fetches is the contact block, so the phone number
 * and sales address stay in step with store settings rather than being frozen
 * into the page alongside the tolerances.
 */

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: MANUFACTURING_PAGE.seo.title,
    description: MANUFACTURING_PAGE.seo.description,
    path: MANUFACTURING_PAGE.path,
  })
}

/**
 * `HowTo` for the twelve stages and for the OEM workflow.
 *
 * Both are genuinely procedural — an ordered sequence of named steps with a
 * stated outcome — which is what the type is for. The alternative considered
 * and rejected was `Service`: it would describe what we sell rather than the
 * process the page actually documents, and the page sells nothing.
 *
 * `HowToStep.text` carries the stage body, NOT the guarantee. The guarantee is
 * the outcome we claim, and putting a claim where a crawler expects an
 * instruction is the kind of markup mismatch that gets rich results withdrawn.
 * Every step's text is visible on the page verbatim.
 */
function buildHowToLd(input: {
  name: string
  description: string
  url: string
  steps: readonly { readonly title: string; readonly body: string }[]
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    url: input.url,
    step: input.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.body,
    })),
  }
}

export default async function ManufacturingPageRoute() {
  const page = MANUFACTURING_PAGE
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
      <JsonLd
        data={buildHowToLd({
          name: page.process.heading,
          description: page.process.lede,
          url: pageUrl,
          steps: page.process.items,
        })}
      />
      <JsonLd
        data={buildHowToLd({
          name: `${SITE_NAME} OEM process`,
          description: page.oem.body,
          url: pageUrl,
          steps: page.oem.items,
        })}
      />
      {/* The Organization node the layout emits carries the @id these hang off;
          nothing here re-declares it. ORG_ID is referenced so a future Service
          or Product node on this page has the same anchor to reach for. */}
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

      <ManufacturingLanding
        page={page}
        enquiry={MANUFACTURING_ENQUIRY}
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        whatsappHref={buildWhatsappHref(settings.contactPhone, 'Enquiry: manufacturing / made to drawing')}
        mailtoHref={buildMailtoHref(settings.contactEmail, 'Manufacturing enquiry')}
      />
    </>
  )
}
