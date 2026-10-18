import type { BlogArticleSeed } from '../shared'

/**
 * When to take lifting gear out of service — one consolidated checklist.
 *
 * Sources checked 2026-10-01: OSHA 29 CFR 1910.184 (c)(14), (d), (e)(3),
 * (e)(6), (e)(9), (f)(5), (i)(9); Thiele Grade 80/100 operating instructions
 * (B11082-F, 2025) and chain gauge note; Kito Crosby chain, shackle and hook
 * warnings (2025) incl. Gunnebo Grade 10 text; Kito Crosby "A Guide to
 * Shackles" (2025); RUD ICE user manual; Dolezych webbing/round sling
 * instructions (04/2026); ASME B30.9 as quoted by Kito Crosby. Thimble, block
 * and turnbuckle criteria were verified for earlier articles (LEEA COPSULE,
 * Crosby blocks warnings, Van Beest turnbuckle instructions).
 * Chain elongation limits differ between makers (5% on pitch; 3% per link /
 * 8% on pitch by another's gauge) — the copy says so rather than picking one.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-gear-rejection-criteria',
  title: 'When to take lifting gear out of service: rejection criteria for slings, chain, shackles and hooks',
  excerpt:
    'A sling with ten broken wires in one lay, a chain link worn by a tenth, a hook opened by 15%, a polyester sling with a cut deeper than a tenth of its width, or any item with no readable tag — each comes out of service. Here are the discard criteria for every common piece of lifting gear, in one place.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting gear rejection criteria: slings, chain, shackles and hooks',
  seoDescription:
    'When to take lifting gear out of service: discard criteria for chain, wire rope and synthetic slings, shackles and hooks, from OSHA 1910.184 and manufacturers’ instructions.',
  focusKeyword: 'lifting gear rejection criteria',
  publishedAt: '2026-10-01T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Any item with a missing or unreadable ID tag or marking comes out of service, whatever its condition.',
        'Chain: remove when wear reduces a link’s mean diameter by more than 10%, when links stretch beyond the maker’s limit, or when any link is bent, cracked or heat-damaged.',
        'Wire rope slings: remove at ten randomly distributed broken wires in one rope lay, or five in one strand in one lay — or for kinking, crushing, birdcaging, heat damage or corrosion.',
        'Synthetic slings: remove for cuts, burns, melting, broken stitching, or any exposed core on a round sling. One maker allows no cut deeper than 10% of the sling’s width.',
        'Hooks: remove when the throat has opened more than 15% or the hook is twisted more than 10° — US regulation; makers often set tighter limits.',
      ],
    },
    {
      type: 'lead',
      html: 'Lifting gear does not usually fail without warning. It stretches, opens up, wears, cuts or loses its tag first. The criteria below are the warnings, written down — by the US regulator and by the makers of the gear. Where a maker sets a tighter limit than the regulation, work to the maker’s.',
    },

    { type: 'section_head', number: '/01', title: 'Rules for every item.', anchor: 'every-item' },
    {
      type: 'prose',
      html: '<ul><li><strong>No readable identification</strong> — tag, stamp or label missing or illegible: out of service.</li><li><strong>Heat damage</strong> — discolouration, weld spatter, or exposure beyond the rated temperature.</li><li><strong>Cracks, nicks, gouges</strong> or deep corrosion pitting.</li><li><strong>Bent, twisted or deformed</strong> parts, or any sign of modification, welding or reshaping.</li><li><strong>Suspected overload</strong> — quarantine it until it has been examined. In Abu Dhabi this is a requirement of the lifting code of practice.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Quarantine, do not just set aside.',
      body: 'Gear taken out of service should be tagged “Do not use” and kept apart, so it cannot drift back into the store. It goes back into use only when a qualified person has examined it and approved it — or it is destroyed.',
    },
    {
      type: 'paragraph',
      html: '<strong>How often to look.</strong> Slings are checked by a competent person before use each day, and given a thorough periodic examination at intervals that, in US practice, must never exceed 12 months — and in the UAE are typically six months for lifting accessories. See our <a href="/blog/lifting-equipment-inspection-uae">guide to lifting inspection in the UAE</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Chain slings.', anchor: 'chain-slings' },
    {
      type: 'comparison_table',
      caption: 'Grade 80 and Grade 100 chain slings — remove from service when',
      columns: ['Check', 'Remove when'],
      rows: [
        { cells: ['Wear', 'Mean link diameter (two measurements at right angles) reduced by more than 10%'], highlight: true },
        { cells: ['Stretch', 'Link or pitch elongated beyond the maker’s limit — one maker sets 5% on pitch; another’s gauge sets 3% on a single link and 8% on pitch'] },
        { cells: ['Shape', 'Any link bent, twisted or deformed, or links that no longer hinge freely'] },
        { cells: ['Damage', 'Cracks, cuts, notches, gouges or weld spatter'] },
        { cells: ['Heat', 'Exposed above the maker’s temperature limit. US rules: derate above 600 °F (316 °C); remove permanently above 1,000 °F (538 °C)'] },
        { cells: ['Fittings', 'Master links, connectors or hooks cracked, deformed or worn beyond their limits'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Measure wear with calipers across the link where it rubs, and stretch with the maker’s gauge or over a set number of links. Because the stretch limit differs between makers, check it against the instructions for the sling in use.',
    },

    { type: 'section_head', number: '/03', title: 'Wire rope slings.', anchor: 'wire-rope-slings' },
    {
      type: 'prose',
      html: '<p>Under US regulation (29 CFR 1910.184), remove a wire rope sling for any of these:</p><ul><li>Ten randomly distributed broken wires in one rope lay, or five broken wires in one strand in one rope lay.</li><li>Wear or scraping of one-third of the original diameter of the outside wires.</li><li>Kinking, crushing, birdcaging or any other damage that distorts the rope.</li><li>Heat damage.</li><li>End attachments that are cracked, deformed or worn.</li><li>Hooks opened more than 15% or twisted more than 10°.</li><li>Corrosion of the rope or the end attachments.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'A rope lay is the length along the rope in which one strand makes a full turn around it. Count broken wires over that length, not over the whole sling.',
    },

    { type: 'section_head', number: '/04', title: 'Webbing and round slings.', anchor: 'synthetic-slings' },
    {
      type: 'comparison_table',
      caption: 'Polyester webbing and round slings — remove from service when',
      columns: ['Check', 'Remove when'],
      rows: [
        { cells: ['Label', 'Missing or illegible'], highlight: true },
        { cells: ['Cuts', 'Any cut, tear, snag or puncture; one maker allows no damage beyond 10% of width — 5 mm on a 50 mm sling, with cuts on both edges added together'] },
        { cells: ['Stitching', 'Load-bearing seams broken or worn'] },
        { cells: ['Heat', 'Melting, charring, or glossy fused fibres'] },
        { cells: ['Chemicals', 'Acid or caustic burns; fibres that flake or rub out'] },
        { cells: ['Round sling cover', 'Damaged so that the load-bearing core yarns can be seen'], highlight: true },
        { cells: ['Fittings', 'Distorted; a hook opened more than 10% or worn more than 5% in the bowl'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Damage inside a round sling cannot be repaired. Once the core is exposed or damaged, the sling is scrap.',
    },

    { type: 'section_head', number: '/05', title: 'Shackles.', anchor: 'shackles' },
    {
      type: 'prose',
      html: '<ul><li>The pin will not engage fully — it may be bent, its thread damaged or the holes out of line.</li><li>Wear or metal loss of more than 10% of the original dimension anywhere.</li><li>Thread damage of 20% or more.</li><li>Bent or deformed body or pin; spread or twisted ears.</li><li>Heat damage, weld spatter, cracks, nicks or gouges; excessive corrosion or pitting.</li><li>Missing or illegible WLL and ID marking, or any sign of modification.</li></ul><p>Never weld, heat or reshape a shackle to put it back into service. See our <a href="/blog/types-of-shackles">guide to shackle types</a>.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Hooks.', anchor: 'hooks' },
    {
      type: 'comparison_table',
      caption: 'Hooks — remove from service when',
      columns: ['Check', 'US regulation (OSHA)', 'Makers’ limits'],
      rows: [
        { cells: ['Throat opening', 'Opened more than 15%', 'Any increase, by some makers; 10% by others'], highlight: true },
        { cells: ['Twist or bent tip', 'Twisted more than 10°', 'Tip bent more than 10° out of plane'] },
        { cells: ['Wear', '—', '5–10% of the original section, depending on where'] },
        { cells: ['Threads (shank hooks)', '—', 'Corroded over more than 20% of the nut’s engaged length'] },
        { cells: ['Cracks', 'Remove', 'Remove'] },
      ],
    },

    { type: 'section_head', number: '/07', title: 'Everything else.', anchor: 'other-gear' },
    {
      type: 'prose',
      html: '<ul><li><strong>Thimbles:</strong> damaged, worn, distorted, or opened noticeably at the throat — see our <a href="/blog/wire-rope-thimble-types">thimble guide</a>.</li><li><strong>Blocks:</strong> a sheave that wobbles; cracked or displaced bushings; hooks or shackles worn more than 10% or deformed more than 5% — see our <a href="/blog/snatch-block-vs-pulley-block">block guide</a>.</li><li><strong>Turnbuckles:</strong> illegible markings, damaged threads, missing locking parts, or any distortion, nick or crack — see our <a href="/blog/turnbuckle-types">turnbuckle guide</a>.</li><li><strong>Eye bolts:</strong> bent shank or eye, damaged threads, or a collar that will not seat flat — see our <a href="/blog/eye-bolt-types-and-angled-loads">eye bolt guide</a>.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Before every lift',
      intro: 'Five questions that catch most rejectable gear.',
      branches: [
        { condition: 'Can you read the tag or marking?', outcome: 'If not, it does not lift.' },
        { condition: 'Is anything bent, twisted, stretched or opened up?', outcome: 'Quarantine it for examination.' },
        { condition: 'Any cuts, broken wires, burns or exposed core?', outcome: 'Count and measure against the limits above; if in doubt, take it out.' },
        { condition: 'Is it inside its examination date?', outcome: 'Check the register or certificate.' },
        { condition: 'Could it have been overloaded or overheated?', outcome: 'Quarantine it until examined.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How many broken wires before a wire rope sling is scrapped?',
          answer:
            'Under US regulation, ten randomly distributed broken wires in one rope lay, or five broken wires in one strand in one rope lay. Kinking, crushing, birdcaging, heat damage and corrosion are each grounds on their own.',
        },
        {
          question: 'How much wear is allowed on a chain sling?',
          answer:
            'Makers set the limit at a 10% reduction of the link’s mean diameter, measured in two directions at right angles. Stretch limits differ between makers, so check the instructions for your sling.',
        },
        {
          question: 'When is a hook scrapped?',
          answer:
            'When its throat has opened more than 15% or it is twisted more than 10° under US rules — and earlier under many makers’ limits, some of which allow no measurable opening at all. Cracks and worn sections are also grounds for removal.',
        },
        {
          question: 'Can a round sling with a torn cover be used?',
          answer: 'Not if the core yarns are visible. Damage to a round sling’s core cannot be repaired, so it is scrapped.',
        },
        {
          question: 'Can rejected lifting gear be repaired?',
          answer:
            'Some can, by the maker or a competent repairer to the maker’s procedure — for example, replacing a damaged component in a chain sling. Never weld, heat or reshape a shackle, and never repair a round sling’s core.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting & rigging equipment',
      blurb: 'Replacement slings, shackles, hooks and chain, with the manufacturer’s test certificate.',
    },
    {
      type: 'related_articles',
      slugs: ['lifting-gear-test-certificate', 'lifting-equipment-inspection-uae', 'lifting-hook-types', 'types-of-lifting-slings', 'chain-grades-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Criteria from OSHA 29 CFR 1910.184 and published manufacturer instructions (Kito Crosby, Thiele, RUD, Gunnebo, Dolezych). The maker’s instructions for the specific item govern where they are stricter.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing rejected gear?',
      body: 'Send the inspector’s report or the list of rejected items. We will quote like-for-like replacements from stock in Dubai, each with its manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
