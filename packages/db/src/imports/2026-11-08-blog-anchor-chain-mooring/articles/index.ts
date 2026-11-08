import type { BlogArticleSeed } from '../shared'

import ARRANGEMENT from './anchor-chain-cable-arrangement'
import STUD_VS_STUDLESS from './stud-link-vs-studless-chain'
import OFFSHORE_GRADES from './offshore-mooring-chain-grades-r3-r4-r5'
import SIZE_CHART from './anchor-chain-size-chart'
import WEIGHT_CHART from './anchor-chain-weight-chart'
import HOW_MADE from './how-anchor-chain-is-made'
import TESTING from './anchor-chain-testing-proof-break-ndt'
import EQUIPMENT_NUMBER from './equipment-number-anchor-chain-sizing'
import WEAR_LIMITS from './anchor-chain-wear-limits'
import LOCKER from './chain-locker-volume'
import KENTER from './how-to-assemble-a-kenter-shackle'
import ANCHOR_PROOF from './anchor-proof-load-testing'
import MOORING_COMPONENTS from './offshore-mooring-components'
import MARKING from './anchor-chain-marking-and-certificates'

/** Publication order: the hub article first, then the charts, then the how-to and reference pieces. */
export const ARTICLES: BlogArticleSeed[] = [
  ARRANGEMENT,
  STUD_VS_STUDLESS,
  OFFSHORE_GRADES,
  SIZE_CHART,
  WEIGHT_CHART,
  HOW_MADE,
  TESTING,
  EQUIPMENT_NUMBER,
  WEAR_LIMITS,
  LOCKER,
  KENTER,
  ANCHOR_PROOF,
  MOORING_COMPONENTS,
  MARKING,
]
