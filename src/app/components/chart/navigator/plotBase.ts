import Options from '../types/Options'
import { CanvasDrawer } from '../../../common/drawer/types'
import PositionedDatumValueFocusPoint from '../types/PositionedDatumValueFocusPoint'
import { createDatumsConnectingLinePath } from '../data/connectingLine'
import { Axis2D, Rect } from '../../../common/types/geometry'
import { drawAxisLine } from '../plotBase/components/axisLines'
import { drawAxisMarkerLabels } from '../plotBase/components/axisMarkerLabels'
import { drawAxisAxisMarkerLines } from '../plotBase/components/axisMarkerLines'
import Geometry from '../types/Geometry'
import ChartZones from '../types/ChartZones'
import { LineOptions } from '../../../common/types/canvas'
import AxesBound from '../types/AxesBound'

const DEFAULT_BACKGROUND_COLOR = 'white'

const DEFAULT_CONNECTING_LINE_LINE_OPTIONS: LineOptions = {
  lineWidth: 1,
  color: 'black',
  dashPattern: [],
}

const getConnectingLineLineOptions = (props: Options, seriesKey: string): LineOptions => ({
  color: props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.color
    ?? props.navigatorOptions?.connectingLineOptions?.color
    ?? props.seriesOptions?.[seriesKey]?.connectingLineOptions?.color,
  lineWidth: props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.lineWidth
    ?? props.navigatorOptions?.connectingLineOptions?.lineWidth
    ?? 1.2, // the navigator is typically quite small, so thick lines can become obstructive
  dashPattern: props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.dashPattern
    ?? props.navigatorOptions?.connectingLineOptions?.dashPattern
    ?? props.seriesOptions?.[seriesKey]?.connectingLineOptions?.dashPattern,
})

const drawConnectingLineForSeries = (
  drawer: CanvasDrawer,
  positionedDatumValueFocusPoints: PositionedDatumValueFocusPoint[],
  axesScreenBounds: AxesBound,
  seriesKey: string,
  props: Options,
) => {
  drawer.path(
    createDatumsConnectingLinePath(positionedDatumValueFocusPoints, axesScreenBounds),
    { lineOptions: getConnectingLineLineOptions(props, seriesKey) },
    { lineOptions: DEFAULT_CONNECTING_LINE_LINE_OPTIONS },
  )
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

const drawBackground = (drawer: CanvasDrawer, props: Options, rect: Rect) => {
  drawer.rect(rect, { stroke: false, fill: true, fillOptions: { color: props.backgroundColor ?? DEFAULT_BACKGROUND_COLOR } })
}

export const drawNavigatorPlotBase = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
) => {
  drawBackground(drawer, props, geometry.chartZoneRects[ChartZones.NAVIGATOR])

  const axesGeometry = geometry.navigatorAxesGeometry
  const rect = geometry.chartZoneRects[ChartZones.NAVIGATOR]

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
  drawConnectingLineForAllSeries(drawer, geometry.navigatorProcessedDatums, axesScreenBounds, props)

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
