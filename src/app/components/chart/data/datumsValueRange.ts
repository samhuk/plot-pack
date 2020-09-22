import Datum from '../types/Datum'
import AxesBound from '../types/AxesBound'
import { Axis2D } from '../../../common/types/geometry'
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
    return { [Axis2D.X]: { lower: 0, upper: 0 }, [Axis2D.Y]: { lower: 0, upper: 0 } }

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

  return { [Axis2D.X]: { lower: xMin, upper: xMax }, [Axis2D.Y]: { lower: yMin, upper: yMax } }
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
      [Axis2D.X]: { lower: 0, upper: 1 },
      [Axis2D.Y]: { lower: 0, upper: 1 },
    }
  }

  // Determine the min and max bound of each series
  const axesBound = axesBounds
    .reduce((acc, _axesBound) => (acc == null
      ? _axesBound
      : {
        [Axis2D.X]: {
          lower: Math.min(_axesBound[Axis2D.X].lower, acc[Axis2D.X].lower),
          upper: Math.max(_axesBound[Axis2D.X].upper, acc[Axis2D.X].upper),
        },
        [Axis2D.Y]: {
          lower: Math.min(_axesBound[Axis2D.Y].lower, acc[Axis2D.Y].lower),
          upper: Math.max(_axesBound[Axis2D.Y].upper, acc[Axis2D.Y].upper),
        },
      }), null)

  /* If the bound's lower and upper values are equal (often occurs if there was only only one datum)
   * then set either the lower or upper bound values to zero (depending of if the bound value is negative).
   */
  return {
    [Axis2D.X]: patchAxisBoundIfLowerAndUpperEqual(axesBound[Axis2D.X]),
    [Axis2D.Y]: patchAxisBoundIfLowerAndUpperEqual(axesBound[Axis2D.Y]),
  }
}

export const getAxesValueRangeOptions = (props: Options, datumValueBound: AxesBound): AxesValueRangeOptions => {
  const forcedVlX = props.axesOptions?.[Axis2D.X]?.valueBound?.lower
  const forcedVuX = props.axesOptions?.[Axis2D.X]?.valueBound?.upper
  const forcedVlY = props.axesOptions?.[Axis2D.Y]?.valueBound?.lower
  const forcedVuY = props.axesOptions?.[Axis2D.Y]?.valueBound?.upper

  const axesValueRangeForceOptions: AxesValueRangeForceOptions = {
    [Axis2D.X]: {
      forceLower: forcedVlX != null,
      forceUpper: forcedVuX != null,
    },
    [Axis2D.Y]: {
      forceLower: forcedVlY != null,
      forceUpper: forcedVuY != null,
    },
  }

  // Determine value bounds
  const axesValueBound: AxesBound = {
    [Axis2D.X]: {
      lower: forcedVlX ?? datumValueBound[Axis2D.X].lower,
      upper: forcedVuX ?? datumValueBound[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      lower: forcedVlY ?? datumValueBound[Axis2D.Y].lower,
      upper: forcedVuY ?? datumValueBound[Axis2D.Y].upper,
    },
  }

  return {
    [Axis2D.X]: {
      isLowerForced: axesValueRangeForceOptions[Axis2D.X].forceLower,
      isUpperForced: axesValueRangeForceOptions[Axis2D.X].forceUpper,
      lower: axesValueBound[Axis2D.X].lower,
      upper: axesValueBound[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      isLowerForced: axesValueRangeForceOptions[Axis2D.Y].forceLower,
      isUpperForced: axesValueRangeForceOptions[Axis2D.Y].forceUpper,
      lower: axesValueBound[Axis2D.Y].lower,
      upper: axesValueBound[Axis2D.Y].upper,
    },
  }
}
