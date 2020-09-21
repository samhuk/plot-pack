import { InputMargin } from '../../../common/rectPositioningEngine/types'
import { TextOptions } from '../../../common/types/canvas'

export type TitleOptions = TextOptions & {
  margin?: InputMargin
}

export default TitleOptions
