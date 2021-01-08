import Options from '../types/Options'
import Geometry from '../types/Geometry'
import BestFitLineType from '../types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../../common/helpers/stat'
import { mapDict } from '../../../common/helpers/dict'
import { normalizeDatumsErrorBarsValues } from '../data/errorBars'
import { createAxesGeometry } from '../plotBase/geometry/axesGeometry'
import ChartZones from '../types/ChartZones'
import { CanvasDrawer } from '../../../common/drawer/types'
import { calculateProcessedDatums, calculateFocusedDatums, filterFocusedDatumsOutsideOfAxesBounds } from '../data/datumProcessing'
import { getChartZoneRects } from './chartZoneRects'
import { createDatumDistanceFunction, createDatumDimensionStringList } from './datumDistance'
import { getAxesValueRangeOptions, calculateValueBoundsOfSeries } from '../data/datumsValueRange'
import { getBestFitLineType } from '../data/bestFitLine'
import AxesValueRangeOptions from '../types/AxesValueRangeOptions'
import AxesBound from '../types/AxesBound'

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
  // Calculate normalized series, which involves normalizing the error bar values to absolute values
  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  // Calculate focused normalized series, which adds focus value points for each datum, i.e. { fvX, fvY }
  const focusedDatums = mapDict(normalizedSeries, (_, datums) => calculateFocusedDatums(datums, props.datumFocusPointDeterminationMode))

  /* Go through the various hoops to create the chart axes geometry and processed datums.
   * This involves using the options-specified axes value bounds to eventually determine
   * the datum value range for the chart, which influences the axes geometry, and then
   * that is used to calculate the chart-processed datums (focused datums that are
   * positioned in the chart axes screen space).
   */
  const chartOptionsSpecifiedChartAxesValueBounds: AxesBound = {
    x: props.axesOptions?.x?.valueBound,
    y: props.axesOptions?.y?.valueBound,
  }
  const datumsForChartAxesValueRangeOptions = (props.autoSetAxisBoundsToFitOnlyVisibleDatums ?? true)
    // Chart-visible focused datums
    ? mapDict(focusedDatums, (_, datums) => (
      filterFocusedDatumsOutsideOfAxesBounds(datums, chartOptionsSpecifiedChartAxesValueBounds)
    ))
    // All focused datums
    : focusedDatums
  const chartDatumsValueRange = calculateValueBoundsOfSeries(datumsForChartAxesValueRangeOptions)
  const chartAxesValueRangeOptions = getAxesValueRangeOptions(props, chartDatumsValueRange)
  const chartZoneRects = getChartZoneRects(drawer, props)
  const chartAxesGeometry = createAxesGeometry(drawer, props, chartAxesValueRangeOptions, chartZoneRects[ChartZones.CHART_PLOT_BASE])

  // Calculate positioned datums, adding screen position and a focus point to each datum.
  const chartProcessedDatums = mapDict(focusedDatums, (seriesKey, datums) => (
    calculateProcessedDatums(datums, chartAxesGeometry.x.p, chartAxesGeometry.y.p)
  ))

  // Calculate best fit straight line for each series
  const bestFitStraightLineEquations = mapDict(focusedDatums, (seriesKey, datums) => (
    getBestFitLineType(props, seriesKey) === BestFitLineType.STRAIGHT
      ? calculateStraightLineOfBestFit(datums.map(d => ({ x: d.fvX, y: d.fvY })))
      : null
  ))

  // -- Create a K-D tree for the visible datums to provide quicker (as in, O(log(n)) complexity) nearest neighboor searching
  const chartVisibleProcessedDatums = mapDict(chartProcessedDatums, (_, datums) => (
    filterFocusedDatumsOutsideOfAxesBounds(datums, chartOptionsSpecifiedChartAxesValueBounds)
  ))
  // eslint-disable-next-line new-cap
  const visibleDatumsKdTrees = mapDict(chartVisibleProcessedDatums, seriesKey => new kdTree.kdTree(
    chartVisibleProcessedDatums[seriesKey],
    createDatumDistanceFunction(props.datumSnapOptions?.mode),
    createDatumDimensionStringList(props.datumSnapOptions?.mode),
  ))

  // Calculate value range in each axis of all the provided datums (of all series)
  const hasNavigatorGotOwnSeries = props.navigatorOptions?.series != null
  const navigatorNormalizedSeries = hasNavigatorGotOwnSeries
    ? mapDict(props.navigatorOptions.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))
    : normalizedSeries
  const navigatorDatumsValueRange = calculateValueBoundsOfSeries(navigatorNormalizedSeries)
  // Create the axes value range options for the Navigator, which will be the all-datums value range
  const navigatorAxesValueRangeOptions: AxesValueRangeOptions = {
    x: {
      isUpperForced: false,
      isLowerForced: false,
      lower: navigatorDatumsValueRange.x.lower,
      upper: navigatorDatumsValueRange.x.upper,
    },
    y: {
      isLowerForced: false,
      isUpperForced: false,
      lower: navigatorDatumsValueRange.y.lower,
      upper: navigatorDatumsValueRange.y.upper,
    },
  }
  // Create axes geometry for the Navigator
  const navigatorAxesGeometry = createAxesGeometry(drawer, props, navigatorAxesValueRangeOptions, chartZoneRects[ChartZones.NAVIGATOR_PLOT_BASE])

  const navigatorFocusedDatums = hasNavigatorGotOwnSeries
    ? mapDict(navigatorNormalizedSeries, (_, datums) => calculateFocusedDatums(datums, props.datumFocusPointDeterminationMode))
    : focusedDatums
  const navigatorProcessedDatums = mapDict(navigatorFocusedDatums, (seriesKey, datums) => (
    calculateProcessedDatums(datums, navigatorAxesGeometry.x.p, navigatorAxesGeometry.y.p)
  ))

  return {
    chartAxesGeometry,
    navigatorAxesGeometry,
    bestFitStraightLineEquations,
    chartProcessedDatums,
    navigatorProcessedDatums,
    datumKdTrees: visibleDatumsKdTrees,
    chartZoneRects,
  }
}
