import { Options } from './types/Options'
import PositionedDatum from './types/PositionedDatum'
import AxisGeometry from './types/AxisGeometry'
import { Axis2D, Point2D } from '../../common/types/geometry'

const DEFAULT_LINE_WIDTH_X = 2
const DEFAULT_LINE_WIDTH_Y = 1
const DEFAULT_COLOR = 'grey'
const DEFAULT_DASH_PATTERN_X = [5, 5]
const DEFAULT_DASH_PATTERN_Y: number[] = []
const DEFAULT_SHOUD_SNAP_CURSOR_LINE_X = true
const DEFAULT_SHOUD_SNAP_CURSOR_LINE_Y = false

const getShouldSnapCursorPositionLine = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.cursorPositionLineOptions?.snapToNearestDatum ?? (
    axis === Axis2D.X ? DEFAULT_SHOUD_SNAP_CURSOR_LINE_X : DEFAULT_SHOUD_SNAP_CURSOR_LINE_Y
  )
)

const createCursorLinePath = (
  axis: Axis2D,
  cursorPoint: Point2D,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  nearestDatum: PositionedDatum,
  props: Options,
) => {
  switch (axis) {
    // The horizontal line
    case Axis2D.Y:
    {
      const line = new Path2D()
      // Don't snap horizontal y-axis line by default
      const shouldSnapLine = getShouldSnapCursorPositionLine(props, Axis2D.Y)
      const yAxisLineY = nearestDatum != null && shouldSnapLine ? nearestDatum.pY : cursorPoint.y
      line.moveTo(xAxis.pu, yAxisLineY)
      line.lineTo(xAxis.pl, yAxisLineY)
      return line
    }
    // The vertical line
    case Axis2D.X:
    {
      const line = new Path2D()
      // Snap vertical x-axis line by default
      const shouldSnapLine = getShouldSnapCursorPositionLine(props, Axis2D.X)
      const xAxisLineX = nearestDatum != null && shouldSnapLine ? nearestDatum.pX : cursorPoint.x
      line.moveTo(xAxisLineX, yAxis.pu)
      line.lineTo(xAxisLineX, yAxis.pl)
      return line
    }
    default:
      return null
  }
}

const applyDrawOptionsToContext = (ctx: CanvasRenderingContext2D, props: Options, axis: Axis2D) => {
  const lineWidth = props.axesOptions?.[axis]?.cursorPositionLineOptions?.lineWidth
    ?? (axis === Axis2D.X ? DEFAULT_LINE_WIDTH_X : DEFAULT_LINE_WIDTH_Y)
  const lineDashPattern = props.axesOptions?.[axis]?.cursorPositionLineOptions?.dashPattern
    ?? (axis === Axis2D.X ? DEFAULT_DASH_PATTERN_X : DEFAULT_DASH_PATTERN_Y)
  const lineColor = props.axesOptions?.[axis]?.cursorPositionLineOptions?.color
    ?? DEFAULT_COLOR
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = lineColor
  ctx.setLineDash(lineDashPattern)
}

const getShouldDrawCursorPositionLine = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showCursorPositionLine ?? true
)

export const drawCursorPositionLine = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  nearestDatum: PositionedDatum,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  axis: Axis2D,
  props: Options,
) => {
  const line = createCursorLinePath(axis, cursorPoint, xAxis, yAxis, nearestDatum, props)
  applyDrawOptionsToContext(ctx, props, axis)
  ctx.stroke(line)
}

export const drawCursorPositionLines = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  nearestDatum: PositionedDatum,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  if (getShouldDrawCursorPositionLine(props, Axis2D.X))
    drawCursorPositionLine(ctx, cursorPoint, nearestDatum, xAxis, yAxis, Axis2D.X, props)

  if (getShouldDrawCursorPositionLine(props, Axis2D.Y))
    drawCursorPositionLine(ctx, cursorPoint, nearestDatum, xAxis, yAxis, Axis2D.Y, props)

  ctx.setLineDash([])
}
