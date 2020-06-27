import MarkerType from './types/MarkerType'
import PositionedDatum from './types/PositionedDatum'
import Options from './types/Options'
import { CanvasDrawer } from '../../common/drawer/types'
import { Path, PathComponentType } from '../../common/drawer/path/types'

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

const createDotMarkerPath = (x: number, y: number, size: number): Path => [
  { type: PathComponentType.CIRCLE, x, y, radius: size / 2 },
]

const createSquareMarkerPath = (x: number, y: number, size: number): Path => {
  const halfSize = size / 2
  return [
    { type: PathComponentType.RECT, x: x - halfSize, y: y - halfSize, height: size, width: size },
  ]
}

const createTriangleMarkerPath = (x: number, y: number, size: number, inversed: boolean): Path => {
  const halfSize = size / 2
  const inversionFactor = inversed ? -1 : 1
  return [
    { x: x - halfSize, y: y + inversionFactor * halfSize, type: PathComponentType.MOVE_TO },
    { x: x + halfSize, y: y + inversionFactor * halfSize, type: PathComponentType.LINE_TO },
    { x, y: y - inversionFactor * halfSize, type: PathComponentType.LINE_TO },
  ]
}

const createCrossMarkerPath = (x: number, y: number, size: number): Path => {
  const halfSize = size / 2
  return [
    { x: x - halfSize, y: y - halfSize, type: PathComponentType.MOVE_TO },
    { x: x + halfSize, y: y + halfSize, type: PathComponentType.LINE_TO },
    { x: x - halfSize, y: y + halfSize, type: PathComponentType.MOVE_TO },
    { x: x + halfSize, y: y - halfSize, type: PathComponentType.LINE_TO },
  ]
}

const createPlusMarkerPath = (x: number, y: number, size: number): Path => {
  const halfSize = size / 2
  return [
    { x: x - halfSize, y, type: PathComponentType.MOVE_TO },
    { x: x + halfSize, y, type: PathComponentType.LINE_TO },
    { x, y: y - halfSize, type: PathComponentType.MOVE_TO },
    { x, y: y + halfSize, type: PathComponentType.LINE_TO },
  ]
}

const createPath = (markerSize: number, markerType: MarkerType, x: number, y: number): Path => {
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

export const getSize = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.size
    ?? props.markerOptions?.size
    ?? DEFAULT_MARKER_SIZE
)

const getType = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.type
    ?? props.markerOptions?.type
    ?? DEFAULT_MARKER_TYPE
)

const getColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.color
    ?? props.markerOptions?.color
    ?? DEFAULT_MARKET_COLOR
)

const getLineWidth = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.lineWidth
    ?? props.markerOptions?.lineWidth
    ?? DEFAULT_MARKER_LINE_WIDTH
)

export const drawStandardMarker = (
  drawer: CanvasDrawer,
  pX: number,
  pY: number,
  props: Options,
  seriesKey: string,
  forcedSize?: number,
): Path2D => {
  const size = forcedSize ?? getSize(props, seriesKey)
  const type = getType(props, seriesKey)
  const path = createPath(size, type, pX, pY)
  if (path == null)
    return null

  const color = getColor(props, seriesKey)

  const shouldFill = type !== MarkerType.CROSS && type !== MarkerType.PLUS
  if (shouldFill)
    return drawer.path(path, { fill: true, stroke: false, fillOptions: { color } })

  const lineWidth = getLineWidth(props, seriesKey)
  return drawer.path(path, { fill: false, stroke: true, lineOptions: { color, lineWidth, dashPattern: [] } })
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
