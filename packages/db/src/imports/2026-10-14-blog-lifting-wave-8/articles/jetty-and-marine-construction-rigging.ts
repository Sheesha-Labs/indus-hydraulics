import type { BlogArticleSeed } from '../shared'

/**
 * Rigging for jetty, quay and marine construction. Draws on facts already verified in earlier waves
 * (stainless vs galvanised in the Gulf; DIN 82101 scope; bolt-type shackles for long-term rigging;
 * screw pin mousing) and live listings. No unverified corrosion rates or standards claimed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'jetty-and-marine-construction-rigging',
  title: 'Rigging for jetty and marine construction: what survives salt water, tides and barges',
  excerpt:
    'Marine works are hard on rigging: splash-zone corrosion, wet slings, barge motion, long-term mooring and lashing. Which hardware to use where — galvanised or stainless, screw pin or bolt type, wire rope or synthetic — how to protect it, and how marine and shipyard standards such as DIN 82101 fit in.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Jetty and Marine Construction Rigging: Hardware Guide',
  seoDescription:
    'Rigging for jetty, quay and marine construction in the Gulf: galvanised vs stainless hardware, bolt-type shackles and moused pins, wire rope vs synthetic slings in salt water, lashing on barges, DIN 82101 shackles and inspection after immersion.',
  focusKeyword: 'marine rigging hardware',
  publishedAt: '2026-10-14T10:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Hot-dip galvanised carbon steel is the standard for marine construction rigging; stainless is chosen for corrosion where the rating and price allow, not for strength.',
        'Use bolt-type shackles — or mouse screw pins — wherever rigging stays in place, moves with the tide or works on a barge.',
        'Rinse, dry and inspect rigging after immersion; salt and silt hide damage.',
        'Barge and pontoon loads need lashing, not just lifting gear: chain, binders and rated lashing points.',
        'Shipyard and marine drawings often call for DIN 82101 shackles — order to the drawing.',
      ],
    },
    {
      type: 'lead',
      html: 'Building a jetty, quay wall or marine outfall puts rigging in the worst environment on any site: wet, salty, abrasive, and moving. Piles and precast units are lifted from barges that pitch, lines are left rigged across a tide, and slings come out of the water carrying sand and salt. Hardware that would last years on a dry site can be rejected in months. This guide covers what to specify for marine works and how to keep it in service.',
    },

    { type: 'section_head', number: '/01', title: 'Galvanised or stainless.', anchor: 'material' },
    {
      type: 'paragraph',
      html: 'For the heavy lifting on a marine job — piles, precast, steel — hot-dip galvanised carbon and alloy hardware is the norm: it is strong, rated and economical, and the zinc protects the steel through the splash zone. Stainless is the choice for small fittings that stay in salt water or salt air for years — handrail wires, mooring fittings, fixtures — but its ratings vary by maker and casting, and it costs more for the same load. Our guide to <a href="/blog/stainless-vs-galvanized-rigging-gulf">stainless vs galvanised rigging in the Gulf</a> covers the trade-off, including galvanic corrosion where the two meet.',
    },
    {
      type: 'direct_answer',
      question: 'What rigging hardware is best for marine construction?',
      answer:
        'Hot-dip galvanised carbon or alloy hardware for lifting — rated, marked and certified — with bolt-type shackles or moused screw pins wherever rigging stays in place or moves with a barge. Use stainless for small fixed fittings in permanent salt exposure, and rinse, dry and inspect all rigging after immersion.',
    },

    { type: 'section_head', number: '/02', title: 'Pins that cannot back out.', anchor: 'pins' },
    {
      type: 'paragraph',
      html: 'Barge motion, wave action and tidal movement are exactly the conditions in which a screw pin can rotate and back out. Use <a href="/p/bolt-type-anchor-shackle-g-2130-pattern">bolt-type shackles</a> — bolt, nut and cotter — for anything left rigged, and mouse screw pins with wire where a screw-pin shackle must be used. For heavy marine connections, <a href="/p/wide-body-sling-shackle-safety-pin">wide-body sling shackles</a> protect large slings on the bow. See <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Slings in salt water.', anchor: 'slings' },
    {
      type: 'comparison_table',
      caption: 'Slings for marine works',
      columns: ['Sling', 'Strengths', 'Watch for'],
      rows: [
        { cells: ['Galvanised wire rope', 'Abrasion resistance, heavy loads, long life with care', 'Internal corrosion and broken wires; lubricate and inspect'] },
        { cells: ['Chain (Grade 80/100)', 'Toughness, abrasion, easy to inspect', 'Weight; corrosion pitting at links'] },
        { cells: ['Polyester round and webbing', 'Light, non-marking, unaffected by salt water', 'Cuts on pile edges and barge decks; UV ageing'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Lashing on barges and pontoons.', anchor: 'lashing' },
    {
      type: 'paragraph',
      html: 'Loads carried on barges — piles, precast, plant — must be lashed against the barge’s motion, which is a job for chain and binders or rated lashing hardware, not for whatever slings are spare. Use rated chain, <a href="/blog/lever-vs-ratchet-load-binder">load binders</a>, lashing points and turnbuckles such as the <a href="/p/hamburger-lashing-turnbuckle">Hamburger lashing turnbuckle</a>, and check lashings as the tide and swell change. See <a href="/blog/ratchet-strap-vs-chain-and-binder">ratchet strap vs chain and binder</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Marine standards on the drawing.', anchor: 'standards' },
    {
      type: 'paragraph',
      html: 'Marine and shipyard drawings often name <a href="/p/shackle-din-82101-form-a-b-and-c-pattern-galvanized">DIN 82101 shackles</a> (a German shipbuilding standard for lifting, towing and lashing) or European and BS patterns rather than US ones. Order to the drawing — see <a href="/blog/bs-3032-din-82101-as-2741-shackles">BS 3032, DIN 82101 and AS 2741 shackles</a>. For mooring, see <a href="/blog/types-of-mooring-bollards">mooring bollards</a> and <a href="/blog/anchor-chain-grades-u1-u2-u3">anchor chain grades</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Inspect after immersion.',
      body: 'Rinse rigging with fresh water after it has been in the sea, dry it before storage, and inspect it before reuse: corrosion, pitting, broken wires and grit in threads are all reasons to quarantine an item until a competent person has examined it.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is stainless steel rigging stronger than galvanised?', answer: 'No. Stainless is chosen for corrosion resistance; its ratings vary by maker and casting and are often lower or more expensive for the same load. Compare the WLL on each listing.' },
        { question: 'Should I use screw pin shackles on a barge?', answer: 'Prefer bolt-type shackles for anything left rigged or moving with the barge; if a screw pin must be used, mouse it.' },
        { question: 'Can polyester slings be used in salt water?', answer: 'Yes, polyester is not affected by salt water, but protect it from sharp edges and rinse and dry it after use.' },
        { question: 'What is a DIN 82101 shackle?', answer: 'A dee shackle to the German shipbuilding standard, used for lifting, towing and lashing on ships and in yards.' },
        { question: 'How often should marine rigging be inspected?', answer: 'Before each use and at the periodic intervals your site and authority require — and always after immersion.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For marine works',
      skus: ['IH-LR-SH-G2130', 'IH-LR-SH-WBSSSP', 'IH-LR-SH-SD82101FB', 'IH-LR-SH-SSA', 'IH-LR-TB-HLT', 'IH-LR-WS-SWG', 'IH-LR-SY-PRSE'],
    },
    {
      type: 'category_link',
      slug: 'load-securing-rope-marine',
      label: 'Load securing, rope and marine',
      blurb: 'Lashing, fibre rope, anchors, mooring and fenders.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'marine',
      label: 'Marine and offshore',
      blurb: 'Deck, quay and splash-zone hardware.',
    },
    {
      type: 'related_articles',
      slugs: ['stainless-vs-galvanized-rigging-gulf', 'bs-3032-din-82101-as-2741-shackles', 'how-to-rig-a-shackle-correctly', 'types-of-mooring-bollards', 'ratchet-strap-vs-chain-and-binder', 'site-mobilisation-rigging-kit'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'General marine rigging practice; product facts from the live Indus listings.',
    },
    {
      type: 'cta_block',
      heading: 'Building in the water?',
      body: 'Send the loads, sling types and finishes you need. We will quote galvanised and stainless rigging from stock with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
