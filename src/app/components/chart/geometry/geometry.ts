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
    [Axis2D.X]: props.axesOptions?.[Axis2D.X]?.valueBound,
    [Axis2D.Y]: props.axesOptions?.[Axis2D.Y]?.valueBound,
  }
  const chartVisibleFocusedDatums = mapDict(focusedDatums, (_, datums) => (
    filterFocusedDatumsOutsideOfAxesBounds(datums, chartOptionsSpecifiedChartAxesValueBounds)
  ))
  const chartVisibleDatumsValueRange = calculateValueBoundsOfSeries(chartVisibleFocusedDatums)
  const chartAxesValueRangeOptions = getAxesValueRangeOptions(props, chartVisibleDatumsValueRange)
  const chartZoneRects = getChartZoneRects(drawer, props)
  const chartAxesGeometry = createAxesGeometry(drawer, props, chartAxesValueRangeOptions, chartZoneRects[ChartZones.CHART_PLOT_BASE])

  // Calculate positioned datums, adding screen position and a focus point to each datum.
  const chartProcessedDatums = mapDict(focusedDatums, (seriesKey, datums) => (
    calculateProcessedDatums(datums, chartAxesGeometry[Axis2D.X].p, chartAxesGeometry[Axis2D.Y].p)
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
  const allDatumsValueRange = calculateValueBoundsOfSeries(normalizedSeries)
  // Create the axes value range options for the Navigator, which will be the all-datums value range
  const navigatorAxesValueRangeOptions: AxesValueRangeOptions = {
    [Axis2D.X]: {
      isUpperForced: false,
      isLowerForced: false,
      lower: allDatumsValueRange[Axis2D.X].lower,
      upper: allDatumsValueRange[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      isLowerForced: false,
      isUpperForced: false,
      lower: allDatumsValueRange[Axis2D.Y].lower,
      upper: allDatumsValueRange[Axis2D.Y].upper,
    },
  }
  // Create axes geometry for the Navigator
  const navigatorAxesGeometry = createAxesGeometry(drawer, props, navigatorAxesValueRangeOptions, chartZoneRects[ChartZones.NAVIGATOR])

  const navigatorProcessedDatums = mapDict(focusedDatums, (seriesKey, datums) => (
    calculateProcessedDatums(datums, navigatorAxesGeometry[Axis2D.X].p, navigatorAxesGeometry[Axis2D.Y].p)
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
