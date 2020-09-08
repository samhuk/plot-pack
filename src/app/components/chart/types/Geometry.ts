import { StraightLineEquation } from '../../../common/types/geometry'
import ProcessedDatum from './ProcessedDatum'
import KdTree from './KdTree'
import AxesGeometry from './AxesGeometry'
import ChartZoneRects from './ChartZoneRects'

/**
 * Geometry of a component. This is all the information that one would need
 * to draw the component
 */
export type Geometry = {
  chartAxesGeometry: AxesGeometry,
  navigatorAxesGeometry: AxesGeometry,
  chartProcessedDatums: { [seriesKey: string]: ProcessedDatum[] }
  navigatorProcessedDatums: { [seriesKey: string]: ProcessedDatum[] }
  bestFitStraightLineEquations: { [seriesKey: string]: StraightLineEquation }
  datumKdTrees: { [seriesKey: string]: KdTree<ProcessedDatum> }
  chartZoneRects: ChartZoneRects
}

export default Geometry
