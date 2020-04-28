import Options from './types/Options'
import { Axis2D, Point2D } from '../../common/types/geometry'
import { createTextStyle, measureTextWidth, measureTextLineHeight } from '../../common/helpers/canvas'
import AxisOptions from './types/AxisOptions'
import Notation from './types/Notation'
import { roundDecimalPlaces } from '../../common/helpers/math'
import AxesGeometry from './types/AxesGeometry'
import { getMarkerLineLength } from './axisMarkerLines'
import XAxisMarkerOrientation from './types/XAxixMarkerOrientation'
import YAxisMarkerOrientation from './types/YAxisMarkerOrientation'
import { determineXAxisMarkerPositioning, determineYAxisMarkerPositioning } from './axisMarkerPositioning'
import AxisMarkerLabel from './types/AxisMarkerLabel'

const DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY = 'Helvetica'
const DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE = 9
const DEFAULT_AXIS_MARKER_LABEL_COLOR = 'black'

const createAxisMarkerLabelText = (value: number, axisOptions: AxisOptions) => {
  const defaultValue = value.toString()

  if (axisOptions == null)
    return defaultValue

  if (axisOptions.notation == null || axisOptions.notation === Notation.DECIMAL) {
    if (axisOptions.numFigures != null)
      return roundDecimalPlaces(value, axisOptions.numFigures).toFixed(axisOptions.numFigures)
    return defaultValue
  }
  if (axisOptions.notation === Notation.SCIENTIFIC) {
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(value)))
    const normalizedValue = value / (10 ** orderOfMagnitude)
    const roundedValue = axisOptions.numFigures != null
      ? roundDecimalPlaces(normalizedValue, axisOptions.numFigures + 1).toFixed(axisOptions.numFigures)
      : normalizedValue
    return `${roundedValue} x10^${orderOfMagnitude}`
  }

  return defaultValue
}

const getFontSize = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelFontSize
  ?? props.axesMarkerLabelOptions?.fontSize
  ?? DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE

const getFontFamily = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelFontFamily
  ?? props.axesMarkerLabelOptions?.fontFamily
  ?? DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY

const getLabelColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelColor
  ?? props.axesMarkerLabelOptions?.color
  ?? DEFAULT_AXIS_MARKER_LABEL_COLOR

const getFont = (props: Options, axis: Axis2D) => createTextStyle(getFontFamily(props, axis), getFontSize(props, axis))

const getXAxisMarkerOrientation = (props: Options) => (props.axesOptions?.[Axis2D.X]?.axisMarkerOrientation as XAxisMarkerOrientation)

const getYAxisMarkerOrientation = (props: Options) => (props.axesOptions?.[Axis2D.Y]?.axisMarkerOrientation as YAxisMarkerOrientation)

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
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, axis)
  ctx.fillStyle = getLabelColor(props, axis)

  const { orthogonalScreenPosition } = axesGeometry[axis]
  const lineHeight = measureTextLineHeight(ctx)
  const markerLineLength = getMarkerLineLength(props, axis)
  const markerPosition = axis === Axis2D.X ? getXAxisMarkerOrientation(props) : getYAxisMarkerOrientation(props)

  const axisMarkerLabels: AxisMarkerLabel[] = []
  for (let i = 0; i < axesGeometry[axis].numGridLines; i += 1) {
    const value = axesGeometry[axis].vl + axesGeometry[axis].dvGrid * i
    const text = createAxisMarkerLabelText(value, props.axesOptions?.[axis])
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
