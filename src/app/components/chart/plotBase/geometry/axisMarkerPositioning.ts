import AxesGeometry from '../../types/AxesGeometry'
import XAxisMarkerOrientation from '../../types/XAxixMarkerOrientation'
import YAxisMarkerOrientation from '../../types/YAxisMarkerOrientation'

export const determineXAxisMarkerPositioning = (
  axesGeometry: AxesGeometry,
  markerOrientation: XAxisMarkerOrientation,
): { shouldPlaceBelow: boolean, shouldHorizontallyCenter: boolean } => {
  const isAxisAtBottom = Math.abs(axesGeometry.x.orthogonalScreenPosition - axesGeometry.y.pl) < 2
  const isAxisAtTop = Math.abs(axesGeometry.x.orthogonalScreenPosition - axesGeometry.y.pu) < 2

  const shouldPlaceBelow = markerOrientation === XAxisMarkerOrientation.BELOW // Explicit positioning
    || (markerOrientation == null && (isAxisAtBottom || !isAxisAtTop)) // Auto positioning

  return {
    shouldPlaceBelow,
    shouldHorizontallyCenter: (shouldPlaceBelow && isAxisAtBottom) || (!shouldPlaceBelow && isAxisAtTop),
  }
}

export const determineYAxisMarkerPositioning = (
  axesGeometry: AxesGeometry,
  markerOrientation: YAxisMarkerOrientation,
): { shouldPlaceLeft: boolean, shouldVerticallyCenter: boolean } => {
  const isAxisAtLeft = Math.abs(axesGeometry.y.orthogonalScreenPosition - axesGeometry.x.pl) < 2
  const isAxisAtRight = Math.abs(axesGeometry.y.orthogonalScreenPosition - axesGeometry.x.pu) < 2

  const shouldPlaceLeft = markerOrientation === YAxisMarkerOrientation.LEFT // Explicit positioning
    || (markerOrientation == null && (isAxisAtLeft || !isAxisAtRight)) // Auto positioning

  return {
    shouldPlaceLeft,
    shouldVerticallyCenter: (shouldPlaceLeft && isAxisAtLeft) || (!shouldPlaceLeft && isAxisAtRight),
  }
}
