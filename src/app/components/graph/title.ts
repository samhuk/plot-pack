import Options from './types/Options'
import { CanvasDrawer } from '../../common/drawer/types'
import { Rect } from '../../common/types/geometry'
import { TextOptions } from '../../common/types/canvas'

const DEFAULT_TEXT_OPTIONS: TextOptions = {
  color: 'black',
  fontSize: 22,
  fontFamily: 'Helvetica',
}

const DEFAULT_EXTERIOR_MARGIN = 15

export const getExteriorMargin = (props: Options) => props.titleOptions?.exteriorMargin ?? DEFAULT_EXTERIOR_MARGIN

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

  applyTitleTextOptionsToDrawer(drawer, props)
  drawer.text(text, textRect)
}

export default drawTitle
