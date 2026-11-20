import type { BlogArticleSeed } from '../shared'

import OTECO_DRILLING_EQUIPMENT_GUIDE from './oteco-drilling-equipment-guide'
import MODEL_72_VS_DM_GATE_VALVE from './model-72-vs-dm-gate-valve'
import REBUILDING_A_MODEL_72_GATE_VALVE from './rebuilding-a-model-72-gate-valve'
import SHEAR_PIN_VS_RESET_RELIEF_VALVE from './shear-pin-vs-reset-relief-valve'
import DRILLING_PRESSURE_GAUGE_MODELS from './drilling-pressure-gauge-models'
import DRILL_PIPE_FLOAT_VALVE_MODELS from './drill-pipe-float-valve-models'
import MUD_PUMP_PISTONS_EXPLAINED from './mud-pump-pistons-explained'
import MUD_PUMP_VALVES_AND_DAMPENER_DIAPHRAGMS from './mud-pump-valves-and-dampener-diaphragms'
import SWIVEL_WASHPIPE_AND_PACKING from './swivel-washpipe-and-packing'
import PIPE_WIPERS_AND_MUD_GUARDS from './pipe-wipers-and-mud-guards'
import MANIFOLD_FITTING_PRESSURE_RATINGS from './manifold-fitting-pressure-ratings'
import ANNULAR_BOP_PACKING_UNIT_COMPOUNDS from './annular-bop-packing-unit-compounds'

/** Publication order: the hub first, then valves, gauges and float valves, the mud pump and swivel, rig floor rubber, manifold fittings and BOP rubber. */
export const ARTICLES: BlogArticleSeed[] = [
  OTECO_DRILLING_EQUIPMENT_GUIDE,
  MODEL_72_VS_DM_GATE_VALVE,
  REBUILDING_A_MODEL_72_GATE_VALVE,
  SHEAR_PIN_VS_RESET_RELIEF_VALVE,
  DRILLING_PRESSURE_GAUGE_MODELS,
  DRILL_PIPE_FLOAT_VALVE_MODELS,
  MUD_PUMP_PISTONS_EXPLAINED,
  MUD_PUMP_VALVES_AND_DAMPENER_DIAPHRAGMS,
  SWIVEL_WASHPIPE_AND_PACKING,
  PIPE_WIPERS_AND_MUD_GUARDS,
  MANIFOLD_FITTING_PRESSURE_RATINGS,
  ANNULAR_BOP_PACKING_UNIT_COMPOUNDS,
]
