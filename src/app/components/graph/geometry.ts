import DataPoint from './types/DataPoint'
import AxesRange from './types/AxesRange'
import AxisGeometry from './types/AxisGeometry'
import Options from './types/Options'
import GraphGeometry from './types/GraphGeometry'
import BestFitLineType from './types/BestFitLineType'
import { calculateStraightLineOfBestFit } from '../../common/helpers/stat'
import { boundToRange } from '../../common/helpers/math'

/**
 * Determines the minimum and maximum values for each axis
 */
const calculateAxesValueRanges = (data: DataPoint[]): AxesRange => {
  let xMin = 0
  let xMax = 0
  let yMin = 0
  let yMax = 0
  for (let i = 0; i < data.length; i += 1) {
    const point = data[i]
    // x axis
    const x = point.x ?? 0
    const xLower = x - (point.dx != null ? point.dx / 2 : (point.dxMinus ?? 0))
    const xUpper = x + (point.dx != null ? point.dx / 2 : (point.dxPlus ?? 0))
    const _xMax = Math.max(x, xLower, xUpper)
    const _xMin = Math.min(x, xLower, xUpper)
    if (_xMax > xMax)
      xMax = _xMax
    if (_xMin < xMin)
      xMin = _xMin
    // y axis
    const y = point.y ?? 0
    const yLower = y - (point.dy != null ? point.dy / 2 : (point.dyMinus ?? 0))
    const yUpper = y + (point.dy != null ? point.dy / 2 : (point.dyMinus ?? 0))
    const _yMax = Math.max(y, yLower, yUpper)
    const _yMin = Math.min(y, yLower, yUpper)
    if (_yMax > yMax)
      yMax = _yMax
    if (_yMin < yMin)
      yMin = _yMin
  }

  return {
    vlX: xMin,
    vuX: xMax,
    vlY: yMin,
    vuY: yMax,
  }
}

const calculateAxisProperties = (vl: number, vu: number, pl: number, pu: number, dpMin: number): AxisGeometry => {
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

export const createGraphGeometry = (props: Options): GraphGeometry => {
  const paddingX = 30
  const paddingY = 30
  const defaultGridMinPx = 30

  const { vlX, vuX, vlY, vuY } = calculateAxesValueRanges(props.data)

  // Calculate pixel bounds of axes
  const plX = paddingX
  const puX = props.widthPx - paddingX
  const plY = props.heightPx - paddingY
  const puY = paddingY
  // Calculate the various properties of the axes
  const xAxis = calculateAxisProperties(vlX, vuX, plX, puX, defaultGridMinPx)
  const yAxis = calculateAxisProperties(vlY, vuY, plY, puY, defaultGridMinPx)

  const bestFitStraightLineEquation = props.bestFitLineOptions?.type === BestFitLineType.STRAIGHT
    ? calculateStraightLineOfBestFit(props.data)
    : null

  return { xAxis, yAxis, bestFitStraightLineEquation }
}
