import Datum from './Datum'
import AxisOptions from './AxisOptions'
import { Axis2D } from '../../../common/types/geometry'
import MarkerOptions from './MarkerOptions'
import BestFitLineOptions from './BestFitLineOptions'
import DatumSnapMode from './DatumSnapMode'
import PositionedDatum from './PositionedDatum'
import DatumFocusAppearance from './DatumHighlightAppearance'
import SeriesOptions from './SeriesOptions'
import LineOptions from './lineOptions'
import TextOptions from './TextOptions'
import VisibilityOptions from './VisibilityOptions'
import TooltipOptions from './TooltipOptions'

/**
 * Options for the Graph
 */
export type Options = {
  series: { [seriesKey: string]: Datum[] }
  backgroundColor?: string,
  heightPx: number
  widthPx: number
  seriesOptions?: { [seriesKey: string]: SeriesOptions }
  axesOptions?: { [axis in Axis2D]?: AxisOptions }
  axesLabelOptions?: TextOptions
  tooltipOptions?: TooltipOptions
  axesMarkerLabelOptions?: TextOptions
  axesMarkerLineOptions?: LineOptions
  axesLineOptions?: LineOptions
  gridLineOptions?: LineOptions
  connectingLineOptions?: LineOptions
  markerOptions?: MarkerOptions
  visibilityOptions?: VisibilityOptions
  bestFitLineOptions?: BestFitLineOptions
  datumSnapMode?: DatumSnapMode
  datumSnapDistanceThresholdPx?: number
  datumHighlightSeriesGroupingThresholdPx?: number
  seriesExcludedFromDatumHighlighting?: string[]
  datumHighlightAppearance?: DatumFocusAppearance | ((ctx: CanvasRenderingContext2D, highlightedDatum: PositionedDatum) => void)
}

export default Options
