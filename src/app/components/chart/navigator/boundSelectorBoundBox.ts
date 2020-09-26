import { CanvasDrawer } from '../../../common/drawer/types'
import { convertHexAndOpacityToRgba } from '../../../common/helpers/color'
import { LineOptions } from '../../../common/types/canvas'
import { Axis2D, Directions2D, Directions2DOptional, Rect } from '../../../common/types/geometry'
import AxesGeometry from '../types/AxesGeometry'
import Bound from '../types/Bound'
import NavigatorBoundBoxOptions from '../types/NavigatorBoundBoxOptions'

const DEFAULT_BACKGROUND_COLOR = '#0000FF'
const DEFAULT_BACKGROUND_OPACITY = 0.1
const DEFAULT_BORDER_VISIBILITIES: Directions2DOptional<boolean> = { left: true, right: true }
const DEFAULT_BORDER_LINE_OPTIONS: LineOptions = { color: 'blue', lineWidth: 1.5, dashPattern: [] }

const drawValueBoundBoxBorderLeftPathComponent = (drawer: CanvasDrawer, rect: Rect, lineOptions: LineOptions) => {
  drawer.applyLineOptions(lineOptions, DEFAULT_BORDER_LINE_OPTIONS)
  drawer.line([{ x: rect.x, y: rect.y }, { x: rect.x, y: rect.y + rect.height }])
}

const drawValueBoundBoxBorderRightPathComponent = (drawer: CanvasDrawer, rect: Rect, lineOptions: LineOptions) => {
  drawer.applyLineOptions(lineOptions, DEFAULT_BORDER_LINE_OPTIONS)
  drawer.line([{ x: rect.x + rect.width, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height }])
}

const drawValueBoundBoxBorderTopPathComponent = (drawer: CanvasDrawer, rect: Rect, lineOptions: LineOptions) => {
  drawer.applyLineOptions(lineOptions, DEFAULT_BORDER_LINE_OPTIONS)
  drawer.line([{ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y }])
}

const drawValueBoundBoxBorderBottomPathComponent = (drawer: CanvasDrawer, rect: Rect, lineOptions: LineOptions) => {
  drawer.applyLineOptions(lineOptions, DEFAULT_BORDER_LINE_OPTIONS)
  drawer.line([{ x: rect.x, y: rect.y + rect.height }, { x: rect.x + rect.width, y: rect.y + rect.height }])
}

const isBorderLineOptionsDirectional = (borderLineOptions: LineOptions | Directions2DOptional<LineOptions>) => {
  const _borderLineOptions = borderLineOptions as Directions2DOptional<LineOptions>
  return _borderLineOptions?.left != null
    || _borderLineOptions?.right != null
    || _borderLineOptions?.top != null
    || _borderLineOptions?.bottom != null
}

const drawBorder = (drawer: CanvasDrawer, rect: Rect, boundBoxOptions: NavigatorBoundBoxOptions) => {
  if (boundBoxOptions?.borderLineVisibility === false)
    return

  const normalizedBorderLineOptions: Directions2D<LineOptions> = boundBoxOptions?.borderLineOptions == null
    ? {
      left: DEFAULT_BORDER_LINE_OPTIONS,
      right: DEFAULT_BORDER_LINE_OPTIONS,
      top: DEFAULT_BORDER_LINE_OPTIONS,
      bottom: DEFAULT_BORDER_LINE_OPTIONS,
    }
    : (isBorderLineOptionsDirectional(boundBoxOptions?.borderLineOptions)
      ? {
        left: (boundBoxOptions?.borderLineOptions as Directions2DOptional<LineOptions>)?.left,
        right: (boundBoxOptions?.borderLineOptions as Directions2DOptional<LineOptions>)?.right,
        top: (boundBoxOptions?.borderLineOptions as Directions2DOptional<LineOptions>)?.top,
        bottom: (boundBoxOptions?.borderLineOptions as Directions2DOptional<LineOptions>)?.bottom,
      }
      : {
        left: (boundBoxOptions?.borderLineOptions as LineOptions),
        right: (boundBoxOptions?.borderLineOptions as LineOptions),
        top: (boundBoxOptions?.borderLineOptions as LineOptions),
        bottom: (boundBoxOptions?.borderLineOptions as LineOptions),
      }
    )

  const areAllBorderLinesVisible = boundBoxOptions?.borderLineVisibility === true
  const visibilityAsDirectional = boundBoxOptions?.borderLineVisibility as Directions2DOptional<LineOptions>

  if (areAllBorderLinesVisible || (visibilityAsDirectional != null ? visibilityAsDirectional.left : DEFAULT_BORDER_VISIBILITIES.left))
    drawValueBoundBoxBorderLeftPathComponent(drawer, rect, normalizedBorderLineOptions.left)
  if (areAllBorderLinesVisible || (visibilityAsDirectional != null ? visibilityAsDirectional.right : DEFAULT_BORDER_VISIBILITIES.right))
    drawValueBoundBoxBorderRightPathComponent(drawer, rect, normalizedBorderLineOptions.right)
  if (areAllBorderLinesVisible || (visibilityAsDirectional != null ? visibilityAsDirectional.top : DEFAULT_BORDER_VISIBILITIES.top))
    drawValueBoundBoxBorderTopPathComponent(drawer, rect, normalizedBorderLineOptions.top)
  if (areAllBorderLinesVisible || (visibilityAsDirectional != null ? visibilityAsDirectional.bottom : DEFAULT_BORDER_VISIBILITIES.bottom))
    drawValueBoundBoxBorderBottomPathComponent(drawer, rect, normalizedBorderLineOptions.bottom)
}

const drawBackground = (drawer: CanvasDrawer, rect: Rect, boundBoxOptions: NavigatorBoundBoxOptions) => {
  // Retrieve the various required options and provide defaults
  const backgroundColor = boundBoxOptions?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
  const backgroundOpacity = boundBoxOptions?.backgroundOpacity ?? DEFAULT_BACKGROUND_OPACITY
  const rgba = convertHexAndOpacityToRgba(backgroundColor, backgroundOpacity)
  drawer.rect(rect, { fill: true, stroke: false, fillOptions: { color: rgba } })
}

export const drawXValueBoundBox = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  xScreenBound: Bound,
  boundBoxOptions: NavigatorBoundBoxOptions,
) => {
  const px0 = xScreenBound.lower
  const px1 = xScreenBound.upper
  const selectedAreaRect: Rect = {
    x: px0,
    y: axesGeometry[Axis2D.Y].pu,
    width: px1 - px0,
    height: axesGeometry[Axis2D.Y].pl - axesGeometry[Axis2D.Y].pu,
  }

  // Clear any pre-existing box
  drawer.clearRenderingSpace()
  if (boundBoxOptions?.render != null)
    boundBoxOptions.render(drawer.getRenderingContext(), selectedAreaRect)
  // Don't proceed with default behavior if not complementary (complementary by default)
  if (boundBoxOptions?.isCustomRenderingComplementary === false)
    return
  // Draw border
  drawBorder(drawer, selectedAreaRect, boundBoxOptions)
  // Draw background
  drawBackground(drawer, selectedAreaRect, boundBoxOptions)
}
