import { StraightLineEquation } from '../../../common/types/geometry'
import ProcessedDatum from './ProcessedDatum'
import KdTree from './KdTree'
import AxesGeometry from './AxesGeometry'
import ChartComponentRects from './ChartComponentRects'

/**
 * Geometry of a chart. This is all the information that one would need
 * to draw a chart.
 */
export type ChartGeometry = {
  axesGeometry: AxesGeometry,
  processedDatums: { [seriesKey: string]: ProcessedDatum[] }
  bestFitStraightLineEquations: { [seriesKey: string]: StraightLineEquation }
  datumKdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> }
  chartComponentRects: ChartComponentRects
}

export default ChartGeometry
