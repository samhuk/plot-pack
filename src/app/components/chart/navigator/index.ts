import Options from '../types/Options'
import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import drawNavigatorPlotBase from './plotBase'
import { drawNavigatorInteractivity } from './interactivity'
import NavigatorEventHandlers from '../types/NavigatorEventHandlers'
import Navigator from '../types/Navigator'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

export const drawNavigator = (
  drawers: { plotBase: CanvasDrawer, interactivity: CanvasDrawer },
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
): Navigator => {
  drawNavigatorPlotBase(drawers.plotBase, geometry, props)

  const interactivity = drawNavigatorInteractivity(drawers.interactivity, geometry, props, eventHandlers)

  return { interactivity }
}
