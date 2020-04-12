import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxisGeometry from './types/AxisGeometry'

const DEFAULT_GRID_LINE_WIDTH = 0.5
const DEFAULT_GRID_LINE_COLOR = 'black'

const getGridLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.gridLineWidth
  ?? props.gridLineOptions?.lineWidth
  ?? DEFAULT_GRID_LINE_WIDTH

const getGridLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.gridLineColor
  ?? props.gridLineOptions?.color
  ?? DEFAULT_GRID_LINE_COLOR

export const drawXAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.X)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < xAxis.numGridLines; i += 1) {
    const x = xAxis.pl + xAxis.dpGrid * i
    path.moveTo(x, yAxis.pl)
    path.lineTo(x, yAxis.pu)
  }
  ctx.stroke(path)
}

export const drawYAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  yAxis: AxisGeometry,
  xAxis: AxisGeometry,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.Y)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < yAxis.numGridLines; i += 1) {
    const y = yAxis.pl + yAxis.dpGrid * i
    path.moveTo(xAxis.pl, y)
    path.lineTo(xAxis.pu, y)
  }
  ctx.stroke(path)
}
