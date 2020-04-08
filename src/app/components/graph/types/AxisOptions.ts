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
  snapCursorPositionLineToNearestDatum?: boolean
  snapCursorPositionValueToNearestDatum?: boolean
  cursorPositionLineLineWidth?: number
  cursorPositionLineColor?: string
  cursorPositionValueLabelOptions?: {
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
