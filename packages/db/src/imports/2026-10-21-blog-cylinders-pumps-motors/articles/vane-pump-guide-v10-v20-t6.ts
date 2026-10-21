import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Vane pumps. Vickers V10/V20/V2010/V2020 ratings, ring table, model code, inlet limit, fluids and double-pump
 * caution from Danfoss/Vickers Technical Information BC443078226453en-000101 (read 2026-10-21). Parker T6C and
 * T7B figures from our own Parker listings (IH-T6C-012-1R00-B1, IH-T7B-B09-2R00-A100); Parker's catalogue
 * itself could not be fetched, so the article attributes those figures to the listed pumps only.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'vane-pump-guide-v10-v20-t6',
  title: 'Vane pumps explained: Vickers V10 and V20, double pumps, Denison T6 and T7, and reading the model code',
  excerpt:
    'Balanced vane pumps are quiet, compact and rebuilt by swapping a cartridge rather than the pump. How they work, the full Vickers V10 and V20 ring table with pressures and speeds, how to decode a V-series model number, changing rotation, double pumps, and where the Parker T6 and T7 families take over.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Vane Pumps: Vickers V10/V20, Double Pumps & T6/T7 Guide',
  seoDescription:
    'Vane pump guide: how balanced vane pumps work, Vickers V10 and V20 displacements, pressures and speeds by ring, model code decoding, rotation change, V2010/V2020 double pumps, Parker T6C and T7B, and inlet and fluid limits.',
  focusKeyword: 'vickers vane pump',
  publishedAt: '2026-10-21T08:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A balanced vane pump has two inlet and two outlet zones opposite each other, so pressure loads on the shaft cancel and the bearings carry only external load.',
        'Vickers V10 pumps run 3.3–22.8 cc/rev and V20 pumps 19.5–42.4 cc/rev, rated 2,500 psi (172 bar) except the largest rings, which are rated 2,200 or 2,000 psi.',
        'The ring number in a V-series model code is the flow in US gpm at 1,200 rpm and 100 psi: a V20 with a 13 ring delivers about 13 gpm.',
        'Rotation is changed by reassembling the internal parts, not by buying a new pump.',
        'Vickers limits inlet vacuum to 5 inHg on petroleum oil and running viscosity to 13–54 cSt — the two limits most often broken in hot climates.',
      ],
    },
    {
      type: 'lead',
      html: 'Vane pumps sit between gear pumps and piston pumps: quieter and smoother than the first, simpler and cheaper than the second, and unusually easy to rebuild. On older industrial machines, mobile power steering, refuse trucks and agricultural equipment, the Vickers V10 and V20 and the Denison T6 families are everywhere, and so are the questions about which ring, which rotation and which replacement.',
    },

    { type: 'section_head', number: '/01', title: 'How a balanced vane pump works.', anchor: 'principle' },
    {
      type: 'prose',
      html: '<p>A slotted rotor, splined to the shaft, turns inside a cam ring whose inside is not round but roughly elliptical. Flat vanes slide in the rotor slots. As the rotor turns, the vanes are thrown out against the ring — by centrifugal force at first, then by outlet pressure fed under them — and each pair of vanes traps a pocket of oil. Where the ring is widest the pockets grow and draw oil in; where it narrows they shrink and push it out.</p><p>Because the ring is elliptical, each pocket goes through this twice per revolution, and the two inlet zones and two outlet zones lie diametrically opposite each other. Vickers describes the result directly: the pressure loads balance, so the shaft bearings carry only the external load, and low vane-tip loading allows high-pressure operation. That balance is why vane pumps run quietly and last well — and why the wear that ends their life is at the vane tips and the ring, not in the bearings.</p><h3>The cartridge</h3><p>The rotor, vanes, ring and the two side plates that close the pumping pockets are sold as one assembly: the <strong>cartridge</strong> (or ring kit). Fitting a new cartridge into the existing body restores a worn pump without disturbing its mounting, and fitting a different ring changes its displacement. For many machines that is the cheapest repair in hydraulics.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Vickers V10 and V20: every ring.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Vickers V10 and V20 single pumps — petroleum oil, 0 psi inlet (Vickers technical information)',
      columns: ['Series', 'Ring', 'Displacement', 'Max pressure', 'Max speed'],
      rows: [
        { cells: ['V10', '1', '3.3 cc/rev', '172 bar (2,500 psi)', '4,800 rpm'] },
        { cells: ['V10', '2', '6.6 cc/rev', '172 bar', '4,500 rpm'] },
        { cells: ['V10', '3', '9.8 cc/rev', '172 bar', '4,000 rpm'] },
        { cells: ['V10', '4', '13.1 cc/rev', '172 bar', '3,400 rpm'] },
        { cells: ['V10', '5', '16.4 cc/rev', '172 bar', '3,200 rpm'] },
        { cells: ['V10', '6', '19.5 cc/rev', '152 bar (2,200 psi)', '3,000 rpm'] },
        { cells: ['V10', '7', '22.8 cc/rev', '138 bar (2,000 psi)', '2,800 rpm'] },
        { cells: ['V20', '6', '19.5 cc/rev', '172 bar (2,500 psi)', '3,400 rpm'], highlight: true },
        { cells: ['V20', '7', '22.8 cc/rev', '172 bar', '3,000 rpm'] },
        { cells: ['V20', '8', '26.5 cc/rev', '172 bar', '2,800 rpm'] },
        { cells: ['V20', '9', '29.7 cc/rev', '172 bar', '2,800 rpm'] },
        { cells: ['V20', '11', '36.4 cc/rev', '172 bar', '2,500 rpm'] },
        { cells: ['V20', '12', '39.0 cc/rev', '152 bar (2,200 psi)', '2,400 rpm'] },
        { cells: ['V20', '13', '42.4 cc/rev', '152 bar', '2,400 rpm'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two things are worth noticing. First, the same 19.5 cc ring is rated 2,500 psi in a V20 body but only 2,200 psi in a V10 body: if a machine needs 19.5 cc at full pressure, the V20 is the right pump. Second, speed falls as displacement rises within each series, so a large ring on a fast engine can be over its limit even though a smaller ring of the same series would not be.</p><p>On fire-resistant fluids Vickers limits the pumps to 1,800 rpm and to between 93 and 138 bar depending on the fluid and ring, and specifies fluorocarbon seals (the F3 prefix) for phosphate esters.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Reading a V-series model code.', anchor: 'model-code' },
    {
      type: 'prose',
      html: '<p>A V-series nameplate looks like <code>F3-V10-1P5S-1C20L</code>. Read left to right:</p><ol><li><strong>F3</strong> — seals: fluorocarbon, for phosphate ester. Omitted for standard seals on oil.</li><li><strong>V</strong> — vane pump.</li><li><strong>10</strong> or <strong>20</strong> — the series.</li><li><strong>Mounting</strong> — 1 = 2-bolt flange with a 3.25" (82.55 mm, SAE A) pilot, the standard; 6 = 2-bolt with a 4.00" (SAE B) pilot.</li><li><strong>Inlet</strong> — P = NPT (1" on the V10, 1-1/4" on the V20); S = SAE straight thread.</li><li><strong>Ring</strong> — the rated flow in US gpm at 1,200 rpm and 100 psi. <em>5</em> means a 5 gpm ring.</li><li><strong>Outlet connection</strong> — P, R or S options.</li><li><strong>Shaft</strong> — 1 = straight keyed; 11 = splined; 38 = 11-tooth 3/4"; 62 = splined (V20).</li><li><strong>Outlet position</strong>, viewed from the cover end — A opposite the inlet, B 90° anticlockwise, C in line, D 90° clockwise.</li><li><strong>Design number</strong> — 20 for the V10, 11 for the V20.</li><li><strong>Rotation</strong>, viewed from the shaft end — L = left hand (anticlockwise); nothing for right hand.</li></ol><p>So <code>F3-V10-1P5S-1C20L</code> is a fluorocarbon-sealed V10 on a standard SAE A flange, NPT inlet, 5 gpm ring, keyed shaft, outlet in line with the inlet, left-hand rotation. That string is everything needed to quote a replacement or a cartridge — our Vickers-pattern listings show the Vickers part number each size replaces.</p>',
    },
    {
      type: 'direct_answer',
      question: 'What does the ring number mean on a Vickers vane pump?',
      answer:
        'It is the pump’s rated flow in US gallons per minute at 1,200 rpm and 100 psi. A V20 with a 13 ring delivers about 13 gpm under those conditions, which corresponds to a displacement of 42.4 cc/rev. At other speeds, flow scales with rpm.',
    },

    { type: 'section_head', number: '/04', title: 'Changing rotation.', anchor: 'rotation' },
    {
      type: 'prose',
      html: '<p>A vane pump built for one direction will not pump the other way. Unlike most gear pumps, a V-series pump can be converted: Vickers states the rotation “can be changed by changing the assembly of internal parts” — in practice, turning the cartridge over so the ring and plates face the other way. Follow the maker’s instructions, mark the parts before dismantling, and check that the shaft and seals suit the new direction. If you are ordering a new pump instead, state rotation viewed from the shaft end, and check it against the drive: a truck PTO’s rotation is stated relative to the engine crankshaft, not the pump.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Double pumps: V2010 and V2020.', anchor: 'double' },
    {
      type: 'prose',
      html: '<p>A double vane pump puts two cartridges on one shaft, in one body, with a common inlet and two separate outlets. The V2010 combines a V20-size cartridge at the shaft end (6–13 gpm) with a V10-size cartridge at the cover end (1–7 gpm); the V2020 has two V20-size cartridges (6–13 and 6–11 gpm). They are common on refuse trucks, mobile cranes and industrial machines that need two independent flows — a large one for the main function and a small one for steering, pilot or an auxiliary.</p><p>The model code adds both rings and both outlet positions, for example <code>F3-V2010-1F13S3S-1CC-12-L</code>. The inlet is a 4-bolt flange, 1.50" on the V2010 and 2.00" on the V2020. One caution from Vickers is worth repeating: never assume both sections of a double pump can be loaded to rated pressure at the same time. The shaft carries the torque for both, and the combined torque is what limits it.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Parker T6 and T7: higher pressure vane pumps.', anchor: 't6-t7' },
    {
      type: 'prose',
      html: '<p>The Denison-designed T6 and T7 families, now Parker, are higher-pressure vane pumps with interchangeable cartridges and a wide displacement range. The two we stock show the difference from the V-series clearly:</p><ul><li><strong>Parker T6C with the 012 cartridge</strong> — 37.1 cc/rev, 240 bar continuous and 275 bar intermittent on anti-wear oil, up to 2,800 rpm, SAE B two-bolt flange, 22.2 mm keyed shaft, nitrile seals. 55.6 L/min at 1,500 rpm.</li><li><strong>Parker T7B with the B09 cartridge</strong> — 28.0 cc/rev, 290 bar continuous and 320 bar intermittent, up to 3,600 rpm, ISO 3019-2 two-bolt flange (an SAE B version is the T7BS). 42.0 L/min at 1,500 rpm.</li></ul><p>Where a V20 is being pushed at the top of its range, or a machine needs more than about 2,500 psi from a vane pump, a T6 or T7 is the usual step up. They are not drop-in replacements for a V-series pump: flange, shaft and port positions differ, so plan the adapter or bracket with the order.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Vane pumps on our shelf, side by side',
      columns: ['Pump', 'Displacement', 'Continuous pressure', 'Max speed', 'Mounting'],
      rows: [
        { cells: ['Vickers V10 (and interchanges)', '3.3–22.8 cc/rev', '172 bar (2,500 psi), 138–152 bar on largest rings', '2,800–4,800 rpm', 'SAE A 2-bolt (std)'] },
        { cells: ['Vickers V20 (and interchanges)', '19.5–42.4 cc/rev', '172 bar, 152 bar on 12–13 rings', '2,400–3,400 rpm', 'SAE A or B 2-bolt'] },
        { cells: ['Parker T6C-012', '37.1 cc/rev', '240 bar (275 intermittent)', '2,800 rpm', 'SAE B 2-bolt'], highlight: true },
        { cells: ['Parker T7B-B09', '28.0 cc/rev', '290 bar (320 intermittent)', '3,600 rpm', 'ISO 3019-2 2-bolt'] },
      ],
    },

    { type: 'section_head', number: '/07', title: 'Inlet, oil and cleanliness.', anchor: 'care' },
    {
      type: 'prose',
      html: '<p>Vane pumps are more sensitive than gear pumps to how they are fed and what they are fed with. Vickers’ limits for the V-series:</p><ul><li><strong>Inlet:</strong> 0 to 5 psi (0–0.34 bar) gauge at maximum speed is recommended; vacuum must not exceed 5 inHg on petroleum oil (3 inHg on other fluids). At 5 inHg the maximum speed is derated, for example from 2,800 to about 2,600 rpm. Never feed two pumps from one Y-shaped inlet: one may be starved and cavitate.</li><li><strong>Viscosity:</strong> 13–54 cSt running, with 32–48 cSt at 38 °C recommended and no more than 220 cSt at start-up.</li><li><strong>Temperature:</strong> recommended operating oil temperature 49 °C (120 °F), maximum 65 °C (150 °F) on oil. On a Gulf machine whose tank runs at 70 °C or more, that is a cooling problem to solve, not a pump to replace.</li><li><strong>Cleanliness:</strong> ISO 4406 19/17/14 for fixed vane pumps at 70–210 bar, 18/16/13 above 210 bar.</li><li><strong>Fluids:</strong> anti-wear hydraulic oils, or SAE J183 crankcase oils, are acceptable.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A worn vane pump tells you early.',
      body: 'Falling flow at working pressure, a rising whine and a hotter tank are the signs. Because the wear is in the cartridge, the repair is usually a cartridge, fitted with clean hands and new shaft and body seals — provided the inlet, oil temperature and filtration that wore the first one are fixed too.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a V10 and a V20 vane pump?', answer: 'Size. The V10 covers 3.3–22.8 cc/rev (1–7 gpm rings) and the V20 19.5–42.4 cc/rev (6–13 gpm rings). Both are rated 2,500 psi on oil except their largest rings.' },
        { question: 'How do I read a Vickers vane pump part number?', answer: 'Seals, V, series, mounting, inlet, ring (gpm at 1,200 rpm and 100 psi), outlet, shaft, outlet position, design number and rotation. F3-V10-1P5S-1C20L is a fluorocarbon-sealed V10, SAE A flange, 5 gpm ring, keyed shaft, left-hand rotation.' },
        { question: 'Can a vane pump rotation be changed?', answer: 'Yes, on the Vickers V-series. Vickers states rotation can be changed by reassembling the internal parts — turning the cartridge — following the maker’s procedure.' },
        { question: 'What is a vane pump cartridge?', answer: 'The rotor, vanes, cam ring and side plates as one assembly. Fitting a new cartridge restores a worn pump, and a different ring changes its displacement, without removing the body.' },
        { question: 'Why are vane pumps quieter than gear pumps?', answer: 'In a balanced vane pump the pressure zones oppose each other, loads balance, and the pockets fill and empty smoothly, so pressure pulsation and noise are low.' },
        { question: 'What replaces a V20 when I need more pressure?', answer: 'A higher-pressure vane family such as the Parker T6 or T7 — the T7B we stock runs 290 bar continuous — or a piston pump. Flanges and shafts differ, so plan the mounting.' },
        { question: 'What oil temperature can a vane pump take?', answer: 'Vickers recommends about 49 °C and a maximum of 65 °C on petroleum oil for the V-series, with running viscosity between 13 and 54 cSt.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Every vane pump in the range:</p>' + stockList(['hydraulic-vane-pumps']),
    },
    {
      type: 'product_embed',
      heading: 'Vane pumps',
      skus: ['IH-FLD-V10-98', 'IH-FLD-V20-195', 'IH-FLD-V2010-195-CW', 'IH-FLD-V2020-195-CW', 'IH-VKR-V10-V20', 'IH-T6C-012-1R00-B1', 'IH-T7B-B09-2R00-A100'],
      note: 'Each Vickers-pattern listing shows the Vickers part number it replaces.',
    },
    { type: 'category_link', slug: 'hydraulic-vane-pumps', label: 'Vane pumps', blurb: 'V10, V20, V2010, V2020, T6C and T7B, in both rotations.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-pump-types-gear-vane-piston', 'how-to-size-a-hydraulic-pump', 'dump-pumps-and-pto-pumps', 'two-stage-hydraulic-pumps-log-splitter'],
    },
    {
      type: 'standard_citation',
      standard: 'Vickers V10/V20 Technical Information',
      publisher: 'Danfoss (Vickers)',
      title: 'Vane pumps V10, V20, V2010, V2020 — Technical Information',
      clause: 'Ratings p.7; installation p.24; fluids p.25',
      summary: 'The maker’s own ratings for every ring, the model code, mounting and inlet requirements, fluid and temperature limits and cleanliness codes used throughout this article.',
      url: 'https://assets.danfoss.com/documents/latest/238666/BC443078226453en-000101.pdf',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'V-series ratings, model code and limits from the Vickers technical information; T6C and T7B figures from the Parker pumps on our catalogue.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a vane pump or cartridge?',
      body: 'Send the full model code from the nameplate, or the displacement, flange, shaft, ports and rotation. We will quote the pump or the cartridge, and tell you which is the better repair.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
