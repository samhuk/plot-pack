import { Options } from '../types/Options'
import { Axis2D, Point2D, Rect } from '../../../common/types/geometry'
import { createTextStyle, measureTextLineHeight, createRoundedRect } from '../../../common/helpers/canvas'
import ProcessedDatum from '../types/ProcessedDatum'
import AxesGeometry from '../types/AxesGeometry'
import { formatNumber } from '../plotBase/components/axisMarkerLabels'
import { CanvasDrawer } from '../../../common/drawer/types'

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

export const getShouldDrawCursorPositionValueLabel = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showCursorPositionValueLabel ?? true
)

const drawLabelBackgroundRect = (ctx: CanvasRenderingContext2D, rectPath: Path2D, axis: Axis2D, props: Options) => {
  ctx.fillStyle = getCursorPositionValueLabelBackgroundColor(props, axis)
  ctx.fill(rectPath)
  const borderLineWidth = getCursorPositionValueLabelBorderLineWidth(props, axis)

  if (borderLineWidth <= 0)
    return

  ctx.lineWidth = borderLineWidth
  ctx.strokeStyle = getCursorPositionValueLabelBorderColor(props, axis)
  ctx.setLineDash([])
  ctx.stroke(rectPath)
}

const drawXAxisCursorPositionValueLabel = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  nearestDatum: ProcessedDatum,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const ctx = drawer.getRenderingContext()

  const pX = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.X) ? nearestDatum.fpX : cursorPoint.x
  const xAxisText = formatNumber(axesGeometry[Axis2D.X].v(pX), props, Axis2D.X)

  const bgRectPaddingPx = getCursorPositionValueLabelPadding(props, Axis2D.X)
  ctx.font = getCursorPositionValueLabelFont(props, Axis2D.X)

  const lineHeight = measureTextLineHeight(ctx)
  const textBoxWidth = drawer.measureTextWidth(xAxisText)
  const bgRectX = pX - textBoxWidth / 2 - bgRectPaddingPx
  const bgRectY = axesGeometry[Axis2D.Y].pl - lineHeight - 2 * bgRectPaddingPx
  const bgRectWidth = textBoxWidth + 2 * bgRectPaddingPx
  const bgRectHeight = lineHeight + 2 * bgRectPaddingPx
  const bgRectRadius = getCursorPositionValueLabelBorderRadius(props, Axis2D.X)

  const bgRectXRightOverrunFromAxes = Math.max(0, bgRectX + bgRectWidth - axesGeometry[Axis2D.X].pu)
  const bgRectXLeftOverrunFromAxes = Math.max(0, axesGeometry[Axis2D.X].pl - bgRectX)

  // Correct x position of bg rect if it overruns the axes
  let correctedBgRectX = bgRectX
  if (bgRectXLeftOverrunFromAxes > 0 && bgRectXRightOverrunFromAxes === 0)
    correctedBgRectX = axesGeometry[Axis2D.X].pl
  else if (bgRectXRightOverrunFromAxes > 0 && bgRectXLeftOverrunFromAxes === 0)
    correctedBgRectX = axesGeometry[Axis2D.X].pu - bgRectWidth
  else if (bgRectXRightOverrunFromAxes > 0 && bgRectXLeftOverrunFromAxes > 0)
    correctedBgRectX = ((axesGeometry[Axis2D.X].pu - axesGeometry[Axis2D.X].pl) / 2) - (bgRectX / 2)

  const bgRect: Rect = { x: correctedBgRectX, y: bgRectY, width: bgRectWidth, height: bgRectHeight }
  drawer.roundedRectSimple(bgRect, {
    fill: true,
    stroke: true,
    backgroundColor: getCursorPositionValueLabelBackgroundColor(props, Axis2D.X),
    borderLineOptions: {
      color: getCursorPositionValueLabelBorderColor(props, Axis2D.X),
      dashPattern: [],
      lineWidth: getCursorPositionValueLabelBorderLineWidth(props, Axis2D.X),
      radii: { topLeft: bgRectRadius, topRight: bgRectRadius },
    },
  })

  // Create label
  drawer.applyFillOptions({ color: getCursorPositionValueLabelColor(props, Axis2D.X) })
  drawer.text(xAxisText, {
    x: correctedBgRectX + bgRectPaddingPx,
    y: axesGeometry[Axis2D.Y].pl - bgRectPaddingPx - drawer.measureTextHeight(xAxisText) - 2,
  })
}

const drawYAxisCursorPositionValueLabel = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  nearestDatum: ProcessedDatum,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const ctx = drawer.getRenderingContext()

  const pY = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.Y) ? nearestDatum.fpY : cursorPoint.y
  const yAxisText = axesGeometry[Axis2D.Y].v(pY).toFixed(2)

  const bgRectPaddingPx = getCursorPositionValueLabelPadding(props, Axis2D.Y)
  // Set font now early on so we can get the line height to size the bgRect correctly
  ctx.font = getCursorPositionValueLabelFont(props, Axis2D.Y)

  const lineHeight = measureTextLineHeight(ctx)
  // Create background rect
  const textBoxWidth = ctx.measureText(yAxisText).width
  const bgRectX = axesGeometry[Axis2D.X].pl
  const bgRectY = pY - lineHeight / 2 - bgRectPaddingPx
  const bgRectWidth = textBoxWidth + 2 * bgRectPaddingPx
  const bgRectHeight = lineHeight + 2 * bgRectPaddingPx
  const bgRectRadius = getCursorPositionValueLabelBorderRadius(props, Axis2D.Y)
  const bgRectBorderRadii = [0, bgRectRadius, 0, bgRectRadius]
  const bgRect = createRoundedRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight, bgRectBorderRadii)
  drawLabelBackgroundRect(ctx, bgRect, Axis2D.Y, props)

  // Create label
  ctx.fillStyle = getCursorPositionValueLabelColor(props, Axis2D.Y)
  ctx.fillText(yAxisText, axesGeometry[Axis2D.X].pl + bgRectPaddingPx, pY + lineHeight / 2 - 2)
}

export const drawCursorPositionValueLabel = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  nearestDatum: ProcessedDatum,
  axesGeometry: AxesGeometry,
  axis: Axis2D,
  props: Options,
) => {
  if (axis === Axis2D.X)
    drawXAxisCursorPositionValueLabel(drawer, cursorPoint, nearestDatum, axesGeometry, props)
  if (axis === Axis2D.Y)
    drawYAxisCursorPositionValueLabel(drawer, cursorPoint, nearestDatum, axesGeometry, props)
}
