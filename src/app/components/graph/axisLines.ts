import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxisGeometry from './types/AxisGeometry'
import { getXAxisYPosition, getYAxisXPosition } from './drawGraph'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'

const DEFAULT_AXIS_LINE_WIDTH = 2

const getAxisLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisLineWidth
  ?? props.axesLineOptions?.lineWidth
  ?? DEFAULT_AXIS_LINE_WIDTH

const getAxisLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisLineColor
  ?? props.axesLineOptions?.color
  ?? 'black'

export const drawXAxisLine = (ctx: CanvasRenderingContext2D, xAxis: AxisGeometry, yAxis: AxisGeometry, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.X)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const y = getXAxisYPosition(props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation, yAxis.pl, yAxis.pu, yAxis.pOrigin)

  const path = new Path2D()
  path.moveTo(xAxis.pl, y)
  path.lineTo(xAxis.pu, y)
  ctx.stroke(path)
}

export const drawYAxisLine = (ctx: CanvasRenderingContext2D, yAxis: AxisGeometry, xAxis: AxisGeometry, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.Y)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const x = getYAxisXPosition(props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation, xAxis.pl, xAxis.pu, xAxis.pOrigin)

  const path = new Path2D()
  path.moveTo(x, yAxis.pl)
  path.lineTo(x, yAxis.pu)
  ctx.stroke(path)
}
