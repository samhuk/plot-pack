import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import Options from '../types/Options'
import XAxisOrientation from '../types/xAxisOrientation'
import YAxisOrientation from '../types/yAxisOrientation'
import ProcessedDatum from '../types/ProcessedDatum'
import { drawCustomMarker, drawStandardMarker, getShouldShowCustomMarkers, getShouldShowMarkers } from '../data/marker'
import AxesGeometry from '../types/AxesGeometry'
import ChartZoneRects from '../types/ChartZoneRects'
import { getShouldShowAxisLine, drawAxisLine } from '../plotBase/components/axisLines'
import { Axis2D, Rect } from '../../../common/types/geometry'
import { getShouldShowAxisGridLines, drawAxisGridLines } from '../plotBase/components/axisGridLines'
import { getShouldShowAxisMarkerLines, drawAxisAxisMarkerLines } from '../plotBase/components/axisMarkerLines'
import { getShouldShowAxisMarkerLabels, drawAxisMarkerLabels } from '../plotBase/components/axisMarkerLabels'
import drawAxesLabels from '../plotBase/components/axisLabels'
import ChartZones from '../types/ChartZones'
import drawTitle from '../title'
import drawDatumErrorBarsForDatums, { getShouldShowErrorBars } from '../data/errorBars'
import drawDatumsConnectingLine, { getShouldShowConnectingLine } from '../data/connectingLine'
import { drawStraightLineOfBestFit } from '../data/straightLineOfBestFit'
import AxesBound from '../types/AxesBound'
import { isPositionInAxesBounds } from '../../../common/helpers/geometry'

const DEFAULT_BACKGROUND_COLOR = 'white'

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
  processedDatums: ProcessedDatum[],
  axesScreenBounds: AxesBound,
  props: Options,
  seriesKey: string,
) => {
  for (let i = 0; i < processedDatums.length; i += 1) {
    const currentProcessedDatum = processedDatums[i]
    if (isPositionInAxesBounds({ x: currentProcessedDatum.fpX, y: currentProcessedDatum.fpY }, axesScreenBounds))
      drawCustomMarker(ctx, currentProcessedDatum, processedDatums[i - 1], processedDatums[i + 1], props, seriesKey)
  }
}

const drawDatumMarkers = (
  drawer: CanvasDrawer,
  processedDatums: ProcessedDatum[],
  axesScreenBounds: AxesBound,
  props: Options,
  seriesKey: string,
) => {
  processedDatums
    .filter(d => isPositionInAxesBounds({ x: d.fpX, y: d.fpY }, axesScreenBounds))
    .forEach(({ fpX, fpY }) => drawStandardMarker(drawer, fpX, fpY, props, seriesKey))
}

const drawBaseChart = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  chartZoneRects: ChartZoneRects,
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

  drawAxesLabels(drawer, chartZoneRects[ChartZones.X_AXIS_TITLE], chartZoneRects[ChartZones.Y_AXIS_TITLE], props)

  drawTitle(drawer, chartZoneRects[ChartZones.TITLE_BAR], props)
}

const drawSeriesData = (
  drawer: CanvasDrawer,
  processedDatums: ProcessedDatum[],
  axesScreenBounds: AxesBound,
  props: Options,
  seriesKey: string,
) => {
  if (getShouldShowCustomMarkers(props, seriesKey))
    drawCustomDatumMarkers(drawer.getRenderingContext(), processedDatums, axesScreenBounds, props, seriesKey)
  if (getShouldShowMarkers(props, seriesKey))
    drawDatumMarkers(drawer, processedDatums, axesScreenBounds, props, seriesKey)
  if (getShouldShowErrorBars(props, seriesKey, Axis2D.X))
    drawDatumErrorBarsForDatums(drawer, processedDatums, props, seriesKey, Axis2D.X)
  if (getShouldShowErrorBars(props, seriesKey, Axis2D.Y))
    drawDatumErrorBarsForDatums(drawer, processedDatums, props, seriesKey, Axis2D.Y)
  if (getShouldShowConnectingLine(props, seriesKey))
    drawDatumsConnectingLine(drawer, processedDatums, axesScreenBounds, props, seriesKey)
}

const drawBackground = (drawer: CanvasDrawer, props: Options) => {
  const rect: Rect = { x: 0, y: 0, width: props.width, height: props.height }
  drawer.rect(rect, { stroke: false, fill: true, fillOptions: { color: props.backgroundColor ?? DEFAULT_BACKGROUND_COLOR } })
}

const drawAllSeriesData = (drawer: CanvasDrawer, g: Geometry, props: Options) => {
  const axesScreenBounds: AxesBound = {
    [Axis2D.X]: {
      lower: g.chartAxesGeometry[Axis2D.X].pl,
      upper: g.chartAxesGeometry[Axis2D.X].pu,
    },
    [Axis2D.Y]: {
      lower: g.chartAxesGeometry[Axis2D.Y].pl,
      upper: g.chartAxesGeometry[Axis2D.Y].pu,
    },
  }

  // Draw series data for each series, i.e. markers, error bars, connecting line, etc.
  Object.entries(g.processedDatums)
    .forEach(([seriesKey, processedDatums]) => drawSeriesData(drawer, processedDatums, axesScreenBounds, props, seriesKey))

  // Draw straight lines of best fit for each series
  Object.entries(g.bestFitStraightLineEquations)
    .filter(([seriesKey, eq]) => eq != null && getShouldShowLineOfBestFit(props, seriesKey))
    .forEach(([seriesKey, eq]) => drawStraightLineOfBestFit(drawer, eq, g.chartAxesGeometry, props, seriesKey))
}

export const drawPlotBase = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
) => {
  drawer.clearRenderingSpace()

  drawBackground(drawer, props)

  // Draw the base chart, i.e. axes lines, grid lines, labels, title, etc., but no series data.
  drawBaseChart(drawer, geometry.chartAxesGeometry, geometry.chartZoneRects, props)

  // Draw data and best fit line for each series, i.e. markers, error bars, connecting line, best fit line, etc.
  drawAllSeriesData(drawer, geometry, props)
}

export default drawPlotBase
