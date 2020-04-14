import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'
import { Point2D } from '../../common/types/geometry'
import { drawCursorPositionValueLabels } from './cursorPositionValueLabel'
import { drawCursorPositionLines } from './cursorPositionLine'
import { drawDatumHighlight } from './datumHighlight'
import PositionedDatum from './types/PositionedDatum'
import KdTree from './types/KdTree'
import { mapDict, filterDict } from '../../common/helpers/dict'
import { createDatumDistanceFunction } from './geometry'
import drawTooltip from './tooltip'
import DatumSnapMode from './types/DatumSnapMode'

type NearestDatum = PositionedDatum & {
  dp: number
}

const determineNearestDatum = (
  kdTree: KdTree<PositionedDatum>,
  cursorPoint: Point2D,
  datumFocusDistanceThresholdPx: number,
): NearestDatum => {
  // The KD tree only relies on the position of the datum, i.e. the pX and pY values
  const point = { pX: cursorPoint.x, pY: cursorPoint.y } as PositionedDatum
  const nearestDatumResult = kdTree.nearest(point, 1)
  if (datumFocusDistanceThresholdPx == null || nearestDatumResult[0][1] <= datumFocusDistanceThresholdPx) {
    return {
      pX: nearestDatumResult[0][0].pX,
      pY: nearestDatumResult[0][0].pY,
      vX: nearestDatumResult[0][0].vX,
      vY: nearestDatumResult[0][0].vY,
      dp: nearestDatumResult[0][1],
    }
  }

  return null
}

const determineNearestDatums = (
  kdTrees: { [seriesKey: string]: KdTree<PositionedDatum> },
  cursorPoint: Point2D,
  datumFocusDistanceThresholdPx: number,
  seriesExcludedFromDatumHighlighting: string[],
): { [seriesKey: string]: NearestDatum } => (
  mapDict(kdTrees, (seriesKey, kdTree) => (
    seriesExcludedFromDatumHighlighting == null || seriesExcludedFromDatumHighlighting.indexOf(seriesKey) === -1
      ? determineNearestDatum(kdTree, cursorPoint, datumFocusDistanceThresholdPx)
      : null
  ))
)

const drawDatumHighlightInternal = (ctx: CanvasRenderingContext2D, nearestDatum: PositionedDatum, props: Options, seriesKey: string) => {
  const shouldDraw = nearestDatum != null

  if (!shouldDraw)
    return

  const isCustomFunctionDefined = props.datumHighlightOptions?.customHighlightOptions?.customHighlightFunction != null
  const doesCustomFunctionCompliment = props.datumHighlightOptions?.customHighlightOptions?.doesCompliment ?? false

  // Draw custom datum highlight if custom function defined
  if (isCustomFunctionDefined) {
    ctx.save()
    props.datumHighlightOptions.customHighlightOptions.customHighlightFunction(ctx, nearestDatum, props, seriesKey)
    ctx.restore()
  }

  // Draw standard datum highlight
  if (!isCustomFunctionDefined || (isCustomFunctionDefined && doesCustomFunctionCompliment))
    drawDatumHighlight(ctx, nearestDatum, props, seriesKey)
}

const determineNearestDatumOfAllSeries = (nearestDatums: { [seriesKey: string]: NearestDatum }) => {
  const nearestDatumList = Object.values(nearestDatums).filter(nd => nd != null)
  let nearestDatumOfAllSeries: NearestDatum = nearestDatumList[0]
  nearestDatumList.forEach(nearestDatum => {
    if (nearestDatum.dp < nearestDatumOfAllSeries.dp)
      nearestDatumOfAllSeries = nearestDatum
  })
  return nearestDatumOfAllSeries
}

const drawDatumHighlights = (
  ctx: CanvasRenderingContext2D,
  nearestDatums: { [seriesKey: string]: NearestDatum },
  props: Options,
) => {
  Object.entries(nearestDatums).forEach(([seriesKey, nearestDatum]) => {
    drawDatumHighlightInternal(ctx, nearestDatum, props, seriesKey)
  })
}

const draw = (
  ctx: CanvasRenderingContext2D,
  props: Options,
  graphGeometry: GraphGeometry,
  cursorPoint: Point2D,
) => {
  ctx.clearRect(0, 0, props.widthPx, props.heightPx)

  // Determine if the cursor is within the graph area
  const isCursorWithinGraphArea = isInRange(graphGeometry.xAxis.pl, graphGeometry.xAxis.pu, cursorPoint.x)
    && isInRange(graphGeometry.yAxis.pl, graphGeometry.yAxis.pu, cursorPoint.y)

  // Don't draw anything if cursor isn't within the graph area (this excludes the padding area too)
  if (!isCursorWithinGraphArea)
    return

  let highlightedDatums: { [seriesKey: string]: NearestDatum } = null
  let nearestDatumOfAllSeries: NearestDatum = null

  if (props.datumSnapOptions?.mode !== DatumSnapMode.NONE) {
    // Determine the nearest point to the cursor
    const nearestDatums = determineNearestDatums(
      graphGeometry.datumKdTrees,
      cursorPoint,
      props.datumSnapOptions?.distanceThresholdPx,
      props.datumSnapOptions?.excludedSeriesKeys,
    )

    nearestDatumOfAllSeries = determineNearestDatumOfAllSeries(nearestDatums)

    const distanceFn = createDatumDistanceFunction(props?.datumSnapOptions?.mode)
    highlightedDatums = filterDict(nearestDatums, (_, nearestDatum) => (nearestDatum != null
      && distanceFn(nearestDatum, nearestDatumOfAllSeries) < (props.datumSnapOptions?.seriesGroupingDistanceThresholdPx ?? 5)))
  }

  // Draw the vertical and horizontal lines, intersecting at where the cursor is
  drawCursorPositionLines(ctx, cursorPoint, nearestDatumOfAllSeries, graphGeometry.xAxis, graphGeometry.yAxis, props)
  // Draw the axis value labels at the cursor co-ordinates (next to the axes)
  drawCursorPositionValueLabels(ctx, cursorPoint, nearestDatumOfAllSeries, graphGeometry.xAxis, graphGeometry.yAxis, props)

  if (highlightedDatums != null) {
    if (props.visibilityOptions?.showTooltip ?? true)
      drawTooltip(ctx, cursorPoint, highlightedDatums, nearestDatumOfAllSeries, props)
    if (props.visibilityOptions?.showDatumHighlight ?? true)
      drawDatumHighlights(ctx, highlightedDatums, props)
  }
}

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  // eslint-disable-next-line no-param-reassign
  canvas.style.cursor = 'crosshair'

  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    draw(ctx, props, graphGeometry, { x: e.offsetX, y: e.offsetY })
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => ctx.clearRect(0, 0, props.widthPx, props.heightPx)
}

export default render
