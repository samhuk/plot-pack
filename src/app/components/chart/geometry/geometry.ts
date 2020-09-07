import Options from '../types/Options'
import Geometry from '../types/Geometry'
import BestFitLineType from '../types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../../common/helpers/stat'
import { Axis2D } from '../../../common/types/geometry'
import { mapDict } from '../../../common/helpers/dict'
import { normalizeDatumsErrorBarsValues } from '../data/errorBars'
import { createAxesGeometry } from '../plotBase/geometry/axesGeometry'
import ChartZones from '../types/ChartZones'
import { CanvasDrawer } from '../../../common/drawer/types'
import { calculateProcessedDatums } from '../data/datumProcessing'
import { getChartZoneRects } from './chartZoneRects'
import { createDatumDistanceFunction, createDatumDimensionStringList } from './datumDistance'
import { getAxesValueRangeOptions, calculateValueRangesOfSeries } from '../data/datumsValueRange'
import { getBestFitLineType } from '../data/bestFitLine'
import AxesValueRangeOptions from '../types/AxesValueRangeOptions'

const kdTree: any = require('kd-tree-javascript')

/**
 * ### Introduction
 *
 * This is the core function of the Chart component. This will determine and calculate all the required
 * geometrical properties of the chart, such as the axes value and screen space bounds, the
 * grid spacing, number of grid lines, a K-D tree of the datums, bounding rects for the various parts of
 * the chart, and so on.
 */
export const createGeometry = (drawer: CanvasDrawer, props: Options): Geometry => {
  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const datumValueRange = calculateValueRangesOfSeries(normalizedSeries)

  const chartAxesValueRangeOptions = getAxesValueRangeOptions(props, datumValueRange)

  const chartZoneRects = getChartZoneRects(drawer, props)

  const chartAxesGeometry = createAxesGeometry(drawer, props, chartAxesValueRangeOptions, chartZoneRects[ChartZones.CHART])

  // Calculate positioned datums, adding screen position and a focus point to each datum.
  const processedDatums = mapDict(normalizedSeries, (seriesKey, datums) => (
    calculateProcessedDatums(
      datums,
      chartAxesGeometry[Axis2D.X].p,
      chartAxesGeometry[Axis2D.Y].p,
      datumValueRange,
      props.datumFocusPointDeterminationMode,
    )
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

  const navigatorAxesValueRangeOptions: AxesValueRangeOptions = {
    [Axis2D.X]: {
      isUpperForced: false,
      isLowerForced: false,
      lower: datumValueRange[Axis2D.X].lower,
      upper: datumValueRange[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      isLowerForced: false,
      isUpperForced: false,
      lower: datumValueRange[Axis2D.Y].lower,
      upper: datumValueRange[Axis2D.Y].upper,
    },
  }

  const navigatorAxesGeometry = createAxesGeometry(drawer, props, navigatorAxesValueRangeOptions, chartZoneRects[ChartZones.NAVIGATOR])

  return {
    chartAxesGeometry,
    navigatorAxesGeometry,
    bestFitStraightLineEquations,
    processedDatums,
    datumKdTrees,
    chartZoneRects,
  }
}
