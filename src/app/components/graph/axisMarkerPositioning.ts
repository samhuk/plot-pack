import AxesGeometry from './types/AxesGeometry'
import XAxisMarkerPosition from './types/XAxixMarkerPosition'
import { Axis2D } from '../../common/types/geometry'
import YAxisMarkerPosition from './types/YAxisMarkerPosition'

export const determineXAxisMarkerPositioning = (
  axesGeometry: AxesGeometry,
  markerPosition: XAxisMarkerPosition,
): { shouldPlaceBelow: boolean, shouldHorizontallyCenter: boolean } => {
  const isAxisAtBottom = Math.abs(axesGeometry[Axis2D.X].orthogonalScreenPosition - axesGeometry[Axis2D.Y].pl) < 2
  const isAxisAtTop = Math.abs(axesGeometry[Axis2D.X].orthogonalScreenPosition - axesGeometry[Axis2D.Y].pu) < 2

  const shouldPlaceBelow = markerPosition === XAxisMarkerPosition.BELOW // Explicit positioning
    || (markerPosition == null && (isAxisAtBottom || !isAxisAtTop)) // Auto positioning

  return {
    shouldPlaceBelow,
    shouldHorizontallyCenter: (shouldPlaceBelow && isAxisAtBottom) || (!shouldPlaceBelow && isAxisAtTop),
  }
}

export const determineYAxisMarkerPositioning = (
  axesGeometry: AxesGeometry,
  markerPosition: YAxisMarkerPosition,
): { shouldPlaceLeft: boolean, shouldVerticallyCenter: boolean } => {
  const isAxisAtLeft = Math.abs(axesGeometry[Axis2D.Y].orthogonalScreenPosition - axesGeometry[Axis2D.X].pl) < 2
  const isAxisAtRight = Math.abs(axesGeometry[Axis2D.Y].orthogonalScreenPosition - axesGeometry[Axis2D.X].pu) < 2

  const shouldPlaceLeft = markerPosition === YAxisMarkerPosition.LEFT // Explicit positioning
    || (markerPosition == null && (isAxisAtLeft || !isAxisAtRight)) // Auto positioning

  return {
    shouldPlaceLeft,
    shouldVerticallyCenter: (shouldPlaceLeft && isAxisAtLeft) || (!shouldPlaceLeft && isAxisAtRight),
  }
}
