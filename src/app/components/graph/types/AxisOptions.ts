import Notation from './Notation'
import XAxisOrientation from './xAxisOrientation'
import YAxisOrientation from './yAxisOrientation'
import AxisVisibilityOptions from './AxisVisibilityOptions'
import TextOptions from './TextOptions'
import Bound from './Bound'
import XAxisMarkerOrientation from './XAxixMarkerOrientation'
import YAxisMarkerOrientation from './YAxisMarkerOrientation'

/**
 * Options to customize the rendering and behavior of an axis.
 */
export type AxisOptions = {
  labelText?: string
  axisMargin?: number
  labelOptions?: TextOptions & {
    exteriorMargin?: number
  }
  dvGrid?: number
  valueBound?: Bound
  notation?: Notation
  numFigures?: number
  axisLineWidth?: number
  axisLineColor?: string
  gridLineWidth?: number
  gridLineColor?: string
  axisMarkerLabelFontFamily?: string
  axisMarkerLabelFontSize?: number
  axisMarkerLabelColor?: string
  axisMarkerLineWidth?: number
  axisMarkerLineColor?: string
  axisMarkerLineLength?: number
  axisMarkerOrientation?: XAxisMarkerOrientation | YAxisMarkerOrientation
  visibilityOptions?: AxisVisibilityOptions
  padding?: number
  orientation?: XAxisOrientation | YAxisOrientation
  cursorPositionLineOptions?: {
    snapToNearestDatum?: boolean
    lineWidth?: number
    color?: string
    dashPattern?: number[]
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
