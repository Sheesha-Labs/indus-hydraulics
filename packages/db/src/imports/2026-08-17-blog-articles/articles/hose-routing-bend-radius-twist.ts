import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hose-routing-bend-radius-twist',
  title: 'Hose routing: bend radius, twist and the failures they cause',
  excerpt:
    'Three installation faults account for a large share of premature hose failure, and all three are free to avoid at fitting time. What they look like and how to design them out.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose routing — bend radius, twist and clamping',
  seoDescription:
    'Why hydraulic hoses fail early from routing: tight bends behind fittings, installed twist, and unmanaged contact points. What each looks like and how to fix it.',
  focusKeyword: 'hydraulic hose routing best practice',
  publishedAt: '2026-08-17T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A hose that fails early usually failed where it was installed, not where it was made.',
        'The tightest bend on most machines is immediately behind a fitting — which is also the worst place for one.',
        'Twist is invisible unless you read the layline, and pressure works to unwind a twisted hose.',
        'An elbow fitting is almost always cheaper than the failures a tight bend causes.',
        'Clamp to control the hose, not to pin it. A hose that cannot move at all is loaded every time the machine does.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask why a hose failed after four months and the honest answer is usually that it was installed in a way that guaranteed it. Routing gets decided in the last ten minutes of a job, by whoever is holding the assembly, and it determines most of what happens afterwards.',
    },

    { type: 'section_head', number: '/01', title: 'Bend radius.', anchor: 'bend-radius' },
    {
      type: 'paragraph',
      html: 'Every hose has a minimum bend radius below which the reinforcement is no longer doing what it was designed to do. Bending tighter than that flattens the bore, puts uneven load into the wire, and on a spiral hose can begin to separate the layers. The figure is specific to the grade and size and belongs on the datasheet — but the <em>failure</em> is generic and recognisable: a flattened or creased section, usually near an end.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The bend must not start at the fitting.',
      body: 'A hose needs a straight section behind a fitting before it begins to turn. Bending immediately at the ferrule concentrates the load exactly where the hose is least able to take it, and it is the single most common routing fault on machines.',
    },
    {
      type: 'direct_answer',
      question: 'What happens if a hydraulic hose is bent too tightly?',
      answer:
        'The bore flattens and the reinforcement is loaded unevenly, which shortens life well before anything visible happens. When it does become visible it shows as a creased or flattened section, usually within a hand’s width of a fitting. Fix it with a longer assembly or an elbow rather than by forcing the route.',
    },

    { type: 'section_head', number: '/02', title: 'Twist.', anchor: 'twist' },
    {
      type: 'paragraph',
      html: 'Pressurising a twisted hose applies a force that tries to unwind it, and that load goes into the reinforcement rather than around it. A few degrees is enough to matter. The problem is that a twisted hose looks entirely normal — the only reliable tell is the <strong>layline</strong>, the printed stripe along the cover. If it spirals, the assembly is twisted.',
    },
    {
      type: 'sop_block',
      header: 'ROUTING · SIGN-OFF CHECKS',
      completion: '5 checks',
      phases: [
        {
          name: 'Before the machine goes back',
          rows: [
            { task: 'Layline straight', detail: 'Sight along the assembly. A spiralling layline means twist — release the fitting and re-make it without.', who: 'Fitter', tool: 'Eyes' },
            { task: 'Straight run behind each fitting', detail: 'The bend must begin clear of the ferrule, not at it.', who: 'Fitter', tool: 'Eyes' },
            { task: 'Cycle and re-check', detail: 'Move the machine through its full range and look again. An assembly straight on the bench can be twisted at full extension.', who: 'Fitter', tool: 'Machine' },
            { task: 'Contact points', detail: 'Anywhere the hose touches structure or another hose, clamp or sleeve it now.', who: 'Fitter', tool: 'Clamps' },
            { task: 'Slack for movement', detail: 'Enough length to follow the movement without stretching, not so much that it whips or snags.', who: 'Fitter', tool: 'Eyes' },
          ],
        },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Clamping, and the mistake it invites.', anchor: 'clamping' },
    {
      type: 'paragraph',
      html: 'Clamping exists to stop a hose rubbing and to control where it moves — not to hold it rigid. A hose pinned at both ends of a section that flexes is being loaded every time the machine works, and will fail at the clamp. The useful mental model is that clamps <em>guide</em> a hose along a path; they do not fix it in place.',
    },
    {
      type: 'comparison_table',
      caption: 'Routing faults and their signatures',
      columns: ['Fault', 'What you find later', 'Fix at install'],
      rows: [
        { cells: ['Bend starts at the fitting', 'Crease or flattening within a hand’s width of the ferrule', 'Elbow fitting, or a longer assembly'], highlight: true },
        { cells: ['Installed twist', 'Spiralling layline; failure that looks unexplained', 'Re-make the joint without twist; clamp against rotation'] },
        { cells: ['Unmanaged contact', 'Flat worn patch, eventually exposed wire', 'Clamp, sleeve, or re-route clear'] },
        { cells: ['Too little slack', 'Tension at full extension; fitting pulled', 'Measure at the extreme of travel, not at rest'] },
        { cells: ['Too much slack', 'Whip damage, snagging, abrasion in new places', 'Shorten, or clamp to control the path'] },
      ],
    },
    { type: 'product_embed', heading: 'Elbow fittings that solve most tight bends', skus: ['IH-JIC-FEM-37-45', 'IH-BSP-FEM-60-90', 'IH-ORFS-FEM-45'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Where do I find the minimum bend radius for my hose?', answer: 'On the datasheet for that grade and size. It varies with construction — a compact hose is designed to bend tighter than a standard one of the same bore — so a single generic figure is not usable.' },
        { question: 'Is a 90° fitting worse than bending the hose?', answer: 'Almost always better. An elbow takes the turn in the fitting where the geometry is controlled, instead of in the hose where it is not.' },
        { question: 'How do I stop a hose twisting when I tighten it?', answer: 'Hold the hose against rotation while torquing the nut, and check the layline afterwards. On swivel fittings the nut should turn and the hose should not.' },
        { question: 'Does twist matter on a low-pressure return line?', answer: 'Less, but it still loads the reinforcement and still costs life. It takes no longer to install it straight.' },
      ],
    },
    { type: 'category_link', slug: 'hoses-fittings', label: 'Elbow fittings and adapters', blurb: '45° and 90° in every family we stock, so the turn happens in the fitting rather than the hose.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Routing principles and failure signatures only. Minimum bend radius is per grade and size — take it from the datasheet.' },
    { type: 'cta_block', heading: 'Re-routing a problem installation?', body: 'Send photographs of the run and what keeps failing. Our engineers will suggest the fitting and length changes that fix it.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
