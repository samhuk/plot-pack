import Options from '../types/Options'
import { CanvasDrawer } from '../../../common/drawer/types'
import { Rect, Axis2D, Point2D } from '../../../common/types/geometry'
import { createAxesGeometry } from '../plotBase/geometry/axesGeometry'
import { mapDict } from '../../../common/helpers/dict'
import { normalizeDatumsErrorBarsValues } from '../data/errorBars'
import { drawAxisLine } from '../plotBase/components/axisLines'
import { drawAxisMarkerLabels } from '../plotBase/components/axisMarkerLabels'
import { drawAxisAxisMarkerLines } from '../plotBase/components/axisMarkerLines'
import DatumValueFocusPoint from '../types/DatumValueFocusPoint'
import DatumScreenFocusPoint from '../types/DatumScreenFocusPoint'
import { Path } from '../../../common/drawer/path/types'
import { LineOptions } from '../../../common/types/canvas'
import { createDatumsConnectingLinePath } from '../data/connectingLine'
import { getAxesValueRangeOptions } from '../data/datumsValueRange'
import { isMouseEventInAxes } from '../plotInteractivity'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

const DEFAULT_CONNECTING_LINE_LINE_OPTIONS: LineOptions = {
  lineWidth: 1,
  color: 'black',
  dashPattern: [],
}

type PositionedDatumValuePoint = DatumValueFocusPoint & DatumScreenFocusPoint

const positionDatumValueFocusPoints = (
  datumValueFocusPoints: DatumValueFocusPoint[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
): PositionedDatumValuePoint[] => datumValueFocusPoints.map(valueFocusPoint => ({
  fvX: valueFocusPoint.fvX,
  fvY: valueFocusPoint.fvY,
  fpX: xAxisPFn(valueFocusPoint.fvX),
  fpY: yAxisPFn(valueFocusPoint.fvY),
}))

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
  positionedDatumValueFocusPoints: PositionedDatumValuePoint[],
  seriesKey: string,
  props: Options,
) => {
  const path: Path = createDatumsConnectingLinePath(positionedDatumValueFocusPoints)
  const color = getConnectingLineColor(props, seriesKey)
  const lineWidth = getConnectingLineLineWidth(props, seriesKey)
  const dashPattern = getConnectingLineDashPattern(props, seriesKey)
  drawer.applyLineOptions({ color, lineWidth, dashPattern }, DEFAULT_CONNECTING_LINE_LINE_OPTIONS)
  drawer.path(path)
}

const drawConnectingLineForAllSeries = (
  drawer: CanvasDrawer,
  positionedDatumValueFocusPoints: { [seriesKey: string]: PositionedDatumValuePoint[] },
  props: Options,
) => {
  Object.entries(positionedDatumValueFocusPoints)
    .forEach(([seriesKey, _positionedDatumValueFocusPoints]) => {
      drawConnectingLineForSeries(drawer, _positionedDatumValueFocusPoints, seriesKey, props)
    })
}

export const drawNavigator = (
  drawers: { plotBase: CanvasDrawer, interactivity: CanvasDrawer },
  datumValueFocusPoints: { [seriesKey: string]: DatumValueFocusPoint[] },
  rect: Rect,
  props: Options,
) => {
  const drawer = drawers.plotBase

  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const axesValueRangeOptions = getAxesValueRangeOptions(props, normalizedSeries)

  // Calculate axes geometry
  const axesGeometry = createAxesGeometry(drawer, props, axesValueRangeOptions, rect)

  // Position the datum value focus points using axes geometry
  const positionedDatumValueFocusPoints = mapDict(datumValueFocusPoints, (seriesKey, datumValueFocusPoint) => (
    positionDatumValueFocusPoints(datumValueFocusPoint, axesGeometry[Axis2D.X].p, axesGeometry[Axis2D.Y].p)
  ))

  // Draw connecting line for each series
  drawConnectingLineForAllSeries(drawer, positionedDatumValueFocusPoints, props)

  // Draw top border
  drawer.line([rect, { x: rect.x + rect.width, y: rect.y }], { color: 'black', lineWidth: 1 })

  // Draw chart components
  drawAxisLine(drawer, axesGeometry, props, Axis2D.X)
  drawAxisLine(drawer, axesGeometry, props, Axis2D.Y)
  drawAxisMarkerLabels(drawer, axesGeometry, Axis2D.X, props)
  drawAxisMarkerLabels(drawer, axesGeometry, Axis2D.Y, props)
  drawAxisAxisMarkerLines(drawer, axesGeometry, props, Axis2D.X)
  drawAxisAxisMarkerLines(drawer, axesGeometry, props, Axis2D.Y)

  return {
    eventHandlers: {
      onMouseMove: (e: MouseEvent) => {
        drawers.interactivity.clearRenderingSpace()

        if (!isMouseEventInAxes(axesGeometry, e))
          return

        const fromPoint: Point2D = { x: e.offsetX, y: rect.y }
        const toPoint: Point2D = { x: e.offsetX, y: rect.y + rect.height }
        drawers.interactivity.line([fromPoint, toPoint], { color: 'black', lineWidth: 1, dashPattern: [5, 5] })
      },
      onMouseLeave: () => drawers.interactivity.clearRenderingSpace(),
    },
  }
}
