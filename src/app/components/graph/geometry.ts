import DataPoint from './types/DataPoint'
import AxesRange from './types/AxesRange'
import { Axis2D } from '../../common/types/geometry'
import AxisOptions from './types/AxisOptions'
import Notation from './types/Notation'
import { roundDecimalPlaces, boundToRange } from '../../common/helpers/math'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../common/helpers/stat'
import MarkerType from './types/MarkerType'
import MarkerOptions from './types/MarkerOptions'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'

const DEFAULT_AXIS_LINE_WIDTH = 2
const DEFAULT_GRID_LINE_WIDTH = 0.5
const DEFAULT_MARKER_LINE_WIDTH = 3
const DEFAULT_LINE_WIDTH = 2
const DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY = 'Helvetica'
const DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE = 9
const DEFAULT_MARKER_SIZE = 4
const DEFAULT_MARKER_TYPE = MarkerType.DOT

/**
 * Determines the minimum and maximum values for each axis
 */
const calculateAxesValueRanges = (data: DataPoint[]): AxesRange => {
  let xMin = 0
  let xMax = 0
  let yMin = 0
  let yMax = 0
  for (let i = 0; i < data.length; i += 1) {
    const point = data[i]
    // x axis
    const x = point.x ?? 0
    const xLower = x - (point.dx != null ? point.dx / 2 : (point.dxMinus ?? 0))
    const xUpper = x + (point.dx != null ? point.dx / 2 : (point.dxPlus ?? 0))
    const _xMax = Math.max(x, xLower, xUpper)
    const _xMin = Math.min(x, xLower, xUpper)
    if (_xMax > xMax)
      xMax = _xMax
    if (_xMin < xMin)
      xMin = _xMin
    // y axis
    const y = point.y ?? 0
    const yLower = y - (point.dy != null ? point.dy / 2 : (point.dyMinus ?? 0))
    const yUpper = y + (point.dy != null ? point.dy / 2 : (point.dyMinus ?? 0))
    const _yMax = Math.max(y, yLower, yUpper)
    const _yMin = Math.min(y, yLower, yUpper)
    if (_yMax > yMax)
      yMax = _yMax
    if (_yMin < yMin)
      yMin = _yMin
  }

  return {
    vlX: xMin,
    vuX: xMax,
    vlY: yMin,
    vuY: yMax,
  }
}

const createAxisGridLabelText = (value: number, axisOptions: AxisOptions) => {
  const defaultValue = value.toString()

  if (axisOptions == null)
    return defaultValue

  if (axisOptions.notation == null || axisOptions.notation === Notation.DECIMAL) {
    if (axisOptions.numFigures != null)
      return roundDecimalPlaces(value, axisOptions.numFigures).toFixed(axisOptions.numFigures)
    return defaultValue
  }
  if (axisOptions.notation === Notation.SCIENTIFIC) {
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(value)))
    const normalizedValue = value / (10 ** orderOfMagnitude)
    const roundedValue = axisOptions.numFigures != null
      ? roundDecimalPlaces(normalizedValue, axisOptions.numFigures + 1).toFixed(axisOptions.numFigures)
      : normalizedValue
    return `${roundedValue} x10^${orderOfMagnitude}`
  }

  return defaultValue
}

const calculateAxisProperties = (vl: number, vu: number, pl: number, pu: number, dpMin: number): AxisGeometry => {
  const dp = pu - pl
  const dvGridMin = Math.abs(dpMin * ((vu - vl) / dp))

  // i.e. Given a dvGridMin of 360...
  // This is 2
  const magDvGridMin = Math.floor(Math.log10(dvGridMin))
  // This is 100
  const magMultiplier = 10 ** magDvGridMin
  // This is 3.6
  const normDvGridMin = dvGridMin / magMultiplier
  // This is 4
  const normPrimeDvGridMin = [2, 4, 5, 10].find(inc => inc > normDvGridMin)
  // This is 400
  const dvGrid = normPrimeDvGridMin * magMultiplier
  // For a vl of 455, this is 400. For a vl of 400, this is 400 (i.e. it's inclusive)
  const vlModDvGrid = vl % dvGrid
  const vlPrime = vl - vlModDvGrid - (vlModDvGrid !== 0 ? dvGrid : 0)
  // For a vu of 880, this is 1200. For a vl of 800, this is 800 (i.e. it's inclusive)
  const vuModDvGrid = vu % dvGrid
  const vuPrime = vu - vuModDvGrid + (vuModDvGrid !== 0 ? dvGrid : 0)

  const dpdv = dp / (vuPrime - vlPrime)

  const dpGrid = dvGrid * dpdv

  const p = (v: number) => dpdv * (v - vlPrime) + pl

  return {
    vl: vlPrime,
    vu: vuPrime,
    pl: p(vlPrime),
    pu: p(vuPrime),
    dvGrid,
    dpGrid,
    p,
    pOrigin: boundToRange(p(0), pl, pu),
    numGridLines: Math.max(0, Math.abs(Math.floor(((vl - vu) / dvGrid))) + 2),
  }
}

// -- Axis lines

const getAxisLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisLineWidth
  ?? props.axesLineOptions?.width
  ?? DEFAULT_AXIS_LINE_WIDTH

const getAxisLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisLineColor
  ?? props.axesLineOptions?.color
  ?? 'black'

const getXAxisYPosition = (orientation: XAxisOrientation, plY: number, puY: number, yAxisPOrigin: number) => {
  switch (orientation) {
    case XAxisOrientation.TOP:
      return puY
    case XAxisOrientation.BOTTOM:
      return plY
    case XAxisOrientation.ORIGIN:
      return yAxisPOrigin
    default:
      return yAxisPOrigin
  }
}

const getYAxisXPosition = (orientation: YAxisOrientation, plX: number, puX: number, xAxisPOrigin: number) => {
  switch (orientation) {
    case YAxisOrientation.LEFT:
      return plX
    case YAxisOrientation.RIGHT:
      return puX
    case YAxisOrientation.ORIGIN:
      return xAxisPOrigin
    default:
      return xAxisPOrigin
  }
}

const drawXAxisLine = (ctx: CanvasRenderingContext2D, plX: number, puX: number, plY: number, puY: number, yAxisPOrigin: number, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.X)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const y = getXAxisYPosition(props.axesOptions[Axis2D.X].orientation as XAxisOrientation, plY, puY, yAxisPOrigin)

  const path = new Path2D()
  path.moveTo(plX, y)
  path.lineTo(puX, y)
  ctx.stroke(path)
}

const drawYAxisLine = (ctx: CanvasRenderingContext2D, plY: number, puY: number, plX: number, puX: number, xAxisPOrigin: number, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.Y)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const x = getYAxisXPosition(props.axesOptions[Axis2D.Y].orientation as YAxisOrientation, plX, puX, xAxisPOrigin)

  const path = new Path2D()
  path.moveTo(x, plY)
  path.lineTo(x, puY)
  ctx.stroke(path)
}

// -- Axis marker lines

const getMarkerLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLineWidth
  ?? props.axesMarkerLineOptions?.width
  ?? DEFAULT_MARKER_LINE_WIDTH

const getMarkerLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLineColor
  ?? props.axesMarkerLineOptions?.color
  ?? 'black'

const drawXAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  numGridLinesX: number,
  plX: number,
  plY: number,
  puY: number,
  xAxisDpGrid: number,
  yAxisPOrigin: number,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.X)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.X)

  const y = getXAxisYPosition(props.axesOptions[Axis2D.X].orientation as XAxisOrientation, plY, puY, yAxisPOrigin)

  const path = new Path2D()
  for (let i = 0; i < numGridLinesX; i += 1) {
    path.moveTo(plX + xAxisDpGrid * i, y)
    path.lineTo(plX + xAxisDpGrid * i, y + 5)
  }
  ctx.stroke(path)
}

const drawYAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  numGridLinesY: number,
  plY: number,
  plX: number,
  puX: number,
  yAxisDpGrid: number,
  xAxisPOrigin: number,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.Y)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.Y)

  const x = getYAxisXPosition(props.axesOptions[Axis2D.Y].orientation as YAxisOrientation, plX, puX, xAxisPOrigin)

  const path = new Path2D()
  for (let i = 0; i < numGridLinesY; i += 1) {
    path.moveTo(x, plY + yAxisDpGrid * i)
    path.lineTo(x - 5, plY + yAxisDpGrid * i)
  }
  ctx.stroke(path)
}

// -- Axis marker labels

const getFontSize = (props: Options, axis: Axis2D) => (props.axesOptions?.[axis]?.axisMarkerLabelFontSize
  ?? props.axesMarkerLabelOptions?.fontSize
  ?? DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE
).toString().concat('px')

const getFontFamily = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelFontFamily
  ?? props.axesMarkerLabelOptions?.fontFamily
  ?? DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY

const getLabelColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelColor
  ?? props.axesMarkerLabelOptions?.color
  ?? 'black'

const drawXAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  ctx.lineWidth = 1
  ctx.font = `${getFontSize(props, Axis2D.X)} ${getFontFamily(props, Axis2D.X)}`.trim()
  ctx.strokeStyle = getLabelColor(props, Axis2D.X)

  const y = getXAxisYPosition(props.axesOptions[Axis2D.X].orientation as XAxisOrientation, yAxis.pl, yAxis.pu, yAxis.pOrigin)

  for (let i = 0; i < xAxis.numGridLines; i += 1) {
    const value = xAxis.vl + xAxis.dvGrid * i
    const x = xAxis.p(value)
    const _y = y + 15
    ctx.strokeText(createAxisGridLabelText(value, props.axesOptions[Axis2D.X]), x, _y)
  }
}

const drawYAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  yAxis: AxisGeometry,
  xAxis: AxisGeometry,
  props: Options,
) => {
  ctx.lineWidth = 1
  ctx.font = `${getFontSize(props, Axis2D.Y)} ${getFontFamily(props, Axis2D.Y)}`.trim()
  ctx.strokeStyle = getLabelColor(props, Axis2D.Y)

  const x = getYAxisXPosition(props.axesOptions[Axis2D.Y].orientation as YAxisOrientation, xAxis.pl, xAxis.pu, xAxis.pOrigin)

  for (let i = 0; i < yAxis.numGridLines; i += 1) {
    const value = yAxis.vl + yAxis.dvGrid * i
    const _x = x - 30
    const y = yAxis.p(value) - 5
    ctx.strokeText(createAxisGridLabelText(value, props.axesOptions[Axis2D.Y]), _x, y)
  }
}

// -- Grid lines

const getGridLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.gridLineWidth
  ?? props.gridLineOptions?.width
  ?? DEFAULT_GRID_LINE_WIDTH

const getGridLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.gridLineColor
  ?? props.gridLineOptions?.color
  ?? 'black'

const drawXAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  numGridLinesX: number,
  plX: number,
  plY: number,
  puY: number,
  dpGridX: number,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.X)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < numGridLinesX; i += 1) {
    const x = plX + dpGridX * i
    path.moveTo(x, plY)
    path.lineTo(x, puY)
  }
  ctx.stroke(path)
}

const drawYAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  numGridLinesY: number,
  plY: number,
  plX: number,
  puX: number,
  dpGridY: number,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.Y)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < numGridLinesY; i += 1) {
    const y = plY + dpGridY * i
    path.moveTo(plX, y)
    path.lineTo(puX, y)
  }
  ctx.stroke(path)
}

const createDotMarkerPath = (x: number, y: number, size: number): Path2D => {
  const path = new Path2D()
  path.moveTo(x, y)
  path.arc(x, y, size / 2, 0, 2 * Math.PI)
  return path
}

const createSquareMarkerPath = (x: number, y: number, size: number): Path2D => {
  const path = new Path2D()
  path.moveTo(x, y)
  const halfSize = size / 2
  path.rect(x - halfSize, y - halfSize, size, size)
  return path
}

const createTriangleMarkerPath = (x: number, y: number, size: number, inversed: boolean): Path2D => {
  const path = new Path2D()
  const halfSize = size / 2
  const inversionFactor = inversed ? -1 : 1
  path.moveTo(x - halfSize, y + inversionFactor * halfSize)
  path.lineTo(x + halfSize, y + inversionFactor * halfSize)
  path.lineTo(x, y - inversionFactor * halfSize)
  path.closePath()
  return path
}

const createMarkerPath = (markerOptions: MarkerOptions, x: number, y: number): Path2D => {
  const markerSize = markerOptions?.size ?? DEFAULT_MARKER_SIZE
  if (markerSize < 0)
    return null

  switch (markerOptions?.type ?? DEFAULT_MARKER_TYPE) {
    case MarkerType.DOT:
      return createDotMarkerPath(x, y, markerSize)
    case MarkerType.SQUARE:
      return createSquareMarkerPath(x, y, markerSize)
    case MarkerType.TRIANGLE:
      return createTriangleMarkerPath(x, y, markerSize, false)
    case MarkerType.UPSIDE_DOWN_TRIANGLE:
      return createTriangleMarkerPath(x, y, markerSize, true)
    default:
      return null
  }
}

const drawStandardMarker = (
  ctx: CanvasRenderingContext2D,
  markerOptions: MarkerOptions,
  pX: number,
  pY: number,
) => {
  const markerPath = createMarkerPath(markerOptions, pX, pY)
  ctx.fillStyle = markerOptions?.color ?? 'black'
  if (markerPath == null)
    return

  const markerType = markerOptions?.type ?? DEFAULT_MARKER_TYPE
  const shouldFill = markerType !== MarkerType.CROSS && markerType !== MarkerType.PLUS
  if (shouldFill)
    ctx.fill(markerPath)
  else
    ctx.stroke(markerPath)
}

const drawCustomMarker = (
  ctx: CanvasRenderingContext2D,
  markerOptions: MarkerOptions,
  pX: number,
  pY: number,
  preceedingDataPoint: DataPoint,
  dataPoint: DataPoint,
  proceedingDataPoint: DataPoint,
) => {
  if (markerOptions?.customOptions?.createPath == null || markerOptions?.customOptions?.renderPath == null)
    return

  ctx.save()
  const path = markerOptions.customOptions.createPath(pX, pY, dataPoint, preceedingDataPoint, proceedingDataPoint)
  if (path != null)
    markerOptions.customOptions.renderPath(ctx, path)
  ctx.restore()
}

const drawConnectingLine = (
  ctx: CanvasRenderingContext2D,
  pX: number,
  pY: number,
  prevPx: number,
  prevPy: number,
  lineOptions: { width?: number, color?: string },
) => {
  if (lineOptions?.width < 0)
    return

  const path = new Path2D()
  path.moveTo(prevPx, prevPy)
  path.lineTo(pX, pY)
  ctx.lineWidth = lineOptions?.width ?? DEFAULT_LINE_WIDTH
  ctx.stroke(path)
}

const drawDataPoints = (
  ctx: CanvasRenderingContext2D,
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
  props: Options,
) => {
  ctx.moveTo(xAxisPFn(props.data[0].x), yAxisPFn(props.data[0].y))
  let prevPx = 0
  let prevPy = 0
  for (let i = 0; i < props.data.length; i += 1) {
    const pX = xAxisPFn(props.data[i].x)
    const pY = yAxisPFn(props.data[i].y)

    drawCustomMarker(ctx, props.markerOptions, pX, pY, props.data[i], props.data[i - 1], props.data[i + 1])
    // Don't show markers by default
    if (props.visibilitySettings?.showMarkers === true && props.markerOptions?.customOptions?.complimentStandardOptions !== false)
      drawStandardMarker(ctx, props.markerOptions, pX, pY)

    // Show line by default
    if (props.visibilitySettings?.showLine !== false && i > 0)
      drawConnectingLine(ctx, pX, pY, prevPx, prevPy, props.lineOptions)
    prevPx = pX
    prevPy = pY
  }
}

const drawLineOfBestFit = (ctx: CanvasRenderingContext2D, g: GraphGeometry) => {
  const vlY = boundToRange(g.bestFitStraightLineEquation.y(g.xAxis.vl), g.yAxis.vl, g.yAxis.vu)
  const vlX = g.bestFitStraightLineEquation.x(vlY)
  const vuY = boundToRange(g.bestFitStraightLineEquation.y(g.xAxis.vu), g.yAxis.vu, g.yAxis.vl)
  const vuX = g.bestFitStraightLineEquation.x(vuY)

  const plX = g.xAxis.p(vlX)
  const plY = g.yAxis.p(vlY)
  const puX = g.xAxis.p(vuX)
  const puY = g.yAxis.p(vuY)

  const path = new Path2D()

  path.moveTo(plX, plY)
  path.lineTo(puX, puY)
  ctx.save()
  ctx.setLineDash([5, 5])
  ctx.lineWidth = 2
  ctx.stroke(path)
  ctx.restore()
}

export const draw = (ctx: CanvasRenderingContext2D, g: GraphGeometry, props: Options) => {
  ctx.clearRect(0, 0, props.widthPx, props.heightPx)

  // Show axis lines by default
  if (props.visibilitySettings?.showAxesLines !== false) {
    drawXAxisLine(ctx, g.xAxis.pl, g.xAxis.pu, g.yAxis.pl, g.yAxis.pu, g.yAxis.pOrigin, props)
    drawYAxisLine(ctx, g.yAxis.pl, g.yAxis.pu, g.xAxis.pl, g.xAxis.pu, g.xAxis.pOrigin, props)
  }

  // Show axis marker lines by default
  if (props.visibilitySettings?.showAxesMarkerLines !== false) {
    drawXAxisAxisMarkerLines(ctx, g.xAxis.numGridLines, g.xAxis.pl, g.yAxis.pl, g.yAxis.pu, g.xAxis.dpGrid, g.yAxis.pOrigin, props)
    drawYAxisAxisMarkerLines(ctx, g.yAxis.numGridLines, g.yAxis.pl, g.xAxis.pl, g.xAxis.pu, g.yAxis.dpGrid, g.xAxis.pOrigin, props)
  }

  // Show axis marker labels by default
  if (props.visibilitySettings?.showAxesMarkerLabels !== false) {
    drawXAxisAxisMarkerLabels(ctx, g.xAxis, g.yAxis, props)
    drawYAxisAxisMarkerLabels(ctx, g.yAxis, g.xAxis, props)
  }

  // Show grid lines by default
  if (props.visibilitySettings?.showGridLines !== false) {
    drawXAxisGridLines(ctx, g.xAxis.numGridLines, g.xAxis.pl, g.yAxis.pl, g.yAxis.pu, g.xAxis.dpGrid, props)
    drawYAxisGridLines(ctx, g.yAxis.numGridLines, g.yAxis.pl, g.xAxis.pl, g.xAxis.pu, g.yAxis.dpGrid, props)
  }

  drawDataPoints(ctx, g.xAxis.p, g.yAxis.p, props)

  if (g.bestFitStraightLineEquation != null)
    drawLineOfBestFit(ctx, g)
}

export const createGraphGeometry = (props: Options): GraphGeometry => {
  const paddingX = 30
  const paddingY = 30
  const defaultGridMinPx = 30

  const { vlX, vuX, vlY, vuY } = calculateAxesValueRanges(props.data)

  // Calculate pixel bounds of axes
  const plX = paddingX
  const puX = props.widthPx - paddingX
  const plY = props.heightPx - paddingY
  const puY = paddingY
  // Calculate the various properties of the axes
  const xAxis = calculateAxisProperties(vlX, vuX, plX, puX, defaultGridMinPx)
  const yAxis = calculateAxisProperties(vlY, vuY, plY, puY, defaultGridMinPx)

  const bestFitStraightLineEquation = props.bestFitLineType === BestFitLineType.STRAIGHT
    ? calculateStraightLineOfBestFit(props.data)
    : null

  return { xAxis, yAxis, bestFitStraightLineEquation }
}
