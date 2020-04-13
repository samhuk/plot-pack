import Datum from './types/Datum'
import AxesRange from './types/AxesRange'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../common/helpers/stat'
import { boundToRange, isInRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import { Axis2D } from '../../common/types/geometry'
import DatumSnapMode from './types/DatumSnapMode'
import DatumDistanceFunction from './types/DatumDistanceFunction'
import { mapDict } from '../../common/helpers/dict'

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

const calculatePositionedDatums = (
  datums: Datum[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
  vlX: number,
  vuX: number,
  vlY: number,
  vuY: number,
): PositionedDatum[] => datums
  .map(datum => ({
    vX: typeof datum.x === 'number' ? datum.x : datum.x[0],
    vY: typeof datum.y === 'number' ? datum.y : datum.y[0],
  }))
  .filter(({ vX, vY }) => isInRange(vlX, vuX, vX) && isInRange(vlY, vuY, vY))
  .map(({ vX, vY }) => ({
    vX,
    vY,
    pX: xAxisPFn(vX),
    pY: yAxisPFn(vY),
  }))

export const createDatumDistanceFunction = (datumSnapMode: DatumSnapMode): DatumDistanceFunction => {
  const xDistanceFunction = (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.pX - datum2.pX)

  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return xDistanceFunction
    case DatumSnapMode.SNAP_NEAREST_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.abs(datum1.pY - datum2.pY)
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return (datum1: PositionedDatum, datum2: PositionedDatum) => Math.sqrt((datum1.pX - datum2.pX) ** 2 + (datum1.pY - datum2.pY) ** 2)
    default:
      return xDistanceFunction
  }
}

const createDatumDimensionStringList = (datumSnapMode: DatumSnapMode): string[] => {
  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return ['pX']
    case DatumSnapMode.SNAP_NEAREST_Y:
      return ['pY']
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return ['pX', 'pY']
    default:
      return ['pX']
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

  const bestFitStraightLineEquations = mapDict(props.series, (seriesKey, datums) => (
    getBestFitLineType(props, seriesKey) === BestFitLineType.STRAIGHT
      ? calculateStraightLineOfBestFit(datums.map(({ x, y }) => ({
        x: typeof x === 'number' ? x : x[0],
        y: typeof y === 'number' ? y : y[0],
      })))
      : null
  ))

  const positionedDatums = mapDict(props.series, (seriesKey, datums) => (
    calculatePositionedDatums(datums, xAxis.p, yAxis.p, vlX, vuX, vlY, vuY)
  ))

  // Create a K-D tree for the datums to provide quicker (as in, O(log(n)) complexity) nearest neighboor searching
  // eslint-disable-next-line new-cap
  const datumKdTrees = mapDict(props.series, seriesKey => new kdTree.kdTree(
    positionedDatums[seriesKey],
    createDatumDistanceFunction(props.datumSnapMode),
    createDatumDimensionStringList(props.datumSnapMode),
  ))

  return {
    xAxis,
    yAxis,
    bestFitStraightLineEquations,
    positionedDatums,
    datumKdTrees,
  }
}
