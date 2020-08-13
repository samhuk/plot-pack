import GraphGeometry from './types/GraphGeometry'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'
import { Point2D, Axis2D } from '../../common/types/geometry'
import { getShouldDrawCursorPositionValueLabel, drawCursorPositionValueLabel } from './cursorPositionValueLabel'
import { getShouldDrawCursorPositionLine, drawCursorPositionLine } from './cursorPositionLine'
import { drawDatumHighlight } from './datumHighlight'
import ProcessedDatum from './types/ProcessedDatum'
import KdTree from './types/KdTree'
import { mapDict, filterDict } from '../../common/helpers/dict'
import { createDatumDistanceFunction } from './geometry'
import drawTooltip, { getShouldDrawTooltip } from './tooltip'
import DatumSnapMode from './types/DatumSnapMode'
import { CanvasDrawer } from '../../common/drawer/types'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'

type NearestDatum = ProcessedDatum & {
  dp: number
}

const determineNearestDatum = (
  kdTree: KdTree<ProcessedDatum>,
  cursorPoint: Point2D,
  datumFocusDistanceThresholdPx: number,
): NearestDatum => {
  // The KD tree only relies on the focus position of the datum, i.e. the fpX and fpY values
  const point: ProcessedDatum = { fpX: cursorPoint.x, fpY: cursorPoint.y, fvX: null, fvY: null, pX: null, pY: null, x: null, y: null }
  const nearestDatumResult = kdTree.nearest(point, 1)
  if (datumFocusDistanceThresholdPx == null || nearestDatumResult[0][1] <= datumFocusDistanceThresholdPx) {
    return {
      pX: nearestDatumResult[0][0].pX,
      pY: nearestDatumResult[0][0].pY,
      x: nearestDatumResult[0][0].x,
      y: nearestDatumResult[0][0].y,
      fvX: nearestDatumResult[0][0].fvX,
      fvY: nearestDatumResult[0][0].fvY,
      fpX: nearestDatumResult[0][0].fpX,
      fpY: nearestDatumResult[0][0].fpY,
      dp: nearestDatumResult[0][1],
    }
  }

  return null
}

const determineNearestDatums = (
  kdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> },
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

const drawDatumHighlightInternal = (ctx: CanvasRenderingContext2D, nearestDatum: ProcessedDatum, props: Options, seriesKey: string) => {
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
  drawer: CanvasDrawer,
  props: Options,
  graphGeometry: GraphGeometry,
  cursorPoint: Point2D,
) => {
  drawer.clearRenderingSpace()
  const ctx = drawer.getRenderingContext()

  // Determine if the cursor is within the graph area
  const isCursorWithinGraphArea = isInRange(graphGeometry.axesGeometry[Axis2D.X].pl, graphGeometry.axesGeometry[Axis2D.X].pu, cursorPoint.x)
    && isInRange(graphGeometry.axesGeometry[Axis2D.Y].pl, graphGeometry.axesGeometry[Axis2D.Y].pu, cursorPoint.y)

  // Don't draw anything if cursor isn't within the graph area (this excludes the padding area too)
  if (!isCursorWithinGraphArea)
    return

  let highlightedDatums: { [seriesKey: string]: NearestDatum } = null
  let nearestDatumOfAllSeries: NearestDatum = null

  if (props.datumSnapOptions?.mode !== DatumSnapMode.NONE) {
    // Determine the nearest datum to the cursor of each series
    const nearestDatums = determineNearestDatums(
      graphGeometry.datumKdTrees,
      cursorPoint,
      props.datumSnapOptions?.distanceThresholdPx,
      props.datumSnapOptions?.excludedSeriesKeys,
    )
    // Determine the nearest datum to the cursor out of all the series
    nearestDatumOfAllSeries = determineNearestDatumOfAllSeries(nearestDatums)
    // Exclude the nearest datums that are too far away from the nearest datum of them all
    const distanceFn = createDatumDistanceFunction(props?.datumSnapOptions?.mode)
    highlightedDatums = filterDict(nearestDatums, (_, nearestDatum) => (nearestDatum != null
      && distanceFn(nearestDatum, nearestDatumOfAllSeries) < (props.datumSnapOptions?.seriesGroupingDistanceThresholdPx ?? 5)))
  }

  // Draw datam highlight(s)
  if (highlightedDatums != null) {
    if (props.visibilityOptions?.showDatumHighlight ?? true)
      drawDatumHighlights(ctx, highlightedDatums, props)
  }

  // Draw the vertical and horizontal lines, intersecting at where the cursor is
  if (getShouldDrawCursorPositionLine(props, Axis2D.X))
    drawCursorPositionLine(ctx, cursorPoint, nearestDatumOfAllSeries, graphGeometry.axesGeometry, Axis2D.X, props)
  if (getShouldDrawCursorPositionLine(props, Axis2D.Y))
    drawCursorPositionLine(ctx, cursorPoint, nearestDatumOfAllSeries, graphGeometry.axesGeometry, Axis2D.Y, props)

  // Draw the axis value labels at the cursor co-ordinates (next to the axes)
  if (getShouldDrawCursorPositionValueLabel(props, Axis2D.X))
    drawCursorPositionValueLabel(ctx, cursorPoint, nearestDatumOfAllSeries, graphGeometry.axesGeometry, Axis2D.X, props)
  if (getShouldDrawCursorPositionValueLabel(props, Axis2D.Y))
    drawCursorPositionValueLabel(ctx, cursorPoint, nearestDatumOfAllSeries, graphGeometry.axesGeometry, Axis2D.Y, props)

  // Tooltip is drawn last, since that has to be on top over everything else
  if (highlightedDatums != null) {
    if (getShouldDrawTooltip(props))
      drawTooltip(drawer, cursorPoint, highlightedDatums, nearestDatumOfAllSeries, props)
  }
}

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  // eslint-disable-next-line no-param-reassign
  canvas.style.cursor = 'crosshair'

  const drawer = createCanvasDrawer(canvas, props.heightPx, props.widthPx)

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    draw(drawer, props, graphGeometry, { x: e.offsetX, y: e.offsetY })
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => drawer.clearRenderingSpace()
}

export default render
