import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'
import { applyLineOptionsToContext } from '../../common/helpers/canvas'

const DEFAULT_GRID_LINE_WIDTH = 0.5
const DEFAULT_GRID_LINE_COLOR = 'black'

export const getShouldShowAxisGridLines = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showGridLines
    ?? props.visibilityOptions?.showGridLines
    ?? true
)

export const drawXAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const shouldDraw = applyLineOptionsToContext(ctx, props.axesOptions?.[Axis2D.X]?.gridLineOptions, DEFAULT_GRID_LINE_WIDTH, DEFAULT_GRID_LINE_COLOR)
  if (!shouldDraw)
    return

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
  const shouldDraw = applyLineOptionsToContext(ctx, props.axesOptions?.[Axis2D.Y]?.gridLineOptions, DEFAULT_GRID_LINE_WIDTH, DEFAULT_GRID_LINE_COLOR)
  if (!shouldDraw)
    return

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
    const y = axesGeometry[Axis2D.Y].pl + axesGeometry[Axis2D.Y].dpGrid * i
    path.moveTo(axesGeometry[Axis2D.X].pl, y)
    path.lineTo(axesGeometry[Axis2D.X].pu, y)
  }
  ctx.stroke(path)
}
