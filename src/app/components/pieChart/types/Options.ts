import DataList from './DataList'
import DataMode from './DataMode'
import OnClickHandler from './OnClickHandler'
import { Color } from '../../../common/types/color'

/**
 * Options for the Pie Chart
 *
 * @param data The data to displace
 * @param getData A promise that resolves with new data
 * @param dataMode The mode for reading the values in `data`.
 * * RAW - The values in the data correspond to raw values,
 * where each value is converted to a proportion of their sum
 * total. This mode means that `bufferDataPoint` will never
 * have to be used since the values will always fill the Pie Chart.
 * * PROPORTION - The values in the data already correspond to
 * proportions. These should add up to 1, however if not,
 * `bufferDataPoint` can be used to specify the properties
 * of the "filler" Pie Chart wedge.
 * @param bufferDataPoint Only used for when `dataMode` is PROPORTION.
 * Properties of the "filler" Pie Chart wedge, for when the proportion
 * values don't fully add up to 1. This is typically the "Other" wedge.
 * @param onClick Function to run when a Pie Chart wedge is clicked.
 */
export type Options = {
  data?: DataList
  getData?: Promise<DataList>
  dataMode?: DataMode
  bufferDataPoint?: {
    name: string
    description?: string
    fillColor?: Color
  }
  onClick?: OnClickHandler
  radiusPx: number
  wedgeFillColorHexes?: string[]
  textBoxDistanceFromCenter?: number
  labelFontFamily?: string
  labelFontSize?: number
}

export default Options
