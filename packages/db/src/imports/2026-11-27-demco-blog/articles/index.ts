import type { BlogArticleSeed } from '../shared'

import DEMCO_GATE_VALVE_VS_BUTTERFLY_VALVE from './demco-gate-valve-vs-butterfly-valve'
import DEMCO_DM_5000_VS_DM_7500_GATE_VALVE from './demco-dm-5000-vs-dm-7500-gate-valve'
import DEMCO_DM_GATE_VALVE_PART_NUMBERS from './demco-dm-gate-valve-part-numbers'
import DEMCO_BUTTERFLY_VALVE_PART_NUMBERS from './demco-butterfly-valve-part-numbers'
import MUD_GATE_VALVE_REPAIR_KITS from './mud-gate-valve-repair-kits'
import DEMCO_BUTTERFLY_VALVE_SEAT_REPLACEMENT from './demco-butterfly-valve-seat-replacement'
import DEMCO_BUTTERFLY_VALVE_TORQUE_ACTUATOR_SIZING from './demco-butterfly-valve-torque-actuator-sizing'
import DEMCO_VALVES_MIDDLE_EAST_APPLICATIONS from './demco-valves-middle-east-applications'

/**
 * Publication order. demco-butterfly-valve-part-numbers and mud-gate-valve-repair-kits are refreshes of
 * live posts (slug kept, publishedAt ignored on update); the other six are new.
 */
export const ARTICLES: BlogArticleSeed[] = [
  DEMCO_GATE_VALVE_VS_BUTTERFLY_VALVE,
  DEMCO_DM_5000_VS_DM_7500_GATE_VALVE,
  DEMCO_DM_GATE_VALVE_PART_NUMBERS,
  DEMCO_BUTTERFLY_VALVE_PART_NUMBERS,
  MUD_GATE_VALVE_REPAIR_KITS,
  DEMCO_BUTTERFLY_VALVE_SEAT_REPLACEMENT,
  DEMCO_BUTTERFLY_VALVE_TORQUE_ACTUATOR_SIZING,
  DEMCO_VALVES_MIDDLE_EAST_APPLICATIONS,
]
