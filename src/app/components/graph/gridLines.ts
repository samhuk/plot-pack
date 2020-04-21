import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'

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
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.X)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
    const x = axesGeometry[Axis2D.X].pl + axesGeometry[Axis2D.X].dpGrid * i
    path.moveTo(x, axesGeometry[Axis2D.Y].pl)
    path.lineTo(x, axesGeometry[Axis2D.Y].pu)
  }
  ctx.stroke(path)
}

export const drawYAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.Y)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
    const y = axesGeometry[Axis2D.Y].pl + axesGeometry[Axis2D.Y].dpGrid * i
    path.moveTo(axesGeometry[Axis2D.X].pl, y)
    path.lineTo(axesGeometry[Axis2D.X].pu, y)
  }
  ctx.stroke(path)
}
