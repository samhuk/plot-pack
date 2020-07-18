import Datum from './types/Datum'
import AxesBound from './types/AxesBound'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit, calculateMean } from '../../common/helpers/stat'
import { isInRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import { Axis2D } from '../../common/types/geometry'
import DatumSnapMode from './types/DatumSnapMode'
import DatumDistanceFunction from './types/DatumDistanceFunction'
import { mapDict } from '../../common/helpers/dict'
import DatumFocusPointDeterminationMode from './types/DatumFocusPointDeterminationMode'
import UnfocusedPositionedDatum from './types/UnfocusedPositionedDatum'
import DatumFocusPoint from './types/DatumFocusPoint'
import { normalizeDatumsErrorBarsValues } from './errorBars'
import { createAxesGeometry } from './axesGeometry'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'

const kdTree: any = require('kd-tree-javascript')

export type AxisValueRangeForceOptions = {
  forceLower: boolean;
  forceUpper: boolean;
}

export type AxesValueRangeForceOptions = { [axis in Axis2D]: AxisValueRangeForceOptions }

const getBestFitLineType = (props: Options, seriesKey: string) => props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.type
  ?? props.bestFitLineOptions?.type
  ?? BestFitLineType.STRAIGHT

const getValueRangeOfDatum = (datum: Datum) => ({
  x: {
    min: typeof datum.x === 'number' ? datum.x : Math.min(...datum.x),
    max: typeof datum.x === 'number' ? datum.x : Math.max(...datum.x),
  },
  y: {
    min: typeof datum.y === 'number' ? datum.y : Math.min(...datum.y),
    max: typeof datum.y === 'number' ? datum.y : Math.max(...datum.y),
  },
})

/**
 * Determines the minimum and maximum values for each axis
 */
const calculateValueRangesOfDatums = (datums: Datum[]): AxesBound => {
  if (datums.length === 0)
    return { [Axis2D.X]: { lower: 0, upper: 0 }, [Axis2D.Y]: { lower: 0, upper: 0 } }

  const firstDatumValueRange = getValueRangeOfDatum(datums[0])
  let xMin = firstDatumValueRange.x.min
  let xMax = firstDatumValueRange.x.max
  let yMin = firstDatumValueRange.y.min
  let yMax = firstDatumValueRange.y.max
  for (let i = 1; i < datums.length; i += 1) {
    const datumValueRanges = getValueRangeOfDatum(datums[i])
    if (datumValueRanges.x.max > xMax)
      xMax = datumValueRanges.x.max
    if (datumValueRanges.x.min < xMin)
      xMin = datumValueRanges.x.min
    if (datumValueRanges.y.max > yMax)
      yMax = datumValueRanges.y.max
    if (datumValueRanges.y.min < yMin)
      yMin = datumValueRanges.y.min
  }

  return { [Axis2D.X]: { lower: xMin, upper: xMax }, [Axis2D.Y]: { lower: yMin, upper: yMax } }
}

const calculateValueRangesOfSeries = (series: { [seriesKey: string]: Datum[] }): AxesBound => (
  Object.values(mapDict(series, (_, datums) => calculateValueRangesOfDatums(datums)))
    .reduce((acc, axesRange) => (acc == null
      ? axesRange
      : {
        [Axis2D.X]: {
          lower: Math.min(axesRange[Axis2D.X].lower, acc[Axis2D.X].lower),
          upper: Math.max(axesRange[Axis2D.X].upper, acc[Axis2D.X].upper),
        },
        [Axis2D.Y]: {
          lower: Math.min(axesRange[Axis2D.Y].lower, acc[Axis2D.Y].lower),
          upper: Math.max(axesRange[Axis2D.Y].upper, acc[Axis2D.Y].upper),
        },
      }), null)
)

const determineDatumFocusPoint = (
  unfocusedPositionedDatum: UnfocusedPositionedDatum,
  datumFocusPointDeterminationMode: DatumFocusPointDeterminationMode,
): DatumFocusPoint => {
  const { vX, vY, pX, pY } = unfocusedPositionedDatum
  const isXNumber = typeof unfocusedPositionedDatum.vX === 'number'
  const isYNumber = typeof unfocusedPositionedDatum.vY === 'number'

  switch (datumFocusPointDeterminationMode ?? DatumFocusPointDeterminationMode.FIRST) {
    case DatumFocusPointDeterminationMode.FIRST:
      return {
        fvX: isXNumber ? (vX as number) : (vX as number[])[0],
        fvY: isYNumber ? (vY as number) : (vY as number[])[0],
        fpX: isXNumber ? (pX as number) : (pX as number[])[0],
        fpY: isYNumber ? (pY as number) : (pY as number[])[0],
      }
    case DatumFocusPointDeterminationMode.SECOND:
      return {
        fvX: isXNumber ? (vX as number) : (vX as number[])[1],
        fvY: isYNumber ? (vY as number) : (vY as number[])[1],
        fpX: isXNumber ? (pX as number) : (pX as number[])[1],
        fpY: isYNumber ? (pY as number) : (pY as number[])[1],
      }
    case DatumFocusPointDeterminationMode.AVERAGE:
      return {
        fvX: isXNumber ? (vX as number) : calculateMean(vX as number[]),
        fvY: isYNumber ? (vY as number) : calculateMean(vY as number[]),
        fpX: isXNumber ? (pX as number) : calculateMean(pX as number[]),
        fpY: isYNumber ? (pY as number) : calculateMean(pY as number[]),
      }
    default:
      return null
  }
}

const mapDatumValueCoordinateToScreenPositionValue = (value: number | number[], transformationFunction: (value: number) => number) => (
  typeof value === 'number'
    ? (value != null ? transformationFunction(value as number) : null)
    : (value as number[]).map(subValue => (subValue != null ? transformationFunction(subValue) : null))
)

const calculatePositionedDatums = (
  datums: Datum[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
  axesValueBound: AxesBound,
  datumFocusPointDeterminationMode: DatumFocusPointDeterminationMode | ((datum: UnfocusedPositionedDatum) => DatumFocusPoint),
): PositionedDatum[] => datums
  .filter(({ x, y }) => {
    const vlX = axesValueBound[Axis2D.X].lower
    const vuX = axesValueBound[Axis2D.X].upper
    const vlY = axesValueBound[Axis2D.Y].lower
    const vuY = axesValueBound[Axis2D.Y].upper
    return (
      typeof x === 'number' ? isInRange(vlX, vuX, x) : (isInRange(vlX, vuX, Math.min(...x)) && isInRange(vlX, vuX, Math.max(...x)))
    ) && (
      typeof y === 'number' ? isInRange(vlY, vuY, y) : (isInRange(vlY, vuY, Math.min(...y)) && isInRange(vlY, vuY, Math.max(...y)))
    )
  })
  .map(({ x, y }) => {
    const pX = mapDatumValueCoordinateToScreenPositionValue(x, xAxisPFn)
    const pY = mapDatumValueCoordinateToScreenPositionValue(y, yAxisPFn)
    const unfocusedPositioneDatum: UnfocusedPositionedDatum = { vX: x, vY: y, pX, pY }
    const focusPoint = typeof datumFocusPointDeterminationMode === 'function'
      ? datumFocusPointDeterminationMode(unfocusedPositioneDatum)
      : determineDatumFocusPoint(unfocusedPositioneDatum, datumFocusPointDeterminationMode)
    return {
      vX: x,
      vY: y,
      pX,
      pY,
      fvX: focusPoint.fvX,
      fvY: focusPoint.fvY,
      fpX: focusPoint.fpX,
      fpY: focusPoint.fpY,
    }
  })

export const createDatumDistanceFunction = (datumSnapMode: DatumSnapMode): DatumDistanceFunction => {
  const xDistanceFunction = (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.fpX - datum2.fpX)

  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return xDistanceFunction
    case DatumSnapMode.SNAP_NEAREST_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.fpY - datum2.fpY)
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.sqrt((datum1.fpX - datum2.fpX) ** 2 + (datum1.fpY - datum2.fpY) ** 2)
    default:
      return xDistanceFunction
  }
}

const createDatumDimensionStringList = (datumSnapMode: DatumSnapMode): string[] => {
  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return ['fpX']
    case DatumSnapMode.SNAP_NEAREST_Y:
      return ['fpY']
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return ['fpX', 'fpY']
    default:
      return ['fpX']
  }
}

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
export const createGraphGeometry = (canvas: HTMLCanvasElement, props: Options): GraphGeometry => {
  const drawer = createCanvasDrawer(canvas, props.heightPx, props.widthPx)

  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const datumValueRange = calculateValueRangesOfSeries(normalizedSeries)

  const forcedVlX = props.axesOptions?.[Axis2D.X]?.valueBound?.lower
  const forcedVlY = props.axesOptions?.[Axis2D.Y]?.valueBound?.lower
  const forcedVuX = props.axesOptions?.[Axis2D.X]?.valueBound?.upper
  const forcedVuY = props.axesOptions?.[Axis2D.Y]?.valueBound?.upper

  const axesValueRangeForceOptions: AxesValueRangeForceOptions = {
    [Axis2D.X]: {
      forceLower: forcedVlX != null,
      forceUpper: forcedVuX != null,
    },
    [Axis2D.Y]: {
      forceLower: forcedVlY != null,
      forceUpper: forcedVuY != null,
    },
  }
  // Determine value bounds
  const axesValueBound: AxesBound = {
    [Axis2D.X]: {
      lower: forcedVlX ?? datumValueRange[Axis2D.X].lower,
      upper: forcedVuX ?? datumValueRange[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      lower: forcedVlY ?? datumValueRange[Axis2D.Y].lower,
      upper: forcedVuY ?? datumValueRange[Axis2D.Y].upper,
    },
  }

  const axesGeometry = createAxesGeometry(drawer, props, axesValueBound, axesValueRangeForceOptions)

  // Calculate positioned datums, adding screen position and a focus point to each datum.
  const positionedDatums = mapDict(normalizedSeries, (seriesKey, datums) => (
    calculatePositionedDatums(datums, axesGeometry[Axis2D.X].p, axesGeometry[Axis2D.Y].p, axesValueBound, props.datumFocusPointDeterminationMode)
  ))

  // Calculate best fit straight line for each series
  const bestFitStraightLineEquations = mapDict(positionedDatums, (seriesKey, datums) => (
    getBestFitLineType(props, seriesKey) === BestFitLineType.STRAIGHT
      ? calculateStraightLineOfBestFit(datums.map(d => ({ x: d.fvX, y: d.fvY })))
      : null
  ))

  // Create a K-D tree for the datums to provide quicker (as in, O(log(n)) complexity) nearest neighboor searching
  // eslint-disable-next-line new-cap
  const datumKdTrees = mapDict(normalizedSeries, seriesKey => new kdTree.kdTree(
    positionedDatums[seriesKey],
    createDatumDistanceFunction(props.datumSnapOptions?.mode),
    createDatumDimensionStringList(props.datumSnapOptions?.mode),
  ))

  return {
    axesGeometry,
    bestFitStraightLineEquations,
    positionedDatums,
    datumKdTrees,
  }
}
