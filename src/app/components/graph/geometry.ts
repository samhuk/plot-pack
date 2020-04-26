import Datum from './types/Datum'
import AxesBound from './types/AxesBound'
import UnpositionedAxisGeometry from './types/UnpositionedAxisGeometry'
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
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import AxesGeometry from './types/AxesGeometry'
import { getAxisLabelText, getExteriorMargin as getAxisLabelExteriorMargin } from './axisLabels'
import { measureTextLineHeight, get2DContext } from '../../common/helpers/canvas'
import { applyTextOptionsToContext } from './drawGraph'
import { createXAxisMarkerLabels, createYAxisMarkerLabels } from './axisMarkerLabels'
import AxisMarkerLabel from './types/AxisMarkerLabel'
import { getTitleOptions, getExteriorMargin as getTitleExteriorMargin, getTitle } from './title'

const kdTree: any = require('kd-tree-javascript')

const DEFAULT_AXIS_MARGIN = 15
const DEFAULT_DP_GRID_MIN = 30

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
  forceVl: boolean = false,
  forceVu: boolean = false,
): UnpositionedAxisGeometry => {
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
    numGridLines: Math.floor(Math.abs(dvPrime / _dvGrid)) + 1 + (shouldAddOneDueToFloatingPointImprecision ? 1 : 0),
  }
}

const calculateAxesGeometry = (
  xAxisOrientation: XAxisOrientation,
  yAxisOrientation: YAxisOrientation,
  axesValueBound: AxesBound,
  axesScreenBound: AxesBound,
  dpMinX: number,
  dpMinY: number,
  dvGridX?: number,
  dvGridY?: number,
  forceVlX: boolean = false,
  forceVuX: boolean = false,
  forceVlY: boolean = false,
  forceVuY: boolean = false,
): AxesGeometry => {
  const unpositionedXAxisGeometry = calculateUnpositionedAxisGeometry(axesValueBound[Axis2D.X], axesScreenBound[Axis2D.X], dpMinX, dvGridX, forceVlX, forceVuX)
  const unpositionedYAxisGeometry = calculateUnpositionedAxisGeometry(axesValueBound[Axis2D.Y], axesScreenBound[Axis2D.Y], dpMinY, dvGridY, forceVlY, forceVuY)

  const boundedXAxisOrigin = boundToRange(unpositionedXAxisGeometry.p(0), unpositionedXAxisGeometry.pl, unpositionedXAxisGeometry.pu)
  const boundedYAxisOrigin = boundToRange(unpositionedYAxisGeometry.p(0), unpositionedYAxisGeometry.pl, unpositionedYAxisGeometry.pu)

  const xAxisYPosition = getXAxisYPosition(xAxisOrientation, unpositionedYAxisGeometry.pl, unpositionedYAxisGeometry.pu, boundedYAxisOrigin)
  const yAxisXPosition = getYAxisXPosition(yAxisOrientation, unpositionedXAxisGeometry.pl, unpositionedXAxisGeometry.pu, boundedXAxisOrigin)

  return {
    [Axis2D.X]: {
      ...unpositionedXAxisGeometry,
      orthogonalScreenPosition: xAxisYPosition,
    },
    [Axis2D.Y]: {
      ...unpositionedYAxisGeometry,
      orthogonalScreenPosition: yAxisXPosition,
    },
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

const getBoundingScreenRectOfAxisMarkerLabels = (labels: AxisMarkerLabel[]): { left: number, right: number, top: number, bottom: number } => {
  if (labels.length === 0)
    return { left: 0, right: 0, top: 0, bottom: 0 }

  const firstLabel = labels[0]
  const lastLabel = labels[labels.length - 1]

  let left = firstLabel.pX
  let right = lastLabel.pX + lastLabel.textWidth
  let top = firstLabel.pY - firstLabel.textHeight
  let bottom = lastLabel.pY

  labels.forEach(label => {
    if (label.pX < left)
      left = label.pX
    if (label.pX + label.textWidth > right)
      right = label.pX + label.textWidth
    if (label.pY - label.textHeight < top)
      top = label.pY - label.textHeight
    if (label.pY > bottom)
      bottom = label.pY
  })

  return { left, right, top, bottom }
}

const getBestFitLineType = (props: Options, seriesKey: string) => props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.type
  ?? props.bestFitLineOptions?.type
  ?? BestFitLineType.STRAIGHT

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
 * axes geometry depends on the bounding rect of the marker labels.
 *
 * To attack this challenge, a "tentative" axes geometry is created, under the assumption
 * that no axes marker labels exist. Then, the marker labels are created for this intial
 * axes geometry. Then, the overrun of the axes marker labels over the allowed screen space
 * for the axes is calculated. Finally, this overrun is accounted for when next calculating
 * the "adjusted" axes geometry.
 */
export const createGraphGeometry = (canvas: HTMLCanvasElement, props: Options): GraphGeometry => {
  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

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
  // Calculate the tentative screen bounds of axes, not taking into account the effect of axis marker labels
  const tentativeAxesScreenBound: AxesBound = createAxesScreenBound(ctx, props)
  // Calculate the tentative geometry of the axes, not taking into account the effect of axis marker labels
  const tentativeAxesGeometry = calculateAxesGeometry(
    props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation,
    props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation,
    axesValueBound,
    tentativeAxesScreenBound,
    DEFAULT_DP_GRID_MIN,
    DEFAULT_DP_GRID_MIN,
    props.axesOptions?.[Axis2D.X]?.dvGrid,
    props.axesOptions?.[Axis2D.Y]?.dvGrid,
    forcedVlX != null,
    forcedVuX != null,
    forcedVlY != null,
    forcedVuY != null,
  )
  // Create axis marker labels to determine how much, if at all, they overrun the pixel screen bounds
  const xAxisMarkerLabels = createXAxisMarkerLabels(ctx, tentativeAxesGeometry, props)
  const yAxisMarkerLabels = createYAxisMarkerLabels(ctx, tentativeAxesGeometry, props)
  // Get the bounding rect of each axis' marker labels
  const xAxisMarkerLabelsBoundingRect = getBoundingScreenRectOfAxisMarkerLabels(xAxisMarkerLabels)
  const yAxisMarkerLabelsBoundingRect = getBoundingScreenRectOfAxisMarkerLabels(yAxisMarkerLabels)
  // Calculate the overrun for each direction
  const leftMarkerLabelOverrun = Math.max(0, tentativeAxesScreenBound[Axis2D.X].lower - Math.min(xAxisMarkerLabelsBoundingRect.left, yAxisMarkerLabelsBoundingRect.left))
  const rightMarkerLabelOverrun = Math.max(0, Math.max(xAxisMarkerLabelsBoundingRect.right, yAxisMarkerLabelsBoundingRect.right) - tentativeAxesScreenBound[Axis2D.X].upper)
  const topMarkerLabelOverrun = Math.max(0, tentativeAxesScreenBound[Axis2D.Y].upper - Math.min(xAxisMarkerLabelsBoundingRect.top, yAxisMarkerLabelsBoundingRect.top))
  const bottomMarkerLabelOverrun = Math.max(0, Math.max(xAxisMarkerLabelsBoundingRect.bottom, yAxisMarkerLabelsBoundingRect.bottom) - tentativeAxesScreenBound[Axis2D.Y].lower)
  // Adjust screen bounds to account for any overruns
  const adjustedAxesScreenBound: AxesBound = {
    [Axis2D.X]: {
      lower: tentativeAxesScreenBound[Axis2D.X].lower + leftMarkerLabelOverrun,
      upper: tentativeAxesScreenBound[Axis2D.X].upper - rightMarkerLabelOverrun,
    },
    [Axis2D.Y]: {
      lower: tentativeAxesScreenBound[Axis2D.Y].lower - bottomMarkerLabelOverrun,
      upper: tentativeAxesScreenBound[Axis2D.Y].upper + topMarkerLabelOverrun,
    },
  }
  // Calculate new axes geometry, accounting for any overruns
  const adjustedAxesGeometry = calculateAxesGeometry(
    props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation,
    props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation,
    axesValueBound,
    adjustedAxesScreenBound,
    DEFAULT_DP_GRID_MIN,
    DEFAULT_DP_GRID_MIN,
    props.axesOptions?.[Axis2D.X]?.dvGrid,
    props.axesOptions?.[Axis2D.Y]?.dvGrid,
    forcedVlX != null,
    forcedVuX != null,
    forcedVlY != null,
    forcedVuY != null,
  )

  // Calculate positioned datums, adding screen position and a focus point to each datum.
  const positionedDatums = mapDict(normalizedSeries, (seriesKey, datums) => (
    calculatePositionedDatums(datums, adjustedAxesGeometry[Axis2D.X].p, adjustedAxesGeometry[Axis2D.Y].p, axesValueBound, props.datumFocusPointDeterminationMode)
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
    axesGeometry: adjustedAxesGeometry,
    bestFitStraightLineEquations,
    positionedDatums,
    datumKdTrees,
  }
}
