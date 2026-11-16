import type { BlogArticleSeed } from '../shared'

import SPREADER_VS_LIFTING from './spreader-beam-vs-lifting-beam'
import COMPRESSION from './sling-angle-compression-force'
import COG from './centre-of-gravity-in-lifting'
import MISUSE from './spreader-beam-misuse'
import FLANGE_VS_END_CAP from './bolted-flange-vs-end-cap-spreader-beams'
import AHU_BARS from './lifting-bars-for-air-handling-units'

/** Publication order: the hub article first; every post links only to posts in this batch or already live. */
export const ARTICLES: BlogArticleSeed[] = [SPREADER_VS_LIFTING, COMPRESSION, COG, MISUSE, FLANGE_VS_END_CAP, AHU_BARS]
