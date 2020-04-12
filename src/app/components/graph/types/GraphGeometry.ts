import AxisGeometry from './AxisGeometry'
import { StraightLineEquation } from '../../../common/types/geometry'
import PositionedDatum from './PositionedDatum'
import KdTree from './KdTree'

/**
 * Geometry of a graph. This is all the information that one would need
 * to draw a graph.
 */
export type GraphGeometry = {
  xAxis: AxisGeometry
  yAxis: AxisGeometry
  positionedDatums: { [seriesKey: string]: PositionedDatum[] }
  bestFitStraightLineEquations: { [seriesKey: string]: StraightLineEquation }
  datumKdTrees: { [seriesKey: string]: KdTree<PositionedDatum> }
}

export default GraphGeometry
