import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Single vs double jacket fire hose. Construction and use facts from our jacketed fire hose
 * listings (IH-LF-F*). Standards orientation checked 2026-10-13: NFPA 1961 hose categories (now
 * consolidated into NFPA 1960, 2024), NFPA 1962 service test pressures (NFPA public-input text),
 * EN 14540 and BS 6391 scopes (SIS and BSI listings), UAE Fire and Life Safety Code double-jacket
 * rule for Class I and dry-riser hose (2017 text). No approval or pressure is claimed for our hose.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'single-vs-double-jacket-fire-hose',
  title: 'Single vs double jacket fire hose: construction, uses and how to choose',
  excerpt:
    'A double jacket fire hose has a second woven jacket inside the first. That buys pressure capacity, abrasion protection and a hose that keeps working if the outer jacket is cut — at the cost of weight and bulk. Where each belongs, how the NFPA, EN and UAE rules treat them, and how to choose for attack lines, supply lines, hose stations, cabinets and forestry work.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Single vs Double Jacket Fire Hose: Differences and Uses',
  seoDescription:
    'Single vs double jacket fire hose compared: construction, weight, abrasion and cut resistance, attack, supply, hose-station, cabinet and forestry uses, the NFPA, EN and UAE rules, and how to specify.',
  focusKeyword: 'single vs double jacket fire hose',
  publishedAt: '2026-10-13T17:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Both are lay flat hoses: a rubber or polyurethane liner inside woven polyester. A double jacket hose adds a second woven jacket.',
        'Double jacket: more abrasion and cut protection, longer life under hard use — the usual choice for fire brigade and industrial attack lines.',
        'Single jacket: lighter, cheaper and more compact — the usual choice for occupant-use rack and cabinet hose, hose stations and forestry packs.',
        'The UAE Fire and Life Safety Code calls for double-jacket hose on Class I (fire service) standpipes and dry risers.',
        'Jacket count is not an approval. Specify the standard and authority listing the hose must meet.',
      ],
    },
    {
      type: 'lead',
      html: 'Lay a single jacket and a double jacket fire hose of the same bore side by side and the difference is easy to see: the double jacket hose is thicker, heavier and stiffer. Cut one open and the reason is obvious — under the outer woven jacket sits a second complete jacket, and only then the liner. Whether that second layer is worth carrying depends on who uses the hose, how often, and over what.',
    },

    { type: 'section_head', number: '/01', title: 'How they are built.', anchor: 'construction' },
    {
      type: 'figure',
      imageId: FIG['fig-double-jacket-cut'],
      captionPrefix: 'FIG. 01',
      caption: 'A double jacket hose has two complete woven jackets — the outer one takes the wear so the inner one keeps the pressure.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'In both types the <strong>liner</strong> — EPDM, natural rubber or polyurethane — seals the water in, and woven polyester carries the pressure. A <strong>single jacket</strong> hose has one woven jacket over the liner; some are coated on the outside for abrasion and to stop the jacket soaking up water. A <strong>double jacket</strong> hose has two, one inside the other. The outer jacket takes the scuffing on concrete and gravel and protects the inner one; if the outer jacket is cut or burned through, the inner jacket keeps the hose in service. Our guide to <a href="/blog/fire-hose-liner-materials">fire hose liner materials</a> covers what sits inside.',
    },
    {
      type: 'comparison_table',
      caption: 'Single vs double jacket fire hose',
      columns: ['Property', 'Single jacket', 'Double jacket'],
      rows: [
        { cells: ['Construction', 'Liner + one woven jacket (coated or uncoated)', 'Liner + two woven jackets'] },
        { cells: ['Weight and roll size', 'Lighter, more compact', 'Heavier, bulkier'] },
        { cells: ['Abrasion and cut resistance', 'Moderate', 'High — the outer jacket is sacrificial'], highlight: true },
        { cells: ['Service life under hard use', 'Shorter', 'Longer'] },
        { cells: ['Cost', 'Lower', 'Higher'] },
        { cells: ['Typical users', 'Building occupants, hose stations, forestry crews', 'Fire brigades, industrial fire teams, refineries'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between single and double jacket fire hose?',
      answer:
        'A double jacket fire hose has two woven jackets over the liner, a single jacket hose has one. The second jacket gives more abrasion and cut resistance and a longer life under hard use, which is why fire brigades and industrial teams use it for attack lines. Single jacket hose is lighter, more compact and cheaper, and suits occupant-use cabinets, hose stations and forestry work.',
    },

    { type: 'section_head', number: '/02', title: 'How the standards classify hose.', anchor: 'standards' },
    {
      type: 'paragraph',
      html: 'Standards classify fire hose by <em>use</em> and performance, not by jacket count. In North America, NFPA 1961 — consolidated in 2024 into NFPA 1960 — covers <strong>attack hose</strong> for trained firefighters, <strong>occupant-use hose</strong> on standpipes for untrained occupants, <strong>forestry hose</strong> for wildland fires and large-diameter <strong>supply hose</strong> from the water source to the apparatus. Hose is marked with its service test pressure; the factory proof test is twice that. NFPA 1962 sets the in-service tests: at least 300 psi for attack and forestry hose and 200 psi for supply hose, or the marked service test pressure.',
    },
    {
      type: 'paragraph',
      html: 'In Europe, EN 14540 covers non-percolating lay flat hose for fixed systems — 25 to 52 mm bore, up to 15 bar — the hose used in EN 671-2 wall-mounted hose systems for occupants. In the UK, BS 6391 covers non-percolating lay flat delivery hose for firefighting, also to 15 bar. In the GCC, the rules are set by civil defence: the <strong>UAE Fire and Life Safety Code</strong> requires double-jacket, synthetic-fibre reinforced hose on Class I standpipes and dry risers — the 65 mm outlets used by Civil Defence — while occupant hose racks carry 40 mm hose. See <a href="/blog/fire-hose-requirements-uae-civil-defence">fire hose requirements in the UAE</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Which one, where.', anchor: 'choosing' },
    {
      type: 'decision_tree',
      heading: 'Single or double jacket?',
      branches: [
        { condition: 'Fire brigade or industrial attack line, dragged hard and used often?', outcome: 'Double jacket, EPDM or rubber lined.', sku: 'IH-LF-FDE' },
        { condition: 'Class I standpipe or dry riser hose in a UAE building?', outcome: 'Double jacket, to the code and Civil Defence listing.', sku: 'IH-LF-FDN' },
        { condition: 'Must it be light and compact, with oil and chemical resistance?', outcome: 'Double jacket, polyurethane lined.', sku: 'IH-LF-FDU' },
        { condition: 'Occupant-use rack, cabinet or hose box?', outcome: 'Single jacket, polyurethane lined.', sku: 'IH-LF-FRU' },
        { condition: 'Plant hose station or mill hose?', outcome: 'Single jacket, rubber lined.', sku: 'IH-LF-FSN' },
        { condition: 'Wildland or forestry work, carried over rough ground?', outcome: 'Single jacket forestry hose.', sku: 'IH-LF-FFE' },
      ],
    },
    {
      type: 'paragraph',
      html: 'In practice most industrial sites in the Gulf use both: <a href="/p/double-jacket-fire-hose-epdm-liner">double jacket EPDM-lined hose</a> on the fire water ring main and with the site fire team, and <a href="/p/rack-and-cabinet-fire-hose">single jacket cabinet hose</a> in buildings. For long storage in hot plant rooms, the liner matters as much as the jacket; for frequent dragging, the jacket matters most. Couplings are a separate choice — <a href="/p/expansion-ring-fire-hose-coupling">expansion ring couplings</a> in NST, NPSH or BAT threads, or instantaneous and Storz patterns to match the hydrants and appliances on site.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is double jacket fire hose better?', answer: 'For hard use, yes: it resists abrasion and cuts better and lasts longer. For occupant-use cabinets and carried forestry hose, single jacket is usually the better choice because it is lighter and more compact.' },
        { question: 'Does double jacket hose carry more pressure?', answer: 'The second jacket adds strength and protection, but the rating depends on the specific hose. Check the marked service test pressure, or the standard it is made to.' },
        { question: 'What fire hose does the UAE code require for dry risers?', answer: 'The UAE Fire and Life Safety Code calls for double-jacket, synthetic-fibre reinforced hose on Class I standpipes and dry risers, approved and listed by Civil Defence.' },
        { question: 'What is occupant-use hose?', answer: 'Hose kept in cabinets or on racks for building occupants to use before the fire service arrives — usually single jacket and light. NFPA 1962 sets its own inspection and test intervals.' },
        { question: 'Do these hoses carry an approval?', answer: 'No approval is published for these lines. Tell us the standard and authority listing you need and we will confirm what can be supplied against it.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Single and double jacket fire hose',
      skus: ['IH-LF-FDE', 'IH-LF-FDN', 'IH-LF-FDU', 'IH-LF-FSN', 'IH-LF-FSU', 'IH-LF-FRU', 'IH-LF-FFE', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'jacketed-fire-hoses',
      label: 'Jacketed fire hoses',
      blurb: 'Single and double jacket fire hose with EPDM, natural rubber or polyurethane liners.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Fire hose supply to Saudi Arabia',
      blurb: 'Fire hose and couplings for Saudi industrial sites and buildings.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'qatar',
      label: 'Fire hose supply to Qatar',
      blurb: 'Fire hose for Qatar facilities, quoted against QCDD-accepted standards.',
    },
    {
      type: 'related_articles',
      slugs: ['forestry-fire-hose-guide', 'fire-hose-standards-en-14540-bs-6391-nfpa', 'fire-hose-liner-materials', 'fire-hose-requirements-uae-civil-defence', 'fire-hose-cabinet-maintenance', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'NFPA 1961/1960 and 1962, EN 14540, EN 671-2, BS 6391 scopes and the UAE Fire and Life Safety Code double-jacket rule, as checked on 13 October 2026. Product construction from the Indus jacketed fire hose listings.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying fire hose?',
      body: 'Tell us the use, the bore and length, the couplings and the standard or authority listing required. We will recommend jacket and liner and confirm compliance before quoting.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
