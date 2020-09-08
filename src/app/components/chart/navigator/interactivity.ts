import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import Options from '../types/Options'
import ChartZones from '../types/ChartZones'
import { boundToRange } from '../../../common/helpers/math'
import { Axis2D, Point2D, Rect } from '../../../common/types/geometry'
import { isPositionInRect } from '../../../common/helpers/geometry'
import NavigatorEventHandlers from '../types/NavigatorEventHandlers'
import NavigatorInteractivity from '../types/NavigatorInteractivity'
import AxesGeometry from '../types/AxesGeometry'

/* eslint-disable no-param-reassign */

type State = {
  isMouseWithinCanvasElement: boolean
  mouseDownPosition: Point2D
  isMouseDown: boolean
  isInInitialState: boolean
  documentMouseUpHandler: () => void
}

const isMouseEventInRect = (cursorPositionFromEvent: { offsetX: number, offsetY: number }, rect: Rect) => (
  isPositionInRect({ x: cursorPositionFromEvent.offsetX, y: cursorPositionFromEvent.offsetY }, rect)
)

const revertStateToInitial = (state: State) => {
  state.isInInitialState = true
  state.mouseDownPosition = null
  state.isMouseDown = false
}

const onMouseMove = (e: MouseEvent, state: State, axesGeometry: AxesGeometry, rect: Rect, drawer: CanvasDrawer): void => {
  drawer.clearRenderingSpace()

  if (!isMouseEventInRect(e, rect) || !state.isMouseDown)
    return

  const constrainedMouseDownX = boundToRange(state.mouseDownPosition.x, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
  const constrainedCurrentMouseX = boundToRange(e.offsetX, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
  const fromLineTopPoint: Point2D = { x: constrainedMouseDownX, y: axesGeometry[Axis2D.Y].pl }
  const fromLineBottomPoint: Point2D = { x: constrainedMouseDownX, y: axesGeometry[Axis2D.Y].pu }
  const toLineTopPoint: Point2D = { x: constrainedCurrentMouseX, y: axesGeometry[Axis2D.Y].pl }
  const toLineBottomPoint: Point2D = { x: constrainedCurrentMouseX, y: axesGeometry[Axis2D.Y].pu }
  const selectedAreaRect: Rect = {
    x: constrainedMouseDownX,
    y: axesGeometry[Axis2D.Y].pu,
    width: constrainedCurrentMouseX - constrainedMouseDownX,
    height: axesGeometry[Axis2D.Y].pl - axesGeometry[Axis2D.Y].pu,
  }
  // TODO: Make the draw options here configurable
  drawer.line([fromLineTopPoint, fromLineBottomPoint], { color: 'blue', lineWidth: 1.5 })
  drawer.line([toLineTopPoint, toLineBottomPoint], { color: 'blue', lineWidth: 1.5 })
  drawer.rect(selectedAreaRect, { fill: true, stroke: false, fillOptions: { color: 'rgba(0, 0, 255, 0.1)' } })
}

const onMouseDown = (e: MouseEvent, state: State, rect: Rect): void => {
  if (!isMouseEventInRect(e, rect))
    return

  state.isInInitialState = false
  state.isMouseDown = true
  state.mouseDownPosition = { x: e.offsetX, y: e.offsetY }

  state.documentMouseUpHandler = () => {
    if (state.isMouseWithinCanvasElement === false)
      revertStateToInitial(state)
    document.removeEventListener('mouseup', state.documentMouseUpHandler)
  }
  document.addEventListener('mouseup', state.documentMouseUpHandler)
}

const onMouseUp = (e: MouseEvent, state: State, axesGeometry: AxesGeometry, rect: Rect, eventHandlers: NavigatorEventHandlers): void => {
  if (!state.isMouseDown)
    return

  if (isMouseEventInRect(e, rect)) {
    const constrainedMouseDownX = boundToRange(state.mouseDownPosition.x, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
    const constrainedCurrentMouseX = boundToRange(e.offsetX, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
    const fromVX = axesGeometry[Axis2D.X].v(constrainedMouseDownX)
    const toVX = axesGeometry[Axis2D.X].v(constrainedCurrentMouseX)
    eventHandlers.onSelectXValueBound({
      lower: Math.min(fromVX, toVX),
      upper: Math.max(fromVX, toVX),
    })
  }

  revertStateToInitial(state)
}

export const drawNavigatorInteractivity = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
): NavigatorInteractivity => {
  const axesGeometry = geometry.navigatorAxesGeometry
  const rect = geometry.chartZoneRects[ChartZones.NAVIGATOR]

  const state: State = {
    isMouseWithinCanvasElement: false,
    isInInitialState: false,
    mouseDownPosition: null,
    isMouseDown: false,
    documentMouseUpHandler: null,
  }

  return {
    onMouseMove: (e: MouseEvent) => onMouseMove(e, state, axesGeometry, rect, drawer),
    onMouseDown: (e: MouseEvent) => onMouseDown(e, state, rect),
    onMouseUp: (e: MouseEvent) => onMouseUp(e, state, axesGeometry, rect, eventHandlers),
    onMouseLeave: () => {
      state.isMouseWithinCanvasElement = false
      drawer.clearRenderingSpace()
    },
    onMouseEnter: () => {
      state.isMouseWithinCanvasElement = true
    },
  }
}
