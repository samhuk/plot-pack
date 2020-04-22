import { Axis2D } from '../../common/types/geometry'

import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import { drawCustomMarker, drawStandardMarker } from './marker'
import PositionedDatum from './types/PositionedDatum'
import drawDatumsConnectingLine from './connectingLine'
import { drawXAxisGridLines, drawYAxisGridLines } from './gridLines'
import { drawXAxisAxisMarkerLabels, drawYAxisAxisMarkerLabels } from './axisMarkerLabels'
import { drawXAxisAxisMarkerLines, drawYAxisAxisMarkerLines } from './axisMarkerLines'
import { drawXAxisLine, drawYAxisLine } from './axisLines'
import { drawStraightLineOfBestFit } from './straightLineOfBestFit'
import drawAxesLabels from './axisLabels'
import drawDatumErrorBarsForDatums from './errorBars'
import AxesGeometry from './types/AxesGeometry'

const getShouldShowAxisLine = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showAxisLine
    ?? props.visibilityOptions?.showAxesLines
    ?? true
)

const getShouldShowAxisGridLines = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showGridLines
    ?? props.visibilityOptions?.showGridLines
    ?? true
)

const getShouldShowAxisMarkerLines = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showAxisMarkerLines
    ?? props.visibilityOptions?.showAxesMarkerLines
    ?? true
)

const getShouldShowAxisMarkerLabels = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showAxisMarkerLabels
    ?? props.visibilityOptions?.showAxesMarkerLabels
    ?? true
)

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
  props.seriesOptions?.[seriesKey]?.markerOptions?.customOptions?.doesCompliment
    ?? props.markerOptions?.customOptions?.doesCompliment
    ?? true
)

/**
 * Determines whether a connecting line should be shown for the given series.
 */
export const getShouldShowConnectingLine = (props: Options, seriesKey: string) => (
  // Series visibility options takes precedence
  props.seriesOptions?.[seriesKey]?.visibilityOptions?.showConnectingLine
    // ...then general visibility options
    ?? props.visibilityOptions?.showConnectingLine
    // ...else default to false
    ?? false
)

const getShouldShowErrorBars = (props: Options, seriesKey: string, axis: Axis2D) => (
  props.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.mode
    ?? props?.errorBarsOptions?.[axis]?.mode
) != null

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

const drawGraph = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  // Show axis lines by default
  if (getShouldShowAxisLine(props, Axis2D.X))
    drawXAxisLine(ctx, axesGeometry, props)
  if (getShouldShowAxisLine(props, Axis2D.Y))
    drawYAxisLine(ctx, axesGeometry, props)

  // Show grid lines by default
  if (getShouldShowAxisGridLines(props, Axis2D.X))
    drawXAxisGridLines(ctx, axesGeometry, props)
  if (getShouldShowAxisGridLines(props, Axis2D.Y))
    drawYAxisGridLines(ctx, axesGeometry, props)

  // Show axis marker lines by default
  if (getShouldShowAxisMarkerLines(props, Axis2D.X))
    drawXAxisAxisMarkerLines(ctx, axesGeometry, props)
  if (getShouldShowAxisMarkerLines(props, Axis2D.Y))
    drawYAxisAxisMarkerLines(ctx, axesGeometry, props)

  // Show axis marker labels by default
  if (getShouldShowAxisMarkerLabels(props, Axis2D.X))
    drawXAxisAxisMarkerLabels(ctx, axesGeometry, props)
  if (getShouldShowAxisMarkerLabels(props, Axis2D.Y))
    drawYAxisAxisMarkerLabels(ctx, axesGeometry, props)

  drawAxesLabels(ctx, axesGeometry, props)
}

const drawSeriesData = (
  ctx: CanvasRenderingContext2D,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  if (getShouldShowCustomMarkers(props, seriesKey))
    drawCustomDatumMarkers(ctx, positionedDatums, props, seriesKey)
  if (getShouldShowMarkers(props, seriesKey))
    drawDatumMarkers(ctx, positionedDatums, props, seriesKey)
  if (getShouldShowErrorBars(props, seriesKey, Axis2D.X))
    drawDatumErrorBarsForDatums(ctx, positionedDatums, props, seriesKey, Axis2D.X)
  if (getShouldShowErrorBars(props, seriesKey, Axis2D.Y))
    drawDatumErrorBarsForDatums(ctx, positionedDatums, props, seriesKey, Axis2D.Y)
  if (getShouldShowConnectingLine(props, seriesKey))
    drawDatumsConnectingLine(ctx, positionedDatums, props, seriesKey)
}

const drawBackground = (ctx: CanvasRenderingContext2D, props: Options) => {
  const fillingRectPath = new Path2D()
  fillingRectPath.rect(0, 0, props.widthPx, props.heightPx)
  ctx.fillStyle = props.backgroundColor ?? 'white'
  ctx.fill(fillingRectPath)
}

export const draw = (ctx: CanvasRenderingContext2D, g: GraphGeometry, props: Options) => {
  ctx.clearRect(0, 0, props.widthPx, props.heightPx)

  drawBackground(ctx, props)

  // Draw the base graph, i.e. axes, grid lines, labels, title, etc.
  drawGraph(ctx, g.axesGeometry, props)

  // Draw series data for each series, i.e. markers, error bars, connecting line, etc.
  Object.entries(g.positionedDatums)
    .forEach(([seriesKey, positionedDatums]) => drawSeriesData(ctx, positionedDatums, props, seriesKey))

  // Draw straight lines of best fit for each series
  Object.entries(g.bestFitStraightLineEquations)
    .filter(([seriesKey, eq]) => eq != null && getShouldShowLineOfBestFit(props, seriesKey))
    .forEach(([seriesKey, eq]) => drawStraightLineOfBestFit(ctx, eq, g.axesGeometry, props, seriesKey))
}
