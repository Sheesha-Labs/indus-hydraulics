import type { BlogArticleSeed } from '../shared'

/**
 * The hub article for the lifting cluster: every other lifting guide links
 * back here for the definitions.
 *
 * Every worked figure is read from our own published product tables (checked
 * against the live variants on 2026-09-28), not recalled — the WLL, MBL and
 * proof columns quoted below are the ones a reader will find on the linked
 * product pages. Standard-level claims are limited to design factors that are
 * stable and widely published; anything clause-specific is left to the
 * citation blocks and the manufacturer's certificate.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'working-load-limit-vs-breaking-strength',
  title: 'Working load limit vs breaking strength: WLL, MBL, proof load and the factor between them',
  excerpt:
    'The breaking strength of a lifting component is not a number you lift to. It is the WLL multiplied by a design factor, and that factor runs from 4:1 on alloy chain to 7:1 on polyester slings. Here is how the four ratings relate, worked through with figures from our own tables.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Working load limit vs breaking strength: WLL, MBL and proof load explained',
  seoDescription:
    'What working load limit, minimum breaking load, proof load and design factor each mean on lifting gear, how they relate, and what reduces the WLL in use.',
  focusKeyword: 'working load limit vs breaking strength',
  publishedAt: '2026-09-28T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Working load limit (WLL) is the most a new, undamaged component may carry in service, in a stated configuration. It is the only rating you plan a lift against.',
        'Minimum breaking load (MBL) is the load at which the component is allowed to fail in a destructive test. It is never a working figure.',
        'The ratio MBL ÷ WLL is the design factor. It is set per product type: 4:1 for Grade 80 and Grade 100 chain slings, 5:1 for wire rope slings, 5:1 to 6:1 for shackles, 7:1 for polyester slings under EN 1492.',
        'Proof load sits between the two. Each item is loaded to it without permanent deformation, as evidence of manufacture — typically 2 to 2.5 times the WLL.',
        'The WLL assumes a vertical, in-line, static load. Sling angle, choke hitches, side loading, heat and wear all reduce what the component can safely carry.',
      ],
    },
    {
      type: 'lead',
      html: 'Every piece of lifting gear carries several load ratings, and they are not interchangeable. Only one of them — the working load limit — is a number you are allowed to lift to. The others exist to prove the first one is honest. Mixing them up is how a 4-tonne chain ends up carrying 16 tonnes on paper.',
    },

    { type: 'section_head', number: '/01', title: 'Four numbers, one component.', anchor: 'four-numbers' },
    {
      type: 'comparison_table',
      caption: 'The ratings on a lifting component, and what each is for',
      columns: ['Rating', 'What it is', 'Use it for'],
      rows: [
        {
          cells: [
            'Working load limit (WLL)',
            'The maximum load a new, undamaged item may carry in service, in the configuration stated by the manufacturer.',
            'Planning and rigging every lift.',
          ],
          highlight: true,
        },
        {
          cells: [
            'Minimum breaking load (MBL)',
            'The lowest load at which a sample of the product is permitted to fail in a destructive test. Also called minimum breaking force or ultimate load.',
            'Nothing on site. It exists to fix the design factor.',
          ],
        },
        {
          cells: [
            'Proof load',
            'The load each item, or a sample from each batch, is tested to without taking a permanent set.',
            'Evidence of manufacture — it is what the test certificate records.',
          ],
        },
        {
          cells: [
            'Design factor',
            'MBL divided by WLL. Sometimes called the safety factor.',
            'Understanding why two items of similar strength carry different WLLs.',
          ],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between working load limit and breaking strength?',
      answer:
        'Breaking strength is the load at which a component is allowed to fail in a test. Working load limit is the most it may carry in service, and it is the breaking strength divided by a design factor set for that product type — 4 for alloy chain, 5 for wire rope slings, 7 for polyester slings under EN 1492. You lift to the WLL, never to the breaking strength.',
    },
    {
      type: 'paragraph',
      html: 'You will also see <strong>SWL</strong>, safe working load. It is the older term, and it has been used both as a synonym for WLL and for a lower figure a competent person assigns to an item in a particular use. European and ISO standards now use WLL for the manufacturer’s rating. When a tag or certificate says SWL, ask which of the two it means.',
    },

    { type: 'section_head', number: '/02', title: 'The arithmetic, with our own tables.', anchor: 'the-arithmetic' },
    {
      type: 'paragraph',
      html: 'The relationship is easiest to see in real figures. These rows are copied from the size tables on our product pages, and the last column is simply MBL divided by WLL. One tonne of load is 9.81 kN, which is the only conversion needed to check them.',
    },
    {
      type: 'comparison_table',
      caption: 'WLL, MBL and proof load on five components we stock',
      columns: ['Component', 'WLL', 'MBL', 'Proof load', 'Design factor'],
      rows: [
        { cells: ['Grade 80 alloy lifting chain, 10 mm', '3,200 kg', '126 kN', '63 kN', '4:1'] },
        { cells: ['Grade 100 alloy lifting chain, 10 mm', '4.0 t', '157 kN', '98 kN', '4:1'] },
        { cells: ['Grade 80 swivel lifting eye, 2 t', '2 t', '8 t', '—', '4:1'] },
        { cells: ['Grade 8 alloy screw-pin anchor shackle, 3/4″', '7 t', '35 t', '—', '5:1'] },
        { cells: ['Swaged soft-eye wire rope sling, 6 mm', '0.36 t or 0.30 t', '1.8 t', '—', '5:1 or 6:1'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two things in that table are worth slowing down for.',
    },
    {
      type: 'paragraph',
      html: '<strong>The same sling has two WLLs.</strong> A 6 mm wire rope sling breaks at 1.8 t whichever way you rate it. Rated at 5:1 it carries 0.36 t; rated at 6:1 it carries 0.30 t. Nothing about the rope changes — the procedure it is used under does. That is why a WLL quoted without its design factor is incomplete, and why a sling tagged for one regime cannot be re-tagged for another without the certificate to support it.',
    },
    {
      type: 'paragraph',
      html: '<strong>Proof loads are not on a common basis.</strong> Our Grade 80 table proof-tests at twice the WLL; our Grade 100 table at two and a half times. Both follow published conventions, but it means comparing proof loads between two suppliers’ certificates tells you less than it appears to. Compare WLL and design factor instead.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'The margin between WLL and MBL is not spare capacity.',
      body: 'The design factor exists to absorb what the WLL does not describe: dynamic loading when a load snatches, uneven sharing between sling legs, wear, corrosion and small errors in the weight estimate. A lift planned into that margin has already spent it before any of those things happen.',
    },

    { type: 'section_head', number: '/03', title: 'Why the factor changes with the product.', anchor: 'design-factors' },
    {
      type: 'paragraph',
      html: 'Design factors are set by product standards, and they differ because materials fail differently. Alloy chain stretches visibly before it breaks and is inspected link by link, so it runs at 4:1. Wire rope loses strength to broken wires and bending, and runs at 5:1. Polyester is cut, abraded and weakened by sunlight without much outward sign, which is why European standards ask for 7:1.',
    },
    {
      type: 'comparison_table',
      caption: 'Minimum design factors by product type',
      columns: ['Product', 'Design factor', 'Where it comes from'],
      rows: [
        { cells: ['Grade 80 and Grade 100 chain slings', '4:1', 'EN 818-4 (Grade 8); ASME B30.9 for alloy chain slings'] },
        { cells: ['Wire rope slings', '5:1', 'EN 13414-1; ASME B30.9'] },
        { cells: ['Shackles', '5:1 minimum; 6:1 on many carbon-steel patterns', 'ASME B30.26 sets 5:1; EN 13889 Grade 6 shackles and many carbon patterns are rated at 6:1'] },
        { cells: ['Polyester web and round slings', '7:1 (EN) or 5:1 (ASME)', 'EN 1492-1 and EN 1492-2; ASME B30.9'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'These are the minima for new product. A site lifting procedure can require more — offshore and personnel-lifting work often does — and the manufacturer’s published factor for a specific item overrides a general table. The certificate states the one that applies.',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B30.26',
      publisher: 'ASME',
      title: 'Rigging Hardware',
      summary:
        'Covers shackles, links, rings, swivels, turnbuckles, eye bolts, hoist rings and similar hardware. Sets a minimum design factor of 5 for rated hardware, requires the WLL and manufacturer identification to be marked on the item, and lists the conditions — including wear, deformation, cracks and heat damage — under which hardware must be removed from service.',
      url: 'https://www.asme.org/codes-standards/find-codes-standards/b30-26-rigging-hardware',
    },
    {
      type: 'standard_citation',
      standard: 'EN 818-4',
      publisher: 'CEN',
      title: 'Short link chain for lifting purposes — Safety — Part 4: Chain slings — Grade 8',
      summary:
        'Specifies Grade 8 chain slings, including the mode factors that convert the single-leg WLL into the WLL of a multi-leg sling at a given angle, and the temperature ranges over which the rating applies. The Grade 8 chain it is built from is specified in EN 818-2.',
    },

    { type: 'section_head', number: '/04', title: 'What reduces the WLL in use.', anchor: 'what-reduces-wll' },
    {
      type: 'paragraph',
      html: 'A WLL is stated for one configuration: a single vertical, in-line, static pull on a new item at ordinary temperature. Change any of those and the usable figure goes down. The biggest reduction is usually the one people least expect.',
    },
    {
      type: 'paragraph',
      html: '<strong>Sling angle.</strong> When two sling legs share a load, each leg carries its share divided by the cosine of its angle from vertical. At 45° from vertical — a 90° angle between the legs — each leg carries about 71% of the whole load, not 50%. At 60° from vertical — 120° between the legs — <em>each leg carries the entire load</em>. Our two-leg wire rope sling tables show the same thing as a rating: the 6 mm sling is rated 4.1 kN with up to 90° between the legs and 2.9 kN from 90° to 120°, and 2.9 kN is exactly the single-leg rating of the same rope. Our <a href="/blog/sling-angle-chart">sling angle chart</a> works through every angle.',
    },
    {
      type: 'comparison_table',
      caption: 'Load in each leg of a two-leg sling, as a share of the total load',
      columns: ['Angle between legs', 'Angle from vertical', 'Load in each leg'],
      rows: [
        { cells: ['0°', '0°', '50%'] },
        { cells: ['60°', '30°', '58%'] },
        { cells: ['90°', '45°', '71%'] },
        { cells: ['120°', '60°', '100%'], highlight: true },
        { cells: ['150°', '75°', '193%'] },
      ],
    },
    {
      type: 'paragraph',
      html: '<strong>Hitch.</strong> A choke hitch bends the sling around itself and loses capacity; a basket hitch with vertical legs doubles it. Our 10 mm Flemish-eye wire rope sling is rated 1.2 t vertical, 0.9 t choked and 2.4 t in a vertical basket.',
    },
    {
      type: 'paragraph',
      html: '<strong>Side loading.</strong> A shackle, hook or eye bolt loaded off its axis carries less. On a bow shackle the commonly published reduction is to 70% of the WLL at 45° and 50% at 90°; a dee shackle should not be side-loaded at all. Our <a href="/blog/types-of-shackles">guide to shackle types</a> covers this in detail.',
    },
    {
      type: 'paragraph',
      html: '<strong>Heat and chemicals.</strong> Alloy chain is derated above about 200 °C, on factors the manufacturer publishes. Polyester slings under EN 1492 are rated from −40 °C to 100 °C, and both polyester and alloy steel can be weakened by acids and alkalis.',
    },
    {
      type: 'paragraph',
      html: '<strong>Shock.</strong> A WLL is a static rating. A load that drops onto slack slings or snatches off the ground can momentarily multiply the force far past it.',
    },

    { type: 'section_head', number: '/05', title: 'Reading the tag and the certificate.', anchor: 'tag-and-certificate' },
    {
      type: 'paragraph',
      html: 'Everything above resolves to two documents. The <strong>tag or stamp</strong> on the item should carry its WLL, its grade or material, the manufacturer’s identification and a traceability code. The <strong>test certificate</strong> should repeat the WLL, state the proof load applied, name the standard the item was made to, and carry the same traceability code.',
    },
    {
      type: 'paragraph',
      html: 'If the tag and the certificate disagree, or either is missing, the item does not go on the hook until the discrepancy is resolved. In Abu Dhabi the interval is law: lifting accessories must be thoroughly examined by an approved third-party inspector at least every six months, and Dubai’s accredited inspectors apply the same six-month cycle. Our <a href="/blog/lifting-equipment-inspection-uae">guide to lifting inspection in the UAE</a> sets out what each emirate requires.',
    },
    {
      type: 'decision_tree',
      heading: 'Which number do I use?',
      intro: 'One question per situation. If the answer is not the WLL, it is almost always the wrong question.',
      branches: [
        { condition: 'Planning a lift or choosing a component', outcome: 'WLL, after applying any reduction for angle, hitch, side load or temperature.' },
        { condition: 'Comparing two products for strength', outcome: 'WLL and design factor together.', detail: 'Two items with the same MBL can carry different WLLs because they are rated to different factors.' },
        { condition: 'Checking an item is genuine and tested', outcome: 'Proof load and traceability code on the certificate.', detail: 'Match the code on the certificate to the one stamped on the item.' },
        { condition: 'Anything involving the MBL on site', outcome: 'Stop. MBL is not a working figure.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Components used in the worked examples',
      skus: [
        'IH-LR-CH-G80',
        'IH-LR-CH-G100',
        'IH-LR-RL-80SLES',
        'IH-LR-SH-8ASPAS',
        'IH-LR-WS-SWG',
        'IH-LR-SL-TWRS',
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is WLL the same as SWL?',
          answer:
            'Often, but not reliably. SWL is the older term and has been used both for the manufacturer’s rating and for a lower figure assigned to an item for a particular use. WLL is the term current standards use for the manufacturer’s rating. When a document says SWL, confirm which meaning it has.',
        },
        {
          question: 'Can I load a component right up to its WLL?',
          answer:
            'Yes, if the load is vertical, in line, static and within the temperature range, and the item is in good condition. The WLL is the limit for those conditions, not a figure with extra margin built in for you to use. Any angle, choke, side load or shock load reduces it.',
        },
        {
          question: 'Why is chain rated at 4:1 but a polyester sling at 7:1?',
          answer:
            'Because they fail differently. Alloy chain stretches visibly before it breaks and is inspected link by link. Polyester can be cut, abraded or weakened by UV without much outward sign, so European standards demand a larger margin.',
        },
        {
          question: 'How do I convert kN to tonnes?',
          answer:
            'Divide by 9.81. A breaking load of 126 kN is about 12.8 t; a WLL of 3,200 kg is about 31.4 kN. Our product tables state the unit on every column so the conversion is only needed when comparing across suppliers.',
        },
        {
          question: 'What does a proof load test actually prove?',
          answer:
            'That the item carried a load above its WLL — typically 2 to 2.5 times — without permanent deformation when it was made. It does not prove the item is still fit today; that is what periodic thorough examination is for.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'alloy-lifting-chain',
      label: 'Alloy lifting chain, Grade 80 and 100',
      blurb: 'Full WLL, MBL and proof-load tables for every size.',
    },
    {
      type: 'category_link',
      slug: 'lifting-slings',
      label: 'Lifting slings',
      blurb: 'Wire rope, polyester web and round slings, with ratings by hitch and angle.',
    },
    {
      type: 'related_articles',
      slugs: ['types-of-shackles', 'sling-angle-chart', 'types-of-lifting-slings', 'chain-grades-explained', 'lifting-equipment-inspection-uae', 'mobile-crane-hydraulic-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'All worked figures are taken from the size tables published on the linked product pages. Design factors are the minimum values set by the standards named; the certificate for a specific item governs.',
    },
    {
      type: 'cta_block',
      heading: 'Need gear rated for a specific lift?',
      body: 'Send the load, the rigging arrangement and the number of legs. We will quote components with the WLL to suit, shipped from Dubai with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
