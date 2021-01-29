import { TextLabelOptions } from '../../../common/components/textLabel/types'
import { RoundedRectOptions } from '../../../common/drawer/types'
import { InputPadding } from '../../../common/rectPositioningEngine/types'
import { LineOptions, TextOptions } from '../../../common/types/canvas'
import { InputPolarVector, Point2D, RectHorizontalAlign, RectVerticalAlign } from '../../../common/types/geometry'
import AnnotationType from './AnnotationType'
import AxesBound from './AxesBound'
import Geometry from './Geometry'

export type RangeAnnotationLabelOptions = {
  text?: string
  textOptions?: TextOptions
  verticalAlign?: RectVerticalAlign
  horizontalAlign?: RectHorizontalAlign
  offsetX?: number
  offsetY?: number
  backgroundRectOptions?: RoundedRectOptions & {
    draw?: boolean
    padding?: InputPadding
  }
}

export type RangeAnnotationOptions = {
  axesValueBound: AxesBound
  rectOptions?: RoundedRectOptions
  labelOptions?: RangeAnnotationLabelOptions
}

type ValueAnnotationOptionsBase = {
  value: Point2D
}

type MarkerAnnotationOptionsBase = {
  seriesKey: string
  markerIndex: number
}

type ImageAnnotationOptionsBase = {
  imageSrc: string
}

type TextAnnotationOptionsBase = {
  textLabelOptions: TextLabelOptions
}

type HtmlAnnotationOptionsBase = {
  render: (screenPosition: Point2D, geometry: Geometry) => HTMLElement
}

export type ValueImageAnnotationOptions = ValueAnnotationOptionsBase & ImageAnnotationOptionsBase

export type ValueTextAnnotationOptions = ValueAnnotationOptionsBase & TextAnnotationOptionsBase

export type ValueHtmlAnnotationOptions = ValueAnnotationOptionsBase & HtmlAnnotationOptionsBase

export type MarkerImageAnnotationOptions = MarkerAnnotationOptionsBase & ImageAnnotationOptionsBase

export type MarkerTextAnnotationOptions = MarkerAnnotationOptionsBase & TextAnnotationOptionsBase

export type MarkerHtmlAnnotationOptions = MarkerAnnotationOptionsBase & HtmlAnnotationOptionsBase

type AnnotationTypeToOptionsMap = {
  [AnnotationType.RANGE]: RangeAnnotationOptions
  [AnnotationType.VALUE_IMAGE]: ValueImageAnnotationOptions
  [AnnotationType.VALUE_TEXT]: ValueTextAnnotationOptions
  [AnnotationType.VALUE_HTML]: ValueHtmlAnnotationOptions
  [AnnotationType.MARKER_IMAGE]: MarkerImageAnnotationOptions
  [AnnotationType.MARKER_TEXT]: MarkerTextAnnotationOptions
  [AnnotationType.MARKER_HTML]: MarkerHtmlAnnotationOptions
}

type AnnotationTypeUnion = {
  [K in AnnotationType]: { type: K } & AnnotationTypeToOptionsMap[K]
}[AnnotationType]

export type AnnotationOptions<T extends AnnotationType> = AnnotationTypeUnion & { type: T }

export default AnnotationOptions
