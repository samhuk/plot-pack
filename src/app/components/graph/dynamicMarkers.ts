import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import DatumSnapMode from './types/DatumSnapMode'
import DatumDistanceFunction from './types/DatumDistanceFunction'
import { Point2D } from '../../common/types/geometry'
import { drawCursorPositionValueLabels } from './cursorPositionValueLabel'
import { drawCursorPositionLines } from './cursorPositionLine'
import DatumHighlightAppearanceType from './types/DatumHighlightAppearanceType'
import { drawDatumHighlight } from './highlightedMarker'

type KdTreeNearestDatumResult = [
  PositionedDatum, // The nearest Datum
  number // The distance of the Datum from the given point
]

const KdTree = require('kd-tree-javascript')

const createDatumDistanceFunction = (datumSnapMode: DatumSnapMode): DatumDistanceFunction => {
  const defaultFn = (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.pX - datum2.pX)

  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return defaultFn
    case DatumSnapMode.SNAP_NEAREST_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.pY - datum2.pY)
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.sqrt((datum1.pX - datum2.pX) ** 2 + (datum1.pY - datum2.pY) ** 2)
    default:
      return defaultFn
  }
}

const createDatumDimensionStringList = (datumSnapMode: DatumSnapMode): string[] => {
  const defaultValue = ['pX']

  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return ['pX']
    case DatumSnapMode.SNAP_NEAREST_Y:
      return ['pY']
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return ['pX', 'pY']
    default:
      return defaultValue
  }
}

const determineNearestDatum = (
  kdTree: any,
  cursorPoint: Point2D,
  datumFocusDistanceThresholdPx: number,
) => {
  // TODO: ADD THIS KDTREE OBJECT TO THE GRAPH GEOMETRY!
  const nearestDatumResult: KdTreeNearestDatumResult[] = kdTree.nearest({ pX: cursorPoint.x, pY: cursorPoint.y }, 1)
  if (datumFocusDistanceThresholdPx == null || nearestDatumResult[0][1] <= datumFocusDistanceThresholdPx)
    return nearestDatumResult[0][0]

  return null
}

const draw = (
  ctx: CanvasRenderingContext2D,
  props: Options,
  graphGeometry: GraphGeometry,
  kdTree: any,
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
  const nearestDatum = determineNearestDatum(kdTree, cursorPoint, props.datumSnapDistanceThresholdPx)

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

  // Create the K-D tree for quicker nearest neighboor searching
  // eslint-disable-next-line new-cap
  const kdTree = new KdTree.kdTree(
    graphGeometry.positionedDatums,
    createDatumDistanceFunction(props.datumSnapMode),
    createDatumDimensionStringList(props.datumSnapMode),
  )

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    draw(ctx, props, graphGeometry, kdTree, { x: e.offsetX, y: e.offsetY })
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => ctx.clearRect(0, 0, props.widthPx, props.heightPx)
}

export default render
