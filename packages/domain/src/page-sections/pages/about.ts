import { area, body, cardList, ctaPair, eyebrow, heading, image, statList, text } from '../fields'
import type { MasterPageDef } from '../types'

/**
 * The company page at /hydraulic-components-supplier-uae.
 *
 * The route is descriptive rather than `/about` because "about us" describes
 * the page to us and nothing to a buyer evaluating a supplier. The content key
 * stays `about` — it identifies the content, not the URL.
 */
export const ABOUT_PAGE: MasterPageDef = {
  key: 'about',
  label: 'About',
  path: '/hydraulic-components-supplier-uae',
  description: 'The company page — story, people and what we stand for.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Eyebrow, headline and the opening paragraph.',
      locked: true,
      fields: [
        eyebrow(),
        heading({ max: 200 }),
        body({ max: 500, help: 'Use {years} and {skusFloor} for the live figures.' }),
      ],
      defaults: {
        eyebrow: 'ABOUT INDUS · EST. 2003',
        heading: 'A specialist supplier, built by engineers, for engineers.',
        body: 'We started in a 200-square-foot office in Al Quasis with one hydraulics distributorship and a fax machine. {years} years later we ship {skusFloor}+ SKUs across the GCC — and we still know the bore, rod and stroke of every cylinder we sell.',
      },
    },
    {
      key: 'stats',
      label: 'Figures strip',
      description: 'The four numbers under the hero.',
      fields: [statList(4, 'Figures')],
      defaults: {
        stats: [
          { value: '{years} yrs', label: 'In business' },
          { value: '{skus}', label: 'Live SKUs' },
          { value: 'GCC', label: 'Service area' },
          { value: '{brands}', label: 'Partner brands' },
        ],
      },
    },
    {
      key: 'story',
      label: 'Our story',
      description: 'The intro column and the dated timeline beside it.',
      fields: [
        eyebrow(),
        heading({ max: 200 }),
        body({ max: 800 }),
        cardList('items', 'Timeline', {
          itemLabel: 'milestone',
          max: 14,
          withTag: 'Year',
          descMax: 400,
        }),
      ],
      defaults: {
        eyebrow: 'OUR STORY',
        heading: 'From a trading desk to an assembly line.',
        body: 'Indus Hydraulics was founded in 2003 by Krishan Bhatia, a mechanical engineer who got tired of watching UAE plants wait six weeks for a replacement valve. The company was built around a single idea: stock the parts engineers actually need, ship them today.',
        items: [
          { enabled: true, tag: '2003', name: 'Founded in Dubai', desc: 'Started as a sole-trader hydraulics trading company in Al Quasis, importing genuine pumps and valves for UAE industrial customers. First customer: a steel re-rolling mill in Sharjah Industrial Area.' },
          { enabled: true, tag: '2008', name: 'First GCC export', desc: 'Shipped our first cross-border project consignment to Dammam, Saudi Arabia. Discovered our future was regional, not just local.' },
          { enabled: true, tag: '2012', name: 'Al Quasis warehouse opens', desc: 'Moved into our current 14,000 sq.ft. facility off Al Nahda Street. Consolidated stock under one roof for the first time.' },
          { enabled: true, tag: '2017', name: 'Hose assembly line commissioned', desc: 'Brought hydraulic hose crimping and fittings assembly in-house. Replacement assemblies that used to take days now leave the workshop the same afternoon.' },
          { enabled: true, tag: '2021', name: 'Engineering desk launched', desc: 'Made our applications team free for any customer with a question — from a circuit diagram to a failed-seal photo.' },
          { enabled: true, tag: '2024', name: 'JAFZA bonded presence', desc: 'Opened a Jebel Ali Free Zone bonded position for tax-efficient regional distribution across the GCC and wider MENA.' },
          { enabled: true, tag: '2026', name: 'This website', desc: 'The catalogue you’re browsing right now — built by the same engineers who answer the phone.' },
        ],
      },
    },
    {
      key: 'team',
      label: 'Leadership',
      description: 'The people cards.',
      fields: [
        eyebrow(),
        heading({ max: 200 }),
        cardList('items', 'People', {
          itemLabel: 'person',
          max: 12,
          withTag: 'Initials',
          withImage: true,
          descMax: 120,
          help: 'The photograph replaces the initials disc when one is picked.',
        }),
      ],
      defaults: {
        eyebrow: 'PEOPLE · LEADERSHIP',
        heading: 'The engineers behind the catalogue.',
        // The four names that stood here previously — Ravi Bhatt,
        // Sunil Patel, Anjali Krishnan, Mehul Rana — were placeholder
        // copy from the design handoff mockups that reached production
        // as if they were staff. None of those people exist and they
        // must not be reintroduced.
        //
        // The founder ROLE was real; only the name was invented. The
        // real founder is Krishan Bhatia, named in the story section
        // above. Add colleagues here only when they are real and have
        // agreed to be named.
        //
        // TODO(ayush): confirm `desc` before merge — it is published to
        // buyers and mirrored into Person JSON-LD via the blog author
        // record in packages/db/src/imports/2026-08-17-blog-taxonomy/authors.ts.
        // Krishan Bhatia's name and title are corroborated by the quote
        // signature block in packages/db/src/seed-quote-defaults.ts, which
        // is real trading data, not mockup copy.
        //
        items: [
          { enabled: true, tag: 'KB', name: 'Krishan Bhatia', desc: 'Managing Director', image: { mediaId: null, alt: null } },
          { enabled: true, tag: 'AB', name: 'Ayush Bhatia', desc: 'Director', image: { mediaId: null, alt: null } },
        ],
      },
    },
    {
      key: 'values',
      label: 'How we work',
      description: 'The numbered principles.',
      fields: [
        eyebrow(),
        heading({ max: 200 }),
        cardList('items', 'Principles', {
          itemLabel: 'principle',
          max: 6,
          withTag: 'Number',
          descMax: 400,
        }),
      ],
      defaults: {
        eyebrow: 'HOW WE WORK',
        heading: 'Three things that don’t change.',
        items: [
          { enabled: true, tag: '01', name: 'Stock it, or say so.', desc: 'We quote from real inventory. If something isn’t stocked, we say the lead time upfront — never after you’ve committed.' },
          { enabled: true, tag: '02', name: 'Engineers answer the phone.', desc: 'When you call with a technical question, you reach an applications engineer — not a call centre. We know the spec sheet, not just the catalogue number.' },
          { enabled: true, tag: '03', name: 'One price, no theatre.', desc: 'Our quote is a fixed-price commitment. No undisclosed freight surcharges, no "minimum order uplift" sprung at invoice.' },
        ],
      },
    },
    {
      key: 'cta',
      label: 'Closing call to action',
      description: 'The two buttons at the foot of the page.',
      fields: [
        heading({ max: 200 }),
        area('body', 'Body', { max: 320 }),
        ...ctaPair('primary', 'Primary button label'),
        ...ctaPair('secondary', 'Secondary button label'),
      ],
      defaults: {
        heading: 'Ready to put us to the test?',
        body: 'Send us your hardest-to-source SKU. We respond within 4 hours — often in minutes.',
        primary_cta_label: 'Submit an RFQ →',
        primary_cta_href: '/quote',
        secondary_cta_label: 'Contact us',
        secondary_cta_href: '/contact',
      },
    },
  ],
}
