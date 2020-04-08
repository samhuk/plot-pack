import Datum from './types/Datum'
import AxesRange from './types/AxesRange'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../common/helpers/stat'
import { boundToRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'

const getDefaultValueRangeOfDatum = (datum: Datum) => ({
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
const calculateValueRanges = (data: Datum[]): AxesRange => {
  let xMin = 0
  let xMax = 0
  let yMin = 0
  let yMax = 0
  for (let i = 0; i < data.length; i += 1) {
    const datumValueRanges = getDefaultValueRangeOfDatum(data[i])
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

const calculateAxisGeometry = (vl: number, vu: number, pl: number, pu: number, dpMin: number): AxisGeometry => {
  const dp = pu - pl
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
  const dvGrid = normPrimeDvGridMin * magMultiplier
  // For a vl of 455, this is 400. For a vl of 400, this is 400 (i.e. it's inclusive)
  const vlModDvGrid = vl % dvGrid
  const vlPrime = vl - vlModDvGrid - (vlModDvGrid !== 0 ? dvGrid : 0)
  // For a vu of 880, this is 1200. For a vl of 800, this is 800 (i.e. it's inclusive)
  const vuModDvGrid = vu % dvGrid
  const vuPrime = vu - vuModDvGrid + (vuModDvGrid !== 0 ? dvGrid : 0)

  const dpdv = dp / (vuPrime - vlPrime)

  const dpGrid = dvGrid * dpdv

  const p = (v: number) => dpdv * (v - vlPrime) + pl

  return {
    vl: vlPrime,
    vu: vuPrime,
    pl,
    pu,
    dvGrid,
    dpGrid,
    p,
    v: _p => ((_p - pl) / dpdv) + vlPrime,
    pOrigin: boundToRange(p(0), pl, pu),
    numGridLines: Math.max(0, Math.abs(Math.floor(((vlPrime - vuPrime) / dvGrid))) + 1),
  }
}

const calculatePositionedDatums = (
  datums: Datum[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
): PositionedDatum[] => datums.map(datum => {
  const vX = typeof datum.x === 'number' ? datum.x : datum.x[0]
  const vY = typeof datum.y === 'number' ? datum.y : datum.y[0]
  return {
    vX,
    vY,
    pX: xAxisPFn(vX),
    pY: yAxisPFn(vY),
  }
})

export const createGraphGeometry = (props: Options): GraphGeometry => {
  const paddingX = 30
  const paddingY = 30
  const defaultGridMinPx = 30

  const { vlX, vuX, vlY, vuY } = calculateValueRanges(props.data)

  // Calculate pixel bounds of axes
  const plX = paddingX
  const puX = props.widthPx - paddingX
  const plY = props.heightPx - paddingY
  const puY = paddingY
  // Calculate the various properties of the axes
  const xAxis = calculateAxisGeometry(vlX, vuX, plX, puX, defaultGridMinPx)
  const yAxis = calculateAxisGeometry(vlY, vuY, plY, puY, defaultGridMinPx)

  const bestFitStraightLineEquation = props.bestFitLineOptions?.type === BestFitLineType.STRAIGHT
    ? calculateStraightLineOfBestFit(props.data.map(({ x, y }) => ({
      x: typeof x === 'number' ? x : x[0],
      y: typeof y === 'number' ? y : y[0],
    })))
    : null

  return {
    xAxis,
    yAxis,
    bestFitStraightLineEquation,
    positionedDatums: calculatePositionedDatums(props.data, xAxis.p, yAxis.p),
  }
}
