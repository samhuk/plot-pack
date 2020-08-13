import Options from './types/Options'
import { CanvasDrawer } from '../../common/drawer/types'
import { Rect } from '../../common/types/geometry'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

export const drawNavigator = (drawer: CanvasDrawer, rect: Rect, props: Options) => {
  drawer.text('NAVIGATOR', rect, { fontFamily: 'Comic Sans MS', fontSize: 22, color: 'black' })
}
