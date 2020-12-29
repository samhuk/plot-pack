import Options from './types/Options'
import { CanvasDrawer } from '../../common/drawer/types'
import { Rect } from '../../common/types/geometry'
import { TextOptions } from '../../common/types/canvas'
import { InputMargin } from '../../common/rectPositioningEngine/types'

const DEFAULT_TEXT_OPTIONS: TextOptions = {
  color: 'black',
  fontSize: 22,
  fontFamily: 'Helvetica',
}

const DEFAULT_MARGIN: InputMargin = 10

export const getTitleMargin = (props: Options) => props.titleOptions?.margin ?? DEFAULT_MARGIN

export const getTitle = (props: Options) => props.title

export const getTitleOptions = (props: Options) => props.titleOptions

export const applyTitleTextOptionsToDrawer = (drawer: CanvasDrawer, props: Options) => drawer.applyTextOptions(
  getTitleOptions(props),
  DEFAULT_TEXT_OPTIONS,
)

export const drawTitle = (drawer: CanvasDrawer, textRect: Rect, props: Options) => {
  const text = getTitle(props)

  if (text == null)
    return

  drawer.text(text, textRect, null, getTitleOptions(props), DEFAULT_TEXT_OPTIONS)
}

export default drawTitle
