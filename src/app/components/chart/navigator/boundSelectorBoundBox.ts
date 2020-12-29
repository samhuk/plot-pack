import { CanvasDrawer } from '../../../common/drawer/types'
import { FillOptions, LineOptions } from '../../../common/types/canvas'
import { Axis2D, Directions2DOptional, Rect } from '../../../common/types/geometry'
import AxesGeometry from '../types/AxesGeometry'
import Bound from '../types/Bound'
import NavigatorBoundBoxOptions from '../types/NavigatorBoundBoxOptions'

const DEFAULT_BORDER_VISIBILITIES: Directions2DOptional<boolean> = { left: true, right: true }
const DEFAULT_BORDER_FILL_OPTIONS: FillOptions = { color: 'blue', opacity: 0.1 }
const DEFAULT_BORDER_LINE_OPTIONS: LineOptions = { color: 'blue', lineWidth: 1.5, dashPattern: [] }

const parseBoundBoxOptions = (boundBoxOptions: NavigatorBoundBoxOptions): NavigatorBoundBoxOptions => ({
  ...boundBoxOptions,
  stroke: boundBoxOptions?.stroke ?? DEFAULT_BORDER_VISIBILITIES,
  fill: boundBoxOptions?.fill ?? true,
  fillOptions: {
    color: boundBoxOptions?.fillOptions?.color ?? DEFAULT_BORDER_FILL_OPTIONS.color,
    opacity: boundBoxOptions?.fillOptions?.opacity ?? DEFAULT_BORDER_FILL_OPTIONS.opacity,
  },
  borderColor: boundBoxOptions?.borderColor ?? DEFAULT_BORDER_LINE_OPTIONS.color,
  borderDashPattern: boundBoxOptions?.borderDashPattern ?? DEFAULT_BORDER_LINE_OPTIONS.dashPattern,
  borderLineWidth: boundBoxOptions?.borderLineWidth ?? DEFAULT_BORDER_LINE_OPTIONS.lineWidth,
  borderRadii: boundBoxOptions?.borderRadii ?? 0,
})

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

  drawer.roundedRect(selectedAreaRect, parseBoundBoxOptions(boundBoxOptions))
}
