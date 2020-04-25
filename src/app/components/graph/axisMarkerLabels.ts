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

const createXAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
): AxisMarkerLabel[] => {
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, Axis2D.X)
  ctx.fillStyle = getLabelColor(props, Axis2D.X)

  const axisY = axesGeometry[Axis2D.X].orthogonalScreenPosition
  const lineHeight = measureTextLineHeight(ctx)
  const markerLineLength = getMarkerLineLength(props, Axis2D.Y)
  const markerPosition = getXAxisMarkerOrientation(props)

  const axisMarkerLabels: AxisMarkerLabel[] = []
  for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
    const value = axesGeometry[Axis2D.X].vl + axesGeometry[Axis2D.X].dvGrid * i
    const text = createAxisMarkerLabelText(value, props.axesOptions?.[Axis2D.X])
    const textWidth = measureTextWidth(ctx, text)
    const offsetVector = calculateXAxisMarkerLabelOffsetVector(axesGeometry, markerPosition, markerLineLength, lineHeight, textWidth)
    const pX = axesGeometry[Axis2D.X].p(value) + offsetVector.x
    const pY = axisY + offsetVector.y
    axisMarkerLabels.push({ pX, pY, textHeight: lineHeight, textWidth, text, value })
  }
  return axisMarkerLabels
}

const createYAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
): AxisMarkerLabel[] => {
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, Axis2D.Y)
  ctx.fillStyle = getLabelColor(props, Axis2D.Y)

  const axisX = axesGeometry[Axis2D.Y].orthogonalScreenPosition

  const lineHeight = measureTextLineHeight(ctx)
  const markerLineLength = getMarkerLineLength(props, Axis2D.Y)
  const markerPosition = getYAxisMarkerOrientation(props)

  const axisMarkerLabels: AxisMarkerLabel[] = []
  for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
    const value = axesGeometry[Axis2D.Y].vl + axesGeometry[Axis2D.Y].dvGrid * i
    const text = createAxisMarkerLabelText(value, props.axesOptions?.[Axis2D.Y])
    const textWidth = measureTextWidth(ctx, text)
    const offsetVector = calculateYAxisMarkerLabelOffsetVector(axesGeometry, markerPosition, markerLineLength, lineHeight, textWidth)
    const pX = axisX + offsetVector.x
    const pY = axesGeometry[Axis2D.Y].p(value) + offsetVector.y
    axisMarkerLabels.push({ pX, pY, textHeight: lineHeight, textWidth, text, value })
  }
  return axisMarkerLabels
}

export const drawXAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const axisMarkerLabels = createXAxisMarkerLabels(ctx, axesGeometry, props)
  axisMarkerLabels.forEach(l => ctx.fillText(l.text, l.pX, l.pY))
}

export const drawYAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  const axisMarkerLabels = createYAxisMarkerLabels(ctx, axesGeometry, props)
  axisMarkerLabels.forEach(l => ctx.fillText(l.text, l.pX, l.pY))
}
