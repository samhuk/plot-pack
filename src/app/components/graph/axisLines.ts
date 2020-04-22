import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'

const DEFAULT_AXIS_LINE_WIDTH = 2

const getAxisLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisLineWidth
  ?? props.axesLineOptions?.lineWidth
  ?? DEFAULT_AXIS_LINE_WIDTH

const getAxisLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisLineColor
  ?? props.axesLineOptions?.color
  ?? 'black'

export const drawXAxisLine = (ctx: CanvasRenderingContext2D, axesGeometry: AxesGeometry, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.X)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const y = axesGeometry[Axis2D.X].orthogonalScreenPosition

  const path = new Path2D()
  path.moveTo(axesGeometry[Axis2D.X].pl, y)
  path.lineTo(axesGeometry[Axis2D.X].pu, y)
  ctx.stroke(path)
}

export const drawYAxisLine = (ctx: CanvasRenderingContext2D, axesGeometry: AxesGeometry, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.Y)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const x = axesGeometry[Axis2D.Y].orthogonalScreenPosition

  const path = new Path2D()
  path.moveTo(x, axesGeometry[Axis2D.Y].pl)
  path.lineTo(x, axesGeometry[Axis2D.Y].pu)
  ctx.stroke(path)
}
