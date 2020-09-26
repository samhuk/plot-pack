import { SizeUnit } from '../../../common/rectPositioningEngine/types'
import NavigatorSeriesOptions from './NavigatorSeriesOptions'
import { LineOptions } from '../../../common/types/canvas'
import Datum from './Datum'
import NavigatorBoundBoxOptions from './NavigatorBoundBoxOptions'

/**
 * Options for the navigator.
 *
 * @param series Optional alternative source of data for the navigator to use
 * @param height Height of the navigator. Will be in units of the given `heightUnits`.
 * @param heightUnit Units of the `height` value.
 * @param seriesOptions Options for each series of the navigator
 * @param connectingLineOptions Options for all connecting lines drawn in the navigator
 * @param boundBoxOptions Options for the bound box of the navigator, i.e. the box
 * that represents the currently selected x-value bound.
 */
export type NavigatorOptions = {
  series?: { [seriesKey: string]: Datum[] }
  height?: number
  heightUnit?: SizeUnit
  seriesOptions?: { [seriesKey: string]: NavigatorSeriesOptions }
  connectingLineOptions?: LineOptions
  boundBoxOptions?: NavigatorBoundBoxOptions
}

export default NavigatorOptions
