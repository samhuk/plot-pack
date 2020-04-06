import { Color } from '../../../common/types/color'

export type DataPoint = {
  name: string
  description: string
  value: number
  color?: Color
}

export default DataPoint
