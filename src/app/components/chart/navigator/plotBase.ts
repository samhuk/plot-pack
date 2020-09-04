import Options from '../types/Options'
import { CanvasDrawer } from '../../../common/drawer/types'
import PositionedDatumValueFocusPoint from '../types/PositionedDatumValueFocusPoint'
import { Path } from '../../../common/drawer/path/types'
import { createDatumsConnectingLinePath } from '../data/connectingLine'
import { Axis2D } from '../../../common/types/geometry'
import { drawAxisLine } from '../plotBase/components/axisLines'
import { drawAxisMarkerLabels } from '../plotBase/components/axisMarkerLabels'
import { drawAxisAxisMarkerLines } from '../plotBase/components/axisMarkerLines'
import Geometry from '../types/Geometry'
import ChartComponents from '../types/ChartComponents'
import { LineOptions } from '../../../common/types/canvas'
import { mapDict } from '../../../common/helpers/dict'
import { positionDatumValueFocusPoints } from '../data/datumProcessing'
import AxesBound from '../types/AxesBound'

const DEFAULT_CONNECTING_LINE_LINE_OPTIONS: LineOptions = {
  lineWidth: 1,
  color: 'black',
  dashPattern: [],
}

const getConnectingLineDashPattern = (props: Options, seriesKey: string) => (
  props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.dashPattern
    ?? props.navigatorOptions?.connectingLineOptions?.dashPattern
)

const getConnectingLineLineWidth = (props: Options, seriesKey: string) => (
  props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.lineWidth
    ?? props.navigatorOptions?.connectingLineOptions?.lineWidth
)

const getConnectingLineColor = (props: Options, seriesKey: string) => (
  props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.color
    ?? props.navigatorOptions?.connectingLineOptions?.color
)

const drawConnectingLineForSeries = (
  drawer: CanvasDrawer,
  positionedDatumValueFocusPoints: PositionedDatumValueFocusPoint[],
  axesScreenBounds: AxesBound,
  seriesKey: string,
  props: Options,
) => {
  const path: Path = createDatumsConnectingLinePath(positionedDatumValueFocusPoints, axesScreenBounds)
  const color = getConnectingLineColor(props, seriesKey)
  const lineWidth = getConnectingLineLineWidth(props, seriesKey)
  const dashPattern = getConnectingLineDashPattern(props, seriesKey)
  drawer.applyLineOptions({ color, lineWidth, dashPattern }, DEFAULT_CONNECTING_LINE_LINE_OPTIONS)
  drawer.path(path)
}

const drawConnectingLineForAllSeries = (
  drawer: CanvasDrawer,
  positionedDatumValueFocusPoints: { [seriesKey: string]: PositionedDatumValueFocusPoint[] },
  axesScreenBounds: AxesBound,
  props: Options,
) => {
  Object.entries(positionedDatumValueFocusPoints)
    .forEach(([seriesKey, _positionedDatumValueFocusPoints]) => {
      drawConnectingLineForSeries(drawer, _positionedDatumValueFocusPoints, axesScreenBounds, seriesKey, props)
    })
}

export const drawNavigatorPlotBase = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
) => {
  const axesGeometry = geometry.navigatorAxesGeometry
  const rect = geometry.chartComponentRects[ChartComponents.NAVIGATOR]

  // Position the datum value focus points using axes geometry
  const positionedDatumValueFocusPoints = mapDict(geometry.processedDatums, (seriesKey, datumValueFocusPoints) => (
    positionDatumValueFocusPoints(datumValueFocusPoints, axesGeometry[Axis2D.X].p, axesGeometry[Axis2D.Y].p)
  ))

  const axesScreenBounds: AxesBound = {
    [Axis2D.X]: {
      lower: geometry.navigatorAxesGeometry[Axis2D.X].pl,
      upper: geometry.navigatorAxesGeometry[Axis2D.X].pu,
    },
    [Axis2D.Y]: {
      lower: geometry.navigatorAxesGeometry[Axis2D.Y].pl,
      upper: geometry.navigatorAxesGeometry[Axis2D.Y].pu,
    },
  }

  // Draw connecting line for each series
  drawConnectingLineForAllSeries(drawer, positionedDatumValueFocusPoints, axesScreenBounds, props)

  // Draw top border
  drawer.line([rect, { x: rect.x + rect.width, y: rect.y }], { color: 'black', lineWidth: 1 })

  // Draw the plot base
  drawAxisLine(drawer, axesGeometry, props, Axis2D.X)
  drawAxisLine(drawer, axesGeometry, props, Axis2D.Y)
  drawAxisMarkerLabels(drawer, axesGeometry, Axis2D.X, props)
  drawAxisMarkerLabels(drawer, axesGeometry, Axis2D.Y, props)
  drawAxisAxisMarkerLines(drawer, axesGeometry, props, Axis2D.X)
  drawAxisAxisMarkerLines(drawer, axesGeometry, props, Axis2D.Y)
}

export default drawNavigatorPlotBase
