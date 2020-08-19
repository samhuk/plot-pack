import { SizeUnit } from '../../../common/canvasFlex/types'
import NavigatorSeriesOptions from './NavigatorSeriesOptions'
import { LineOptions } from '../../../common/types/canvas'

export type NavigatorOptions = {
  height?: number
  heightUnit?: SizeUnit
  seriesOptions?: { [seriesKey: string]: NavigatorSeriesOptions }
  connectingLineOptions?: LineOptions
}

export default NavigatorOptions
