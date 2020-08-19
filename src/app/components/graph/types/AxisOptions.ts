import { NumberFormatNotation } from '../../../common/types/math'
import XAxisOrientation from './xAxisOrientation'
import YAxisOrientation from './yAxisOrientation'
import AxisVisibilityOptions from './AxisVisibilityOptions'
import { TextOptions, LineOptions } from '../../../common/types/canvas'
import Bound from './Bound'
import XAxisMarkerOrientation from './XAxixMarkerOrientation'
import YAxisMarkerOrientation from './YAxisMarkerOrientation'
import AxisMarkerLineOptions from './AxisMarkerLineOptions'
import AxesLabelOptions from './AxesLabelOptions'

/**
 * Options to customize the rendering and behavior of an axis.
 */
export type AxisOptions = {
  labelText?: string
  labelOptions?: AxesLabelOptions
  dvGrid?: number
  valueBound?: Bound
  notation?: NumberFormatNotation
  numFigures?: number
  lineOptions?: LineOptions
  gridLineOptions?: LineOptions
  markerLabelOptions?: TextOptions
  markerLineOptions?: AxisMarkerLineOptions
  markerOrientation?: XAxisMarkerOrientation | YAxisMarkerOrientation
  visibilityOptions?: AxisVisibilityOptions
  padding?: number
  orientation?: XAxisOrientation | YAxisOrientation
  cursorPositionLineOptions?: LineOptions & {
    snapToNearestDatum?: boolean
  }
  cursorPositionValueLabelOptions?: {
    snapToNearestDatum?: boolean
    fontFamily?: string
    fontSize?: number
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderLineWidth?: number
    borderRadius?: number
    padding?: number
  }
}

export default AxisOptions
