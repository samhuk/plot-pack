import { RoundedRectOptions } from '../../../common/drawer/types'
import { Rect } from '../../../common/types/geometry'

/**
 * Options for the x-value bound box that is drawn. These will customize the behavior
 * and appearance of the box.
 *
 * @param backgroundOpacity Specifies the opacity of the background of the bound box. A number between 0 and 1.
 * @param backgroundColor Specifies the color of the background of the bound box. Must be a hex code.
 * @param borderLineOptions Specifies the border line options of the bound box. The border for all 4 sides or
 * per side can be specifies, akin to CSS border.
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
