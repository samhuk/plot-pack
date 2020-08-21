import ChartComponents from './ChartComponents'
import { Rect } from '../../../common/types/geometry'

export type ChartComponentRects = {
  [chartComponent in ChartComponents]: Rect
}

export default ChartComponentRects
