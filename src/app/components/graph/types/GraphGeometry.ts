import AxisGeometry from './AxisGeometry'
import { StraightLineEquation } from '../../../common/types/geometry'
import PositionedDatum from './PositionedDatum'
import KdTree from './KdTree'

/**
 * Geometry of a graph. This is all the information that one would need
 * to draw a graph.
 */
export type GraphGeometry = {
  positionedDatums: PositionedDatum[]
  xAxis: AxisGeometry
  yAxis: AxisGeometry
  bestFitStraightLineEquation: StraightLineEquation
  datumKdTree: KdTree<PositionedDatum>
}

export default GraphGeometry
