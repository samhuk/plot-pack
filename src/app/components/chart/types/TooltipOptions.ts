import { RoundedRectOptions } from '../../../common/drawer/types'
import { ColumnJustification, InputMargin, InputPadding } from '../../../common/rectPositioningEngine/types'
import { TextOptions, LineOptions } from '../../../common/types/canvas'
import { HoriztonalAlign, VerticalAlign } from '../../../common/types/geometry'

export enum TooltipReferencePosition {
  MARKER,
  CURSOR,
}

export type PositioningOption<TAlignment> = {
  absoluteDistanceFromMarker?: number
  preferredJustification?: TAlignment
  referencePosition?: TooltipReferencePosition
  allowFlexiblePositioning?: boolean
}

export type TooltipOptions = {
  positioningOptions?: {
    x?: PositioningOption<HoriztonalAlign>
    y?: PositioningOption<VerticalAlign>
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
