import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../common/helpers/stat'
import { Axis2D } from '../../common/types/geometry'
import { mapDict } from '../../common/helpers/dict'
import { normalizeDatumsErrorBarsValues } from './errorBars'
import { createAxesGeometry } from './axesGeometry'
import GraphComponents from './types/GraphComponents'
import { CanvasDrawer } from '../../common/drawer/types'
import GraphComponentRects from './types/GraphComponentRects'
import { calculateProcessedDatums } from './datumProcessing'
import { getGraphComponentRects } from './graphComponentRects'
import { createDatumDistanceFunction, createDatumDimensionStringList } from './DatumDistance'
import { getAxesValueRangeOptions } from './datumsValueRange'
import { getBestFitLineType } from './bestFitLine'

const kdTree: any = require('kd-tree-javascript')

/**
 * ### Introduction
 *
 * This is the core function of the Graph component. This will determine and calculate all the required
 * geometrical properties of the graph, such as the axes value and screen space bounds, the
 * grid spacing, number of grid lines, a K-D tree of the datums, bounding rects for the various parts of
 * the graph, and so on.
 */
export const createGraphGeometry = (drawer: CanvasDrawer, props: Options): GraphGeometry => {
  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const axesValueRangeOptions = getAxesValueRangeOptions(props, normalizedSeries)

  const graphComponentRects: GraphComponentRects = getGraphComponentRects(drawer, props)

  const axesGeometry = createAxesGeometry(drawer, props, axesValueRangeOptions, graphComponentRects[GraphComponents.CHART])

  // Calculate positioned datums, adding screen position and a focus point to each datum.
  const processedDatums = mapDict(normalizedSeries, (seriesKey, datums) => (
    calculateProcessedDatums(datums, axesGeometry[Axis2D.X].p, axesGeometry[Axis2D.Y].p, axesValueRangeOptions, props.datumFocusPointDeterminationMode)
  ))

  // Calculate best fit straight line for each series
  const bestFitStraightLineEquations = mapDict(processedDatums, (seriesKey, datums) => (
    getBestFitLineType(props, seriesKey) === BestFitLineType.STRAIGHT
      ? calculateStraightLineOfBestFit(datums.map(d => ({ x: d.fvX, y: d.fvY })))
      : null
  ))

  // Create a K-D tree for the datums to provide quicker (as in, O(log(n)) complexity) nearest neighboor searching
  // eslint-disable-next-line new-cap
  const datumKdTrees = mapDict(normalizedSeries, seriesKey => new kdTree.kdTree(
    processedDatums[seriesKey],
    createDatumDistanceFunction(props.datumSnapOptions?.mode),
    createDatumDimensionStringList(props.datumSnapOptions?.mode),
  ))

  return {
    axesGeometry,
    bestFitStraightLineEquations,
    processedDatums,
    datumKdTrees,
    graphComponentRects,
  }
}
