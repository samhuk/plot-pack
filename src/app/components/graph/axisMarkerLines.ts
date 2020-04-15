import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxisGeometry from './types/AxisGeometry'
import { getXAxisYPosition, getYAxisXPosition } from './drawGraph'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'

const DEFAULT_MARKER_LINE_WIDTH = 3

const getMarkerLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLineWidth
  ?? props.axesMarkerLineOptions?.lineWidth
  ?? DEFAULT_MARKER_LINE_WIDTH

const getMarkerLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLineColor
  ?? props.axesMarkerLineOptions?.color
  ?? 'black'

export const drawXAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.X)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.X)

  const y = getXAxisYPosition(props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation, yAxis.pl, yAxis.pu, yAxis.pOrigin)

  const path = new Path2D()
  for (let i = 0; i < xAxis.numGridLines; i += 1) {
    const x = xAxis.pl + xAxis.dpGrid * i
    path.moveTo(x, y)
    path.lineTo(x, y + 5)
  }
  ctx.stroke(path)
}

export const drawYAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  yAxis: AxisGeometry,
  xAxis: AxisGeometry,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.Y)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.Y)

  const x = getYAxisXPosition(props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation, xAxis.pl, xAxis.pu, xAxis.pOrigin)

  const path = new Path2D()
  for (let i = 0; i < yAxis.numGridLines; i += 1) {
    path.moveTo(x, yAxis.pl + yAxis.dpGrid * i)
    path.lineTo(x - 5, yAxis.pl + yAxis.dpGrid * i)
  }
  ctx.stroke(path)
}
