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
import Bound from '../types/Bound'
import { isEscape } from '../../../common/helpers/keyCode'

/* eslint-disable no-param-reassign */

type State = {
  isMouseWithinCanvasElement: boolean
  mouseDownPosition: Point2D
  isSelectingBound: boolean
  documentMouseUpHandler: () => void
  documentKeyDownHandler: (e: KeyboardEvent) => void
  lastSelectedXValueScreenStartPosition: number
  lastSelectedXValueScreenEndPosition: number
}

const isMouseEventInRect = (cursorPositionFromEvent: { offsetX: number, offsetY: number }, rect: Rect) => (
  isPositionInRect({ x: cursorPositionFromEvent.offsetX, y: cursorPositionFromEvent.offsetY }, rect)
)

const drawXValueBoundBox = (drawer: CanvasDrawer, axesGeometry: AxesGeometry, px0: number, px1: number) => {
  const fromLineTopPoint: Point2D = { x: px0, y: axesGeometry[Axis2D.Y].pl }
  const fromLineBottomPoint: Point2D = { x: px0, y: axesGeometry[Axis2D.Y].pu }
  const toLineTopPoint: Point2D = { x: px1, y: axesGeometry[Axis2D.Y].pl }
  const toLineBottomPoint: Point2D = { x: px1, y: axesGeometry[Axis2D.Y].pu }
  const selectedAreaRect: Rect = {
    x: px0,
    y: axesGeometry[Axis2D.Y].pu,
    width: px1 - px0,
    height: axesGeometry[Axis2D.Y].pl - axesGeometry[Axis2D.Y].pu,
  }

  // Clear any pre-existing box
  drawer.clearRenderingSpace()
  // Draw upper and lower bound vertical lines
  drawer.line([fromLineTopPoint, fromLineBottomPoint], { color: 'blue', lineWidth: 1.5 })
  drawer.line([toLineTopPoint, toLineBottomPoint], { color: 'blue', lineWidth: 1.5 })
  // Draw translucent bound box
  drawer.rect(selectedAreaRect, { fill: true, stroke: false, fillOptions: { color: 'rgba(0, 0, 255, 0.1)' } })
}

const drawXValueBoundBoxForMouseEvent = (e: MouseEvent, state: State, axesGeometry: AxesGeometry, drawer: CanvasDrawer) => {
  const constrainedMouseDownX = boundToRange(state.mouseDownPosition.x, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
  const constrainedCurrentMouseX = boundToRange(e.offsetX, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
  drawXValueBoundBox(drawer, axesGeometry, constrainedCurrentMouseX, constrainedMouseDownX)
}

const selectBoundForMouseEvent = (state: State, axesGeometry: AxesGeometry, e: MouseEvent, eventHandlers: NavigatorEventHandlers) => {
  const constrainedMouseDownX = boundToRange(state.mouseDownPosition.x, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
  const constrainedCurrentMouseX = boundToRange(e.offsetX, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)

  state.lastSelectedXValueScreenStartPosition = constrainedMouseDownX
  state.lastSelectedXValueScreenEndPosition = constrainedCurrentMouseX

  const fromVX = axesGeometry[Axis2D.X].v(constrainedMouseDownX)
  const toVX = axesGeometry[Axis2D.X].v(constrainedCurrentMouseX)
  eventHandlers.onSelectXValueBound({
    lower: Math.min(fromVX, toVX),
    upper: Math.max(fromVX, toVX),
  })
}

/**
 * Ends a bound selection.
 *
 * If 'cancel' is true, then the bound selection is cancelled. This can happen, for example,
 * if the mouse is lifted up outside of the rect.
 */
const endBoundSelection = (state: State, drawer: CanvasDrawer, axesGeometry: AxesGeometry, cancel: boolean) => {
  state.mouseDownPosition = null
  state.isSelectingBound = false

  // Draw the last selected box
  if (cancel && state.lastSelectedXValueScreenEndPosition != null && state.lastSelectedXValueScreenStartPosition != null)
    drawXValueBoundBox(drawer, axesGeometry, state.lastSelectedXValueScreenStartPosition, state.lastSelectedXValueScreenEndPosition)

  document.removeEventListener('mouseup', state.documentMouseUpHandler)
  document.removeEventListener('keydown', state.documentKeyDownHandler)
}

const onDocumentMouseUp = (state: State, drawer: CanvasDrawer, axesGeometry: AxesGeometry) => {
  // If mouse is outside canvas, then we need to handle it here. Else, the below onMouseUp function will handle it
  if (state.isMouseWithinCanvasElement === false)
    endBoundSelection(state, drawer, axesGeometry, true)
  document.removeEventListener('mouseup', state.documentMouseUpHandler)
}

const onDocumentKeyDown = (e: KeyboardEvent, state: State, drawer: CanvasDrawer, axesGeometry: AxesGeometry) => {
  if (!isEscape(e))
    return

  endBoundSelection(state, drawer, axesGeometry, true)
  document.removeEventListener('keydown', state.documentKeyDownHandler)
  state.documentKeyDownHandler = null
}

/**
 * Starts a bound selection.
 */
const startBoundSelection = (e: MouseEvent, state: State, drawer: CanvasDrawer, axesGeometry: AxesGeometry) => {
  state.isSelectingBound = true
  state.mouseDownPosition = { x: e.offsetX, y: e.offsetY }

  drawXValueBoundBoxForMouseEvent(e, state, axesGeometry, drawer)

  /* Add document mouse-up handler, which will cancel the bound selection if it occurs during selection.
   * This is because the onMouseUp handled within this component is only called for the canvas element.
   */
  document.addEventListener('mouseup', state.documentMouseUpHandler)
  /* Add document keydown event handler, which will cancel the bound selection if they escape key is
   * pressed down during selection.
   */
  document.addEventListener('keydown', state.documentKeyDownHandler)
}

/**
 * Called whenever the mouse is moved within the canvas element.
 */
const onMouseMove = (e: MouseEvent, state: State, axesGeometry: AxesGeometry, rect: Rect, drawer: CanvasDrawer): void => {
  if (!state.isSelectingBound)
    return

  // Hide the bound box if mouse is outside rect
  if (state.isSelectingBound && !isMouseEventInRect(e, rect)) {
    drawer.clearRenderingSpace()
    return
  }

  drawXValueBoundBoxForMouseEvent(e, state, axesGeometry, drawer)
}

/**
 * Called whenever the mouse pressed down within the canvas element.
 */
const onMouseDown = (e: MouseEvent, state: State, rect: Rect, drawer: CanvasDrawer, axesGeometry: AxesGeometry): void => {
  if (!isMouseEventInRect(e, rect))
    return

  startBoundSelection(e, state, drawer, axesGeometry)
}

/**
 * Called whenever the mouse is lifted up within the canvas element.
 */
const onMouseUp = (
  e: MouseEvent,
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  rect: Rect,
  eventHandlers: NavigatorEventHandlers,
): void => {
  if (!state.isSelectingBound)
    return

  const isMouseInRect = isMouseEventInRect(e, rect)
  if (isMouseInRect)
    selectBoundForMouseEvent(state, axesGeometry, e, eventHandlers)

  endBoundSelection(state, drawer, axesGeometry, !isMouseInRect)
}

export const drawNavigatorInteractivity = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
  selectedXValueBound: Bound,
): NavigatorInteractivity => {
  const axesGeometry = geometry.navigatorAxesGeometry
  const rect = geometry.chartZoneRects[ChartZones.NAVIGATOR]

  if (selectedXValueBound != null)
    drawXValueBoundBox(drawer, axesGeometry, selectedXValueBound.lower, selectedXValueBound.upper)

  const state: State = {
    isMouseWithinCanvasElement: false,
    mouseDownPosition: null,
    isSelectingBound: false,
    documentMouseUpHandler: () => onDocumentMouseUp(state, drawer, axesGeometry),
    documentKeyDownHandler: kbdevnt => onDocumentKeyDown(kbdevnt, state, drawer, axesGeometry),
    lastSelectedXValueScreenStartPosition: null,
    lastSelectedXValueScreenEndPosition: null,
  }

  return {
    onMouseMove: (e: MouseEvent) => onMouseMove(e, state, axesGeometry, rect, drawer),
    onMouseDown: (e: MouseEvent) => onMouseDown(e, state, rect, drawer, axesGeometry),
    onMouseUp: (e: MouseEvent) => onMouseUp(e, state, drawer, axesGeometry, rect, eventHandlers),
    onMouseLeave: () => {
      state.isMouseWithinCanvasElement = false
      if (state.isSelectingBound)
        drawer.clearRenderingSpace()
    },
    onMouseEnter: () => {
      state.isMouseWithinCanvasElement = true
    },
  }
}
