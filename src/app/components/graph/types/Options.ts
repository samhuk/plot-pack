import Datum from './Datum'
import AxisOptions from './AxisOptions'
import { Axis2D } from '../../../common/types/geometry'
import MarkerOptions from './MarkerOptions'
import BestFitLineOptions from './BestFitLineOptions'
import SeriesOptions from './SeriesOptions'
import LineOptions from './lineOptions'
import TextOptions from './TextOptions'
import VisibilityOptions from './VisibilityOptions'
import TooltipOptions from './TooltipOptions'
import DatumHighlightOptions from './DatumHighlightOptions'
import DatumSnapOptions from './DatumSnapOptions'
import DatumFocusPointDeterminationMode from './DatumFocusPointDeterminationMode'
import UnfocusedPositionedDatum from './UnfocusedPositionedDatum'
import DatumFocusPoint from './DatumFocusPoint'

/**
 * Options for the Graph
 */
export type Options = {
  series: { [seriesKey: string]: Datum[] }
  datumFocusPointDeterminationMode?: DatumFocusPointDeterminationMode | ((datum: UnfocusedPositionedDatum) => DatumFocusPoint),
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
  datumHighlightOptions?: DatumHighlightOptions
  datumSnapOptions?: DatumSnapOptions
}

export default Options
