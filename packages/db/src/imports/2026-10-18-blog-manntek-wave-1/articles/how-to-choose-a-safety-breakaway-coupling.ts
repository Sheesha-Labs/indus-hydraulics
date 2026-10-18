import type { BlogArticleSeed } from '../shared'

/**
 * Choosing a safety breakaway coupling. Checked 2026-10-18 against manntek.se SBC, CBC and PERC pages and the
 * configurator: weakest link, breaking bolts at a defined tensile force, industrial 0–90° to one fixed point,
 * marine axial only between hose strings, SBC-C cable release for high pressure on weak piping, breaking load
 * calculated per installation, reset in minutes without special tools, both valves close, DN 25–300 (SBC),
 * DN 25–200 (CBC), PERC release on ESD signal or manual override (high).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-choose-a-safety-breakaway-coupling',
  title: 'How to choose a safety breakaway coupling: breaking bolt, cable release, industrial or marine',
  excerpt:
    'A safety breakaway coupling is the planned weak link in a hose line: when a truck drives off or a vessel moves, it separates and both halves close before the hose or arm is torn off. The three types, how to tell industrial from marine, how the breaking load is set, and where powered release takes over.',
  categorySlug: 'safety',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Choose a Safety Breakaway Coupling: Types & Sizing',
  seoDescription:
    'Safety breakaway couplings: breaking-bolt industrial (0–90°) vs marine (axial), cable release for weak piping, how the breaking load is set, reset after release, and cryogenic and powered versions.',
  focusKeyword: 'safety breakaway coupling',
  publishedAt: '2026-10-18T11:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A breakaway coupling separates under excess pull and closes the valves in both halves, so the spill is limited to the volume between them.',
        'Industrial breaking-bolt types release at any angle from 0 to 90° and are fixed to one point; marine types release on straight pull only and sit between two hose strings.',
        'Cable-release types suit lines at high pressure on piping too weak to take the force that breaks bolts.',
        'The breaking load is calculated for the installation, so the coupling lets go before the hose, arm or manifold is overloaded.',
        'For LNG bunkering, cryogenic breakaways and powered emergency release couplings (PERC) take the same role at -196 °C.',
      ],
    },
    {
      type: 'lead',
      html: 'Drive-aways and pull-aways are among the most common causes of damage at loading points: a truck leaves with the hose still connected, or a vessel moves on its moorings. Without a weak link, the force goes into the hose, the loading arm or the tank nozzle, and the product comes out wherever the line fails. A safety breakaway coupling decides where the line fails, and makes that point close itself.',
    },

    { type: 'section_head', number: '/01', title: 'The three types.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Safety breakaway coupling types (MannTek SBC range)',
      columns: ['Feature', 'Breaking bolt, industrial', 'Breaking bolt, marine', 'Cable release (SBC-C)'],
      rows: [
        { cells: ['Releases', 'At a set pull, any angle 0–90°', 'At a set pull, straight (axial) only', 'When the release cable is pulled'] },
        { cells: ['Installed', 'To at least one fixed point', 'Between two hose strings', 'With the cable anchored to a fixed point'], highlight: true },
        { cells: ['Typical use', 'Tank trucks, loading arms, terminals', 'Ship-to-shore, ship-to-ship hose', 'High operating pressure on weak piping'] },
        { cells: ['Sizes (MannTek)', 'DN 25 to DN 300', 'DN 25 to DN 300', 'DN 50 to DN 150'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between an industrial and a marine breakaway coupling?',
      answer:
        'An industrial breakaway releases when the pull reaches its set force at any angle from 0 to 90°, so it is fixed to one point such as a truck or loading arm. A marine breakaway releases only on straight, axial pull and will not release under an angular pull, so it is installed between two strings of hose, as in ship-to-shore transfer.',
    },

    { type: 'section_head', number: '/02', title: 'Setting the breaking load.', anchor: 'load' },
    {
      type: 'paragraph',
      html: 'The breaking load is not a catalogue number to pick from a list. MannTek calculates it for each installation from the line and the equipment it protects: the coupling must hold through normal handling and side load, and let go before the weakest item downstream is overloaded. To quote one, we need the hose size and length, the operating pressure, the medium, and a sketch of how the line is fixed. After a release, the MannTek SBC can be reset in minutes without special tools, with a new set of breaking bolts.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Wrong type, no protection.',
      body: 'A marine breakaway fixed to a truck may never see a straight pull and may not release. An industrial breakaway between two hose strings may release on a normal swing. Match the type to how the line is installed.',
    },

    { type: 'section_head', number: '/03', title: 'Cryogenic and powered release.', anchor: 'lng' },
    {
      type: 'paragraph',
      html: 'LNG and other cryogenic liquids need breakaways built for -196 °C: MannTek’s CBC comes in breaking-bolt (DN 25 to DN 200) and cable-release versions. In LNG bunkering the release is often powered: the PERC releases on an emergency shutdown signal or by manual override, and a vessel separation device triggers the alarm and shutdown stages as the ships move apart. See <a href="/blog/lng-bunkering-couplings-iso-21593">LNG bunkering couplings</a> for how those parts work together.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Where should a breakaway coupling go?', answer: 'Where a vehicle, vessel or arm can move away while still connected: at the truck, on the loading arm, or between two hose strings in marine transfer.' },
        { question: 'Does it stop all spillage?', answer: 'Both halves close their valves as they separate, so the loss is limited to the small volume between the valves.' },
        { question: 'How is the breaking load chosen?', answer: 'MannTek calculates it for the installation. Send the hose size and length, pressure, medium and how the line is fixed.' },
        { question: 'Can it be reused?', answer: 'Yes. The MannTek SBC resets in minutes without special tools, with new breaking bolts, once the cause is cleared.' },
        { question: 'When is cable release better?', answer: 'Where the line runs at high pressure on piping that cannot take the pull needed to break bolts.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Breakaway couplings',
      skus: ['IH-MNT-SBC', 'IH-MNT-SBCC', 'IH-MNT-CBC', 'IH-MNT-CBCC', 'IH-MNT-PERC'],
    },
    {
      type: 'category_link',
      slug: 'breakaway-couplings',
      label: 'Safety breakaway couplings',
      blurb: 'Breaking-bolt and cable-release types, DN 25 to DN 300.',
    },
    {
      type: 'category_link',
      slug: 'lng-cryogenic-couplings',
      label: 'LNG and cryogenic couplings',
      blurb: 'Dry cryogenic couplings, cryogenic breakaways and PERC.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'lng-future-fuels',
      label: 'LNG and future fuels',
      blurb: 'The full MannTek bunkering range on one page.',
    },
    {
      type: 'related_articles',
      slugs: ['tanker-loading-and-vapour-recovery-hose', 'cryogenic-transfer-hose', 'industrial-hose-couplings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-18',
      note: 'Breakaway types, installation rules, sizes and reset from MannTek’s SBC, CBC and PERC pages and configurator.',
    },
    {
      type: 'cta_block',
      heading: 'Protecting a loading point?',
      body: 'Send the hose size and length, pressure, medium and how the line is fixed. We will propose the type and have MannTek calculate the breaking load.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
