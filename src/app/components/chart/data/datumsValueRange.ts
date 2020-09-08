import Datum from '../types/Datum'
import AxesBound from '../types/AxesBound'
import { Axis2D } from '../../../common/types/geometry'
import { mapDict } from '../../../common/helpers/dict'
import Options from '../types/Options'
import AxesValueRangeForceOptions from '../types/AxesValueRangeForceOptions'
import AxesValueRangeOptions from '../types/AxesValueRangeOptions'

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

export const calculateValueBoundsOfSeries = (series: { [seriesKey: string]: Datum[] }): AxesBound => (
  Object.values(mapDict(series, (_, datums) => calculateValueBoundsOfDatums(datums)))
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

export const getAxesValueRangeOptions = (props: Options, datumValueRange: AxesBound): AxesValueRangeOptions => {
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
      lower: forcedVlX ?? datumValueRange[Axis2D.X].lower,
      upper: forcedVuX ?? datumValueRange[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      lower: forcedVlY ?? datumValueRange[Axis2D.Y].lower,
      upper: forcedVuY ?? datumValueRange[Axis2D.Y].upper,
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
