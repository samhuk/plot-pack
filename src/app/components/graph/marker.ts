import MarkerOptions from './types/MarkerOptions'
import MarkerType from './types/MarkerType'
import DataPoint from './types/DataPoint'

const DEFAULT_MARKER_SIZE = 4
const DEFAULT_MARKER_TYPE = MarkerType.DOT

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

const createMarkerPath = (markerOptions: MarkerOptions, x: number, y: number): Path2D => {
  const markerSize = markerOptions?.size ?? DEFAULT_MARKER_SIZE
  if (markerSize < 0)
    return null

  switch (markerOptions?.type ?? DEFAULT_MARKER_TYPE) {
    case MarkerType.DOT:
      return createDotMarkerPath(x, y, markerSize)
    case MarkerType.SQUARE:
      return createSquareMarkerPath(x, y, markerSize)
    case MarkerType.TRIANGLE:
      return createTriangleMarkerPath(x, y, markerSize, false)
    case MarkerType.UPSIDE_DOWN_TRIANGLE:
      return createTriangleMarkerPath(x, y, markerSize, true)
    case MarkerType.CROSS:
      return createCrossMarkerPath(x, y, markerSize)
    case MarkerType.PLUS:
      return createPlusMarkerPath(x, y, markerSize)
    default:
      return null
  }
}

export const drawStandardMarker = (
  ctx: CanvasRenderingContext2D,
  markerOptions: MarkerOptions,
  pX: number,
  pY: number,
) => {
  const markerPath = createMarkerPath(markerOptions, pX, pY)
  ctx.fillStyle = markerOptions?.color ?? 'black'
  if (markerPath == null)
    return

  const markerType = markerOptions?.type ?? DEFAULT_MARKER_TYPE
  const shouldFill = markerType !== MarkerType.CROSS && markerType !== MarkerType.PLUS

  if (shouldFill) {
    ctx.fill(markerPath)
  }
  else {
    const lineWidth = markerOptions?.lineWidth ?? 1
    if (lineWidth < 0)
      return
    ctx.lineWidth = lineWidth
    ctx.stroke(markerPath)
  }
}

export const drawCustomMarker = (
  ctx: CanvasRenderingContext2D,
  markerOptions: MarkerOptions,
  pX: number,
  pY: number,
  preceedingDataPoint: DataPoint,
  dataPoint: DataPoint,
  proceedingDataPoint: DataPoint,
) => {
  if (markerOptions?.customOptions?.createPath == null || markerOptions?.customOptions?.renderPath == null)
    return

  ctx.save()
  const path = markerOptions.customOptions.createPath(pX, pY, dataPoint, preceedingDataPoint, proceedingDataPoint)
  if (path != null)
    markerOptions.customOptions.renderPath(ctx, path)
  ctx.restore()
}
