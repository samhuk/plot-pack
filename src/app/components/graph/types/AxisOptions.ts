import Notation from './Notation'
import XAxisOrientation from './xAxisOrientation'

export type AxisOptions = {
  notation?: Notation
  numFigures?: number
  axisLineWidth?: number
  axisLineColor?: string
  gridLineWidth?: number
  gridLineColor?: string
  axisMarkerLabelFontFamily?: string
  axisMarkerLabelFontSize?: number
  axisMarkerLineWidth?: number
  axisMarkerLineColor?: string
  padding?: number
  orientation?: XAxisOrientation
}

export default AxisOptions
