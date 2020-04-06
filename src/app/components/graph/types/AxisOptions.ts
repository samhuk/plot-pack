import Notation from './Notation'
import XAxisOrientation from './xAxisOrientation'
import YAxisOrientation from './yAxisOrientation'

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
  padding?: number
  orientation?: XAxisOrientation | YAxisOrientation
}

export default AxisOptions
