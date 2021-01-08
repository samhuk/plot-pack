import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import Options from '../types/Options'
import ChartZones from '../types/ChartZones'
import { Point2D, Rect } from '../../../common/types/geometry'
import { isMouseEventInRect } from '../../../common/helpers/geometry'
import NavigatorEventHandlers from '../types/NavigatorEventHandlers'
import NavigatorBoundSelector from '../types/NavigatorBoundSelector'
import AxesGeometry from '../types/AxesGeometry'
import Bound from '../types/Bound'
import { isEscape, isR } from '../../../common/helpers/keyCode'
import NavigatorBoundBoxOptions from '../types/NavigatorBoundBoxOptions'
import { boundToRange } from '../../../common/helpers/math'
import { drawXValueBoundBox } from './boundSelectorBoundBox'

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

const convertMouseEventToBoundSelection = (e: MouseEvent, currentMouseDownPositionX: number, axesGeometry: AxesGeometry): Bound => {
  const constrainedMouseDownX = boundToRange(currentMouseDownPositionX, axesGeometry.x.pl, axesGeometry.x.pu)
  const constrainedCurrentMouseX = boundToRange(e.offsetX, axesGeometry.x.pl, axesGeometry.x.pu)

  return {
    lower: constrainedMouseDownX,
    upper: constrainedCurrentMouseX,
  }
}

const drawXValueBoundBoxForMouseEvent = (
  e: MouseEvent,
  state: State,
  axesGeometry: AxesGeometry,
  drawer: CanvasDrawer,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  const bound = convertMouseEventToBoundSelection(e, state.mouseDownPosition.x, axesGeometry)
  drawXValueBoundBox(drawer, axesGeometry, bound, boundBoxOptions)
}

const selectBound = (
  state: State,
  axesGeometry: AxesGeometry,
  eventHandlers: NavigatorEventHandlers,
  constrainedPositionBound: Bound,
) => {
  state.lastSelectedXValueScreenStartPosition = constrainedPositionBound.lower
  state.lastSelectedXValueScreenEndPosition = constrainedPositionBound.upper

  const fromVX = axesGeometry.x.v(constrainedPositionBound.lower)
  const toVX = axesGeometry.x.v(constrainedPositionBound.upper)
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
const endBoundSelection = (
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  cancel: boolean,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  state.mouseDownPosition = null
  state.isSelectingBound = false

  // Draw the last selected box
  if (cancel && state.lastSelectedXValueScreenEndPosition != null && state.lastSelectedXValueScreenStartPosition != null) {
    const bound: Bound = {
      lower: state.lastSelectedXValueScreenStartPosition,
      upper: state.lastSelectedXValueScreenEndPosition,
    }
    drawXValueBoundBox(drawer, axesGeometry, bound, boundBoxOptions)
  }

  document.removeEventListener('mouseup', state.documentMouseUpHandler)
  document.removeEventListener('keydown', state.documentKeyDownHandler)
}

const onDocumentMouseUp = (
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  // If mouse is outside canvas, then we need to handle it here. Else, the below onMouseUp function will handle it
  if (state.isMouseWithinCanvasElement === false)
    endBoundSelection(state, drawer, axesGeometry, true, boundBoxOptions)
  document.removeEventListener('mouseup', state.documentMouseUpHandler)
}

const resetSelectedBoundsToInitial = (
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  eventHandlers: NavigatorEventHandlers,
  initialBound: Bound,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  drawXValueBoundBox(drawer, axesGeometry, initialBound, boundBoxOptions)
  selectBound(state, axesGeometry, eventHandlers, initialBound)
  endBoundSelection(state, drawer, axesGeometry, false, boundBoxOptions)
}

const onDocumentKeyDown = (
  e: KeyboardEvent,
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  eventHandlers: NavigatorEventHandlers,
  initialBound: Bound,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  if (isEscape(e))
    endBoundSelection(state, drawer, axesGeometry, true, boundBoxOptions)
  else if (isR(e))
    resetSelectedBoundsToInitial(state, drawer, axesGeometry, eventHandlers, initialBound, boundBoxOptions)
}

/**
 * Starts a bound selection.
 */
const startBoundSelection = (
  e: MouseEvent,
  state: State,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  state.isSelectingBound = true
  state.mouseDownPosition = { x: e.offsetX, y: e.offsetY }

  drawXValueBoundBoxForMouseEvent(e, state, axesGeometry, drawer, boundBoxOptions)

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
const onMouseMove = (
  e: MouseEvent,
  state: State,
  axesGeometry: AxesGeometry,
  rect: Rect,
  drawer: CanvasDrawer,
  boundBoxOptions: NavigatorBoundBoxOptions,
): void => {
  if (!state.isSelectingBound)
    return

  // Hide the bound box if mouse is outside rect
  if (state.isSelectingBound && !isMouseEventInRect(e, rect)) {
    drawer.clearRenderingSpace()
    return
  }

  drawXValueBoundBoxForMouseEvent(e, state, axesGeometry, drawer, boundBoxOptions)
}

/**
 * Called whenever the mouse pressed down within the canvas element.
 */
const onMouseDown = (
  e: MouseEvent,
  state: State,
  rect: Rect,
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  boundBoxOptions: NavigatorBoundBoxOptions,
): void => {
  if (!isMouseEventInRect(e, rect))
    return

  startBoundSelection(e, state, drawer, axesGeometry, boundBoxOptions)
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
  boundBoxOptions: NavigatorBoundBoxOptions,
): void => {
  if (!state.isSelectingBound)
    return

  const isMouseInRect = isMouseEventInRect(e, rect)
  const bound = convertMouseEventToBoundSelection(e, state.mouseDownPosition.x, axesGeometry)
  const isSufficientSelection = Math.abs(bound.lower - bound.upper) > 1
  if (isMouseInRect && isSufficientSelection)
    selectBound(state, axesGeometry, eventHandlers, bound)

  const shouldCancel = !isMouseInRect || !isSufficientSelection
  endBoundSelection(state, drawer, axesGeometry, shouldCancel, boundBoxOptions)
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
    lower: selectedXValueBound?.lower != null ? axesGeometry.x.p(selectedXValueBound?.lower) : axesGeometry.x.pl,
    upper: selectedXValueBound?.upper != null ? axesGeometry.x.p(selectedXValueBound?.upper) : axesGeometry.x.pu,
  }

  const boundBoxOptions = props.navigatorOptions?.boundBoxOptions

  drawXValueBoundBox(drawer, axesGeometry, initialMouseBound, boundBoxOptions)

  const state: State = {
    isMouseWithinCanvasElement: false,
    mouseDownPosition: null,
    isSelectingBound: false,
    documentMouseUpHandler: () => onDocumentMouseUp(state, drawer, axesGeometry, boundBoxOptions),
    documentKeyDownHandler: kbdevnt => onDocumentKeyDown(kbdevnt, state, drawer, axesGeometry, eventHandlers, initialMouseBound, boundBoxOptions),
    lastSelectedXValueScreenStartPosition: initialMouseBound.lower,
    lastSelectedXValueScreenEndPosition: initialMouseBound.upper,
  }

  return {
    onMouseMove: (e: MouseEvent) => onMouseMove(e, state, axesGeometry, rect, drawer, boundBoxOptions),
    onMouseDown: (e: MouseEvent) => onMouseDown(e, state, rect, drawer, axesGeometry, boundBoxOptions),
    onMouseUp: (e: MouseEvent) => onMouseUp(e, state, drawer, axesGeometry, rect, eventHandlers, boundBoxOptions),
    onMouseLeave: () => {
      state.isMouseWithinCanvasElement = false
      if (state.isSelectingBound)
        drawer.clearRenderingSpace()
    },
    onMouseEnter: () => {
      state.isMouseWithinCanvasElement = true
    },
    resetBoundsToInitial: () => {
      resetSelectedBoundsToInitial(state, drawer, axesGeometry, eventHandlers, initialMouseBound, boundBoxOptions)
    },
  }
}
