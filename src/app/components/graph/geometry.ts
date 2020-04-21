import Datum from './types/Datum'
import AxesBound from './types/AxesBound'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit, calculateMean } from '../../common/helpers/stat'
import { boundToRange, isInRange, mod } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import { Axis2D } from '../../common/types/geometry'
import DatumSnapMode from './types/DatumSnapMode'
import DatumDistanceFunction from './types/DatumDistanceFunction'
import { mapDict } from '../../common/helpers/dict'
import DatumFocusPointDeterminationMode from './types/DatumFocusPointDeterminationMode'
import UnfocusedPositionedDatum from './types/UnfocusedPositionedDatum'
import DatumFocusPoint from './types/DatumFocusPoint'
import { normalizeDatumsErrorBarsValues } from './errorBars'
import Bound from './types/Bound'

const kdTree: any = require('kd-tree-javascript')

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


const calculateAutoDvGrid = (vl: number, vu: number, dp: number, dpMin: number) => {
  // Calculate minimum possible value grid increment
  const dvGridMin = Math.abs(dpMin * ((vu - vl) / dp))
  // i.e. Given a dvGridMin of 360...
  // This is 2
  const magDvGridMin = Math.floor(Math.log10(dvGridMin))
  // This is 100
  const magMultiplier = 10 ** magDvGridMin
  // This is 3.6
  const normDvGridMin = dvGridMin / magMultiplier
  // This is 4
  const normPrimeDvGridMin = [2, 4, 5, 10].find(inc => inc > normDvGridMin)
  // This is 400
  return normPrimeDvGridMin * magMultiplier
}

const calculateVlPrime = (vl: number, dvGrid: number) => {
  // For a vl of 455, this is 400. For a vl of 400, this is 400 (i.e. it's inclusive)
  const vlModDvGrid = mod(vl, dvGrid)
  return vl - vlModDvGrid
}

const calculateVuPrime = (vu: number, dvGrid: number) => {
  // For a vu of 880, this is 1200. For a vl of 800, this is 800 (i.e. it's inclusive)
  const vuModDvGrid = mod(vu, dvGrid)
  return vu + (vuModDvGrid !== 0 ? dvGrid : 0) - vuModDvGrid
}

/**
 * Calculates the geometrical properties of an axis given some initial details.
 * @param valueBound The lower and upper value bound (i.e. min and max value) of the data
 * @param pixelScreenBound The lower and upper position bound (i.e. min and max possible position in units of px)
 * @param dpMin The minimum possible grid spacing in units of px
 * @param dvGrid Optional forced grid spacing in the value units
 * @param forceVl True to force the lower axis bound to be exactly the given `vl` value.
 * @param forceVu True to force the lower axis bound to be exactly the given `vu` value.
 */
const calculateAxisGeometry = (
  valueBound: Bound,
  pixelScreenBound: Bound,
  dpMin: number,
  dvGrid?: number,
  forceVl: boolean = false,
  forceVu: boolean = false,
): AxisGeometry => {
  const pl = pixelScreenBound.lower
  const pu = pixelScreenBound.upper
  const vl = valueBound.lower
  const vu = valueBound.upper

  const dp = pu - pl

  const _dvGrid = dvGrid ?? calculateAutoDvGrid(vl, vu, dp, dpMin)
  const vlPrime = forceVl ? vl : calculateVlPrime(vl, _dvGrid)
  const vuPrime = forceVu ? vu : calculateVuPrime(vu, _dvGrid)

  const dpdv = dp / (vuPrime - vlPrime)

  const dpGrid = _dvGrid * dpdv

  const p = (v: number) => dpdv * (v - vlPrime) + pl

  const dvPrime = vlPrime - vuPrime

  /* Solves floating-point imprecision errors made when calculating vlPrime or vuPrime.
   * Sometimes, and seemingly randomly, it will come out as, for example, 7.9999999...
   * This essentially inspects the size of the error of dvPrime from the nearest whole
   * grid value (e.g. 8). In that example, it's 1 * Number.EPSILON, but it can occasionally
   * be 2 * Number.EPSILON, 4 * ..., and so on.
   */
  const floatingPointError = mod(dvPrime + _dvGrid / 2, _dvGrid) - _dvGrid / 2
  const shouldAddOneDueToFloatingPointImprecision = [1, 2, 4, 8, 16, 32, 64].indexOf(floatingPointError / Number.EPSILON) !== -1

  return {
    vl: vlPrime,
    vu: vuPrime,
    pl,
    pu,
    dvGrid: _dvGrid,
    dpGrid,
    p,
    v: _p => ((_p - pl) / dpdv) + vlPrime,
    pOrigin: boundToRange(p(0), pl, pu),
    numGridLines: Math.floor(Math.abs(dvPrime / _dvGrid)) + 1 + (shouldAddOneDueToFloatingPointImprecision ? 1 : 0),
  }
}

const calculateAxesGeometry = (
  axesValueBound: AxesBound,
  axesPixelScreenBound: AxesBound,
  dpMinX: number,
  dpMinY: number,
  dvGridX?: number,
  dvGridY?: number,
  forceVlX: boolean = false,
  forceVuX: boolean = false,
  forceVlY: boolean = false,
  forceVuY: boolean = false,
) => ({
  [Axis2D.X]: calculateAxisGeometry(axesValueBound[Axis2D.X], axesPixelScreenBound[Axis2D.X], dpMinX, dvGridX, forceVlX, forceVuX),
  [Axis2D.Y]: calculateAxisGeometry(axesValueBound[Axis2D.Y], axesPixelScreenBound[Axis2D.Y], dpMinY, dvGridY, forceVlY, forceVuY),
})

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

const getBestFitLineType = (props: Options, seriesKey: string) => props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.type
  ?? props.bestFitLineOptions?.type
  ?? BestFitLineType.STRAIGHT

export const createGraphGeometry = (props: Options): GraphGeometry => {
  const paddingX = props.axesOptions?.[Axis2D.X]?.padding ?? 40
  const paddingY = props.axesOptions?.[Axis2D.Y]?.padding ?? 40
  const defaultGridMinPx = 30

  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const datumValueRange = calculateValueRangesOfSeries(normalizedSeries)

  const forcedVlX = props.axesOptions?.[Axis2D.X]?.valueBound?.lower
  const forcedVlY = props.axesOptions?.[Axis2D.Y]?.valueBound?.lower
  const forcedVuX = props.axesOptions?.[Axis2D.X]?.valueBound?.upper
  const forcedVuY = props.axesOptions?.[Axis2D.Y]?.valueBound?.upper

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
  // Calculate pixel bounds of axes
  const axesPixelScreenBound: AxesBound = {
    [Axis2D.X]: {
      lower: paddingX,
      upper: props.widthPx - paddingX,
    },
    [Axis2D.Y]: {
      lower: props.heightPx - paddingY,
      upper: paddingY,
    },
  }

  // Calculate the geometry of the axes
  const axesGeometry = calculateAxesGeometry(
    axesValueBound,
    axesPixelScreenBound,
    defaultGridMinPx,
    defaultGridMinPx,
    props.axesOptions?.[Axis2D.X]?.dvGrid,
    props.axesOptions?.[Axis2D.Y]?.dvGrid,
    forcedVlX != null,
    forcedVuX != null,
    forcedVlY != null,
    forcedVuY != null,
  )
  const positionedDatums = mapDict(normalizedSeries, (seriesKey, datums) => (
    calculatePositionedDatums(datums, axesGeometry[Axis2D.X].p, axesGeometry[Axis2D.Y].p, axesValueBound, props.datumFocusPointDeterminationMode)
  ))

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
