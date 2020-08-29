import { StraightLineEquation } from '../../../common/types/geometry'
import ProcessedDatum from './ProcessedDatum'
import KdTree from './KdTree'
import AxesGeometry from './AxesGeometry'
import ChartComponentRects from './ChartComponentRects'

/**
 * Geometry of a component. This is all the information that one would need
 * to draw the component
 */
export type Geometry = {
  chartAxesGeometry: AxesGeometry,
  navigatorAxesGeometry: AxesGeometry,
  processedDatums: { [seriesKey: string]: ProcessedDatum[] }
  bestFitStraightLineEquations: { [seriesKey: string]: StraightLineEquation }
  datumKdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> }
  chartComponentRects: ChartComponentRects
}

export default Geometry
