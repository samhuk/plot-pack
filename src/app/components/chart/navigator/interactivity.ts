import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import Options from '../types/Options'
import ChartComponents from '../types/ChartComponents'
import { boundToRange } from '../../../common/helpers/math'
import { Axis2D, Point2D, Rect } from '../../../common/types/geometry'
import { isPositionInRect } from '../../../common/helpers/geometry'
import NavigatorEventHandlers from '../types/NavigatorEventHandlers'
import NavigatorInteractivity from '../types/NavigatorInteractivity'

type State = {
  mouseDownPosition: Point2D
  isMouseDown: boolean
  isInInitialState: boolean
}

const isMouseEventInRect = (cursorPositionFromEvent: { offsetX: number, offsetY: number }, rect: Rect) => (
  isPositionInRect({ x: cursorPositionFromEvent.offsetX, y: cursorPositionFromEvent.offsetY }, rect)
)

const revertStateToInitial = (s: State) => {
  /* eslint-disable no-param-reassign */
  s.isInInitialState = true
  s.mouseDownPosition = null
  s.isMouseDown = false
  /* eslint-enable no-param-reassign */
}

export const drawNavigatorInteractivity = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
): NavigatorInteractivity => {
  const axesGeometry = geometry.navigatorAxesGeometry
  const rect = geometry.chartComponentRects[ChartComponents.NAVIGATOR]

  const state: State = {
    isInInitialState: false,
    mouseDownPosition: null,
    isMouseDown: false,
  }

  return {
    onMouseMove: (e: MouseEvent) => {
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
        eventHandlers.onSelectXValueBound({ lower: Math.min(fromVX, toVX), upper: Math.max(fromVX, toVX) })
      }

      drawer.clearRenderingSpace()
      revertStateToInitial(state)
    },
    onMouseLeave: () => drawer.clearRenderingSpace(),
  }
}
