import AxisGeometry from './AxisGeometry'
import { StraightLineEquation } from '../../../common/types/geometry'

/**
 * Geometry of a graph. This is all the values that one would need
 * to draw a graph.
 */
export type GraphGeometry = {
  xAxis: AxisGeometry
  yAxis: AxisGeometry
  bestFitStraightLineEquation: StraightLineEquation
}

export default GraphGeometry
