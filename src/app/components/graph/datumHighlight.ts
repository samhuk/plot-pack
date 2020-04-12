import PositionedDatum from './types/PositionedDatum'
import Options from './types/Options'
import { getMarkerSize } from './marker'
import DatumHighlightAppearanceType from './types/DatumHighlightAppearanceType'
import DatumHighlightAppearance from './types/DatumHighlightAppearance'
import { boundToRange } from '../../common/helpers/math'

const DEFAULT_DATUM_HIGHLIGHT_LINE_WIDTH = 1
const DEFAULT_DATUM_HIGHLIGHT_COLOR = 'black'

const createCircleDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  const radius = markerSize
  path.arc(highlightedDatum.pX, highlightedDatum.pY, radius, 0, 2 * Math.PI)
  return path
}

const createDotDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  const radius = markerSize
  path.arc(highlightedDatum.pX, highlightedDatum.pY, radius, 0, 2 * Math.PI)
  return path
}

const createCrosshairDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  const distanceFromPoint = 0.75 * markerSize
  const hairLength = boundToRange(markerSize, 3, 5)

  path.moveTo(highlightedDatum.pX + distanceFromPoint, highlightedDatum.pY + distanceFromPoint)
  path.lineTo(highlightedDatum.pX + distanceFromPoint + hairLength, highlightedDatum.pY + distanceFromPoint + hairLength)

  path.moveTo(highlightedDatum.pX + distanceFromPoint, highlightedDatum.pY - distanceFromPoint)
  path.lineTo(highlightedDatum.pX + distanceFromPoint + hairLength, highlightedDatum.pY - distanceFromPoint - hairLength)

  path.moveTo(highlightedDatum.pX - distanceFromPoint, highlightedDatum.pY + distanceFromPoint)
  path.lineTo(highlightedDatum.pX - distanceFromPoint - hairLength, highlightedDatum.pY + distanceFromPoint + hairLength)

  path.moveTo(highlightedDatum.pX - distanceFromPoint, highlightedDatum.pY - distanceFromPoint)
  path.lineTo(highlightedDatum.pX - distanceFromPoint - hairLength, highlightedDatum.pY - distanceFromPoint - hairLength)

  return path
}

const createPlushairDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  const length = markerSize

  path.moveTo(highlightedDatum.pX, highlightedDatum.pY + length)
  path.lineTo(highlightedDatum.pX, highlightedDatum.pY + length * 2)

  path.moveTo(highlightedDatum.pX, highlightedDatum.pY - length)
  path.lineTo(highlightedDatum.pX, highlightedDatum.pY - length * 2)

  path.moveTo(highlightedDatum.pX + length, highlightedDatum.pY)
  path.lineTo(highlightedDatum.pX + length * 2, highlightedDatum.pY)

  path.moveTo(highlightedDatum.pX - length, highlightedDatum.pY)
  path.lineTo(highlightedDatum.pX - length * 2, highlightedDatum.pY)

  return path
}

const createDatumHighlightPath = (
  highlightedDatum: PositionedDatum,
  appearanceType: DatumHighlightAppearanceType,
  markerSize: number,
) => {
  switch (appearanceType) {
    case DatumHighlightAppearanceType.CIRCLE:
      return createCircleDatumHighlightPath(highlightedDatum, markerSize)
    case DatumHighlightAppearanceType.DOT:
      return createDotDatumHighlightPath(highlightedDatum, markerSize)
    case DatumHighlightAppearanceType.CROSSHAIR:
      return createCrosshairDatumHighlightPath(highlightedDatum, markerSize)
    case DatumHighlightAppearanceType.PLUSHAIR:
      return createPlushairDatumHighlightPath(highlightedDatum, markerSize)
    default:
      return undefined
  }
}

export const drawDatumHighlight = (ctx: CanvasRenderingContext2D, highlightedDatum: PositionedDatum, props: Options, seriesKey: string) => {
  const markerSize = getMarkerSize(props, seriesKey)
  const appearance = props.datumHighlightAppearance as DatumHighlightAppearance
  const appearanceType = appearance?.type ?? DatumHighlightAppearanceType.CIRCLE

  const path = createDatumHighlightPath(highlightedDatum, appearanceType, markerSize)

  ctx.lineWidth = appearance?.lineWidth ?? DEFAULT_DATUM_HIGHLIGHT_LINE_WIDTH
  ctx.strokeStyle = appearance?.color ?? DEFAULT_DATUM_HIGHLIGHT_COLOR
  ctx.fillStyle = appearance?.color ?? DEFAULT_DATUM_HIGHLIGHT_COLOR

  if (appearanceType === DatumHighlightAppearanceType.DOT)
    ctx.fill(path)
  else
    ctx.stroke(path)
}
