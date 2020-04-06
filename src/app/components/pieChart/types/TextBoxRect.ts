import { Point2D, Rect } from '../../../common/types/geometry'

export type TextBoxRect = Rect & {
  textCenterPoint: Point2D
}

export default TextBoxRect
