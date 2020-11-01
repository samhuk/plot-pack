import { Options } from '../types/Options'
import { isInRange } from '../../../common/helpers/math'
import { Point2D, Axis2D } from '../../../common/types/geometry'
import { getShouldDrawCursorPositionValueLabel, drawCursorPositionValueLabel } from './cursorPositionValueLabel'
import { getShouldDrawCursorPositionLine, drawCursorPositionLine } from './cursorPositionLine'
import { drawDatumHighlight } from './datumHighlight'
import ProcessedDatum from '../types/ProcessedDatum'
import KdTree from '../types/KdTree'
import { mapDict, filterDict } from '../../../common/helpers/dict'
import drawTooltip, { getShouldDrawTooltip } from './tooltip'
import DatumSnapMode from '../types/DatumSnapMode'
import { CanvasDrawer } from '../../../common/drawer/types'
import { createDatumDistanceFunction } from '../geometry/datumDistance'
import AxesGeometry from '../types/AxesGeometry'
import PlotInteractivity from '../types/PlotInteractivity'

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

  // This happens if there was no datums that formed the kdTree
  if (nearestDatumResult == null || nearestDatumResult.length === 0)
    return null

  // If nearest datum is outside the threshold distance
  if (datumFocusDistanceThresholdPx != null && nearestDatumResult[0][1] >= datumFocusDistanceThresholdPx)
    return null

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

const isPositionInAxes = (axesGeometry: AxesGeometry, position: Point2D) => (
  isInRange(axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu, position.x)
    && isInRange(axesGeometry[Axis2D.Y].pl, axesGeometry[Axis2D.Y].pu, position.y)
)

export const isMouseEventInAxes = (axesGeometry: AxesGeometry, cursorPositionFromEvent: { offsetX: number, offsetY: number }) => (
  isPositionInAxes(axesGeometry, { x: cursorPositionFromEvent.offsetX, y: cursorPositionFromEvent.offsetY })
)

const draw = (
  drawer: CanvasDrawer,
  props: Options,
  axesGeometry: AxesGeometry,
  datumKdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> },
  cursorPoint: Point2D,
) => {
  drawer.clearRenderingSpace()
  const ctx = drawer.getRenderingContext()

  // Determine if the cursor is within the chart area
  const isCursorWithinChartArea = isPositionInAxes(axesGeometry, cursorPoint)

  // Don't draw anything if cursor isn't within the chart area (this excludes the padding area too)
  if (!isCursorWithinChartArea)
    return

  let highlightedDatums: { [seriesKey: string]: NearestDatum } = null
  let nearestDatumOfAllSeries: NearestDatum = null

  if (props.datumSnapOptions?.mode !== DatumSnapMode.NONE) {
    // Determine the nearest datum to the cursor of each series
    const nearestDatums = determineNearestDatums(
      datumKdTrees,
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
    drawCursorPositionLine(ctx, cursorPoint, nearestDatumOfAllSeries, axesGeometry, Axis2D.X, props)
  if (getShouldDrawCursorPositionLine(props, Axis2D.Y))
    drawCursorPositionLine(ctx, cursorPoint, nearestDatumOfAllSeries, axesGeometry, Axis2D.Y, props)

  // Draw the axis value labels at the cursor co-ordinates (next to the axes)
  if (getShouldDrawCursorPositionValueLabel(props, Axis2D.X))
    drawCursorPositionValueLabel(drawer, cursorPoint, nearestDatumOfAllSeries, axesGeometry, Axis2D.X, props)
  if (getShouldDrawCursorPositionValueLabel(props, Axis2D.Y))
    drawCursorPositionValueLabel(drawer, cursorPoint, nearestDatumOfAllSeries, axesGeometry, Axis2D.Y, props)

  // Tooltip is drawn last, since that has to be on top over everything else
  if (highlightedDatums != null) {
    if (getShouldDrawTooltip(props))
      drawTooltip(drawer, cursorPoint, highlightedDatums, nearestDatumOfAllSeries, props)
  }
}

export const drawPlotInteractivity = (
  drawer: CanvasDrawer,
  props: Options,
  axesGeometry: AxesGeometry,
  datumKdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> },
): PlotInteractivity => ({
  onMouseMove: (e: MouseEvent) => draw(drawer, props, axesGeometry, datumKdTrees, { x: e.offsetX, y: e.offsetY }),
  onMouseLeave: () => drawer.clearRenderingSpace(),
})

export default drawPlotInteractivity
