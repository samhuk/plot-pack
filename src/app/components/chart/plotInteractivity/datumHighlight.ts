import ProcessedDatum from '../types/ProcessedDatum'
import Options from '../types/Options'
import { getShouldShowMarkers, getSize as getMarkerSize } from '../data/marker'
import DatumHighlightType from '../types/DatumHighlightType'
import { CanvasDrawer } from '../../../common/drawer/types'
import { DrawOptions, Path, PathComponentType } from '../../../common/drawer/path/types'
import { Point2D } from '../../../common/types/geometry'
import DatumHighlightOptions, { CircleDatumHighlightOptions,
  CrossHairDatumHighlightOptions,
  DatumHighlightOptionsBase,
  HairDatumHighlightOptionsBase } from '../types/DatumHighlightOptions'

const DEFAULT_HIGHLIGHT_TYPE = DatumHighlightType.CIRCLE

const DEFAULT_CIRCLE_OPTIONS: CircleDatumHighlightOptions = {
  radius: 4,
  drawOptions: {
    stroke: true,
    fill: false,
    fillOptions: {
      color: 'black',
      opacity: 1,
    },
    lineOptions: {
      color: 'black',
      lineWidth: 1,
      dashPattern: [],
    },
  },
}

const DEFAULT_HAIR_OPTIONS_BASE: HairDatumHighlightOptionsBase = {
  hairLength: 4,
  hairStartRadius: 2,
  lineOptions: {
    color: 'black',
    lineWidth: 1,
    dashPattern: [],
  },
}

const DEFAULT_DATUM_HIGHLIGHT_OPTIONS_BASE: DatumHighlightOptionsBase = {
  customHighlightOptions: {
    customHighlightFunction: null,
    doesCompliment: false,
  },
}

const getHairStartRadius = (hairStartRadius: number, markerSize: number) => (
  hairStartRadius ?? (markerSize != null ? 0.75 * markerSize : null) ?? DEFAULT_HAIR_OPTIONS_BASE.hairStartRadius
)

const getRadiusForCircularDatumHighlights = (radius: number, markerSize: number) => (
  radius ?? (markerSize != null ? 0.75 * markerSize : null) ?? DEFAULT_CIRCLE_OPTIONS.radius
)

const createCircleDatumHighlightPath = (position: Point2D, options: CircleDatumHighlightOptions, markerSize: number): Path => {
  const radius = getRadiusForCircularDatumHighlights(options?.radius, markerSize)
  return [{ type: PathComponentType.CIRCLE, position, radius }]
}

const createCrosshairDatumHighlightPath = (position: Point2D, options: CrossHairDatumHighlightOptions, markerSize: number): Path => {
  const hairStartRadius = getHairStartRadius(options?.hairStartRadius, markerSize)
  const hairLength = options?.hairLength ?? DEFAULT_HAIR_OPTIONS_BASE.hairLength

  return [
    { type: PathComponentType.MOVE_TO, x: position.x + hairStartRadius, y: position.y + hairStartRadius },
    { type: PathComponentType.LINE_TO, x: position.x + hairStartRadius + hairLength, y: position.y + hairStartRadius + hairLength },
    { type: PathComponentType.MOVE_TO, x: position.x + hairStartRadius, y: position.y - hairStartRadius },
    { type: PathComponentType.LINE_TO, x: position.x + hairStartRadius + hairLength, y: position.y - hairStartRadius - hairLength },
    { type: PathComponentType.MOVE_TO, x: position.x - hairStartRadius, y: position.y + hairStartRadius },
    { type: PathComponentType.LINE_TO, x: position.x - hairStartRadius - hairLength, y: position.y + hairStartRadius + hairLength },
    { type: PathComponentType.MOVE_TO, x: position.x - hairStartRadius, y: position.y - hairStartRadius },
    { type: PathComponentType.LINE_TO, x: position.x - hairStartRadius - hairLength, y: position.y - hairStartRadius - hairLength },
  ]
}

const createPlushairDatumHighlightPath = (position: Point2D, options: CrossHairDatumHighlightOptions, markerSize: number): Path => {
  const hairStartRadius = getHairStartRadius(options?.hairStartRadius, markerSize)
  const hairLength = options?.hairLength ?? DEFAULT_HAIR_OPTIONS_BASE.hairLength

  return [
    { type: PathComponentType.MOVE_TO, x: position.x, y: position.y + hairStartRadius },
    { type: PathComponentType.LINE_TO, x: position.x, y: position.y + hairStartRadius + hairLength },
    { type: PathComponentType.MOVE_TO, x: position.x, y: position.y - hairStartRadius },
    { type: PathComponentType.LINE_TO, x: position.x, y: position.y - hairStartRadius - hairLength },
    { type: PathComponentType.MOVE_TO, x: position.x - hairStartRadius, y: position.y },
    { type: PathComponentType.LINE_TO, x: position.x - hairStartRadius - hairLength, y: position.y },
    { type: PathComponentType.MOVE_TO, x: position.x + hairStartRadius, y: position.y },
    { type: PathComponentType.LINE_TO, x: position.x + hairStartRadius + hairLength, y: position.y },
  ]
}

const createDatumHighlightPath = (
  options: DatumHighlightOptions<DatumHighlightType>,
  highlightedDatum: ProcessedDatum,
  markerSize: number,
): Path => {
  const position: Point2D = { x: highlightedDatum.fpX, y: highlightedDatum.fpY }

  switch (options?.type) {
    case DatumHighlightType.CIRCLE:
      return createCircleDatumHighlightPath(position, options, markerSize)
    case DatumHighlightType.CROSSHAIR:
      return createCrosshairDatumHighlightPath(position, options, markerSize)
    case DatumHighlightType.PLUSHAIR:
      return createPlushairDatumHighlightPath(position, options, markerSize)
    default:
      return createCircleDatumHighlightPath(position, options, markerSize)
  }
}

const createDrawOptions = (options: DatumHighlightOptions<DatumHighlightType>): DrawOptions => {
  switch (options?.type) {
    case DatumHighlightType.CIRCLE:
      return options.drawOptions
    case DatumHighlightType.CROSSHAIR:
      return { fill: false, stroke: true, lineOptions: options.lineOptions }
    case DatumHighlightType.PLUSHAIR:
      return { fill: false, stroke: true, lineOptions: options.lineOptions }
    default:
      return null
  }
}

const createFallbackDrawOptions = (type: DatumHighlightType): DrawOptions => {
  switch (type) {
    case DatumHighlightType.CIRCLE:
      return DEFAULT_CIRCLE_OPTIONS.drawOptions
    case DatumHighlightType.CROSSHAIR:
      return { fill: false, stroke: true, lineOptions: DEFAULT_HAIR_OPTIONS_BASE?.lineOptions }
    case DatumHighlightType.PLUSHAIR:
      return { fill: false, stroke: true, lineOptions: DEFAULT_HAIR_OPTIONS_BASE?.lineOptions }
    default:
      return null
  }
}

export const drawDatumHighlight = (drawer: CanvasDrawer, highlightedDatum: ProcessedDatum, props: Options, seriesKey: string) => {
  const options = props.datumHighlightOptions

  if (options?.customHighlightOptions?.customHighlightFunction != null) {
    const ctx = drawer.getRenderingContext()
    ctx.save()
    options.customHighlightOptions.customHighlightFunction(ctx, highlightedDatum, props, seriesKey)
    ctx.restore()
    if (options.customHighlightOptions.doesCompliment ?? DEFAULT_DATUM_HIGHLIGHT_OPTIONS_BASE.customHighlightOptions.doesCompliment)
      return
  }

  const markerSize = getShouldShowMarkers(props, seriesKey) ? getMarkerSize(props, seriesKey) : null
  const path = createDatumHighlightPath(props.datumHighlightOptions, highlightedDatum, markerSize)
  const drawOptions = createDrawOptions(options)
  const fallbackOptions = createFallbackDrawOptions(options?.type ?? DEFAULT_HIGHLIGHT_TYPE)
  drawer.path(path, drawOptions, fallbackOptions)
}
