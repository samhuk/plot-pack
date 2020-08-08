import GraphComponents from './GraphComponents'
import { Rect } from '../../../common/types/geometry'

export type GraphComponentRects = {
  [graphComponent in GraphComponents]: Rect
}

export default GraphComponentRects
