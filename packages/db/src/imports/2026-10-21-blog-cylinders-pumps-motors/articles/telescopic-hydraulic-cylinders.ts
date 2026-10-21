import type { BlogArticleSeed } from '../shared'
import { TELESCOPIC_STAGES } from '../diagrams'

/**
 * Telescopic cylinders. Stage force and speed computed for an illustrative 4-stage cylinder (6/5/4/3" stage
 * diameters) at 2,000 psi and 20 gpm, 2026-10-21. Strokes quoted from our Custom Hoists listing (single-acting
 * 71.94"–219.62"); dump hoist rating from the Magister HTCN listing (5" bore, 3,500 psi).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'telescopic-hydraulic-cylinders',
  title: 'Telescopic hydraulic cylinders: how stages work, single vs double-acting, and sizing a dump hoist',
  excerpt:
    'A telescopic cylinder gets a long stroke out of a short body by nesting stages inside each other. Why the biggest stage always moves first, why force falls and speed rises as each stage extends, when a hoist needs to be double-acting, and how to size one for a tipping body without overloading the last stage.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Telescopic Hydraulic Cylinders: Stages, Types & Sizing',
  seoDescription:
    'How telescopic hydraulic cylinders work: stage sequence, force and speed per stage, single-acting vs double-acting, dump body hoist sizing, side-load limits, bleeding and maintenance.',
  focusKeyword: 'telescopic hydraulic cylinder',
  publishedAt: '2026-10-21T08:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Stages extend largest first, because the largest area needs the least pressure to move the load; then each smaller stage in turn.',
        'Force available falls and speed rises with every stage: at 2,000 psi, a 6" stage pushes about 56,500 lbf and a 3" stage about 14,100 lbf.',
        'That suits tipping bodies, where the load is heaviest at the start of the lift and lightest at the end.',
        'Single-acting telescopics return under the weight of the body; double-acting ones power down and are used where gravity cannot be relied on.',
        'Telescopics tolerate almost no side load. A tipper on uneven ground, or a body without a stabiliser, is how they bend.',
      ],
    },
    {
      type: 'lead',
      html: 'A tipping trailer needs a cylinder that will push the front of the body up through several metres of travel, yet fit under the body when it is down. A single-stage cylinder with that stroke would be as long retracted as it is extended. The answer is to nest several tubes inside each other — stages — so the cylinder collapses to a fraction of its extended length. That design brings its own rules about force, speed and side load.',
    },

    { type: 'section_head', number: '/01', title: 'How the stages work.', anchor: 'stages' },
    {
      type: 'prose',
      html: '<p>A telescopic cylinder is a set of concentric tubes, each sliding inside the next. The outermost is the barrel, fixed to the chassis; the innermost is the plunger, fixed to the body. Each tube has a bearing and seal at its top and a stop collar at its bottom so it cannot leave the one outside it.</p><p>Oil enters at the base and acts on every stage at once. The stage with the largest area needs the lowest pressure to lift the load — force is pressure × area — so it moves first, carrying all the smaller stages with it. (On retraction the order reverses: the smallest stage comes home first.) When it reaches its stop, pressure rises until the next-largest stage can lift the load, and so on down to the plunger. You can hear and see it: a pause, a small pressure step, and the next stage starts.</p><p>Our single-acting telescopic hoists are listed with strokes from about 72" to about 220" — up to 18 feet of travel from a cylinder that closes to a fraction of that.</p>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'An illustrative four-stage telescopic cylinder at 2,000 psi and 20 gpm. Each stage pushes less and moves faster than the one before it, so the lift starts strong and slow and finishes light and fast.',
      alt: 'Chart of a four-stage telescopic cylinder at 2,000 psi and 20 gpm. Stage 1, 6 inch diameter: 56,549 lbf, 2.7 inches per second. Stage 2, 5 inch: 39,270 lbf, 3.9 in/s. Stage 3, 4 inch: 25,133 lbf, 6.1 in/s. Stage 4, 3 inch: 14,137 lbf, 10.9 in/s.',
      svg: TELESCOPIC_STAGES,
    },

    { type: 'section_head', number: '/02', title: 'Force falls, speed rises.', anchor: 'force' },
    {
      type: 'prose',
      html: '<p>Each stage has a smaller area than the one outside it, so at the same pressure it pushes less hard, and on the same flow it moves faster. For an illustrative four-stage cylinder with stages of 6", 5", 4" and 3" effective diameter, at 2,000 psi and 20 gpm:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Illustrative four-stage cylinder at 2,000 psi and 20 gpm',
      columns: ['Stage', 'Diameter', 'Area (in²)', 'Force @ 2,000 psi (lbf)', 'Speed @ 20 gpm (in/s)'],
      rows: [
        { cells: ['1 (largest)', '6"', '28.27', '56,549', '2.7'], highlight: true },
        { cells: ['2', '5"', '19.63', '39,270', '3.9'] },
        { cells: ['3', '4"', '12.57', '25,133', '6.1'] },
        { cells: ['4 (plunger)', '3"', '7.07', '14,137', '10.9'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>This is what makes telescopics a good fit for tipping. At the start of a tip, the body is level, its full weight is on the hoist, and the hoist is working at a poor angle to the pivot — the highest force demand of the whole cycle. That is exactly when the largest stage is working. As the body rises, the load slides rearward toward the tailgate, more of the weight is carried by the rear hinge, and the hoist force needed falls. By the time the small stages are working, the demand is light.</p><p>The same logic tells you what to check. The pressure needed to <em>start</em> each stage is the force needed at that point in the lift divided by that stage’s area. The last stage needs the highest pressure. If the body is overloaded, or the load has frozen or stuck to the floor so it does not slide back, the force needed late in the lift stays high and the small stages can demand more pressure than the system delivers — the tip stalls part-way, or the relief valve opens.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Single-acting or double-acting?', anchor: 'action' },
    {
      type: 'prose',
      html: '<p>Most dump-body and tipping-trailer hoists are <strong>single-acting</strong>: oil lifts, and the weight of the empty body pushes the stages home again when the valve opens to tank. They need one hose, a simple dump valve and the 2-line or 3-line dump pump that goes with it (see <a href="/blog/dump-pumps-and-pto-pumps">dump pumps and PTO pumps</a>).</p><p><strong>Double-acting</strong> telescopics have a second set of passages so oil can power the stages down as well as up. A blocked retract line on one is dangerous: Parker warns the retract side can intensify pressure ten times or more. They are used where gravity cannot be relied on to retract the cylinder: horizontal pushers and ejector bodies, bodies that tip past centre, cylinders mounted at shallow angles, and any machine where the retract speed must be controlled rather than left to the load. They cost more and are more complex to bleed and to seal.</p><p>We list both, by Custom Hoists part number, alongside welded dump-hoist cylinders such as the Magister HTCN (5" bore, 3,500 psi) for smaller bodies that do not need a telescopic’s stroke.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Sizing a hoist for a tipping body.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<p>Hoist makers size telescopics from the body and its payload, not from the cylinder alone. What they need, and what we need to quote one:</p><ul><li><strong>Body length and type</strong> — end tipper or side tipper, and the hinge position.</li><li><strong>Payload</strong> and the material — sand, aggregate, asphalt, scrap, grain — because density and how it slides change the force late in the lift.</li><li><strong>Mounting dimensions</strong> — the distance from the hinge to the hoist’s upper mount, and the height available under the body for the retracted cylinder and its mounts.</li><li><strong>Tipping angle</strong> needed to discharge the material.</li><li><strong>System pressure</strong> the pump and relief deliver.</li></ul><p>From those, the hoist’s stroke follows from the geometry and the required angle, and the stage sizes follow from the force needed at the start and through the lift. A replacement should match the old cylinder’s stroke, retracted length, stage count, mounts and capacity rating — a hoist that is “nearly the same” stroke will either not reach the tipping angle or overrun its stops.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Side load: the thing telescopics do not forgive.', anchor: 'side-load' },
    {
      type: 'prose',
      html: '<p>Parker’s telescopic manual is blunt about it: the cylinder “is not a structural member” and must never be used to stabilise the body. Every stage joint is a bearing and a clearance. Add four or five of them in series over several metres of extension and the fully extended cylinder is a long, slender, multi-jointed column with almost no tolerance for bending. Side load comes from:</p><ul><li><strong>Tipping on uneven ground</strong> — one side of the chassis lower than the other, so the body tries to fall sideways at full height.</li><li><strong>Load that sticks to one side</strong> of the body and discharges unevenly.</li><li><strong>A missing or worn stabiliser</strong>, scissor arm or body guide, which exists precisely to take side load off the hoist.</li><li><strong>Wind</strong> on a tall raised body.</li></ul><p>The geometry is unforgiving. Parker’s figures: wheels 3.5–4" higher on one side put the top of a fully raised body 12–14" off-centre, and a 4" height difference across an 8 ft axle is a rollover risk. On articulated units, dump only with tractor and trailer in a straight line. A load that hangs up in the body can tip the whole unit — lower immediately. And never “hump” a stuck load or brake hard with the body raised: the pressure spike can bulge or split the larger stages.</p><p>Tip on level, firm ground; make sure the load is free to slide; keep the stabiliser in good condition; never move the vehicle with the body raised.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never work under a raised body without a prop.',
      body: 'A telescopic hoist can lose height suddenly if a hose, seal or valve fails. Use the body prop or a rated support before going under a raised body, and never rely on the hoist alone.',
    },

    { type: 'section_head', number: '/06', title: 'Installing and maintaining.', anchor: 'maintenance' },
    {
      type: 'prose',
      html: '<ul><li><strong>Bleed it.</strong> Air trapped in the stages makes the lift jerky and the stage changes violent. Parker states most of its telescopics self-bleed after about ten full no-load cycles; others have a bleed screw near the top of the outer barrel. Follow the maker’s procedure, with the body supported.</li><li><strong>Respect the pressure rating.</strong> Parker’s telescopics are normally rated 2,000 psi unless the factory approves more, with a 2,500 psi proof test — lower than many single-stage cylinders.</li><li><strong>Give a double-acting unit enough flow.</strong> Every stage retracts on the plunger’s annulus area, and Parker says double-acting telescopics normally need at least 15 gpm to retract properly. The cap end returns more oil than goes in, so a dump-to-tank valve may be needed.</li><li><strong>Watch oil temperature.</strong> Parker gives 50–60 °C as optimum, about 82 °C as the recommended maximum and 93 °C as the limit.</li><li><strong>Check oil volume.</strong> A large telescopic holds a lot of oil when extended. The reservoir must hold enough to fill the cylinder fully and still keep the pump inlet covered at full tip.</li><li><strong>Keep the stages clean.</strong> Wash mud and sand off the extended stages before lowering; grit carried into the bearings scores every stage below it.</li><li><strong>Check the mounts.</strong> Worn pins and bushes at the top and bottom mounts add side load. Replace them before they become slop.</li><li><strong>Watch for stage drift and weeping</strong> at the stage seals — the same diagnosis applies as for any cylinder (see <a href="/blog/hydraulic-cylinder-drift-diagnosis">cylinder drift</a>).</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How does a telescopic hydraulic cylinder work?', answer: 'Several tubes nest inside each other. Oil enters at the base; the largest stage extends first because its area needs the least pressure to lift the load, then each smaller stage in turn until the plunger is out.' },
        { question: 'Why does the largest stage extend first?', answer: 'Force is pressure × area, so the stage with the largest area moves the load at the lowest pressure. Pressure rises in steps as each stage reaches its stop and the next, smaller stage takes over.' },
        { question: 'What is the difference between single and double-acting telescopic cylinders?', answer: 'A single-acting telescopic is powered up and returned by the weight of the load or body. A double-acting telescopic is powered both ways, for bodies or pushers that gravity cannot retract.' },
        { question: 'Why is my dump body stalling part-way up?', answer: 'Each smaller stage needs more pressure for the same force. If the body is overloaded, or the load sticks and does not slide back, the late stages need more pressure than the system gives and the relief valve opens.' },
        { question: 'How do I size a telescopic cylinder for a tipper?', answer: 'From the body length, payload and material, hinge-to-mount geometry, tipping angle and system pressure. For a replacement, match stroke, retracted length, stage count, mounts and rated capacity exactly.' },
        { question: 'Why do telescopic cylinders bend?', answer: 'Side load at full extension — tipping on uneven ground, a load that discharges unevenly, a worn stabiliser or wind on a raised body. Telescopics have almost no tolerance for it.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Telescopic and dump-hoist cylinders',
      skus: ['IH-CHS-TELESCOPIC-SA', 'IH-CHS-TELESCOPIC-DA', 'IH-MAG-HTCN-DH-5', 'IH-PMC-DUMP', 'IH-HVM-DUMP'],
    },
    { type: 'category_link', slug: 'telescopic-specialty-cylinders', label: 'Telescopic, loader and specialty cylinders', blurb: 'Telescopic hoists, dump hoists, loader, plow and top-link cylinders.' },
    { type: 'category_link', slug: 'dump-clutch-pto-pumps', label: 'Dump, clutch and PTO pumps', blurb: 'The pumps that drive tipping bodies.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-cylinder-guide', 'dump-pumps-and-pto-pumps', 'hydraulic-cylinder-force-and-speed', 'hydraulic-cylinder-drift-diagnosis'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Stage force and speed computed for an illustrative cylinder; strokes and ratings from our telescopic and dump-hoist listings.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a hoist?',
      body: 'Send the old hoist’s part number or its stroke, retracted length, stage count and mounts, with the body length and payload. We will match it and quote the pump and valve with it if you need them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
