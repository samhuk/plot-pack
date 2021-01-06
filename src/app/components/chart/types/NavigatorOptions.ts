import { InputPadding } from '../../../common/rectPositioningEngine/types'
import NavigatorSeriesOptions from './NavigatorSeriesOptions'
import { LineOptions } from '../../../common/types/canvas'
import Datum from './Datum'
import NavigatorBoundBoxOptions from './NavigatorBoundBoxOptions'

export type NavigatorSeparatorOptions = LineOptions

/**
 * Options for the navigator.
 *
 * @param series Optional alternative source of data for the navigator to use
 * @param height Height of the navigator.
 * @param padding The padding around the navigator axes.
 * @param separatorOptions The options to configure the horizontal separator above the navigator
 * @param seriesOptions Options for each series of the navigator
 * @param connectingLineOptions Options for all connecting lines drawn in the navigator
 * @param boundBoxOptions Options for the bound box of the navigator, i.e. the box
 * that represents the currently selected x-value bound.
 */
export type NavigatorOptions = {
  series?: { [seriesKey: string]: Datum[] }
  height?: string | number
  padding?: InputPadding
  separatorOptions?: NavigatorSeparatorOptions
  seriesOptions?: { [seriesKey: string]: NavigatorSeriesOptions }
  connectingLineOptions?: LineOptions
  boundBoxOptions?: NavigatorBoundBoxOptions
}

export default NavigatorOptions
