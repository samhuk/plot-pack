import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import { Axis2D } from '../../common/types/geometry'
import { measureTextLineHeight, createTextStyle } from '../../common/helpers/canvas'
import AxesGeometry from './types/AxesGeometry'

const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 14
const DEFAULT_COLOR = 'black'

const createTextStyleInternal = (props: Options, axis: Axis2D) => createTextStyle(
  props.axesOptions?.[axis]?.labelOptions?.fontFamily
    ?? props.axesLabelOptions?.fontFamily
    ?? DEFAULT_FONT_FAMILY,
  props.axesOptions?.[axis]?.labelOptions?.fontSize
    ?? props.axesLabelOptions?.fontSize
    ?? DEFAULT_FONT_SIZE,
)

const drawAxisLabel = (ctx: CanvasRenderingContext2D, axis: Axis2D, axesGeometry: AxesGeometry, props: Options) => {
  const text = props.axesOptions?.[axis]?.labelText

  if (text == null || text.length === 0)
    return

  const textWidth = ctx.measureText(text).width
  const lineHeight = measureTextLineHeight(ctx)

  const x = axis === Axis2D.X
    ? axesGeometry[Axis2D.X].pl + ((axesGeometry[Axis2D.X].pu - axesGeometry[Axis2D.X].pl) / 2) - (textWidth / 2)
    : axesGeometry[Axis2D.X].pl - 10

  const y = axis === Axis2D.X
    ? axesGeometry[Axis2D.Y].pl + lineHeight + 10
    : axesGeometry[Axis2D.Y].pl + ((axesGeometry[Axis2D.Y].pu - axesGeometry[Axis2D.Y].pl) / 2) + (textWidth / 2)

  ctx.font = createTextStyleInternal(props, axis)
  ctx.fillStyle = props.axesOptions?.[axis]?.labelOptions?.color ?? props.axesLabelOptions?.color ?? DEFAULT_COLOR

  ctx.save()
  ctx.translate(x, y)
  if (axis === Axis2D.Y)
    ctx.rotate(-Math.PI / 2)
  ctx.translate(-x, -y)
  ctx.fillText(text, x, y)
  ctx.restore()
}

export const drawAxesLabels = (ctx: CanvasRenderingContext2D, axesGeometry: AxesGeometry, props: Options) => {
  drawAxisLabel(ctx, Axis2D.X, axesGeometry, props)
  drawAxisLabel(ctx, Axis2D.Y, axesGeometry, props)
}

export default drawAxesLabels
