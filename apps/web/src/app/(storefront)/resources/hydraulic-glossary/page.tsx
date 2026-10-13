import {
  GLOSSARY,
  RESOURCES_LAST_CHECKED,
  buildBreadcrumbLd,
  glossaryByLetter,
  resourceEntries,
  resourceEntry,
  type JsonLd as JsonLdData,
} from '@indus/domain'
import { JsonLd } from '@indus/ui'
import GlossaryBrowser from '../../../../components/resources/GlossaryBrowser'
import ResourcePage from '../../../../components/resources/ResourcePage'
import { ResourceSection } from '../../../../components/resources/ResourceLayout'
import { getResourcesShared } from '../../../../lib/resources-content'
import { pageMetadata, urlFor } from '../../../../lib/seo'

/**
 * `/resources/hydraulic-glossary` — the terms, A to Z, each on its own anchor.
 *
 * Structured data is a DefinedTermSet with every term, each DefinedTerm carrying
 * its own `#slug` URL. That is what lets an answer engine cite one definition
 * rather than the page, and what lets the blog link straight to a term.
 */

const PATH = '/resources/hydraulic-glossary'
const SAMPLE = 'drop-length'

export const metadata = pageMetadata({
  title: 'Hydraulic Hose and Fitting Glossary — Terms Defined',
  description: `${GLOSSARY.length} hydraulic hose and fitting terms defined plainly — dash size, drop length, skiving, crimp diameter, Code 61 and 62, ORFS, JIC — with what each one is confused with.`,
  path: PATH,
})

export const revalidate = 3600

export default async function HydraulicGlossaryPage() {
  const entry = resourceEntry('hydraulic-glossary')
  const shared = await getResourcesShared('Glossary question')
  const letters = glossaryByLetter().length
  const crossRefs = GLOSSARY.reduce((n, t) => n + (t.see?.length ?? 0), 0)

  const termSetLd: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${urlFor(PATH)}#terms`,
    name: 'Hydraulic hose and fitting glossary',
    url: urlFor(PATH),
    hasDefinedTerm: GLOSSARY.map((term) => ({
      '@type': 'DefinedTerm',
      name: term.term,
      description: term.definition,
      url: `${urlFor(PATH)}#${term.slug}`,
      inDefinedTermSet: `${urlFor(PATH)}#terms`,
    })),
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Resources', url: urlFor('/resources') },
              { name: entry.title, url: urlFor(PATH) },
            ],
          }),
          termSetLd,
        ]}
      />
      <ResourcePage
        entry={entry}
        hero={{
          eyebrow: 'Glossary · hose, fittings, threads',
          lead: 'Hydraulic hose and fitting terms.',
          emphasis: 'Defined the way the counter uses them.',
          lede: `${GLOSSARY.length} terms from datasheets, drawings and the counter, each in two or three sentences: what it means, what it is confused with, and what to measure. Every term has its own link, so you can send a colleague straight to one.`,
          spec: [
            ['Terms', String(GLOSSARY.length)],
            ['Cross-references', String(crossRefs)],
            ['Standards named', 'SAE · ISO · ASME · EN'],
            ['Linking', 'Every term has an anchor'],
            ['Checked', RESOURCES_LAST_CHECKED],
          ],
          stats: [
            { value: String(GLOSSARY.length), label: 'Terms defined' },
            { value: String(letters), label: 'Letters' },
            { value: String(crossRefs), label: 'Cross-references' },
            { value: String(GLOSSARY.filter((t) => t.link).length), label: 'Links to guides' },
          ],
        }}
        contents={[
          { id: 'browse', label: 'Browse A to Z' },
          { id: 'linking', label: 'Linking to a term' },
        ]}
        railNote={{
          title: 'Missing a word?',
          body: <>If a term you met on a datasheet is not here, send it to us. We add the ones people actually ask about.</>,
        }}
        related={resourceEntries().filter((e) => e.key !== 'hydraulic-glossary')}
        cta={shared.cta}
        contact={shared.contact}
      >
        <ResourceSection
          id="browse"
          number="/01"
          title="Browse A to Z."
          lede="Filter by any word in a term or its definition. Cross-references jump within the page; the links under a definition go to the guide or table that takes it further."
        >
          <GlossaryBrowser />
        </ResourceSection>

        <ResourceSection
          id="linking"
          number="/02"
          title="Linking to a term."
          lede="Each term has a permanent anchor made from its name. Add it to the page address to send someone straight to the definition."
        >
          <div className="overflow-x-auto rounded-lg border border-ih-border bg-ih-surface px-5 py-4">
            <code className="mono whitespace-nowrap text-[13px] text-ih-ink">
              {urlFor(PATH)}
              <span className="text-ih-accent">#{SAMPLE}</span>
            </code>
          </div>
          <p className="mt-3 text-[13px] leading-[1.6] text-ih-muted">
            <a href={`#${SAMPLE}`} className="text-ih-accent hover:underline">
              Try it
            </a>{' '}
            — the term is highlighted when you arrive.
          </p>
        </ResourceSection>
      </ResourcePage>
    </>
  )
}
