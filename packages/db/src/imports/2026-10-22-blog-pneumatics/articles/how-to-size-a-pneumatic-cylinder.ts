import type { BlogArticleSeed } from '../shared'
import { cylinderStockBlocks } from '../cylinder-stock'

/**
 * Sizing an air cylinder: force, margin, pressure at the port and air consumption. Sources: Parker P1D Premier
 * catalogue PDE2570TCUK (force table at 1–10 bar, "select a theoretical force 50–100% larger than the force
 * required", rod diameters, cushioning diagram assumes 6 bar at the cylinder port, high relative load = pressure drop
 * over 1 bar, ISO 8573-1 class 3.4.3 with a lower dew point outdoors); Parker P1F catalogue 0980 ("cylinder load should
 * be about 50% of the theoretical force (= normal load)", lower load gives higher velocity, load = friction plus
 * gravitational forces, force and free-air consumption tables whose figures our arithmetic reproduces, tubing
 * throttling and dead volume); Parker catalogue 0900P-7 (4MA 250 psig air, bores 1-1/2 to 8 in); SMC C96 manual (filter
 * and regulate the supply, aftercooler/dryer/water separator, 1.0 MPa maximum, large force needs a rigid base, buckling
 * stroke independent of load factor and full force on an external stopper — BEST guide). The force tables in this
 * article are our own arithmetic, p × π/4 × D², shown with its basis; atmospheric pressure taken as 1.013 bar and
 * 14.7 psi. Left out: any inch-bore rod diameter as a catalogue fact (the 5/8 in rod in the example is stated as an
 * assumption), and pressure-drop figures for FRLs, valves or tubing (none published in a form we could quote generally).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-size-a-pneumatic-cylinder',
  title: 'How to size a pneumatic cylinder: force, load ratio, pressure at the port and air consumption',
  excerpt:
    'Theoretical force is pressure times piston area, and the return stroke only gets the annulus. How much margin Parker recommends, why to size on the pressure at the cylinder rather than the compressor, how to work out air per cycle in free air, a worked example in bar/mm and psi/inch, and force tables for common bores at 6 bar and 80 psi.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Size a Pneumatic Cylinder: Force & Air Use',
  seoDescription:
    'Size an air cylinder: force = pressure × area, retract on the annulus, Parker’s 50% load guidance, pressure at the port, air per cycle and force tables.',
  focusKeyword: 'pneumatic cylinder sizing',
  publishedAt: '2026-10-22T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Theoretical force = pressure × piston area. The extend stroke uses the full bore; the retract stroke uses the annulus (bore area minus rod area), so it is always weaker.',
        'Leave margin. Parker’s P1F catalogue says the load should be about 50% of theoretical force; its P1D catalogue says choose a theoretical force 50–100% larger than the force required.',
        'Size on the pressure at the cylinder port while it moves, not the compressor setting. Parker’s cushioning data for P1D is stated at 6 bar at the cylinder port.',
        'Free air per cycle = (bore area + annulus) × stroke × (gauge pressure + 1.013) ÷ 1.013 in bar. That reproduces Parker’s own P1F consumption table.',
        'At 6 bar a 50 mm bore gives 1,178 N out and 990 N back (20 mm rod). At 80 psi a 2 in bore gives 251 lbf out.',
      ],
    },
    {
      type: 'lead',
      html: 'An air cylinder sized at the compressor’s pressure, with no margin for friction or acceleration and only for the extend stroke, looks right on paper and stalls or crawls on the machine. This guide works through the sizing the way the makers’ catalogues do: force from pressure and area, the margin Parker recommends, the pressure the cylinder actually sees, and the air it will use.',
    },

    { type: 'section_head', number: '/01', title: 'Force is pressure times area.', anchor: 'force' },
    {
      type: 'prose',
      html: '<p>A cylinder’s theoretical force is the air pressure multiplied by the area it acts on:</p><ul><li><strong>Extend (push):</strong> F = p × A, where A = π/4 × D² for bore D.</li><li><strong>Retract (pull):</strong> F = p × (A − a), where a = π/4 × d² for rod diameter d. The rod covers part of the piston on that side, leaving the <strong>annulus</strong>.</li></ul><p>Keep the units consistent. In metric, 1 bar = 0.1 N/mm², so force in newtons = pressure in bar × 0.1 × area in mm². In inch units, pressure in psi × area in in² gives force in lbf directly.</p><p>Check: a 50 mm bore has an area of π/4 × 50² = 1,963 mm². At 6 bar (0.6 N/mm²) that is <strong>1,178 N</strong>. With the 20 mm rod Parker fits to its 50 mm P1D and P1F, the annulus is 1,963 − 314 = 1,649 mm², so the retract force is <strong>990 N</strong> — 16% less. Parker’s published force tables for P1D and P1F give the same 1,178 N and 990 N.</p><p>This is <em>theoretical</em> force. It ignores seal friction, the force needed to accelerate the load, and back-pressure from the exhausting side — which is why the makers tell you to leave margin.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Theoretical force at 6 bar, ISO 15552 bores. Basis: F (N) = 0.6 N/mm² × π/4 × D² (extend) or × π/4 × (D² − d²) (retract), rod sizes as Parker P1D/P1F. Our arithmetic matches Parker’s published table.',
      columns: ['Bore / rod (mm)', 'Piston area (mm²)', 'Extend at 6 bar (N)', 'Annulus (mm²)', 'Retract at 6 bar (N)'],
      rows: [
        { cells: ['32 / 12', '804', '483', '691', '415'] },
        { cells: ['40 / 16', '1,257', '754', '1,056', '633'] },
        { cells: ['50 / 20', '1,963', '1,178', '1,649', '990'], highlight: true },
        { cells: ['63 / 20', '3,117', '1,870', '2,803', '1,682'] },
        { cells: ['80 / 25', '5,027', '3,016', '4,536', '2,721'] },
        { cells: ['100 / 25', '7,854', '4,712', '7,363', '4,418'] },
        { cells: ['125 / 32', '12,272', '7,363', '11,468', '6,881'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Theoretical extend force at 80 psi, inch bores. Basis: F (lbf) = 80 psi × π/4 × D²; N = lbf × 4.448. Retract force depends on the rod fitted — subtract π/4 × d² from the area first.',
      columns: ['Bore (in)', 'Piston area (in²)', 'Extend at 80 psi (lbf)', 'Extend at 80 psi (N)'],
      rows: [
        { cells: ['3/4', '0.442', '35', '157'] },
        { cells: ['1', '0.785', '63', '279'] },
        { cells: ['1-1/2', '1.767', '141', '629'] },
        { cells: ['2', '3.142', '251', '1,118'], highlight: true },
        { cells: ['2-1/2', '4.909', '393', '1,747'] },
        { cells: ['3-1/4', '8.296', '664', '2,952'] },
        { cells: ['4', '12.566', '1,005', '4,472'] },
        { cells: ['5', '19.635', '1,571', '6,987'] },
        { cells: ['6', '28.274', '2,262', '10,062'] },
        { cells: ['8', '50.265', '4,021', '17,887'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'How much margin: the load ratio.', anchor: 'load-ratio' },
    {
      type: 'prose',
      html: '<p>The <strong>load ratio</strong> is the force the job needs divided by the cylinder’s theoretical force. The makers publish guidance, and it is worth quoting them exactly because they frame it differently:</p><ul><li><strong>Parker, P1F catalogue:</strong> the cylinder load should be about <strong>50% of the theoretical force</strong>, which Parker calls the normal load. A lower load gives a higher velocity, and vice versa.</li><li><strong>Parker, P1D catalogue:</strong> select a theoretical force <strong>50–100% larger</strong> than the force required — that is, a load ratio between about 67% and 50%.</li></ul><p>Read together: 50% is the comfortable figure for a cylinder that has to move briskly; up to about two-thirds is acceptable where speed matters less. Above that, the cylinder will move, but slowly and unevenly, and Parker’s cushioning data shows a second penalty — when the pressure drop across the piston exceeds 1 bar, Parker says to cut the moving mass by a factor of 2.5, or the speed by 1.5, against its cushioning diagram.</p><h3>What counts as “load”</h3><p>Parker defines it as the sum of internal and external friction plus any gravitational forces. So for a cylinder lifting vertically, the weight is load; for a cylinder pushing a carriage on guides, the guide friction is load; for a cylinder pulling, size on the annulus, not the bore.</p><h3>Clamping and pressing are different</h3><p>A clamp or press cylinder does its work stationary at the end of its travel, so it delivers its full theoretical force there. SMC makes the related point about buckling: once the rod is stopped by an external stopper, the full force the cylinder generates acts on the cylinder itself, however light the load was. Size a clamp on the force needed at the pressure you can guarantee — and check rod buckling, covered in our <a href="/blog/pneumatic-cylinder-cushioning-and-mounting">cushioning and mounting guide</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Use the pressure at the cylinder, not at the compressor.', anchor: 'pressure' },
    {
      type: 'prose',
      html: '<p>A compressor may be set to 8 bar while the cylinder works at 5.5. Between them sit a dryer, the distribution main, an FRL whose regulator is set below line pressure, a valve and the tubing to the port. Parker’s force tables are given against the pressure applied to the cylinder, and its P1D cushioning diagram explicitly assumes 6 bar at the cylinder port.</p><ul><li><strong>Size on the regulated pressure</strong>, at the lowest setting the machine will run, not the compressor cut-in or cut-out.</li><li><strong>Expect less while the cylinder moves.</strong> Parker’s tubing guidance is that an undersized tube between valve and cylinder throttles the flow and limits speed. The faster the stroke, the more the port pressure falls below the regulator setting during motion.</li><li><strong>Stay inside the rating.</strong> Parker’s P1D and P1F are rated to 10 bar; SMC’s C96 to 1.0 MPa; Parker’s 4MA to 250 psig for air service.</li></ul><h3>Wet, hot air</h3><p>Parker specifies air to ISO 8573-1 class 3.4.3 for P1D and P1F — a 5 µm filter and a +3 °C pressure dew point for indoor use, with a lower dew point outdoors. SMC asks for a filter of 5 µm or finer upstream of the valve and an aftercooler, dryer or water separator where there is a lot of condensate. In a Gulf summer the air entering the compressor is hot and humid, and the water it carries condenses downstream as the air cools; treat the dryer and drains as part of the cylinder’s specification, not an extra. Our <a href="/blog/compressed-air-quality-iso-8573-1">ISO 8573-1 guide</a> explains the classes.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The full force arrives at the end of the stroke.',
      body: 'Whatever the load ratio while moving, a cylinder that stalls against a part, a fixture or a hand delivers its full theoretical force. SMC warns that its cylinders generate large forces and must be installed on a sufficiently rigid base, and that a clamped work piece can come loose if circuit pressure falls. Guard the pinch points and design for loss of pressure.',
    },

    { type: 'section_head', number: '/04', title: 'Air consumption, per cycle and in free air.', anchor: 'air-consumption' },
    {
      type: 'prose',
      html: '<p>A double-acting cylinder fills the bore side to extend and the annulus side to retract. The compressed volume per cycle is:</p><p><strong>V = (A + (A − a)) × stroke</strong></p><p>Compressors are rated in <strong>free air</strong> — air at atmospheric pressure — so convert by the absolute pressure ratio:</p><p><strong>Free air per cycle = V × (p + 1.013) ÷ 1.013</strong> (p in bar gauge), or <strong>V × (p + 14.7) ÷ 14.7</strong> (p in psig).</p><p>Multiply by cycles per minute for l/min (or ft³/min, scfm, in inch units: 1 ft³ = 1,728 in³ = 28.3 l).</p><p>This is the basis of Parker’s own table. For a 63 mm P1F at 6 bar: bore area 31.2 cm² × 1 cm × (6 + 1.013) ÷ 1.013 = 216 cm³ per 10 mm of extend stroke — Parker’s table gives 0.216 l. Parker’s P1D table states the same thing as free air per 10 mm of stroke for a double stroke at 6 bar.</p><p>Two things push the real figure up. The tube between valve and cylinder fills and exhausts every cycle too — Parker warns that an oversized tube creates dead volume that increases air consumption and filling time. And leaks anywhere in the circuit add to the compressor’s load whether the cylinder moves or not.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Worked example, metric and inch.', anchor: 'worked-example' },
    {
      type: 'prose',
      html: '<h3>Metric: 1,000 N at 5.5 bar</h3><p>A horizontal cylinder must push a carriage needing <strong>1,000 N</strong> including guide friction. The regulator is set to <strong>5.5 bar</strong> (0.55 N/mm²). Stroke 300 mm, 12 cycles a minute.</p><ol><li><strong>Parker P1F guidance (load ≈ 50%):</strong> theoretical force needed = 2 × 1,000 = 2,000 N. Area = 2,000 ÷ 0.55 = 3,636 mm², so D = √(4 × 3,636 ÷ π) = 68 mm. Next ISO bore: <strong>80 mm</strong>, giving 5,027 × 0.55 = 2,765 N — a load ratio of 36%.</li><li><strong>Parker P1D guidance (at least 50% larger):</strong> 1.5 × 1,000 = 1,500 N, area 2,727 mm², D = 59 mm. Next bore: <strong>63 mm</strong>, giving 3,117 × 0.55 = 1,714 N — a load ratio of 58%.</li><li><strong>Retract check (63/20):</strong> annulus 2,803 mm² × 0.55 = 1,542 N, enough if the return needs 1,000 N.</li><li><strong>Choose:</strong> 63 mm if speed is not critical; 80 mm if the carriage must move quickly, since Parker notes a lower load ratio gives a higher velocity.</li><li><strong>Air, 63/20:</strong> V = (3,117 + 2,803) mm² × 300 mm = 1.776 l. Free air = 1.776 × (5.5 + 1.013) ÷ 1.013 = 1.776 × 6.43 = <strong>11.4 l per cycle</strong>; × 12 = <strong>137 l/min</strong> (about 4.8 scfm), before tubing dead volume and leaks.</li></ol><h3>Inch: 225 lbf at 80 psi</h3><p>Same job in inch units: <strong>225 lbf</strong> of load, <strong>80 psi</strong> at the cylinder, 8 in stroke, 15 cycles a minute.</p><ol><li><strong>Load ≈ 50%:</strong> 450 lbf ÷ 80 psi = 5.63 in², D = 2.68 in. Next bore in Parker’s 4MA range: <strong>3-1/4 in</strong>, 8.296 in² × 80 = 664 lbf, load ratio 34%.</li><li><strong>At least 50% larger:</strong> 337.5 lbf ÷ 80 = 4.22 in², D = 2.32 in. Next bore: <strong>2-1/2 in</strong>, 4.909 in² × 80 = 393 lbf, load ratio 57%.</li><li><strong>Retract:</strong> assuming a 5/8 in rod (check the actual rod on the data sheet), rod area = 0.307 in², annulus = 4.602 in², retract force = 368 lbf.</li><li><strong>Air, 2-1/2 in with 5/8 in rod:</strong> V = (4.909 + 4.602) × 8 = 76.1 in³. Free air = 76.1 × (80 + 14.7) ÷ 14.7 = 76.1 × 6.44 = 490 in³ = 0.284 ft³ per cycle; × 15 = <strong>4.3 scfm</strong> (about 120 l/min).</li></ol>',
    },
    {
      type: 'decision_tree',
      heading: 'Sizing checklist',
      branches: [
        { condition: 'Do you know the force at the slowest point, including friction and weight?', outcome: 'If not, measure or estimate it first — that is the load.' },
        { condition: 'Moving load that must be quick?', outcome: 'Aim for a load ratio near 50% (Parker P1F guidance).' },
        { condition: 'Moving load where speed matters less?', outcome: 'Up to about two-thirds — a theoretical force at least 50% above the load (Parker P1D guidance).' },
        { condition: 'Pulling, not pushing?', outcome: 'Size on the annulus area, not the bore.' },
        { condition: 'Clamping or pressing?', outcome: 'Size on the force needed at the guaranteed minimum pressure, then check buckling.' },
        { condition: 'Is the pressure you used the regulated pressure at the cylinder?', outcome: 'If it was the compressor setting, resize at the regulator setting.' },
        { condition: 'Does the compressor have spare free-air capacity?', outcome: 'Add up free air per cycle × cycles per minute for every cylinder, plus tubing and leaks.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do you calculate pneumatic cylinder force?', answer: 'Multiply the pressure by the piston area. In metric, force (N) = pressure (bar) × 0.1 × area (mm²); in inch units, force (lbf) = pressure (psi) × area (in²). For the retract stroke, subtract the rod area first.' },
        { question: 'Why is the retract force lower than the extend force?', answer: 'On the retract stroke the air acts on the annulus — the piston area minus the area covered by the rod — so the same pressure produces less force. With a 50 mm bore and 20 mm rod it is 16% less.' },
        { question: 'What load ratio should a pneumatic cylinder run at?', answer: 'Parker’s P1F catalogue says the load should be about 50% of theoretical force; its P1D catalogue says select a theoretical force 50–100% larger than required. Use the lower ratio where speed matters.' },
        { question: 'What force does a 50 mm cylinder give at 6 bar?', answer: '1,178 N extending and, with a 20 mm rod, 990 N retracting — theoretical figures before friction and margin.' },
        { question: 'How much air does a pneumatic cylinder use?', answer: 'Per cycle, (bore area + annulus) × stroke, converted to free air by multiplying by (gauge pressure + 1.013) ÷ 1.013 in bar. A 63 mm cylinder with 300 mm stroke at 5.5 bar uses about 11.4 litres of free air per cycle.' },
        { question: 'Should I size a cylinder on compressor pressure?', answer: 'No. Use the regulated pressure at the cylinder, at the lowest setting the machine will run. Parker’s force tables and cushioning data are stated at the pressure applied to the cylinder.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'what-we-list' },
    ...cylinderStockBlocks(
      '<p>Once you have a bore, stroke and mounting, the listings below cover every cylinder on our shelf — Parker NFPA (4MA, 2MNR) and ISO 15552 (P1D, P1F) tie-rod, SR-family round body, LP compact and HB/P5E guided cylinders, plus Destaco. Each carries the maker’s part numbers.</p>'
    ),
    {
      type: 'product_embed',
      heading: 'Cylinders from the worked examples',
      skus: [
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-SMOOTH-6',
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-SMOOTH-7',
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-SMOOTH-5',
        'IH-PAR-4MA-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-2-1-2-INCH',
        'IH-PAR-4MA-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-3-1-4-INCH',
        'IH-PAR-4MA-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-2-INCH-BOR',
        'IH-PAR-SR-SERIES-AIR-CYLINDERS-2-INCH-BORE',
        'IH-PAR-LP-SERIES-COMPACT-PNEUMATIC-CYLINDERS-2-INCH-BORE',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-cylinders', label: 'Pneumatic cylinders', blurb: 'NFPA and ISO tie-rod, round-body, compact and guided air cylinders.' },
    { type: 'category_link', slug: 'air-preparation-frl', label: 'Air preparation (FRL)', blurb: 'Filters, regulators and lubricators that set the pressure your cylinder actually sees.' },
    {
      type: 'related_articles',
      slugs: [
        'pneumatic-cylinder-types-guide',
        'pneumatic-cylinder-cushioning-and-mounting',
        'sizing-pneumatic-valves-flow-cv',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'frl-filter-regulator-lubricator-guide',
        'compressed-air-quality-iso-8573-1',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Margins quoted from Parker’s P1F (0980) and P1D (PDE2570TCUK) catalogues; force tables are our arithmetic from p × area and match Parker’s published figures.',
    },
    {
      type: 'cta_block',
      heading: 'Want a second pair of eyes on the sizing?',
      body: 'Send us the load, the stroke, the regulated pressure and the cycle rate. We will check the bore and quote a cylinder from the maker’s range.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
