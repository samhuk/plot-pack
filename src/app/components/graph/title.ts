import Options from './types/Options'
import { applyTextOptionsToContext } from './drawGraph'
import { measureTextWidth, measureTextLineHeight } from '../../common/helpers/canvas'

const DEFAULT_FONT_SIZE = 22
const DEFAULT_COLOR = 'black'
const DEFAULT_EXTERIOR_MARGIN = 15

export const getExteriorMargin = (props: Options) => props.titleOptions?.exteriorMargin ?? DEFAULT_EXTERIOR_MARGIN

export const getTitle = (props: Options) => props.title

export const getTitleOptions = (props: Options) => props.titleOptions

export const drawTitle = (ctx:CanvasRenderingContext2D, props: Options) => {
  const text = props.title

  if (text == null)
    return

  applyTextOptionsToContext(ctx, props.titleOptions, null, DEFAULT_FONT_SIZE, DEFAULT_COLOR)

  const textWidth = measureTextWidth(ctx, text)
  const lineHeight = measureTextLineHeight(ctx)
  const x = (props.widthPx / 2) - (textWidth / 2)
  const y = getExteriorMargin(props) + lineHeight

  ctx.fillText(text, x, y)
}

export default drawTitle
