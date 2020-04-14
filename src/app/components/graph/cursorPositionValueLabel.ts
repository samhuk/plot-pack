import { Options } from './types/Options'
import { Axis2D, Point2D } from '../../common/types/geometry'
import { createTextStyle, measureTextLineHeight, createRoundedRect } from '../../common/helpers/canvas'
import PositionedDatum from './types/PositionedDatum'
import AxisGeometry from './types/AxisGeometry'

const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 12
const DEFAULT_BACKGROUND_COLOR = '#ddd'
const DEFAULT_BORDER_LINE_WIDTH = 1
const DEFAULT_BORDER_COLOR = '#aaa'
const DEFAULT_BORDER_RADIUS = 3
const DEFAULT_PADDING = 5
const DEFAULT_TEXT_COLOR = 'black'

const getCursorPositionValueLabelFont = (props: Options, axis: Axis2D) => createTextStyle(
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.fontFamily ?? DEFAULT_FONT_FAMILY,
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.fontSize ?? DEFAULT_FONT_SIZE,
)

const getCursorPositionValueLabelBorderRadius = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.borderRadius ?? DEFAULT_BORDER_RADIUS
)

const getCursorPositionValueLabelBackgroundColor = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
)

const getCursorPositionValueLabelBorderColor = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.borderColor ?? DEFAULT_BORDER_COLOR
)

const getCursorPositionValueLabelBorderLineWidth = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.borderLineWidth ?? DEFAULT_BORDER_LINE_WIDTH
)

const getCursorPositionValueLabelPadding = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.padding ?? DEFAULT_PADDING
)

const getCursorPositionValueLabelSnapTo = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.snapToNearestDatum
    ?? axis === Axis2D.X
)

const getCursorPositionValueLabelColor = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.color ?? DEFAULT_TEXT_COLOR
)

const drawLabelBackgroundRect = (ctx: CanvasRenderingContext2D, rectPath: Path2D, axis: Axis2D, props: Options) => {
  ctx.fillStyle = getCursorPositionValueLabelBackgroundColor(props, axis)
  ctx.fill(rectPath)
  const borderLineWidth = getCursorPositionValueLabelBorderLineWidth(props, axis)

  if (borderLineWidth <= 0)
    return

  ctx.lineWidth = borderLineWidth
  ctx.strokeStyle = getCursorPositionValueLabelBorderColor(props, axis)
  ctx.stroke(rectPath)
}

export const drawCursorPositionValueLabels = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  nearestDatum: PositionedDatum,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showCursorPositionValueLabel ?? true) {
    const pX = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.X) ? nearestDatum.fpX : cursorPoint.x
    const xAxisText = xAxis.v(pX).toFixed(2)

    const bgRectPaddingPx = getCursorPositionValueLabelPadding(props, Axis2D.X)
    ctx.font = getCursorPositionValueLabelFont(props, Axis2D.X)

    const lineHeight = measureTextLineHeight(ctx)
    const textBoxWidth = ctx.measureText(xAxisText).width
    const bgRectX = pX - textBoxWidth / 2 - bgRectPaddingPx
    const bgRectY = yAxis.pl - lineHeight - 2 * bgRectPaddingPx
    const bgRectWidth = textBoxWidth + 2 * bgRectPaddingPx
    const bgRectHeight = lineHeight + 2 * bgRectPaddingPx
    const bgRectRadius = getCursorPositionValueLabelBorderRadius(props, Axis2D.X)
    const bgRectBorderRadii = [bgRectRadius, bgRectRadius, 0, 0]
    const bgRect = createRoundedRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight, bgRectBorderRadii)
    drawLabelBackgroundRect(ctx, bgRect, Axis2D.X, props)

    // Create label
    ctx.fillStyle = getCursorPositionValueLabelColor(props, Axis2D.X)
    ctx.fillText(xAxisText, pX - textBoxWidth / 2, yAxis.pl - bgRectPaddingPx - 2)
  }
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showCursorPositionValueLabel ?? true) {
    const pY = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.Y) ? nearestDatum.fpY : cursorPoint.y
    const yAxisText = yAxis.v(pY).toFixed(2)

    const bgRectPaddingPx = getCursorPositionValueLabelPadding(props, Axis2D.Y)
    // Set font now early on so we can get the line height to size the bgRect correctly
    ctx.font = getCursorPositionValueLabelFont(props, Axis2D.Y)

    const lineHeight = measureTextLineHeight(ctx)
    // Create background rect
    const textBoxWidth = ctx.measureText(yAxisText).width
    const bgRectX = xAxis.pl
    const bgRectY = pY - lineHeight / 2 - bgRectPaddingPx
    const bgRectWidth = textBoxWidth + 2 * bgRectPaddingPx
    const bgRectHeight = lineHeight + 2 * bgRectPaddingPx
    const bgRectRadius = getCursorPositionValueLabelBorderRadius(props, Axis2D.Y)
    const bgRectBorderRadii = [0, bgRectRadius, 0, bgRectRadius]
    const bgRect = createRoundedRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight, bgRectBorderRadii)
    drawLabelBackgroundRect(ctx, bgRect, Axis2D.Y, props)

    // Create label
    ctx.fillStyle = getCursorPositionValueLabelColor(props, Axis2D.Y)
    ctx.fillText(yAxisText, xAxis.pl + bgRectPaddingPx, pY + lineHeight / 2 - 2)
  }
}
