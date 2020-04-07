import { Axis2D } from '../../common/types/geometry'
import AxisOptions from './types/AxisOptions'
import Notation from './types/Notation'
import { roundDecimalPlaces, boundToRange } from '../../common/helpers/math'

import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import { drawCustomMarker, drawStandardMarker } from './marker'

const DEFAULT_AXIS_LINE_WIDTH = 2
const DEFAULT_GRID_LINE_WIDTH = 0.5
const DEFAULT_MARKER_LINE_WIDTH = 3
const DEFAULT_LINE_WIDTH = 2
const DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY = 'Helvetica'
const DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE = 9
const DEFAULT_BEST_FIT_LINE_WIDTH = 2

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

const drawXAxisLine = (ctx: CanvasRenderingContext2D, xAxis: AxisGeometry, yAxis: AxisGeometry, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.X)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const y = getXAxisYPosition(props.axesOptions[Axis2D.X].orientation as XAxisOrientation, yAxis.pl, yAxis.pu, yAxis.pOrigin)

  const path = new Path2D()
  path.moveTo(xAxis.pl, y)
  path.lineTo(xAxis.pu, y)
  ctx.stroke(path)
}

const drawYAxisLine = (ctx: CanvasRenderingContext2D, yAxis: AxisGeometry, xAxis: AxisGeometry, props: Options) => {
  const lineWidth = getAxisLineWidth(props, Axis2D.Y)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getAxisLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const x = getYAxisXPosition(props.axesOptions[Axis2D.Y].orientation as YAxisOrientation, xAxis.pl, xAxis.pu, xAxis.pOrigin)

  const path = new Path2D()
  path.moveTo(x, yAxis.pl)
  path.lineTo(x, yAxis.pu)
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
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.X)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.X)

  const y = getXAxisYPosition(props.axesOptions[Axis2D.X].orientation as XAxisOrientation, yAxis.pl, yAxis.pu, yAxis.pOrigin)

  const path = new Path2D()
  for (let i = 0; i < xAxis.numGridLines; i += 1) {
    const x = xAxis.pl + xAxis.dpGrid * i
    path.moveTo(x, y)
    path.lineTo(x, y + 5)
  }
  ctx.stroke(path)
}

const drawYAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  yAxis: AxisGeometry,
  xAxis: AxisGeometry,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.Y)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.Y)

  const x = getYAxisXPosition(props.axesOptions[Axis2D.Y].orientation as YAxisOrientation, xAxis.pl, xAxis.pu, xAxis.pOrigin)

  const path = new Path2D()
  for (let i = 0; i < yAxis.numGridLines; i += 1) {
    path.moveTo(x, yAxis.pl + yAxis.dpGrid * i)
    path.lineTo(x - 5, yAxis.pl + yAxis.dpGrid * i)
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
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.X)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.X)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < xAxis.numGridLines; i += 1) {
    const x = xAxis.pl + xAxis.dpGrid * i
    path.moveTo(x, yAxis.pl)
    path.lineTo(x, yAxis.pu)
  }
  ctx.stroke(path)
}

const drawYAxisGridLines = (
  ctx: CanvasRenderingContext2D,
  yAxis: AxisGeometry,
  xAxis: AxisGeometry,
  props: Options,
) => {
  const lineWidth = getGridLineWidth(props, Axis2D.Y)
  if (lineWidth <= 0)
    return
  ctx.strokeStyle = getGridLineColor(props, Axis2D.Y)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  for (let i = 0; i < yAxis.numGridLines; i += 1) {
    const y = yAxis.pl + yAxis.dpGrid * i
    path.moveTo(xAxis.pl, y)
    path.lineTo(xAxis.pu, y)
  }
  ctx.stroke(path)
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

  ctx.strokeStyle = lineOptions?.color ?? 'black'
  ctx.lineWidth = lineOptions?.width ?? DEFAULT_LINE_WIDTH

  const path = new Path2D()
  path.moveTo(prevPx, prevPy)
  path.lineTo(pX, pY)
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
    if (props.visibilityOptions?.showMarkers === true && props.markerOptions?.customOptions?.complimentStandardOptions !== false)
      drawStandardMarker(ctx, props.markerOptions, pX, pY)

    // Show line by default
    if (props.visibilityOptions?.showLine !== false && i > 0)
      drawConnectingLine(ctx, pX, pY, prevPx, prevPy, props.lineOptions)
    prevPx = pX
    prevPy = pY
  }
}

const drawLineOfBestFit = (ctx: CanvasRenderingContext2D, g: GraphGeometry, props: Options) => {
  // Calculate the bounded lower Y value (bounded to the available pixel space)
  const vlY = boundToRange(g.bestFitStraightLineEquation.y(g.xAxis.vl), g.yAxis.vl, g.yAxis.vu)
  // Then the corresponding lower X value
  const vlX = g.bestFitStraightLineEquation.x(vlY)
  // Calculate the bounded upper Y value (bounded to the available pixel space)
  const vuY = boundToRange(g.bestFitStraightLineEquation.y(g.xAxis.vu), g.yAxis.vu, g.yAxis.vl)
  // Then the corresponding upper X value
  const vuX = g.bestFitStraightLineEquation.x(vuY)

  const path = new Path2D()

  ctx.save()

  ctx.lineWidth = props.bestFitLineOptions?.lineWidth ?? DEFAULT_BEST_FIT_LINE_WIDTH
  ctx.strokeStyle = props.bestFitLineOptions?.lineColor ?? 'black'
  if (props.bestFitLineOptions?.lineDashPattern?.length > 0)
    ctx.setLineDash(props.bestFitLineOptions.lineDashPattern)

  path.moveTo(g.xAxis.p(vlX), g.yAxis.p(vlY))
  path.lineTo(g.xAxis.p(vuX), g.yAxis.p(vuY))
  ctx.stroke(path)

  ctx.restore()
}

export const draw = (ctx: CanvasRenderingContext2D, g: GraphGeometry, props: Options) => {
  ctx.clearRect(0, 0, props.widthPx, props.heightPx)

  // Show axis lines by default
  if (props.axesOptions[Axis2D.X]?.visibilityOptions?.showAxisLine ?? props.visibilityOptions?.showAxesLines ?? true)
    drawXAxisLine(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions[Axis2D.Y]?.visibilityOptions?.showAxisLine ?? props.visibilityOptions?.showAxesLines ?? true)
    drawYAxisLine(ctx, g.yAxis, g.xAxis, props)

  // Show axis marker lines by default
  if (props.axesOptions[Axis2D.X]?.visibilityOptions?.showAxisMarkerLines ?? props.visibilityOptions?.showAxesMarkerLines ?? true)
    drawXAxisAxisMarkerLines(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions[Axis2D.Y]?.visibilityOptions?.showAxisMarkerLines ?? props.visibilityOptions?.showAxesMarkerLines ?? true)
    drawYAxisAxisMarkerLines(ctx, g.yAxis, g.xAxis, props)

  // Show axis marker labels by default
  if (props.axesOptions[Axis2D.X]?.visibilityOptions?.showAxisMarkerLabels ?? props.visibilityOptions?.showAxesMarkerLabels ?? true)
    drawXAxisAxisMarkerLabels(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions[Axis2D.Y]?.visibilityOptions?.showAxisMarkerLabels ?? props.visibilityOptions?.showAxesMarkerLabels ?? true)
    drawYAxisAxisMarkerLabels(ctx, g.yAxis, g.xAxis, props)

  // Show grid lines by default
  if (props.axesOptions[Axis2D.X]?.visibilityOptions?.showGridLines ?? props.visibilityOptions?.showGridLines ?? true)
    drawXAxisGridLines(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions[Axis2D.Y]?.visibilityOptions?.showGridLines ?? props.visibilityOptions?.showGridLines ?? true)
    drawYAxisGridLines(ctx, g.yAxis, g.xAxis, props)

  drawDataPoints(ctx, g.xAxis.p, g.yAxis.p, props)

  if (g.bestFitStraightLineEquation != null)
    drawLineOfBestFit(ctx, g, props)
}
