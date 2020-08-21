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

const kdTree: any = require('kd-tree-javascript')

export type AxisValueRangeForceOptions = {
  forceLower: boolean;
  forceUpper: boolean;
}

export type AxesValueRangeForceOptions = { [axis in Axis2D]: AxisValueRangeForceOptions }

const getBestFitLineType = (props: Options, seriesKey: string) => props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.type
  ?? props.bestFitLineOptions?.type
  ?? BestFitLineType.STRAIGHT

/**
 * ### Introduction
 *
 * The core function of the Graph component. This will determine and calculate all the required
 * geometrical properties of the graph, such as the axes value and screen space bounds, the
 * grid spacing, number of grid lines, a K-D tree of the datums, and so on.
 *
 * ### Approach
 *
 * The approach taken here is highly involved. This is mainly due to the cyclical dependence of
 * the axes geometry on their marker labels and vice versa. To expand, the axes marker labels
 * depend on the axes geometry (i.e. number of grid lines, grid spacing, etc.), however the
 * axes geometry depends on the bounding rect of the marker labels, (i.e. the larger the marker labels,
 * the less space is available for the axes).
 *
 * To attack this challenge, a "tentative" axes geometry is created, under the assumption
 * that no axes marker labels exist. The axis marker labels for these axes will likely overrun the allowed
 * space of the axes in at least 2 directions. This overrun is calculated for each direction, then
 * accounted for when next calculating the "adjusted" axes geometry. There is no guarantee that second time
 * around there is also no overrun, since recalculation of the axes could change the axes marker labels to
 * then overrun again, however this is an exceptional case. One can manually define the margin and padding
 * in that case...
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
