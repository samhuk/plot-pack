import { RoundedRectOptions } from '../../../common/drawer/types'
import { ColumnJustification, InputMargin, InputPadding } from '../../../common/rectPositioningEngine/types'
import { TextOptions, LineOptions } from '../../../common/types/canvas'

export type TooltipOptions = {
  positioningOptions?: {
    xDistanceFromMarker?: number
  }
  rectOptions?: RoundedRectOptions & {
    padding?: InputPadding
  }
  yDataRowOptions?: {
    verticalSpacing?: number
  }
  ySeriesPreviewOptions?: {
    width?: number
    marginLeft?: number
    marginRight?: number
  }
  yValueOptions?: TextOptions & {
    marginLeft?: number
    marginRight?: number
  }
  yLabelOptions?: TextOptions & {
    marginLeft?: number
    marginRight?: number
  }
  xValueOptions?: TextOptions & {
    textHorizontalAlign?: ColumnJustification,
    margin?: InputMargin
  }
  xValueDividerOptions?: LineOptions & {
    margin?: InputMargin
  }
  visibilityOptions?: {
    showYSeriesPreviewColumn?: boolean
    showXValue?: boolean
    showXValueDivider?: boolean
  }
}

export default TooltipOptions
