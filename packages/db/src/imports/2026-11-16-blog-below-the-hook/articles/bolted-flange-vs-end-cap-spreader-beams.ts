import type { BlogArticleSeed } from '../shared'
import { END_CAP_VS_FLANGE } from '../diagrams'

/**
 * Bolted-flange vs end-cap (pin-and-socket) modular spreader beams, and why regional rules shape which
 * one a market uses. Regulatory facts checked 2026-11-16: EU lifting accessories fall under the
 * Machinery Directive 2006/42/EC until Regulation (EU) 2023/1230 applies from 20 January 2027;
 * EN 13155 is the harmonised design standard for non-fixed load lifting attachments; ASME BTH-1 covers
 * design (design categories, service classes) and ASME B30.20 marking, inspection and use, with a
 * nameplate showing maker, serial number, rated load, design category and service class. UAE rules from
 * the lifting-equipment-inspection-uae sources (CoP 34 v4.1, Dubai GU48). Listing facts: our modular
 * beams are bolted-flange (IH-LR-BH-MSB-*), the 8 t beam with M10 × 30 grade 8.8 bolts at 80 Nm.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bolted-flange-vs-end-cap-spreader-beams',
  title: 'Bolted flange vs end cap spreader beams: two modular systems, and why rules decide between them',
  excerpt:
    'Modular spreader beams come in two families. Bolted-flange systems join end units and fixed-length struts with flange bolts; end-cap systems pin two end fittings into a length of pipe. How each is built, what each does well, and why the question of who supplies the pipe matters more than the engineering.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Bolted Flange vs End Cap Spreader Beams',
  seoDescription:
    'Bolted-flange and end-cap spreader beams compared: assembly, span steps, shipping, certification of the pipe, and the EU, US and UAE rules behind the choice.',
  focusKeyword: 'bolted flange vs end cap',
  publishedAt: '2026-11-16T13:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Bolted-flange beams join two end units and one or more fixed-length struts with flange bolts. Every part, bolt included, comes from the maker and is certified as one system.',
        'End-cap beams pin two end fittings into the ends of a length of pipe. The pipe is cut to the span, and with some systems the user is allowed to source it to the maker’s specification.',
        'End caps are quick to assemble and cheap to ship. Bolted flanges give stiff joints, many spans from a stock of struts, and no cutting.',
        'The pipe is the deciding issue. Where the rules require the whole lifting accessory to be certified by its maker — as CE marking does in Europe — a locally bought pipe is a problem, and bolted systems dominate.',
        'In the UAE, whichever system you use, the assembled beam needs its SWL marked, a certificate that covers it, and thorough examination by an approved third party.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask for a modular spreader beam in Europe and you will almost always be offered a bolted-flange system. Ask in North America and you will often be offered end caps and a pipe size. Both are sound designs used safely every day. The interesting question is why each region settled where it did — because the answer is a rule about paperwork, not steel, and it applies to any project that has to satisfy an inspector.',
    },
    {
      type: 'diagram',
      svg: END_CAP_VS_FLANGE,
      captionPrefix: 'FIG. 01',
      caption: 'The two modular systems. In an end-cap beam the pipe is the beam; in a bolted beam the struts are maker-supplied parts with their own flanges.',
      alt: 'Top, an end-cap spreader beam: a length of pipe cut to span, with an end cap slid into each end and held by a locking pin, and a lifting shackle above and below each end cap. Bottom, a bolted-flange modular spreader beam: an end unit at each end with top and bottom shackles, and three struts of fixed lengths between them, joined at bolted flange joints.',
    },

    { type: 'section_head', number: '/01', title: 'How a bolted-flange beam is built.', anchor: 'bolted' },
    {
      type: 'paragraph',
      html: 'Two end units carry the top and bottom shackles. Between them go struts — tubes with a flange welded across each end — in a range of fixed lengths. Line the flanges up, fit the specified bolts and torque them, and the beam is built. Changing the span means adding, removing or swapping struts. Our <a href="/c/spreader-beams">modular spreader beams</a> are this type: the <a href="/p/modular-spreader-beam-8-tonne">8 t beam</a>, for example, builds from 0.5 m to 4.5 m with M10 × 30 grade 8.8 bolts at 80 Nm, and every span in its chart is covered by one certificate.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Stiff joints.</strong> A properly tightened flange joint adds almost no slack to the beam, so several struts can be combined in one span.</li><li><strong>Many spans from a small stock.</strong> A handful of strut lengths covers the chart in steady steps, and the same kit can be rebuilt for the next job on site.</li><li><strong>No cutting, no welding.</strong> Nothing is made to measure, so there is nothing to certify after delivery.</li><li><strong>The trade-off:</strong> more parts to ship and more bolts to fit, and a span between chart steps is not available.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'How an end-cap beam is built.', anchor: 'end-cap' },
    {
      type: 'paragraph',
      html: 'Each end cap is a fitting with the top and bottom lifting points, sized to slide into (or over) a particular pipe. A pin locks it in place. Cut the pipe to the span you need, pin a cap into each end, and the beam is built. Some systems add couplers so pieces of pipe can be joined into longer spans.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Quick to assemble.</strong> A pin, not a set of bolts.</li><li><strong>Cheap to ship.</strong> Only the end caps travel; the pipe can be bought near the job.</li><li><strong>Any span.</strong> Cut the pipe to the length the load needs, within the system’s limits.</li><li><strong>The trade-off:</strong> the pipe is a load-bearing part of the beam, and its grade, size, wall thickness and condition decide the rating. Every new span means a new piece of pipe.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Side by side.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'The two modular systems compared',
      columns: ['Feature', 'Bolted flange', 'End cap'],
      rows: [
        { cells: ['Main member', 'Maker’s struts, fixed lengths', 'Pipe cut to span'] },
        { cells: ['Joining', 'Flange bolts to a set torque', 'Locking pins'] },
        { cells: ['Span adjustment', 'In chart steps, by struts', 'Any length, by cutting pipe'] },
        { cells: ['Shipping', 'Whole kit', 'End caps only, if the pipe is sourced locally'] },
        { cells: ['Certification', 'Whole system, every chart span', 'End caps by the maker; the pipe must be covered too'] },
        { cells: ['Common in', 'Europe and the UK', 'North America'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Why the pipe decides it.', anchor: 'rules' },
    {
      type: 'paragraph',
      html: 'In the EU, a spreader beam is a lifting accessory under the Machinery Directive 2006/42/EC — replaced by the Machinery Regulation (EU) 2023/1230 from 20 January 2027. Its maker must design it, usually to EN 13155, keep a technical file, issue a declaration of conformity and CE-mark it. That covers what the maker supplies. A pipe cut and fitted by the user is part of the accessory but not part of anything the maker has declared, so the assembled beam is not a conforming product. Bolted systems, where the maker supplies every load-bearing part, avoid the problem entirely — which goes a long way to explaining why end caps never caught on there.',
    },
    {
      type: 'paragraph',
      html: 'In the US, below-the-hook lifting devices are designed to ASME BTH-1 and marked, inspected and used under ASME B30.20. The device carries a nameplate with its maker, serial number, rated load, and — for BTH-1 designs — its design category and service class. End-cap systems fit this regime when the maker specifies the pipe and the assembly is identified and rated accordingly, which is how they are commonly sold.',
    },
    {
      type: 'paragraph',
      html: 'In the UAE, the local rules care less about where the parts came from than about what the assembled beam can show. Under Abu Dhabi’s CoP 34, every lifting accessory must be marked with its SWL — an unmarked accessory comes out of service — and accessories are thoroughly examined every 6 months by a QCC-approved third party. Dubai requires certification by an EIAC-accredited third party. An inspector will ask for a certificate that covers the beam as assembled. A bolted beam built to its chart has one; an end-cap beam with a pipe from the local stockholder needs that pipe’s grade and dimensions traced and the assembly rated and certified. See <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Any pipe is not the pipe.',
      body: 'An end cap is rated only with the pipe its maker specifies — grade, outside diameter and wall thickness — in sound condition and within the maximum span. A pipe of the right diameter but a thinner wall or a lower grade can buckle far below the cap’s rating.',
    },

    { type: 'section_head', number: '/05', title: 'Which to choose.', anchor: 'choose' },
    {
      type: 'prose',
      html: '<ul><li><strong>Choose bolted flange</strong> for a project in Europe or the Gulf, for a hire or rigging fleet that rebuilds beams job after job, or wherever the beam must be inspected as one certified system.</li><li><strong>An end-cap system can suit</strong> a single repeated span, a US-standard project, or a site where shipping long struts is impractical — provided the pipe comes with the documentation to make the assembly certifiable.</li><li><strong>Neither</strong>, if the span changes every lift: a <a href="/p/telescopic-spreader-beams">telescopic spreader beam</a> resets with a pin. For one load lifted again and again, a <a href="/p/fixed-custom-spreader-beams">fixed spreader beam</a> has no joints to assemble wrongly.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an end-cap spreader beam?', answer: 'A modular spreader made of two end fittings, each with top and bottom lifting points, pinned into the ends of a length of pipe cut to the required span.' },
        { question: 'Can I buy the pipe for an end-cap spreader myself?', answer: 'Some makers allow it, to their specification. The pipe is then a load-bearing part of a lifting accessory, so its grade and dimensions must be traceable and the assembly rated, marked and certified before use.' },
        { question: 'Why are bolted modular spreader beams more common in Europe?', answer: 'EU rules require the maker to certify and CE-mark the whole lifting accessory. With a bolted system the maker supplies every load-bearing part; with an end-cap system a locally bought pipe falls outside the maker’s declaration.' },
        { question: 'Does changing the span of a bolted modular beam need a new certificate?', answer: 'Not if the span is in the beam’s chart and the beam is assembled to the instructions; the certificate covers every configuration in the chart. Periodic thorough examination still applies.' },
        { question: 'Which is quicker to assemble?', answer: 'End caps, which are held by a pin. Bolted flanges take longer but give stiff joints and need no cutting.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Bolted modular, telescopic and fixed spreaders',
      skus: ['IH-LR-BH-MSB-8', 'IH-LR-BH-MSB-24', 'IH-LR-BH-MSB-50', 'IH-LR-BH-TSB', 'IH-LR-BH-FSB'],
    },
    { type: 'category_link', slug: 'spreader-beams', label: 'Spreader beams', blurb: 'Bolted modular beams from 4 t to 70 t, telescopic, lattice and fixed spreaders.' },
    {
      type: 'related_articles',
      slugs: ['spreader-beam-vs-lifting-beam', 'spreader-beam-misuse', 'lifting-equipment-inspection-uae', 'asme-b30-26-rigging-hardware-explained', 'lifting-gear-test-certificate'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'EU: Directive 2006/42/EC and Regulation (EU) 2023/1230; US: ASME BTH-1 and B30.20 as summarised by their publishers and users; UAE: Abu Dhabi CoP 34 v4.1 and Dubai GU48. The rules and the beam’s instructions in force for the project govern.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying a modular spreader?',
      body: 'Send the loads, spans and headroom for the job. We will quote a bolted modular beam with its chart, certificate and rigging — or a telescopic or fixed spreader if it suits better.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
