import PositionedDatum from './types/PositionedDatum'
import Options from './types/Options'
import { DEFAULT_MARKER_SIZE } from './marker'
import DatumHighlightAppearanceType from './types/DatumHighlightAppearanceType'
import DatumHighlightAppearance from './types/DatumHighlightAppearance'

const createCircleDatumHighlightPath = (props: Options, highlightedDatum: PositionedDatum) => {
  const path = new Path2D()
  const radius = props.markerOptions.size ?? DEFAULT_MARKER_SIZE
  path.arc(highlightedDatum.pX, highlightedDatum.pY, radius, 0, 2 * Math.PI)
  return path
}

const createDotDatumHighlightPath = (props: Options, highlightedDatum: PositionedDatum) => {
  const path = new Path2D()
  const radius = props.markerOptions.size ?? DEFAULT_MARKER_SIZE
  path.arc(highlightedDatum.pX, highlightedDatum.pY, radius, 0, 2 * Math.PI)
  return path
}

const createCrosshairDatumHighlightPath = (props: Options, highlightedDatum: PositionedDatum) => {
  const path = new Path2D()
  const length = 0.75 * (props.markerOptions.size ?? DEFAULT_MARKER_SIZE)

  path.moveTo(highlightedDatum.pX + length, highlightedDatum.pY + length)
  path.lineTo(highlightedDatum.pX + length * 2, highlightedDatum.pY + length * 2)

  path.moveTo(highlightedDatum.pX + length, highlightedDatum.pY - length)
  path.lineTo(highlightedDatum.pX + length * 2, highlightedDatum.pY - length * 2)

  path.moveTo(highlightedDatum.pX - length, highlightedDatum.pY + length)
  path.lineTo(highlightedDatum.pX - length * 2, highlightedDatum.pY + length * 2)

  path.moveTo(highlightedDatum.pX - length, highlightedDatum.pY - length)
  path.lineTo(highlightedDatum.pX - length * 2, highlightedDatum.pY - length * 2)

  return path
}

const createPlushairDatumHighlightPath = (props: Options, highlightedDatum: PositionedDatum) => {
  const path = new Path2D()
  const length = props.markerOptions.size ?? DEFAULT_MARKER_SIZE

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

const createDatumHighlightPath = (props: Options, highlightedDatum: PositionedDatum) => {
  const appearanceType = (props.datumHighlightAppearance as DatumHighlightAppearance)?.type ?? DatumHighlightAppearanceType.CIRCLE

  switch (appearanceType) {
    case DatumHighlightAppearanceType.CIRCLE:
      return createCircleDatumHighlightPath(props, highlightedDatum)
    case DatumHighlightAppearanceType.DOT:
      return createDotDatumHighlightPath(props, highlightedDatum)
    case DatumHighlightAppearanceType.CROSSHAIR:
      return createCrosshairDatumHighlightPath(props, highlightedDatum)
    case DatumHighlightAppearanceType.PLUSHAIR:
      return createPlushairDatumHighlightPath(props, highlightedDatum)
    default:
      return createCircleDatumHighlightPath(props, highlightedDatum)
  }
}

export const drawDatumHighlight = (ctx: CanvasRenderingContext2D, props: Options, highlightedDatum: PositionedDatum) => {
  const path = createDatumHighlightPath(props, highlightedDatum)

  const appearance = props.datumHighlightAppearance as DatumHighlightAppearance
  const appearanceType = appearance?.type ?? DatumHighlightAppearanceType.CIRCLE

  ctx.lineWidth = appearance.lineWidth ?? 1
  ctx.strokeStyle = appearance.color ?? 'black'
  ctx.fillStyle = appearance.color ?? 'black'

  if (appearanceType === DatumHighlightAppearanceType.DOT)
    ctx.fill(path)
  else
    ctx.stroke(path)
}
