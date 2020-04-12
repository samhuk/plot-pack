import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import { Axis2D } from '../../common/types/geometry'
import { measureTextLineHeight, createTextStyle } from '../../common/helpers/canvas'

const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 14
const DEFAULT_COLOR = 'black'

const createTextStyleInternal = (props: Options, axis: Axis2D) => createTextStyle(
  props.axesOptions?.[axis]?.titleOptions?.fontFamily ?? DEFAULT_FONT_FAMILY,
  props.axesOptions?.[axis]?.titleOptions?.fontSize ?? DEFAULT_FONT_SIZE,
)

export const drawAxisTitle = (ctx: CanvasRenderingContext2D, axis: Axis2D, graphGeometry: GraphGeometry, props: Options) => {
  const text = props.axesOptions?.[axis]?.titleOptions?.text

  if (text == null || text.length === 0)
    return

  const textWidth = ctx.measureText(text).width
  const lineHeight = measureTextLineHeight(ctx)

  const x = axis === Axis2D.X
    ? graphGeometry.xAxis.pl + ((graphGeometry.xAxis.pu - graphGeometry.xAxis.pl) / 2) - (textWidth / 2)
    : graphGeometry.xAxis.pl - 10

  const y = axis === Axis2D.X
    ? graphGeometry.yAxis.pl + lineHeight + 10
    : graphGeometry.yAxis.pl + ((graphGeometry.yAxis.pu - graphGeometry.yAxis.pl) / 2) + (textWidth / 2)

  ctx.font = createTextStyleInternal(props, axis)
  ctx.fillStyle = props.axesOptions?.[axis]?.titleOptions?.color ?? DEFAULT_COLOR

  ctx.save()
  ctx.translate(x, y)
  if (axis === Axis2D.Y)
    ctx.rotate(-Math.PI / 2)
  ctx.translate(-x, -y)
  ctx.fillText(text, x, y)
  ctx.restore()
}
