import Notation from './Notation'
import XAxisOrientation from './xAxisOrientation'
import YAxisOrientation from './yAxisOrientation'
import AxisVisibilityOptions from './AxisVisibilityOptions'

export type AxisOptions = {
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
  visibilityOptions?: AxisVisibilityOptions
  padding?: number
  orientation?: XAxisOrientation | YAxisOrientation
  snapCursorLineToNearestDatum?: boolean
  cursorLineLineWidth?: number
  cursorLineColor?: string
}

export default AxisOptions
