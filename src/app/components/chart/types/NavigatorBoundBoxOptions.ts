import { RoundedRectOptions } from '../../../common/drawer/types'
import { Rect } from '../../../common/types/geometry'

/**
 * Options for the x-value bound box that is drawn. These will customize the behavior
 * and appearance of the box.
 *
 * @param render Custom render function that overrides all the rendering behavior for the bound box. This
 * will be provided with the canvas rendering context and the rect of the bound box to be drawn.
 * @param isCustomRenderingComplementary If true, the provided custom `render` function will complement the
 * default bound box rendering. If false, no default bound box rendering will occur.
 */
export type NavigatorBoundBoxOptions = RoundedRectOptions & {
  render?: (ctx: CanvasRenderingContext2D, boundBoxRect: Rect) => void
  isCustomRenderingComplementary?: boolean
}

export default NavigatorBoundBoxOptions
