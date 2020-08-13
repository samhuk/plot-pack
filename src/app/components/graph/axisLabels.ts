import Options from './types/Options'
import { Axis2D, Rect } from '../../common/types/geometry'
import { measureTextLineHeight, applyTextOptionsToContext } from '../../common/helpers/canvas'
import { CanvasDrawer } from '../../common/drawer/types'

const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 14
const DEFAULT_COLOR = 'black'

const DEFAULT_EXTERIOR_MARGIN = 15

export const getAxisLabelText = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.labelText

export const getExteriorMargin = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.labelOptions?.exteriorMargin ?? DEFAULT_EXTERIOR_MARGIN

const drawAxisLabel = (drawer: CanvasDrawer, textRect: Rect, axis: Axis2D, props: Options) => {
  const text = getAxisLabelText(props, axis)

  if (text == null || text.length === 0)
    return

  const ctx = drawer.getRenderingContext()

  // Set font early to get accurate text measurement
  applyTextOptionsToContext(ctx, props.axesOptions?.[axis]?.labelOptions, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_COLOR)

  const lineHeight = measureTextLineHeight(ctx)

  const { x } = textRect
  const y = textRect.y + (axis === Axis2D.Y ? textRect.height : 0)

  ctx.save()
  ctx.translate(x, y)
  if (axis === Axis2D.Y)
    ctx.rotate(-Math.PI / 2)
  ctx.translate(-x, -y)
  ctx.fillText(text, x, y + lineHeight)
  ctx.restore()
}

export const drawAxesLabels = (drawer: CanvasDrawer, xAxisLabelTextRect: Rect, yAxisLabelTextRect: Rect, props: Options) => {
  drawAxisLabel(drawer, xAxisLabelTextRect, Axis2D.X, props)
  drawAxisLabel(drawer, yAxisLabelTextRect, Axis2D.Y, props)
}

export default drawAxesLabels
