/**
 * Per-bore size tables for the hydraulic hose grades we stock.
 *
 * WHY THIS EXISTS
 *
 * `ProductSpec` carries one working-pressure figure per grade, and that figure
 * is the maximum across the grade's whole bore range. Comparing grades on it
 * is therefore misleading in a way that is easy to miss: the catalogue records
 * 2SC at 450 bar and 4SH at 420 bar, which reads as 2SC being the stronger
 * hose. It is not. 2SC's 450 bar is at -04 and 4SH's is at -12, and at any
 * bore they share, 4SH is far stronger — at -32, 4SH is 250 bar against 2SN's
 * 50 bar.
 *
 * Any published comparison has to be at a COMMON BORE, which needs one row per
 * size. That is what this is.
 *
 * SOURCE AND ATTRIBUTION
 *
 * Extracted from the Intertraco (Italia) S.p.A. hydraulic hose catalogue,
 * which publishes per-size data for its own constructions. These are therefore
 * the figures for a specific manufacturer's product meeting the stated
 * standard — NOT the standard's own values, and not a claim about every hose
 * sold against that standard. Content built on this must attribute it and
 * point the reader at the datasheet for the assembly actually supplied.
 *
 * The 4:1 design factor holds on every row here, which is asserted by a test.
 *
 * UNRESOLVED: THIS DOES NOT MATCH ProductSpec, AND MUST NOT OVERWRITE IT
 *
 * Eight of the twelve grades disagree with the single max-working-pressure
 * figure stored on the corresponding product:
 *
 *   1SN   spec 230 · source 225      2SN   spec 415 · source 400
 *   1SC   spec 250 · source 225      2SC   spec 450 · source 400
 *   4SH   spec 420 · source 450      R13   spec 345 · source 350
 *   R6    spec  21 · source  28      R14   spec 210 · source 275
 *   (4SP, R15, R5 and R7 match.)
 *
 * That is expected rather than alarming — these are one manufacturer's
 * products meeting a standard, and the products actually stocked may be
 * another's. But it means this dataset is a REFERENCE for how pressure varies
 * with bore, attributed to its source, and not a correction to the catalogue.
 * Resolving the two is a technical-review decision, not a transcription one.
 *
 * `idMm` is null for the grades whose catalogue tables publish outside
 * diameter only — R6, R7 and R14. Absent, not zero.
 */

export type HoseSizeRow = {
  /** Dash size: -4, -6, -8… */
  dash: number
  /** Nominal bore, DN. */
  dn: number
  /** Reinforcement/inner diameter in mm, where the source publishes it. */
  idMm: number | null
  odMm: number
  workingBar: number
  workingPsi: number
  burstBar: number
  burstPsi: number
  bendRadiusMm: number
  weightKgM: number
}

export type HoseSizeTable = {
  /** Product SKU in our catalogue. */
  sku: string
  /** Standard the construction is built to. */
  standard: string
  /** Manufacturer series the data was taken from. */
  seriesLabel: string
  /** Page in the source catalogue, for traceability. */
  sourcePage: number
  rows: HoseSizeRow[]
}

export const HOSE_SIZE_SOURCE =
  'Intertraco (Italia) S.p.A. hydraulic hose catalogue'

export const HOSE_SIZE_TABLES: HoseSizeTable[] = [
  {
    sku: 'IH-HOSE-R1-1SN',
    standard: 'EN 853 1SN / SAE 100R1AT',
    seriesLabel: 'FlexIt 1T',
    sourcePage: 8,
    rows: [
      { dash: 4, dn: 6, idMm: 11.1, odMm: 13.2, workingBar: 225, workingPsi: 3250, burstBar: 900, burstPsi: 13000, bendRadiusMm: 100, weightKgM: 0.21 },
      { dash: 5, dn: 8, idMm: 12.7, odMm: 14.5, workingBar: 215, workingPsi: 3100, burstBar: 860, burstPsi: 12400, bendRadiusMm: 115, weightKgM: 0.24 },
      { dash: 6, dn: 10, idMm: 15.1, odMm: 17.2, workingBar: 180, workingPsi: 2600, burstBar: 720, burstPsi: 10400, bendRadiusMm: 125, weightKgM: 0.33 },
      { dash: 8, dn: 12, idMm: 18.0, odMm: 20.4, workingBar: 160, workingPsi: 2300, burstBar: 640, burstPsi: 9200, bendRadiusMm: 180, weightKgM: 0.41 },
      { dash: 10, dn: 16, idMm: 21.2, odMm: 23.5, workingBar: 130, workingPsi: 1900, burstBar: 520, burstPsi: 7600, bendRadiusMm: 200, weightKgM: 0.45 },
      { dash: 12, dn: 19, idMm: 25.2, odMm: 27.5, workingBar: 105, workingPsi: 1500, burstBar: 420, burstPsi: 6000, bendRadiusMm: 240, weightKgM: 0.58 },
      { dash: 16, dn: 25, idMm: 33.1, odMm: 35.4, workingBar: 88, workingPsi: 1250, burstBar: 352, burstPsi: 5000, bendRadiusMm: 300, weightKgM: 0.88 },
      { dash: 20, dn: 31, idMm: 40.2, odMm: 43.5, workingBar: 63, workingPsi: 920, burstBar: 252, burstPsi: 3680, bendRadiusMm: 420, weightKgM: 1.23 },
      { dash: 24, dn: 38, idMm: 46.7, odMm: 50.0, workingBar: 50, workingPsi: 725, burstBar: 200, burstPsi: 2900, bendRadiusMm: 500, weightKgM: 1.51 },
      { dash: 32, dn: 51, idMm: 60.2, odMm: 63.6, workingBar: 40, workingPsi: 580, burstBar: 160, burstPsi: 2320, bendRadiusMm: 630, weightKgM: 1.97 },
      { dash: 40, dn: 63, idMm: 73.0, odMm: 76.5, workingBar: 40, workingPsi: 580, burstBar: 160, burstPsi: 2320, bendRadiusMm: 760, weightKgM: 2.54 },
      { dash: 48, dn: 76, idMm: 85.0, odMm: 88.5, workingBar: 35, workingPsi: 500, burstBar: 140, burstPsi: 2000, bendRadiusMm: 900, weightKgM: 2.71 },
    ],
  },
  {
    sku: 'IH-HOSE-R2-2SN',
    standard: 'EN 853 2SN / SAE 100R2AT',
    seriesLabel: 'FlexIt 2T',
    sourcePage: 9,
    rows: [
      { dash: 4, dn: 6, idMm: 12.7, odMm: 15.0, workingBar: 400, workingPsi: 5800, burstBar: 1600, burstPsi: 23200, bendRadiusMm: 100, weightKgM: 0.33 },
      { dash: 5, dn: 8, idMm: 14.3, odMm: 16.4, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 115, weightKgM: 0.39 },
      { dash: 6, dn: 10, idMm: 16.7, odMm: 18.8, workingBar: 330, workingPsi: 4800, burstBar: 1320, burstPsi: 19200, bendRadiusMm: 125, weightKgM: 0.5 },
      { dash: 8, dn: 12, idMm: 19.8, odMm: 22.2, workingBar: 275, workingPsi: 4000, burstBar: 1100, burstPsi: 16000, bendRadiusMm: 180, weightKgM: 0.59 },
      { dash: 10, dn: 16, idMm: 23.0, odMm: 25.2, workingBar: 250, workingPsi: 3600, burstBar: 1000, burstPsi: 14400, bendRadiusMm: 200, weightKgM: 0.71 },
      { dash: 12, dn: 19, idMm: 27.0, odMm: 29.3, workingBar: 215, workingPsi: 3100, burstBar: 860, burstPsi: 12400, bendRadiusMm: 240, weightKgM: 0.86 },
      { dash: 16, dn: 25, idMm: 34.9, odMm: 37.2, workingBar: 165, workingPsi: 2400, burstBar: 660, burstPsi: 9600, bendRadiusMm: 300, weightKgM: 1.28 },
      { dash: 20, dn: 31, idMm: 44.5, odMm: 47.3, workingBar: 125, workingPsi: 1800, burstBar: 500, burstPsi: 7200, bendRadiusMm: 420, weightKgM: 2.02 },
      { dash: 24, dn: 38, idMm: 50.8, odMm: 53.7, workingBar: 90, workingPsi: 1300, burstBar: 360, burstPsi: 5200, bendRadiusMm: 500, weightKgM: 2.23 },
      { dash: 32, dn: 51, idMm: 63.5, odMm: 66.7, workingBar: 80, workingPsi: 1150, burstBar: 320, burstPsi: 4600, bendRadiusMm: 630, weightKgM: 2.85 },
      { dash: 40, dn: 63, idMm: 75.8, odMm: 79.3, workingBar: 69, workingPsi: 1000, burstBar: 276, burstPsi: 4000, bendRadiusMm: 760, weightKgM: 3.81 },
      { dash: 48, dn: 76, idMm: 87.8, odMm: 91.3, workingBar: 50, workingPsi: 725, burstBar: 200, burstPsi: 2900, bendRadiusMm: 900, weightKgM: 4.04 },
    ],
  },
  {
    sku: 'IH-HOSE-R1-1SC',
    standard: 'EN 857 1SC',
    seriesLabel: 'FlexIt SC117',
    sourcePage: 12,
    rows: [
      { dash: 4, dn: 6, idMm: 9.9, odMm: 12.2, workingBar: 225, workingPsi: 3265, burstBar: 900, burstPsi: 13060, bendRadiusMm: 50, weightKgM: 0.16 },
      { dash: 5, dn: 8, idMm: 11.7, odMm: 14.0, workingBar: 215, workingPsi: 3100, burstBar: 860, burstPsi: 12400, bendRadiusMm: 55, weightKgM: 0.21 },
      { dash: 6, dn: 10, idMm: 13.4, odMm: 16.4, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 65, weightKgM: 0.27 },
      { dash: 8, dn: 12, idMm: 17.1, odMm: 20.0, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 90, weightKgM: 0.39 },
      { dash: 10, dn: 16, idMm: 20.3, odMm: 22.7, workingBar: 130, workingPsi: 1900, burstBar: 520, burstPsi: 7600, bendRadiusMm: 150, weightKgM: 0.39 },
      { dash: 12, dn: 19, idMm: 23.9, odMm: 26.5, workingBar: 105, workingPsi: 1500, burstBar: 420, burstPsi: 6000, bendRadiusMm: 180, weightKgM: 0.5 },
    ],
  },
  {
    sku: 'IH-HOSE-2SC',
    standard: 'EN 857 2SC',
    seriesLabel: 'FlexIt SC216',
    sourcePage: 14,
    rows: [
      { dash: 4, dn: 6, idMm: 11.2, odMm: 13.8, workingBar: 400, workingPsi: 5800, burstBar: 1600, burstPsi: 23200, bendRadiusMm: 50, weightKgM: 0.28 },
      { dash: 5, dn: 8, idMm: 12.7, odMm: 15.4, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 55, weightKgM: 0.33 },
      { dash: 6, dn: 10, idMm: 15.1, odMm: 17.3, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 65, weightKgM: 0.42 },
      { dash: 8, dn: 12, idMm: 18.3, odMm: 20.8, workingBar: 280, workingPsi: 4000, burstBar: 1120, burstPsi: 16000, bendRadiusMm: 90, weightKgM: 0.52 },
      { dash: 10, dn: 16, idMm: 21.4, odMm: 24.7, workingBar: 250, workingPsi: 3600, burstBar: 1000, burstPsi: 14400, bendRadiusMm: 100, weightKgM: 0.61 },
      { dash: 12, dn: 19, idMm: 25.4, odMm: 28.6, workingBar: 250, workingPsi: 3600, burstBar: 1000, burstPsi: 14400, bendRadiusMm: 120, weightKgM: 0.79 },
      { dash: 16, dn: 25, idMm: 33.4, odMm: 36.6, workingBar: 165, workingPsi: 2400, burstBar: 660, burstPsi: 9600, bendRadiusMm: 150, weightKgM: 1.1 },
      { dash: 40, dn: 63, idMm: 73.7, odMm: 77.5, workingBar: 70, workingPsi: 1000, burstBar: 280, burstPsi: 4000, bendRadiusMm: 760, weightKgM: 3.3 },
      { dash: 48, dn: 76, idMm: 89.0, odMm: 92.3, workingBar: 70, workingPsi: 1000, burstBar: 280, burstPsi: 4000, bendRadiusMm: 900, weightKgM: 3.78 },
    ],
  },
  {
    sku: 'IH-HOSE-4SP',
    standard: 'EN 856 4SP',
    seriesLabel: 'FlexIt SHP',
    sourcePage: 25,
    rows: [
      { dash: 4, dn: 6, idMm: 14.6, odMm: 17.0, workingBar: 450, workingPsi: 6500, burstBar: 1800, burstPsi: 26000, bendRadiusMm: 150, weightKgM: 0.57 },
      { dash: 6, dn: 10, idMm: 17.5, odMm: 20.1, workingBar: 450, workingPsi: 6500, burstBar: 1800, burstPsi: 26000, bendRadiusMm: 180, weightKgM: 0.69 },
      { dash: 8, dn: 12, idMm: 20.6, odMm: 23.0, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 230, weightKgM: 0.85 },
      { dash: 10, dn: 16, idMm: 24.2, odMm: 26.5, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 250, weightKgM: 1.04 },
      { dash: 12, dn: 19, idMm: 28.2, odMm: 30.6, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 300, weightKgM: 1.32 },
      { dash: 16, dn: 25, idMm: 35.1, odMm: 37.8, workingBar: 320, workingPsi: 4600, burstBar: 1280, burstPsi: 18400, bendRadiusMm: 340, weightKgM: 2.06 },
      { dash: 20, dn: 31, idMm: 43.6, odMm: 45.8, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 420, weightKgM: 2.53 },
      { dash: 24, dn: 38, idMm: 50.1, odMm: 52.3, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 500, weightKgM: 2.96 },
      { dash: 32, dn: 51, idMm: 63.6, odMm: 66.3, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 630, weightKgM: 4.3 },
    ],
  },
  {
    sku: 'IH-HOSE-4SH',
    standard: 'EN 856 4SH',
    seriesLabel: 'FlexIt H4',
    sourcePage: 26,
    rows: [
      { dash: 10, dn: 16, idMm: 25.0, odMm: 28.7, workingBar: 450, workingPsi: 6500, burstBar: 1800, burstPsi: 26000, bendRadiusMm: 250, weightKgM: 1.09 },
      { dash: 12, dn: 19, idMm: 28.4, odMm: 31.9, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 280, weightKgM: 1.45 },
      { dash: 16, dn: 25, idMm: 35.5, odMm: 38.5, workingBar: 380, workingPsi: 5500, burstBar: 1520, burstPsi: 22000, bendRadiusMm: 340, weightKgM: 2.14 },
      { dash: 20, dn: 31, idMm: 41.9, odMm: 45.9, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 460, weightKgM: 2.51 },
      { dash: 24, dn: 38, idMm: 49.0, odMm: 53.5, workingBar: 300, workingPsi: 4300, burstBar: 1200, burstPsi: 17200, bendRadiusMm: 560, weightKgM: 3.26 },
      { dash: 32, dn: 51, idMm: 63.2, odMm: 68.3, workingBar: 250, workingPsi: 3600, burstBar: 1000, burstPsi: 14400, bendRadiusMm: 700, weightKgM: 4.9 },
    ],
  },
  {
    sku: 'IH-HOSE-R13',
    standard: 'SAE 100R13',
    seriesLabel: 'FlexIt 5000',
    sourcePage: 27,
    rows: [
      { dash: 12, dn: 19, idMm: 29.0, odMm: 32.1, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 240, weightKgM: 1.6 },
      { dash: 16, dn: 25, idMm: 35.1, odMm: 38.4, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 300, weightKgM: 2.13 },
      { dash: 20, dn: 31, idMm: 46.8, odMm: 49.8, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 420, weightKgM: 4.4 },
      { dash: 24, dn: 38, idMm: 54.3, odMm: 57.3, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 500, weightKgM: 4.8 },
      { dash: 32, dn: 51, idMm: 67.7, odMm: 71.5, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 600, weightKgM: 6.9 },
      { dash: 40, dn: 63, idMm: 81.8, odMm: 86.0, workingBar: 350, workingPsi: 5000, burstBar: 1400, burstPsi: 20000, bendRadiusMm: 800, weightKgM: 8.0 },
    ],
  },
  {
    sku: 'IH-HOSE-R15',
    standard: 'SAE 100R15',
    seriesLabel: 'FlexIt 6000',
    sourcePage: 28,
    rows: [
      { dash: 12, dn: 19, idMm: 28.1, odMm: 31.8, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 265, weightKgM: 1.43 },
      { dash: 16, dn: 25, idMm: 35.3, odMm: 38.3, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 340, weightKgM: 2.16 },
      { dash: 20, dn: 31, idMm: 46.8, odMm: 50.1, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 420, weightKgM: 2.96 },
      { dash: 24, dn: 38, idMm: 53.4, odMm: 57.3, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 510, weightKgM: 5.1 },
      { dash: 32, dn: 51, idMm: 67.7, odMm: 71.5, workingBar: 420, workingPsi: 6000, burstBar: 1680, burstPsi: 24000, bendRadiusMm: 600, weightKgM: 6.9 },
    ],
  },
  {
    sku: 'IH-HOSE-R5',
    standard: 'SAE 100R5',
    seriesLabel: 'FlexIt R5',
    sourcePage: 19,
    rows: [
      { dash: 4, dn: 5, idMm: 11.3, odMm: 12.9, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 75, weightKgM: 0.25 },
      { dash: 5, dn: 6, idMm: 12.9, odMm: 14.5, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 85, weightKgM: 0.29 },
      { dash: 6, dn: 8, idMm: 15.2, odMm: 16.8, workingBar: 155, workingPsi: 2250, burstBar: 620, burstPsi: 9000, bendRadiusMm: 100, weightKgM: 0.36 },
      { dash: 8, dn: 10, idMm: 17.5, odMm: 19.1, workingBar: 140, workingPsi: 2000, burstBar: 560, burstPsi: 8000, bendRadiusMm: 115, weightKgM: 0.42 },
      { dash: 10, dn: 12, idMm: 21.3, odMm: 22.9, workingBar: 122, workingPsi: 1750, burstBar: 488, burstPsi: 7000, bendRadiusMm: 140, weightKgM: 0.57 },
      { dash: 12, dn: 16, idMm: 25.5, odMm: 27.1, workingBar: 105, workingPsi: 1500, burstBar: 420, burstPsi: 6000, bendRadiusMm: 165, weightKgM: 0.71 },
      { dash: 16, dn: 22, idMm: 29.2, odMm: 30.8, workingBar: 56, workingPsi: 800, burstBar: 224, burstPsi: 3200, bendRadiusMm: 185, weightKgM: 0.7 },
      { dash: 20, dn: 28, idMm: 36.0, odMm: 37.6, workingBar: 43, workingPsi: 625, burstBar: 172, burstPsi: 2500, bendRadiusMm: 230, weightKgM: 0.925 },
      { dash: 24, dn: 35, idMm: 42.8, odMm: 44.4, workingBar: 35, workingPsi: 500, burstBar: 140, burstPsi: 2000, bendRadiusMm: 265, weightKgM: 1.15 },
      { dash: 32, dn: 46, idMm: 54.3, odMm: 56.4, workingBar: 24, workingPsi: 350, burstBar: 96, burstPsi: 1400, bendRadiusMm: 335, weightKgM: 1.39 },
    ],
  },
  {
    sku: 'IH-HOSE-R6',
    standard: 'SAE 100R6',
    seriesLabel: 'FlexIt eZ-Lock',
    sourcePage: 22,
    rows: [
      { dash: 4, dn: 6, idMm: null, odMm: 12.3, workingBar: 28, workingPsi: 400, burstBar: 112, burstPsi: 1600, bendRadiusMm: 65, weightKgM: 0.11 },
      { dash: 5, dn: 8, idMm: null, odMm: 13.9, workingBar: 28, workingPsi: 400, burstBar: 112, burstPsi: 1600, bendRadiusMm: 80, weightKgM: 0.13 },
      { dash: 6, dn: 10, idMm: null, odMm: 15.5, workingBar: 28, workingPsi: 400, burstBar: 112, burstPsi: 1600, bendRadiusMm: 80, weightKgM: 0.15 },
      { dash: 8, dn: 12, idMm: null, odMm: 19.5, workingBar: 28, workingPsi: 400, burstBar: 112, burstPsi: 1600, bendRadiusMm: 100, weightKgM: 0.2 },
      { dash: 10, dn: 16, idMm: null, odMm: 22.6, workingBar: 24, workingPsi: 350, burstBar: 96, burstPsi: 1400, bendRadiusMm: 125, weightKgM: 0.26 },
      { dash: 12, dn: 19, idMm: null, odMm: 25.8, workingBar: 21, workingPsi: 300, burstBar: 84, burstPsi: 1200, bendRadiusMm: 150, weightKgM: 0.31 },
      { dash: 16, dn: 25, idMm: null, odMm: 33.2, workingBar: 20, workingPsi: 290, burstBar: 80, burstPsi: 1160, bendRadiusMm: 170, weightKgM: 0.46 },
    ],
  },
  {
    sku: 'IH-HOSE-R7-TP',
    standard: 'SAE 100R7 / EN 855 R7',
    seriesLabel: 'FlexIt T7',
    sourcePage: 23,
    rows: [
      { dash: 3, dn: 5, idMm: null, odMm: 10.0, workingBar: 210, workingPsi: 3000, burstBar: 840, burstPsi: 12000, bendRadiusMm: 30, weightKgM: 0.07 },
      { dash: 4, dn: 6, idMm: null, odMm: 11.8, workingBar: 200, workingPsi: 2900, burstBar: 800, burstPsi: 11600, bendRadiusMm: 35, weightKgM: 0.09 },
      { dash: 5, dn: 8, idMm: null, odMm: 14.3, workingBar: 190, workingPsi: 2750, burstBar: 760, burstPsi: 11000, bendRadiusMm: 45, weightKgM: 0.13 },
      { dash: 6, dn: 10, idMm: null, odMm: 16.0, workingBar: 175, workingPsi: 2500, burstBar: 700, burstPsi: 10000, bendRadiusMm: 55, weightKgM: 0.16 },
      { dash: 8, dn: 12, idMm: null, odMm: 20.3, workingBar: 140, workingPsi: 2000, burstBar: 560, burstPsi: 8000, bendRadiusMm: 75, weightKgM: 0.22 },
      { dash: 10, dn: 16, idMm: null, odMm: 23.5, workingBar: 105, workingPsi: 1500, burstBar: 420, burstPsi: 6000, bendRadiusMm: 120, weightKgM: 0.28 },
      { dash: 12, dn: 19, idMm: null, odMm: 26.5, workingBar: 90, workingPsi: 1300, burstBar: 360, burstPsi: 5200, bendRadiusMm: 145, weightKgM: 0.33 },
      { dash: 16, dn: 25, idMm: null, odMm: 32.5, workingBar: 70, workingPsi: 1000, burstBar: 280, burstPsi: 4000, bendRadiusMm: 200, weightKgM: 0.4 },
    ],
  },
  {
    sku: 'IH-HOSE-R14',
    standard: 'SAE 100R14 (PTFE)',
    seriesLabel: 'FlexIt T14',
    sourcePage: 24,
    rows: [
      { dash: 2, dn: 3, idMm: null, odMm: 6.7, workingBar: 275, workingPsi: 4000, burstBar: 1100, burstPsi: 16000, bendRadiusMm: 25, weightKgM: 0.06 },
      { dash: 3, dn: 5, idMm: null, odMm: 8.0, workingBar: 200, workingPsi: 2900, burstBar: 800, burstPsi: 11600, bendRadiusMm: 35, weightKgM: 0.07 },
      { dash: 4, dn: 6, idMm: null, odMm: 9.5, workingBar: 175, workingPsi: 2500, burstBar: 700, burstPsi: 10000, bendRadiusMm: 45, weightKgM: 0.09 },
      { dash: 5, dn: 8, idMm: null, odMm: 11.8, workingBar: 150, workingPsi: 2200, burstBar: 600, burstPsi: 8800, bendRadiusMm: 50, weightKgM: 0.13 },
      { dash: 6, dn: 10, idMm: null, odMm: 14.1, workingBar: 135, workingPsi: 2000, burstBar: 540, burstPsi: 8000, bendRadiusMm: 55, weightKgM: 0.15 },
      { dash: 8, dn: 12, idMm: null, odMm: 17.2, workingBar: 120, workingPsi: 1750, burstBar: 480, burstPsi: 7000, bendRadiusMm: 70, weightKgM: 0.21 },
      { dash: 10, dn: 16, idMm: null, odMm: 20.5, workingBar: 100, workingPsi: 1450, burstBar: 400, burstPsi: 5800, bendRadiusMm: 130, weightKgM: 0.26 },
      { dash: 12, dn: 19, idMm: null, odMm: 23.7, workingBar: 90, workingPsi: 1300, burstBar: 360, burstPsi: 5200, bendRadiusMm: 190, weightKgM: 0.321 },
      { dash: 16, dn: 25, idMm: null, odMm: 30.0, workingBar: 65, workingPsi: 950, burstBar: 260, burstPsi: 3800, bendRadiusMm: 270, weightKgM: 0.45 },
    ],
  },]

export function hoseSizeTable(sku: string): HoseSizeTable | undefined {
  return HOSE_SIZE_TABLES.find((t) => t.sku === sku)
}

export function hoseSizeRow(sku: string, dash: number): HoseSizeRow | undefined {
  return hoseSizeTable(sku)?.rows.find((r) => r.dash === dash)
}

/**
 * Compare grades at ONE bore.
 *
 * The only honest way to rank constructions against each other. Grades that do
 * not offer the requested dash size are omitted rather than shown as zero —
 * "4SH is not made at -04" and "4SH is weak at -04" are different statements
 * and only the first is true.
 */
export function compareHoseGradesAtDash(
  dash: number,
  skus: string[],
): Array<{ sku: string; standard: string; row: HoseSizeRow }> {
  return skus
    .map((sku) => {
      const table = hoseSizeTable(sku)
      const row = table?.rows.find((r) => r.dash === dash)
      return table && row ? { sku, standard: table.standard, row } : null
    })
    .filter((x): x is { sku: string; standard: string; row: HoseSizeRow } => x !== null)
    .sort((a, b) => b.row.workingBar - a.row.workingBar)
}

/** Dash sizes a grade is actually produced in. */
export function hoseDashSizes(sku: string): number[] {
  return hoseSizeTable(sku)?.rows.map((r) => r.dash) ?? []
}
