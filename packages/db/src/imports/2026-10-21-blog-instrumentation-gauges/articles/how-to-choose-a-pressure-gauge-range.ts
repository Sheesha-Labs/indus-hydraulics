import type { BlogArticleSeed } from '../shared'

/**
 * Gauge range selection. Middle-third rule (EN 837-2 via SAMSON AB 09; WIKA IN 00.05 excerpt); Ashcroft ~2× rule;
 * Enerpac ≤75 % rule; EN 837 permissible load by nominal size (NG 40–80: ¾ steady, ⅔ cyclic, brief full scale;
 * NG 100–250: full scale steady, 0.9 cyclic) and 1.3× overpressure (SAMSON; WIKA 23x manual); temperature error
 * (WIKA 0.4 %/10 K, Ashcroft 0.4 %/25 °F); pulsation remedies (Ashcroft, Enerpac). Worked examples computed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-choose-a-pressure-gauge-range',
  title: 'How to choose a pressure gauge range: the middle-third rule, pulsation, overpressure and accuracy',
  excerpt:
    'A gauge pinned near full scale wears out and lies; a gauge with a range ten times the pressure cannot be read. The middle-third rule, how much of the scale small and large gauges may use under steady and pulsating pressure, overpressure limits, how range and accuracy class combine into an error in real units, and what to do about pulsation — with worked examples.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Choose a Pressure Gauge Range: Rules & Examples',
  seoDescription:
    'Pressure gauge range selection: middle-third and twice-operating-pressure rules, EN 837 limits for steady and pulsating pressure by dial size, overpressure, accuracy in real units, temperature error and pulsation dampers.',
  focusKeyword: 'pressure gauge range selection',
  publishedAt: '2026-10-21T14:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Choose a range that puts normal working pressure in the middle third of the scale; for most jobs that means a full scale of about twice the working pressure.',
        'On 40–80 mm gauges, EN 837 allows steady pressure to three-quarters of full scale and pulsating pressure to two-thirds; on 100 mm and larger, steady to full scale and pulsating to 0.9.',
        'Bourdon gauges are designed to withstand about 1.3 × full scale — not more. Spikes beyond that distort the tube.',
        'The accuracy class is a percentage of the range, so a needlessly high range multiplies the error in real units.',
        'Pulsation shows up as pointer flutter or, at high frequency, as a zero that creeps upscale. Fill the gauge, add a snubber or a throttle screw, or both.',
      ],
    },
    {
      type: 'lead',
      html: 'Range is the most important number on a pressure gauge and the one most often chosen by habit — 0–400 bar because that is what the last one said, 0–10,000 psi because it was in stock. The right range is a balance between two failures: a gauge worked too close to its limit fatigues and drifts, and a gauge with too much range cannot resolve the pressure you actually care about.',
    },

    { type: 'section_head', number: '/01', title: 'The middle-third rule.', anchor: 'middle-third' },
    {
      type: 'prose',
      html: '<p>EN 837-2, the European selection and installation standard, says the operating pressure to be expected should lie within the <strong>middle third</strong> of the indication range. WIKA’s selection guidance says the same. Ashcroft’s rule of thumb — a range of about twice the maximum operating pressure — puts the pointer at mid-dial, inside that third. Enerpac, for 10,000 psi hydraulics, says gauges should be operated at pressures that do not normally exceed 75% of full scale.</p><p>The reasons are physical. Near the top of the scale the Bourdon tube is near its elastic limit, and every cycle fatigues it; a range too low also leaves no headroom for a spike. Near the bottom, the pointer has barely moved, small changes are unreadable, and — for ASME Grade A and B gauges — the permitted error is at its largest.</p>',
    },

    { type: 'section_head', number: '/02', title: 'How much of the scale you may use.', anchor: 'limits' },
    {
      type: 'comparison_table',
      caption: 'Permissible load by nominal size (EN 837, as summarised by SAMSON and WIKA)',
      columns: ['Nominal size', 'Steady pressure', 'Cyclic (pulsating) pressure', 'Briefly'],
      rows: [
        { cells: ['40, 50, 63, 80 mm', 'Up to 3/4 of full scale', 'Up to 2/3 of full scale', 'Full scale'], highlight: true },
        { cells: ['100, 160, 250 mm', 'Up to full scale', 'Up to 0.9 × full scale', '—'] },
        { cells: ['All Bourdon gauges', 'Overpressure capability about 1.3 × full scale', '', ''] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The common rule “never more than 75% steady or two-thirds pulsating” is correct for small gauges only. Larger gauges are built to use more of their scale. But those are limits, not targets: the middle-third rule is about where the pointer should normally sit, and it applies to every size. And an overpressure capability of about 1.3 × full scale means a spike above that will permanently distort the tube — the gauge will read wrong from then on, without any visible damage.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Worked examples.', anchor: 'examples' },
    {
      type: 'prose',
      html: '<h3>Hydraulic power unit, 150 bar working, gear pump, 63 mm gauge</h3><p>The pressure pulses, so the 2/3 limit applies: full scale ≥ 150 ÷ 0.67 = 225 bar. The middle third of a 0–250 bar gauge is 83–167 bar, and 150 bar sits in it. Choose <strong>0–250 bar</strong>. At Class 1.6 the gauge reads within ±4 bar.</p><p>A 0–600 bar gauge on the same unit would sit at a quarter of scale, outside the middle third, and Class 1.6 would allow ±9.6 bar — more than twice the error, for no benefit.</p><h3>3,000 psi relief setting, 2,500 psi working, 4" gauge</h3><p>Ashcroft’s 2× rule points to 0–5,000 psi; Enerpac’s 75% rule says at least 3,333 psi. A 0–5,000 psi gauge puts 2,500 psi exactly mid-dial and keeps a relief spike at 60% of scale. At 1% FSD it reads within ±50 psi.</p><h3>10,000 psi jacking system</h3><p>The pump’s maximum is 10,000 psi; if the job normally runs at 6,000–7,000 psi, a 0–10,000 psi gauge puts it at 60–70% — acceptable to Enerpac’s 75% rule on a 4" gauge. To read the low end accurately as well, a 0–15,000 psi gauge is not the answer; a second, lower-range gauge or a digital gauge is.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Error in real units for common ranges and classes',
      columns: ['Range', 'Class 1.0 / 1% FSD', 'Class 1.6 / 1.6% FSD', 'Class 2.5'],
      rows: [
        { cells: ['0–100 bar', '±1 bar', '±1.6 bar', '±2.5 bar'] },
        { cells: ['0–250 bar', '±2.5 bar', '±4 bar', '±6.25 bar'], highlight: true },
        { cells: ['0–400 bar', '±4 bar', '±6.4 bar', '±10 bar'] },
        { cells: ['0–600 bar', '±6 bar', '±9.6 bar', '±15 bar'] },
        { cells: ['0–5,000 psi', '±50 psi', '±80 psi', '±125 psi'] },
        { cells: ['0–10,000 psi', '±100 psi', '±160 psi', '±250 psi'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Temperature adds error.', anchor: 'temperature' },
    {
      type: 'prose',
      html: '<p>The class error is defined at a reference temperature of 20 °C (68 °F). Away from it, the element’s stiffness changes and an extra error must be added: WIKA gives 0.4% of span per 10 K, Ashcroft about 0.4% per 25 °F. A Class 1.6 gauge on a skid at 50 °C — 30 K above reference — may carry an extra 1.2% of span on WIKA’s figure, nearly doubling its error. Shade gauges from direct sun where the reading matters, and do not rely on a field gauge as a calibration reference.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Pulsation and vibration.', anchor: 'pulsation' },
    {
      type: 'prose',
      html: '<p>Pump discharge lines, reciprocating compressors and hammering hydraulic tools all pulse. Low-frequency pulsation makes the pointer flutter and is obvious; high-frequency pulsation can be invisible, and Ashcroft notes its only symptom may be an upscale zero shift as the movement wears. Remedies, roughly in order:</p><ul><li><strong>Liquid-filled gauge</strong> — glycerine or silicone damps the pointer and protects the movement from vibration and shock.</li><li><strong>Throttle screw or plug</strong> in the socket — a small restriction that smooths the pressure reaching the tube.</li><li><strong>Snubber</strong> — a porous metal disc (Ashcroft grades its discs for oil, water and light oil, and air, steam and gas) or a pulsation dampener with selectable orifices.</li><li><strong>Needle valve</strong> — adjustable throttling for severe duty, and an isolation valve at the same time. Enerpac recommends snubbers or needle valves on high-cycle hydraulic work, and makes an adjustable snubber valve that also stops the pointer snapping back when load is released.</li><li><strong>Remote mounting</strong> on a capillary, in extreme vibration — capillaries damp well but can plug.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a range',
      branches: [
        { condition: 'What is the normal working pressure?', outcome: 'Start with a full scale about twice that, so the pointer sits mid-dial.' },
        { condition: 'Does the pressure pulse?', outcome: 'Small gauges: keep it below 2/3 of full scale. Large gauges: below 0.9. Add fill, a snubber or a throttle.' },
        { condition: 'What is the highest pressure the gauge can see — relief, spikes, test?', outcome: 'Keep it below full scale; never above about 1.3 × full scale.' },
        { condition: 'What error can you accept, in bar or psi?', outcome: 'Class × range. If too large, pick a better class or a lower range, not a bigger dial.' },
        { condition: 'Hot location?', outcome: 'Add about 0.4% of span per 10 K above 20 °C, and shade the gauge.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What range pressure gauge should I use?', answer: 'One that puts normal working pressure in the middle third of the dial — usually a full scale about twice the working pressure.' },
        { question: 'Can a pressure gauge be used at full scale?', answer: 'Briefly on small gauges; for steady pressure, EN 837 allows up to 3/4 of full scale on 40–80 mm gauges and up to full scale on 100 mm and larger. Normal working pressure should still sit mid-dial.' },
        { question: 'How much overpressure can a gauge take?', answer: 'Bourdon gauges are designed to withstand about 1.3 × full scale. Beyond that the element can be permanently distorted.' },
        { question: 'Why does my gauge pointer flutter?', answer: 'Pressure pulsation or vibration. Use a liquid-filled gauge, a snubber or throttle screw, or a needle valve to damp it.' },
        { question: 'Does a higher range gauge last longer?', answer: 'It is less stressed, but it reads less accurately in real units and is harder to read at low pressure. Too high a range is as wrong as too low.' },
        { question: 'How do I work out a gauge’s error?', answer: 'Multiply the accuracy class or % FSD by the full-scale range: Class 1.6 on 0–250 bar is ±4 bar. Add temperature error away from 20 °C.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Gauges in common ranges',
      skus: ['IH-DFC-CF-25-14NPT', 'IH-DFC-CFC-4-12NPT', 'IH-GA-201L', 'IH-GA-202L', 'IH-ENE-GAUGE-G25', 'IH-PG-12NPT-BM-6IN-10K'],
    },
    { type: 'category_link', slug: 'ic-pressure-gauges', label: 'Pressure gauges', blurb: 'Vacuum to 15,000 psi, dry and glycerine-filled.' },
    {
      type: 'related_articles',
      slugs: ['pressure-gauge-guide', 'glycerine-filled-vs-dry-pressure-gauges', 'high-pressure-hydraulic-gauges', 'how-to-size-a-hydraulic-pump'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Range rules and limits from EN 837 (via SAMSON and WIKA), Ashcroft and Enerpac; examples and error table computed.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which range?',
      body: 'Send the working pressure, the relief or maximum pressure, the dial size and whether the line pulses. We will recommend a range and class and quote the gauge with a snubber or isolation valve if it needs one.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
