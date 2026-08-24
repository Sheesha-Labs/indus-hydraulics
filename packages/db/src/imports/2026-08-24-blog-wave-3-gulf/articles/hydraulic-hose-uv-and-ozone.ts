import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-uv-and-ozone',
  title: 'Sun and still air: the two things that crack a cover without touching it',
  excerpt:
    'UV and ozone both attack rubber, they attack it in different places, and neither needs the hose to be doing anything. A spare on a rack in a Gulf yard is being damaged as surely as one in service.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose UV damage and ozone cracking in Gulf conditions',
  seoDescription:
    'How UV and ozone crack hydraulic hose covers, how to tell the two apart from where the cracks appear, and which cover specifications actually resist them.',
  focusKeyword: 'hydraulic hose uv damage',
  publishedAt: '2026-08-24T13:55:52.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'UV damage appears on the sun-facing side only. Ozone cracking appears on the outside of bends, wherever the rubber is stretched.',
        'Neither needs the hose to be pressurised, moving or even fitted.',
        'Cover specification matters here: some of the grades we stock are specified weather-resistant and some only abrasion-resistant.',
        'A cracked cover on a wire hose is a corrosion entry point, which in coastal air is the more serious half of the problem.',
        'Storage practice is where most of the avoidable damage happens — tight coils, open racks, direct light.',
      ],
    },
    {
      type: 'lead',
      html: 'Both of these are slow, neither is dramatic, and both are routinely written off as a hose simply looking old. In a climate with this much sunlight they are a real component of hose life, and one of them is doing damage to stock that has never been fitted to anything.',
    },

    { type: 'section_head', number: '/01', title: 'Telling them apart.', anchor: 'telling-apart' },
    {
      type: 'comparison_table',
      caption: 'Same symptom, different distribution',
      columns: ['Property', 'UV', 'Ozone'],
      rows: [
        { cells: ['Where the cracks are', 'The side facing the sun', 'The outside of every bend'], highlight: true },
        { cells: ['Needs sunlight', 'Yes', 'No'] },
        { cells: ['Needs the rubber stretched', 'No', 'Yes — that is the mechanism'] },
        { cells: ['Affects stored hose', 'If stored in light', 'Yes, especially coiled tight'] },
        { cells: ['Appearance', 'Fading and surface chalking, then crazing', 'Fine cracks perpendicular to the stretch'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Does sunlight damage hydraulic hose?',
      answer:
        'Yes. UV degrades the cover compound on the exposed side, producing fading, surface chalking and eventually fine cracks. It is a surface effect rather than a structural one, but on a wire-reinforced hose every crack is a route for moisture to reach the reinforcement, which is what actually ends the hose.',
    },

    { type: 'section_head', number: '/02', title: 'Ozone is the one that gets stock.', anchor: 'ozone-stock' },
    {
      type: 'paragraph',
      html: 'Ozone attacks rubber that is held in tension, and it needs no light and no heat. A hose coiled tightly on a rack has its outer surface stretched for the entire time it sits there, which is why <strong>spares can be cracked before they are ever fitted</strong> and why the cracks are on the outside of the coil.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Storage rules that actually matter.',
      body: 'Coil generously rather than tightly, or lay assemblies flat. Keep them out of direct sunlight and away from equipment that generates ozone — electric motors and welding sets both do. Rotate stock so the oldest assembly is fitted first. None of this costs anything and all of it is routinely ignored.',
    },

    { type: 'section_head', number: '/03', title: 'Cover specification is a real choice.', anchor: 'cover-spec' },
    {
      type: 'paragraph',
      html: 'Covers across the grades we stock are specified differently — some abrasion-resistant, some weather-resistant, several both, and some carrying an MSHA acceptance. <strong>Those words are the specification, not marketing.</strong> A hose chosen for abrasion resistance and put in an exposed static run has been chosen against the wrong hazard.',
    },
    {
      type: 'paragraph',
      html: 'Where a run is fully exposed and does not rub on anything, weather resistance is what matters. Where it rubs and is shaded, abrasion resistance is. Where it does both — which is most of a working machine — the cover needs to carry both, and several of ours do.',
    },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Sleeves and guards', blurb: 'Shade an exposed run as well as protecting it.' },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Cover specifications listed on every product page.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How long does a hose last in direct UAE sun?', answer: 'There is no single figure — it depends on the cover compound, whether the hose is also hot, and whether it is under tension. What is reliable is the direction: an exposed run ages faster than a shaded one in the same machine, which is why the fix is usually shade rather than a different hose.' },
        { question: 'Is a sleeve enough to protect against UV?', answer: 'Yes, for the length it covers. A sleeve fitted for abrasion is doing double duty, and on a fully exposed run it is often the cheapest available improvement.' },
        { question: 'Our spares crack in storage. Are they still usable?', answer: 'A cracked cover on a wire-reinforced assembly should not be fitted — the reinforcement is exposed from the moment it goes into service. Fix the storage and treat the cracked stock as consumed.' },
        { question: 'Does hose colour matter?', answer: 'Not in any way you can select on. Cover compounds are formulated for their environment and the colour follows from the compound, not the other way round. Choose on the stated cover specification.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Cover specifications from the product specifications for the grades we stock.',
    },
    { type: 'cta_block', heading: 'Hoses cracking on exposed runs?', body: 'Tell us where they sit. Usually the answer is shade or a sleeve; sometimes it is a cover specified for weather rather than abrasion.', quoteLabel: 'Ask about an exposed run' },
  ],
}

export default ARTICLE
