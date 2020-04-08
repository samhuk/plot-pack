import { Options } from './types/Options'
import PositionedDatum from './types/PositionedDatum'
import AxisGeometry from './types/AxisGeometry'
import { Axis2D, Point2D } from '../../common/types/geometry'

const DEFAULT_LINE_WIDTH_X = 2
const DEFAULT_LINE_WIDTH_Y = 1
const DEFAULT_COLOR = 'black'
const DEFAULT_DASH_PATTERN_X = [5, 5]
const DEFAULT_DASH_PATTERN_Y: number[] = null

const getCursorPositionLineSnapTo = (props: Options, axis: Axis2D, defaultValue: boolean) => (
  props.axesOptions?.[axis]?.cursorPositionLineOptions?.snapToNearestDatum ?? defaultValue
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
      const yAxisLineY = nearestDatum != null && getCursorPositionLineSnapTo(props, Axis2D.Y, false) ? nearestDatum.pY : cursorPoint.y
      line.moveTo(xAxis.pu, yAxisLineY)
      line.lineTo(xAxis.pl, yAxisLineY)
      return line
    }
    // The vertical line
    case Axis2D.X:
    {
      const line = new Path2D()
      // Snap vertical x-axis line by default
      const xAxisLineX = nearestDatum != null && getCursorPositionLineSnapTo(props, Axis2D.X, true) ? nearestDatum.pX : cursorPoint.x
      line.moveTo(xAxisLineX, yAxis.pu)
      line.lineTo(xAxisLineX, yAxis.pl)
      return line
    }
    default:
      return null
  }
}

const applyDrawOptionsToContext = (ctx: CanvasRenderingContext2D, props: Options, axis: Axis2D) => {
  ctx.lineWidth = props.axesOptions?.[axis]?.cursorPositionLineOptions?.lineWidth ?? (
    axis === Axis2D.X ? DEFAULT_LINE_WIDTH_X : DEFAULT_LINE_WIDTH_Y
  )
  ctx.strokeStyle = props.axesOptions?.[axis]?.cursorPositionLineOptions?.color ?? DEFAULT_COLOR
  const dashPattern = props.axesOptions?.[axis]?.cursorPositionLineOptions?.dashPattern ?? DEFAULT_DASH_PATTERN_Y ?? (
    axis === Axis2D.X ? DEFAULT_DASH_PATTERN_X : DEFAULT_DASH_PATTERN_Y
  ) ?? []
  ctx.setLineDash(dashPattern)
}

export const drawCursorPositionLines = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  nearestDatum: PositionedDatum,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showCursorPositionLine ?? false) {
    const line = createCursorLinePath(Axis2D.Y, cursorPoint, xAxis, yAxis, nearestDatum, props)
    applyDrawOptionsToContext(ctx, props, Axis2D.Y)
    ctx.stroke(line)
  }

  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showCursorPositionLine ?? false) {
    const line = createCursorLinePath(Axis2D.X, cursorPoint, xAxis, yAxis, nearestDatum, props)
    applyDrawOptionsToContext(ctx, props, Axis2D.X)
    ctx.stroke(line)
  }

  ctx.setLineDash([])
}
