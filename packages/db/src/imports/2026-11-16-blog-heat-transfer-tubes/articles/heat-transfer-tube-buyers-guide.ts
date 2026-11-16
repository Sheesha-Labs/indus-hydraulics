import type { BlogArticleSeed } from '../shared'

import { FIN_TYPES } from '../tables'

/**
 * Hub article. Sources: the approved catalogue data for the Seamless Finned Tubes root (standards,
 * materials, fin limits as typical maker limits, bend rules D6), and the live listings. No maker names.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'heat-transfer-tube-buyers-guide',
  title: 'Finned and seamless heat-transfer tube: a buyer’s guide',
  excerpt:
    'How to specify tube for air coolers, shell-and-tube exchangers, condensers, boilers and fired heaters: the standard and grade, OD and wall, length, fin type and bend schedule — and what to send with an enquiry so the quotation matches the data sheet.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Heat Exchanger Tube Buyer’s Guide',
  seoDescription:
    'How to specify finned, seamless, U-bend and copper-alloy heat exchanger tube: standard, grade, OD, wall, length, fin type and bend schedule.',
  focusKeyword: 'heat exchanger tubes',
  publishedAt: '2026-11-16T08:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Every tube order starts with the standard and grade: it fixes chemistry, heat treatment, tests and tolerances.',
        'OD and wall come from the thermal and mechanical design; say whether the wall is minimum or average.',
        'Finned tube adds the fin type, fin material, height, thickness and density — and the fin type is chosen mainly by temperature.',
        'U-tubes add a bend schedule: radius and leg length for every row.',
        'Ask for a mill test certificate to EN 10204 3.1 and say which inspection you need before the order, not after.',
      ],
    },
    {
      type: 'lead',
      html: 'Heat-transfer tube looks like a commodity until it fails early. The difference between a bundle that lasts twenty years and one that leaks in two is usually in the specification: the wrong grade for the cooling water, a fin bond that loosens above its temperature, a bend too tight for the wall. This guide walks through what a complete tube specification contains, group by group, and links to the detailed guides and the listings in our catalogue.',
    },
    {
      type: 'direct_answer',
      question: 'What do you need to specify when buying heat exchanger tubes?',
      answer:
        'The standard and grade, the outside diameter, the wall thickness and whether it is minimum or average wall, the length (straight, or the U-bend schedule), the quantity and the certificate. For finned tube add the fin type, fin material, fin height, fin thickness, fins per inch and the bare length at each end. Everything else — tests, tolerances, heat treatment — follows from the standard.',
    },

    { type: 'section_head', number: '/01', title: 'Start with the standard and grade.', anchor: 'standard' },
    {
      type: 'paragraph',
      html: 'The tube standard is the contract between buyer and mill. It sets the chemistry, the heat treatment, the mechanical and hydrostatic or electric tests, and the dimensional tolerances. For heat-exchanger and boiler duties the common carbon steel standards are ASTM A179 (cold-drawn low-carbon exchanger tube), A192 (boiler tube for high pressure) and A210 (medium-carbon boiler and superheater tube). Alloy steels such as T11, T22 and T91 come under A213, which also covers seamless stainless grades such as TP304L and TP316L; welded stainless exchanger tube is A249, and ferritic stainless A268. Copper alloys — copper, admiralty and aluminium brass, 90/10 and 70/30 copper-nickel — are ordered to ASTM B111. Older DIN grades still appear on drawings: DIN 17175 and DIN 1629 have been superseded by EN 10216-2 and EN 10216-1.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Cross-references are indicative.',
      body: 'Grades in different standards are close, not identical. We check equivalents against each tender rather than substituting one for another.',
    },

    { type: 'section_head', number: '/02', title: 'OD, wall and length.', anchor: 'dimensions' },
    {
      type: 'paragraph',
      html: 'Exchanger tube is ordered by outside diameter, usually 5/8, 3/4 or 1 inch (15.88, 19.05 or 25.4 mm) for shell-and-tube bundles and 1 inch for air coolers. Wall is given in millimetres or BWG gauge — 14 BWG (2.11 mm) is the familiar carbon-steel air-cooler wall — and must say whether it is a minimum or an average wall, because the tolerance runs the other way in each case. Length follows the bundle: straight tubes for fixed and floating-head exchangers, and U-tubes for U-tube bundles and feedwater heaters.',
    },

    { type: 'section_head', number: '/03', title: 'Finned tube: the fin decides the limit.', anchor: 'finned' },
    {
      type: 'paragraph',
      html: 'Air-cooled exchangers, economisers and fired-heater convection sections use finned tube to multiply the outside surface. The fin type is chosen first by temperature and atmosphere, because the way the fin is bonded to the tube decides how hot it can run before the contact loosens. The table gives the typical maker limits for the fin types we supply; the detail is in <a href="/blog/types-of-finned-tubes">choosing a fin type</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Fin types and typical maker temperature limits (from our listings)',
      columns: ['Fin type', 'Bond', 'Typical limit', 'Typical service'],
      rows: FIN_TYPES.map((r) => ({ cells: r.cells.slice(0, 4) })),
    },
    {
      type: 'paragraph',
      html: 'Shell-and-tube exchangers use a different kind of fin: <a href="/p/integral-low-fin-tubes">integral low-fin tube</a>, rolled out of the tube wall itself, which raises the shell-side surface without changing the bundle — see <a href="/blog/integral-low-fin-tubes-condenser-retubing">low-fin tube for retubing</a>.',
    },

    { type: 'section_head', number: '/04', title: 'U-tubes need a bend schedule.', anchor: 'ubend' },
    {
      type: 'paragraph',
      html: 'A U-tube bundle is a set of rows, each with its own bend radius and leg length. The order has to list them. A centreline radius of 1.5 × OD can be bent, but dimensional tolerances are guaranteed from 2 × OD; the wall thins on the outside of the bend, and the allowed thinning is the one in the specification on the order (ASTM A688, A556 or B395, or TEMA), not a single percentage. Stainless and duplex bends may need heat treatment. All of this is covered in <a href="/blog/u-bend-tubes-bend-radius-wall-thinning">U-bend tubes</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Engineered items: send the data sheet.', anchor: 'engineered' },
    {
      type: 'paragraph',
      html: 'Complete exchangers, air-cooler bundles, coils, boiler pressure parts, tube sheets and baffles are made to a data sheet or drawing, so they have no catalogue size. For those we quote against the TEMA or API 661 data sheet, or the drawing and design code, and the listing pages give the checklist of what to send.',
    },
    {
      type: 'prose',
      html: '<p>Built to your data sheet or drawing:</p><ul><li><a href="/p/shell-and-tube-heat-exchangers">Shell-and-tube heat exchangers</a>, including <a href="/p/fixed-tubesheet-heat-exchangers">fixed-tubesheet</a> and <a href="/p/floating-head-heat-exchangers">floating-head</a> designs.</li><li><a href="/p/compressor-intercoolers-and-aftercoolers">Compressor intercoolers and aftercoolers</a>.</li><li><a href="/p/heat-pipe-heat-exchangers">Heat-pipe heat exchangers</a> for gas-to-gas heat recovery.</li><li><a href="/p/finned-tube-coils">Finned tube coils</a>, <a href="/p/finned-tube-evaporator-coils">evaporator coils</a> and <a href="/p/helical-pipe-coils">helical pipe coils</a>.</li><li><a href="/p/forged-flanges-for-heat-exchangers">Forged flanges</a> for exchanger shells and channels.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Certificates and inspection.', anchor: 'certificates' },
    {
      type: 'paragraph',
      html: 'Ask for a mill test certificate to EN 10204 3.1 with every order of pressure tube; it ties the heat number on the tube to the chemistry and test results. If the project needs third-party inspection, a 3.2 certificate, eddy-current testing of every tube or positive material identification, say so with the enquiry — it changes the mill and the price.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the most common heat exchanger tube size?', answer: '3/4 inch (19.05 mm) and 1 inch (25.4 mm) OD are the most common in shell-and-tube bundles; air-cooler tube is usually 1 inch OD.' },
        { question: 'Is A179 or A192 better for exchangers?', answer: 'A179 is the usual cold-drawn exchanger and condenser tube. A192 is boiler tube for high-pressure service. The design code and the data sheet decide which is required.' },
        { question: 'Which fin type takes the highest temperature?', answer: 'Welded fins: HF-welded spiral fins and studs, whose limit is set by the fin material. Among aluminium air-cooler fins, embedded G-fins run hottest, at about 400 °C as a typical maker limit.' },
        { question: 'Do you supply tube to BWG?', answer: 'Yes. Give the BWG and say whether it is minimum or average wall; we confirm the millimetre value on the quotation.' },
        { question: 'Which certificate comes with the tube?', answer: 'A mill test certificate to EN 10204 3.1 on request. Third-party inspection and 3.2 certificates can be arranged.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'From the catalogue',
      skus: ['IH-TF-FT-FIN', 'IH-TF-GF-GFN', 'IH-TF-EX-ALU', 'IH-TF-IL-ILF', 'IH-TF-UC-CS', 'IH-TF-US-AUS'],
    },
    { type: 'category_link', slug: 'seamless-finned-tubes-uae', label: 'Seamless Finned Tubes', blurb: 'Finned, seamless, U-bend and copper-alloy tube, tube sheets, exchangers and boiler pressure parts.' },
    {
      type: 'related_articles',
      slugs: ['types-of-finned-tubes', 'u-bend-tubes-bend-radius-wall-thinning', 'integral-low-fin-tubes-condenser-retubing', 'extruded-fin-tubes-coastal-air-coolers'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Fin temperatures are typical maker limits, not code values. Grade equivalents are indicative.',
    },
    {
      type: 'cta_block',
      heading: 'Send your tube list',
      body: 'Standard and grade, OD and wall, length and quantity — or the data sheet. We quote with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
