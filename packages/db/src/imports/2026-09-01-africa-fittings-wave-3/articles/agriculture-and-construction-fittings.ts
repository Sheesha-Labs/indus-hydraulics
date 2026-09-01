import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The East African mixed-user article: a single workshop supporting tractors,
 * a backhoe, a tipper and a generator, which is the commonest customer shape we
 * actually see and the least written-about.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'agriculture-and-construction-fittings',
  title: 'Agriculture and construction fittings when one workshop covers both',
  excerpt:
    'A tractor, a backhoe, a tipper and a generator in one yard is the normal African workshop. Four origins, three thread families and one drawer that has to cover all of it.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Agriculture and construction fittings for a mixed workshop',
  seoDescription:
    'How to stock hydraulic fittings for a workshop covering tractors, implements and light construction plant, and which failures actually recur.',
  focusKeyword: 'agriculture and construction fittings',
  publishedAt: '2026-09-01T15:26:00.000Z',
  bodyBlocks: [
    {
      type: 'lead',
      html: 'Most workshops we supply in East Africa are not specialists. They keep a few tractors, a backhoe or two, a tipper, a generator and whatever the owner has bought since, and they do it with one drawer of parts and one fitter who has learned the fleet by heart. That is a harder stocking problem than a mine has, because the variety is higher and the budget is smaller.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Variety is the constraint, not volume. The answer is depth in the failures that repeat, not coverage of the catalogue.',
        'Agricultural quick couplers and industrial ones are separate families — carry the right one per implement.',
        'Loader and tipper circuits produce most of the repeat failures on this kind of fleet.',
        'Write the fleet down once. On a small workshop that record lives in one person’s head, and that is a risk.',
        'Buy the season’s consumables as one consignment; emergency parcels are where the margin goes.',
      ],
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Where the repeat failures actually are.',
      anchor: 'repeat-failures',
    },
    {
      type: 'comparison_table',
      caption: 'The positions that come back',
      columns: ['Position', 'Why it fails repeatedly'],
      rows: [
        { cells: ['Loader lift and tilt lines', 'Constant articulation, contact against the frame'], highlight: true },
        { cells: ['Tipper ram feed', 'High load, long line, often poorly clamped'] },
        { cells: ['Implement couplers', 'Handled daily, dropped, dragged through dirt'] },
        { cells: ['Return lines near hot components', 'Heat ageing, and nobody inspects them'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The pattern in that table is that <strong>three of the four are installation problems rather than product problems.</strong> Before buying a heavier hose for a line that keeps failing, look at what it touches and whether it is clamped — that is a free repair and it usually lasts longer than the upgrade would.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Couplers, and the two families that are not interchangeable.',
      anchor: 'couplers',
    },
    {
      type: 'paragraph',
      html: 'Implements connect through quick couplers, and agricultural couplers are a separate standardised family from the industrial ones used on excavators and skid steers. Replacing one half with a coupler from the other family produces a connection that works on one implement and fits nothing else in the yard. <strong>Buy coupler halves in pairs and keep the dust caps</strong> — a capped coupler survives a season, an uncapped one collects the yard.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A coupler that will not connect has pressure behind it.',
      body: 'Heat in a disconnected implement line raises the pressure through the day. Relieve it at the implement rather than forcing the halves together — a forced coupler carries seal damage that shows up later as a drip and then as a failure under load.',
    },
    {
      type: 'category_link',
      slug: 'quick-couplers',
      label: 'Quick couplers',
      blurb: 'Coupler halves, dust caps and seals.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'One record, kept somewhere other than a head.',
      anchor: 'the-record',
    },
    {
      type: 'paragraph',
      html: 'On a small workshop the fleet knowledge is genuinely held by one person, and when that person is away the same identification gets done again from scratch, badly, under time pressure. A page per machine — the ends at the positions that fail, photographed, with the measurements written on it — takes an afternoon and removes that dependency permanently. It is also what turns an order into a line item instead of a conversation.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Buying against a season.',
      anchor: 'seasons',
    },
    {
      type: 'paragraph',
      html: 'Agricultural work is seasonal and construction is weather-dependent, so demand arrives in bursts and always at the moment when waiting is most expensive. Order the consumables before the season starts rather than during it: seals and bonded washers by the box, coupler halves for each implement type, hose ends in the bores that fail, and caps and plugs so a machine can work on a reduced circuit while a part is in transit.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the minimum useful stock for a small mixed workshop?',
          answer:
            'Hose ends in the two or three bores that actually fail, in the families your machines carry; a box each of bonded seals and O-rings; one spare coupler half per implement type; plugs and caps. Everything else can be ordered against a photograph.',
        },
        {
          question: 'Is it worth having hose made up locally or buying assemblies?',
          answer:
            'Where a hose shop is within reach, local make-up is fine for standard lines. Where it is not, holding ends and bulk hose — or a small set of tagged assemblies for the critical circuits — is what keeps machines working.',
        },
        {
          question: 'Can you quote a pre-season list?',
          answer:
            'Yes, and it is the cheapest way to buy for a small fleet. Send the machine and implement list with the ends you replace most and we will build it as one consignment.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'One workshop, several kinds of machine?',
      body: 'Send the fleet list, however rough, and photographs of the ends you replace most. We will build a stock list sized for the failures that repeat, not for the catalogue.',
      quoteLabel: 'Build a stock list',
    },
  ],
}

export default ARTICLE
