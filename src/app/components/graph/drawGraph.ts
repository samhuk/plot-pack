import { Axis2D } from '../../common/types/geometry'

import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import { drawCustomMarker, drawStandardMarker } from './marker'
import PositionedDatum from './types/PositionedDatum'
import { drawConnectingLine } from './connectingLine'
import { drawXAxisGridLines, drawYAxisGridLines } from './gridLines'
import { drawXAxisAxisMarkerLabels, drawYAxisAxisMarkerLabels } from './markerLabels'
import { drawXAxisAxisMarkerLines, drawYAxisAxisMarkerLines } from './axisMarkerLines'
import { drawXAxisLine, drawYAxisLine } from './axisLines'
import { drawStraightLineOfBestFit } from './straightLineOfBestFit'
import drawAxisLabel from './axisLabels'

export const getXAxisYPosition = (orientation: XAxisOrientation, plY: number, puY: number, yAxisPOrigin: number) => {
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

export const getYAxisXPosition = (orientation: YAxisOrientation, plX: number, puX: number, xAxisPOrigin: number) => {
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

/**
 * Determines whether markers should be shown for the given series.
 */
export const getShouldShowMarkers = (props: Options, seriesKey: string) => (
  // Series visibility options takes precedence
  props.seriesOptions?.[seriesKey]?.visibilityOptions?.showMarkers
    // ...then general visibility options
    ?? props.visibilityOptions?.showMarkers
    // ...else default to true
    ?? true
) && (
  props.markerOptions?.customOptions?.doesCompliment ?? true
)

/**
 * Determines whether a connecting line should be shown for the given series.
 */
export const getShouldShowConnectingLine = (props: Options, seriesKey: string) => (
  // Series visibility options takes precedence
  props.seriesOptions?.[seriesKey]?.visibilityOptions?.showLine
    // ...then general visibility options
    ?? props.visibilityOptions?.showConnectingLine
    // ...else default to false
    ?? false
)

/**
 * Determines whether to draw a custom marker, via determining if the functions
 * required to do so have been defined.
 */
const getShouldShowCustomMarkers = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.markerOptions?.customOptions?.customRenderFunction
    ?? props?.markerOptions?.customOptions?.customRenderFunction != null
)

const getShouldShowLineOfBestFit = (props: Options, seriesKey: string) => (
  // Series visibility options takes precedence
  props.seriesOptions?.[seriesKey]?.visibilityOptions?.showStraightLineOfBestFit
    // ...then general visibility options
    ?? props.visibilityOptions?.showStraightLineOfBestFit
    // ...else default to false
    ?? false
)

const drawDatumConnectingLine = (
  ctx: CanvasRenderingContext2D,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  if (positionedDatums.length === 0)
    return

  ctx.moveTo(positionedDatums[0].fpX, positionedDatums[0].fpY)
  let prevPx = 0
  let prevPy = 0
  for (let i = 0; i < positionedDatums.length; i += 1) {
    const { fpX, fpY } = positionedDatums[i]
    if (i > 0)
      drawConnectingLine(ctx, fpX, fpY, prevPx, prevPy, props, seriesKey)
    prevPx = fpX
    prevPy = fpY
  }
}

const drawCustomDatumMarkers = (
  ctx: CanvasRenderingContext2D,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  for (let i = 0; i < positionedDatums.length; i += 1)
    drawCustomMarker(ctx, positionedDatums[i], positionedDatums[i - 1], positionedDatums[i + 1], props, seriesKey)
}

const drawDatumMarkers = (
  ctx: CanvasRenderingContext2D,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  for (let i = 0; i < positionedDatums.length; i += 1) {
    const { fpX, fpY } = positionedDatums[i]
    drawStandardMarker(ctx, fpX, fpY, props, seriesKey)
  }
}

export const draw = (ctx: CanvasRenderingContext2D, g: GraphGeometry, props: Options) => {
  ctx.clearRect(0, 0, props.widthPx, props.heightPx)

  const fillingRectPath = new Path2D()
  fillingRectPath.rect(0, 0, props.widthPx, props.heightPx)
  ctx.fillStyle = props.backgroundColor ?? 'white'
  ctx.fill(fillingRectPath)

  // Show axis lines by default
  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showAxisLine ?? props.visibilityOptions?.showAxesLines ?? true)
    drawXAxisLine(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showAxisLine ?? props.visibilityOptions?.showAxesLines ?? true)
    drawYAxisLine(ctx, g.yAxis, g.xAxis, props)

  // Show grid lines by default
  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showGridLines ?? props.visibilityOptions?.showGridLines ?? true)
    drawXAxisGridLines(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showGridLines ?? props.visibilityOptions?.showGridLines ?? true)
    drawYAxisGridLines(ctx, g.yAxis, g.xAxis, props)

  // Show axis marker lines by default
  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showAxisMarkerLines ?? props.visibilityOptions?.showAxesMarkerLines ?? true)
    drawXAxisAxisMarkerLines(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showAxisMarkerLines ?? props.visibilityOptions?.showAxesMarkerLines ?? true)
    drawYAxisAxisMarkerLines(ctx, g.yAxis, g.xAxis, props)

  // Show axis marker labels by default
  if (props.axesOptions?.[Axis2D.X]?.visibilityOptions?.showAxisMarkerLabels ?? props.visibilityOptions?.showAxesMarkerLabels ?? true)
    drawXAxisAxisMarkerLabels(ctx, g.xAxis, g.yAxis, props)
  if (props.axesOptions?.[Axis2D.Y]?.visibilityOptions?.showAxisMarkerLabels ?? props.visibilityOptions?.showAxesMarkerLabels ?? true)
    drawYAxisAxisMarkerLabels(ctx, g.yAxis, g.xAxis, props)

  // Draw custom datum markers for each series
  Object.entries(g.positionedDatums)
    .filter(([seriesKey]) => getShouldShowCustomMarkers(props, seriesKey))
    .forEach(([seriesKey, positionedDatums]) => (
      drawCustomDatumMarkers(ctx, positionedDatums, props, seriesKey)
    ))

  // Draw standard datum markers for each series
  Object.entries(g.positionedDatums)
    .filter(([seriesKey]) => getShouldShowMarkers(props, seriesKey))
    .forEach(([seriesKey, positionedDatums]) => (
      drawDatumMarkers(ctx, positionedDatums, props, seriesKey)
    ))

  // Draw datum connecting line for each series
  Object.entries(g.positionedDatums)
    .filter(([seriesKey]) => getShouldShowConnectingLine(props, seriesKey))
    .forEach(([seriesKey, positionedDatums]) => (
      drawDatumConnectingLine(ctx, positionedDatums, props, seriesKey)
    ))

  // Draw straight lines of best fit for each series
  Object.entries(g.bestFitStraightLineEquations)
    .filter(([seriesKey, eq]) => eq != null && getShouldShowLineOfBestFit(props, seriesKey))
    .forEach(([seriesKey, eq]) => drawStraightLineOfBestFit(ctx, eq, g, props, seriesKey))

  drawAxisLabel(ctx, Axis2D.X, g, props)
  drawAxisLabel(ctx, Axis2D.Y, g, props)
}
