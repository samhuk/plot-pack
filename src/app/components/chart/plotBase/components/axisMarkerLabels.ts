import Options from '../../types/Options'
import { Axis2D, Point2D } from '../../../../common/types/geometry'
import { formatNumber as formatNumberMath } from '../../../../common/helpers/math'
import AxesGeometry from '../../types/AxesGeometry'
import { getMarkerLineLength } from './axisMarkerLines'
import XAxisMarkerOrientation from '../../types/XAxixMarkerOrientation'
import YAxisMarkerOrientation from '../../types/YAxisMarkerOrientation'
import { determineXAxisMarkerPositioning, determineYAxisMarkerPositioning } from '../geometry/axisMarkerPositioning'
import AxisMarkerLabel from '../../types/AxisMarkerLabel'
import { CanvasDrawer } from '../../../../common/drawer/types'
import { TextOptions } from '../../../../common/types/canvas'

const DEFALT_TEXT_OPTIONS: TextOptions = {
  color: 'black',
  fontFamily: 'Helvetica',
  fontSize: 9,
}

export const getShouldShowAxisMarkerLabels = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showAxisMarkerLabels
    ?? props.visibilityOptions?.showAxesMarkerLabels
    ?? true
)

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
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  axis: Axis2D,
  props: Options,
): AxisMarkerLabel[] => {
  drawer.applyTextOptions(props.axesOptions?.[axis]?.markerLabelOptions, DEFALT_TEXT_OPTIONS)

  const { orthogonalScreenPosition } = axesGeometry[axis]
  const lineHeight = drawer.measureTextHeight()
  const markerLineLength = getMarkerLineLength(props, axis)
  const markerPosition = axis === Axis2D.X ? getXAxisMarkerOrientation(props) : getYAxisMarkerOrientation(props)

  const axisMarkerLabels: AxisMarkerLabel[] = []
  for (let i = 0; i < axesGeometry[axis].numGridLines; i += 1) {
    const value = axesGeometry[axis].vlGrid + axesGeometry[axis].dvGrid * i
    const text = formatNumber(value, props, axis)
    const textWidth = drawer.measureTextWidth(text)
    const offsetVector = calculateMarkerLabelOffsetVector(axesGeometry, markerPosition, markerLineLength, lineHeight, textWidth, axis)
    const parallelScreenPosition = axesGeometry[axis].p(value)
    const pX = axis === Axis2D.X ? parallelScreenPosition + offsetVector.x : orthogonalScreenPosition + offsetVector.x
    const pY = axis === Axis2D.X ? orthogonalScreenPosition + offsetVector.y : parallelScreenPosition + offsetVector.y
    axisMarkerLabels.push({ textRect: { x: pX, y: pY, height: lineHeight, width: textWidth }, text, value })
  }
  return axisMarkerLabels
}

export const createAxesMarkerLabels = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  props: Options,
): { [axis in Axis2D]: AxisMarkerLabel[] } => ({
  [Axis2D.X]: createAxisMarkerLabels(drawer, axesGeometry, Axis2D.X, props),
  [Axis2D.Y]: createAxisMarkerLabels(drawer, axesGeometry, Axis2D.Y, props),
})

export const drawAxisMarkerLabels = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  axis: Axis2D,
  props: Options,
) => {
  const axisMarkerLabels = createAxisMarkerLabels(drawer, axesGeometry, axis, props)
  const ctx = drawer.getRenderingContext()
  axisMarkerLabels.forEach(l => ctx.fillText(l.text, l.textRect.x, l.textRect.y))
}
