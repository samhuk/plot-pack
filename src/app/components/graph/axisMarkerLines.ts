import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'
import { determineXAxisMarkerPositioning, determineYAxisMarkerPositioning } from './axisMarkerPositioning'
import XAxisMarkerOrientation from './types/XAxixMarkerOrientation'
import YAxisMarkerOrientation from './types/YAxisMarkerOrientation'
import { applyLineOptionsToContext } from '../../common/helpers/canvas'

const DEFAULT_MARKER_LINE_WIDTH = 3
const DEFAULT_MARKER_LINE_LENGTH = 5
const DEFAULT_MARKER_LINE_COLOR = 'black'

export const getMarkerLineLength = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.markerLineOptions?.length
  ?? DEFAULT_MARKER_LINE_LENGTH

export const drawXAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const shouldDraw = applyLineOptionsToContext(ctx, props?.axesOptions?.[Axis2D.X]?.markerLineOptions, DEFAULT_MARKER_LINE_WIDTH, DEFAULT_MARKER_LINE_COLOR)
  if (!shouldDraw)
    return

  const y = axesGeometry[Axis2D.X].orthogonalScreenPosition
  const markerLength = getMarkerLineLength(props, Axis2D.X)

  const markerPosition = props.axesOptions?.[Axis2D.X]?.markerOrientation as XAxisMarkerOrientation
  const { shouldPlaceBelow } = determineXAxisMarkerPositioning(axesGeometry, markerPosition)
  const markerEndY = y + (shouldPlaceBelow ? 1 : -1) * markerLength

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
    const x = axesGeometry[Axis2D.X].pl + axesGeometry[Axis2D.X].dpGrid * i
    path.moveTo(x, y)
    path.lineTo(x, markerEndY)
  }
  ctx.stroke(path)
}

export const drawYAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const shouldDraw = applyLineOptionsToContext(ctx, props?.axesOptions?.[Axis2D.Y]?.markerLineOptions, DEFAULT_MARKER_LINE_WIDTH, DEFAULT_MARKER_LINE_COLOR)
  if (!shouldDraw)
    return

  const x = axesGeometry[Axis2D.Y].orthogonalScreenPosition
  const markerLength = getMarkerLineLength(props, Axis2D.Y)

  const markerPosition = props.axesOptions?.[Axis2D.Y]?.markerOrientation as YAxisMarkerOrientation
  const { shouldPlaceLeft } = determineYAxisMarkerPositioning(axesGeometry, markerPosition)
  const markerEndX = x + (shouldPlaceLeft ? -1 : 1) * markerLength

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
    const y = axesGeometry[Axis2D.Y].pl + axesGeometry[Axis2D.Y].dpGrid * i
    path.moveTo(x, y)
    path.lineTo(markerEndX, y)
  }
  ctx.stroke(path)
}
