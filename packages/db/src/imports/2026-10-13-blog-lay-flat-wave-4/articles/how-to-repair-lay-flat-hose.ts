import type { BlogArticleSeed } from '../shared'

/**
 * Repairing lay flat hose: cut out and re-couple, menders for low-pressure lines, and fire hose
 * (NFPA 1962 §4.5.4 repair-and-test-or-condemn, as quoted in trade press). No claim that NFPA bans
 * patches (not found). Product facts from IH-LF couplings and IH-KC-HOSE-MENDER (no maker named).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-repair-lay-flat-hose',
  title: 'How to repair lay flat hose: cutting out, re-coupling and menders',
  excerpt:
    'A cut, a burst fold or a crushed coupling does not have to mean a new hose. Most lay flat damage is repaired by cutting out the bad section and re-coupling, or — on low-pressure lines — joining the ends with a mender. When to repair and when to scrap, how to make each repair properly, and the extra rules that apply to fire hose.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Repair Lay Flat Hose: Re-Coupling and Menders',
  seoDescription:
    'How to repair lay flat hose: assess the damage, cut out a damaged section and re-couple, join low-pressure lines with a hose mender, re-test before use, and the NFPA 1962 rules for repaired fire hose.',
  focusKeyword: 'repair lay flat hose',
  publishedAt: '2026-10-14T07:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Most lay flat damage — cuts, abrasion through the cover, a burst fold, a damaged coupling — is local, and the rest of the hose is fine.',
        'The reliable repair is to cut out the damaged section square and re-couple the two pieces.',
        'Menders join two ends on low-pressure water lines such as irrigation; they are not for pressure mains, fuel or fire hose.',
        'Test every repaired hose before it goes back into service — and fire hose must be service tested after repair.',
        'Scrap hose that is damaged along its length, has a delaminated liner, or has carried something it should not.',
      ],
    },
    {
      type: 'lead',
      html: 'Lay flat hose is usually damaged in one place: a vehicle crossed it, it was dragged over a sharp edge, a fold cracked after a season in the sun, or a coupling was crushed. Because lay flat comes in long lengths, the damage is a small fraction of the hose — and cutting it out and re-coupling turns one damaged 100 m length into two good ones. Our article on <a href="/blog/why-lay-flat-hose-fails">why lay flat hose fails</a> covers how to avoid the damage in the first place.',
    },

    { type: 'section_head', number: '/01', title: 'Repair or scrap?', anchor: 'assess' },
    {
      type: 'comparison_table',
      caption: 'Assessing lay flat hose damage',
      columns: ['Damage', 'Usually', 'How'],
      rows: [
        { cells: ['Cut or puncture in one place', 'Repair', 'Cut out and re-couple'], highlight: true },
        { cells: ['Burst or cracked fold at one point', 'Repair', 'Cut out and re-couple'] },
        { cells: ['Damaged or leaking coupling', 'Repair', 'Cut back behind the coupling and re-fit'] },
        { cells: ['Cover worn through along a long stretch', 'Scrap that stretch or the hose', 'Inspect the jacket; do not trust the rating'] },
        { cells: ['Liner separated or blistered', 'Scrap', '—'] },
        { cells: ['Chemical, fuel or fire exposure; sewage on a potable hose', 'Scrap', '—'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Can lay flat hose be repaired?',
      answer:
        'Yes, when the damage is local. Cut out the damaged section square, then either re-couple the two pieces with proper couplings — the right repair for pressure lines — or, on low-pressure water lines, join the ends with a hose mender and clamps. Test the repaired hose before putting it back into service.',
    },

    { type: 'section_head', number: '/02', title: 'Cut out and re-couple.', anchor: 'recouple' },
    {
      type: 'prose',
      html: '<ol><li><strong>Drain and clean the hose</strong> and mark the damaged area plus a margin either side.</li><li><strong>Cut square</strong> with a sharp knife or hose cutter. An angled or ragged cut will not seal or grip.</li><li><strong>Fit the coupling to each end</strong>: push the hose fully onto the shank, close the clamp halves and tighten the bolts evenly, side to side, to the torque given for the size. Match the coupling to the hose bore and wall — a clamp made for one wall thickness will not hold another.</li><li><strong>Join the two lengths</strong> with the coupling pair, or keep them as two shorter lengths.</li><li><strong>Test</strong> at working pressure, raising it gradually, and check both couplings for leaks and slippage. Re-check clamp bolts after the first pressurisation.</li></ol>',
    },
    {
      type: 'paragraph',
      html: 'For large-bore hose we supply <a href="/p/large-bore-lay-flat-grooved-coupling">grooved</a>, <a href="/p/large-bore-storz-lay-flat-coupling">Storz</a>, <a href="/p/large-bore-male-female-lay-flat-coupling">male × female</a> and <a href="/p/high-pressure-lay-flat-hose-coupling">high-pressure</a> couplings with re-attachable bolted clamps — the clamps come off and go back on, so the same coupling can be re-fitted after a repair. On small fire and lay flat hose, <a href="/p/expansion-ring-fire-hose-coupling">expansion ring couplings</a> are fitted with a hose expander. See our <a href="/blog/lay-flat-hose-couplings-guide">coupling guide</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Menders for low-pressure lines.', anchor: 'menders' },
    {
      type: 'paragraph',
      html: 'A <strong>hose mender</strong> is a short tube with a serrated tail at each end: push one cut end onto each tail, clamp both, and the line is joined. It is the quick field fix for <strong>low-pressure water lines</strong> — irrigation sub-mains, temporary discharge from small pumps — where the pressure is well within what the clamps can hold. Cut square, push the hose fully onto the serrations, fit the clamps behind the barbs, pressurise slowly and check for leaks. Our <a href="/p/hose-mender">hose menders</a> come in 1/2" to 12" in carbon steel, 304 and 316 stainless. Do not use a mender on pressure mains, fuel lines, slurry drag hose or fire hose — re-couple those properly.',
    },

    { type: 'section_head', number: '/04', title: 'Fire hose is different.', anchor: 'fire' },
    {
      type: 'paragraph',
      html: 'Fire hose has rules of its own. NFPA 1962 requires hose that fails inspection to be taken out of service and either repaired and service tested, or condemned; repaired or recoupled hose is service tested before it returns to service, and many authorities test repaired lengths individually. State rules built on NFPA 1962 — Ohio’s, for example — allow a defective section to be cut out and the length recoupled, then service tested. Follow your authority’s rules and record every repair. See <a href="/blog/fire-hose-cabinet-maintenance">fire hose cabinet maintenance</a> for test pressures.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Know what the hose carried.',
      body: 'A drinking-water hose that has been cut and re-coupled must be cleaned and disinfected before use. A hose that has carried sewage, flood water or chemicals must never be repaired into drinking-water service.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do you fix a hole in lay flat hose?', answer: 'Cut out the damaged section square and re-couple the two pieces, or on a low-pressure water line join them with a hose mender and clamps. Test before use.' },
        { question: 'Can I patch lay flat hose?', answer: 'Cutting out and re-coupling is the reliable repair. Patches are not a substitute on pressure lines.' },
        { question: 'Can fire hose be repaired?', answer: 'Yes, under NFPA 1962 hose that fails inspection can be repaired and must then be service tested before use, or it is condemned.' },
        { question: 'Can I reuse the couplings?', answer: 'Couplings with re-attachable bolted clamps can be re-fitted if the shank, clamp and seals are undamaged.' },
        { question: 'What pressure can a hose mender take?', answer: 'Menders are for low-pressure water lines. For pressure mains, fuel, slurry or fire hose, re-couple with proper couplings.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For hose repair',
      skus: ['IH-KC-HOSE-MENDER', 'IH-LF-CVG', 'IH-LF-CST', 'IH-LF-CFM', 'IH-LF-CHP', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hose-couplings',
      label: 'Lay flat hose couplings',
      blurb: 'Re-attachable couplings for re-coupling and repair.',
    },
    {
      type: 'related_articles',
      slugs: ['why-lay-flat-hose-fails', 'lay-flat-hose-couplings-guide', 'how-to-roll-and-store-lay-flat-hose', 'fire-hose-cabinet-maintenance'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Fire hose repair rules from NFPA 1962 as quoted in fire service sources. Coupling and mender facts from the Indus listings.',
    },
    {
      type: 'cta_block',
      heading: 'Repairing hose in bulk?',
      body: 'Send the hose type, bore, wall thickness and coupling pattern. We will supply couplings and menders to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
