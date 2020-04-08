import Datum from './Datum'
import AxisOptions from './AxisOptions'
import { Axis2D } from '../../../common/types/geometry'
import MarkerOptions from './MarkerOptions'
import BestFitLineOptions from './BestFitLineOptions'
import DatumFocusMode from './DatumFocusMode'

/**
 * Options for the Graph
 */
export type Options = {
  data: Datum[]
  heightPx: number
  widthPx: number
  axesOptions?: { [axis in Axis2D]?: AxisOptions }
  axesMarkerLabelOptions?: {
    fontFamily?: string
    fontSize?: number
    color?: string
  }
  axesMarkerLineOptions?: {
    width?: number
    color?: string
  }
  axesLineOptions?: {
    width?: number
    color?: string
  }
  gridLineOptions?: {
    width?: number
    color?: string
  }
  lineOptions?: {
    width?: number
    color?: string
  }
  markerOptions?: MarkerOptions
  visibilityOptions?: {
    showAxesMarkerLabels?: boolean
    showAxesMarkerLines?: boolean
    showAxesLines?: boolean
    showGridLines?: boolean
    showMarkers?: boolean
    showLine?: boolean
  }
  bestFitLineOptions?: BestFitLineOptions
  datumFocusMode?: DatumFocusMode
  datumFocusDistanceThresholdPx?: number
}

export default Options
