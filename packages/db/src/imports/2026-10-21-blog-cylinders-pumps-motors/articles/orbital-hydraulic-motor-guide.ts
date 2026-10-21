import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Orbital motors. Construction, family ratings, flange dimensions, shafts, ports, case drain, brakes, oil and
 * run-in from Danfoss Orbital Motors General (BC152886483554en-000401), the OMP/OMR/OMH, OMS/OMT/OMV and OML/OMM
 * technical information, and the Char-Lynn series pages on Danfoss PowerSource, read 2026-10-21. Char-Lynn
 * prefixes 101/103/104/106/109/112/119 verified on PowerSource product pages. BM-to-OM letter mapping supported by
 * matching displacement ranges; BM-to-Char-Lynn mapping NOT published (unverified). Our listing ranges quoted from
 * the DFC, Fluidyne and Char-Lynn listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'orbital-hydraulic-motor-guide',
  title: 'Orbital hydraulic motors: how they work, Char-Lynn and Danfoss families, BM codes, mounts and shafts',
  excerpt:
    'Orbital motors turn hydraulic flow into slow, heavy torque from a body the size of a coffee tin. How the gerotor and geroler sets and the spool and disc valves work, the Danfoss OM and Char-Lynn families with their ratings, what the BM codes on replacement motors mean, SAE and magneto flanges, shafts, ports, case drains and brakes.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Orbital Hydraulic Motors Guide: Char-Lynn, Danfoss OM & BM Codes',
  seoDescription:
    'How orbital (gerotor/geroler) hydraulic motors work, Danfoss OMM to OMV and Char-Lynn H, S, 2000 to 10000 series ratings, BM interchange codes, SAE A/B/C, magneto and wheel mounts, shafts, ports, case drains and brakes.',
  focusKeyword: 'orbital hydraulic motor',
  publishedAt: '2026-10-21T09:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An orbital motor is a low-speed, high-torque motor built on an internal gear set: a star orbiting inside a ring, with a valve that feeds each chamber in turn.',
        'Spool-valve designs are compact and cheap; disc-valve designs with roller (geroler) gear sets and tapered bearings take higher pressure, rougher duty and heavier shaft loads.',
        'Danfoss’s range runs from the OMM (8–50 cc, 100 bar continuous) to the OMV (315–800 cc, 200 bar); Char-Lynn from the H series (141 bar) to the 10000 series (205 bar, 2,700 Nm continuous).',
        'Chinese-pattern BM codes follow the Danfoss letters — BMM, BMP, BMR, BMH, BMS, BMT, BMV — and their displacement ranges match. Flange, pilot, shaft and ports must still be checked.',
        'Most failures are shaft seals blown by back pressure, worn sets from dirty oil, and bearings overloaded by side load.',
      ],
    },
    {
      type: 'lead',
      html: 'Orbital motors are the default drive for anything that turns slowly and needs to push hard: augers, conveyors, sweeper brushes, mixer drums, wheel drives on compact machines, winches and slew drives. They are also the motors most often replaced on the strength of a part number nobody can read any more. This guide explains how they work, how the families line up across makers, and how to identify one from the flange, shaft and ports.',
    },

    { type: 'section_head', number: '/01', title: 'How an orbital motor works.', anchor: 'principle' },
    {
      type: 'prose',
      html: '<p>Inside the motor is an internal gear set. A ring with internal lobes is fixed to the housing; inside it sits a star (rotor) with one tooth fewer. Oil pressure in the chambers between them pushes the star round — but because it has one tooth fewer, it does not simply rotate: its centre orbits inside the ring while it turns slowly on its own axis. A drive shaft with splines at both ends (the cardan or dogbone) connects the wobbling star to the output shaft. Every revolution of the output shaft involves many fillings and emptyings of the chambers — for a 6-tooth star in a 7-lobe ring, 42 cycles per revolution — which is why the motor produces high torque at low speed from a small body.</p><p>A distributor valve, driven in step with the star, connects each chamber to the inlet or the outlet at the right moment. Reverse the flow and the motor reverses.</p><h3>Gerotor and geroler</h3><p>In a plain <strong>gerotor</strong> set, the star’s teeth slide against the ring’s lobes. In a <strong>geroler</strong> (roller) set, the ring carries rollers that the star rolls against, giving lower friction, higher mechanical efficiency and better starting torque. Char-Lynn uses geroler sets with precision rollers across its range; Danfoss’s OMS, OMT and OMV have roller gear rims.</p><h3>Spool valve and disc valve</h3><p>In a <strong>spool-valve</strong> motor, the distributor is machined into the output shaft itself, turning in the housing. It is compact and economical. In a <strong>disc-valve</strong> motor, the distributor is a separate disc driven by a short second cardan (the valve drive), with a balance plate countering the hydraulic forces on it. Separating the valve from the output shaft means side load on the shaft no longer disturbs the valve, and the output shaft can run in tapered roller bearings. Danfoss describes its disc-valve OMT and OMV as suited to continuous duty in rough conditions — high pressure, thin oil, frequent reversals — with good starting characteristics. Char-Lynn’s H, S and T series are spool-valve; the 2000, 4000, 6000 and 10000 series are disc-valve.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The Danfoss OM families.', anchor: 'danfoss' },
    {
      type: 'comparison_table',
      caption: 'Danfoss orbital motor families — displacements and pressure drop (continuous / intermittent / peak), from Danfoss technical information',
      columns: ['Family', 'Displacements (cc/rev)', 'Δp cont / int / peak (bar)', 'Notes'],
      rows: [
        { cells: ['OML', '8–32', '70 / 125 / 140', 'Smallest; light duty'] },
        { cells: ['OMM', '8.2–50', '100 / 140 / 200 on 8–20 cc; less on larger', 'Compact; small fans, pumps, conveyors'] },
        { cells: ['OMP', '25–389', '100–140 / 140–175 / 225, falling on largest', 'General purpose'] },
        { cells: ['OMR', '51.6–373', '175 / 200 / 225 on 80–125 cc; falling on largest', 'Most common general-purpose size'], highlight: true },
        { cells: ['OMH', '201–471', '175 / 200 / 225 on 200–250 cc', 'Heavier shaft and bearings'] },
        { cells: ['OMS', '80.5–488', '210 / 275 / 295 on 80–125 cc', 'Roller set; tapered bearings on wheel versions'] },
        { cells: ['OMT', '161–524', '200 / 240 / 280 on 160–315 cc', 'Disc valve, roller rim, tapered bearings'] },
        { cells: ['OMV', '315–802', '200 / 240 / 280 on 315–500 cc', 'Largest; up to 1,880 Nm continuous'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two rules run through every Danfoss table. Intermittent ratings apply to no more than 10% of every minute and peak ratings to no more than 1%. And within each family, pressure ratings fall as displacement rises — the largest OMR is rated only 55 bar continuous on its standard shaft — while the shaft itself often limits torque before the gear set does: an OMS on a 7/8" spline is limited to 200 Nm regardless of size.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Char-Lynn series and part-number prefixes.', anchor: 'char-lynn' },
    {
      type: 'comparison_table',
      caption: 'Char-Lynn series (Danfoss PowerSource) — continuous / intermittent ratings',
      columns: ['Prefix', 'Series', 'Valve', 'Pressure', 'Torque', 'Flow'],
      rows: [
        { cells: ['101-', 'H', 'Spool', '141 / 177 bar (2,050 / 2,565 psi)', '407 / 520 Nm', '61 / 76 L/min'] },
        { cells: ['103-', 'S', 'Spool, geroler', '135 / 170 bar (2,000 / 2,500 psi)', '465 / 530 Nm', '55 / 75 L/min'] },
        { cells: ['104-, 106-', '2000', 'Disc', '205 / 310 bar (3,000 / 4,500 psi)', '845 / 930 Nm', '75 / 115 L/min'], highlight: true },
        { cells: ['109-', '4000', 'Disc', '207 / 310 bar', '972 / 1,181 Nm', '95 / 151 L/min'] },
        { cells: ['112-', '6000', 'Disc, geroler', '200 / 300 bar', '1,685 / 1,875 Nm', '150 / 225 L/min'] },
        { cells: ['119-', '10000', 'Disc, geroler', '205 / 275 bar', '2,700 / 3,440 Nm', '170 / 265 L/min'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The first three digits of a Char-Lynn part number name the series, which is the fastest way to identify a motor whose tag is half gone: a 104-xxxx-006 is a 2000 series disc-valve motor, a 101- is an H series spool motor. The figures above are Danfoss’s own; some resellers quote the intermittent figure as continuous (310 bar “continuous” for the 2000 series is wrong — it is 205 bar continuous). The 2000 series is also built as a two-speed motor that switches displacement in a 1:2 ratio: roughly half the torque at about double the speed in high-speed mode.</p><p>We list Char-Lynn 101 (2.8–22.6 in³/rev), 103 (4.6–22.7 in³/rev), 104 (4.9–18.7 in³/rev) and 112/119 motors (19.0–30.0 in³/rev) part number by part number, with the mount, shaft and port of each.</p>',
    },

    { type: 'section_head', number: '/04', title: 'What the BM codes mean.', anchor: 'bm-codes' },
    {
      type: 'prose',
      html: '<p>Replacement orbital motors from Asian makers are usually coded BM followed by a letter: BMM, BMP, BMR, BMH, BMS, BMT, BMV. The letter follows the Danfoss family it is patterned on — BMR for OMR, BMS for OMS, BMV for OMV — and the published displacement ranges line up: BMM 8–50 cc against OMM 8–50, BMR 50–375 against OMR 50–375, BMV 315–800 against OMV 315–800. Suffixes such as BMPH, BMRS and BMSY denote variants within the pattern (heavier bearings, side ports, wheel mounts and so on, depending on the maker).</p><p>Our DFC listings follow the same codes, with displacement and both continuous and intermittent ratings per part number: BMM(Z) 8.2–50.3 cc; BMPH 36–390 cc; BMRS 51.7–381.4 cc; BMH 203–489 cc; BMSY wheel motors 81–475 cc; BMT 161–802 cc; BMV 333–990 cc; and the large BMK6 (196–982 cc on an SAE CC flange) and BMER wheel motors (118–745 cc).</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Same letters, not necessarily the same motor.',
      body: 'A BM code tells you the pattern, not the dimensions. Before ordering an interchange, check four things against the motor on the machine: flange type and pilot diameter, shaft type and size, port thread and position, and displacement. There is no published mapping from BM codes to Char-Lynn series — match a Char-Lynn by its measurements, not by a code chart.',
    },

    { type: 'section_head', number: '/05', title: 'Flanges, shafts and ports.', anchor: 'mounts' },
    {
      type: 'comparison_table',
      caption: 'Common orbital motor flanges (from Danfoss and Char-Lynn drawings)',
      columns: ['Mount', 'Pilot diameter', 'Bolt circle / holes', 'Typical use'],
      rows: [
        { cells: ['SAE A 2-bolt', '82.55 mm (3.25")', '106.4 mm, Ø13.5 holes', 'General purpose: augers, conveyors'], highlight: true },
        { cells: ['SAE A 4-bolt (oval or square)', '82.55 mm', '4 holes', 'Where a stiffer mount is wanted'] },
        { cells: ['Char-Lynn 4-bolt square (H, S)', '44.4 mm (1.75")', '82.6 mm (3.25"), 3/8-16 tapped', 'Older Char-Lynn installs'] },
        { cells: ['SAE B 2-bolt', '101.6 mm (4.00")', '146.0 mm (5.75")', 'Larger motors, 2000 series'] },
        { cells: ['SAE B 4-bolt', '101.6 mm', '127.0 mm (5.00")', '4000 series and similar'] },
        { cells: ['SAE C 4-bolt', '127.0 mm (5.00")', '161.9 mm (6.38")', 'Large motors: 10000, OMV'] },
        { cells: ['Wheel mount', 'Recessed flange', 'Per maker', 'Wheels, drums: load between bearings'] },
        { cells: ['Bearingless (short)', '—', 'Mounts into the gearbox', 'Gearbox and wheel drives that carry the load'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>“Magneto” mount is a trade name used by several makers — Danfoss and Parker both offer one — for a small square or diamond flange; its dimensions are not standardised across makers, so measure the pilot and bolt pattern rather than trusting the name. A <strong>wheel mount</strong> has its flange recessed toward the middle of the motor so that a wheel hub or drum carries its load between the two bearings, which is what lets a wheel motor carry the machine’s weight.</p><h3>Shafts</h3><ul><li>Straight keyed: 1" and 1-1/4" (SAE key), 25 mm and 32 mm (DIN 6885 keys), 40 mm on large frames.</li><li>Splined: 1" SAE 6B straight-sided; 7/8" 13-tooth 16/32 pitch; 1-1/4" 14-tooth 12/24 pitch involute; 1-1/2" 17-tooth; 2-1/8" 16-tooth on the largest motors.</li><li>Tapered with nut: 1-1/4" taper is common on wheel motors; 35 mm 1:10 on European frames.</li></ul><h3>Ports</h3><p>7/8-14 UNF SAE O-ring boss on most US-pattern motors (1-1/16-12 and 1-5/16-12 on larger frames), 1/2" NPTF on older Char-Lynn and some OMR, G 1/2 BSPP on European motors, M22×1.5 ISO 6149 on some, and manifold ports for valve blocks. Drain ports are usually 7/16-20 UNF or G 1/4.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Case drains, brakes and circuits.', anchor: 'circuits' },
    {
      type: 'prose',
      html: '<p>Danfoss motors (except the OMEW) are three-chamber designs that isolate high pressure from the case, so an external drain can be fitted when return pressure is too high for the shaft seal. Whether it is needed depends on the plumbing: with internal check valves and no drain, the seal sees return pressure; with neither checks nor drain, it sees the average of inlet and return. Seal limits also fall with speed. Fit a drain, straight to tank, on series circuits, on restricted returns, on every brake motor and on any bearingless motor built into a gearbox. Danfoss’s high-pressure shaft seal option makes a drain unnecessary in most conditions.</p><p><strong>Brakes:</strong> an orbital motor cannot hold a load — Danfoss is explicit that internal leakage will let it move. Winches, slew drives and wheel drives on slopes need a holding brake, integral or external; brake motors such as the OMR F and OMT FX/FL/FH are parking brakes, released by pressure.</p><p><strong>Series or parallel:</strong> in series, every motor runs at the same speed and pressure splits between them, so the first motor must be rated for the full inlet pressure and each for its back pressure. In parallel, every motor sees full pressure and flow divides by load — if one wheel loses grip it takes all the flow and the others stop, so fit a flow divider.</p><p><strong>Overrunning loads</strong> turn the motor into a pump. Control them with a counterbalance or brake valve, and keep positive pressure on the low side so the gear set does not cavitate while braking.</p>',
    },

    { type: 'section_head', number: '/07', title: 'Oil, run-in and what wears them out.', anchor: 'care' },
    {
      type: 'prose',
      html: '<ul><li><strong>Cleanliness:</strong> Danfoss asks for ISO 4406 20/16 or better, achieved with a return filter finer than 40 µm absolute, and 20 µm absolute in dirty or complex systems. Fit a pressure filter ahead of the motor where quick couplers are used.</li><li><strong>Temperature:</strong> Danfoss gives 30–60 °C as normal oil temperature and notes that oil life halves for every 8 °C above 60 °C — a figure worth remembering on any Gulf machine whose tank runs hotter than that.</li><li><strong>Viscosity:</strong> 20–75 mm²/s at running temperature, 35 mm²/s recommended; HLP or HM anti-wear mineral oil.</li><li><strong>Run-in:</strong> fill through a fine filter, bleed, and run unloaded for 15–30 minutes before putting load on. Foam, jerky motion or noise means air is still in the circuit.</li><li><strong>Installation:</strong> flat mounting faces in full contact; never pull the motor into place with its bolts; no PTFE tape on threads; port plugs left in until the hoses go on.</li><li><strong>Side load:</strong> sprockets, pulleys and wheels load the bearings — side load is torque divided by the sprocket radius. Tapered-roller motors (OMT, OMV, wheel versions, Char-Lynn 2000) carry far more than slide-bearing designs, and halving speed doubles bearing life.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Identifying an orbital motor for replacement',
      branches: [
        { condition: 'Is there a readable part number?', outcome: 'Char-Lynn: the first three digits name the series. Danfoss: OM + letter + displacement. BM-coded: the letter names the Danfoss pattern.' },
        { condition: 'Measure the flange', outcome: 'Pilot diameter and bolt circle: 82.55 mm = SAE A, 101.6 mm = SAE B, 127 mm = SAE C; 44.4 mm pilot on a 4-bolt square = older Char-Lynn.' },
        { condition: 'Measure the shaft', outcome: 'Diameter, keyed or splined (count teeth), or tapered.' },
        { condition: 'Identify the ports', outcome: 'Thread (7/8-14 UNF, 1/2 NPTF, G 1/2) and whether they are side, end or manifold.' },
        { condition: 'Find the displacement', outcome: 'From the tag, or by measuring flow and speed: cc/rev = L/min × 1,000 ÷ rpm.' },
        { condition: 'Check the duty', outcome: 'Wheel or sprocket load, back pressure, brake — these decide between a standard, wheel, bearingless or brake motor.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an orbital hydraulic motor?', answer: 'A low-speed, high-torque motor built on an internal gear set — a star orbiting inside a lobed ring — with a valve that feeds each chamber in turn. It gives high torque at low speed from a small body.' },
        { question: 'What is the difference between a gerotor and a geroler motor?', answer: 'In a gerotor the star’s teeth slide against the ring. In a geroler the ring carries rollers, which reduce friction and improve mechanical efficiency and starting torque.' },
        { question: 'What is the difference between spool and disc valve orbital motors?', answer: 'A spool-valve motor has the distributor built into the output shaft — compact and economical. A disc-valve motor has a separate valve disc with its own drive, so it tolerates higher pressure, shaft side load and rough duty better.' },
        { question: 'What does the Char-Lynn part number prefix mean?', answer: 'It names the series: 101 = H, 103 = S, 104 and 106 = 2000, 109 = 4000, 112 = 6000, 119 = 10000.' },
        { question: 'Are BM motors interchangeable with Danfoss?', answer: 'The BM letter follows the Danfoss family — BMR for OMR, BMS for OMS — and the displacement ranges match. Confirm flange, pilot, shaft, ports and displacement against the motor you are replacing before ordering.' },
        { question: 'Does an orbital motor need a case drain?', answer: 'When return pressure would exceed the shaft seal’s limit — series circuits, restricted returns — and always on brake motors and bearingless motors in gearboxes. Many run without one on simple circuits.' },
        { question: 'Can an orbital motor hold a load?', answer: 'No. Internal leakage lets the load move. Use an integral or external holding brake on winches, slew drives and wheel drives.' },
        { question: 'What is a magneto mount?', answer: 'A trade name for a small square or diamond flange used by several makers. It is not a single standard, so measure the pilot and bolt pattern.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Every orbital motor in the range:</p>' + stockList(['orbital-hydraulic-motors']),
    },
    {
      type: 'product_embed',
      heading: 'Orbital motors by frame',
      skus: ['IH-DFC-BMMZ', 'IH-DFC-BMPH-2BA', 'IH-DFC-BMRS-4B', 'IH-DFC-BMT', 'IH-DFC-BMV', 'IH-CL-101', 'IH-CL-104', 'IH-FLD-WF105-WHL'],
      note: 'Each listing gives displacement, mount, shaft, ports and continuous and intermittent ratings per part number.',
    },
    { type: 'category_link', slug: 'orbital-hydraulic-motors', label: 'Orbital motors', blurb: '62 listings: BM-pattern, Char-Lynn and Fluidyne, every common mount.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-motor-torque-and-speed', 'gear-orbital-or-piston-hydraulic-motor', 'winch-drive-vs-motor-drum-vs-complete-winch', 'how-to-size-a-hydraulic-pump'],
    },
    {
      type: 'standard_citation',
      standard: 'Danfoss Orbital Motors General',
      publisher: 'Danfoss',
      title: 'Orbital Motors — General technical information (BC152886483554en-000401)',
      clause: 'pp. 8–10, 13–16, 19–20, 26–28',
      summary: 'Danfoss’s own explanation of orbital-motor construction, duty definitions, efficiency, shaft-seal plumbing, brakes and oil requirements, used throughout this article.',
      url: 'https://assets.danfoss.com/documents/195953/BC152886483554en-000401.pdf',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Family ratings and dimensions from Danfoss technical information and Char-Lynn PowerSource pages; BM ranges from our DFC listings.',
    },
    {
      type: 'cta_block',
      heading: 'Need an orbital motor matched?',
      body: 'Send the part number if it is readable, or the flange, pilot, shaft, ports and displacement. We will match it — Char-Lynn, Danfoss pattern or BM — and quote the hoses and fittings with it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
