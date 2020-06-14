import PositionedDatum from './types/PositionedDatum'
import Options from './types/Options'
import { getSize as getMarkerSize } from './marker'
import DatumHighlightAppearanceType from './types/DatumHighlightAppearanceType'
import { boundToRange } from '../../common/helpers/math'

const DEFAULT_DATUM_HIGHLIGHT_LINE_WIDTH = 1
const DEFAULT_DATUM_HIGHLIGHT_COLOR = 'black'

const createCircleDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  path.arc(highlightedDatum.fpX, highlightedDatum.fpY, 0.75 * markerSize, 0, 2 * Math.PI)
  return path
}

const createDotDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  path.arc(highlightedDatum.fpX, highlightedDatum.fpY, 0.75 * markerSize, 0, 2 * Math.PI)
  return path
}

const createCrosshairDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  const distanceFromPoint = 0.75 * markerSize
  const hairLength = boundToRange(markerSize, 3, 5)

  path.moveTo(highlightedDatum.fpX + distanceFromPoint, highlightedDatum.fpY + distanceFromPoint)
  path.lineTo(highlightedDatum.fpX + distanceFromPoint + hairLength, highlightedDatum.fpY + distanceFromPoint + hairLength)

  path.moveTo(highlightedDatum.fpX + distanceFromPoint, highlightedDatum.fpY - distanceFromPoint)
  path.lineTo(highlightedDatum.fpX + distanceFromPoint + hairLength, highlightedDatum.fpY - distanceFromPoint - hairLength)

  path.moveTo(highlightedDatum.fpX - distanceFromPoint, highlightedDatum.fpY + distanceFromPoint)
  path.lineTo(highlightedDatum.fpX - distanceFromPoint - hairLength, highlightedDatum.fpY + distanceFromPoint + hairLength)

  path.moveTo(highlightedDatum.fpX - distanceFromPoint, highlightedDatum.fpY - distanceFromPoint)
  path.lineTo(highlightedDatum.fpX - distanceFromPoint - hairLength, highlightedDatum.fpY - distanceFromPoint - hairLength)

  return path
}

const createPlushairDatumHighlightPath = (highlightedDatum: PositionedDatum, markerSize: number) => {
  const path = new Path2D()
  const length = markerSize

  path.moveTo(highlightedDatum.fpX, highlightedDatum.fpY + length)
  path.lineTo(highlightedDatum.fpX, highlightedDatum.fpY + length * 2)

  path.moveTo(highlightedDatum.fpX, highlightedDatum.fpY - length)
  path.lineTo(highlightedDatum.fpX, highlightedDatum.fpY - length * 2)

  path.moveTo(highlightedDatum.fpX + length, highlightedDatum.fpY)
  path.lineTo(highlightedDatum.fpX + length * 2, highlightedDatum.fpY)

  path.moveTo(highlightedDatum.fpX - length, highlightedDatum.fpY)
  path.lineTo(highlightedDatum.fpX - length * 2, highlightedDatum.fpY)

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
  const appearanceType = props.datumHighlightOptions?.type ?? DatumHighlightAppearanceType.CIRCLE

  const path = createDatumHighlightPath(highlightedDatum, appearanceType, markerSize)

  ctx.lineWidth = props.datumHighlightOptions?.lineWidth ?? DEFAULT_DATUM_HIGHLIGHT_LINE_WIDTH
  ctx.strokeStyle = props.datumHighlightOptions?.color ?? DEFAULT_DATUM_HIGHLIGHT_COLOR
  ctx.fillStyle = props.datumHighlightOptions?.color ?? DEFAULT_DATUM_HIGHLIGHT_COLOR

  if (appearanceType === DatumHighlightAppearanceType.DOT)
    ctx.fill(path)
  else
    ctx.stroke(path)
}
