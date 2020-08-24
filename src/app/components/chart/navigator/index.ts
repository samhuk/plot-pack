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
import { Path } from '../../../common/drawer/path/types'
import { LineOptions } from '../../../common/types/canvas'
import { createDatumsConnectingLinePath } from '../data/connectingLine'
import { getAxesValueRangeOptions } from '../data/datumsValueRange'
import { isPositionInRect } from '../../../common/helpers/geometry'
import Bound from '../types/Bound'
import PositionedDatumValueFocusPoint from '../types/PositionedDatumValueFocusPoint'
import { positionDatumValueFocusPoints } from '../data/datumProcessing'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

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
  positionedDatumValueFocusPoints: { [seriesKey: string]: PositionedDatumValueFocusPoint[] },
  props: Options,
) => {
  Object.entries(positionedDatumValueFocusPoints)
    .forEach(([seriesKey, _positionedDatumValueFocusPoints]) => {
      drawConnectingLineForSeries(drawer, _positionedDatumValueFocusPoints, seriesKey, props)
    })
}

type State = {
  mouseDownPosition: Point2D
  isMouseDown: boolean
  isInInitialState: boolean
}

const isMouseEventInRect = (cursorPositionFromEvent: { offsetX: number, offsetY: number }, rect: Rect) => (
  isPositionInRect({ x: cursorPositionFromEvent.offsetX, y: cursorPositionFromEvent.offsetY }, rect)
)

export const drawNavigator = (
  drawers: { plotBase: CanvasDrawer, interactivity: CanvasDrawer },
  datumValueFocusPoints: { [seriesKey: string]: DatumValueFocusPoint[] },
  rect: Rect,
  props: Options,
  onSelectXValueRange: (valueBound: Bound) => void,
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

  const state: State = {
    isInInitialState: false,
    mouseDownPosition: null,
    isMouseDown: false,
  }

  const revertStateToInitial = (s: State) => {
    /* eslint-disable no-param-reassign */
    s.isInInitialState = true
    s.mouseDownPosition = null
    s.isMouseDown = false
    /* eslint-enable no-param-reassign */
  }

  return {
    eventHandlers: {
      onMouseMove: (e: MouseEvent) => {
        drawers.interactivity.clearRenderingSpace()

        if (!isMouseEventInRect(e, rect) || !state.isMouseDown)
          return

        const fromLineTopPoint: Point2D = { x: state.mouseDownPosition.x, y: axesGeometry[Axis2D.Y].pl }
        const fromLineBottomPoint: Point2D = { x: state.mouseDownPosition.x, y: axesGeometry[Axis2D.Y].pu }
        const toLineTopPoint: Point2D = { x: e.offsetX, y: axesGeometry[Axis2D.Y].pl }
        const toLineBottomPoint: Point2D = { x: e.offsetX, y: axesGeometry[Axis2D.Y].pu }
        const selectedAreaRect: Rect = {
          x: state.mouseDownPosition.x,
          y: axesGeometry[Axis2D.Y].pu,
          width: e.offsetX - state.mouseDownPosition.x,
          height: axesGeometry[Axis2D.Y].pl - axesGeometry[Axis2D.Y].pu,
        }
        // TODO: Make the draw options here configurable
        drawers.interactivity.line([fromLineTopPoint, fromLineBottomPoint], { color: 'blue', lineWidth: 1.5 })
        drawers.interactivity.line([toLineTopPoint, toLineBottomPoint], { color: 'blue', lineWidth: 1.5 })
        drawers.interactivity.rect(selectedAreaRect, { fill: true, stroke: false, fillOptions: { color: 'rgba(0, 0, 255, 0.1)' } })
      },
      onMouseDown: (e: MouseEvent) => {
        if (!isMouseEventInRect(e, rect))
          return

        state.isInInitialState = false
        state.isMouseDown = true
        state.mouseDownPosition = { x: e.offsetX, y: e.offsetY }
      },
      onMouseUp: (e: MouseEvent) => {
        if (!state.isMouseDown)
          return

        if (isMouseEventInRect(e, rect)) {
          const fromVX = axesGeometry[Axis2D.X].v(state.mouseDownPosition.x)
          const toVX = axesGeometry[Axis2D.X].v(e.offsetX)
          onSelectXValueRange({ lower: Math.min(fromVX, toVX), upper: Math.max(fromVX, toVX) })
        }

        drawers.interactivity.clearRenderingSpace()
        revertStateToInitial(state)
      },
      onMouseLeave: () => drawers.interactivity.clearRenderingSpace(),
    },
  }
}
