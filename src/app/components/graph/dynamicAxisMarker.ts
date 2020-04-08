import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import DatumFocusMode from './types/DatumFocusMode'
import DatumDistanceFunction from './types/DatumDistanceFunction'
import { Axis2D } from '../../common/types/geometry'
import AxisGeometry from './types/AxisGeometry'

type KdTreeNearestDatumResult = [
  PositionedDatum, // The nearest Datum
  number // The distance of the Datum from the given point
]

const KdTree = require('kd-tree-javascript')

const createDatumDistanceFunction = (datumFocusMode: DatumFocusMode): DatumDistanceFunction => {
  const defaultFn = (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.pX - datum2.pX)

  switch (datumFocusMode) {
    case DatumFocusMode.SNAP_NEAREST_X:
      return defaultFn
    case DatumFocusMode.SNAP_NEAREST_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.pY - datum2.pY)
    case DatumFocusMode.SNAP_NEAREST_X_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.sqrt((datum1.pX - datum2.pX) ** 2 + (datum1.pY - datum2.pY) ** 2)
    default:
      return defaultFn
  }
}

const createDatumDimensionStringList = (datumFocusMode: DatumFocusMode): string[] => {
  const defaultValue = ['pX']

  switch (datumFocusMode) {
    case DatumFocusMode.SNAP_NEAREST_X:
      return ['pX']
    case DatumFocusMode.SNAP_NEAREST_Y:
      return ['pY']
    case DatumFocusMode.SNAP_NEAREST_X_Y:
      return ['pX', 'pY']
    default:
      return defaultValue
  }
}

const determineNearestDatum = (
  kdTree: any,
  cursorX: number,
  cursorY: number,
  datumFocusDistanceThresholdPx: number,
) => {
  // TODO: MAKE THIS CUSTOMIZABLE AND MORE POWERFUL!
  // TODO: ADD THIS KDTREE OBJECT TO THE GRAPH GEOMETRY!
  const nearestDatumResult: KdTreeNearestDatumResult[] = kdTree.nearest({ pX: cursorX, pY: cursorY }, 1)
  if (datumFocusDistanceThresholdPx == null || nearestDatumResult[0][1] <= datumFocusDistanceThresholdPx)
    return nearestDatumResult[0][0]

  return null
}

const drawNearestDatumFocus = (ctx: CanvasRenderingContext2D, nearestDatum: PositionedDatum) => {
  const path = new Path2D()
  path.arc(nearestDatum.pX, nearestDatum.pY, 5, 0, 2 * Math.PI)
  ctx.stroke(path)
}

const drawCursorLines = (
  ctx: CanvasRenderingContext2D,
  cursorX: number,
  cursorY: number,
  nearestDatum: PositionedDatum,
  graphGeometry: GraphGeometry,
  props: Options,
) => {
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showCursorLine ?? false) {
    const cursorYLine = new Path2D()
    // Don't snap horizontal y-axis line by default
    const yAxisLineY = nearestDatum != null && (props.axesOptions?.[Axis2D.Y]?.snapCursorLineToNearestDatum ?? false) ? nearestDatum.pY : cursorY
    cursorYLine.moveTo(graphGeometry.xAxis.pu, yAxisLineY)
    cursorYLine.lineTo(graphGeometry.xAxis.pl, yAxisLineY) // The horizontal line

    ctx.lineWidth = props.axesOptions?.[Axis2D.Y]?.cursorLineLineWidth ?? 1
    ctx.strokeStyle = props.axesOptions?.[Axis2D.Y]?.cursorLineColor ?? 'black'
    ctx.stroke(cursorYLine)
  }

  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showCursorLine ?? false) {
    const cursorXLine = new Path2D()
    // Snap vertical x-axis line by default
    const xAxisLineX = nearestDatum != null && (props.axesOptions?.[Axis2D.X]?.snapCursorLineToNearestDatum ?? true) ? nearestDatum.pX : cursorX
    cursorXLine.moveTo(xAxisLineX, graphGeometry.yAxis.pu)
    cursorXLine.lineTo(xAxisLineX, graphGeometry.yAxis.pl) // The vertical line

    ctx.lineWidth = props.axesOptions?.[Axis2D.X]?.cursorLineLineWidth ?? 2
    ctx.strokeStyle = props.axesOptions?.[Axis2D.X]?.cursorLineColor ?? 'black'
    ctx.stroke(cursorXLine)
  }
}

const drawCursorPositionValueLabels = (
  ctx: CanvasRenderingContext2D,
  cursorX: number,
  cursorY: number,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  ctx.lineWidth = 1

  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showCursorPositionValueLabel ?? true) {
    const xAxisText = xAxis.v(cursorX).toFixed(2)
    ctx.fillText(xAxisText, cursorX + 5, yAxis.pl - 5)
  }
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showCursorPositionValueLabel ?? true) {
    const yAxisText = yAxis.v(cursorY).toFixed(2)
    ctx.fillText(yAxisText, xAxis.pl + 5, cursorY - 5)
  }
}

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  // eslint-disable-next-line no-param-reassign
  canvas.style.cursor = 'crosshair'

  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  ctx.strokeStyle = '#333'

  // Create the K-D tree for quicker nearest neighboor searching
  // eslint-disable-next-line new-cap
  const tree = new KdTree.kdTree(
    graphGeometry.positionedDatums,
    createDatumDistanceFunction(props.datumFocusMode),
    createDatumDimensionStringList(props.datumFocusMode),
  )

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    ctx.clearRect(0, 0, props.widthPx, props.heightPx)
    const x = e.offsetX
    const y = e.offsetY

    if (isInRange(graphGeometry.xAxis.pl, graphGeometry.xAxis.pu, x) && isInRange(graphGeometry.yAxis.pl, graphGeometry.yAxis.pu, y)) {
      drawCursorPositionValueLabels(ctx, x, y, graphGeometry.xAxis, graphGeometry.yAxis, props)

      // Highlight the nearest point to the cursor
      const nearestDatum = determineNearestDatum(tree, x, y, props.datumFocusDistanceThresholdPx)
      if (nearestDatum != null && props.datumFocusMode !== DatumFocusMode.NONE)
        drawNearestDatumFocus(ctx, nearestDatum)

      drawCursorLines(ctx, x, y, nearestDatum, graphGeometry, props)
    }
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => ctx.clearRect(0, 0, props.widthPx, props.heightPx)
}

export default render
