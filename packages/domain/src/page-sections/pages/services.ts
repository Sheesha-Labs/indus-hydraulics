import { area, ctaPair, eyebrow, heading, statList, text } from '../fields'
import type { MasterPageDef } from '../types'

export const SERVICES_PAGE: MasterPageDef = {
  key: 'services',
  label: 'Services',
  path: '/services',
  description: 'The service and case-study index.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Headline, standfirst, the three figures and the two buttons.',
      locked: true,
      fields: [
        eyebrow(),
        text('heading_lead', 'Headline (first part)', { max: 80 }),
        text('heading_emphasis', 'Headline (italic middle)', { max: 80, optional: true }),
        text('heading_tail', 'Headline (last part)', { max: 80, optional: true }),
        area('body', 'Standfirst', { max: 400 }),
        statList(3, 'Figures', { withSuffix: true }),
        ...ctaPair('primary', 'Primary button label'),
        ...ctaPair('secondary', 'Secondary button label'),
      ],
      defaults: {
        eyebrow: 'SERVICES · WORKSHOPS · ON-SITE',
        heading_lead: 'Things people',
        heading_emphasis: 'bring us broken',
        heading_tail: ', and what we sent back.',
        body: 'Service jobs run out of our Jebel Ali yard — written as case studies, with photos, measurements and what it actually cost. Browse the cases or jump straight to a quote.',
        stats: [
          { value: '2,400+', suffix: null, label: 'Jobs / yr' },
          { value: '96', suffix: 'h', label: 'Avg TAT' },
          { value: '100', suffix: '%', label: 'On-time' },
        ],
        primary_cta_label: 'Request a service quote',
        primary_cta_href: '/quote',
        secondary_cta_label: 'Talk to an engineer →',
        secondary_cta_href: '/contact',
      },
    },
    {
      key: 'topics',
      label: 'Topic filter',
      description: 'The chip rail and the sort control.',
      dataNote:
        'The chips are the service-case categories, with live counts. Nothing here is free text.',
      fields: [],
      defaults: {},
    },
    {
      key: 'cases',
      label: 'Case grid',
      description: 'The featured case and the grid beneath it.',
      dataNote: 'The cards are published service cases, filtered and sorted by the rail above.',
      fields: [text('empty_message', 'Message when a filter matches nothing', { max: 160 })],
      defaults: { empty_message: 'No cases match this filter yet.' },
    },
    {
      key: 'approach',
      label: 'How we work',
      description: 'The four numbered steps and the panel beside them.',
      fields: [
        eyebrow(),
        heading({ max: 200 }),
        {
          key: 'items',
          label: 'Steps',
          kind: 'list',
          itemLabel: 'step',
          max: 6,
          fields: [
            { key: 'enabled', label: 'Show this step', kind: 'toggle' },
            { key: 'name', label: 'Title', kind: 'text', max: 80 },
            { key: 'desc', label: 'One-line summary', kind: 'text', max: 160 },
            { key: 'panel_tag', label: 'Panel eyebrow', kind: 'text', max: 80, optional: true },
            { key: 'panel_title', label: 'Panel heading', kind: 'textarea', max: 300, optional: true },
            { key: 'panel_body', label: 'Panel body', kind: 'textarea', max: 900, optional: true },
            {
              key: 'panel_deliverables',
              label: 'Deliverable pills',
              kind: 'textarea',
              max: 600,
              optional: true,
              help: 'One per line.',
            },
          ],
        },
      ],
      defaults: {
        eyebrow: 'HOW WE WORK · A LOOK INSIDE',
        heading:
          'The same four steps run every service, every time — from a piston seal to a BOP recert.',
        items: [
          {
            enabled: true,
            name: 'Intake & photo report',
            desc: 'Logged, tagged, photographed within 4 hours of arrival.',
            panel_tag: 'STEP 01 · INTAKE & PHOTO REPORT',
            panel_title:
              'Every asset gets a 4-hour intake — photographed, tagged, logged before anyone touches it.',
            panel_body:
              'On-site or in our Jebel Ali yard, intake is the first defensible step. Walk-around photos, fluid sample, OEM nameplate, recerts audit. The intake report is on the operator’s desk inside 4 hours of the asset being on the ground — before a single bay-hour is billed.',
            panel_deliverables: 'Walk-around photo log\nFluid sample\nOEM nameplate capture\nRecerts audit',
          },
          {
            enabled: true,
            name: 'Measure & quote',
            desc: 'Dimensional report against OEM tolerances. PDF before we cut metal.',
            panel_tag: 'STEP 02 · MEASURE & QUOTE',
            panel_title: 'You get a 12-page PDF before we cut a single piece of metal.',
            panel_body:
              'Bore roundness, rod straightness, gland clearances, deck flatness, seat depths — captured against OEM tolerances, with a recommendation for each finding. If you’d rather replace than rebuild, we’ll tell you, and quote the replacement too.',
            panel_deliverables:
              '12-page PDF\nDimensional data\nPhoto evidence\nCost vs replace\nLead-time options',
          },
          {
            enabled: true,
            name: 'Rebuild & test',
            desc: 'Closed-loop tested at 1.5× MAWP. Curves on file forever.',
            panel_tag: 'STEP 03 · REBUILD & TEST',
            panel_title:
              'Every assembly is wet-tested at 1.5× rated pressure before it leaves the bench.',
            panel_body:
              'Rebuild against OEM tolerance, NACE-spec elastomers on sour service, traceable hardware throughout. Each unit closed-loop tested against the OEM commissioning script; curve recorded and kept on file forever.',
            panel_deliverables:
              'Closed-loop test\n1.5× MAWP hold\nOEM curve match\nTest record on file',
          },
          {
            enabled: true,
            name: 'Document & dispatch',
            desc: 'Return packet with serials, torque values, test results, photos.',
            panel_tag: 'STEP 04 · DOCUMENT & DISPATCH',
            panel_title: 'Two paper copies of the sign-off pack ride back to the rig with the asset.',
            panel_body:
              'Serials, torque values, NACE certs, test curves, photos — the complete return packet. ADNOC / Aramco / KOC / PDO supplier-spec compliant. Signed off by an HSE rep where the operator requires it.',
            panel_deliverables:
              'Sign-off pack PDF\nSerial register\nTorque spec sheet\nTest curves\nNACE certs\nTwo paper copies',
          },
        ],
      },
    },
    {
      key: 'stories',
      label: 'Long reads',
      description: 'The two-up story cards near the foot of the page.',
      dataNote: 'The two cards are the most recent long-form service cases.',
      fields: [eyebrow(), heading({ max: 200 })],
      defaults: {
        eyebrow: 'LONG READS · ENGINEERS WRITING ABOUT THEIR JOBS',
        heading: 'Two recent service stories worth your time.',
      },
    },
    {
      key: 'capability',
      label: 'Manufacturing capability',
      description:
        'The band that sends a reader to /manufacturing — casting, forging and CNC behind the fittings we supply.',
      dataNote:
        'The figures in the band are read from the manufacturing page itself, so they cannot drift from what that page states.',
      fields: [
        eyebrow(),
        heading({ max: 160 }),
        area('body', 'Body', { max: 400 }),
        text('cta_label', 'Button label', { max: 60, optional: true }),
      ],
      defaults: {
        eyebrow: 'MANUFACTURING · CASTING · FORGING · CNC',
        heading: 'The production line behind the fittings we supply.',
        body: 'Our principal manufacturing partner runs casting, forging and CNC workshops under one process chain. Twelve controlled stages, material traceability and inspection records with every batch.',
        cta_label: 'See the manufacturing system',
      },
    },
    {
      key: 'cta',
      label: 'Closing call to action',
      description: 'The centred block that ends the page.',
      dataNote:
        'The WhatsApp and email buttons build their links from the number and address in System · Settings, and a button with no value set is dropped rather than shipped dead.',
      fields: [
        eyebrow(),
        area('byline', 'Italic byline', { max: 300 }),
        heading({ max: 200 }),
        area('body', 'Body', { max: 400 }),
        text('primary_cta_label', 'Ticket button label', { max: 60, optional: true }),
        text('whatsapp_cta_label', 'WhatsApp button label', { max: 60, optional: true }),
        text('email_cta_label', 'Email button label', { max: 60, optional: true }),
      ],
      defaults: {
        eyebrow: 'SERVICE INTAKE · OPEN 24×7 · JEBEL ALI',
        byline:
          'If it leaks, hums, screams, drips, slips or simply refuses to move — we’d like a look at it.',
        heading: 'Send us a photo, an SKU or a part on a pallet. We’ll do the rest.',
        body: 'An applications engineer will read your ticket inside one business day — no charge for the conversation, no obligation to use us.',
        primary_cta_label: 'Open a service ticket',
        whatsapp_cta_label: 'WhatsApp us',
        email_cta_label: 'Email',
      },
    },
  ],
}
