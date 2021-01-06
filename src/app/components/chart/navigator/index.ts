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
import { Point2D, Rect } from '../../../common/types/geometry'
import ChartZones from '../types/ChartZones'
import { NavigatorSeparatorOptions } from '../types/NavigatorOptions'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100
export const DEFAULT_NAVIGATOR_PADDING_PX = 5

const DEFAULT_BACKGROUND_COLOR = 'white'
const DEFAULT_SEPARATOR_OPTIONS: NavigatorSeparatorOptions = {
  color: '#999',
  lineWidth: 1,
  dashPattern: [],
}

const drawBackground = (drawer: CanvasDrawer, props: Options, navigatorRect: Rect) => {
  drawer.rect(navigatorRect, { stroke: false, fill: true, fillOptions: { color: props.backgroundColor ?? DEFAULT_BACKGROUND_COLOR } })
}

const drawSeparator = (drawer: CanvasDrawer, options: NavigatorSeparatorOptions, navigatorScreenRect: Rect) => {
  const from: Point2D = navigatorScreenRect
  const to: Point2D = { x: navigatorScreenRect.x + navigatorScreenRect.width, y: navigatorScreenRect.y }
  drawer.line([from, to], options, DEFAULT_SEPARATOR_OPTIONS)
}

export const drawNavigator = (
  drawers: { plotBase: CanvasDrawer, boundSelector: CanvasDrawer, actionButtons: CanvasDrawer, },
  geometry: Geometry,
  props: Options,
  eventHandlers: NavigatorEventHandlers,
  selectedXValueBound: Bound,
  cursorModifiers: CursorModifiers,
): Navigator => {
  drawBackground(drawers.plotBase, props, geometry.chartZoneRects[ChartZones.NAVIGATOR])
  drawSeparator(drawers.plotBase, props.navigatorOptions?.separatorOptions, geometry.chartZoneRects[ChartZones.NAVIGATOR])

  drawNavigatorPlotBase(drawers.plotBase, geometry.chartZoneRects[ChartZones.NAVIGATOR_PLOT_BASE], geometry, props)

  const boundSelector = drawNavigatorBoundSelector(drawers.boundSelector, geometry, props, eventHandlers, selectedXValueBound)

  const actionButtons = drawNavigatorActionButtons(drawers.actionButtons, geometry, boundSelector.resetBoundsToInitial, cursorModifiers)

  return { boundSelector, actionButtons }
}
