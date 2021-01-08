import Datum from '../types/Datum'
import AxesBound from '../types/AxesBound'
import { filterDict, mapDict } from '../../../common/helpers/dict'
import Options from '../types/Options'
import AxesValueRangeForceOptions from '../types/AxesValueRangeForceOptions'
import AxesValueRangeOptions from '../types/AxesValueRangeOptions'
import Bound from '../types/Bound'

const getValueRangeOfDatum = (datum: Datum) => ({
  xMin: typeof datum.x === 'number' ? datum.x : Math.min(...datum.x),
  xMax: typeof datum.x === 'number' ? datum.x : Math.max(...datum.x),
  yMin: typeof datum.y === 'number' ? datum.y : Math.min(...datum.y),
  yMax: typeof datum.y === 'number' ? datum.y : Math.max(...datum.y),
})

/**
 * Determines the minimum and maximum values for each axis
 */
const calculateValueBoundsOfDatums = (datums: Datum[]): AxesBound => {
  if (datums.length === 0)
    return { x: { lower: 0, upper: 0 }, y: { lower: 0, upper: 0 } }

  const firstDatumValueRange = getValueRangeOfDatum(datums[0])
  let { xMin, xMax, yMin, yMax } = firstDatumValueRange
  for (let i = 1; i < datums.length; i += 1) {
    const datumValueRanges = getValueRangeOfDatum(datums[i])
    if (datumValueRanges.xMax > xMax)
      xMax = datumValueRanges.xMax
    if (datumValueRanges.xMin < xMin)
      xMin = datumValueRanges.xMin
    if (datumValueRanges.yMax > yMax)
      yMax = datumValueRanges.yMax
    if (datumValueRanges.yMin < yMin)
      yMin = datumValueRanges.yMin
  }

  return { x: { lower: xMin, upper: xMax }, y: { lower: yMin, upper: yMax } }
}

const patchAxisBoundIfLowerAndUpperEqual = (axisBound: Bound): Bound => {
  const { lower, upper } = axisBound
  return lower === upper
    ? (lower < 0
      ? { lower, upper: 0 }
      : { lower: 0, upper }
    )
    : axisBound
}

export const calculateValueBoundsOfSeries = (series: { [seriesKey: string]: Datum[] }): AxesBound => {
  const seriesWithEmptySeriesFilteredOut = filterDict(series, (_, datums) => datums != null && datums.length > 0)
  const seriesDatumValueBound = mapDict(seriesWithEmptySeriesFilteredOut, (_, datums) => calculateValueBoundsOfDatums(datums))

  const axesBounds = Object.values(seriesDatumValueBound)

  // If there are no axes bounds (occurs if there are no datums), then return a default 0 -> 1 bound
  if (axesBounds.length === 0) {
    return {
      x: { lower: 0, upper: 1 },
      y: { lower: 0, upper: 1 },
    }
  }

  // Determine the min and max bound of each series
  const axesBound = axesBounds
    .reduce((acc, _axesBound) => (acc == null
      ? _axesBound
      : {
        x: {
          lower: Math.min(_axesBound.x.lower, acc.x.lower),
          upper: Math.max(_axesBound.x.upper, acc.x.upper),
        },
        y: {
          lower: Math.min(_axesBound.y.lower, acc.y.lower),
          upper: Math.max(_axesBound.y.upper, acc.y.upper),
        },
      }), null)

  /* If the bound's lower and upper values are equal (often occurs if there was only only one datum)
   * then set either the lower or upper bound values to zero (depending of if the bound value is negative).
   */
  return {
    x: patchAxisBoundIfLowerAndUpperEqual(axesBound.x),
    y: patchAxisBoundIfLowerAndUpperEqual(axesBound.y),
  }
}

export const getAxesValueRangeOptions = (props: Options, datumValueBound: AxesBound): AxesValueRangeOptions => {
  const forcedVlX = props.axesOptions?.x?.valueBound?.lower
  const forcedVuX = props.axesOptions?.x?.valueBound?.upper
  const forcedVlY = props.axesOptions?.y?.valueBound?.lower
  const forcedVuY = props.axesOptions?.y?.valueBound?.upper

  const axesValueRangeForceOptions: AxesValueRangeForceOptions = {
    x: {
      forceLower: forcedVlX != null,
      forceUpper: forcedVuX != null,
    },
    y: {
      forceLower: forcedVlY != null,
      forceUpper: forcedVuY != null,
    },
  }

  // Determine value bounds
  const axesValueBound: AxesBound = {
    x: {
      lower: forcedVlX ?? datumValueBound.x.lower,
      upper: forcedVuX ?? datumValueBound.x.upper,
    },
    y: {
      lower: forcedVlY ?? datumValueBound.y.lower,
      upper: forcedVuY ?? datumValueBound.y.upper,
    },
  }

  return {
    x: {
      isLowerForced: axesValueRangeForceOptions.x.forceLower,
      isUpperForced: axesValueRangeForceOptions.x.forceUpper,
      lower: axesValueBound.x.lower,
      upper: axesValueBound.x.upper,
    },
    y: {
      isLowerForced: axesValueRangeForceOptions.y.forceLower,
      isUpperForced: axesValueRangeForceOptions.y.forceUpper,
      lower: axesValueBound.y.lower,
      upper: axesValueBound.y.upper,
    },
  }
}
