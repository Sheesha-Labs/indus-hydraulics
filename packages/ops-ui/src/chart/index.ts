// Chart kit (K-12, 05 §3.9). SVG and CSS only, server-rendered, no chart library.
export { default as ChartFigure, type ChartFrame, type DataTable } from './ChartFigure'
export {
  default as BarList,
  type BarListDatum,
  type BarListLabelWidth,
  type BarListProps,
} from './BarList'
export {
  default as StackedBar,
  LegendSwatch,
  type StackedBarProps,
  type StackedSegment,
} from './StackedBar'
export { default as TrendChart, type TrendChartProps, type TrendSeries } from './TrendChart'
export {
  default as Heatmap,
  heatLevel,
  HEAT_CLASS,
  type HeatLevel,
  type HeatmapProps,
  type HeatmapRow,
} from './Heatmap'
export { default as Money, type MoneyProps, type MoneySize } from './Money'
export { default as FxTag, fxText, type FxState, type FxTagProps } from './FxTag'
export { default as VatBlock, vatBlockRows, type VatBlockProps, type VatBlockRow } from './VatBlock'
export { TONE_FILL, TONE_STROKE, type Ccy, type ChartTone } from './tones'
