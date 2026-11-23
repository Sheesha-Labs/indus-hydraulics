import { area, cardList, eyebrow, faqList, heading, text } from '../fields'
import type { MasterPageDef } from '../types'

/**
 * `/locations` — the hub for the UAE areas we service on site.
 *
 * The UAE has no `/markets` page (markets are export lanes out of Dubai), so
 * this hub is the site's one page about working inside the country. The area
 * cards, the map and the comparison table are built from the area records in
 * `service-areas.ts`; the words around them are here.
 *
 * Wording rule, asserted by tests: these are areas we SERVICE. There is one
 * premises — the Dubai hose bay — and the copy never implies another.
 */
export const LOCATIONS_PAGE: MasterPageDef = {
  key: 'locations',
  label: 'Service areas',
  path: '/locations',
  description: 'The hub for the UAE areas we service on site, with the map and the area cards.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Headline, standfirst, the premises note and the UAE map.',
      locked: true,
      dataNote:
        'The map and the count of areas come from the area records. The meta title has " | Indus Hydraulics" appended, so keep it to about 42 characters.',
      fields: [
        eyebrow(),
        heading(),
        area('body', 'Standfirst', { max: 500 }),
        area('note', 'Premises note', {
          max: 400,
          help: 'Says where the one premises is and that everywhere else is somewhere we travel to. Keep that meaning.',
        }),
        text('meta_title', 'Meta title', { max: 70 }),
        text('meta_description', 'Meta description', { max: 170 }),
      ],
      defaults: {
        eyebrow: 'On-site service · UAE',
        heading: 'Hydraulic hose repair and on-site service across the UAE',
        body: 'Hose assemblies built at the machine, or made in our Dubai hose bay and fitted on site — across all seven emirates, the Habshan and Al Dhafra gas fields, and Al Ain.',
        note: 'Our hose bay and warehouse are in Al Qusais, Dubai. Everywhere else on this page is somewhere we travel to: mobile assembly at the machine, or a certified build delivered and fitted.',
        meta_title: 'Hydraulic Hose Repair Across the UAE',
        meta_description:
          'On-site hydraulic hose assembly and replacement in Dubai, Abu Dhabi, Mussafah, Habshan, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah and Al Ain.',
      },
    },
    {
      key: 'how',
      label: 'How on-site service works',
      description: 'The steps from first message to a fitted assembly.',
      fields: [
        eyebrow(),
        heading(),
        cardList('steps', 'Steps', { itemLabel: 'step', max: 5, descMax: 360 }),
      ],
      defaults: {
        eyebrow: 'How it works',
        heading: 'From a failed hose to a fitted one',
        steps: [
          {
            enabled: true,
            name: 'Tell us what failed',
            desc: 'A photo of the layline and both ends, the length, and where the machine is. If the site needs a permit or an induction, say so now.',
          },
          {
            enabled: true,
            name: 'We say bay job or site job',
            desc: 'Plainly, before anyone travels. Some assemblies are quicker to build in the Dubai bay and deliver; some are better made at the machine.',
          },
          {
            enabled: true,
            name: 'Built and crimped',
            desc: 'To the hose and fitting manufacturer’s crimp specification. Ask for the assembly to be tagged and the next replacement is a part number, not a measurement.',
          },
          {
            enabled: true,
            name: 'Fitted and routed',
            desc: 'Routed and clamped so it does not fail the same way again — a heavier hose in the same bad position only fails later.',
          },
        ],
      },
    },
    {
      key: 'areas',
      label: 'Area cards',
      description: 'One card per area, with its zones.',
      dataNote: 'The cards are the area records, in their own order.',
      fields: [eyebrow(), heading()],
      defaults: { eyebrow: 'Where we work', heading: 'Areas we service on site' },
    },
    {
      key: 'compare',
      label: 'Comparison table',
      description: 'What sets the timeline in each area, side by side.',
      dataNote: 'The rows are built from the area records.',
      fields: [eyebrow(), heading()],
      defaults: {
        eyebrow: 'At a glance',
        heading: 'What decides a visit, area by area',
      },
    },
    {
      key: 'faq',
      label: 'FAQ',
      description: 'Questions about on-site service anywhere in the UAE.',
      dataNote:
        'Published to Google as FAQ structured data. An empty list hides the band. Never write an arrival or response time.',
      fields: [eyebrow(), heading(), faqList(10)],
      defaults: {
        eyebrow: 'Questions we get asked',
        heading: 'On-site hose service in the UAE',
        items: [],
      },
    },
    {
      key: 'beyond',
      label: 'Beyond the UAE',
      description: 'The link out to the export-market pages.',
      fields: [eyebrow(), heading(), area('body', 'Body', { max: 400 })],
      defaults: {
        eyebrow: 'Outside the UAE',
        heading: 'Elsewhere in the GCC, we ship',
        body: 'Outside the UAE we do not send a crew; we build, test and ship the assembly from Dubai. Each GCC market has its own page with the documents, freight modes and lead times.',
      },
    },
  ],
}
