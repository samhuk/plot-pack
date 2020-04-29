import Options from './types/Options'
import { Axis2D, Point2D } from '../../common/types/geometry'
import { measureTextWidth, measureTextLineHeight, applyTextOptionsToContext } from '../../common/helpers/canvas'
import { formatNumber as formatNumberMath } from '../../common/helpers/math'
import AxesGeometry from './types/AxesGeometry'
import { getMarkerLineLength } from './axisMarkerLines'
import XAxisMarkerOrientation from './types/XAxixMarkerOrientation'
import YAxisMarkerOrientation from './types/YAxisMarkerOrientation'
import { determineXAxisMarkerPositioning, determineYAxisMarkerPositioning } from './axisMarkerPositioning'
import AxisMarkerLabel from './types/AxisMarkerLabel'

const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 9
const DEFAULT_COLOR = 'black'

const getXAxisMarkerOrientation = (props: Options) => (props.axesOptions?.[Axis2D.X]?.markerOrientation as XAxisMarkerOrientation)

const getYAxisMarkerOrientation = (props: Options) => (props.axesOptions?.[Axis2D.Y]?.markerOrientation as YAxisMarkerOrientation)

export const formatNumber = (value: number, props: Options, axis: Axis2D) => (
  formatNumberMath(value, props.axesOptions?.[axis]?.notation, props.axesOptions?.[axis]?.numFigures)
)

const calculateXAxisMarkerLabelOffsetVector = (
  axesGeometry: AxesGeometry,
  markerPosition: XAxisMarkerOrientation,
  markerLineLength: number,
  lineHeight: number,
  textWidth: number,
): Point2D => {
  const { shouldPlaceBelow, shouldHorizontallyCenter } = determineXAxisMarkerPositioning(axesGeometry, markerPosition)
  return {
    x: shouldHorizontallyCenter ? -textWidth / 2 : 2,
    y: (shouldPlaceBelow ? 1 : -1) * (markerLineLength + lineHeight + 2),
  }
}

const calculateYAxisMarkerLabelOffsetVector = (
  axesGeometry: AxesGeometry,
  markerPosition: YAxisMarkerOrientation,
  markerLineLength: number,
  lineHeight: number,
  textWidth: number,
): Point2D => {
  const { shouldPlaceLeft, shouldVerticallyCenter } = determineYAxisMarkerPositioning(axesGeometry, markerPosition)
  return {
    x: shouldPlaceLeft ? -(textWidth + markerLineLength + 5) : markerLineLength + 5,
    y: shouldVerticallyCenter ? lineHeight / 2 - 2 : -lineHeight + 2,
  }
}

const calculateMarkerLabelOffsetVector = (
  axesGeometry: AxesGeometry,
  markerPosition: XAxisMarkerOrientation | YAxisMarkerOrientation,
  markerLineLength: number,
  lineHeight: number,
  textWidth: number,
  axis: Axis2D,
) => {
  switch (axis) {
    case Axis2D.X:
      return calculateXAxisMarkerLabelOffsetVector(axesGeometry, markerPosition as XAxisMarkerOrientation, markerLineLength, lineHeight, textWidth)
    case Axis2D.Y:
      return calculateYAxisMarkerLabelOffsetVector(axesGeometry, markerPosition as YAxisMarkerOrientation, markerLineLength, lineHeight, textWidth)
    default:
      return null
  }
}

const createAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  axis: Axis2D,
  props: Options,
) => {
  applyTextOptionsToContext(ctx, props.axesOptions?.[axis]?.markerLabelOptions, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_COLOR)

  const { orthogonalScreenPosition } = axesGeometry[axis]
  const lineHeight = measureTextLineHeight(ctx)
  const markerLineLength = getMarkerLineLength(props, axis)
  const markerPosition = axis === Axis2D.X ? getXAxisMarkerOrientation(props) : getYAxisMarkerOrientation(props)

  const axisMarkerLabels: AxisMarkerLabel[] = []
  for (let i = 0; i < axesGeometry[axis].numGridLines; i += 1) {
    const value = axesGeometry[axis].vl + axesGeometry[axis].dvGrid * i
    const text = formatNumber(value, props, axis)
    const textWidth = measureTextWidth(ctx, text)
    const offsetVector = calculateMarkerLabelOffsetVector(axesGeometry, markerPosition, markerLineLength, lineHeight, textWidth, axis)
    const parallelScreenPosition = axesGeometry[axis].p(value)
    const pX = axis === Axis2D.X ? parallelScreenPosition + offsetVector.x : orthogonalScreenPosition + offsetVector.x
    const pY = axis === Axis2D.X ? orthogonalScreenPosition + offsetVector.y : parallelScreenPosition + offsetVector.y
    axisMarkerLabels.push({ textRect: { x: pX, y: pY, height: lineHeight, width: textWidth }, text, value })
  }
  return axisMarkerLabels
}

export const createAxesMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
): { [axis in Axis2D]: AxisMarkerLabel[] } => ({
  [Axis2D.X]: createAxisMarkerLabels(ctx, axesGeometry, Axis2D.X, props),
  [Axis2D.Y]: createAxisMarkerLabels(ctx, axesGeometry, Axis2D.Y, props),
})

export const drawAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  axis: Axis2D,
  props: Options,
) => {
  const axisMarkerLabels = createAxisMarkerLabels(ctx, axesGeometry, axis, props)
  axisMarkerLabels.forEach(l => ctx.fillText(l.text, l.textRect.x, l.textRect.y))
}
