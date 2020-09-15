import { CanvasDrawer } from '../../../common/drawer/types'
import Geometry from '../types/Geometry'
import ChartZones from '../types/ChartZones'
import { RectDimensions, Point2D } from '../../../common/types/geometry'
import NavigatorActionButtons from '../types/NavigatorActionButtons'
import { drawButtonList } from './buttonList'
import CursorModifiers from '../types/CursorModifiers'

export const drawNavigatorActionButtons = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  onResetButtonClick: () => void,
  cursorModifiers: CursorModifiers,
): NavigatorActionButtons => {
  const navigatorRect = geometry.chartZoneRects[ChartZones.NAVIGATOR]

  const buttons = [
    {
      id: 'RESET',
      text: 'Reset',
      onClick: onResetButtonClick,
    },
  ]

  const mapContainerDimensonsToContainerPosition = (containerDimensions: RectDimensions): Point2D => ({
    x: navigatorRect.x + navigatorRect.width - containerDimensions.width,
    y: navigatorRect.y,
  })
  const drawnButtonList = drawButtonList({
    drawer,
    buttons,
    getButtonContainerPosition: mapContainerDimensonsToContainerPosition,
    containerPadding: 5,
    buttonBorderRadius: 5,
    onMouseEnterButton: () => cursorModifiers.setCursor('pointer'),
    onMouseLeaveButton: cursorModifiers.resetCursor,
  })

  return {
    onMouseMove: drawnButtonList.onMouseMove,
    onMouseDown: drawnButtonList.onMouseDown,
  }
}
