import { SizeUnit } from '../../../common/rectPositioningEngine/types'
import NavigatorSeriesOptions from './NavigatorSeriesOptions'
import { LineOptions } from '../../../common/types/canvas'
import Datum from './Datum'

export type NavigatorOptions = {
  series?: { [seriesKey: string]: Datum[] }
  height?: number
  heightUnit?: SizeUnit
  seriesOptions?: { [seriesKey: string]: NavigatorSeriesOptions }
  connectingLineOptions?: LineOptions
}

export default NavigatorOptions
