import Datum from './types/Datum'
import AxesRange from './types/AxesRange'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit, calculateMean } from '../../common/helpers/stat'
import { boundToRange, isInRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import { Axis2D } from '../../common/types/geometry'
import DatumSnapMode from './types/DatumSnapMode'
import DatumDistanceFunction from './types/DatumDistanceFunction'
import { mapDict } from '../../common/helpers/dict'
import DatumFocusPointDeterminationMode from './types/DatumFocusPointDeterminationMode'
import UnfocusedPositionedDatum from './types/UnfocusedPositionedDatum'
import DatumFocusPoint from './types/DatumFocusPoint'

const kdTree: any = require('kd-tree-javascript')

const getValueRangeOfDatums = (datum: Datum) => ({
  x: {
    min: typeof datum.x === 'number' ? datum.x : Math.min(...datum.x),
    max: typeof datum.x === 'number' ? datum.x : Math.max(...datum.x),
  },
  y: {
    min: typeof datum.y === 'number' ? datum.y : Math.max(...datum.y),
    max: typeof datum.y === 'number' ? datum.y : Math.max(...datum.y),
  },
})

/**
 * Determines the minimum and maximum values for each axis
 */
const calculateValueRangesOfDatums = (datums: Datum[]): AxesRange => {
  if (datums.length === 0)
    return { vlX: 0, vuX: 0, vlY: 0, vuY: 0 }

  const firstDatumValueRange = getValueRangeOfDatums(datums[0])
  let xMin = firstDatumValueRange.x.min
  let xMax = firstDatumValueRange.x.max
  let yMin = firstDatumValueRange.y.min
  let yMax = firstDatumValueRange.y.max
  for (let i = 1; i < datums.length; i += 1) {
    const datumValueRanges = getValueRangeOfDatums(datums[i])
    if (datumValueRanges.x.max > xMax)
      xMax = datumValueRanges.x.max
    if (datumValueRanges.x.min < xMin)
      xMin = datumValueRanges.x.min
    if (datumValueRanges.y.max > yMax)
      yMax = datumValueRanges.y.max
    if (datumValueRanges.y.min < yMin)
      yMin = datumValueRanges.y.min
  }

  return {
    vlX: xMin,
    vuX: xMax,
    vlY: yMin,
    vuY: yMax,
  }
}

const calculateValueRangesOfSeries = (series: { [seriesKey: string]: Datum[] }): AxesRange => (
  Object.values(mapDict(series, (_, datums) => calculateValueRangesOfDatums(datums)))
    .reduce((acc, axesRange) => (acc == null
      ? axesRange
      : {
        vlX: Math.min(axesRange.vlX, acc.vlX),
        vlY: Math.min(axesRange.vlY, acc.vlY),
        vuX: Math.max(axesRange.vuX, acc.vuX),
        vuY: Math.max(axesRange.vuY, acc.vuY),
      }),
      null as AxesRange)
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
  const vlModDvGrid = (vl - dvGrid) % dvGrid
  return vl - vlModDvGrid - (vlModDvGrid !== 0 ? dvGrid : 0)
}

const calculateVuPrime = (vu: number, dvGrid: number) => {
  // For a vu of 880, this is 1200. For a vl of 800, this is 800 (i.e. it's inclusive)
  const vuModDvGrid = vu % dvGrid
  return vu - vuModDvGrid + (vuModDvGrid !== 0 ? dvGrid : 0)
}

/**
 * Calculates the geometrical properties of an axis given some initial details.
 * @param vl The lower value bound (i.e. minimum value) of the data
 * @param vu The upper value bound (i.e. the maximum value) of the data
 * @param pl The lower position bound (i.e. the minimum possible position in units of px)
 * @param pu The upper position bound (i.e. the maximum possible position in units of px)
 * @param dpMin The minimum possible grid spacing in units of px
 * @param dvGrid Optional forced grid spacing in the value units
 * @param forceVl True to force the lower axis bound to the lower bound of the data, `vl`
 * @param forceVu True to force the upper axis bound to the upper bound of the data, `vu`
 */
const calculateAxisGeometry = (
  vl: number,
  vu: number,
  pl: number,
  pu: number,
  dpMin: number,
  dvGrid?: number,
  forceVl: boolean = false,
  forceVu: boolean = false,
): AxisGeometry => {
  const dp = pu - pl

  const _dvGrid = dvGrid ?? calculateAutoDvGrid(vl, vu, dp, dpMin)
  const vlPrime = forceVl ? vl : calculateVlPrime(vl, _dvGrid)
  const vuPrime = forceVu ? vu : calculateVuPrime(vu, _dvGrid)

  const dpdv = dp / (vuPrime - vlPrime)

  const dpGrid = _dvGrid * dpdv

  const p = (v: number) => dpdv * (v - vlPrime) + pl

  const dvPrime = vlPrime - vuPrime

  const shouldAddOneDueToFloatingPointImprecision = Math.abs(((dvPrime + _dvGrid / 2) % _dvGrid) - _dvGrid / 2) <= Number.EPSILON

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

const calculatePositionedDatums = (
  datums: Datum[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
  vlX: number,
  vuX: number,
  vlY: number,
  vuY: number,
  datumFocusPointDeterminationMode: DatumFocusPointDeterminationMode | ((datum: UnfocusedPositionedDatum) => DatumFocusPoint),
): PositionedDatum[] => datums
  .filter(({ x, y }) => (
    typeof x === 'number' ? isInRange(vlX, vuX, x) : (isInRange(vlX, vuX, Math.min(...x)) && isInRange(vlX, vuX, Math.max(...x)))
  ) && (
    typeof y === 'number' ? isInRange(vlY, vuY, y) : (isInRange(vlY, vuY, Math.min(...y)) && isInRange(vlY, vuY, Math.max(...y)))
  ))
  .map(({ x, y }) => {
    const isXNumber = typeof x === 'number'
    const isYNumber = typeof y === 'number'
    const pX = isXNumber ? xAxisPFn(x as number) : (x as number[]).map(xAxisPFn)
    const pY = isYNumber ? yAxisPFn(y as number) : (y as number[]).map(yAxisPFn)
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

  const axesValueRange = calculateValueRangesOfSeries(props.series)

  const forcedVlX = props.axesOptions?.[Axis2D.X]?.vl
  const forcedVlY = props.axesOptions?.[Axis2D.Y]?.vl
  const forcedVuX = props.axesOptions?.[Axis2D.X]?.vu
  const forcedVuY = props.axesOptions?.[Axis2D.Y]?.vu

  const vlX = forcedVlX ?? axesValueRange.vlX
  const vlY = forcedVlY ?? axesValueRange.vlY
  const vuX = forcedVuX ?? axesValueRange.vuX
  const vuY = forcedVuY ?? axesValueRange.vuY

  // Calculate pixel bounds of axes
  const plX = paddingX
  const puX = props.widthPx - paddingX
  const plY = props.heightPx - paddingY
  const puY = paddingY
  // Calculate the various properties of the axes
  const xAxis = calculateAxisGeometry(vlX, vuX, plX, puX, defaultGridMinPx, props.axesOptions?.[Axis2D.X]?.dvGrid, forcedVlX != null, forcedVuX != null)
  const yAxis = calculateAxisGeometry(vlY, vuY, plY, puY, defaultGridMinPx, props.axesOptions?.[Axis2D.Y]?.dvGrid, forcedVlY != null, forcedVuY != null)

  const positionedDatums = mapDict(props.series, (seriesKey, datums) => (
    calculatePositionedDatums(datums, xAxis.p, yAxis.p, vlX, vuX, vlY, vuY, props.datumFocusPointDeterminationMode)
  ))

  const bestFitStraightLineEquations = mapDict(positionedDatums, (seriesKey, datums) => (
    getBestFitLineType(props, seriesKey) === BestFitLineType.STRAIGHT
      ? calculateStraightLineOfBestFit(datums.map(d => ({ x: d.fpX, y: d.fpY })))
      : null
  ))

  // Create a K-D tree for the datums to provide quicker (as in, O(log(n)) complexity) nearest neighboor searching
  // eslint-disable-next-line new-cap
  const datumKdTrees = mapDict(props.series, seriesKey => new kdTree.kdTree(
    positionedDatums[seriesKey],
    createDatumDistanceFunction(props.datumSnapOptions?.mode),
    createDatumDimensionStringList(props.datumSnapOptions?.mode),
  ))

  return {
    xAxis,
    yAxis,
    bestFitStraightLineEquations,
    positionedDatums,
    datumKdTrees,
  }
}
