import { Axis2D, Rect } from '../../common/types/geometry'

import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import { drawCustomMarker, drawStandardMarker, getShouldShowCustomMarkers, getShouldShowMarkers } from './marker'
import PositionedDatum from './types/PositionedDatum'
import drawDatumsConnectingLine, { getShouldShowConnectingLine } from './connectingLine'
import { drawAxisGridLines, getShouldShowAxisGridLines } from './axisGridLines'
import { drawAxisMarkerLabels, getShouldShowAxisMarkerLabels } from './axisMarkerLabels'
import { drawAxisAxisMarkerLines, getShouldShowAxisMarkerLines } from './axisMarkerLines'
import { drawAxisLine, getShouldShowAxisLine } from './axisLines'
import { drawStraightLineOfBestFit } from './straightLineOfBestFit'
import drawAxesLabels from './axisLabels'
import drawDatumErrorBarsForDatums, { getShouldShowErrorBars } from './errorBars'
import AxesGeometry from './types/AxesGeometry'
import drawTitle from './title'
import { CanvasDrawer } from '../../common/drawer/types'
import GraphComponents from './types/GraphComponents'
import GraphComponentRects from './types/GraphComponentRects'

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
  drawer: CanvasDrawer,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  for (let i = 0; i < positionedDatums.length; i += 1) {
    const { fpX, fpY } = positionedDatums[i]
    drawStandardMarker(drawer, fpX, fpY, props, seriesKey)
  }
}

const drawGraph = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  graphComponentRects: GraphComponentRects,
  props: Options,
) => {
  // Show axis lines by default
  if (getShouldShowAxisLine(props, Axis2D.X))
    drawAxisLine(drawer, axesGeometry, props, Axis2D.X)
  if (getShouldShowAxisLine(props, Axis2D.Y))
    drawAxisLine(drawer, axesGeometry, props, Axis2D.Y)

  // Show grid lines by default
  if (getShouldShowAxisGridLines(props, Axis2D.X))
    drawAxisGridLines(drawer, axesGeometry, props, Axis2D.X)
  if (getShouldShowAxisGridLines(props, Axis2D.Y))
    drawAxisGridLines(drawer, axesGeometry, props, Axis2D.Y)

  // Show axis marker lines by default
  if (getShouldShowAxisMarkerLines(props, Axis2D.X))
    drawAxisAxisMarkerLines(drawer, axesGeometry, props, Axis2D.X)
  if (getShouldShowAxisMarkerLines(props, Axis2D.Y))
    drawAxisAxisMarkerLines(drawer, axesGeometry, props, Axis2D.Y)

  // Show axis marker labels by default
  if (getShouldShowAxisMarkerLabels(props, Axis2D.X))
    drawAxisMarkerLabels(drawer, axesGeometry, Axis2D.X, props)
  if (getShouldShowAxisMarkerLabels(props, Axis2D.Y))
    drawAxisMarkerLabels(drawer, axesGeometry, Axis2D.Y, props)

  drawAxesLabels(drawer, graphComponentRects[GraphComponents.X_AXIS_TITLE], graphComponentRects[GraphComponents.Y_AXIS_TITLE], props)

  drawTitle(drawer, graphComponentRects[GraphComponents.TITLE_BAR], props)
}

const drawSeriesData = (
  drawer: CanvasDrawer,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  const ctx = drawer.getRenderingContext()
  if (getShouldShowCustomMarkers(props, seriesKey))
    drawCustomDatumMarkers(ctx, positionedDatums, props, seriesKey)
  if (getShouldShowMarkers(props, seriesKey))
    drawDatumMarkers(drawer, positionedDatums, props, seriesKey)
  if (getShouldShowErrorBars(props, seriesKey, Axis2D.X))
    drawDatumErrorBarsForDatums(ctx, positionedDatums, props, seriesKey, Axis2D.X)
  if (getShouldShowErrorBars(props, seriesKey, Axis2D.Y))
    drawDatumErrorBarsForDatums(ctx, positionedDatums, props, seriesKey, Axis2D.Y)
  if (getShouldShowConnectingLine(props, seriesKey))
    drawDatumsConnectingLine(ctx, positionedDatums, props, seriesKey)
}

const drawBackground = (drawer: CanvasDrawer, props: Options) => {
  const rect: Rect = { x: 0, y: 0, width: props.widthPx, height: props.heightPx }
  drawer.rect(rect, { stroke: false, fill: true, fillOptions: { color: props.backgroundColor ?? 'white' } })
}

export const draw = (drawer: CanvasDrawer, g: GraphGeometry, props: Options) => {
  drawer.clearRenderingSpace()

  drawBackground(drawer, props)

  // Draw the base graph, i.e. axes lines, grid lines, labels, title, etc., but no series data.
  drawGraph(drawer, g.axesGeometry, g.graphComponentRects, props)

  // Draw series data for each series, i.e. markers, error bars, connecting line, etc.
  Object.entries(g.positionedDatums)
    .forEach(([seriesKey, positionedDatums]) => drawSeriesData(drawer, positionedDatums, props, seriesKey))

  // Draw straight lines of best fit for each series
  Object.entries(g.bestFitStraightLineEquations)
    .filter(([seriesKey, eq]) => eq != null && getShouldShowLineOfBestFit(props, seriesKey))
    .forEach(([seriesKey, eq]) => drawStraightLineOfBestFit(drawer, eq, g.axesGeometry, props, seriesKey))
}
