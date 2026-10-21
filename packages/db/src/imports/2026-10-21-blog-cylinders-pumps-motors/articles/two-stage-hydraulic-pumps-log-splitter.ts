import type { BlogArticleSeed } from '../shared'
import { TWO_STAGE_CURVE } from '../diagrams'

/**
 * Two-stage (Hi-Lo) gear pumps. Section displacements, 650 psi factory unload (adjustable 400–900 psi), 3,000 psi
 * maximum and 500–4,000 rpm from the Concentric Hi-Lo catalogue (HILO PUMPS-US-2011-7), read 2026-10-21. Flows
 * and horsepower computed from those displacements at 3,600 rpm. Splitter cycle uses the Magister WLSN 4" bore,
 * 1.75" rod listing. The "open-centre only" point is stated as a valve requirement, which follows from how the
 * unloading circuit works.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'two-stage-hydraulic-pumps-log-splitter',
  title: 'Two-stage hydraulic pumps: how Hi-Lo log splitter pumps work, kick-down pressure and engine size',
  excerpt:
    'A two-stage pump gives a small engine a fast ram and a strong one: two gear sections together at low pressure, the small one alone at high pressure. How the unloading valve works, flows and horsepower for every common size from 5 to 28 gpm, kick-down settings, matching the engine and cylinder, and the faults that make a splitter slow or weak.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Two-Stage Hydraulic Pump (Hi-Lo) for Log Splitters: Guide',
  seoDescription:
    'How two-stage Hi-Lo gear pumps work, kick-down pressure, flow and horsepower for 5–28 gpm sizes, engine and cylinder matching for log splitters, rotation and mounting, and troubleshooting slow or weak splitters.',
  focusKeyword: 'two stage hydraulic pump',
  publishedAt: '2026-10-21T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A two-stage pump has a large low-pressure gear section and a small high-pressure section on one shaft; below the unload pressure both feed the circuit, above it only the small one does.',
        'Concentric’s Hi-Lo pumps are factory set to unload at 650 psi, adjustable from 400 to 900 psi, with 3,000 psi maximum working pressure.',
        'A 16 gpm pump is 16.1 gpm combined and 4.0 gpm on the high-pressure section at 3,600 rpm, which needs about 7 hydraulic horsepower at either end of the cycle.',
        'That is the point: the engine sees roughly the same load fast and empty as it does slow and splitting, so a small engine can drive a large flow.',
        'A splitter that is slow on the approach has a low-volume problem; one that is weak on the split has a high-pressure, relief or engine problem.',
      ],
    },
    {
      type: 'lead',
      html: 'A log splitter needs two different machines in one: a fast ram that runs out to meet the log and back again without wasting the operator’s time, and a slow, strong ram that pushes the wedge through knotted hardwood. A single gear pump big enough for the first would need an engine several times larger to do the second. The two-stage pump is the answer, and it is used well beyond splitters — anywhere a cylinder needs speed at low load and force at the end of its stroke.',
    },

    { type: 'section_head', number: '/01', title: 'How a two-stage pump works.', anchor: 'principle' },
    {
      type: 'prose',
      html: '<p>Two gear sections share one shaft and one inlet. The large section delivers most of the flow; the small one delivers less but is built to reach the full working pressure. Inside the pump body are an <strong>unloading valve</strong> and a <strong>check valve</strong>.</p><ol><li><strong>Low pressure, high volume.</strong> While the ram is moving freely, pressure stays low and both sections’ flows combine. The ram runs fast.</li><li><strong>Kick-down.</strong> When the wedge meets the log and pressure rises to the unload setting, the unloading valve opens and dumps the large section’s flow back to the inlet at almost no pressure. The check valve stops high-pressure oil from the small section flowing back into it.</li><li><strong>High pressure, low volume.</strong> The small section alone now feeds the cylinder, and pressure climbs as far as the log demands, up to the relief setting. The ram slows right down and pushes hard.</li><li><strong>Return.</strong> As soon as the load drops — the log splits — pressure falls below the unload setting and the pump returns to combined flow.</li></ol><p>You can hear the change: the engine note drops slightly at kick-down and the ram visibly slows.</p>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'Flow against pressure for a 16 gpm two-stage pump at 3,600 rpm. Combined flow up to the 650 psi unload point, then the high-pressure section alone up to 3,000 psi. The shaded areas show the hydraulic horsepower at the two corners — almost the same.',
      alt: 'Flow versus pressure curve for a 16 gpm two-stage pump. From 0 to 650 psi the pump delivers 16.1 gpm. At 650 psi it kicks down to 4.0 gpm, which it delivers up to 3,000 psi. Hydraulic power is about 6.1 horsepower at 650 psi and 16.1 gpm, and about 7.0 horsepower at 3,000 psi and 4.0 gpm.',
      svg: TWO_STAGE_CURVE,
    },

    { type: 'section_head', number: '/02', title: 'Sizes, flows and horsepower.', anchor: 'sizes' },
    {
      type: 'prose',
      html: '<p>Two-stage splitter pumps are named by their combined flow at 3,600 rpm, the governed speed of most small petrol engines. The table below uses the section displacements in Concentric’s Hi-Lo catalogue, with flow computed at 3,600 rpm and hydraulic horsepower computed at both corners of the curve: combined flow at the 650 psi unload point, and the high-pressure section at 3,000 psi.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Two-stage pump sizes at 3,600 rpm (Concentric section displacements; flows and HP computed)',
      columns: ['Nominal', 'HP section (in³/rev)', 'LP section (in³/rev)', 'Combined flow', 'High-pressure flow', 'Hyd. HP @ 650 psi', 'Hyd. HP @ 3,000 psi'],
      rows: [
        { cells: ['5 gpm', '0.065', '0.258', '5.0 gpm', '1.0 gpm', '1.9', '1.8'] },
        { cells: ['7 gpm', '0.065', '0.388', '7.1 gpm', '1.0 gpm', '2.7', '1.8'] },
        { cells: ['9 gpm', '0.194', '0.388', '9.1 gpm', '3.0 gpm', '3.4', '5.3'] },
        { cells: ['11 gpm', '0.194', '0.517', '11.1 gpm', '3.0 gpm', '4.2', '5.3'] },
        { cells: ['13 gpm', '0.194', '0.647', '13.1 gpm', '3.0 gpm', '5.0', '5.3'] },
        { cells: ['16 gpm', '0.258', '0.776', '16.1 gpm', '4.0 gpm', '6.1', '7.0'], highlight: true },
        { cells: ['22 gpm', '0.465', '0.930', '21.7 gpm', '7.2 gpm', '8.2', '12.7'] },
        { cells: ['28 gpm', '0.465', '1.395', '29.0 gpm', '7.2 gpm', '11.0', '12.7'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Hydraulic horsepower is psi × gpm ÷ 1,714. The engine has to supply that plus the pump’s losses — divide by about 0.85 — and small air-cooled engines lose power in heat, so leave margin above the result. A 16 gpm pump needs about 7 hydraulic HP, or a little over 8 HP at the shaft; the 22 and 28 gpm pumps, which share the larger high-pressure section, need about 15 HP at the shaft at full pressure.</p><p>Two things in the table matter more than the headline flow. The <strong>high-pressure flow</strong> sets how fast the ram moves while it is actually splitting, and it jumps in steps — 1, 3, 4 and 7.2 gpm — rather than rising with the nominal size. And the horsepower is set mostly by the high-pressure section, so going from 11 to 13 gpm buys a faster approach for no extra engine.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The unload setting is adjustable — within limits.',
      body: 'Concentric presets its Hi-Lo pumps to unload at 650 psi and allows adjustment from 400 to 900 psi. Raise it and the ram stays fast further into a tough log but the engine works harder before kick-down; lower it and the engine is spared but the pump drops into low flow sooner. Other makers set their own figure, so check the pump’s data before adjusting.',
    },

    { type: 'section_head', number: '/03', title: 'Matching the cylinder.', anchor: 'cylinder' },
    {
      type: 'prose',
      html: '<p>The pump sets speed; the cylinder sets force and, with the pump, the cycle time. Take our Magister log-splitter cylinder: 4" bore, 1.75" rod, 24" stroke, 3,500 psi rated.</p><ul><li><strong>Force</strong> at 3,000 psi: 12.57 in² × 3,000 = 37,699 lbf, which splitter makers would call about 19 tons.</li><li><strong>Approach</strong> on a 16 gpm pump: 231 × 16 ÷ 12.57 = 294 in/min, about 4.9 in/s. The full stroke takes about 5 seconds if nothing resists it.</li><li><strong>Splitting</strong> on the 4.0 gpm high-pressure section: about 1.2 in/s.</li><li><strong>Return</strong> on the annulus (10.16 in²) at full flow: about 6.1 in/s, roughly 4 seconds.</li></ul><p>A 5" bore cylinder on the same pump pushes about 59,000 lbf at 3,000 psi but approaches and splits about 36% slower. Doubling the pump size does not double the splitting speed unless the high-pressure section grows too — check that column, not the nominal flow.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Installing a two-stage pump.', anchor: 'installation' },
    {
      type: 'prose',
      html: '<ul><li><strong>Rotation.</strong> Viewed from the shaft end; most splitter pumps are clockwise. A horizontal-shaft engine’s output turns anticlockwise viewed from the shaft end on many engines — check, because a wrong-hand pump will not prime.</li><li><strong>Mounting.</strong> Smaller pumps (5–16 gpm in Concentric’s range) use a 4-bolt mount and a 1/2" shaft with a Woodruff key; the 22 and 28 gpm pumps use an SAE A 2-bolt flange and a 5/8" keyed shaft. Mount with a bell housing and a jaw coupling so the engine crankshaft does not carry side load.</li><li><strong>Inlet.</strong> The inlet is larger than the outlet for a reason: 1" NPTF on the larger pumps. Keep the suction hose short and at least that size, with the tank above the pump.</li><li><strong>Valve.</strong> Use an open-centre valve, which sends flow to tank in neutral. A closed-centre valve dead-heads the pump against its relief whenever the lever is centred.</li><li><strong>Relief.</strong> Set the circuit relief at or below the pump’s 3,000 psi maximum and below the cylinder’s rating.</li></ul>',
    },

    { type: 'section_head', number: '/05', title: 'Troubleshooting a slow or weak splitter.', anchor: 'troubleshooting' },
    {
      type: 'comparison_table',
      caption: 'Symptoms and first checks',
      columns: ['Symptom', 'Likely cause', 'First check'],
      rows: [
        { cells: ['Slow approach and return, normal splitting force', 'Low-volume section not contributing: unloading valve stuck open, or inlet starving', 'Unload setting; suction hose, strainer and oil level'] },
        { cells: ['Fast approach, stalls on tough logs', 'Relief set low, high-pressure section worn, or engine bogging', 'Relief setting with a gauge; engine speed under load'], highlight: true },
        { cells: ['Engine stalls at kick-down', 'Unload set too high for the engine, or engine down on power', 'Lower the unload setting within the pump’s range'] },
        { cells: ['Whine, foamy oil, erratic speed', 'Air in the inlet — loose suction fitting or low tank', 'Tighten suction fittings; check oil level'] },
        { cells: ['Oil hot after short use', 'Closed-centre valve or relief opening in neutral', 'Valve type; flow to tank in neutral'] },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How does a two-stage hydraulic pump work?', answer: 'Two gear sections share one shaft. Below the unload pressure both deliver to the circuit for high flow; above it, an internal unloading valve dumps the large section and a check valve isolates it, so the small section alone delivers high pressure at low flow.' },
        { question: 'What is kick-down pressure?', answer: 'The pressure at which the pump switches from combined flow to the high-pressure section alone. Concentric presets its Hi-Lo pumps at 650 psi, adjustable from 400 to 900 psi.' },
        { question: 'What size engine do I need for a 16 gpm two-stage pump?', answer: 'About 7 hydraulic horsepower at either end of the cycle, so a little over 8 HP at the shaft, with margin for a small engine’s losses in heat. The 22 and 28 gpm pumps need about 15 HP at the shaft.' },
        { question: 'Does a bigger two-stage pump split faster?', answer: 'Only if its high-pressure section is bigger. The approach speed follows the combined flow; splitting speed follows the high-pressure flow, which jumps in steps between sizes.' },
        { question: 'Can I use a closed-centre valve with a two-stage pump?', answer: 'No. A two-stage splitter pump needs an open-centre valve that sends flow to tank in neutral; a closed-centre valve dead-heads it against the relief.' },
        { question: 'What is the maximum pressure of a log splitter pump?', answer: 'Concentric rates its Hi-Lo pumps at 3,000 psi maximum working pressure. Set the relief at or below that and below the cylinder’s rating.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Two-stage pumps and splitter cylinders',
      skus: ['IH-HDX-TWO', 'IH-ANF-TWO', 'IH-BLY-TWO', 'IH-DFC-GP-CBN', 'IH-MAG-WLSN-LS-4', 'IH-MAG-WLSN-LS-5'],
    },
    { type: 'category_link', slug: 'two-stage-hydraulic-pumps', label: 'Two-stage pumps', blurb: 'Hi-Lo gear pumps from 5 to 28 gpm.' },
    { type: 'category_link', slug: 'telescopic-specialty-cylinders', label: 'Log splitter and specialty cylinders', blurb: '4" and 5" bore splitter cylinders, 3,500 psi.' },
    {
      type: 'related_articles',
      slugs: ['how-to-size-a-hydraulic-pump', 'hydraulic-pump-types-gear-vane-piston', 'hydraulic-cylinder-force-and-speed'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Section displacements, unload range, maximum pressure and mounts from Concentric’s Hi-Lo catalogue; flows, horsepower and cycle times computed.',
    },
    {
      type: 'cta_block',
      heading: 'Building or repairing a splitter?',
      body: 'Send the engine horsepower, the cylinder bore and stroke, and the speed you want. We will match the pump, the cylinder and the valve, and quote them together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
