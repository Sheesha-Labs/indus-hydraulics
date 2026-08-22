/**
 * Product descriptions copied verbatim out of production on 2026-08-22.
 *
 * The point of the round-trip test is that the editor hands back what it was
 * given. Hand-written fixtures cannot make that claim — they would be written
 * to match whatever the editor happens to do. These seven cover every markup
 * shape present across the 1,376 live descriptions: see
 * `lib/product-rich-text.ts` for the inventory.
 */
export type DescriptionFixture = {
  slug: string
  /** What makes this one worth keeping. */
  note: string
  html: string
}

export const PRODUCT_DESCRIPTION_FIXTURES: DescriptionFixture[] = [
  {
    slug: 'rexroth-flcb-proportional-valve',
    note: 'a description that is one unformatted sentence — the shape 21 of them still have',
    html: `Bosch Rexroth FLCB series proportional directional valve with on-board electronics and position feedback. For precise closed-loop control.`,
  },
  {
    slug: 'storz-fdc-ul-listed-h-anodized',
    note: 'the ordinary catalogue shape: paragraphs, h3 sections, a bulleted spec list and bold runs',
    html: `<p>The <strong>Storz FDC UL Listed-H. Anodized</strong> is a Storz Coupling / Adapter from the Sunpool (Taiwan) industrial coupling range. Indus Hydraulics is an authorised distributor in the UAE.</p>
<h3>Configuration</h3>
<ul>
<li><strong>Coupling family:</strong> Storz Coupling / Adapter</li>
<li><strong>Coupling type:</strong> Storz Coupling &amp; Adapter — Storz FDC UL Listed-H. Anodized</li>
<li><strong>End A:</strong> Coupling face — standard</li>
<li><strong>End B:</strong> Threaded / barbed back per variant</li>
</ul>
<h3>Specifications</h3>
<ul>
<li><strong>Size range:</strong> 1-1/2", 2-1/2", 3", 4", 5", 6" (Storz pattern sizes 25-150)</li>
<li><strong>Material:</strong> Hard-Anodized Aluminum</li>
<li><strong>Working pressure:</strong> Up to 16 bar (232 psi) — typical fire-service Storz rating</li>
<li><strong>Seal / clamp:</strong> Suction (gray) or pressure (black) gasket per service</li>
<li><strong>Applicable standards:</strong> DIN 14301 (German Storz fire-hose connection standard); UL listed (FDC variants)</li>
</ul>
<h3>Family context</h3>
<p>Storz couplings are the German / European fire-service standard (DIN 14301) — the most widely used fire-hose connector outside the US. Single-piece coupling with two interlocking lugs that engage 90°. Aluminum (painted / hard-anodized), brass, or 316 SS construction. UL-listed FDC (Fire Department Connection) variants for US fire-protection service. Sizes Storz 25–150 (1-1/2"–6"). Suction (gray) or pressure (black) gaskets per service.</p>
<h3>How to order</h3>
<p>Specify (a) the size, (b) the body material if multiple options are listed, and (c) any thread / seal / gasket variant on the RFQ. Indus engineering will confirm the manufacturer part number against your application.</p>
<h3>Companion products</h3>
<p>Pair with the appropriate matching coupling half from the same family, plus the host hose / pipe / equipment. Browse the Sealfast and Sunpool industrial coupling ranges via the Indus Hydraulics catalogue.</p>`,
  },
  {
    slug: 'molykote-211-fluid-30-000-cst',
    note: 'the provenance line 152 descriptions end on',
    html: `<p>Product viscosity grade is documented at 25°C.</p><h3>Features &amp; benefits</h3><ul><li>Excellent high-temperature stability</li></ul><h3>Applications</h3><ul><li>Automotive fan clutches</li></ul><h3>Composition</h3><ul><li><strong>Technology:</strong> Silicone</li></ul><h3>Available pack sizes</h3><ul><li>1000 kg IBC</li></ul><h3>About this type of lubricant</h3><p>These are fluids rather than greases — silicone, synthetic hydrocarbon and mineral oils used where the lubricant has to flow, damp, release or carry heat away. The range covers damping fluids for controlled movement in switches and hinges, gear and chain oils, release fluids for moulding, and heat-transfer and dielectric fluids.</p><h3>How to choose</h3><p>Viscosity is the first decision and it is temperature-dependent: an ISO viscosity grade or a measured viscosity at 40 °C is what to quote, not a description. For damping, the viscosity is the specification — it sets how much resistance the user feels. Check compatibility before anything else on silicone fluids: silicone migrates, and a trace on a surface that later has to be painted, bonded or printed will reject the coating.</p><h3>How to order</h3><p>Specify the pack size and, where more than one grade shares a name, the exact grade on the RFQ. Indus Hydraulics is an authorised distributor and quotes MOLYKOTE® from Dubai stock where the grade is held; less common grades ship to order. Our engineers will confirm the grade against your application and operating conditions before you commit.</p><p class="source-note">Product data on this page is published by DuPont, the manufacturer of MOLYKOTE®. See the linked technical data sheet for full test conditions.</p>`,
  },
  {
    slug: 'manuli-m03500-no-skive-ferrule',
    note: 'a Manuli ferrule series: caption, scroll rail, thead with scope=col',
    html: `<p>The M03500 is Manuli's no-skive ferrule for wire spiral hydraulic hoses. It is the only no-skive series in the range cut for spiral reinforcement, and it starts at DN10 rather than DN5 — the smaller bores are covered by the braid series instead.</p>
<h3>Sizes and dimensions</h3>
<div class="ih-table-scroll">
<table class="ih-data-table">
<caption>M03500 — part reference, hose bore and ferrule dimensions</caption>
<thead><tr><th scope="col">Part ref.</th><th scope="col">DN</th><th scope="col">Dash</th><th scope="col">Inch</th><th scope="col">D (mm)</th><th scope="col">L (mm)</th></tr></thead>
<tbody>
<tr><td>M03500-06</td><td>10</td><td>-6</td><td>3/8"</td><td>29.5</td><td>30.7</td></tr>
<tr><td>M03500-08</td><td>12</td><td>-8</td><td>1/2"</td><td>33.4</td><td>32.0</td></tr>
<tr><td>M03500-10</td><td>16</td><td>-10</td><td>5/8"</td><td>37.2</td><td>34.8</td></tr>
<tr><td>M03500-12</td><td>19</td><td>-12</td><td>3/4"</td><td>41.3</td><td>40.0</td></tr>
<tr><td>M03500-16</td><td>25</td><td>-16</td><td>1"</td><td>49.1</td><td>51.0</td></tr>
<tr><td>M03500-20</td><td>31</td><td>-20</td><td>1.1/4"</td><td>59.3</td><td>54.5</td></tr>
</tbody>
</table>
</div>
<p><strong>D</strong> is the ferrule outside diameter and <strong>L</strong> the overall length, both in millimetres and both as supplied — they are not crimp dimensions. Across this series D runs 29.5–59.3 mm and L runs 30.7–54.5 mm.</p>
<h3>Construction</h3>
<ul>
<li>Ferrule type: no-skive</li>
<li>Published by Manuli for wire spiral hoses</li>
<li>Part references in this series: M03500</li>
<li>Bore coverage: DN10 – DN31 (3/8" – 1.1/4"), 6 references</li>
</ul>
<p>No-skive means the ferrule crimps over the hose cover as supplied, with no stripping step. It is faster to assemble and removes the commonest field error on a skive assembly, which is skiving to the wrong depth.</p>
<h3>Selecting a size</h3>
<p>Read the bore off your hose — DN, dash or inch, whichever your drawing uses — and take the part reference on that row. The D and L columns are there for clearance: a ferrule has to fit the routing and the crimp die, and on tight installations that decides between two series more often than the bore does.</p>
<p>The crimp diameter is not on this sheet, and it is not a property of the ferrule alone — it comes from the hose grade and the fitting it is crimped with, on the die chart for your crimper. Send us the crimper model with the enquiry and we will quote against it.</p>
<h3>How to order</h3>
<p>Quote the part reference from the table, or give us the hose grade, the bore and the quantity and we will identify it. Indus supplies these ferrules loose or crimped as a finished assembly with the matching fitting at each end — say which when you send the enquiry.</p>`,
  },
  {
    slug: 'demco-series-ne-c-general-purpose-butterfly-valve-2-12',
    note: 'a DEMCO part-number matrix: a table with no rail and no caption',
    html: `<p>The DEMCO Series NE-C is the long-neck, general-purpose member of the DEMCO resilient-seated butterfly valve family. The longer neck length is engineered to provide full clearance of the valve top over two inches of insulation on ASME Class 150 pipe flanges, making it the default selection for insulated process lines, steam-jacketed systems, and any installation where the valve top must clear lagging or cladding. Available in both wafer and lug body styles, in sizes 2″ through 12″, with the full DEMCO range of body / stem / disc materials and seat elastomers. Bi-directional sealing at full rated pressure, with three drop-tight shut-off ratings (200 / 285 / 50 psi) and a throttling option for control-valve service.</p>
<h3>Construction</h3>
<ul>
<li><strong>Body configurations:</strong> Wafer and Lug</li>
<li><strong>Size range:</strong> 2″ – 12″ (50 – 300 mm)</li>
<li><strong>End connections:</strong> ASME Class 125/150 flanges (raised- or flat-face)</li>
<li><strong>Body materials:</strong> Cast iron (wafer), ductile iron (lug), aluminium bronze, carbon steel (WCB), aluminium, ENC nickel-plated ductile iron, 316 stainless steel (CF8M), PVF-coated ductile iron</li>
<li><strong>Stem materials:</strong> 416 stainless, 316 stainless, Monel — utility-top option for actuator interchangeability</li>
<li><strong>Disc materials:</strong> 316 SS (CF8M), Monel (M30C), aluminium, bronze, ductile iron, ENC nickel-plated ductile iron, vented, solid SS, Alloy 20 (CN-7M), Hastelloy C (CW-2M), aluminium bronze, PVF-coated ductile iron</li>
<li><strong>Seat elastomers:</strong> Buna-N, Black Neoprene, Hypalon, Viton, EPDM (peroxide-cured), Natural Rubber, White Neoprene, ETM-30230, Fluorosteam, Peroxide-Cured Buna-N</li>
<li><strong>Bearings:</strong> Bronze (standard); throttling discs include 4 stem O-rings for stem sealing.</li>
</ul>
<h3>Performance</h3>
<ul>
<li><strong>Pressure class:</strong> ASME Class 150 (285 psi non-shock body rating).</li>
<li><strong>Drop-tight shut-off ratings:</strong> 200 psi (standard), 285 psi (high-pressure), 50 psi (low-torque), Throttling.</li>
<li><strong>Vacuum:</strong> Sealed against 10 microns of vacuum (29.9 in Hg).</li>
<li><strong>Temperature range:</strong> −30°F to +300°F (−34°C to +149°C) — depends on selected elastomer.</li>
<li><strong>Bi-directional sealing:</strong> Identical drop-tight closure from either flow direction.</li>
<li><strong>End-of-line service:</strong> Lug body suitable for end-of-line service with downstream piping removed (weld-neck or socket flanges only).</li>
<li><strong>Flow coefficient (Cv at 90° open):</strong> 145 (2″) → 7,500 (12″).</li>
</ul>
<h3>Engineered features</h3>
<ul><li>Long neck clears 2″ of insulation on ASME Class 150 flanges — eliminates handle/actuator clearance issues on lagged piping</li><li>One-piece body for minimum weight and maximum strength</li><li>Hard-backed cartridge seat — bonds resilient elastomer to a rigid backing ring; field-replaceable with no special tools</li><li>Triple stem seal: integral flange seal + hard-backed seat + dual O-ring ribs in stem bore (eliminates stem leakage path that is common to "boot-seat" competitive designs)</li><li>Dry stem journal — continuous annular raised land around stem hole prevents fluid behind the seat</li><li>Floating disc — perfectly centres in seat for prolonged service life and drop-tight closure</li><li>Positive stem retention — blowout-proof stem</li><li>Flatted "double-D" upper stem with large flange top — accepts the full DEMCO actuation range</li><li>MSS SP-25 marking is standard</li></ul>
<h3>Typical applications</h3>
<ul><li>Chemical and petrochemical process lines (insulated)</li><li>Oil and gas drilling and production utilities</li><li>Steam-jacketed and steam-traced piping</li><li>Cooling towers and HVAC chilled-water service</li><li>Power generation auxiliary systems</li><li>Mining and minerals processing</li><li>Water and waste-water treatment</li><li>Marine and government service</li></ul>
<h3>How to order</h3>
<p>DEMCO uses an 11-character part number to specify each unique configuration. Build the part number from the base number plus six selection digits:</p>
<table><thead><tr><th scope="col">Position</th><th scope="col">Selection</th></tr></thead><tbody><tr><td><strong>Body Configuration</strong></td><td>Wafer (1), Lug (5)</td></tr><tr><td><strong>Body Material</strong></td><td>Ductile Iron (1), Cast Iron wafer (2), Aluminium Bronze (3), Carbon Steel (4), Aluminium NE-I wafer only (5), ENC Coated DI (6), Stainless Steel (8)</td></tr><tr><td><strong>Stem Material</strong></td><td>416 SS (1), 316 SS (2), Monel (3)</td></tr><tr><td><strong>Disc Material</strong></td><td>316 SS (2), Monel (3), Aluminium (4), Ductile Iron (5), Vented (6), Solid SS (9), Alloy 20 (7), Hastelloy C (8)</td></tr><tr><td><strong>Seat Elastomer</strong></td><td>Buna-N (31), Black Neoprene (32), Hypalon (33), Viton (34), Peroxide-Cured EPDM (35), Natural Rubber (36), White Neoprene (37), ETM-30230 (01), Fluorosteam (02), Peroxide-Cured Buna-N (03)</td></tr><tr><td><strong>Actuation</strong></td><td>Bare Shaft (—), 10-Position Locking Handle (14), 2-Position Locking Handle (64), Throttling Memory-Stop Handle (24), Square Nut (5), Worm-Gear Operator, Series DR Pneumatic Actuator</td></tr></tbody></table>
<p>Example DEMCO base part numbers in this series:</p>
<ul><li><code>22119 (2″, 200 psi)</code></li><li><code>22124 (6″, 200 psi)</code></li><li><code>22127 (12″, 200 psi)</code></li><li><code>22230 (6″, 285 psi)</code></li><li><code>22239 (6″, 50 psi)</code></li><li><code>22248 (6″, throttling)</code></li></ul>
<p><strong>For your RFQ, please specify:</strong> required size, pressure rating, body configuration (wafer or lug), body / stem / disc materials, seat elastomer, and required actuation. Indus Hydraulics will return an estimate against the corresponding DEMCO base part number.</p>
<h3>Compliance &amp; marking</h3>
<ul>
<li>MSS SP-25 marking standard on every valve.</li>
<li>Body rating to ASME Class 150 (285 psi non-shock).</li>
<li>Wafer body diameters self-centre in ASME Class 150 flange patterns.</li>
<li>Triple stem seal: hard-backed cartridge seat + integral flange seal + dual O-ring stem ribs in the seat bore.</li>
</ul>
<h3>Companion products</h3>
<p>Manual handles, weatherproof worm-gear operators, and Series DR pneumatic actuators all interchange on this valve via the DEMCO top-flange standard. Compatible Indus SKUs include <code>IH-VAL-BFLY-HDL-10P</code>, <code>IH-VAL-BFLY-HDL-MEM</code>, <code>IH-VAL-BFLY-WGO</code>, <code>IH-VAL-BFLY-DR-DA</code>, <code>IH-VAL-BFLY-STMX</code>. For automated installations, also see the position indicator switch, solenoid valve, pneumatic positioner, and seal-repair-kit accessories listed against the corresponding actuator product.</p>`,
  },
  {
    slug: 'oil-suction-delivery-hose-20-bar',
    note: 'the <code> runs used for part numbers and thread callouts',
    html: `<p>The <strong>Oil Suction & Delivery Hose 20 Bar</strong> (part code <code>A460</code>) is a Oil / Chemical / General Purpose Hose from the Indus Hydraulics industrial hose range.</p>
<h3>Application</h3>
<p>Heavy duty hose used in petrochemical plants and dockyards for handling unleaded fuels and hydraulic oils</p>
<h3>Construction</h3>
<ul>
<li><strong>Cover:</strong> Black mandrel wrap, oil, abrasion, ozone and weather resistant CR</li>
<li><strong>Lining / Tube:</strong> Black oil resistant NBR suitable for 50% aromatic hydrocarbons</li>
<li><strong>Reinforcement:</strong> High tensile strength textile plies, twin steel helix and anti-static wires</li>
<li><strong>Branding (printed on hose):</strong> INDUS LOGO A460 OIL S&amp;D 20 BAR SF 3:1 VAC 0.9 BAR</li>
</ul>
<h3>Performance</h3>
<ul>
<li><strong>Inner-diameter range:</strong> 51 mm to 152 mm</li>
<li><strong>Max working pressure:</strong> 20 bar</li>
<li><strong>Min burst pressure:</strong> 60 bar</li>
<li><strong>Min bend radius:</strong> 255-760 mm</li>
<li><strong>Weight:</strong> 2.08-11.02 kg/m</li>
<li><strong>Operating temperature:</strong> From -40°C to +100°C</li>
<li><strong>Safety factor:</strong> 3:1</li>
</ul>
<h3>Family context</h3>
<p>Multi-purpose hoses for oil, fuel, mineral oil, and chemical transfer. Range covers tanker reeling, oil suction &amp; delivery, and UHMWPE chemical hoses for aggressive media. EN 1761 / EN 12115 where applicable.</p>
<h3>How to order</h3>
<p>Specify (a) the inner diameter from the size range, (b) the assembly length, (c) end-fitting requirements, and (d) any special requirements such as Lloyd's certification or third-party witness testing. Indus engineering will confirm the assembly drawing on the RFQ.</p>
<h3>Companion products</h3>
<p>Pair with matching couplings and accessories (Cam &amp; Groove, Boss steam couplings, hose clamps, Holedall permanently-attached fittings, hose tags, and Spiral Hose Guard / Fire Jacket protective sleeves) — full range available on quote.</p>`,
  },
  {
    slug: 'thorburn-s92z-type-316l-ss-annular-double-braid-304-ss',
    note: 'the rare <em> run',
    html: `<p>The <strong>Thorburn S92Z — Type 316L SS Annular, Double Braid (304 SS)</strong> is a annular corrugated metallic hose in the <em>Stainless SS Corrugated</em> family. Type 316L SS core with double braid of Type 304 SS. Working pressure to 215 bar, operating temperature -200°C to +650°C.</p>
<h3>Construction</h3>
<ul>
<li>Type: Stainless SS Corrugated — Type 316L double-braid annular (304 SS braid)</li>
<li>Construction: Annular Corrugated</li>
<li>Core material: Type 316L SS</li>
<li>Braid: Double Braid — Type 304 SS</li>
<li>End fitting material: 316L SS standard; Inconel, Hastelloy, or Monel available for matched-trim service</li>
<li>Nominal ID range: DN 6 (1/4") to DN 300 (12")</li>
<li>Bend radius (static): 25 mm minimum</li>
<li>Bend radius (dynamic): 127 mm minimum</li>
<li>Weight: ~0.37 kg/m (size-dependent)</li>
</ul>
<h3>Performance</h3>
<p>Maximum working pressure 215 bar at the smallest bore (decreases with increasing diameter — refer to the OEM size table for per-size ratings). Minimum burst pressure 862 bar with safety factor 4:1 per ISO 10380. Operating temperature range -200°C to +650°C (continuous service; intermittent excursions evaluated on request). All assemblies hydrotested at 1.5× working pressure with a witness-test certificate available on request.</p>
<h3>Applications</h3>
<ul>
<li>High-pressure petrochemical service</li><li>Sour-gas processing manifolds</li><li>HP sea-water cooling</li><li>Refinery cracker / reformer service</li>
</ul>
<h3>Compliance</h3>
<ul>
<li>ISO 10380:2012 PSL 2 (Corrugated Metal Hoses and Hose Assemblies)</li>
<li>Pressure Equipment Directive 2014/68/EU Module H</li>
<li>ASME B31.1, B31.3, Section IX</li>
<li>NACE MR0175 / ISO 15156 (sour-service compliant trim and fittings)</li>
<li>CSA B51, CGA-8.1-M86</li>
<li>EN 10204 3.1 / 3.2 mill test reports on request</li>
</ul>
<h3>How to order</h3>
<p>Confirm (a) line working pressure and process medium, (b) operating temperature range, (c) bore size and overall length, (d) end fitting type per side (NPT / BSPP / ANSI 150-1500# RF / DIN PN10-PN40 / sanitary tri-clamp / camlock / butt-weld / etc.), (e) braid configuration (unbraided / single / double / triple — drives pressure rating), (f) any required certifications (ISO 10380 PSL class, PED Module, ASME conformance, NACE MR0175, CGA / UL / Chlorine Institute). Indus quotes ex-Dubai for stock items and ex-OEM for build-to-order, with mill test reports and pressure-test certificates included.</p>
<h3>Companion products</h3>
<p>Pair with matched ANSI flange gaskets, hose clamps, and OEM end-fitting hardware. For high-vibration installations, also specify a Lock-Section or Armor-Flex external hose guard. For fire-rated runs, add a Fry-Sil Fire Jacket or Fire Tape covering. For high-cycle or premium-corrosion service, ask about the matched OEM expansion-joint variant of the same alloy and pressure class.</p>`,
  },
]
