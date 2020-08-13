import { StraightLineEquation } from '../../../common/types/geometry'
import ProcessedDatum from './ProcessedDatum'
import KdTree from './KdTree'
import AxesGeometry from './AxesGeometry'
import GraphComponentRects from './GraphComponentRects'

/**
 * Geometry of a graph. This is all the information that one would need
 * to draw a graph.
 */
export type GraphGeometry = {
  axesGeometry: AxesGeometry,
  processedDatums: { [seriesKey: string]: ProcessedDatum[] }
  bestFitStraightLineEquations: { [seriesKey: string]: StraightLineEquation }
  datumKdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> }
  graphComponentRects: GraphComponentRects
}

export default GraphGeometry
