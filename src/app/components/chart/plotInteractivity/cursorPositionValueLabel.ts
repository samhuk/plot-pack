import { Options } from '../types/Options'
import { Axis2D, Corners2DOptional, Point2D, Rect } from '../../../common/types/geometry'
import ProcessedDatum from '../types/ProcessedDatum'
import AxesGeometry from '../types/AxesGeometry'
import { formatNumber } from '../plotBase/components/axisMarkerLabels'
import { CanvasDrawer, RoundedRectOptions } from '../../../common/drawer/types'
import { FillOptions, LineOptions, TextOptions } from '../../../common/types/canvas'

const DEFAULT_PADDING = 5
const DEFAULT_TEXT_OPTIONS: TextOptions = {
  color: 'black',
  fontFamily: 'Helvetica',
  fontSize: 12,
}
const DEFAULT_BORDER_FILL_OPTIONS: FillOptions = { color: '#ddd', opacity: 1 }
const DEFAULT_BORDER_LINE_OPTIONS: LineOptions = { color: '#aaa', lineWidth: 1, dashPattern: [] }
const DEFAULT_BORDER_RADII: Corners2DOptional<number> = { topLeft: 3, topRight: 3 }

const parseRoundedRectOptions = (boundBoxOptions: RoundedRectOptions): RoundedRectOptions => ({
  ...boundBoxOptions,
  stroke: boundBoxOptions?.stroke ?? true,
  fill: boundBoxOptions?.fill ?? true,
  fillOptions: {
    color: boundBoxOptions?.fillOptions?.color ?? DEFAULT_BORDER_FILL_OPTIONS.color,
    opacity: boundBoxOptions?.fillOptions?.opacity ?? DEFAULT_BORDER_FILL_OPTIONS.opacity,
  },
  borderColor: boundBoxOptions?.borderColor ?? DEFAULT_BORDER_LINE_OPTIONS.color,
  borderDashPattern: boundBoxOptions?.borderDashPattern ?? DEFAULT_BORDER_LINE_OPTIONS.dashPattern,
  borderLineWidth: boundBoxOptions?.borderLineWidth ?? DEFAULT_BORDER_LINE_OPTIONS.lineWidth,
  borderRadii: boundBoxOptions?.borderRadii ?? DEFAULT_BORDER_RADII,
})

const getCursorPositionValueLabelTextOptions = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.textOptions
)

const getCursorPositionValueLabelPadding = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.padding ?? DEFAULT_PADDING
)

const getCursorPositionValueLabelSnapTo = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.snapToNearestDatum
    ?? axis === Axis2D.X
)

const getCursorPositionValueLabelRectOptions = (props: Options, axis: Axis2D) => (
  parseRoundedRectOptions(props.axesOptions?.[axis]?.cursorPositionValueLabelOptions?.rectOptions)
)

export const getShouldDrawCursorPositionValueLabel = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showCursorPositionValueLabel ?? true
)

const drawXAxisCursorPositionValueLabel = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  nearestDatum: ProcessedDatum,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const pX = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.X) ? nearestDatum.fpX : cursorPoint.x
  const xAxisText = formatNumber(axesGeometry[Axis2D.X].v(pX), props, Axis2D.X)

  const bgRectPaddingPx = getCursorPositionValueLabelPadding(props, Axis2D.X)

  // Set font now early on so we can get the line height to size the bgRect correctly
  const textOptions = getCursorPositionValueLabelTextOptions(props, Axis2D.X)
  drawer.applyTextOptions(textOptions, DEFAULT_TEXT_OPTIONS)
  const lineHeight = drawer.measureTextHeight()

  const textBoxWidth = drawer.measureTextWidth(xAxisText)
  const bgRectX = pX - textBoxWidth / 2 - bgRectPaddingPx
  const bgRectY = axesGeometry[Axis2D.Y].pl - lineHeight - 2 * bgRectPaddingPx
  const bgRectWidth = textBoxWidth + 2 * bgRectPaddingPx
  const bgRectHeight = lineHeight + 2 * bgRectPaddingPx

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
  drawer.roundedRect(bgRect, getCursorPositionValueLabelRectOptions(props, Axis2D.X))

  // Create label
  drawer.text(xAxisText, {
    x: correctedBgRectX + bgRectPaddingPx,
    y: axesGeometry[Axis2D.Y].pl - bgRectPaddingPx - drawer.measureTextHeight(xAxisText) - 2,
  }, null, textOptions, DEFAULT_TEXT_OPTIONS)
}

const drawYAxisCursorPositionValueLabel = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  nearestDatum: ProcessedDatum,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const pY = nearestDatum != null && getCursorPositionValueLabelSnapTo(props, Axis2D.Y) ? nearestDatum.fpY : cursorPoint.y
  const yAxisText = axesGeometry[Axis2D.Y].v(pY).toFixed(2)

  const bgRectPaddingPx = getCursorPositionValueLabelPadding(props, Axis2D.Y)

  // Set font now early on so we can get the line height to size the bgRect correctly
  const textOptions = getCursorPositionValueLabelTextOptions(props, Axis2D.Y)
  drawer.applyTextOptions(textOptions, DEFAULT_TEXT_OPTIONS)
  const lineHeight = drawer.measureTextHeight()

  // Create background rect
  const textBoxWidth = drawer.measureTextWidth(yAxisText)
  const bgRectX = axesGeometry[Axis2D.X].pl
  const bgRectY = pY - lineHeight / 2 - bgRectPaddingPx
  const bgRectWidth = textBoxWidth + 2 * bgRectPaddingPx
  const bgRectHeight = lineHeight + 2 * bgRectPaddingPx

  const bgRectYTopOverrunFromAxes = Math.max(0, axesGeometry[Axis2D.Y].pu - bgRectY)
  const bgRectYBottomOverrunFromAxes = Math.max(0, bgRectY + bgRectHeight - axesGeometry[Axis2D.Y].pl)

  // Correct y position of bg rect if it overruns the axes
  let correctedBgRectY = bgRectY
  if (bgRectYTopOverrunFromAxes > 0 && bgRectYBottomOverrunFromAxes === 0)
    correctedBgRectY = axesGeometry[Axis2D.Y].pu
  else if (bgRectYBottomOverrunFromAxes > 0 && bgRectYTopOverrunFromAxes === 0)
    correctedBgRectY = axesGeometry[Axis2D.Y].pl - bgRectHeight
  else if (bgRectYTopOverrunFromAxes > 0 && bgRectYBottomOverrunFromAxes > 0)
    correctedBgRectY = ((axesGeometry[Axis2D.Y].pl - axesGeometry[Axis2D.Y].pu) / 2) - (bgRectY / 2)

  const bgRect: Rect = { x: bgRectX, y: correctedBgRectY, width: bgRectWidth, height: bgRectHeight }
  drawer.roundedRect(bgRect, getCursorPositionValueLabelRectOptions(props, Axis2D.Y))

  // Draw label
  drawer.text(yAxisText, {
    x: axesGeometry[Axis2D.X].pl + bgRectPaddingPx,
    y: correctedBgRectY + bgRectPaddingPx,
  }, null, textOptions, DEFAULT_TEXT_OPTIONS)
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
