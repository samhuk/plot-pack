import { Options } from './types/Options'
import PositionedDatum from './types/PositionedDatum'
import { Axis2D, Point2D } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'
import { applyLineOptionsToContext } from '../../common/helpers/canvas'

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
  axesGeometry: AxesGeometry,
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
      const yAxisLineY = nearestDatum != null && shouldSnapLine ? nearestDatum.fpY : cursorPoint.y
      line.moveTo(axesGeometry[Axis2D.X].pu, yAxisLineY)
      line.lineTo(axesGeometry[Axis2D.X].pl, yAxisLineY)
      return line
    }
    // The vertical line
    case Axis2D.X:
    {
      const line = new Path2D()
      // Snap vertical x-axis line by default
      const shouldSnapLine = getShouldSnapCursorPositionLine(props, Axis2D.X)
      const xAxisLineX = nearestDatum != null && shouldSnapLine ? nearestDatum.fpX : cursorPoint.x
      line.moveTo(xAxisLineX, axesGeometry[Axis2D.Y].pu)
      line.lineTo(xAxisLineX, axesGeometry[Axis2D.Y].pl)
      return line
    }
    default:
      return null
  }
}

export const getShouldDrawCursorPositionLine = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showCursorPositionLine ?? true
)

export const drawCursorPositionLine = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  nearestDatum: PositionedDatum,
  axesGeometry: AxesGeometry,
  axis: Axis2D,
  props: Options,
) => {
  const line = createCursorLinePath(axis, cursorPoint, axesGeometry, nearestDatum, props)
  applyLineOptionsToContext(
    ctx,
    props.axesOptions?.[axis]?.cursorPositionLineOptions,
    axis === Axis2D.X ? DEFAULT_LINE_WIDTH_X : DEFAULT_LINE_WIDTH_Y,
    DEFAULT_COLOR,
    axis === Axis2D.X ? DEFAULT_DASH_PATTERN_X : DEFAULT_DASH_PATTERN_Y,
  )
  ctx.stroke(line)
}
