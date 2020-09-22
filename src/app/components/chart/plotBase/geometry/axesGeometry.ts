import { Options } from '../../types/Options'
import { Axis2D, BoundingRect, Rect } from '../../../../common/types/geometry'
import AxesBound from '../../types/AxesBound'
import AxisMarkerLabel from '../../types/AxisMarkerLabel'
import AxesGeometry from '../../types/AxesGeometry'
import { createAxesMarkerLabels } from '../components/axisMarkerLabels'
import XAxisOrientation from '../../types/xAxisOrientation'
import YAxisOrientation from '../../types/yAxisOrientation'
import { mod, boundToRange } from '../../../../common/helpers/math'
import Bound from '../../types/Bound'
import UnpositionedAxisGeometry from '../../types/UnpositionedAxisGeometry'
import { getBoundingRectOfRects } from '../../../../common/helpers/geometry'
import { CanvasDrawer } from '../../../../common/drawer/types'
import AxesValueRangeOptions from '../../types/AxesValueRangeOptions'
import AxesValueRangeOption from '../../types/AxesValueRangeOption'

const DEFAULT_DP_GRID_MIN = 30

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

const getXAxisYPosition = (orientation: XAxisOrientation, plY: number, puY: number, yAxisPOrigin: number) => {
  switch (orientation) {
    case XAxisOrientation.TOP:
      return puY
    case XAxisOrientation.BOTTOM:
      return plY
    case XAxisOrientation.ORIGIN:
      return yAxisPOrigin
    default:
      return yAxisPOrigin
  }
}

const getYAxisXPosition = (orientation: YAxisOrientation, plX: number, puX: number, xAxisPOrigin: number) => {
  switch (orientation) {
    case YAxisOrientation.LEFT:
      return plX
    case YAxisOrientation.RIGHT:
      return puX
    case YAxisOrientation.ORIGIN:
      return xAxisPOrigin
    default:
      return xAxisPOrigin
  }
}

const determineGridBoundAndCount = (vlPrime: number, vuPrime: number, dvGrid: number): { vlGrid: number, vuGrid: number, numGridLines: number } => {
  /* Multiplying the value bounds by (1 + ε) will avoid imprecision errors.
   * vlPrime and/or vuPrime can sometimes be {someInteger} - ε, which would cause
   * problems when the modulus operator is used on them (e.g. 7.999... % 8 = 0.999...,
   * where-as since 7.999... is an imprecision off of 8.000..., one would expect 0).
   */
  const _vlPrime = vlPrime * (1 + 100 * Number.EPSILON)
  const _vuPrime = vuPrime * (1 + 100 * Number.EPSILON)
  const vlPrimeModDvGrid = mod(_vlPrime, dvGrid)
  const vuPrimeModDvGrid = mod(_vuPrime, dvGrid)

  const vlGridVectorToNextGridIncrementAbove = vlPrimeModDvGrid !== 0 ? Math.abs(vlPrimeModDvGrid - dvGrid) : 0
  const vuGridVectorToNextGridIncrementBelow = -vuPrimeModDvGrid
  const vlGrid = vlPrime + vlGridVectorToNextGridIncrementAbove
  const vuGrid = vuPrime + vuGridVectorToNextGridIncrementBelow

  const dvGridTotal = (vlGrid - vuGrid)

  const numGridLines = Math.round(Math.abs(dvGridTotal / dvGrid)) + 1

  return { vlGrid, vuGrid, numGridLines }
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
const calculateUnpositionedAxisGeometry = (
  valueRangeOption: AxesValueRangeOption,
  pixelScreenBound: Bound,
  dpMin: number,
  dvGrid?: number,
): UnpositionedAxisGeometry => {
  const pl = pixelScreenBound.lower
  const pu = pixelScreenBound.upper
  const vl = valueRangeOption.lower
  const vu = valueRangeOption.upper

  const dp = pu - pl

  const _dvGrid = dvGrid ?? calculateAutoDvGrid(vl, vu, dp, dpMin)
  const vlPrime = valueRangeOption.isLowerForced ? vl : calculateVlPrime(vl, _dvGrid)
  const vuPrime = valueRangeOption.isUpperForced ? vu : calculateVuPrime(vu, _dvGrid)

  const dpdv = dp / (vuPrime - vlPrime)

  const dpGrid = _dvGrid * dpdv

  const p = (v: number) => dpdv * (v - vlPrime) + pl

  const gridBoundAndCount = determineGridBoundAndCount(vlPrime, vuPrime, _dvGrid)

  return {
    vl: vlPrime,
    vu: vuPrime,
    pl,
    pu,
    dvGrid: _dvGrid,
    dpGrid,
    p,
    v: _p => ((_p - pl) / dpdv) + vlPrime,
    numGridLines: gridBoundAndCount.numGridLines,
    vlGrid: gridBoundAndCount.vlGrid,
    vuGrid: gridBoundAndCount.vuGrid,
    plGrid: p(gridBoundAndCount.vlGrid),
    puGrid: p(gridBoundAndCount.vuGrid),
  }
}

const calculateAxesGeometry = (
  xAxisOrientation: XAxisOrientation,
  yAxisOrientation: YAxisOrientation,
  axesValueRangeOptions: AxesValueRangeOptions,
  axesScreenBound: AxesBound,
  axesDpMin: { [axis in Axis2D]: number },
  axesDvGrid: { [axis in Axis2D]: number },
): AxesGeometry => {
  const unpositionedXAxisGeometry = calculateUnpositionedAxisGeometry(
    axesValueRangeOptions[Axis2D.X],
    axesScreenBound[Axis2D.X],
    axesDpMin[Axis2D.X],
    axesDvGrid[Axis2D.X],
  )
  const unpositionedYAxisGeometry = calculateUnpositionedAxisGeometry(
    axesValueRangeOptions[Axis2D.Y],
    axesScreenBound[Axis2D.Y],
    axesDpMin[Axis2D.Y],
    axesDvGrid[Axis2D.Y],
  )

  const boundedXAxisOrigin = boundToRange(unpositionedXAxisGeometry.p(0), unpositionedXAxisGeometry.pl, unpositionedXAxisGeometry.pu)
  const boundedYAxisOrigin = boundToRange(unpositionedYAxisGeometry.p(0), unpositionedYAxisGeometry.pl, unpositionedYAxisGeometry.pu)

  const xAxisYPosition = getXAxisYPosition(xAxisOrientation, unpositionedYAxisGeometry.pl, unpositionedYAxisGeometry.pu, boundedYAxisOrigin)
  const yAxisXPosition = getYAxisXPosition(yAxisOrientation, unpositionedXAxisGeometry.pl, unpositionedXAxisGeometry.pu, boundedXAxisOrigin)

  return {
    [Axis2D.X]: {
      ...unpositionedXAxisGeometry,
      orthogonalScreenPosition: xAxisYPosition, // The x axis' y-position
    },
    [Axis2D.Y]: {
      ...unpositionedYAxisGeometry,
      orthogonalScreenPosition: yAxisXPosition, // The y axis' x position
    },
  }
}

const getBoundingScreenRectsOfAxesMarkerLabels = (
  axesMarkerLabels: { [axis in Axis2D]: AxisMarkerLabel[] },
): { [axis in Axis2D]: BoundingRect } => ({
  [Axis2D.X]: getBoundingRectOfRects(axesMarkerLabels[Axis2D.X].map(l => l.textRect)),
  [Axis2D.Y]: getBoundingRectOfRects(axesMarkerLabels[Axis2D.Y].map(l => l.textRect)),
})

/**
 * Calculates the overrun in px in each direction of marker labels of the given
 * tentative axes geometry over the given axes screen bounds.
 */
const calculateAxisMarkerLabelOverrun = (
  drawer: CanvasDrawer,
  tentativeAxesGeometry: AxesGeometry,
  tentativeAxesScreenBound: AxesBound,
  props: Options,
): { left: number, right: number, top: number, bottom: number } => {
  // Create throwaway axis marker labels to determine how much, if at all, they overrun the tentative axes
  const axesMarkerLabels = createAxesMarkerLabels(drawer, tentativeAxesGeometry, props)
  // Get the bounding rect of each axis' marker labels
  const axesMarkerLabelsBoundingRects = getBoundingScreenRectsOfAxesMarkerLabels(axesMarkerLabels)
  // Calculate the overrun for each direction
  const brX = axesMarkerLabelsBoundingRects[Axis2D.X]
  const brY = axesMarkerLabelsBoundingRects[Axis2D.Y]
  return {
    left: Math.max(0, tentativeAxesScreenBound[Axis2D.X].lower - Math.min(brX.left, brY.left)),
    right: Math.max(0, Math.max(brX.right, brY.right) - tentativeAxesScreenBound[Axis2D.X].upper),
    top: Math.max(0, tentativeAxesScreenBound[Axis2D.Y].upper - Math.min(brX.top, brY.top)),
    bottom: Math.max(0, Math.max(brX.bottom, brY.bottom) - tentativeAxesScreenBound[Axis2D.Y].lower),
  }
}

const createAdjustedAxesScreenBoundDueToLabelOverrun = (
  drawer: CanvasDrawer,
  tentativeAxesGeometry: AxesGeometry,
  tentativeAxesScreenBound: AxesBound,
  props: Options,
): AxesBound => {
  const axisMarkerLabelOverruns = calculateAxisMarkerLabelOverrun(drawer, tentativeAxesGeometry, tentativeAxesScreenBound, props)
  // Adjust screen bounds to account for any overruns
  return {
    [Axis2D.X]: {
      lower: tentativeAxesScreenBound[Axis2D.X].lower + axisMarkerLabelOverruns.left,
      upper: tentativeAxesScreenBound[Axis2D.X].upper - axisMarkerLabelOverruns.right,
    },
    [Axis2D.Y]: {
      lower: tentativeAxesScreenBound[Axis2D.Y].lower - axisMarkerLabelOverruns.bottom,
      upper: tentativeAxesScreenBound[Axis2D.Y].upper + axisMarkerLabelOverruns.top,
    },
  }
}

const createAxesScreenBoundFromRect = (rect: Rect): AxesBound => ({
  [Axis2D.X]: { lower: rect.x, upper: rect.x + rect.width },
  [Axis2D.Y]: { upper: rect.y, lower: rect.y + rect.height },
})

const createAxesDvGrid = (props: Options): { [axis in Axis2D]: number } => ({
  [Axis2D.X]: props.axesOptions?.[Axis2D.X]?.dvGrid,
  [Axis2D.Y]: props.axesOptions?.[Axis2D.Y]?.dvGrid,
})

const createAxesDpMin = (): { [axis in Axis2D]: number } => ({
  [Axis2D.X]: DEFAULT_DP_GRID_MIN,
  [Axis2D.Y]: DEFAULT_DP_GRID_MIN,
})

const createAppliedCalculateAxesGeometryFunction = (
  xAxisOrientation: XAxisOrientation,
  yAxisOrientation: YAxisOrientation,
  axesValueRangeOptions: AxesValueRangeOptions,
  axesDpMin: { [axis in Axis2D]: number },
  axesDvGrid: { [axis in Axis2D]: number },
) => (axesScreenBound: AxesBound) => (
  calculateAxesGeometry(xAxisOrientation, yAxisOrientation, axesValueRangeOptions, axesScreenBound, axesDpMin, axesDvGrid)
)

/**
 * ### Introduction
 * This is a function that calculates  axes geometry given some basic information. It is the
 * entry-point to the most non-trivial module of the chart component.
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
export const createAxesGeometry = (
  drawer: CanvasDrawer,
  props: Options,
  axesValueRangeOptions: AxesValueRangeOptions,
  axesAvailableScreenRect: Rect,
): AxesGeometry => {
  // Calculate the tentative screen bounds of axes, not taking into account the effect of axis marker labels
  const tentativeAxesScreenBound = createAxesScreenBoundFromRect(axesAvailableScreenRect)

  const _calculateAxesGeometry = createAppliedCalculateAxesGeometryFunction(
    props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation,
    props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation,
    axesValueRangeOptions,
    createAxesDpMin(),
    createAxesDvGrid(props),
  )
  // Calculate the tentative geometry of the axes, not taking into account the effect of axis marker labels
  const tentativeAxesGeometry = _calculateAxesGeometry(tentativeAxesScreenBound)
  // Adjust screen bounds to account for any overruns
  const adjustedAxesScreenBound = createAdjustedAxesScreenBoundDueToLabelOverrun(drawer, tentativeAxesGeometry, tentativeAxesScreenBound, props)
  // Calculate new axes geometry, accounting for any overruns
  return _calculateAxesGeometry(adjustedAxesScreenBound)
}
