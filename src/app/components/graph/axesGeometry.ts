import { Options } from './types/Options'
import { Axis2D, BoundingRect } from '../../common/types/geometry'
import { getAxisLabelText, getExteriorMargin as getAxisLabelExteriorMargin } from './axisLabels'
import { measureTextLineHeight, applyTextOptionsToContext } from '../../common/helpers/canvas'
import { getTitle, getTitleOptions, getExteriorMargin as getTitleExteriorMargin } from './title'
import AxesBound from './types/AxesBound'
import AxisMarkerLabel from './types/AxisMarkerLabel'
import AxesGeometry from './types/AxesGeometry'
import { createAxesMarkerLabels } from './axisMarkerLabels'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import { mod, boundToRange } from '../../common/helpers/math'
import Bound from './types/Bound'
import UnpositionedAxisGeometry from './types/UnpositionedAxisGeometry'
import { AxesValueRangeForceOptions, AxisValueRangeForceOptions } from './geometry'
import { getBoundingRectOfRects } from '../../common/helpers/geometry'

const DEFAULT_AXIS_MARGIN = 15
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
  valueBound: Bound,
  pixelScreenBound: Bound,
  dpMin: number,
  dvGrid?: number,
  valueRangeForceOptions?: AxisValueRangeForceOptions,
): UnpositionedAxisGeometry => {
  const pl = pixelScreenBound.lower
  const pu = pixelScreenBound.upper
  const vl = valueBound.lower
  const vu = valueBound.upper

  const dp = pu - pl

  const _dvGrid = dvGrid ?? calculateAutoDvGrid(vl, vu, dp, dpMin)
  const vlPrime = valueRangeForceOptions.forceLower ? vl : calculateVlPrime(vl, _dvGrid)
  const vuPrime = valueRangeForceOptions.forceUpper ? vu : calculateVuPrime(vu, _dvGrid)

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
    numGridLines: Math.floor(Math.abs(dvPrime / _dvGrid)) + 1 + (shouldAddOneDueToFloatingPointImprecision ? 1 : 0),
  }
}

const calculateAxesGeometry = (
  xAxisOrientation: XAxisOrientation,
  yAxisOrientation: YAxisOrientation,
  axesValueBound: AxesBound,
  axesScreenBound: AxesBound,
  axesDpMin: { [axis in Axis2D]: number },
  axesDvGrid: { [axis in Axis2D]: number },
  axesValueRangeForceOptions?: AxesValueRangeForceOptions,
): AxesGeometry => {
  const unpositionedXAxisGeometry = calculateUnpositionedAxisGeometry(
    axesValueBound[Axis2D.X],
    axesScreenBound[Axis2D.X],
    axesDpMin[Axis2D.X],
    axesDvGrid[Axis2D.X],
    axesValueRangeForceOptions[Axis2D.X],
  )
  const unpositionedYAxisGeometry = calculateUnpositionedAxisGeometry(
    axesValueBound[Axis2D.Y],
    axesScreenBound[Axis2D.Y],
    axesDpMin[Axis2D.Y],
    axesDvGrid[Axis2D.Y],
    axesValueRangeForceOptions[Axis2D.Y],
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

const getMarginDueToAxisLabel = (
  ctx: CanvasRenderingContext2D,
  props: Options,
  axis: Axis2D,
): number => {
  const xAxisLabelText = getAxisLabelText(props, Axis2D.X)
  if (xAxisLabelText == null)
    return 0
  applyTextOptionsToContext(ctx, props.axesOptions?.[axis]?.labelOptions)
  return getAxisLabelExteriorMargin(props, axis) + measureTextLineHeight(ctx)
}

const getMarginDueToTitle = (
  ctx: CanvasRenderingContext2D,
  props: Options,
): number => {
  const titleText = getTitle(props)
  if (titleText == null)
    return 0
  applyTextOptionsToContext(ctx, getTitleOptions(props))
  return getTitleExteriorMargin(props) + measureTextLineHeight(ctx)
}

const getAxisMargin = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMargin ?? DEFAULT_AXIS_MARGIN

const createAxesScreenBound = (ctx: CanvasRenderingContext2D, props: Options): AxesBound => {
  const isXAxisLabelOnBottom = true
  const isYAxisLabelOnLeft = true

  const xAxisMargin = getAxisMargin(props, Axis2D.X)
  const yAxisMargin = getAxisMargin(props, Axis2D.Y)

  const xAxisMarginDueToLabel = getMarginDueToAxisLabel(ctx, props, Axis2D.X)
  const yAxisMarginDueToLabel = getMarginDueToAxisLabel(ctx, props, Axis2D.Y)

  const yAxisUpperMarginDueToTitle = getMarginDueToTitle(ctx, props)

  const axesScreenBound: AxesBound = {
    [Axis2D.X]: {
      lower: yAxisMargin + (isYAxisLabelOnLeft ? yAxisMarginDueToLabel : 0),
      upper: props.widthPx - yAxisMargin - (isYAxisLabelOnLeft ? 0 : yAxisMarginDueToLabel),
    },
    [Axis2D.Y]: {
      lower: props.heightPx - xAxisMargin - (isXAxisLabelOnBottom ? xAxisMarginDueToLabel : 0),
      upper: xAxisMargin + (isXAxisLabelOnBottom ? 0 : xAxisMarginDueToLabel) + yAxisUpperMarginDueToTitle,
    },
  }
  return axesScreenBound
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
  ctx: CanvasRenderingContext2D,
  tentativeAxesGeometry: AxesGeometry,
  tentativeAxesScreenBound: AxesBound,
  props: Options,
): { left: number, right: number, top: number, bottom: number } => {
  // Create throwaway axis marker labels to determine how much, if at all, they overrun the tentative axes
  const axesMarkerLabels = createAxesMarkerLabels(ctx, tentativeAxesGeometry, props)
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

export const createAxesGeometry = (
  ctx: CanvasRenderingContext2D,
  props: Options,
  axesValueBound: AxesBound,
  axesValueRangeForceOptions: AxesValueRangeForceOptions,
) => {
  // Calculate the tentative screen bounds of axes, not taking into account the effect of axis marker labels
  const tentativeAxesScreenBound: AxesBound = createAxesScreenBound(ctx, props)
  const axesDpMin = { [Axis2D.X]: DEFAULT_DP_GRID_MIN, [Axis2D.Y]: DEFAULT_DP_GRID_MIN }
  const axesDvGrid = { [Axis2D.X]: props.axesOptions?.[Axis2D.X]?.dvGrid, [Axis2D.Y]: props.axesOptions?.[Axis2D.Y]?.dvGrid }
  // Calculate the tentative geometry of the axes, not taking into account the effect of axis marker labels
  const tentativeAxesGeometry = calculateAxesGeometry(
    props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation,
    props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation,
    axesValueBound,
    tentativeAxesScreenBound,
    axesDpMin,
    axesDvGrid,
    axesValueRangeForceOptions,
  )
  const axisMarkerLabelOverruns = calculateAxisMarkerLabelOverrun(ctx, tentativeAxesGeometry, tentativeAxesScreenBound, props)
  // Adjust screen bounds to account for any overruns
  const adjustedAxesScreenBound: AxesBound = {
    [Axis2D.X]: {
      lower: tentativeAxesScreenBound[Axis2D.X].lower + axisMarkerLabelOverruns.left,
      upper: tentativeAxesScreenBound[Axis2D.X].upper - axisMarkerLabelOverruns.right,
    },
    [Axis2D.Y]: {
      lower: tentativeAxesScreenBound[Axis2D.Y].lower - axisMarkerLabelOverruns.bottom,
      upper: tentativeAxesScreenBound[Axis2D.Y].upper + axisMarkerLabelOverruns.top,
    },
  }
  // Calculate new axes geometry, accounting for any overruns
  return calculateAxesGeometry(
    props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation,
    props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation,
    axesValueBound,
    adjustedAxesScreenBound,
    axesDpMin,
    axesDvGrid,
    axesValueRangeForceOptions,
  )
}
