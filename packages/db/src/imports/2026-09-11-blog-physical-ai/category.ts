import type { BlogBlocksInput } from '@indus/domain'

/**
 * The fifteenth blog category, and the first that is not about buying or
 * fixing something.
 *
 * The existing fourteen are organised by the reader's job — a failure to
 * diagnose, a thread to identify, a machine down, an order to place. This one
 * is organised by a question nobody on this site is being sold an answer to,
 * which is the point: the hub exists to be linked to from outside the trade.
 *
 * `heroCopy` states the editorial position plainly, because a research section
 * on a distributor's website invites the obvious suspicion and the only useful
 * response is to say what the section is for.
 *
 * NOTE THE ABSENCE OF `isPublished`.
 *
 * It is set by the runner, from whether the wave's articles are being
 * published, and it is not a property of this record. The first import of this
 * wave hard-coded `true` while all three articles imported as drafts, which put
 * a live hub reading "0 articles" into the sitemap for an hour — exactly what
 * wave 2 unpublished `procurement-export` for, and exactly what the note on
 * wave 5's category was written to prevent. A hub is publishable when it has
 * something in it; that is a fact about the articles, so the articles decide it.
 */
export const PHYSICAL_AI_CATEGORY = {
  slug: 'physical-ai',
  name: 'Physical AI',
  description:
    'Long-form research on autonomy at the pressure boundary: what robots and AI models can and cannot do with industrial equipment, and why.',
  heroCopy:
    'We supply hydraulic components, not robots. This section exists because the two meet at a point almost nobody writes about — the physical interface an autonomous system is actually pointed at. These are long, argued pieces with their sources attached.',
  position: 15,
  seoTitle: 'Physical AI and industrial autonomy — research',
  seoDescription:
    'Research on autonomous inspection, robotics and AI models at the industrial pressure boundary: what is observable, what is certifiable, and what stops a finding becoming a repair.',
  focusKeyword: 'physical ai industrial autonomy',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Why does a hydraulics supplier publish robotics research?',
      answer:
        'Because the half of the problem we know is the half the robotics field knows least. A rig inspection robot can detect a weeping joint; it cannot judge whether the hose behind it has six months left, and it cannot specify the replacement. Those are questions about fluid power, and we can answer them.',
    },
    {
      type: 'paragraph',
      html: 'Each article here states a thesis, argues it, and lists its sources. Where a figure is a schematic rather than a measurement it says so. Where we use our own data — the catalogue audit in the vision article, for instance — the record counts are published so the analysis can be checked.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'What this section is not',
      body: 'It is not a survey of robotics news, and it does not claim expertise in model internals. Every claim about how a model behaves is cited to a primary source rather than asserted. The expertise being offered is about what the machine is looking at.',
    },
  ] satisfies BlogBlocksInput,
}
