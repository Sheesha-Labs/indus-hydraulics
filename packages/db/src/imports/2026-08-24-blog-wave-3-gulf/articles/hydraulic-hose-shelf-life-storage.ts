import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-shelf-life-storage',
  title: 'Shelf life: the spare that expired on the rack',
  excerpt:
    'Hose ages whether or not it is fitted to anything, and a hot open store in the UAE ages it faster than the figure on a datasheet assumes. The widely quoted shelf-life numbers are also attributed to the wrong standard.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose shelf life and storage in UAE conditions',
  seoDescription:
    'How long hydraulic hose and assemblies can be stored, which standards actually cover shelf life and storage, and what a hot Gulf store does to spares.',
  focusKeyword: 'hydraulic hose shelf life',
  publishedAt: '2026-08-24T13:55:56.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Rubber ages on the shelf. A spare assembly is consuming its life from the day it is built.',
        'Heat, sunlight, ozone and tension all accelerate it, and a typical UAE store supplies at least the first two.',
        'The shelf-life figures circulating in this industry are routinely attributed to SAE. They originate in ARPM IP-11-1; storage practice is in ISO 2230 and ISO 8331.',
        'Tight coiling is the most common avoidable damage — rubber held in tension is what ozone attacks.',
        'Date-marking and stock rotation are what make any of this actionable. Without a date on the assembly there is nothing to rotate on.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose assembly bought sensibly in advance and stored carelessly can be unserviceable before it is ever fitted. It is one of the few hose problems that happens entirely inside your own building, and one of the easiest to fix.',
    },

    { type: 'section_head', number: '/01', title: 'What the figures are, and where they come from.', anchor: 'the-standards' },
    {
      type: 'paragraph',
      html: 'Ask about hose shelf life and you will be given a number of years, usually credited to SAE. <strong>That attribution is wrong, and it is wrong nearly everywhere.</strong> SAE J1273 is a recommended practice for hose assemblies covering selection, routing, inspection and replacement. It is not where the shelf-life figures come from.',
    },
    {
      type: 'standard_citation',
      standard: 'ARPM IP-11-1',
      publisher: 'Association for Rubber Products Manufacturers',
      title: 'Hose Technical Information Bulletin — shelf life of rubber hose',
      summary:
        'The industry source for rubber hose shelf-life guidance, distinguishing between bulk hose and completed assemblies and specifying storage conditions the guidance assumes. Figures circulating without attribution, or credited to SAE, generally trace back here.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 2230',
      publisher: 'ISO',
      title: 'Rubber products — Guidelines for storage',
      summary:
        'Covers storage conditions for rubber products: temperature, light, ozone sources, humidity and mechanical strain. It is the document that explains why a hose kept in a hot, sunlit, tightly coiled state ages faster than the same hose kept cool, dark and relaxed.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Every published shelf life assumes storage conditions.',
      body: 'The figures are quoted for cool, dark, dry storage with the hose not under strain. A store that is none of those is not getting that shelf life, and no standard covers the shortfall — which is exactly the position most warehouses in this region are in.',
    },

    { type: 'section_head', number: '/02', title: 'What a UAE store does.', anchor: 'uae-store' },
    {
      type: 'comparison_table',
      caption: 'Storage factors and what they do',
      columns: ['Factor', 'Effect', 'Fix'],
      rows: [
        { cells: ['Heat — an uncooled warehouse in summer', 'Accelerates ageing continuously', 'Store hose in the coolest available space'], highlight: true },
        { cells: ['Direct or reflected sunlight', 'UV degrades the cover before it is ever fitted', 'Boxes, covers, or a windowless area'] },
        { cells: ['Tight coiling', 'Holds rubber in tension for ozone to attack', 'Coil generously or lay assemblies flat'], highlight: true },
        { cells: ['Electric motors, welding nearby', 'Local ozone generation', 'Physical separation'] },
        { cells: ['No date marking', 'Makes rotation impossible', 'Date-mark at build or receipt'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How long can a hydraulic hose be stored before use?',
      answer:
        'Published guidance distinguishes bulk hose from completed assemblies and assumes cool, dark, dry storage with the hose not under strain. In a hot, sunlit UAE store none of those conditions holds, so the published figure is optimistic. The practical answer is to date-mark stock, rotate it oldest-first, and store it cool, dark and loosely coiled.',
    },

    { type: 'section_head', number: '/03', title: 'Assemblies age faster than bulk hose.', anchor: 'assemblies' },
    {
      type: 'paragraph',
      html: 'A completed assembly has been cut, crimped and — usually — coiled to fit a shelf. Bulk hose on a reel is under gentler strain and has no fittings to corrode. <strong>The practical implication is that holding long-term spares as bulk hose plus fittings ages better than holding them as finished assemblies</strong>, at the cost of needing a crimp when the machine goes down.',
    },
    {
      type: 'paragraph',
      html: 'Where the machine cannot wait, hold the assembly and manage the shelf: date it, keep it cool and dark, and rotate. Where a few hours are acceptable, bulk plus fittings is the more durable way to hold cover.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Bulk hose by the metre, or assemblies built and dated.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I use a hose that is past its shelf life?', answer: 'Inspect it first — cover cracking, hardening and set are what you are looking for. Shelf life is guidance about expected condition, not an expiry that makes a sound hose unsafe. On safety-critical or high-pressure duty, do not take the chance.' },
        { question: 'Does the date on the layline mean the shelf life started then?', answer: 'It is the manufacture date, so it is where the clock starts for bulk hose. For an assembly, the build date matters too, which is why assemblies should carry their own tag.' },
        { question: 'Do you date-mark assemblies?', answer: 'Yes, on request and as standard where a customer holds spares. It is what makes rotation possible rather than theoretical.' },
        { question: 'Is air conditioning necessary for hose storage?', answer: 'Not necessary, but the coolest available space matters more here than the guidance assumes. Out of the sun and off a west-facing wall is most of the benefit for no cost.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Standards attribution per ARPM IP-11-1 for shelf life and ISO 2230 / ISO 8331 for storage. Specific durations are not reproduced here — consult the current editions, which are the authoritative source.',
    },
    { type: 'cta_block', heading: 'Holding spares against a long lead time?', body: 'We date-mark assemblies so rotation is possible, and we can advise whether bulk hose plus fittings is the better way to hold cover for your machines.', quoteLabel: 'Ask about stocking' },
  ],
}

export default ARTICLE
