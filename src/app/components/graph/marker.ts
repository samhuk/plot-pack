import MarkerType from './types/MarkerType'
import PositionedDatum from './types/PositionedDatum'
import Options from './types/Options'

export const DEFAULT_MARKER_SIZE = 8
const DEFAULT_MARKER_LINE_WIDTH = 2
const DEFAULT_MARKET_COLOR = 'black'
const DEFAULT_MARKER_TYPE = MarkerType.DOT

/**
 * Determines whether markers should be shown for the given series.
 */
export const getShouldShowMarkers = (props: Options, seriesKey: string) => (
  // Series visibility options takes precedence
  props.seriesOptions?.[seriesKey]?.visibilityOptions?.showMarkers
    // ...then general visibility options
    ?? props.visibilityOptions?.showMarkers
    // ...else default to true
    ?? true
) && (
  props.seriesOptions?.[seriesKey]?.markerOptions?.customOptions?.doesCompliment
    ?? props.markerOptions?.customOptions?.doesCompliment
    ?? true
)

/**
 * Determines whether to draw a custom marker, via determining if the functions
 * required to do so have been defined.
 */
export const getShouldShowCustomMarkers = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.customOptions?.customRenderFunction
    ?? props?.markerOptions?.customOptions?.customRenderFunction
) != null

const createDotMarkerPath = (x: number, y: number, size: number): Path2D => {
  const path = new Path2D()
  path.moveTo(x, y)
  path.arc(x, y, size / 2, 0, 2 * Math.PI)
  return path
}

const createSquareMarkerPath = (x: number, y: number, size: number): Path2D => {
  const path = new Path2D()
  path.moveTo(x, y)
  const halfSize = size / 2
  path.rect(x - halfSize, y - halfSize, size, size)
  return path
}

const createTriangleMarkerPath = (x: number, y: number, size: number, inversed: boolean): Path2D => {
  const path = new Path2D()
  const halfSize = size / 2
  const inversionFactor = inversed ? -1 : 1
  path.moveTo(x - halfSize, y + inversionFactor * halfSize)
  path.lineTo(x + halfSize, y + inversionFactor * halfSize)
  path.lineTo(x, y - inversionFactor * halfSize)
  path.closePath()
  return path
}

const createCrossMarkerPath = (x: number, y: number, size: number): Path2D => {
  const path = new Path2D()
  const halfSize = size / 2
  path.moveTo(x - halfSize, y - halfSize)
  path.lineTo(x + halfSize, y + halfSize)
  path.moveTo(x - halfSize, y + halfSize)
  path.lineTo(x + halfSize, y - halfSize)
  return path
}

const createPlusMarkerPath = (x: number, y: number, size: number): Path2D => {
  const path = new Path2D()
  const halfSize = size / 2
  path.moveTo(x - halfSize, y)
  path.lineTo(x + halfSize, y)
  path.moveTo(x, y - halfSize)
  path.lineTo(x, y + halfSize)
  return path
}

const createMarkerPath = (markerSize: number, markerType: MarkerType, x: number, y: number): Path2D => {
  const _markerSize = markerSize ?? DEFAULT_MARKER_SIZE
  if (_markerSize < 0)
    return null

  switch (markerType ?? DEFAULT_MARKER_TYPE) {
    case MarkerType.DOT:
      return createDotMarkerPath(x, y, _markerSize)
    case MarkerType.SQUARE:
      return createSquareMarkerPath(x, y, _markerSize)
    case MarkerType.TRIANGLE:
      return createTriangleMarkerPath(x, y, _markerSize, false)
    case MarkerType.UPSIDE_DOWN_TRIANGLE:
      return createTriangleMarkerPath(x, y, _markerSize, true)
    case MarkerType.CROSS:
      return createCrossMarkerPath(x, y, _markerSize)
    case MarkerType.PLUS:
      return createPlusMarkerPath(x, y, _markerSize)
    default:
      return null
  }
}

export const getMarkerSize = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.size
    ?? props.markerOptions?.size
    ?? DEFAULT_MARKER_SIZE
)

const getMarkerType = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.type
    ?? props.markerOptions?.type
    ?? DEFAULT_MARKER_TYPE
)

const getMarkerColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.color
    ?? props.markerOptions?.color
    ?? DEFAULT_MARKET_COLOR
)

const getMarkerLineWidth = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.lineWidth
    ?? props.markerOptions?.lineWidth
    ?? DEFAULT_MARKER_LINE_WIDTH
)

export const drawStandardMarker = (
  ctx: CanvasRenderingContext2D,
  pX: number,
  pY: number,
  props: Options,
  seriesKey: string,
  forcedSize?: number,
) => {
  const markerSize = forcedSize ?? getMarkerSize(props, seriesKey)
  const markerType = getMarkerType(props, seriesKey)
  const markerPath = createMarkerPath(markerSize, markerType, pX, pY)
  if (markerPath == null)
    return

  const markerColor = getMarkerColor(props, seriesKey)
  ctx.fillStyle = markerColor
  ctx.strokeStyle = markerColor
  ctx.setLineDash([])

  const shouldFill = markerType !== MarkerType.CROSS && markerType !== MarkerType.PLUS
  if (shouldFill) {
    ctx.fill(markerPath)
  }
  else {
    const lineWidth = getMarkerLineWidth(props, seriesKey)
    if (lineWidth < 0)
      return
    ctx.lineWidth = lineWidth
    ctx.stroke(markerPath)
  }
}

export const drawCustomMarker = (
  ctx: CanvasRenderingContext2D,
  datum: PositionedDatum,
  preceedingDatum: PositionedDatum,
  proceedingDatum: PositionedDatum,
  props: Options,
  seriesKey: string,
) => {
  const customRenderFunction = props.seriesOptions?.[seriesKey]?.markerOptions?.customOptions?.customRenderFunction
    ?? props?.markerOptions?.customOptions?.customRenderFunction

  if (customRenderFunction == null)
    return

  ctx.save()
  customRenderFunction(ctx, datum, preceedingDatum, proceedingDatum)
  ctx.restore()
}
