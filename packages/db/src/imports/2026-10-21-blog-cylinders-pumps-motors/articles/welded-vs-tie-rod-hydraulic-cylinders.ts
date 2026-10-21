import type { BlogArticleSeed } from '../shared'

/**
 * Welded vs tie-rod cylinders. Ratings quoted from our own listings (Magister welded 3,500 psi; Rexroth CDT3
 * ISO 6020-2 160 bar nominal / 210 bar static; welded and tie-rod 3" bore column load ceiling 21,200 lbs).
 * NFPA tie-rod and ISO 6020-2 / 6022 roles checked against the research sheet of 2026-10-21.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'welded-vs-tie-rod-hydraulic-cylinders',
  title: 'Welded vs tie-rod hydraulic cylinders: construction, pressure, repair and which to buy',
  excerpt:
    'A tie-rod cylinder is bolted together and comes apart on a bench; a welded cylinder is a sealed tube that is smaller, tougher and harder to rebuild. How each is built, the standards behind them, where each one wins on mobile and industrial equipment, and how to tell which one you have.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Welded vs Tie-Rod Hydraulic Cylinders: Differences & Uses',
  seoDescription:
    'Welded and tie-rod hydraulic cylinders compared: construction, NFPA and ISO 6020/6022 standards, pressure ratings, size, side-load tolerance, serviceability and which to choose for mobile or industrial use.',
  focusKeyword: 'welded vs tie rod cylinder',
  publishedAt: '2026-10-21T07:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A tie-rod cylinder clamps its head and cap to the barrel with long external rods; a welded cylinder welds the cap to the barrel and threads or retains the gland.',
        'Tie-rod cylinders are built to interchange standards — NFPA in inch sizes, ISO 6020/6022 in metric — so a replacement from another maker drops into the same mounts.',
        'Welded cylinders are more compact for the same bore, tolerate knocks and mud, and dominate mobile, agricultural and construction equipment.',
        'Tie-rod cylinders are easier to strip and reseal on a bench and dominate presses, machine tools and fixed plant.',
        'Neither is “stronger” in general: each is rated by its maker, and long strokes on both are limited by rod buckling, not construction.',
      ],
    },
    {
      type: 'lead',
      html: 'Put the two side by side and the difference is obvious: one has four steel rods running its full length outside the barrel, the other is a plain tube with ends that look forged into it. The choice between them is less about strength than about where the cylinder lives, how it is mounted, and who will have to take it apart when the seals go.',
    },

    { type: 'section_head', number: '/01', title: 'How each one is built.', anchor: 'construction' },
    {
      type: 'prose',
      html: '<h3>Tie-rod</h3><p>A square head and a square cap sit on the ends of a honed tube. Four (on large bores, more) high-tensile tie rods pass outside the tube through the corners of both end blocks and are tensioned with nuts, clamping the ends against the tube and its static seals. Mounting features — flanges, clevises, trunnions, side lugs, or simply extended tie rods — are machined into or bolted onto the end blocks. Undo the nuts and the cylinder comes apart into its pieces.</p><h3>Welded</h3><p>The cap — usually carrying the mount, a clevis, cross tube, tang or pin eye — is welded directly to the barrel. At the other end, the gland that carries the rod seal, wiper and rod bearing is threaded into the barrel or held by a wire ring or snap ring. There are no external rods, so the outside diameter is not much more than the barrel, and the mounts are integral rather than bolted on.</p><p>A third family, <strong>mill-type</strong> cylinders, uses heavy bolted flanges instead of tie rods: very robust, serviceable, and used in steel mills and heavy presses.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Welded and tie-rod cylinders compared',
      columns: ['Feature', 'Tie-rod', 'Welded'],
      rows: [
        { cells: ['How the ends are held', 'Clamped by external tensioned tie rods', 'Cap welded to barrel; gland threaded or ring-retained'] },
        { cells: ['Envelope for a given bore', 'Larger — square ends and rods outside the tube', 'Smaller — close to the barrel diameter'], highlight: true },
        { cells: ['Interchange standard', 'NFPA (inch), ISO 6020-2 160 bar and ISO 6022 250 bar (metric)', 'Mostly maker-specific; agricultural sizes follow common patterns'] },
        { cells: ['Typical home', 'Presses, machine tools, fixed plant, factory automation', 'Mobile, agricultural, construction, trucks, lifts, log splitters'] },
        { cells: ['Field abuse', 'Tie rods can be bent or stretched by impact', 'Fewer exposed parts; tolerates mud, knocks and washdown'] },
        { cells: ['Rebuild', 'Undo nuts, slide apart, reseal on a bench', 'Gland must be unscrewed or ring removed; often needs a spanner wrench and care'] },
        { cells: ['Mounting options', 'Wide catalogue of standard mounts on the end blocks', 'Integral mounts — clevis, cross tube, tang, pin eye, swivel eye'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The standards behind tie-rod cylinders.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<p>Tie-rod cylinders’ biggest advantage is interchangeability. In inch sizes, the North American industrial pattern follows NFPA dimensions, so a cylinder from one maker fits the mounting holes, rod thread and envelope of another. In metric sizes there are two ISO series:</p><ul><li><strong>ISO 6020-2</strong> — compact series, 160 bar nominal pressure. The Rexroth CDT3 cylinders we stock are built to it: the 100/70 × 500 mm foot-mounted cylinder is rated 160 bar nominal and 210 bar maximum for static loads only.</li><li><strong>ISO 6022</strong> — heavy-duty series, 250 bar nominal, for higher forces in a stronger envelope.</li></ul><p>Those standards fix mounting dimensions, rod-end threads and envelope. They do not make every maker’s seals, cushions or rod finishes the same — two “ISO 6020-2” cylinders will bolt into the same place but are not identical inside.</p><p>Welded cylinders have nothing equivalent across the whole market. Agricultural cylinders come closest: the clevis, pin and stroke patterns used on tractors and implements are common enough that welded ag-clevis cylinders from different makers often interchange. Our welded listings (Bailey, Chief, Magister, Maxim) are grouped by mount so that matching on bore, rod, stroke, closed length and pin is direct.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Pressure and strength.', anchor: 'pressure' },
    {
      type: 'prose',
      html: '<p>It is often said that welded cylinders are rated higher than tie-rod ones. That is a generalisation about the markets, not the construction. Mobile welded cylinders are commonly rated 2,500–3,500 psi — our Magister welded range is rated 3,500 psi — and inch tie-rod cylinders for industrial use are commonly rated around 3,000 psi for hydraulic service. Metric tie-rod cylinders are 160 bar (about 2,300 psi) to ISO 6020-2 or 250 bar (about 3,600 psi) to ISO 6022.</p><p>What limits a long cylinder of either type is not pressure but buckling. Our 3" bore welded cross-tube and tie-rod listings both quote 21,200 lbs at short strokes — the full push at 3,000 psi — and fall to around 3,200–3,300 lbs at 60" of stroke. Same bore, both constructions, same physics. See <a href="/blog/hydraulic-cylinder-force-and-speed">cylinder force and speed</a> for the buckling arithmetic.</p><p>Where the constructions do differ is in how they fail under abuse. A tie-rod cylinder overloaded in pressure can stretch its tie rods and leak at the end seals; one struck from the side can bend a tie rod. A welded cylinder has no such external members, which is one reason it is preferred where a machine works among rocks, logs and other machines.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Size, weight and side load.', anchor: 'envelope' },
    {
      type: 'prose',
      html: '<p>For the same bore and stroke, a welded cylinder is narrower and usually lighter, because it has no square end blocks and no rods running outside the tube. On a loader arm, a steering link or a scissor lift, where the cylinder sits inside a structure, that compactness is often the deciding factor.</p><p>Neither construction tolerates side load well. A cylinder is a column, not a beam; side load wears the gland bearing and the piston wear ring on one side, scores the rod and barrel, and eventually lets the seals leak. Pivot mounts at both ends — clevis to clevis, cross tube to cross tube — let a cylinder align itself with its load, which is why mobile welded cylinders almost always use them. See <a href="/blog/hydraulic-cylinder-mounting-styles">mounting styles</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Repair and rebuild.', anchor: 'repair' },
    {
      type: 'prose',
      html: '<p>A tie-rod cylinder is the easier one to reseal: support it, undo the tie-rod nuts evenly, slide off the head, withdraw the rod and piston, replace the seals, and reassemble with the tie rods torqued to the maker’s figure in a cross pattern. Uneven torque distorts the end seals and the cylinder will weep at the barrel joint.</p><p>A welded cylinder needs the gland out first. Threaded glands are removed with a spanner wrench and can be stubborn after years of corrosion; ring-retained glands are pushed in slightly to release the ring. Once the gland is out the job is the same. Heat is sometimes used to free a seized gland — keep it away from seals you intend to reuse and from the barrel’s honed bore.</p><p>Either way, a cylinder is worth resealing when the barrel bore and the rod chrome are undamaged. If the rod is pitted, scored or bent, or the barrel is scored, a new cylinder is often cheaper than re-chroming and honing — especially for the common welded sizes, which are stock items.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never weld on a cylinder with oil in it.',
      body: 'Welding a mount or bracket onto a cylinder barrel that still contains oil, or that is sealed, can ignite the oil or rupture the tube, and the heat distorts the honed bore and destroys the seals. If a mount must be changed, the cylinder must be stripped and the work done to the maker’s procedure — in practice, buy the cylinder with the right mount.',
    },

    { type: 'section_head', number: '/06', title: 'How to tell which one you have, and what to order.', anchor: 'identify' },
    {
      type: 'prose',
      html: '<ul><li><strong>External rods running end to end</strong>, with nuts at one or both ends: tie-rod.</li><li><strong>Plain tube with a welded cap</strong> and a round gland at the rod end, often with spanner holes or a retaining ring: welded.</li><li><strong>Large bolted flanges</strong> at both ends of a thick barrel: mill-type.</li></ul><p>For a tie-rod replacement, the standard and the mount code are the shortcut: an NFPA or ISO 6020-2 mount code plus bore, rod, stroke and rod-end thread identifies the cylinder. For a welded replacement, measure bore, rod, stroke, retracted length (pin centre to pin centre), mount type and pin diameter at each end, port type and size. Those six numbers find the right stock cylinder far faster than a photograph of a worn-off nameplate.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which construction?',
      branches: [
        { condition: 'Mobile, agricultural, construction or truck equipment?', outcome: 'Welded. Compact, tough, with integral pivot mounts.' },
        { condition: 'Fixed plant, press, machine tool or automation line?', outcome: 'Tie-rod. Standard mounts, bench-serviceable, easy to source to the same envelope.' },
        { condition: 'Replacing a cylinder built to NFPA or ISO 6020/6022?', outcome: 'Tie-rod to the same standard and mount code — it will drop into the existing mounts.' },
        { condition: 'Heavy mill or press duty with large bores and shock?', outcome: 'Mill-type or heavy-duty ISO 6022, sized by the maker.' },
        { condition: 'Cylinder lives in mud, rock or washdown?', outcome: 'Welded, with a good wiper and rod boot where the rod is exposed.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a welded and a tie-rod cylinder?', answer: 'A tie-rod cylinder holds its ends on with external tensioned rods and comes apart by undoing nuts. A welded cylinder has its cap welded to the barrel and a threaded or ring-retained gland, so it is more compact and robust but harder to strip.' },
        { question: 'Which is stronger, welded or tie-rod?', answer: 'Neither in general. Each is rated by its maker for pressure, and long strokes on both are limited by rod buckling. Welded cylinders tolerate impact and mud better because they have no exposed tie rods.' },
        { question: 'What does NFPA mean on a cylinder?', answer: 'That its mounting dimensions follow the National Fluid Power Association pattern used for inch-size industrial tie-rod cylinders, so a cylinder from another NFPA maker fits the same mounts.' },
        { question: 'What is the difference between ISO 6020-2 and ISO 6022?', answer: 'Both are metric tie-rod cylinder standards. ISO 6020-2 is the compact 160 bar series; ISO 6022 is the heavier 250 bar series. Same idea, different envelope and pressure.' },
        { question: 'Can a welded cylinder be rebuilt?', answer: 'Yes. The gland is unscrewed or its retaining ring released, the rod and piston withdrawn and the seals replaced. It is worth doing when the rod chrome and barrel bore are undamaged.' },
        { question: 'Why do tie-rod cylinders leak at the ends?', answer: 'Usually uneven or lost tie-rod torque, which lets the end blocks lift off their static seals, or tie rods stretched by an overpressure. Retorque in a cross pattern to the maker’s figure, or replace stretched rods.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Tie-rod and welded cylinders',
      skus: ['IH-CHF-TR-3', 'IH-BLY-TR-4', 'IH-MAX-TR-25', 'IH-CYL-63-45-200', 'IH-CHF-CL-3', 'IH-MAG-WCTN-CT-3', 'IH-MAX-SE-2', 'IH-BLY-AGC-25'],
    },
    { type: 'category_link', slug: 'tie-rod-cylinders', label: 'Tie-rod cylinders', blurb: 'Inch tie-rod cylinders, 2" to 5" bore, with standard mounts.' },
    { type: 'category_link', slug: 'welded-hydraulic-cylinders', label: 'Welded cylinders', blurb: 'Clevis, cross tube, tang, pin eye, swivel eye and ag clevis.' },
    { type: 'category_link', slug: 'cylinders', label: 'All hydraulic cylinders', blurb: 'Including ISO 6020-2 metric tie-rod cylinders.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-cylinder-guide', 'hydraulic-cylinder-mounting-styles', 'hydraulic-cylinder-force-and-speed', 'hydraulic-cylinder-drift-diagnosis'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Pressure ratings and column loads from our own cylinder listings; standards roles from the maker and ISO pages listed in our research notes.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a cylinder?',
      body: 'Send bore, rod, stroke, retracted length, the mount and pin at each end, and the ports — or the standard and mount code for a tie-rod cylinder. We will match it from stock.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
