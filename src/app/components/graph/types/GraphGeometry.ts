import AxisGeometry from './AxisGeometry'
import { StraightLineEquation } from '../../../common/types/geometry'
import PositionedDatum from './PositionedDatum'

/**
 * Geometry of a graph. This is all the values that one would need
 * to draw a graph.
 */
export type GraphGeometry = {
  positionedDatums: PositionedDatum[]
  xAxis: AxisGeometry
  yAxis: AxisGeometry
  bestFitStraightLineEquation: StraightLineEquation
}

export default GraphGeometry
