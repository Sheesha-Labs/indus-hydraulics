import type { BlogArticleSeed } from '../shared'

/**
 * Diagnostic, not a parts list. No model-specific part numbers and no
 * dimensions — those come from the machine's own parts book, and inventing
 * one would send someone a hose that does not fit.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'excavator-hydraulic-hose-replacement',
  title: 'Excavator hose failure: which circuit went, and how to tell',
  excerpt:
    'Boom, arm, bucket, swing or travel — the symptom tells you which circuit failed before anything comes apart. How to read it, and how to identify the hose without the dealer part number.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Excavator hydraulic hose replacement — identifying the failed circuit',
  seoDescription:
    'Which excavator circuit failed: boom, arm, bucket, swing or travel. Reading the symptom, finding the hose, and identifying a replacement without the dealer part number.',
  focusKeyword: 'excavator hydraulic hose replacement',
  publishedAt: '2026-08-17T11:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The symptom identifies the circuit. Which function is slow, drifting or dead narrows it before you open anything.',
        'Bucket and arm hoses fail most often, because they are the most exposed to impact and abrasion at the working end.',
        'A function that drifts under load without an external leak usually points past the hose to the cylinder or a valve.',
        'You do not need the dealer part number. Bore, length, both fitting types and the angle between them fully specify the assembly.',
        'The replacement fails the same way unless the routing or rub point that killed the first one is fixed.',
      ],
    },
    {
      type: 'lead',
      html: 'An excavator with a hydraulic failure is usually diagnosable from the seat. What the machine can and cannot do points at a circuit, and the circuit points at a short list of hoses — most of them somewhere you can reach.',
    },

    { type: 'section_head', number: '/01', title: 'Read the symptom.', anchor: 'read-the-symptom' },
    {
      type: 'comparison_table',
      caption: 'Symptom to circuit',
      columns: ['What the machine does', 'Likely circuit', 'Where to look first'],
      rows: [
        { cells: ['Boom will not lift, or drifts down under load', 'Boom', 'Hoses along the boom, and the cylinder rod-end connections'] },
        { cells: ['Arm slow or unresponsive, boom fine', 'Arm / stick', 'Hoses running the length of the boom to the arm cylinder'] },
        { cells: ['Bucket will not curl or dump', 'Bucket', 'The most exposed hoses on the machine — at the working end'], highlight: true },
        { cells: ['House will not slew, tracks fine', 'Swing', 'Swing motor lines, and the hoses through the slew centre'] },
        { cells: ['One track drives, the other does not', 'Travel', 'Travel motor lines on the affected side'] },
        { cells: ['Attachment dead, everything else normal', 'Auxiliary', 'Auxiliary lines along the boom and the couplers at the end'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Which excavator hoses fail first?',
      answer:
        'Bucket and arm hoses, in most fleets. They sit at the working end where they take impact from material, drag against the ground and the trench edge, and flex through the largest range of movement — so they accumulate both abrasion and cycles faster than anything on the house side.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Drift without a visible leak is not usually a hose.',
      body: 'A function that sinks under load with nothing wet outside is more often internal — cylinder seals, or a valve passing. Replacing a hose will not fix it, and the machine will come back.',
    },

    { type: 'section_head', number: '/02', title: 'Identify the hose without the parts book.', anchor: 'identify' },
    {
      type: 'sop_block',
      header: 'EXCAVATOR HOSE · FIELD IDENTIFICATION',
      completion: '5 steps',
      phases: [
        {
          name: 'On the machine',
          rows: [
            { task: 'Photograph in place', detail: 'Routing, clamping and how it sits at full extension. This is the information that disappears the moment it is unbolted.', who: 'Fitter', tool: 'Phone' },
            { task: 'Read the layline', detail: 'Grade and bore are usually printed along the cover. If it is worn off, the construction can be read from a cut end.', who: 'Fitter', tool: 'Eyes' },
            { task: 'Identify both ends', detail: 'Family, size and angle at each end. They are frequently different ends on the same hose.', who: 'Fitter', tool: 'Caliper' },
            { task: 'Note the angle between ends', detail: 'On an assembly with two elbows, the rotational relationship matters and cannot be recovered later.', who: 'Fitter', tool: 'Photo' },
            { task: 'Find what killed it', detail: 'Rub mark, tight bend, or a clamp that has gone. If you cannot find it, the replacement is on the same clock.', who: 'Fitter', tool: 'Eyes' },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'Those five items fully specify a replacement. What this article deliberately does not carry is a table of part numbers by machine model — a wrong row there sends someone a hose that does not fit, on a machine that is already down, and the machine’s own parts book is authoritative in a way a blog post cannot be.',
    },

    { type: 'section_head', number: '/03', title: 'Grade selection on a rebuild.', anchor: 'grade' },
    {
      type: 'paragraph',
      html: 'Replacing like for like is the safe default, and matching what was fitted is usually right. Where it is worth thinking again is when the original kept failing: a run that has burned through several assemblies may need a <strong>different route or an elbow</strong> rather than a different hose, and a run in a tight space may need a compact construction that bends tighter than the standard grade.',
    },
    { type: 'product_embed', heading: 'Common excavator grades and ends', skus: ['IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-JIC-FEM-37-45', 'IH-ORFS-FEM-45'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can you make an excavator hose without the machine present?', answer: 'Yes, from the failed assembly or from bore, length, both fitting specifications and the angle between the ends. Photographs of each end against a rule cover most of it.' },
        { question: 'The same hose has failed three times. What is wrong?', answer: 'The installation, almost certainly. A failure that repeats in the same location is routing, clamping or bend radius until proven otherwise — the hose is the symptom.' },
        { question: 'Should I replace hoses in pairs?', answer: 'On a circuit where both lines are the same age and duty, often yes — the second one is usually not far behind, and the labour is largely shared.' },
        { question: 'Is a four-spiral hose always better than two-wire?', answer: 'No. It is rated higher and bends less easily. On a run that needs to flex in a confined space, a compact two-wire construction may be the better engineering answer.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Compact and standard braid through four-spiral, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Diagnostic guidance only. No model-specific part numbers — the machine parts book is authoritative for those.' },
    { type: 'cta_block', heading: 'Machine down?', body: 'Send photographs of both ends and the layline. We will identify the assembly and tell you what we hold before you travel.', quoteLabel: 'Get it identified' },
  ],
}

export default ARTICLE
