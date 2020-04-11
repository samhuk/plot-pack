import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'
import DatumSnapMode from './types/DatumSnapMode'
import { Point2D } from '../../common/types/geometry'
import { drawCursorPositionValueLabels } from './cursorPositionValueLabel'
import { drawCursorPositionLines } from './cursorPositionLine'
import DatumHighlightAppearanceType from './types/DatumHighlightAppearanceType'
import { drawDatumHighlight } from './highlightedMarker'
import PositionedDatum from './types/PositionedDatum'
import KdTreeNearestResult from './types/KdTreeNearestResult'

const determineNearestDatum = (
  kdTree: any,
  cursorPoint: Point2D,
  datumFocusDistanceThresholdPx: number,
) => {
  // TODO: ADD THIS KDTREE OBJECT TO THE GRAPH GEOMETRY!
  const nearestDatumResult: KdTreeNearestResult<PositionedDatum>[] = kdTree.nearest({ pX: cursorPoint.x, pY: cursorPoint.y }, 1)
  if (datumFocusDistanceThresholdPx == null || nearestDatumResult[0][1] <= datumFocusDistanceThresholdPx)
    return nearestDatumResult[0][0]

  return null
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

  // Determine the nearest point to the cursor
  const nearestDatum = determineNearestDatum(graphGeometry.datumKdTree, cursorPoint, props.datumSnapDistanceThresholdPx)

  // Draw the highlight for the nearest point to the cursor
  if (nearestDatum != null && props.datumSnapMode !== DatumSnapMode.NONE && props.datumHighlightAppearance !== DatumHighlightAppearanceType.NONE) {
    if (typeof props.datumHighlightAppearance !== 'function') {
      drawDatumHighlight(ctx, props, nearestDatum)
    }
    else {
      ctx.save()
      props.datumHighlightAppearance(ctx, nearestDatum)
      ctx.restore()
    }
  }
  // Draw the vertical and horizontal lines, intersecting at where the cursor is
  drawCursorPositionLines(ctx, cursorPoint, nearestDatum, graphGeometry.xAxis, graphGeometry.yAxis, props)
  // Draw the axis value labels at the cursor co-ordinates (next to the axes)
  drawCursorPositionValueLabels(ctx, cursorPoint, nearestDatum, graphGeometry.xAxis, graphGeometry.yAxis, props)
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
