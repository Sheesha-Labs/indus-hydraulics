/**
 * Correct standard- and maker-contradicted claims in the process valve, oilfield control and lubrication listings,
 * found while researching blog linkage wave 6 (2026-10-21). Targeted phrase replacements only, each scoped to the
 * SKUs it was found on. Copy fields and spec-row values are both covered; a spec rule names the row label.
 *
 * Sources (summarised per rule in `note`): API 594, 600, 602, 603, 609 and BS 1868/1873 scope abstracts; ISO 17292,
 * ISO 21011 and ISO 28921-1 scope records; a pressure relief valve engineering handbook (API 527 = seat tightness
 * only, not used for ASME Section I valves; ISO 4126-1 spring-loaded, 4126-4 pilot-operated); SLB "Introduction to
 * API Specification 6A" (PSL 1 not applicable to SSVs; PSLs not applicable to actuators); a 2003 check valve slam
 * study; Bijur Delimon datasheets and brochures (GPO 35641 and 35942, Dualine DL29, CS2000 2011F, BL 35583, L13 27877,
 * DA 35518/35495, HAP-P 24375, HIP-P 24374, PM45/PM60 36749 and 36407, TB-D hand-lever P_2005_1).
 *
 * Every rule must match at least once or already be applied (`=`); the dry run reports any that do neither, and a
 * real run refuses to write.
 *
 *   pnpm --filter @indus/db exec tsx src/scripts/fix-process-valve-lube-listings-2026-10-21.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const FIELDS = ['title', 'descriptionShort', 'descriptionLong', 'seoTitle', 'seoDescription'] as const
type Field = (typeof FIELDS)[number]

/**
 * `fields` defaults to every copy field; `spec` targets the value of the spec row with that label instead, and
 * `whole` limits a spec rule to rows whose entire value is `find`.
 */
type Rule = { skus: string[]; find: string; replace: string; note: string; fields?: Field[]; spec?: string; whole?: boolean }

const NO_BACKSEAT = ['IH-PV-DPC', 'IH-PV-FCK', 'IH-PV-SCC', 'IH-PV-TDC']
const SRV_TEST = ['IH-SR-BSV', 'IH-SR-CSV', 'IH-SR-JSV', 'IH-SR-LLV', 'IH-SR-OLV', 'IH-SR-PLV', 'IH-SR-POV', 'IH-SR-PHT', 'IH-SR-TRV', 'IH-SR-NPV', 'IH-SR-NSV']
const CRYO = ['IH-PV-CBF', 'IH-PV-CCK', 'IH-PV-CCV', 'IH-PV-CFS', 'IH-PV-CFT', 'IH-PV-CGL', 'IH-PV-CGT', 'IH-PV-CTS', 'IH-PV-CTT', 'IH-PV-HBF', 'IH-PV-HCK', 'IH-PV-HFL', 'IH-PV-HGL', 'IH-PV-HSD']
const LH2 = ['IH-PV-HBF', 'IH-PV-HCK', 'IH-PV-HFL', 'IH-PV-HGL', 'IH-PV-HSD']
const CRYO_BALL = ['IH-PV-CFS', 'IH-PV-CFT', 'IH-PV-CTS', 'IH-PV-CTT']
const WATERWORKS = ['IH-PV-WAD', 'IH-PV-WAS', 'IH-PV-WAX', 'IH-PV-WBC', 'IH-PV-WBE', 'IH-PV-WBT', 'IH-PV-WDP', 'IH-PV-WFX', 'IH-PV-WGM', 'IH-PV-WGR', 'IH-PV-WSC', 'IH-PV-WSW', 'IH-PV-WYS']
const ACTUATORS = ['IH-OFE-AHC', 'IH-OFE-AHD', 'IH-OFE-APD', 'IH-OFE-APP']
const SRV_TEST_OLD = 'Set-pressure and seat-tightness tests on the bench, shell test to API 527 / ASME requirements'

const RULES: Rule[] = [
  // Check valves
  { skus: ['IH-PV-AFC'], spec: 'Design standard', find: 'API 6D, API 594', replace: 'API 6D, ASME B16.34', note: 'API 594 excludes axial and nozzle checks' },
  { skus: ['IH-PV-DPC'], find: 'Dual plate check valves to API 594: NPS 2" to 84",', replace: 'Dual plate check valves to API 594 (NPS 2" to 48"), with larger sizes to NPS 84" to ASME B16.34:', note: 'API 594 stops at NPS 48' },
  { skus: ['IH-PV-SCC'], find: 'Cast steel swing check valves to BS 1868 and ASME B16.34: NPS 2" to 60",', replace: 'Cast steel swing check valves to BS 1868 (to NPS 24) and ASME B16.34: NPS 2" to 60",', note: 'BS 1868 covers DN 15–600' },
  { skus: ['IH-PV-SCC'], spec: 'Design standard', find: 'BS 1868, ASME B16.34', replace: 'BS 1868 (DN 15–600), ASME B16.34', note: 'BS 1868 covers DN 15–600' },
  { skus: ['IH-PV-FCK'], find: 'NPS 1/2" to 2", Class 800 to 2500,', replace: 'NPS 1/2" to 2", Class 150 to 1500 and Class 800 (Class 2500 to ASME B16.34),', note: 'API 602 classes stop at 1500' },
  { skus: ['IH-PV-FCK'], spec: 'Pressure class', find: 'Class 800, ASME Class 150 to 2500', replace: 'Class 800 and ASME Class 150 to 1500 (API 602); Class 2500 to ASME B16.34', note: 'API 602 classes stop at 1500' },
  { skus: ['IH-PV-TDC'], find: 'quick closing with a low cracking pressure and no water hammer,', replace: 'quick closing with a low cracking pressure and reduced slam,', note: 'tilting disc checks can still slam' },
  { skus: NO_BACKSEAT, find: 'Shell, backseat and seat tests to API 598', replace: 'Shell and seat tests to API 598', note: 'a check valve has no stem backseat' },
  { skus: NO_BACKSEAT, spec: 'Pressure testing', find: 'Shell, backseat and seat tests to API 598', replace: 'Shell and seat tests to API 598', note: 'a check valve has no stem backseat' },

  // Safety relief valves
  { skus: ['IH-SR-POV', 'IH-SR-PHT'], find: 'Operation: self-acting, spring loaded.', replace: 'Operation: pilot operated.', note: 'pilot-operated, not spring loaded' },
  { skus: ['IH-SR-POV', 'IH-SR-PHT'], spec: 'Operation', find: 'Self-acting, spring loaded', replace: 'Pilot operated', note: 'pilot-operated, not spring loaded' },
  { skus: ['IH-SR-POV'], spec: 'Design standard', find: 'ISO 4126-1', replace: 'ISO 4126-4', note: 'ISO 4126-4 is the pilot-operated part' },
  { skus: ['IH-SR-PHT'], spec: 'Design standard', find: 'API 520, API 526, ASME VIII, ISO 4126-1', replace: 'ASME Section I / VIII, ISO 4126-4', note: 'pilot-operated steam valve' },
  { skus: ['IH-SR-STM'], spec: 'Design standard', find: 'API 520, API 526, ASME VIII, ISO 4126-1', replace: 'ASME Section I', note: 'Section I boiler valve' },
  { skus: ['IH-SR-STM'], find: SRV_TEST_OLD, replace: 'Set-pressure test on steam, seat-leakage test with no visible steam leakage, and shell test to ASME Section I', note: 'API 527 is not used for Section I valves' },
  { skus: ['IH-SR-STM'], spec: 'Pressure testing', find: SRV_TEST_OLD, replace: 'Set-pressure test on steam, seat-leakage test with no visible steam leakage, shell test to ASME Section I', note: 'API 527 is not used for Section I valves' },
  { skus: ['IH-SR-TVV'], find: 'set -0.2 to -103.4 kPa', replace: 'set from -0.2 kPa vacuum, to the data sheet', note: '-103.4 kPa gauge is below absolute zero' },
  { skus: ['IH-SR-TVV'], find: 'Set vacuum -0.2 to -103.4 kPa', replace: 'Set vacuum from -0.2 kPa, to the data sheet', note: '-103.4 kPa gauge is below absolute zero' },
  { skus: ['IH-SR-TVV'], spec: 'Pressure class', find: 'Set vacuum -0.2 to -103.4 kPa', replace: 'Set vacuum from -0.2 kPa, to the data sheet', note: '-103.4 kPa gauge is below absolute zero' },
  { skus: ['IH-SR-CHG'], find: SRV_TEST_OLD, replace: 'Shell and seat-leakage tests', note: 'a changeover valve has no set pressure' },
  { skus: ['IH-SR-CHG'], spec: 'Pressure testing', find: SRV_TEST_OLD, replace: 'Shell and seat-leakage tests', note: 'a changeover valve has no set pressure' },
  { skus: SRV_TEST, find: SRV_TEST_OLD, replace: 'Set-pressure test on the bench, seat-tightness test to API 527 and shell test to ASME requirements', note: 'API 527 is seat tightness, not shell' },
  { skus: SRV_TEST, spec: 'Pressure testing', find: SRV_TEST_OLD, replace: 'Set-pressure test on the bench, seat-tightness test to API 527 and shell test to ASME requirements', note: 'API 527 is seat tightness, not shell' },
  { skus: ['IH-SR-POV'], find: '<li>Unaffected by back pressure</li>', replace: '<li>Opening pressure unaffected by back pressure</li>', note: 'capacity is still corrected for back pressure' },

  // Gate and globe valves
  { skus: ['IH-PV-GTC'], find: 'NPS 2" to 88", Class 150 to 2500', replace: 'NPS 2" to 42" to API 600 (larger sizes to ASME B16.34), Class 150 to 2500', note: 'API 600 stops at NPS 42' },
  { skus: ['IH-PV-GTC'], find: 'Published range: NPS 2" to 88" (DN50 to DN2200)', replace: 'Published range: NPS 2" to 88" (DN50 to DN2200); API 600 covers NPS 1 to 42, so larger sizes are built to ASME B16.34', note: 'API 600 stops at NPS 42' },
  { skus: ['IH-PV-GTC'], find: 'pressure-seal bonnet for Class 900 and up', replace: 'pressure-seal bonnet versions are listed separately', note: 'API 600 is bolted bonnet only' },
  { skus: ['IH-PV-FGV'], find: 'Class 800 to 2500, bolted, welded or pressure-seal bonnet', replace: 'Class 800 and Class 150 to 1500 (Class 2500 to ASME B16.34), bolted or welded bonnet', note: 'API 602 classes and bonnets' },
  { skus: ['IH-PV-FGV'], find: 'Bolted bonnet as standard; welded or pressure-seal bonnet for the high classes', replace: 'Bolted bonnet as standard; welded bonnet on request; pressure-seal bonnet and Class 2500 built to ASME B16.34', note: 'API 602 classes and bonnets' },
  { skus: ['IH-PV-FGV'], find: 'Class 800, ASME Class 150 to 2500, in forged carbon steel (a105)', replace: 'Class 800 and ASME Class 150 to 1500 to API 602, Class 2500 to ASME B16.34, in forged carbon steel (A105)', note: 'API 602 classes' },
  { skus: ['IH-PV-FGL'], find: 'Class 800 to 2500, T, Y and angle pattern, bolted, welded or pressure-seal bonnet', replace: 'Class 800 and Class 150 to 1500 (Class 2500 to ASME B16.34), T, Y and angle pattern, bolted or welded bonnet', note: 'API 602 classes and bonnets' },
  { skus: ['IH-PV-FGL'], find: 'Bolted bonnet; welded or pressure-seal bonnet for the high classes', replace: 'Bolted bonnet; welded bonnet on request; pressure-seal bonnet and Class 2500 built to ASME B16.34', note: 'API 602 classes and bonnets' },
  { skus: ['IH-PV-FGL'], find: 'Class 800, ASME Class 150 to 2500, in forged carbon steel, alloy', replace: 'Class 800 and ASME Class 150 to 1500 to API 602, Class 2500 to ASME B16.34, in forged carbon steel, alloy', note: 'API 602 classes' },
  { skus: ['IH-PV-FPS'], find: 'Forged pressure seal gate, globe and check valves to API 602 and ASME B16.34:', replace: 'Forged pressure seal gate, globe and check valves to ASME B16.34:', note: 'API 602 has no pressure-seal bonnet or Class 900–2500' },
  { skus: ['IH-PV-FPS'], spec: 'Design standard', find: 'API 602, ASME B16.34', replace: 'ASME B16.34', note: 'API 602 has no pressure-seal bonnet or Class 900–2500' },
  { skus: ['IH-PV-SSV'], fields: ['title', 'seoTitle'], find: 'API 603 Stainless Steel Gate, Globe and Check Valves', replace: 'Stainless Steel Gate, Globe and Check Valves, API 603 Gate', note: 'API 603 covers gate valves only' },
  { skus: ['IH-PV-SSV'], find: 'Light-wall stainless steel gate, globe and check valves to API 603 and ASME B16.34:', replace: 'Light-wall stainless steel gate valves to API 603, with globe and check valves to ASME B16.34:', note: 'API 603 covers gate valves only' },
  { skus: ['IH-PV-SSV'], find: 'Gate, globe and swing check versions share the same materials and end connections.', replace: 'Gate, globe and swing check versions share the same materials and end connections; the gate valve is built to API 603, the globe and check valves to ASME B16.34.', note: 'API 603 covers gate valves only' },
  { skus: ['IH-PV-GLC'], find: 'NPS 2" to 36", Class 150 to 2500', replace: 'NPS 2" to 36" (BS 1873 to NPS 16, larger sizes to ASME B16.34), Class 150 to 2500', note: 'BS 1873 covers 15–400 mm' },
  { skus: ['IH-PV-FLG'], find: 'in sizes well beyond the usual 2" limit of forged valves', replace: 'in sizes beyond the NPS 4 limit of API 602 compact valves', note: 'API 602 goes to NPS 4' },
  { skus: ['IH-PV-PSV'], spec: 'Design standard', find: 'ASME B16.34; API 600 / BS 1873 / BS 1868', replace: 'ASME B16.34', note: 'API 600 is bolted bonnet only' },

  // Ball valves
  { skus: ['IH-PV-FBF'], find: 'Forged side-entry floating ball valves to ISO 17292: two-piece and three-piece split body, NPS 1/2" to 6", Class 150 to 2500, soft seats,', replace: 'Forged side-entry floating ball valves, ISO 17292 to Class 800 and ASME B16.34 to Class 2500: two-piece and three-piece split body, NPS 1/2" to 6", soft seats,', note: 'ISO 17292 stops at Class 800' },

  // Butterfly valves
  { skus: ['IH-PV-BFC'], spec: 'Design standard', find: 'API 609, EN 593', replace: 'API 609 Category A (to NPS 60), EN 593', note: 'API 609 stops at NPS 60' },
  { skus: ['IH-PV-BFD'], spec: 'Design standard', find: 'API 609, ASME B16.34', replace: 'API 609 Category B to NPS 60; ASME B16.34', note: 'API 609 stops at NPS 60' },
  { skus: ['IH-PV-BFT'], spec: 'Design standard', find: 'API 609, ASME B16.34', replace: 'API 609 Category B (Class 150 to 600, to NPS 60); larger sizes and Class 900 to 2500 to ASME B16.34', note: 'API 609 Category B is Class 150–600' },
  { skus: ['IH-PV-BFT'], find: 'Triple offset metal-seated butterfly valves to API 609: NPS 2" to 160", Class 150 to 2500,', replace: 'Triple offset metal-seated butterfly valves: NPS 2" to 160", Class 150 to 2500 (API 609 to Class 600 and NPS 60),', note: 'API 609 Category B is Class 150–600' },

  // Cryogenic valves
  { skus: CRYO, find: '; standard carbon-steel sizes move fastest.', replace: '.', note: 'stainless-only shelf; carbon steel is not used cold' },
  { skus: LH2, find: 'Liquid hydrogen boils at -253 °C, colder than any other common industrial fluid,', replace: 'Liquid hydrogen boils at about -253 °C, colder than every common industrial cryogen except liquid helium,', note: 'liquid helium boils at -269 °C' },
  { skus: CRYO_BALL, spec: 'Design standard', find: 'ISO 21011', replace: 'ISO 28921-1', note: 'ISO 21011 is cryogenic vessel valves' },

  // Control valves (handbook: no valve prevents flashing; globe bodies are low-recovery; balancing cancels most force)
  { skus: ['IH-PV-CVM'], find: 'drop pressure in stages to prevent cavitation and flashing, balanced plug.', replace: 'drop pressure in stages to prevent cavitation, balanced plug.', note: 'no control valve prevents flashing' },
  { skus: ['IH-PV-CVS'], find: 'An S-pattern body gives a low pressure loss and high capacity, the top-guided plug is stable against vibration, and the single seat shuts off tightly.', replace: 'It has an S-pattern globe body, a top-guided plug and a single seat for tight shut-off.', note: 'globe bodies are low-recovery; unbalanced plugs can vibrate' },
  { skus: ['IH-PV-CVC'], find: 'balanced so line pressure does not push on it, which keeps the actuator small', replace: 'balanced so that most of the static pressure force on it cancels, which keeps the actuator small', note: 'balancing cancels most, not all, of the force' },

  // Power-plant, nuclear and oxygen-service valves
  { skus: ['IH-PV-NBB', 'IH-PV-PPB'], find: 'Shell, seat and backseat tests to ASME B16.34 / API 598', replace: 'Shell and seat tests to ASME B16.34 / API 598', note: 'quarter-turn valves have no backseat' },
  { skus: ['IH-PV-NBB', 'IH-PV-PPB'], spec: 'Pressure testing', find: 'Shell, seat and backseat tests to ASME B16.34 / API 598', replace: 'Shell and seat tests to ASME B16.34 / API 598', note: 'quarter-turn valves have no backseat' },
  { skus: ['IH-PV-OXV'], find: '; standard carbon-steel sizes move fastest.', replace: '.', note: 'oxygen listing offers no carbon steel' },

  // Waterworks valves (ductile iron; approvals not evidenced for the own-label design)
  { skus: WATERWORKS, find: '; standard carbon-steel sizes move fastest.', replace: '.', note: 'ductile-iron shelf; no carbon-steel sizes' },
  { skus: ['IH-PV-WBT'], spec: 'Design standard', find: 'EN 593, AWWA C504; UL, WRAS approved designs', replace: 'EN 593, AWWA C504', note: 'no UL or WRAS certificate on file' },

  // API 6A safety valves and actuators
  { skus: ['IH-OFE-SSV'], spec: 'Seat and trim', find: 'PSL 1 to 4; PR2F', replace: 'PSL 2 to 4; PR2F', note: 'PSL 1 does not apply to SSVs' },
  { skus: ACTUATORS, spec: 'Seat and trim', find: 'PSL 1 to 3', replace: 'Per the valve it is fitted to (PSL does not apply to actuators)', note: 'PSLs do not apply to actuators' },
  { skus: ['IH-OFE-AHS'], spec: 'Seat and trim', find: 'PSL 1 to 3; PR1 or PR2F', replace: 'PR2F for SSV duty (PSL does not apply to actuators)', note: 'PSLs do not apply to actuators; SSVs are PR2' },

  // Bijur Delimon automatic lubrication
  // GPO: Bijur lists 6/12/30 L progressive and PDI models (35641) and a 4 L SLR model (70152, datasheet 35942).
  // Amend the first pass of 2026-10-21, which dropped the 4 L SLR model. Runs before the rules below so one pass
  // brings either state to the same text.
  { skus: ['IH-BD-GPO'], find: 'with 6, 12 and 30 litre reservoirs', replace: 'with 4, 6, 12 and 30 litre reservoirs', note: 'amend: GPO 70152 is 4 L' },
  { skus: ['IH-BD-GPO'], find: 'for Progressive and PDI systems', replace: 'for Progressive, PDI and SLR systems', note: 'amend: GPO 70152 is SLR' },
  { skus: ['IH-BD-GPO'], find: 'systems Progressive, PDI;', replace: 'systems Progressive, PDI, SLR;', note: 'amend: GPO 70152 is SLR' },
  { skus: ['IH-BD-GPO'], spec: 'Lubrication system', whole: true, find: 'Progressive, PDI', replace: 'Progressive, PDI, SLR', note: 'amend: GPO 70152 is SLR' },
  { skus: ['IH-BD-GPO'], find: 'with reservoirs up to 15 litres and ATEX explosion-proof versions', replace: 'with 4, 6, 12 and 30 litre reservoirs and ATEX explosion-proof versions', note: 'GPO reservoirs 4, 6, 12, 30 L' },
  { skus: ['IH-BD-GPO'], find: 'for Progressive, SLR systems', replace: 'for Progressive, PDI and SLR systems', note: 'GPO covers progressive, PDI and SLR' },
  { skus: ['IH-BD-GPO'], find: 'systems Progressive, SLR;', replace: 'systems Progressive, PDI, SLR;', note: 'GPO covers progressive, PDI and SLR' },
  { skus: ['IH-BD-GPO'], spec: 'Lubrication system', find: 'Progressive, SLR', replace: 'Progressive, PDI, SLR', note: 'GPO covers progressive, PDI and SLR' },
  { skus: ['IH-BD-DC'], find: 'actuates the FR10 reversing valve', replace: 'actuates the FR20 reversing valve', note: 'DC41 uses the FR20' },
  { skus: ['IH-BD-CS2K'], find: 'for centralised progressive systems', replace: 'for centralised Dualine and single-line systems', note: 'CS2000 is a Dualine central station' },
  { skus: ['IH-BD-BL3'], find: 'Bijur Delimon BL-3 and XV-3 PDI Oil Lubricators', replace: 'Bijur Delimon BL-3 and XV-3 PDI Lubricators', note: 'BL pumps NLGI 000–00 fluid grease' },
  { skus: ['IH-BD-BL3'], find: 'for positive-displacement injector (PDI) oil systems', replace: 'for injector (PDI) systems on NLGI 000–00 fluid grease', note: 'BL pumps NLGI 000–00 fluid grease' },
  { skus: ['IH-BD-BL3'], find: 'small PDI systems on machine tools', replace: 'small PDI systems on vehicles and mobile plant', note: 'BL is for mobile equipment' },
  { skus: ['IH-BD-ADM'], find: 'on 50 Hz three-phase motors', replace: 'on three-phase AC motors', note: 'order codes include 50/60 Hz motors' },

  // Bijur Delimon drum pumps and manual lubricators
  { skus: ['IH-BD-MSLR'], find: 'HAP-P and HIP-P are lever-operated one-pint units in metal and plastic reservoirs.', replace: 'HAP-P (push lever) and HIP-P (pull tee-handle) are one-pint units in plastic reservoirs, each adjustable from 5 to 15 cc.', note: 'HAP-P/HIP-P datasheets' },
  { skus: ['IH-BD-MPDI'], find: 'The L13 fires fixed-output Z, ZT and SJM injectors', replace: 'The L13 fires fixed-output ZJB, ZMB, ZT and SJM injectors', note: 'L13 injector series' },
  { skus: ['IH-BD-MPDI'], find: 'with left, right or dual outlets and 5/16-24 or M10x1 threads.', replace: 'with left, right or dual outlets and M10x1, M8x1 or 5/16-24 UNF threads.', note: 'L13 outlet threads' },
  { skus: ['IH-BD-DA'], find: 'output 7.4 cc/min', replace: 'discharge 7.4 cc per stroke', note: 'DA is a hand-lever pump' },
  { skus: ['IH-BD-DA'], spec: 'Output', find: '7.4 cc/min', replace: '7.4 cc per stroke', note: 'DA is a hand-lever pump' },
  { skus: ['IH-BD-PM60'], find: '6:1 and 12:1 for oil (stub, drum and bulk tote) and 80:1 for grease on 120 lb and 400 lb drums; 12:1 and 80:1 pumps with pneumatic inductor are also listed.', replace: '6:1 and 12:1 for oil (wall-bracket stub pumps), 80:1 for grease on 120 lb and 400 lb drums, and a 12:1 bulk-tote grease transfer pump (33 lb/min) with a 3-inch camlock.', note: 'PM60 oil and grease datasheets' },
  { skus: ['IH-BD-TBDH'], find: 'The hand-operated TB-D piston pump for progressive, single-line and multi-line systems — the manual counterpart of the pneumatic TB-D.', replace: 'The hand-lever TB-D is a multi-line grease pump: each stroke delivers 0.5 cm³ to each outlet, at up to 25 bar.', note: 'TB-D hand-lever is a multi-line pump' },
  { skus: ['IH-BD-TBDH'], spec: 'Lubrication system', whole: true, find: 'Progressive', replace: 'Multi-line', note: 'TB-D hand-lever is a multi-line pump' },
]

/**
 * Whether a value already carries the rule's replacement. When the replacement contains the find text (an appended
 * qualifier), the replacement being present means done; otherwise done means the find text is gone and the
 * replacement is there. Keeps re-runs from appending twice or skipping a live match.
 */
function applied(v: string, r: Rule): boolean {
  if (r.replace.includes(r.find)) return v.includes(r.replace)
  return !v.includes(r.find) && v.includes(r.replace)
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const skus = [...new Set(RULES.flatMap((r) => r.skus))]
  const products = await db.product.findMany({
    where: { status: 'active', sku: { in: skus } },
    select: {
      id: true, sku: true, title: true, descriptionShort: true, descriptionLong: true, seoTitle: true, seoDescription: true,
      specs: { select: { id: true, label: true, value: true } },
    },
  })
  const missing = skus.filter((s) => !products.some((p) => p.sku === s))
  if (missing.length) throw new Error(`not active: ${missing.join(', ')}`)

  const hits = RULES.map(() => 0)
  // A rule whose replacement is already in place (see `applied`) was applied by an earlier run; re-runs are safe.
  const done = RULES.map(() => false)
  const writes: { sku: string; id: string; data: Partial<Record<Field, string>>; specs: { id: string; value: string }[] }[] = []

  for (const p of products) {
    const data: Partial<Record<Field, string>> = {}
    const specValues = new Map(p.specs.map((s) => [s.id, s.value]))
    RULES.forEach((r, i) => {
      if (!r.skus.includes(p.sku)) return
      if (r.spec) {
        for (const s of p.specs) {
          if (s.label !== r.spec) continue
          const v = specValues.get(s.id)!
          if (applied(v, r)) {
            done[i] = true
            continue
          }
          if (!v.includes(r.find)) continue
          if (r.whole && v !== r.find) continue
          specValues.set(s.id, v.split(r.find).join(r.replace))
          hits[i] = hits[i]! + 1
        }
        return
      }
      for (const f of r.fields ?? FIELDS) {
        const v = data[f] ?? p[f]
        if (v && applied(v, r)) {
          done[i] = true
          continue
        }
        if (!v || !v.includes(r.find)) continue
        hits[i] = hits[i]! + v.split(r.find).length - 1
        data[f] = v.split(r.find).join(r.replace)
      }
    })
    const specs = p.specs.filter((s) => specValues.get(s.id) !== s.value).map((s) => ({ id: s.id, value: specValues.get(s.id)! }))
    if (Object.keys(data).length || specs.length) writes.push({ sku: p.sku, id: p.id, data, specs })
  }

  const dead = RULES.filter((_, i) => hits[i] === 0 && !done[i])
  RULES.forEach((r, i) => console.log(`  ${hits[i] ? '✓' : done[i] ? '=' : '✗'} ${String(hits[i]).padStart(2)}  ${r.spec ? `[spec ${r.spec}] ` : ''}${r.note}  (${r.skus.join(' ')})`))
  console.log(`\n${writes.length} listings to update, ${dead.length} rule(s) with no match`)
  if (dead.length) {
    process.exitCode = 1
    if (!dryRun) {
      console.error('Refusing to write: fix the unmatched rules first.')
      return
    }
  }
  if (dryRun) return

  for (const w of writes) {
    await db.$transaction(
      async (tx) => {
        if (Object.keys(w.data).length) await tx.product.update({ where: { id: w.id }, data: w.data })
        for (const s of w.specs) await tx.productSpec.update({ where: { id: s.id }, data: { value: s.value } })
      },
      { timeout: 30_000, maxWait: 10_000 },
    )
    console.log(`  updated ${w.sku}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
