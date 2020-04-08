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
  cursorPositionValueLabelFontFamily?: string
  cursorPositionValueLabelFontSize?: number
  cursorPositionValueLabelColor?: string
  cursorPositionValueLabelBackgroundColor?: string
  cursorPositionValueLabelBorderColor?: string
  cursorPositionValueLabelBorderLineWidth?: number
  cursorPositionValueLabelBorderRadius?: number
}

export default AxisOptions
