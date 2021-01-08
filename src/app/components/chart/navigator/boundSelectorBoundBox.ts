import { CanvasDrawer, RoundedRectOptions } from '../../../common/drawer/types'
import { Rect } from '../../../common/types/geometry'
import AxesGeometry from '../types/AxesGeometry'
import Bound from '../types/Bound'
import NavigatorBoundBoxOptions from '../types/NavigatorBoundBoxOptions'

const DEFAULT_ROUNDED_RECT_OPTIONS: RoundedRectOptions = {
  stroke: { left: true, right: true },
  fill: true,
  fillOptions: { color: 'blue', opacity: 0.1 },
  borderColor: 'blue',
  borderDashPattern: [],
  borderLineWidth: 1.5,
  borderRadii: 0,
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
    y: axesGeometry.y.pu,
    width: px1 - px0,
    height: axesGeometry.y.pl - axesGeometry.y.pu,
  }

  // Clear any pre-existing box
  drawer.clearRenderingSpace()

  if (boundBoxOptions?.render != null)
    boundBoxOptions.render(drawer.getRenderingContext(), selectedAreaRect)
  // Don't proceed with default behavior if not complementary (complementary by default)
  if (boundBoxOptions?.isCustomRenderingComplementary === false)
    return

  drawer.roundedRect(selectedAreaRect, boundBoxOptions, DEFAULT_ROUNDED_RECT_OPTIONS)
}
