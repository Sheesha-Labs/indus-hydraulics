import type { BlogArticleSeed } from '../shared'
import { MAKEUP_TURNS } from '../diagrams'

/**
 * Making up a compression fitting. Steps, turns, gap gauge, remake, plugs, port connectors, preswaging,
 * hydraulic swaging, cutting and deburring, straight length before a bend and safety rules from Swagelok
 * Installer's Pocket Guide MS-13-151 Rev P (2025) and Parker catalogue 4230/4233 p.78 and Bulletin 4200-B4,
 * read 2026-10-21. "Original position plus 1/4 turn" remake rule NOT used (in neither maker's text).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-make-up-a-compression-fitting',
  title: 'How to make up a compression tube fitting: cutting, turns, gap gauge and remakes',
  excerpt:
    'The tightening rule is one line — finger-tight, then 1-1/4 turns — and almost every leak comes from the steps either side of it. Cutting and deburring the tube, bottoming it, marking the nut, the 3/4-turn rule for small tube, the gap inspection gauge and when not to use it, remaking a joint, plugs, port connectors, preswaging and large-bore hydraulic swaging.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Install a Compression Fitting: Turns, Gap Gauge, Remake',
  seoDescription:
    'Step-by-step compression tube fitting make-up: cutting and deburring, bottoming the tube, 1-1/4 turns (3/4 turn on small sizes), gap inspection gauge, remake procedure, plugs, port connectors, preswaging and safety rules.',
  focusKeyword: 'how to install compression fitting',
  publishedAt: '2026-10-21T13:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Cut the tube square with a proper cutter, deburr inside and out without over-deburring the OD, and clean out the chips.',
        'Push the tube in until it bottoms on the body shoulder, run the nut finger-tight, and mark the nut at 6 o’clock.',
        'Hold the body and tighten the nut 1-1/4 turns (to 9 o’clock) for 1/4"–1" and 6–25 mm; 3/4 turn (to 3 o’clock) for 1/16", 1/8", 3/16" and 2–4 mm.',
        'Check first make-ups with the maker’s gap inspection gauge: if it enters the gap between nut and body, tighten further. Never use it on a remake.',
        'Remake by turning back to the marked position, where resistance rises sharply, then a little further — Parker says 10–20°, and only after several remakes.',
        'Never tighten, loosen or bleed a fitting under pressure.',
      ],
    },
    {
      type: 'lead',
      html: 'Instrument fitting makers publish the same make-up rule almost word for word, and it is reassuringly simple. What goes wrong is everything around it: a tube cut with a hacksaw and not deburred, a tube that was never pushed fully home, a nut tightened by feel rather than by counting, a gauge used on a joint that had already been made once. This is the full procedure, step by step, as Swagelok and Parker publish it.',
    },

    { type: 'section_head', number: '/01', title: 'Prepare the tube.', anchor: 'prepare' },
    {
      type: 'prose',
      html: '<ol><li><strong>Check the tube.</strong> It must be the right OD, inside the maker’s wall range for that size, fully annealed (stainless no harder than 90 HRB; Parker recommends 80 HRB or less), round and free of scratches where the ferrules will sit. Never force oval tube into a fitting.</li><li><strong>Cut it square.</strong> Use a tube cutter, or a hacksaw in a guide with a fine blade (Parker specifies 32 teeth per inch minimum). On stainless, use a cutting wheel made for stainless: a dull or wrong wheel work-hardens the tube end, and hardened tube is harder to seal.</li><li><strong>Deburr inside and out.</strong> A burr on the OD stops the tube seating in the body; a burr inside sheds into the line. But do not over-deburr the OD — chamfering away the edge removes the surface the ferrule needs.</li><li><strong>Clean it.</strong> Flush or swab out the chips.</li><li><strong>Mark it with a pencil, never a scribe.</strong> Parker warns that scratch marks made with a sharp tool create leak paths.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Leave a straight length before a bend.',
      body: 'The ferrules need straight tube to seal on. Swagelok publishes the minimum straight length between the end of the tube and the start of a bend: about 13/16" for 1/4" tube, 15/16" for 3/8", 1-3/16" for 1/2" and 1-1/2" for 1"; metric, about 21 mm for 6 mm tube, 25 mm for 10 mm and 31 mm for 12 mm.',
    },

    { type: 'section_head', number: '/02', title: 'Make up the joint.', anchor: 'makeup' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'Marking and counting the turns. Mark the nut at 6 o’clock after finger-tightening; 1-1/4 turns brings the mark round once and on to 9 o’clock. On 1/16"–3/16" and 2–4 mm tube, 3/4 turn takes it to 3 o’clock.',
      alt: 'Two clock-face diagrams of a nut viewed end on. Left, for 1/4 inch to 1 inch and 6 to 25 mm tube: a mark starting at 6 o’clock travels one full turn and then a quarter more, finishing at 9 o’clock, labelled one and a quarter turns. Right, for 1/16 to 3/16 inch and 2 to 4 mm tube: the mark travels three quarters of a turn from 6 o’clock to 3 o’clock.',
      svg: MAKEUP_TURNS,
    },
    {
      type: 'prose',
      html: '<ol><li><strong>Insert the tube fully</strong>, until it rests firmly on the shoulder inside the body. A tube that is not bottomed will hold for a while and then leak or pull out.</li><li><strong>Run the nut down finger-tight.</strong></li><li><strong>Mark the nut</strong> at the 6 o’clock position (and, for remakes later, mark the tube at the back of the nut).</li><li><strong>Hold the body with a second wrench</strong> and tighten the nut. Never turn the body; hold it and turn the nut.<ul><li><strong>1/4" to 1" and 6 mm to 25 mm:</strong> 1-1/4 turns, so the mark goes once round and on to 9 o’clock.</li><li><strong>1/16", 1/8", 3/16" and 2, 3, 4 mm:</strong> 3/4 turn, to 3 o’clock. Parker notes that 3/4 turn on these small sizes is what is necessary to seal, and that it leaves the joint able to be remade more times.</li></ul></li></ol><p>Swagelok and Parker give the same turns. For high-pressure and high-safety-factor systems, Swagelok adds a step: after finger-tight, keep tightening until the tube will not turn by hand or move axially, then mark the nut and apply the standard turns from there.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Check it with the gap gauge — first make-up only.', anchor: 'gauge' },
    {
      type: 'prose',
      html: '<p>Makers supply a gap inspection gauge: a thin plate sized for each tube size. Hold it against the gap between the nut and the body hex. If the gauge <strong>enters</strong> the gap, the fitting is not tight enough — tighten further (Parker: repeat the assembly). If it <strong>does not enter</strong> at any point round the nut, the fitting is sufficiently tightened.</p><p>The gauge is for <strong>initial make-up only</strong>. A joint that has been made up and then remade sits deeper, and the gauge will no longer tell you anything useful. Swagelok also lists plugs, machined-ferrule port connectors, joints made with a non-gaugeable preswaging tool and preswaged connections over 1" as places not to use it.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Remaking a joint.', anchor: 'remake' },
    {
      type: 'prose',
      html: '<p>Compression fittings can be disconnected and remade; Swagelok says many times. The procedure is different from first make-up:</p><ol><li>Before taking it apart, mark the tube at the back of the nut and draw a line along the nut and body flats.</li><li>Reinsert the tube with its pre-swaged ferrules until the front ferrule seats in the body.</li><li>Turn the nut by hand, then with a wrench, back to the marked position. Resistance rises sharply there — that is the ferrule re-seating.</li><li>Then tighten <em>slightly</em>. Parker quantifies it: only after several remakes does the nut need to go past the original position at all, and then only 10–20°, less than a third of a hex flat.</li></ol><p>Do not apply a fresh 1-1/4 turns to a remade joint. It crushes the ferrules further and uses up the joint’s remake life.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never tighten, loosen or bleed under pressure.',
      body: 'Both makers prohibit it. Depressurise before adjusting or disassembling any fitting, and never bleed a system by cracking a fitting nut or plug. A tube that lets go under pressure becomes a projectile, and the fluid behind it can cause injection injury.',
    },

    { type: 'section_head', number: '/05', title: 'Other ends: plugs, port connectors, O-seals and positionables.', anchor: 'other-ends' },
    {
      type: 'comparison_table',
      caption: 'Make-up for other end types (Swagelok Installer’s Pocket Guide)',
      columns: ['End', 'Initial make-up', 'Note'],
      rows: [
        { cells: ['Tube fitting plug', '1/4 turn past finger-tight; 1/8 turn on 1/16–3/16" and 2–4 mm', 'Later: snug by hand, then slightly with a wrench'] },
        { cells: ['Port connector, machined-ferrule end', 'Discard the original ferrules; 1/4 turn (1/8 on small sizes)', 'Joins two fittings without tube'] },
        { cells: ['O-seal male connector', 'Finger-tight to metal-to-metal contact, then slightly with a wrench', 'Leave the factory O-ring lubricant'] },
        { cells: ['Positionable elbow or tee', 'Screw in until the backup washer meets the port face, back out up to one turn to align, run the locknut down', 'O-ring seals on the port face'] },
        { cells: ['Weld-end fitting', 'Remove nut and ferrules before welding; tack at four points 90° apart', 'Use a heat sink'], highlight: true },
        { cells: ['Tapered pipe thread (NPT, BSPT)', 'Tighten to the maker’s guidance', 'Always use a thread sealant on tapered threads'] },
      ],
    },

    { type: 'section_head', number: '/06', title: 'Large sizes: preswaging and hydraulic swaging.', anchor: 'large' },
    {
      type: 'prose',
      html: '<p>Above about 1/2" the force needed to swage the ferrules grows quickly, and above 1" it is beyond hand tools:</p><ul><li><strong>5/8" to 1" (16–25 mm):</strong> Swagelok calls preswaging the ferrules onto the tube with a hydraulic swaging unit a best practice for every material except aluminium and brass.</li><li><strong>Over 1" (25 mm):</strong> a hydraulic swaging unit is required — for 1-1/4", 1-1/2" and 2", and 28, 30, 32, 38 and 50 mm. Lubricate the body threads and the back of the back ferrule, preswage, then assemble finger-tight, mark, and tighten <strong>1/2 turn</strong>, checking with the swaging unit’s own gap gauge. Parker likewise specifies its hydraulic presetting tool above 1" and requires nut lubrication from -20 inch and 25 mm sizes up.</li><li><strong>Hand preswaging tools</strong> exist for 1/4", 3/8", 1/2", 5/8" and 6, 8, 10, 12, 16 mm, useful for making up ferrules on the bench before going into a cramped panel.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Make-up, in order',
      branches: [
        { condition: 'Is the tube the right OD, wall and hardness, and round?', outcome: 'If not, stop: no amount of tightening fixes the wrong tube.' },
        { condition: 'Cut square, deburred in and out, cleaned?', outcome: 'Use a stainless cutting wheel on stainless; do not over-deburr the OD.' },
        { condition: 'Tube bottomed on the body shoulder?', outcome: 'Push it home until it stops, then finger-tighten the nut.' },
        { condition: 'Which size?', outcome: '1/4"–1" and 6–25 mm: 1-1/4 turns. 1/16"–3/16" and 2–4 mm: 3/4 turn. Over 1": preswage hydraulically, then 1/2 turn.' },
        { condition: 'First make-up?', outcome: 'Check with the gap gauge. If it enters, tighten more.' },
        { condition: 'Remake?', outcome: 'Back to the marks, then slightly further — no gauge, no fresh 1-1/4 turns.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How many turns do you tighten a compression fitting?', answer: '1-1/4 turns past finger-tight for 1/4" to 1" and 6 mm to 25 mm tube; 3/4 turn for 1/16", 1/8", 3/16" and 2–4 mm. Over 1", preswage hydraulically, then tighten 1/2 turn.' },
        { question: 'How do I know a compression fitting is tight enough?', answer: 'On first make-up, use the maker’s gap inspection gauge: if it does not enter the gap between nut and body, the fitting is tight enough. If it enters, tighten further.' },
        { question: 'How do I retighten a compression fitting that has been taken apart?', answer: 'Turn the nut back to its marked position, where resistance rises sharply, then tighten slightly — Parker says 10–20° and only after several remakes. Do not apply a fresh 1-1/4 turns.' },
        { question: 'Do I need thread sealant on a compression fitting?', answer: 'Not on the tube end — the ferrules seal there. Sealant belongs on tapered pipe threads such as NPT and BSPT, where makers say to always use it.' },
        { question: 'Can I tighten a fitting to stop a leak while the line is pressurised?', answer: 'No. Both major makers prohibit tightening or loosening under pressure. Depressurise first.' },
        { question: 'Can I reuse ferrules?', answer: 'Ferrules already swaged onto a tube stay on that tube and are reused when the joint is remade. Ferrules cannot be removed and fitted to a different tube.' },
        { question: 'What tool do I need for large tube fittings?', answer: 'Over 1" or 25 mm, a hydraulic swaging or presetting unit is required. From 5/8" to 1" it is recommended.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Fittings and parts for make-up',
      skus: ['IH-TF-FS', 'IH-TF-AM', 'IH-TF-CF', 'IH-TF-C', 'IH-TF-L', 'IH-TF-LM', 'IH-TF-I', 'IH-TB-ST6'],
    },
    { type: 'category_link', slug: 'double-ferrule-tube-fittings', label: 'Double ferrule tube fittings', blurb: 'Fittings, nuts and ferrule sets from 1/16" to 2".' },
    {
      type: 'related_articles',
      slugs: ['instrumentation-tube-fittings-guide', 'compression-fitting-leaks', 'instrumentation-tubing-pressure-ratings', 'single-vs-double-ferrule-tube-fittings', 'hydraulic-fluid-injection-injury'],
    },
    {
      type: 'standard_citation',
      standard: 'Swagelok MS-13-151',
      publisher: 'Swagelok',
      title: 'An Installer’s Pocket Guide for Swagelok Tube Fittings',
      clause: 'Rev P, pp. 11–28',
      summary: 'The maker’s own installation, gap-gauge, remake, end-type, preswaging and safety instructions used throughout this article; Parker’s catalogue 4230/4233 gives the same turns.',
      url: 'https://www.swagelok.com/downloads/webcatalogs/en/ms-13-151.pdf',
      edition: '2025',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Steps, turns and limits from the Swagelok installer’s guide and Parker’s instrument fitting catalogue and installation manual.',
    },
    {
      type: 'cta_block',
      heading: 'Need fittings, ferrules or the gap gauge?',
      body: 'Send the tube sizes and end connections on the job. We will quote the fittings, spare ferrule sets and tube from one maker.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
