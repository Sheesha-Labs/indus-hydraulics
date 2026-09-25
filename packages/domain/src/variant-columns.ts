/**
 * Turning a product's `ProductVariant[]` into a table a buyer can read.
 *
 * `ProductVariant.dimensions` is jsonb, so the rendering side has to answer
 * two questions the database will not: which columns exist for THIS product,
 * and what does the letter `E` mean. Both answers live here, as pure
 * functions, so the storefront, the admin and any exporter agree.
 *
 * ON NOT INVENTING MEANINGS
 *
 * Manufacturer dimension tables print bare letters — A, B, E, F, H — against a
 * drawing, and the drawing is the legend. We have the letters and not the
 * drawing. So the help text says which letter it is and points at the drawing;
 * it does not guess that `B` is "hex face to hose end". The two exceptions are
 * the columns whose source header states its own meaning: `W`, printed as
 * "W- HEX" / "W -NUT", and the tube O.D. column, printed as "Tube O.D.".
 *
 * Guessing here would be the same class of error the Molykote and industrial
 * coupling imports had to undo — a plausible spec value that nobody sourced,
 * copied down a whole category.
 */

export type VariantDimensionKey =
  | 'OD'
  | 'hoseOD'
  | 'burstPressure'
  | 'vacuum'
  | 'bendRadius'
  | 'weightPerMetre'
  | 'weldPrepOd'
  | 'weldPrepId'
  | 'W'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'E'
  | 'F'
  | 'H'
  | 'L'
  | 'L1'
  | 'L2'
  | 'L3'
  | 'L4'
  | 'L5'
  | 'L6'
  | LiftingDimensionKey

/**
 * Keys inside `dimensions` whose value is a string rather than a millimetre
 * figure — an O-ring size is `12.0×2.0`, not a number. They render in their own
 * columns after the numeric ones.
 */
export type VariantTextKey = 'oRing' | LiftingTextKey

/**
 * Lifting & rigging columns.
 *
 * A rigging catalogue is not a fitting catalogue: the column a buyer selects on
 * is the working load limit, and the loads come in whatever unit the maker
 * rates the part in — tonnes on a G-2130 shackle, pounds on a US eye bolt,
 * kilonewtons on a sling. A rating is never converted: converting 650 lbs to
 * 0.29 t and rounding is exactly how an overstated WLL reaches a customer. So
 * the unit is part of the key (`wllT`, `wllLbs`, `wllKn`) and a table shows the
 * columns its rows carry. Dimensions are the exception — they are converted to
 * millimetres like every other table on the site, because nothing is selected
 * on them.
 *
 * Every named load and geometry column here is headed that way in the source
 * table ("W.L.L.", "Proof test", "Breaking force", "Inside length", "Pin dia.")
 * so its help text repeats the source. Letters stay letters, for the same
 * reason as the fitting columns above.
 */
export type LiftingDimensionKey =
  // loads
  | 'wllT'
  | 'wllKg'
  | 'wllLbs'
  | 'wllKn'
  | 'wllSf4Lbs'
  | 'wllSf5Lbs'
  | 'wllSf5T'
  | 'wllSf6T'
  | 'wllSf4T'
  | 'wllHookLbs'
  | 'wllEyeJawLbs'
  | 'wllKgDoubleFall'
  | 'wllKnSingle'
  | 'wllKnDouble45'
  | 'wllKnDouble90'
  | 'wllKnFour45'
  | 'wllKnFour90'
  | 'proofT'
  | 'proofKg'
  | 'proofLbs'
  | 'proofKn'
  | 'mblT'
  | 'mblKg'
  | 'mblLbs'
  | 'mblKn'
  | 'mblFcKn'
  | 'mblIwrcKn'
  | 'mbl1370Kn'
  | 'mbl1470Kn'
  | 'mbl1570Kn'
  | 'mbl1770FcKn'
  | 'mbl1770IwrcKn'
  | 'mbl1960FcKn'
  | 'mbl1960IwrcKn'
  | 'lcKg'
  | 'lcKn'
  | 'lcDaN'
  // hoist performance
  | 'liftHeight'
  | 'liftHeightDoubleFall'
  | 'liftSpeed'
  | 'liftSpeedDoubleFall'
  | 'handEffort'
  | 'loadChainDia'
  | 'chainFalls'
  | 'motorKw'
  | 'minHookDistance'
  | 'minCurveRadius'
  | 'extraWeightPerMetre'
  | 'energyKnm'
  | 'reactionKn'
  | 'torqueNm'
  | 'lengthM'
  // named geometry
  | 'materialDia'
  | 'wireDia'
  | 'pinDia'
  | 'insideLength'
  | 'insideWidth'
  | 'insideWidthSmall'
  | 'insideWidthLarge'
  | 'outsideWidth'
  | 'insideDia'
  | 'overallLength'
  | 'bodyLength'
  | 'threadLength'
  | 'eyeId'
  | 'holeDia'
  | 'afterSwage'
  | 'handleLength'
  | 'takeUp'
  | 'pitch'
  | 'usableLength'
  | 'shankLength'
  | 'headDia'
  | 'headHeight'
  | 'wireClearance'
  | 'ringId'
  // letters a rigging drawing uses that a fitting drawing does not
  | 'AMax'
  | 'BMin'
  | 'BMax'
  | 'B1'
  | 'B2'
  | 'C1'
  | 'E1'
  | 'FMin'
  | 'FMax'
  | 'F1'
  | 'G'
  | 'H1'
  | 'I'
  | 'J'
  | 'K'
  | 'LT'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'R'
  | 'S'
  | 'T'
  | 'V'
  | 'X'
  | 'a'
  | 'b'
  | 'd'
  | 'h'
  | 'h1'
  | 'k'
  | 'r'
  // weights, as published
  | 'weightKg'
  | 'weightLbs'
  | 'weightPer100Kg'
  | 'weightPer100Lbs'
  | 'weightPer1000Kg'
  | 'weightPer100m'
  | 'weightFcPer100m'
  | 'weightNfcPer100m'
  | 'weightIwrcPer100m'
  | 'weightPer100FtLbs'
  | 'weightPer220mKg'

export type LiftingTextKey =
  | 'size'
  | 'grade'
  | 'type'
  | 'linkType'
  | 'pitchTolerance'
  | 'construction'
  | 'tensileGrade'
  | 'chainSize'
  | 'ropeSize'
  | 'beamFlange'
  | 'jawOpening'
  | 'powerSupply'
  | 'dutyClass'
  | 'maxTap'
  | 'colour'
  | 'length'
  | 'ratchet'
  | 'section'
  | 'loopSize'
  | 'pillar'
  | 'steelCore'

/**
 * Units a column can carry. The empty string is a count (falls of chain) and
 * renders with no unit suffix.
 */
export type VariantUnit =
  | 'mm'
  | 'bar'
  | 'kg/m'
  | 't'
  | 'kg'
  | 'lbs'
  | 'kN'
  | 'N'
  | 'm'
  | 'm/min'
  | 'kW'
  | 'kg/100 m'
  | 'kg/100 pcs'
  | 'lbs/100 pcs'
  | 'kg/1000 pcs'
  | 'kNm'
  | 'Nm'
  | 'daN'
  | 'lbs/100 ft'
  | 'kg/220 m'
  | ''

/**
 * A column's key inside `ProductVariant.dimensions`. Beyond the named keys, a
 * lifting table can carry two kinds the registry does not list one by one:
 * a qualified load (`mblKn@g1770_fc` — a breaking load split by wire grade and
 * core, see `QUALIFIER_LABELS`) and a drawing letter the registry has not met
 * yet (`A1`, `d2`, `Ø1`, `L′` stored as `Lp`), see `DRAWING_LETTER`.
 */
export type VariantColumnKey = VariantDimensionKey | (string & {})

export type VariantColumn = {
  /** Key inside `ProductVariant.dimensions`. */
  key: VariantColumnKey
  /** Column heading. */
  label: string
  /**
   * A fitting's table is millimetres throughout. A hose's is not — it prints a
   * burst pressure in bar, a vacuum rating in bar and a weight per metre — so
   * the unit travels with the column rather than being assumed by the renderer.
   */
  unit: VariantUnit
  /** Tooltip / caption text. Never a guess — see the module note. */
  help: string
}

/**
 * Every dimension column we know how to render, in the order a table should
 * present them. A product shows the subset its own rows populate.
 *
 * The numbered runs — S1..S4, D..D4, L..L6 — come from the adapter catalogue,
 * which needs more of them than a hose fitting does: an adapter has two or
 * three ends, so it prints a length and an across-flats for each. They carry
 * no more meaning than the bare letters do, for the same reason.
 */
export const VARIANT_DIMENSION_COLUMNS: readonly VariantColumn[] = [
  {
    key: 'OD',
    label: 'Tube O.D.',
    unit: 'mm',
    help: 'Outside diameter of the tube the port is cut for.',
  },
  /*
    Hose columns. Unlike the lettered fitting dimensions these are not read off
    a drawing — the hose catalogue heads each column with what it is, so the
    help text is the source's own meaning rather than a pointer to a legend.
  */
  {
    key: 'hoseOD',
    label: 'O.D.',
    unit: 'mm',
    help: 'Outside diameter of the hose, which is what a clamp or a ferrule has to close on.',
  },
  {
    key: 'burstPressure',
    label: 'Min burst',
    unit: 'bar',
    help: 'Minimum burst pressure. A test figure, never a working limit — never select on it.',
  },
  {
    key: 'vacuum',
    label: 'Vacuum',
    unit: 'bar',
    help: 'Vacuum the hose is rated to hold on suction duty, as published.',
  },
  {
    key: 'bendRadius',
    label: 'Min bend radius',
    unit: 'mm',
    help: 'Tightest centreline radius the hose may be bent to at full working pressure.',
  },
  {
    key: 'weightPerMetre',
    label: 'Weight',
    unit: 'kg/m',
    help: 'Weight of the hose per metre, as published.',
  },
  {
    key: 'weldPrepOd',
    label: 'Weld prep O.D.',
    unit: 'mm',
    help: 'Outside diameter of the weld preparation, as the source table heads it.',
  },
  {
    key: 'weldPrepId',
    label: 'Weld prep I.D.',
    unit: 'mm',
    help: 'Inside diameter of the weld preparation, as the source table heads it.',
  },
  {
    key: 'W',
    label: 'W',
    unit: 'mm',
    help: 'Nut / hex across flats — the spanner size.',
  },
  { key: 'S1', label: 'S1', unit: 'mm', help: 'Dimension S1 on the manufacturer dimension drawing.' },
  { key: 'S2', label: 'S2', unit: 'mm', help: 'Dimension S2 on the manufacturer dimension drawing.' },
  { key: 'S3', label: 'S3', unit: 'mm', help: 'Dimension S3 on the manufacturer dimension drawing.' },
  { key: 'S4', label: 'S4', unit: 'mm', help: 'Dimension S4 on the manufacturer dimension drawing.' },
  { key: 'A', label: 'A', unit: 'mm', help: 'Dimension A on the manufacturer dimension drawing.' },
  { key: 'B', label: 'B', unit: 'mm', help: 'Dimension B on the manufacturer dimension drawing.' },
  { key: 'C', label: 'C', unit: 'mm', help: 'Dimension C on the manufacturer dimension drawing.' },
  { key: 'D', label: 'D', unit: 'mm', help: 'Dimension D on the manufacturer dimension drawing.' },
  { key: 'D1', label: 'D1', unit: 'mm', help: 'Dimension D1 on the manufacturer dimension drawing.' },
  { key: 'D2', label: 'D2', unit: 'mm', help: 'Dimension D2 on the manufacturer dimension drawing.' },
  { key: 'D3', label: 'D3', unit: 'mm', help: 'Dimension D3 on the manufacturer dimension drawing.' },
  { key: 'D4', label: 'D4', unit: 'mm', help: 'Dimension D4 on the manufacturer dimension drawing.' },
  { key: 'E', label: 'E', unit: 'mm', help: 'Dimension E on the manufacturer dimension drawing.' },
  { key: 'F', label: 'F', unit: 'mm', help: 'Dimension F on the manufacturer dimension drawing.' },
  { key: 'H', label: 'H', unit: 'mm', help: 'Dimension H on the manufacturer dimension drawing.' },
  { key: 'L', label: 'L', unit: 'mm', help: 'Dimension L on the manufacturer dimension drawing.' },
  { key: 'L1', label: 'L1', unit: 'mm', help: 'Dimension L1 on the manufacturer dimension drawing.' },
  { key: 'L2', label: 'L2', unit: 'mm', help: 'Dimension L2 on the manufacturer dimension drawing.' },
  { key: 'L3', label: 'L3', unit: 'mm', help: 'Dimension L3 on the manufacturer dimension drawing.' },
  { key: 'L4', label: 'L4', unit: 'mm', help: 'Dimension L4 on the manufacturer dimension drawing.' },
  { key: 'L5', label: 'L5', unit: 'mm', help: 'Dimension L5 on the manufacturer dimension drawing.' },
  { key: 'L6', label: 'L6', unit: 'mm', help: 'Dimension L6 on the manufacturer dimension drawing.' },
]

export type VariantTextColumn = {
  key: VariantTextKey
  label: string
  help: string
  /**
   * Leading columns render straight after the part number — a rigging table is
   * read by size first. Trailing ones render after the numeric columns, which
   * is where an O-ring size belongs on a fitting.
   */
  lead?: boolean
}

/**
 * Non-numeric columns. `S1`/`S2` deliberately are NOT here: the master
 * catalogue prints them as bare letters against a drawing, exactly like A/B/C,
 * and calling either one "across flats" would be the guess this module exists
 * to avoid — even though that is what they almost certainly are.
 */
export const VARIANT_TEXT_COLUMNS: readonly VariantTextColumn[] = [
  {
    key: 'oRing',
    label: 'O-ring',
    help: 'O-ring size supplied with the fitting, as inside diameter × section.',
  },
]

const letter = (key: VariantColumnKey, label: string): VariantColumn => ({
  key,
  label,
  unit: 'mm',
  help: `Dimension ${label} on the manufacturer dimension drawing.`,
})
const WLL_HELP =
  'Working load limit — the most the part may carry in service, as the manufacturer rates it.'
const PROOF_HELP =
  'Proof or test load the manufacturer applies to the part. A test figure — never a working limit.'
const MBL_HELP = 'Minimum breaking load. A test figure — never lift to it.'
const LC_HELP =
  'Lashing capacity — the most a tie-down may hold in service when securing a load (EN 12195). A load-securing figure, not a lifting rating.'
const WEIGHT_HELP = 'Weight as the manufacturer publishes it.'

/**
 * Lifting load columns, in the order a rigging table should show them: working
 * load first, then the test figures. Tables show only the ones their rows carry.
 */
export const LIFTING_LOAD_COLUMNS: readonly VariantColumn[] = [
  { key: 'wllT', label: 'WLL', unit: 't', help: WLL_HELP },
  { key: 'wllKg', label: 'WLL', unit: 'kg', help: WLL_HELP },
  { key: 'wllLbs', label: 'WLL', unit: 'lbs', help: WLL_HELP },
  { key: 'wllKn', label: 'WLL', unit: 'kN', help: WLL_HELP },
  { key: 'wllSf4Lbs', label: 'WLL 4:1', unit: 'lbs', help: 'Working load limit at a 4:1 design factor, as published.' },
  { key: 'wllSf5Lbs', label: 'WLL 5:1', unit: 'lbs', help: 'Working load limit at a 5:1 design factor, as published.' },
  { key: 'wllSf5T', label: 'WLL 5:1', unit: 't', help: 'Working load limit at a 5:1 design factor, as published.' },
  { key: 'wllSf6T', label: 'WLL 6:1', unit: 't', help: 'Working load limit at a 6:1 design factor, as published.' },
  { key: 'wllSf4T', label: 'WLL 4:1', unit: 't', help: 'Working load limit at a 4:1 design factor, as published.' },
  { key: 'wllHookLbs', label: 'WLL, hook ends', unit: 'lbs', help: 'Working load limit with hook end fittings, which rate lower than eyes or jaws.' },
  { key: 'wllEyeJawLbs', label: 'WLL, eye / jaw ends', unit: 'lbs', help: 'Working load limit with eye, jaw or stub end fittings.' },
  { key: 'wllKgDoubleFall', label: 'WLL, 2 falls', unit: 'kg', help: 'Rated load with the hook reeved in two falls through the pulley block.' },
  { key: 'wllKnSingle', label: 'WLL single leg', unit: 'kN', help: 'Working load of one leg hanging vertically.' },
  { key: 'wllKnDouble45', label: 'WLL 2-leg ≤45°', unit: 'kN', help: 'Working load of a two-leg sling with each leg up to 45° from vertical.' },
  { key: 'wllKnDouble90', label: 'WLL 2-leg 45–90°', unit: 'kN', help: 'Working load of a two-leg sling with each leg 45° to 90° from vertical.' },
  { key: 'wllKnFour45', label: 'WLL 4-leg ≤45°', unit: 'kN', help: 'Working load of a four-leg sling with each leg up to 45° from vertical.' },
  { key: 'wllKnFour90', label: 'WLL 4-leg 45–90°', unit: 'kN', help: 'Working load of a four-leg sling with each leg 45° to 90° from vertical.' },
  { key: 'proofT', label: 'Proof load', unit: 't', help: PROOF_HELP },
  { key: 'proofKg', label: 'Proof load', unit: 'kg', help: PROOF_HELP },
  { key: 'proofLbs', label: 'Proof load', unit: 'lbs', help: PROOF_HELP },
  { key: 'proofKn', label: 'Proof load', unit: 'kN', help: PROOF_HELP },
  { key: 'mblT', label: 'Min breaking load', unit: 't', help: MBL_HELP },
  { key: 'mblKg', label: 'Min breaking load', unit: 'kg', help: MBL_HELP },
  { key: 'mblLbs', label: 'Min breaking load', unit: 'lbs', help: MBL_HELP },
  { key: 'mblKn', label: 'Min breaking load', unit: 'kN', help: MBL_HELP },
  { key: 'mblFcKn', label: 'MBL, fibre core', unit: 'kN', help: 'Minimum breaking load of the rope with a fibre core.' },
  { key: 'mblIwrcKn', label: 'MBL, steel core', unit: 'kN', help: 'Minimum breaking load of the rope with a steel (IWRC) core.' },
  { key: 'mbl1370Kn', label: 'MBL 1370', unit: 'kN', help: 'Minimum breaking load at 1370 N/mm² wire grade.' },
  { key: 'mbl1470Kn', label: 'MBL 1470', unit: 'kN', help: 'Minimum breaking load at 1470 N/mm² wire grade.' },
  { key: 'mbl1570Kn', label: 'MBL 1570', unit: 'kN', help: 'Minimum breaking load at 1570 N/mm² wire grade.' },
  { key: 'mbl1770FcKn', label: 'MBL 1770 FC', unit: 'kN', help: 'Minimum breaking load, 1770 N/mm² rope grade, fibre core.' },
  { key: 'mbl1770IwrcKn', label: 'MBL 1770 IWRC', unit: 'kN', help: 'Minimum breaking load, 1770 N/mm² rope grade, steel core.' },
  { key: 'mbl1960FcKn', label: 'MBL 1960 FC', unit: 'kN', help: 'Minimum breaking load, 1960 N/mm² rope grade, fibre core.' },
  { key: 'mbl1960IwrcKn', label: 'MBL 1960 IWRC', unit: 'kN', help: 'Minimum breaking load, 1960 N/mm² rope grade, steel core.' },
  { key: 'lcKg', label: 'LC', unit: 'kg', help: LC_HELP },
  { key: 'lcKn', label: 'LC', unit: 'kN', help: LC_HELP },
  { key: 'lcDaN', label: 'LC', unit: 'daN', help: LC_HELP },
]

/** Hoist and trolley performance, headed in the source by what each one is. */
export const LIFTING_PERFORMANCE_COLUMNS: readonly VariantColumn[] = [
  { key: 'liftHeight', label: 'Standard lift', unit: 'm', help: 'Lift supplied as standard; longer lifts to order.' },
  { key: 'liftHeightDoubleFall', label: 'Standard lift, 2 falls', unit: 'm', help: 'Lift supplied as standard when reeved in two falls.' },
  { key: 'liftSpeed', label: 'Lift speed', unit: 'm/min', help: 'Lifting speed at rated load, as published.' },
  { key: 'liftSpeedDoubleFall', label: 'Lift speed, 2 falls', unit: 'm/min', help: 'Lifting speed when reeved in two falls.' },
  { key: 'handEffort', label: 'Hand pull', unit: 'N', help: 'Pull on the hand chain needed to lift the rated load.' },
  { key: 'loadChainDia', label: 'Load chain', unit: 'mm', help: 'Diameter of the load chain.' },
  { key: 'chainFalls', label: 'Falls', unit: '', help: 'Number of falls of load chain.' },
  { key: 'motorKw', label: 'Motor', unit: 'kW', help: 'Hoist motor power.' },
  { key: 'minHookDistance', label: 'Min. hook distance', unit: 'mm', help: 'Headroom — the closest the two hooks come.' },
  { key: 'minCurveRadius', label: 'Min. curve radius', unit: 'm', help: 'Tightest beam curve the trolley runs round.' },
  { key: 'extraWeightPerMetre', label: 'Extra lift weight', unit: 'kg/m', help: 'Weight added by each extra metre of lift.' },
  { key: 'lengthM', label: 'Length', unit: 'm', help: 'Effective working length, as published.' },
  { key: 'energyKnm', label: 'Energy absorption', unit: 'kNm', help: 'Energy the fender absorbs at its rated deflection, as published.' },
  { key: 'reactionKn', label: 'Reaction force', unit: 'kN', help: 'Force the fender returns at its rated deflection, as published.' },
  { key: 'torqueNm', label: 'Tightening torque', unit: 'Nm', help: 'Torque to tighten the bolt to, as the manufacturer states it.' },
]

/** Geometry the source heads by name rather than by letter. */
export const LIFTING_GEOMETRY_COLUMNS: readonly VariantColumn[] = [
  { key: 'materialDia', label: 'Material dia.', unit: 'mm', help: 'Diameter of the link or bar stock.' },
  { key: 'wireDia', label: 'Wire dia.', unit: 'mm', help: 'Diameter of the individual wire.' },
  { key: 'pinDia', label: 'Pin dia.', unit: 'mm', help: 'Diameter of the pin or bolt.' },
  { key: 'insideLength', label: 'Inside length', unit: 'mm', help: 'Inside length of the link or bow.' },
  { key: 'insideWidth', label: 'Inside width', unit: 'mm', help: 'Inside width of the link or jaw.' },
  { key: 'insideWidthSmall', label: 'Inside width, small end', unit: 'mm', help: 'Inside width at the small end of the link.' },
  { key: 'insideWidthLarge', label: 'Inside width, large end', unit: 'mm', help: 'Inside width at the large end of the link.' },
  { key: 'outsideWidth', label: 'Outside width', unit: 'mm', help: 'Outside width of the link.' },
  { key: 'insideDia', label: 'Inside dia.', unit: 'mm', help: 'Inside diameter of the ring.' },
  { key: 'overallLength', label: 'Overall length', unit: 'mm', help: 'Overall length.' },
  { key: 'bodyLength', label: 'Body length', unit: 'mm', help: 'Length of the body between the threaded ends.' },
  { key: 'threadLength', label: 'Thread length', unit: 'mm', help: 'Length of the threaded shank.' },
  { key: 'eyeId', label: 'Eye I.D.', unit: 'mm', help: 'Inside diameter of the eye.' },
  { key: 'holeDia', label: 'Hole dia.', unit: 'mm', help: 'Diameter of the fixing hole.' },
  { key: 'afterSwage', label: 'Max. after swage', unit: 'mm', help: 'Largest dimension across the sleeve once swaged.' },
  { key: 'handleLength', label: 'Handle length', unit: 'mm', help: 'Length of the operating handle.' },
  { key: 'takeUp', label: 'Take-up', unit: 'mm', help: 'Adjustment the binder takes up.' },
  { key: 'pitch', label: 'Pitch', unit: 'mm', help: 'Thread pitch or link pitch, as the source heads it.' },
  { key: 'usableLength', label: 'Usable length', unit: 'mm', help: 'Length of pin available to pass through the parts.' },
  { key: 'shankLength', label: 'Shank length', unit: 'mm', help: 'Length of the pin shank.' },
  { key: 'headDia', label: 'Head dia.', unit: 'mm', help: 'Diameter of the pin head.' },
  { key: 'headHeight', label: 'Head height', unit: 'mm', help: 'Height of the pin head.' },
  { key: 'wireClearance', label: 'Wire clearance', unit: 'mm', help: 'Clearance inside the locking wire or loop.' },
  { key: 'ringId', label: 'Ring I.D.', unit: 'mm', help: 'Inside diameter of the ring.' },
]

/**
 * Letters, in the order a rigging table prints them. The shared letters reuse
 * the fitting columns' definitions so a letter means the same thing everywhere.
 */
export const LIFTING_LETTER_COLUMNS: readonly VariantColumn[] = [
  letter('A', 'A'),
  letter('AMax', 'A max'),
  letter('B', 'B'),
  letter('BMin', 'B min'),
  letter('BMax', 'B max'),
  letter('B1', 'B1'),
  letter('B2', 'B2'),
  letter('C', 'C'),
  letter('C1', 'C1'),
  letter('D', 'D'),
  letter('D1', 'D1'),
  letter('E', 'E'),
  letter('E1', 'E1'),
  letter('F', 'F'),
  letter('FMin', 'F min'),
  letter('FMax', 'F max'),
  letter('F1', 'F1'),
  letter('G', 'G'),
  letter('H', 'H'),
  letter('H1', 'H1'),
  letter('h', 'h'),
  letter('h1', 'h1'),
  letter('I', 'I'),
  letter('J', 'J'),
  letter('K', 'K'),
  letter('k', 'k'),
  letter('L', 'L'),
  letter('L1', 'L1'),
  letter('L2', 'L2'),
  letter('LT', 'LT'),
  letter('M', 'M'),
  letter('N', 'N'),
  letter('O', 'O'),
  letter('P', 'P'),
  letter('R', 'R'),
  letter('r', 'r'),
  letter('S', 'S'),
  letter('T', 'T'),
  letter('V', 'V'),
  letter('W', 'W'),
  letter('X', 'X'),
  letter('a', 'a'),
  letter('b', 'b'),
  letter('d', 'd'),
]

export const LIFTING_WEIGHT_COLUMNS: readonly VariantColumn[] = [
  { key: 'weightKg', label: 'Weight', unit: 'kg', help: WEIGHT_HELP },
  { key: 'weightLbs', label: 'Weight', unit: 'lbs', help: WEIGHT_HELP },
  { key: 'weightPer100Kg', label: 'Weight', unit: 'kg/100 pcs', help: 'Weight of 100 pieces, as published.' },
  { key: 'weightPer100Lbs', label: 'Weight', unit: 'lbs/100 pcs', help: 'Weight of 100 pieces, as published.' },
  { key: 'weightPer1000Kg', label: 'Weight', unit: 'kg/1000 pcs', help: 'Weight of 1,000 pieces, as published.' },
  { key: 'weightPerMetre', label: 'Weight', unit: 'kg/m', help: 'Weight per metre, as published.' },
  { key: 'weightPer100m', label: 'Weight', unit: 'kg/100 m', help: 'Weight per 100 metres, as published.' },
  { key: 'weightFcPer100m', label: 'Weight, fibre core', unit: 'kg/100 m', help: 'Weight per 100 m with a fibre core.' },
  { key: 'weightNfcPer100m', label: 'Weight, natural fibre core', unit: 'kg/100 m', help: 'Weight per 100 m with a natural fibre core.' },
  { key: 'weightIwrcPer100m', label: 'Weight, steel core', unit: 'kg/100 m', help: 'Weight per 100 m with a steel (IWRC) core.' },
  { key: 'weightPer100FtLbs', label: 'Weight', unit: 'lbs/100 ft', help: 'Weight per 100 feet, as published.' },
  { key: 'weightPer220mKg', label: 'Weight', unit: 'kg/220 m', help: 'Weight of a 220 m coil, as published.' },
]

/** Every lifting numeric column, in table order. */
export const LIFTING_DIMENSION_COLUMNS: readonly VariantColumn[] = [
  ...LIFTING_LOAD_COLUMNS,
  ...LIFTING_PERFORMANCE_COLUMNS,
  ...LIFTING_GEOMETRY_COLUMNS,
  ...LIFTING_LETTER_COLUMNS,
  ...LIFTING_WEIGHT_COLUMNS,
]

export const LIFTING_TEXT_COLUMNS: readonly VariantTextColumn[] = [
  { key: 'size', label: 'Size', help: 'Nominal size as the manufacturer states it.', lead: true },
  { key: 'grade', label: 'Grade', help: 'Material grade of this row — carbon and alloy versions share a frame but not a rating.', lead: true },
  { key: 'type', label: 'Type', help: 'Manufacturer type within the size.', lead: true },
  { key: 'linkType', label: 'Link', help: 'DIN 5685 form: A is short link, C is long link.', lead: true },
  { key: 'pitchTolerance', label: 'Pitch tolerance', help: 'Tolerance on the inside link length (pitch).', lead: true },
  { key: 'construction', label: 'Construction', help: 'Strand construction.', lead: true },
  { key: 'tensileGrade', label: 'Wire grade', help: 'Nominal tensile strength of the wire.', lead: true },
  { key: 'chainSize', label: 'Chain size', help: 'Chain the fitting is made for.', lead: true },
  { key: 'ropeSize', label: 'Rope size', help: 'Rope diameter the sheave is made for.', lead: true },
  { key: 'beamFlange', label: 'Beam flange', help: 'Beam flange width the trolley or clamp fits.' },
  { key: 'jawOpening', label: 'Jaw opening', help: 'Plate thickness range the clamp grips.' },
  { key: 'powerSupply', label: 'Supply', help: 'Electrical supply.' },
  { key: 'dutyClass', label: 'Duty class', help: 'Mechanism duty classification as published.' },
  { key: 'maxTap', label: 'Max. tap', help: 'Largest tap size the eye nut can be re-tapped to.' },
  { key: 'colour', label: 'Colour', help: 'Sling colour. Under EN 1492 the colour marks the rated capacity; check the label on the sling.', lead: true },
  { key: 'length', label: 'Length', help: 'Length as published.' },
  { key: 'ratchet', label: 'Ratchet / fitting', help: 'Ratchet handle and end fitting, as published.' },
  { key: 'section', label: 'Section', help: 'Cross-section of the link, as published.' },
  { key: 'loopSize', label: 'Eye size', help: 'Size of the sling eye, as published.' },
  { key: 'pillar', label: 'Pillar', help: 'Pillar tube outside diameter × wall thickness, as published.' },
  { key: 'steelCore', label: 'Steel core', help: 'Diameter of the steel core, as published.' },
]

const LIFTING_MARKERS: ReadonlySet<string> = new Set<string>([
  ...LIFTING_LOAD_COLUMNS.map((c) => c.key),
  ...LIFTING_PERFORMANCE_COLUMNS.map((c) => c.key),
  'size',
])

/**
 * What a qualifier after `@` means. Some sources split one load column several
 * ways — a rope's breaking load by wire grade and core, a sling's WLL by hitch,
 * anchor chain by grade U1–U3, fibre rope by ISO 2307 and MEG4 — so the key
 * carries the split and the heading reads "Min breaking load, 1770 grade, fibre
 * core". A qualifier missing from this map is dropped, like any unknown key.
 */
export const QUALIFIER_LABELS: Readonly<Record<string, string>> = {
  a0: 'at 0°', a90: 'at 90°', upto90: 'up to 90°', a90to120: '90–120°',
  vertical: 'vertical', choker: 'choker', basket: 'basket',
  fc: 'fibre core', iwrc: 'steel core',
  g1570: '1570 grade', g1770: '1770 grade', g1960: '1960 grade',
  g1570_fc: '1570 grade, fibre core', g1570_iwrc: '1570 grade, steel core',
  g1770_fc: '1770 grade, fibre core', g1770_iwrc: '1770 grade, steel core',
  g1180_1770: '1180/1770 grade', g1320_1620: '1320/1620 grade', g1370_1570: '1370/1570 grade', g1570_1770: '1570/1770 grade',
  g80: 'Grade 80', g100: 'Grade 100', galv: 'galvanized', ss304: '304 stainless',
  u1: 'grade U1', u2: 'grade U2', u3: 'grade U3',
  mooring1: 'mooring, one rope', mooring2: 'mooring, two ropes', towing: 'towing',
  iso: 'ISO 2307', meg4: 'MEG4 LDBF',
  type1_iso: 'type I, ISO 2307', type1_dry_iso: 'type I, dry, ISO 2307', type1_meg4: 'type I, MEG4 LDBF',
  type2_iso: 'type II, ISO 2307', type2_dry_iso: 'type II, dry, ISO 2307', type2_meg4: 'type II, MEG4 LDBF',
  pp: 'polypropylene', ppMulti: 'PP multifilament', pe: 'polyethylene', polyester: 'polyester', nylon: 'nylon',
  polyolefin: 'polyolefin', mixed: 'polyester/polyolefin', paPes: 'polyamide/polyester',
}
const QUALIFIER_ORDER = Object.keys(QUALIFIER_LABELS)

/**
 * A drawing letter the registry does not list — `A1`, `d2`, `Ø1`, `Lp` (L′),
 * `RMax`, and the few two-letter labels rigging drawings print (TA, SW1…).
 * Bounded on purpose: an arbitrary short key is still dropped, not printed.
 */
export const DRAWING_LETTER =
  /^(?:Ø[A-Za-z]?\d{0,2}p?|[A-Za-z]\d{0,2}p?|[A-Za-z](?:Max|Min)|TA|TB|TL|NV|SW[12]|HC|HW|ad|bi|ch|dk)$/

function letterLabel(key: string): string {
  return key.replace(/(Max|Min)$/, (m) => ` ${m.toLowerCase()}`).replace(/p$/, '′')
}

/** Natural order for letters the registry does not list: A, A1, A2, a, a1, B… then Ø. */
function letterSort(a: string, b: string): number {
  const k = (s: string) => {
    const phi = s.startsWith('Ø') ? 1 : 0
    const body = s.replace(/^Ø/, '')
    const ch = body.charAt(0)
    const n = Number(/\d+/.exec(body)?.[0] ?? -1)
    return [phi, ch.toLowerCase(), ch === ch.toUpperCase() ? 0 : 1, body.length > 1 && /[A-Za-z]/.test(body.charAt(1)) ? 1 : 0, n, body] as const
  }
  const ka = k(a)
  const kb = k(b)
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return ka[i]! < kb[i]! ? -1 : 1
  }
  return 0
}

export type VariantLike = {
  partNumber: string
  hoseDash?: number | null
  hoseInch?: string | null
  hoseDn?: number | null
  portLabel?: string | null
  port2Label?: string | null
  port3Label?: string | null
  weightG?: number | null
  pressureBar?: number | null
  competitorBrand?: string | null
  competitorMpn?: string | null
  dimensions?: unknown
}

/** One threaded end of a fitting that has more than one. */
export type VariantEndColumn = {
  key: 'portLabel' | 'port2Label' | 'port3Label'
  label: string
  help: string
}

/**
 * The end columns a set of variants populates.
 *
 * A hose fitting has one port and gets a single column headed by what the
 * value is — `variantPortHeading` can read "thread" or "flange size" off the
 * value itself. An adapter has two or three ends and no such tell: `9/16"X18`
 * is the same thread on a JIC 37° male, an ORFS male and an SAE O-ring boss,
 * and only the seat differs. Naming those columns after a seat we cannot see
 * would be the guess this module exists to avoid, so they are numbered and the
 * listing's own title says which end is which.
 */
export function variantEndColumns(variants: readonly VariantLike[]): VariantEndColumn[] {
  const has2 = variants.some((v) => Boolean(v.port2Label))
  const has3 = variants.some((v) => Boolean(v.port3Label))
  if (!has2 && !has3) return []
  const help = 'Thread or flange nominal size at this end, exactly as the manufacturer prints it.'
  const cols: VariantEndColumn[] = [
    { key: 'portLabel', label: 'End 1', help },
    { key: 'port2Label', label: 'End 2', help },
  ]
  if (has3) cols.push({ key: 'port3Label', label: 'End 3', help })
  return cols
}

/** True when at least one variant carries a published weight. */
export function hasVariantWeights(variants: readonly VariantLike[]): boolean {
  return variants.some((v) => typeof v.weightG === 'number')
}

/** True when at least one variant carries a published working pressure. */
export function hasVariantPressures(variants: readonly VariantLike[]): boolean {
  return variants.some((v) => typeof v.pressureBar === 'number')
}

/**
 * Is this a table of hose, or of fittings?
 *
 * Read from the ROWS, not passed in by the page. A hose row carries at least
 * one of the hose-only columns; a fitting row never does. Deriving it means a
 * product cannot end up with hose data under a fitting's footnotes because
 * somebody forgot a prop — which matters, because one of those footnotes
 * offers every size in 316 stainless and that is nonsense on a rubber hose.
 */
export function variantTableKind(variants: readonly VariantLike[]): 'hose' | 'fitting' | 'lifting' {
  // Lifting first: a chain row carries `weightPerMetre` exactly as a hose row
  // does, and it is the load columns — which no hose or fitting ever has — that
  // say which one it is.
  const isLifting = variants.some((v) => {
    const raw = v.dimensions
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
    return Object.keys(raw).some((k) => LIFTING_MARKERS.has(k.split('@')[0]!))
  })
  if (isLifting) return 'lifting'
  const hoseKeys: VariantDimensionKey[] = ['hoseOD', 'burstPressure', 'vacuum', 'bendRadius', 'weightPerMetre']
  const isHose = variants.some((v) => {
    const dims = variantDimensions(v.dimensions)
    return hoseKeys.some((k) => k in dims)
  })
  return isHose ? 'hose' : 'fitting'
}

/** Narrow `dimensions` jsonb to a numeric record without trusting its shape. */
export function variantDimensions(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN
    if (Number.isFinite(n)) out[k] = n
  }
  return out
}

/** Narrow one `dimensions` entry to a string, for the text columns. */
export function variantText(value: unknown, key: VariantTextKey): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = (value as Record<string, unknown>)[key]
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

/** Text columns this set of variants populates, in canonical order. */
export function variantTextColumns(variants: readonly VariantLike[]): VariantTextColumn[] {
  const registry = variantTableKind(variants) === 'lifting' ? LIFTING_TEXT_COLUMNS : VARIANT_TEXT_COLUMNS
  return registry.filter((c) => variants.some((v) => variantText(v.dimensions, c.key)))
}

/**
 * The dimension columns this set of variants actually populates, in canonical
 * order. A key no variant carries is dropped rather than rendered empty; a key
 * we have no label for is dropped rather than shown raw.
 */
export function variantDimensionColumns(variants: readonly VariantLike[]): VariantColumn[] {
  const present = new Set<string>()
  for (const v of variants) {
    for (const k of Object.keys(variantDimensions(v.dimensions))) present.add(k)
  }
  if (variantTableKind(variants) !== 'lifting') {
    return VARIANT_DIMENSION_COLUMNS.filter((c) => present.has(c.key))
  }
  // Each named column, followed by its qualified splits in qualifier order.
  const withSplits = (cols: readonly VariantColumn[]): VariantColumn[] =>
    cols.flatMap((c) => {
      const out: VariantColumn[] = present.has(c.key) ? [c] : []
      const splits = [...present]
        .filter((k) => k.startsWith(`${c.key}@`))
        .map((k) => ({ k, q: k.slice(c.key.length + 1) }))
        .filter(({ q }) => q in QUALIFIER_LABELS)
        .sort((x, y) => QUALIFIER_ORDER.indexOf(x.q) - QUALIFIER_ORDER.indexOf(y.q))
      for (const { k, q } of splits) out.push({ ...c, key: k, label: `${c.label}, ${QUALIFIER_LABELS[q]}` })
      return out
    })
  const named = new Set<string>(LIFTING_DIMENSION_COLUMNS.map((c) => c.key))
  const extraLetters = [...present]
    .filter((k) => !named.has(k) && !k.includes('@') && DRAWING_LETTER.test(k))
    .sort(letterSort)
    .map((k) => letter(k, letterLabel(k)))
  return [
    ...withSplits(LIFTING_LOAD_COLUMNS),
    ...withSplits(LIFTING_PERFORMANCE_COLUMNS),
    ...withSplits(LIFTING_GEOMETRY_COLUMNS),
    ...withSplits(LIFTING_LETTER_COLUMNS),
    ...extraLetters,
    ...withSplits(LIFTING_WEIGHT_COLUMNS),
  ]
}

/**
 * Heading suffix for a column: `WLL (t)`, `Falls` — a count carries no unit.
 */
export function variantColumnUnit(column: VariantColumn): string | null {
  return column.unit === '' ? null : column.unit
}

/**
 * Heading for the port column.
 *
 * A port value is either a thread — `1/4"-18`, `G1/2"-14`, `M18X1.5`, carrying
 * a pitch or an `M` prefix — or a flange nominal size, which is a bare inch
 * fraction (`3/4"`). The distinction is visible in the value itself, so it
 * does not need storing. An empty or mixed set falls back to the neutral
 * heading rather than picking a side.
 */
export function variantPortHeading(variants: readonly VariantLike[]): string {
  const labels = variants
    .map((v) => v.portLabel?.trim())
    .filter((l): l is string => Boolean(l))
  if (labels.length === 0) return 'Port'
  // A hammer union names a pipe end, not a port: `2" butt weld, Sch XXS` or
  // `3" LP thread`. That is visible in the value, same as the thread test
  // below, so it does not need storing either.
  const isPipeEnd = (l: string) => /\b(butt weld|socket weld|lp thread|line pipe|npt)\b/i.test(l)
  if (labels.every(isPipeEnd)) return 'End connection'
  const isThread = (l: string) => /^M\d/i.test(l) || l.includes('-')
  if (labels.every(isThread)) return 'Thread'
  if (labels.every((l) => !isThread(l))) return 'Flange size'
  return 'Port'
}

/**
 * Heading for the size column.
 *
 * A hose fitting is ordered by the bore it crimps onto, and the catalogue
 * always states that bore as a dash size or a DN as well as an inch. A line
 * component — a hammer union, a pipe union — is ordered by nominal line size
 * and has neither. So the presence of `hoseDash` / `hoseDn` across the set is
 * what separates the two, and it is a property of the data rather than a
 * guess about the product.
 */
export function variantSizeHeading(variants: readonly VariantLike[]): string {
  const hasBoreCode = variants.some((v) => v.hoseDash != null || v.hoseDn != null)
  return hasBoreCode ? 'Hose bore' : 'Nominal size'
}

/** True when at least one variant carries a competitor equivalent to show. */
export function hasVariantEquivalents(variants: readonly VariantLike[]): boolean {
  return variants.some((v) => Boolean(v.competitorMpn))
}

/**
 * The competitor brand shown in the equivalents column header. Returns null
 * when the rows disagree, so the header never asserts a single brand over a
 * mixed set.
 */
export function variantEquivalentBrand(variants: readonly VariantLike[]): string | null {
  const brands = new Set(
    variants.map((v) => v.competitorBrand).filter((b): b is string => Boolean(b)),
  )
  return brands.size === 1 ? [...brands][0]! : null
}

/**
 * Compact "-08 · 1/2" · DN12" style hose label, skipping the parts a variant
 * does not carry. Returns null when it carries none of them.
 */
export function variantHoseLabel(v: VariantLike): string | null {
  const parts: string[] = []
  if (v.hoseDash != null) parts.push(`-${String(v.hoseDash).padStart(2, '0')}`)
  if (v.hoseInch) parts.push(v.hoseInch)
  if (v.hoseDn != null) parts.push(`DN${v.hoseDn}`)
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Bore range across a set of variants, in the `-04 to -24` form the
 * `nominal_size_range` spec field already uses elsewhere in the catalogue.
 */
export function variantBoreRange(variants: readonly VariantLike[]): string | null {
  const dashes = variants
    .map((v) => v.hoseDash)
    .filter((d): d is number => typeof d === 'number')
  if (dashes.length === 0) return null
  const lo = Math.min(...dashes)
  const hi = Math.max(...dashes)
  const fmt = (n: number) => `-${String(n).padStart(2, '0')}`
  return lo === hi ? fmt(lo) : `${fmt(lo)} to ${fmt(hi)}`
}
