import { Options } from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import { createTextStyle, measureTextLineHeight, createRoundedRect } from '../../common/helpers/canvas'
import PositionedDatum from './types/PositionedDatum'
import AxisGeometry from './types/AxisGeometry'

const DEFAULT_CURSOR_POSITION_VALUE_LABEL_FONT_FAMILY = 'Helvetica'
const DEFAULT_CURSOR_POSITION_VALUE_LABEL_FONT_SIZE = 12
const DEFAULT_CURSOR_POSITION_VALUE_LABEL_BACKGROUND_COLOR = '#ddd'
const DEFAULT_CURSOR_POSITION_VALUE_LABEL_BORDER_LINE_WIDTH = 1
const DEFAULT_CURSOR_POSITION_VALUE_LABEL_BORDER_COLOR = '#aaa'
const DEFAULT_CURSOR_POSITION_VALUE_LABEL_BORDER_RADIUS = 3
const DEFAULT_CURSOR_POSITION_VALUE_LABEL_PADDING = 5

const getCursorPositionValueLabelFont = (props: Options, axis: Axis2D) => createTextStyle(
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.fontFamily ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_FONT_FAMILY,
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.fontSize ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_FONT_SIZE,
)

const getCursorPositionValueLabelBorderRadius = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.borderRadius ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_BORDER_RADIUS
)

const getCursorPositionValueLabelBackgroundColor = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.backgroundColor ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_BACKGROUND_COLOR
)

const getCursorPositionValueLabelBorderColor = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.borderColor ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_BORDER_COLOR
)

const getCursorPositionValueLabelBorderLineWidth = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.borderLineWidth ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_BORDER_LINE_WIDTH
)

const getCursorPositionValueLabelPadding = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.padding ?? DEFAULT_CURSOR_POSITION_VALUE_LABEL_PADDING
)

const getCursorPositionValueLabelSnapTo = (props: Options, axis: Axis2D, defaultValue: boolean) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.snapToNearestDatum ?? defaultValue
)

export const drawCursorPositionValueLabels = (
  ctx: CanvasRenderingContext2D,
  cursorX: number,
  cursorY: number,
  nearestDatum: PositionedDatum,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  ctx.lineWidth = 1

  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showCursorPositionValueLabel ?? true) {
    const pX = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.X, false) ? nearestDatum.pX : cursorX
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
    const bgRect = createRoundedRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight, bgRectRadius)
    ctx.fillStyle = getCursorPositionValueLabelBackgroundColor(props, Axis2D.X)
    ctx.fill(bgRect)
    ctx.strokeStyle = getCursorPositionValueLabelBorderColor(props, Axis2D.X)
    ctx.lineWidth = getCursorPositionValueLabelBorderLineWidth(props, Axis2D.X)
    ctx.stroke(bgRect)

    // Create label
    ctx.fillStyle = props.axesOptions?.[Axis2D.X]?.cursorPositionValueLabelOptions?.color ?? 'black'
    ctx.fillText(xAxisText, pX - textBoxWidth / 2, yAxis.pl - bgRectPaddingPx - 2)
  }
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showCursorPositionValueLabel ?? true) {
    const pY = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.Y, false) ? nearestDatum.pY : cursorY
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
    const bgRect = createRoundedRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight, bgRectRadius)
    ctx.fillStyle = getCursorPositionValueLabelBackgroundColor(props, Axis2D.Y)
    ctx.fill(bgRect)
    ctx.strokeStyle = getCursorPositionValueLabelBorderColor(props, Axis2D.Y)
    ctx.lineWidth = getCursorPositionValueLabelBorderLineWidth(props, Axis2D.Y)
    ctx.stroke(bgRect)

    // Create label
    ctx.fillStyle = props.axesOptions?.[Axis2D.Y]?.cursorPositionValueLabelOptions?.color ?? 'black'
    ctx.fillText(yAxisText, xAxis.pl + bgRectPaddingPx, pY + lineHeight / 2 - 2)
  }
}
