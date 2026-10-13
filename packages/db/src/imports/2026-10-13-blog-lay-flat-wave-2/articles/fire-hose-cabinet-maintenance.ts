import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Fire hose cabinet inspection, testing and replacement. NFPA 1962 intervals and test pressures
 * from NFPA's own public-input text (2016–2018 cycle); UAE contractor rule from the UAE Fire and
 * Life Safety Code. EN 671-3 is named as the European maintenance standard without quoting
 * intervals (not verified). Product facts from IH-LF-FRU / FSU / FSN / CER.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fire-hose-cabinet-maintenance',
  title: 'Fire hose cabinet maintenance: inspection, testing and when to replace the hose',
  excerpt:
    'A cabinet hose can hang untouched for years and then has to work first time. What to check at each inspection, how the NFPA service test works and how often occupant-use hose is tested, what Gulf heat and dust do to a cabinet, and the signs that mean a hose should be replaced rather than re-racked.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Fire Hose Cabinet Maintenance: Inspection, Testing, Replacement',
  seoDescription:
    'How to inspect and maintain fire hose cabinets and racks: what to check, NFPA 1962 service test pressures and intervals for occupant-use hose, Gulf heat and dust, re-racking, and when to replace the hose.',
  focusKeyword: 'fire hose cabinet maintenance',
  publishedAt: '2026-10-13T17:45:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Cabinet hose fails quietly: liners harden, folds crack, couplings seize and gaskets perish while the hose hangs unused.',
        'NFPA 1962 has occupant-use hose unracked and inspected at least once a year, service tested five years after manufacture and every three years after that.',
        'Attack and forestry hose is service tested at 300 psi and supply hose at 200 psi (or the marked service test pressure) — never at proof pressure.',
        'Re-rack with the folds in new places, so the hose does not take a permanent crease.',
        'In the UAE, fire protection work is carried out by Civil Defence-approved contractors; follow the code and your authority’s maintenance rules.',
      ],
    },
    {
      type: 'lead',
      html: 'Most fire hose in buildings is never used for a fire. It hangs folded in a cabinet in a corridor, car park or plant room, through summers and years, and the only time anyone handles it is at inspection. That makes inspection the whole of its working life — and the difference between a hose that charges cleanly in an emergency and one that splits along a fold the first time it is pressurised.',
    },

    { type: 'section_head', number: '/01', title: 'What goes wrong in a cabinet.', anchor: 'failure' },
    {
      type: 'paragraph',
      html: 'Lay flat hose stored folded develops a permanent crease at every fold, and the liner cracks there first. Heat — in Gulf plant rooms, car parks and external cabinets — hardens rubber liners and gaskets. Dust and sand get into couplings and threads. Water left in a hose after a test or a false alarm rots an uncoated jacket and grows mould. And hose is borrowed: for wash-down, for a garden, for a contractor — and comes back dirty, kinked or not at all. Our article on <a href="/blog/fire-hose-liner-materials">fire hose liners</a> explains why some liners age far better than others in heat.',
    },

    { type: 'section_head', number: '/02', title: 'What to check.', anchor: 'checklist' },
    {
      type: 'prose',
      html: '<ul><li><strong>Cabinet</strong>: door opens freely, glass and signage intact, nothing stored in front of it or inside it.</li><li><strong>Hose present and complete</strong>: correct length and bore, branch pipe or nozzle attached.</li><li><strong>Jacket</strong>: no cuts, abrasion, burns, mould, staining from oil or chemicals, or soft spots.</li><li><strong>Folds</strong>: no cracking or flattening of the liner at the creases.</li><li><strong>Couplings</strong>: threads and lugs undamaged, gaskets present and supple, coupling firmly attached to the hose with no slippage.</li><li><strong>Valve</strong>: hydrant or landing valve opens and closes, does not leak, and the hand wheel is present.</li><li><strong>Records</strong>: the last test date, and the date of manufacture on the hose.</li></ul>',
    },
    {
      type: 'direct_answer',
      question: 'How often should fire hose in a cabinet be inspected and tested?',
      answer:
        'Under NFPA 1962, occupant-use hose is unracked and inspected at least once a year, and service tested five years after manufacture and every three years after that. Local codes and authorities may set different intervals; in the GCC, follow the civil defence code and your approved maintenance contractor.',
    },

    { type: 'section_head', number: '/03', title: 'The service test.', anchor: 'testing' },
    {
      type: 'figure',
      imageId: FIG['fig-hose-test'],
      captionPrefix: 'FIG. 01',
      caption: 'A service test holds the hose at its test pressure, laid straight, with the crew kept clear of the line.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'A hydrostatic <strong>service test</strong> proves that a hose in service still holds pressure. NFPA 1962 sets the test at a minimum of 300 psi for attack and forestry hose and 200 psi for supply hose — or no higher than the service test pressure marked on the hose — and occupant-use hose at its marked pressure. The hose is laid out straight and free of kinks, filled, bled of air, raised to pressure and held for three minutes, then inspected for leaks, coupling slippage and jacket damage. Field tests must <strong>never</strong> reach the factory proof pressure, which is twice the service test pressure. In Europe, EN 671-3 sets the maintenance regime for hose reels and lay flat hose systems in buildings.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Test hose safely.',
      body: 'Use a proper test pump or test manifold, keep people out of the line of the hose while it is under pressure, and never test with air. A hose that fails under water pressure drops; one that fails under air pressure whips.',
    },

    { type: 'section_head', number: '/04', title: 'Re-racking and drying.', anchor: 'reracking' },
    {
      type: 'paragraph',
      html: 'After a test or any use, drain the hose, wash off dirt and oil, and dry it fully before it goes back — a wet hose in a closed cabinet rots. When you re-rack, move the folds: fold at different points from last time, so the creases do not wear through in one place. Check the coupling gaskets, re-fit the branch pipe and close the cabinet properly.',
    },

    { type: 'section_head', number: '/05', title: 'When to replace the hose.', anchor: 'replace' },
    {
      type: 'paragraph',
      html: 'Replace rather than re-rack a hose that fails its service test, leaks or bulges, shows liner cracking at the folds, has a damaged or slipping coupling, or has been exposed to chemicals or fire. NFPA 1962 also requires hose made before July 1987 to be removed from service. A replacement for a cabinet should match the bore, length and couplings of the original and carry the approval your authority requires. Our <a href="/p/rack-and-cabinet-fire-hose">rack and cabinet fire hose</a> has a thin polyurethane liner and single jacket that fold compactly, supplied with brass couplings or to your cabinet’s pattern; <a href="/p/expansion-ring-fire-hose-coupling">expansion ring couplings</a> fit 1" to 2-1/2" hose in NST, NPSH or BAT threads.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How often is occupant-use fire hose tested?', answer: 'Under NFPA 1962: unracked and inspected at least annually, service tested five years after manufacture and every three years after that. Follow your local code if it differs.' },
        { question: 'What pressure is a fire hose service tested at?', answer: 'NFPA 1962: at least 300 psi for attack and forestry hose and 200 psi for supply hose, or the service test pressure marked on the hose; occupant-use hose at its marked pressure. Never at proof pressure.' },
        { question: 'Why does cabinet hose crack at the folds?', answer: 'Folded lay flat hose takes a permanent crease, and the liner flexes and ages fastest there. Re-rack with the folds in new places at each inspection.' },
        { question: 'Can a cabinet hose be repaired?', answer: 'Couplings and gaskets can be replaced and a damaged end cut back and re-coupled, but a hose that fails its test or has cracked liner should be replaced.' },
        { question: 'Who maintains fire hose cabinets in the UAE?', answer: 'Fire protection work in the UAE is carried out by Civil Defence-approved contractors, under the UAE Fire and Life Safety Code.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Replacement cabinet hose and couplings',
      skus: ['IH-LF-FRU', 'IH-LF-FSU', 'IH-LF-FSN', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'jacketed-fire-hoses',
      label: 'Jacketed fire hoses',
      blurb: 'Rack, cabinet and hose-station fire hose.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'bahrain',
      label: 'Fire hose supply to Bahrain',
      blurb: 'Replacement cabinet hose and couplings for Bahrain buildings and plants.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'kuwait',
      label: 'Fire hose supply to Kuwait',
      blurb: 'Fire hose for Kuwait buildings and industrial sites.',
    },
    {
      type: 'related_articles',
      slugs: ['how-to-repair-lay-flat-hose', 'fire-hose-requirements-uae-civil-defence', 'single-vs-double-jacket-fire-hose', 'fire-hose-liner-materials', 'lay-flat-hose-in-gulf-heat'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Inspection and test intervals and pressures from NFPA 1962 (2018 cycle text); UAE contractor requirement from the UAE Fire and Life Safety Code. Follow your local code and authority.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing cabinet hose?',
      body: 'Send the bore, length, couplings and cabinet count, and the approval your authority requires. We will match the hose to the cabinet and quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
