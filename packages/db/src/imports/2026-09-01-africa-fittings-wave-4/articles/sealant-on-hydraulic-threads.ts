import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Family-by-family, downstream of `stopping-an-npt-thread-leak` which covers
 * the NPT case in depth. The value here is the negative: the families where
 * sealant causes the leak it was meant to prevent, and the contamination risk.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sealant-on-hydraulic-threads',
  title: 'Using sealant on hydraulic threads: which joints want it, and which are ruined by it',
  excerpt:
    'Tape on a tapered thread is correct. Tape on a cone, a flat face or an O-ring boss is how a good joint is made to leak — and how debris gets into the system.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:36:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Should you use sealant on hydraulic threads?',
      answer:
        'Only where the thread itself is the seal, which means tapered threads. On every straight-threaded family — JIC, ORFS, O-ring boss, BSP parallel, metric cone — the seal is made at a cone, a flat face or an elastomer, and sealant on the thread contributes nothing, masks a joint that is not seating, and can shed into the system. The rule is short: taper yes, straight no.',
    },
    {
      type: 'lead',
      html: 'This is the habit that travels furthest from where it was learned. In pipework, wrapping a thread is simply what you do, and the practice is correct there. Carried into hydraulics it produces two failures at once — a joint that leaks for a reason nobody can find, and debris upstream of something expensive.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Family by family.',
      anchor: 'family-by-family',
    },
    {
      type: 'comparison_table',
      caption: 'Where the seal is actually made',
      columns: ['Family', 'What seals', 'Sealant?'],
      rows: [
        { cells: ['NPT and other tapered threads', 'The thread itself, wedging', 'Yes — an appropriate sealant, applied correctly'] },
        { cells: ['JIC 37° flare', 'The cone', 'No'], highlight: true },
        { cells: ['ORFS', 'A flat face on an O-ring', 'No'] },
        { cells: ['SAE O-ring boss', 'An O-ring under the shoulder', 'No'] },
        { cells: ['BSP parallel', 'A 60° cone or a bonded seal', 'No'] },
        { cells: ['Metric 24° cone', 'The cone, or a cone with an O-ring', 'No'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Sealant on a straight thread hides the fault instead of fixing it.',
      body: 'A straight-threaded joint that leaks has a seating problem: wrong seat, damage, dirt or a missing O-ring. Wrapping the thread can slow the leak enough to look solved, which means the actual fault ships with the machine and reappears under pressure later.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The contamination half, which is worse.',
      anchor: 'contamination',
    },
    {
      type: 'paragraph',
      html: 'Tape wrapped over the leading thread, or compound applied to the first two threads, ends up <strong>inside the system</strong>. A shred of tape reaches a valve spool or an orifice and produces a fault nobody connects back to a repair three weeks earlier. Where tape is correct — on a taper — it is started back from the leading thread and wrapped in the direction the thread turns, for exactly this reason.',
    },
    {
      type: 'paragraph',
      html: 'Anaerobic thread sealants avoid the shredding problem and bring their own: they cure, and a joint that later needs to come apart on a remote site can be genuinely difficult to break. Neither is a universal answer; both are reasonable within their scope.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to do when a straight joint still leaks.',
      anchor: 'still-leaks',
    },
    {
      type: 'decision_tree',
      heading: 'Before anyone reaches for tape',
      branches: [
        {
          condition: 'Is the family what you think it is?',
          outcome: 'Check seat angle and thread pitch',
          detail: 'A near-miss between families is the most common reason a joint will not seal at all.',
        },
        {
          condition: 'Is the elastomer present, correct and undamaged?',
          outcome: 'Replace it as a matter of course',
          detail: 'O-rings and bonded seals are single-use in practice and cost almost nothing.',
        },
        {
          condition: 'Is the sealing face clean and unmarked?',
          outcome: 'Inspect under a light at an angle',
          detail: 'A radial scratch is a leak path that no assembly method closes.',
        },
        {
          condition: 'All three check out and it still weeps',
          outcome: 'Make-up, or the port',
          detail: 'Correct make-up first; if it persists, the port is the next thing to inspect.',
        },
      ],
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Why does the tape work then, when someone uses it on a JIC joint?',
          answer:
            'It usually does not — it slows the leak while the joint is cold and static. What changed is the diagnosis, not the joint. Under temperature and pressure cycling the original seating fault is still there.',
        },
        {
          question: 'Is PTFE tape ever right in hydraulics?',
          answer:
            'On tapered threads, applied correctly and started back from the leading thread, yes — it is normal practice. The error is applying it to the families where the thread is not the seal.',
        },
        {
          question: 'What about a fitting that arrived with sealant already on it?',
          answer:
            'Clean it and look at what family it is. Pre-applied compound on a straight-threaded fitting tells you something about where it has been, and it is worth checking the seat before assuming the part is sound.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Joint that will not seal whatever you do?',
      body: 'Photograph the seat and the thread and send the measurements. Most of these turn out to be a family mismatch rather than a sealing problem, and that is a five-minute answer rather than a day of tape.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
