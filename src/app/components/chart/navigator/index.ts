import Options from '../types/Options'
import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import drawNavigatorPlotBase from './plotBase'
import { drawNavigatorBoundSelector } from './boundSelector'
import NavigatorEventHandlers from '../types/NavigatorEventHandlers'
import Navigator from '../types/Navigator'
import Bound from '../types/Bound'
import { drawNavigatorActionButtons } from './actionButtons'
import CursorModifiers from '../types/CursorModifiers'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

export const drawNavigator = (
  drawers: { plotBase: CanvasDrawer, boundSelector: CanvasDrawer, actionButtons: CanvasDrawer, },
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
  selectedXValueBound: Bound,
  cursorModifiers: CursorModifiers,
): Navigator => {
  drawNavigatorPlotBase(drawers.plotBase, geometry, props)

  const boundSelector = drawNavigatorBoundSelector(drawers.boundSelector, geometry, props, eventHandlers, selectedXValueBound)

  const actionButtons = drawNavigatorActionButtons(drawers.actionButtons, geometry, boundSelector.resetBoundsToInitial, cursorModifiers)

  return { boundSelector, actionButtons }
}
