/**
 * Molykote G-1074, from DuPont's technical data sheet (form 80-8136B-01,
 * 09/19), which the listing already links. The import had cut the short and
 * SEO descriptions off mid-word ("excellent noise-") and carried only part of
 * the typical-properties table. DuPont gives the penetration without saying
 * worked or unworked, so no NLGI grade is claimed.
 */
import type { Entry } from './types'

const TDS = 'DuPont technical data sheet, MOLYKOTE G-1074 Grease, form 80-8136B-01 (09/19)'

export const MOLYKOTE: Entry[] = [
  {
    sku: 'IH-LUB-G-1074-GREASE',
    was: 'Molykote G-1074 Grease',
    focusKeyword: 'molykote g-1074 grease',
    seoDescription:
      'Molykote G-1074: PAO grease with lithium soap and PTFE for metal, plastic and elastomer parts. −40 to 150 °C, noise-damping under extreme pressure.',
    descriptionShort:
      'Molykote G-1074 is a polyalphaolefin (PAO) grease thickened with lithium soap, with PTFE and antioxidants, for metal, plastic and elastomer parts. It damps noise under extreme pressure at high frequency and works from −40 to 150 °C.',
    descriptionLong: [
      '<p>Molykote G-1074 is a polyalphaolefin (PAO) grease for lubricating common metal, plastic and elastomer parts. DuPont formulates it to damp noise, even under extreme pressure at high frequency, and to work across a wide temperature range: −40 to 150 °C.</p>',
      '<h3>Features &amp; benefits</h3><ul><li>Noise-damping performance</li><li>Additives for extreme pressure at high frequency</li><li>Wide temperature range, −40 to 150 °C</li></ul>',
      '<h3>Composition</h3><ul><li>Polyalphaolefin (PAO) base oil</li><li>Lithium soap thickener</li><li>PTFE and antioxidants</li></ul>',
      '<h3>Applications</h3><p>Automotive systems — chassis and brake, exterior and interior parts — and bearings, gears, slides and other mechanisms that need low friction and compatibility with common metals, plastics and elastomers.</p>',
      '<h3>Typical properties</h3><ul>' +
        '<li>Appearance: translucent white</li>' +
        '<li>Penetration (JIS K 2220): 280</li>' +
        '<li>Base oil viscosity (JIS K 2283): 53 mm²/s at 40 °C, 8.5 mm²/s at 100 °C</li>' +
        '<li>Density (JIS K 5600): 0.90 g/ml</li>' +
        '<li>Bleed (JIS K 2220, 24 h at 100 °C): 3.6 %</li>' +
        '<li>Evaporation loss (JIS K 2220, 22 h at 99 °C): 0.1 %</li>' +
        '<li>Water washout (JIS K 2220, 38 °C, 1 h): 1.98 %</li>' +
        '<li>Dropping point (JIS K 2220): 210 °C</li>' +
        '<li>Four-ball wear scar (ASTM D2266, 1,200 rpm, 392 N, 1 h): 0.69 mm</li>' +
        '<li>SRV extreme pressure (ASTM D5706, 50 °C, 50 Hz, 1 mm, procedure A): 1,000 N</li>' +
        '<li>Low-temperature torque at −40 °C (JIS K 2220): 99 mNm starting, 50 mNm running</li>' +
        '</ul>' +
        '<p>These are typical values, not a specification: DuPont asks specification writers to contact it before writing one.</p>',
      '<h3>How to use</h3><p>Clean the points of application, then apply or fill with a brush, spatula or automated lubrication device.</p>',
      '<h3>Usable life and storage</h3><p>36 months from the date of production, stored unopened in a cool, dark place. Read the safety data sheet and container label before handling.</p>',
      '<h3>Pack sizes</h3><ul><li>1 kg can, 10 cans per case</li><li>16 kg pail</li></ul>',
      '<p class="source-note">Technical data published by DuPont, the manufacturer of MOLYKOTE®. See the linked technical data sheet for full test conditions.</p>',
    ].join('\n'),
    addFaqs: [
      {
        question: 'How long does G-1074 keep in storage?',
        answer:
          '36 months from the date of production, stored unopened in a cool, dark place, per DuPont’s technical data sheet.',
      },
      {
        question: 'Can it be used on plastic and rubber parts?',
        answer:
          'Yes. DuPont formulates G-1074 for common metal, plastic and elastomer substrates. As with any grease, test it against the specific plastic or elastomer under your service conditions before you specify it.',
      },
      {
        question: 'How is it applied?',
        answer:
          'Clean the points of application first, then apply or fill with a brush, a spatula or an automated lubrication device, as DuPont advises.',
      },
    ],
    addSpecs: [
      {
        group: 'Composition',
        label: 'Base Oil / Chemistry',
        value: 'Polyalphaolefin (PAO)',
        key: 'base_oil',
      },
      { group: 'Composition', label: 'Thickener', value: 'Lithium soap', key: 'thickener' },
      { group: 'Composition', label: 'Solid Lubricants', value: 'PTFE', key: 'solid_lubricants' },
      { group: 'Performance', label: 'Base oil viscosity (100 °C)', value: '8.5', unit: 'mm²/s' },
      { group: 'Performance', label: 'Bleed (24 h, 100 °C)', value: '3.6', unit: '%' },
      {
        group: 'Performance',
        label: 'Four-ball wear scar (ASTM D2266)',
        value: '0.69',
        unit: 'mm',
      },
      {
        group: 'Performance',
        label: 'SRV extreme pressure (ASTM D5706)',
        value: '1,000',
        unit: 'N',
      },
      { group: 'Commercial', label: 'Usable life', value: '36 months from production, unopened' },
    ],
    sources: [TDS],
  },
]
