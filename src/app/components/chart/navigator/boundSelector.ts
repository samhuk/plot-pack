import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import Options from '../types/Options'
import ChartZones from '../types/ChartZones'
import { boundToRange } from '../../../common/helpers/math'
import { Axis2D, Point2D, Rect } from '../../../common/types/geometry'
import { isMouseEventInRect } from '../../../common/helpers/geometry'
import NavigatorEventHandlers from '../types/NavigatorEventHandlers'
import NavigatorBoundSelector from '../types/NavigatorBoundSelector'
import AxesGeometry from '../types/AxesGeometry'
import Bound from '../types/Bound'
import { isEscape, isR } from '../../../common/helpers/keyCode'

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

const drawXValueBoundBox = (drawer: CanvasDrawer, axesGeometry: AxesGeometry, xScreenBound: Bound) => {
  const px0 = xScreenBound.lower
  const px1 = xScreenBound.upper
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

const convertMouseEventToBoundSelection = (e: MouseEvent, state: State, axesGeometry: AxesGeometry): Bound => {
  const constrainedMouseDownX = boundToRange(state.mouseDownPosition.x, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)
  const constrainedCurrentMouseX = boundToRange(e.offsetX, axesGeometry[Axis2D.X].pl, axesGeometry[Axis2D.X].pu)

  return {
    lower: constrainedMouseDownX,
    upper: constrainedCurrentMouseX,
  }
}

const drawXValueBoundBoxForMouseEvent = (e: MouseEvent, state: State, axesGeometry: AxesGeometry, drawer: CanvasDrawer) => {
  const bound = convertMouseEventToBoundSelection(e, state, axesGeometry)
  drawXValueBoundBox(drawer, axesGeometry, bound)
}

const selectBound = (
  state: State,
  axesGeometry: AxesGeometry,
  eventHandlers: NavigatorEventHandlers,
  constrainedPositionBound: Bound,
) => {
  state.lastSelectedXValueScreenStartPosition = constrainedPositionBound.lower
  state.lastSelectedXValueScreenEndPosition = constrainedPositionBound.upper

  const fromVX = axesGeometry[Axis2D.X].v(constrainedPositionBound.lower)
  const toVX = axesGeometry[Axis2D.X].v(constrainedPositionBound.upper)
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
  if (cancel && state.lastSelectedXValueScreenEndPosition != null && state.lastSelectedXValueScreenStartPosition != null) {
    const bound: Bound = {
      lower: state.lastSelectedXValueScreenStartPosition,
      upper: state.lastSelectedXValueScreenEndPosition,
    }
    drawXValueBoundBox(drawer, axesGeometry, bound)
  }

  document.removeEventListener('mouseup', state.documentMouseUpHandler)
  document.removeEventListener('keydown', state.documentKeyDownHandler)
}

const onDocumentMouseUp = (state: State, drawer: CanvasDrawer, axesGeometry: AxesGeometry) => {
  // If mouse is outside canvas, then we need to handle it here. Else, the below onMouseUp function will handle it
  if (state.isMouseWithinCanvasElement === false)
    endBoundSelection(state, drawer, axesGeometry, true)
  document.removeEventListener('mouseup', state.documentMouseUpHandler)
}

const resetSelectedBoundsToInitial = (
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  eventHandlers: NavigatorEventHandlers,
  initialBound: Bound,
) => {
  drawXValueBoundBox(drawer, axesGeometry, initialBound)
  selectBound(state, axesGeometry, eventHandlers, initialBound)
  endBoundSelection(state, drawer, axesGeometry, false)
}

const onDocumentKeyDown = (
  e: KeyboardEvent,
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  eventHandlers: NavigatorEventHandlers,
  initialBound: Bound,
) => {
  if (isEscape(e))
    endBoundSelection(state, drawer, axesGeometry, true)
  else if (isR(e))
    resetSelectedBoundsToInitial(state, drawer, axesGeometry, eventHandlers, initialBound)
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
  const bound = convertMouseEventToBoundSelection(e, state, axesGeometry)
  const isSufficientSelection = Math.abs(bound.lower - bound.upper) > 1
  if (isMouseInRect && isSufficientSelection)
    selectBound(state, axesGeometry, eventHandlers, bound)

  const shouldCancel = !isMouseInRect || !isSufficientSelection
  endBoundSelection(state, drawer, axesGeometry, shouldCancel)
}

export const drawNavigatorBoundSelector = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
  selectedXValueBound: Bound,
): NavigatorBoundSelector => {
  const axesGeometry = geometry.navigatorAxesGeometry
  const rect = geometry.chartZoneRects[ChartZones.NAVIGATOR]

  const initialMouseBound: Bound = {
    lower: selectedXValueBound?.lower ?? axesGeometry[Axis2D.X].pl,
    upper: selectedXValueBound?.upper ?? axesGeometry[Axis2D.X].pu,
  }

  drawXValueBoundBox(drawer, axesGeometry, initialMouseBound)

  const state: State = {
    isMouseWithinCanvasElement: false,
    mouseDownPosition: null,
    isSelectingBound: false,
    documentMouseUpHandler: () => onDocumentMouseUp(state, drawer, axesGeometry),
    documentKeyDownHandler: kbdevnt => onDocumentKeyDown(kbdevnt, state, drawer, axesGeometry, eventHandlers, initialMouseBound),
    lastSelectedXValueScreenStartPosition: initialMouseBound.lower,
    lastSelectedXValueScreenEndPosition: initialMouseBound.upper,
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
    resetBoundsToInitial: () => {
      resetSelectedBoundsToInitial(state, drawer, axesGeometry, eventHandlers, initialMouseBound)
    },
  }
}
