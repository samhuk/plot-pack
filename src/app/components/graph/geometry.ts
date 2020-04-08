import Datum from './types/Datum'
import AxesRange from './types/AxesRange'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../common/helpers/stat'
import { boundToRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'
import { Axis2D } from '../../common/types/geometry'

const getDefaultValueRangeOfDatums = (datum: Datum) => ({
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
    const datumValueRanges = getDefaultValueRangeOfDatums(data[i])
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

const calculateAxisGeometry = (
  vl: number,
  vu: number,
  pl: number,
  pu: number,
  dpMin: number,
  dvGrid?: number,
): AxisGeometry => {
  const dp = pu - pl

  const _dvGrid = dvGrid ?? calculateAutoDvGrid(vl, vu, dp, dpMin)

  // For a vl of 455, this is 400. For a vl of 400, this is 400 (i.e. it's inclusive)
  const vlModDvGrid = vl % _dvGrid
  const vlPrime = vl - vlModDvGrid - (vlModDvGrid !== 0 ? _dvGrid : 0)
  // For a vu of 880, this is 1200. For a vl of 800, this is 800 (i.e. it's inclusive)
  const vuModDvGrid = vu % _dvGrid
  const vuPrime = vu - vuModDvGrid + (vuModDvGrid !== 0 ? _dvGrid : 0)

  const dpdv = dp / (vuPrime - vlPrime)

  const dpGrid = _dvGrid * dpdv

  const p = (v: number) => dpdv * (v - vlPrime) + pl

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
    numGridLines: Math.max(0, Math.abs(Math.floor(((vlPrime - vuPrime) / _dvGrid))) + 1),
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

  const axesValueRange = calculateValueRanges(props.data)

  const vlX = props.axesOptions?.[Axis2D.X]?.vl ?? axesValueRange.vlX
  const vlY = props.axesOptions?.[Axis2D.Y]?.vl ?? axesValueRange.vlY
  const vuX = props.axesOptions?.[Axis2D.X]?.vu ?? axesValueRange.vuX
  const vuY = props.axesOptions?.[Axis2D.Y]?.vu ?? axesValueRange.vuY

  // Calculate pixel bounds of axes
  const plX = paddingX
  const puX = props.widthPx - paddingX
  const plY = props.heightPx - paddingY
  const puY = paddingY
  // Calculate the various properties of the axes
  const xAxis = calculateAxisGeometry(vlX, vuX, plX, puX, defaultGridMinPx, props.axesOptions?.[Axis2D.X]?.dvGrid)
  const yAxis = calculateAxisGeometry(vlY, vuY, plY, puY, defaultGridMinPx, props.axesOptions?.[Axis2D.Y]?.dvGrid)

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
