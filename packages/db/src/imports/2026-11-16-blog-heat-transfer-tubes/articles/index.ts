import type { BlogArticleSeed } from '../shared'

import HUB from './heat-transfer-tube-buyers-guide'
import FIN_TYPES from './types-of-finned-tubes'
import SERRATED from './serrated-vs-solid-spiral-fin-tubes'
import EXTRUDED from './extruded-fin-tubes-coastal-air-coolers'
import LOW_FIN from './integral-low-fin-tubes-condenser-retubing'
import U_BEND from './u-bend-tubes-bend-radius-wall-thinning'
import CARBON_ALLOY from './a179-vs-a192-vs-a210-vs-a213'
import STAINLESS from './stainless-heat-exchanger-tube-grades'
import COPPER from './copper-nickel-vs-admiralty-brass-seawater-tubes'
import DIN_EN from './din-17175-din-1629-en-10216-equivalents'
import API from './api-5l-vs-api-5ct'
import BUNDLE from './air-cooler-bundle-replacement-data-sheet'
import TUBE_SHEET from './tube-sheet-drilling-pitch-baffle-holes'
import FOULING from './finned-tube-fouling-cleaning'
import CERT from './en-10204-3-1-mill-test-certificate'
import PRESSURE_PARTS from './boiler-pressure-parts-headers-superheaters'

/**
 * Publication order. Wave 1 (hub + buying guides) went live first on 2026-11-16; waves 2 (materials and
 * standards) and 3 (ordering and long tail) followed the same day.
 */
export const ARTICLES: BlogArticleSeed[] = [
  HUB, FIN_TYPES, SERRATED, EXTRUDED, LOW_FIN, U_BEND,
  CARBON_ALLOY, STAINLESS, COPPER, DIN_EN, API,
  BUNDLE, TUBE_SHEET, FOULING, CERT, PRESSURE_PARTS,
]
