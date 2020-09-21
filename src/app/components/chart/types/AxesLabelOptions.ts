import { InputMargin } from '../../../common/rectPositioningEngine/types'
import { TextOptions } from '../../../common/types/canvas'

export type AxesLabelOptions = TextOptions & {
  margin?: InputMargin
}

export default AxesLabelOptions
