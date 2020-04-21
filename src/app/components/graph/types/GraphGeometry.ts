import { StraightLineEquation } from '../../../common/types/geometry'
import PositionedDatum from './PositionedDatum'
import KdTree from './KdTree'
import AxesGeometry from './AxesGeometry'

/**
 * Geometry of a graph. This is all the information that one would need
 * to draw a graph.
 */
export type GraphGeometry = {
  axesGeometry: AxesGeometry,
  positionedDatums: { [seriesKey: string]: PositionedDatum[] }
  bestFitStraightLineEquations: { [seriesKey: string]: StraightLineEquation }
  datumKdTrees: { [seriesKey: string]: KdTree<PositionedDatum> }
}

export default GraphGeometry
