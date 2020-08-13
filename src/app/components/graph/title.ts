import Options from './types/Options'
import { measureTextLineHeight, applyTextOptionsToContext } from '../../common/helpers/canvas'
import { CanvasDrawer } from '../../common/drawer/types'
import { Rect } from '../../common/types/geometry'

const DEFAULT_FONT_SIZE = 22
const DEFAULT_COLOR = 'black'
const DEFAULT_EXTERIOR_MARGIN = 15

export const getExteriorMargin = (props: Options) => props.titleOptions?.exteriorMargin ?? DEFAULT_EXTERIOR_MARGIN

export const getTitle = (props: Options) => props.title

export const getTitleOptions = (props: Options) => props.titleOptions

export const drawTitle = (drawer: CanvasDrawer, textRect: Rect, props: Options) => {
  const text = getTitle(props)

  if (text == null)
    return

  const ctx = drawer.getRenderingContext()
  applyTextOptionsToContext(ctx, props.titleOptions, null, DEFAULT_FONT_SIZE, DEFAULT_COLOR)

  const lineHeight = measureTextLineHeight(ctx)

  ctx.fillText(text, textRect.x, textRect.y + lineHeight)
}

export default drawTitle
