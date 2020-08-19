import Datum from './Datum'
import AxisOptions from './AxisOptions'
import { Axis2D } from '../../../common/types/geometry'
import MarkerOptions from './MarkerOptions'
import BestFitLineOptions from './BestFitLineOptions'
import SeriesOptions from './SeriesOptions'
import { TextOptions, LineOptions } from '../../../common/types/canvas'
import VisibilityOptions from './VisibilityOptions'
import TooltipOptions from './TooltipOptions'
import DatumHighlightOptions from './DatumHighlightOptions'
import DatumSnapOptions from './DatumSnapOptions'
import DatumFocusPointDeterminationMode from './DatumFocusPointDeterminationMode'
import DatumValueFocusPoint from './DatumValueFocusPoint'
import ErrorBarsOptions from './ErrorBarsOptions'
import NavigatorOptions from './NavigatorOptions'
import TitleOptions from './TitleOptions'
import { InputMargin } from '../../../common/canvasFlex/types'

/**
 * Options for the Graph
 */
export type CommonOptions = {
  title?: string
  titleOptions?: TitleOptions
  graphMargin?: InputMargin
  series: { [seriesKey: string]: Datum[] }
  datumFocusPointDeterminationMode?: DatumFocusPointDeterminationMode | ((datum: Datum) => DatumValueFocusPoint)
  backgroundColor?: string
  seriesOptions?: { [seriesKey: string]: SeriesOptions }
  axesOptions?: { [axis in Axis2D]?: AxisOptions }
  axesLabelOptions?: TextOptions
  tooltipOptions?: TooltipOptions
  connectingLineOptions?: LineOptions
  markerOptions?: MarkerOptions
  errorBarsOptions?: { [axis in Axis2D]?: ErrorBarsOptions }
  visibilityOptions?: VisibilityOptions
  bestFitLineOptions?: BestFitLineOptions
  datumHighlightOptions?: DatumHighlightOptions
  datumSnapOptions?: DatumSnapOptions
  navigatorOptions?: NavigatorOptions
}

export default CommonOptions
