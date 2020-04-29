import { TextOptions, LineOptions } from '../../../common/types/canvas'

export type TooltipOptions = {
  backgroundColor?: string
  textColor?: string
  borderRadius?: number
  borderLineWidth?: number
  borderLineColor?: string
  boxPaddingX?: number
  boxPaddingY?: number
  fontFamily?: string
  fontSize?: number
  visibilityOptions?: {
    showSeriesStylePreview?: boolean
    showXValueTitle?: boolean
  }
  xValueLabelTextOptions?: TextOptions
  xValueLabelDividerOptions?: LineOptions
}

export default TooltipOptions
