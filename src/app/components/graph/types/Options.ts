import DataPoint from './DataPoint'
import AxisOptions from './AxisOptions'
import { Axis2D } from '../../../common/types/geometry'
import BestFitLineType from './BestFitLineType'
import MarkerOptions from './MarkerOptions'

/**
 * Options for the Graph
 */
export type Options = {
  data: DataPoint[]
  heightPx: number
  widthPx: number
  axesOptions?: { [axis in Axis2D]?: AxisOptions }
  axesMarkerLabelOptions?: {
    fontFamily?: string
    fontSize?: string
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
  visibilitySettings?: {
    showAxesMarkerLabels?: boolean
    showAxesMarkerLines?: boolean
    showAxesLines?: boolean
    showGridLines?: boolean
    showMarkers?: boolean
    showLine?: boolean
  }
  bestFitLineType?: BestFitLineType
}

export default Options
