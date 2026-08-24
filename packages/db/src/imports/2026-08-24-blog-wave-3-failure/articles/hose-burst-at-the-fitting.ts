import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hose-burst-at-the-fitting',
  title: 'It burst at the fitting, not mid-length: what that tells you',
  excerpt:
    'Where a hose failed is diagnostic. A burst within a hand’s width of the ferrule almost never means the hose was under-rated — it means something at that end was wrong, and replacing like for like will do it again.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose burst at the fitting — causes and diagnosis',
  seoDescription:
    'Why hydraulic hoses fail at or just behind the ferrule: crimp faults, flexing at the fitting, bend radius starting too close to the end, and pull-off. How to tell which.',
  focusKeyword: 'hydraulic hose burst at fitting',
  publishedAt: '2026-08-24T13:42:07.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A burst at the fitting is a different fault from a burst mid-length. The hose is rarely the thing that was wrong.',
        'Four causes account for almost all of them: a crimp outside specification, the hose flexing where it leaves the ferrule, a bend starting too close to the end, and the hose pulling out of the fitting.',
        'The evidence separates them — look at whether the tube pulled out, whether the wire is bright or corroded, and whether the cover is marked where it leaves the ferrule.',
        'Replacing like for like without changing the routing or the crimp reproduces the failure on the same schedule.',
        'A failure inside the first few weeks of service is a build fault until proven otherwise. A failure after years at the same point is a routing fault.',
      ],
    },
    {
      type: 'lead',
      html: 'The most useful thing about a failed hose is where it failed. Mid-length says one set of things; within a hand’s width of the ferrule says an almost entirely different set — and the second is far more common than the first.',
    },

    { type: 'section_head', number: '/01', title: 'Why the location matters.', anchor: 'why-location' },
    {
      type: 'paragraph',
      html: 'A hose assembly is not uniform along its length. The middle is hose. The last few centimetres at each end are hose <em>plus</em> a steel ferrule compressed onto it, and the transition between the two is the stiffest, most stressed part of the whole assembly.',
    },
    {
      type: 'paragraph',
      html: 'That transition is where the reinforcement stops being free to move. <strong>Any flexing the routing imposes gets concentrated there</strong>, because there is nowhere else for it to go. It is also where the build quality of the assembly is decided, and where any error in the crimp lives.',
    },
    {
      type: 'direct_answer',
      question: 'Why do hydraulic hoses burst at the fitting?',
      answer:
        'Because the point where the hose leaves the ferrule is the stiffest part of the assembly, so any flexing or bending the routing imposes concentrates there. The four common causes are a crimp diameter outside specification, repeated flexing at that point, a bend that starts too close to the fitting, and the hose pulling out under pressure. The hose itself is rarely under-rated.',
    },

    { type: 'section_head', number: '/02', title: 'Telling the four apart.', anchor: 'the-four' },
    {
      type: 'comparison_table',
      caption: 'What each cause leaves behind',
      columns: ['Cause', 'What you find', 'When it shows up'],
      rows: [
        { cells: ['Crimp too loose', 'Tube pulled out of the ferrule, or visible movement between hose and fitting', 'Early — days to weeks'], highlight: true },
        { cells: ['Crimp too tight', 'Wire cut or crushed at the ferrule mouth; failure right at the edge', 'Early to medium'] },
        { cells: ['Flexing at the ferrule', 'Cover polished or cracked in a band where it leaves the fitting', 'Late — after long service'] },
        { cells: ['Bend starting too close', 'Hose curved from the moment it exits the ferrule, cover strained on the outside of the curve', 'Medium to late'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Age is half the diagnosis.',
      body: 'A hose that failed at the fitting within weeks of being built points at the build. One that ran for years and then failed at the same point points at the installation. Both look similar on the bench; the service life separates them, which is why a hose register that records build dates pays for itself the first time this question comes up.',
    },

    { type: 'section_head', number: '/03', title: 'The crimp is a measured dimension.', anchor: 'the-crimp' },
    {
      type: 'paragraph',
      html: 'A crimp is not "tight enough". It is a diameter, specified for that combination of hose construction and ferrule, verified with callipers after the press releases. <strong>Too loose and the hose walks out of the fitting under pressure; too tight and the crimp cuts the reinforcement it is supposed to be gripping.</strong>',
    },
    {
      type: 'paragraph',
      html: 'The tolerance is measured in tenths of a millimetre, which is why the die, the ferrule and the hose all have to be the matched set the specification assumes. A ferrule that fits physically is not evidence that it is the right ferrule.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Ask what the crimp was measured at.',
      body: 'Any workshop building assemblies properly can tell you the specified crimp diameter for what they built and confirm it was checked. If that question produces a pause rather than a number, that is itself diagnostic.',
    },

    { type: 'section_head', number: '/04', title: 'What to change before fitting the replacement.', anchor: 'what-to-change' },
    {
      type: 'decision_tree',
      heading: 'Work down until one applies',
      intro: 'Fitting an identical replacement into an unchanged installation is a decision, not a default. Make it deliberately.',
      branches: [
        { condition: 'The hose moves through an arc in service', outcome: 'Get the movement into the middle of the hose, not the first few centimetres.', detail: 'A longer assembly, or an elbow fitting that lets the hose leave in the direction it needs to travel, moves the flexing away from the ferrule.' },
        { condition: 'The hose curves as it leaves the fitting', outcome: 'Use an elbow rather than bending the hose to achieve the same angle.', detail: 'A 45° or 90° fitting turns the line at the fitting so the hose can run straight out of it. This is what elbow fittings are for.', sku: 'IH-HOSE-R2-2SN' },
        { condition: 'It failed within weeks of being built', outcome: 'Treat it as a build fault and ask for the crimp specification and the measured value.', detail: 'An early failure at the ferrule is a build question until the build is ruled out.' },
        { condition: 'The same position has failed more than once', outcome: 'Stop replacing and review the installation.', detail: 'Two failures at one position is not bad luck. Something about that routing is outside what the assembly can take.' },
      ],
    },
    { type: 'product_embed', heading: 'Ferrules matched to construction', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-4SP'] },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Skive and no-skive, matched to the hose they crimp onto.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Straight, 45° and 90° — turn the line at the fitting.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a burst at the fitting always the workshop’s fault?', answer: 'No. It is a build question when the failure is early and an installation question when it is late. A hose that ran for years and then failed at the ferrule was almost certainly flexing there the whole time — the build was fine and the routing was not.' },
        { question: 'The tube pulled out of the fitting. What does that mean?', answer: 'Pull-out means the crimp was not gripping the hose adequately — either the crimp diameter was too large, the ferrule was wrong for that construction, or the hose was not inserted to full depth before crimping. All three are build faults.' },
        { question: 'Can I re-use the fitting from a failed assembly?', answer: 'On a one-piece crimped fitting, no — the ferrule is deformed and the crimp cannot be repeated on it. Reusable fittings are a different design and are documented as such. Anything crimped is single use.' },
        { question: 'Does a longer hose fix flexing at the fitting?', answer: 'Often, yes — a longer assembly lets the same movement spread over more length, so less of it concentrates at the ends. It has to be routed so the extra length does not create a new rub point, which is the usual way this fix goes wrong.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own workshop practice. Crimp specifications are per hose-and-ferrule combination and come from the fitting manufacturer, not from a general rule.',
    },
    { type: 'cta_block', heading: 'Failed at the ferrule more than once?', body: 'Send photographs of the failure and of the routing it came out of. A position that fails repeatedly has an installation problem, and another identical hose will not solve it.', quoteLabel: 'Get a failure reviewed' },
  ],
}

export default ARTICLE
