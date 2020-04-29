import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'
import { applyLineOptionsToContext } from '../../common/helpers/canvas'

const DEFAULT_LINE_WIDTH = 2
const DEFAULT_COLOR = 'black'

export const drawXAxisLine = (ctx: CanvasRenderingContext2D, axesGeometry: AxesGeometry, props: Options) => {
  applyLineOptionsToContext(ctx, props.axesOptions?.[Axis2D.X]?.lineOptions, DEFAULT_LINE_WIDTH, DEFAULT_COLOR)

  const y = axesGeometry[Axis2D.X].orthogonalScreenPosition

  const path = new Path2D()
  path.moveTo(axesGeometry[Axis2D.X].pl, y)
  path.lineTo(axesGeometry[Axis2D.X].pu, y)
  ctx.stroke(path)
}

export const drawYAxisLine = (ctx: CanvasRenderingContext2D, axesGeometry: AxesGeometry, props: Options) => {
  applyLineOptionsToContext(ctx, props.axesOptions?.[Axis2D.Y]?.lineOptions, DEFAULT_LINE_WIDTH, DEFAULT_COLOR)

  const x = axesGeometry[Axis2D.Y].orthogonalScreenPosition

  const path = new Path2D()
  path.moveTo(x, axesGeometry[Axis2D.Y].pl)
  path.lineTo(x, axesGeometry[Axis2D.Y].pu)
  ctx.stroke(path)
}
