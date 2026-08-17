import type { BlogArticleSeed } from '../shared'

/**
 * Failure modes and what each one looks like. No service-life figures and no
 * replacement intervals: those depend on the hose, the duty and the ambient,
 * and the standards themselves decline to give a single number.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'why-hydraulic-hoses-fail',
  title: 'Why hydraulic hoses fail: six modes, and what each one leaves behind',
  excerpt:
    'A failed hose usually tells you why it failed. Abrasion, kinking, heat, cold-set, wrong routing and fitting problems each leave a different signature — and each has a different fix.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Why hydraulic hoses fail — six failure modes and how to read them',
  seoDescription:
    'How to read a failed hydraulic hose: abrasion, kinking, heat ageing, over-pressure, bad routing and fitting failure. What each leaves behind and what to change.',
  focusKeyword: 'why do hydraulic hoses fail',
  publishedAt: '2026-08-17T08:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Most hose failures are installation and environment problems, not manufacturing defects. The hose is usually the symptom.',
        'Abrasion is the most common cause and the easiest to design out — it leaves a flat worn patch, not a burst.',
        'A hose that failed from heat looks and feels different from one that burst: hardened, often cracked, with a cover that has lost its flexibility.',
        'Twist is invisible once installed and roughly halves what a hose will tolerate. Look at the layline, not the hose.',
        'Replacing the assembly without changing what killed it just resets the clock.',
      ],
    },
    {
      type: 'lead',
      html: 'Pull a failed assembly off a machine and most of the diagnosis is already in your hand. Where it failed, what the cover looks like around the failure, and whether the reinforcement is corroded or clean will each point somewhere different — and somewhere different is the point, because the replacement will fail the same way if nothing else changes.',
    },

    { type: 'section_head', number: '/01', title: 'The six.', anchor: 'the-six' },
    {
      type: 'comparison_table',
      caption: 'Reading the failure',
      columns: ['Mode', 'What you see', 'What to change'],
      rows: [
        { cells: ['Abrasion', 'Flat worn area on the cover, often with reinforcement showing. No burst.', 'Re-route, clamp, or sleeve the contact point.'], highlight: true },
        { cells: ['Kinking / tight bend', 'Flattened or creased section, usually near a fitting.', 'Longer assembly, or an elbow fitting to take the turn.'] },
        { cells: ['Heat ageing', 'Hardened, often crazed cover. Hose has lost flexibility along its length.', 'Move it away from the heat source, or shield it.'] },
        { cells: ['Twist', 'Layline spirals instead of running straight.', 'Re-install without twist; clamp so it cannot rotate.'] },
        { cells: ['Fitting or crimp', 'Failure at the ferrule — hose pulled out, or weeping at the collar.', 'Check crimp specification and whether the fitting suits the hose.'] },
        { cells: ['Cover damage from outside', 'Cuts, gouges, corroded reinforcement under a broken cover.', 'Guard the run; a breached cover lets water reach the wire.'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The one worth dwelling on is <strong>abrasion</strong>, because it accounts for a large share of what comes off machines and it is almost entirely preventable. A hose rubbing on structure, or on another hose, wears through the cover, exposes the reinforcement, and from that point the wire corrodes and the assembly is on borrowed time. Nothing about the hose caused it.',
    },

    { type: 'section_head', number: '/02', title: 'Twist, and why it is invisible.', anchor: 'twist' },
    {
      type: 'direct_answer',
      question: 'How much does twist reduce hydraulic hose life?',
      answer:
        'Substantially — a few degrees of twist is enough to matter, because pressure acts to unwind a twisted hose and that load goes into the reinforcement rather than around it. The practical guidance is simple: install so the layline runs straight, and check it after the machine has been through its range of movement.',
    },
    {
      type: 'paragraph',
      html: 'Twist is hard to spot because a twisted hose looks like a hose. The layline — the printed stripe running along the cover — is the tell. If it spirals, the assembly is loaded in a way it was not designed for, and the failure when it comes will usually be blamed on the hose.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Check the layline after movement, not just at install.',
      body: 'An assembly can be straight on the bench and twisted at full extension. Cycle the machine through its range and look again before signing the job off.',
    },

    { type: 'section_head', number: '/03', title: 'Gulf conditions make three of these worse.', anchor: 'gulf-conditions' },
    {
      type: 'paragraph',
      html: 'Ambient temperature, airborne sand and UV all push in the same direction here. Heat accelerates the ageing of the cover and raises the fluid temperature the hose sees from the inside. Airborne sand turns any contact point into an abrasive one, so a rub that would take a year elsewhere takes less. And a cover already hardened by heat and UV cracks sooner when it is flexed.',
    },
    {
      type: 'paragraph',
      html: 'The practical consequence is that <strong>inspection intervals set for a temperate climate are optimistic here</strong>, and that guarding a run against abrasion is worth more in this region than the same measure would be elsewhere. What this article will not do is give you a replacement interval in hours — that depends on the hose, the duty cycle and the installation, and the standards decline to give a single number for exactly that reason.',
    },

    {
      type: 'product_embed',
      heading: 'Common replacement grades',
      skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH'],
      note: 'Grade selection follows the working pressure and the bend radius the installation actually needs — take both from the machine, not from what was fitted last time.',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'The hose burst in the middle of a straight run. What causes that?', answer: 'A burst away from any fitting or rub point usually points to pressure the hose was not selected for — a spike, or a grade below what the circuit sees — or to a cover breach that let the reinforcement corrode. Check the layline for the grade actually fitted before assuming the hose was faulty.' },
        { question: 'Should I sleeve every hose?', answer: 'No — sleeve the runs that have a contact point or an abrasive environment. Sleeving everything adds cost and can trap moisture against the cover, which is its own problem.' },
        { question: 'The replacement failed in the same place. Why?', answer: 'Because the cause was the installation, not the hose. A failure that repeats in the same location is routing, clamping or bend radius until proven otherwise.' },
        { question: 'Does a hardened, cracked cover mean the hose is unsafe?', answer: 'It means the hose has aged and should be assessed. Cover cracking on its own does not tell you the state of the reinforcement, but it is a clear signal that the assembly is near the end of its useful life.' },
      ],
    },

    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Single and two-wire braid, compact and four-spiral, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Failure signatures and preventive measures only. No service-life or replacement-interval figures are published here.' },
    { type: 'cta_block', heading: 'Send us the failed assembly.', body: 'A photograph of where it failed and what the cover looks like is usually enough for our engineers to say what killed it and what to change.', quoteLabel: 'Get a replacement quoted' },
  ],
}

export default ARTICLE
