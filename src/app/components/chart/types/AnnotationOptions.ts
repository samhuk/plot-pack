import { Point2D } from '../../../common/types/geometry'
import AnnotationType from './AnnotationType'
import AxesBound from './AxesBound'

export type RangeAnnotationOptions = {
  axesValueBound: AxesBound
  borderDashPattern?: number[]
  borderColor?: string
  borderLineWidth?: number
  backgroundColor?: string
  backgroundOpacity?: number
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
  text: string
}

type HtmlAnnotationOptionsBase = {
  render: () => HTMLElement
}

export type ValueImageAnnotationOptions = ValueAnnotationOptionsBase & ImageAnnotationOptionsBase

export type ValueTextAnnotationOptions = ValueAnnotationOptionsBase & TextAnnotationOptionsBase

export type ValueHtmlAnnotationOptions = ValueAnnotationOptionsBase & HtmlAnnotationOptionsBase

export type MarkerImageAnnotationOptions = MarkerAnnotationOptionsBase & ImageAnnotationOptionsBase

export type MarkerTextAnnotationOptions = MarkerAnnotationOptionsBase & TextAnnotationOptionsBase

export type MarkerHtmlAnnotationOptions = MarkerAnnotationOptionsBase & HtmlAnnotationOptionsBase

type AnnotationTypeToOptionsMap = {
  [AnnotationType.RANGE]: RangeAnnotationOptions
  [AnnotationType.VALUE_IMAGE]: ValueAnnotationOptionsBase
  [AnnotationType.VALUE_TEXT]: ValueAnnotationOptionsBase
  [AnnotationType.VALUE_HTML]: ValueAnnotationOptionsBase
  [AnnotationType.MARKER_IMAGE]: MarkerImageAnnotationOptions
  [AnnotationType.MARKER_TEXT]: MarkerTextAnnotationOptions
  [AnnotationType.MARKER_HTML]: MarkerHtmlAnnotationOptions
}

type AnnotationTypeUnion = {
  [K in AnnotationType]: { type: K } & AnnotationTypeToOptionsMap[K]
}[AnnotationType]

export type AnnotationOptions<T extends AnnotationType> = AnnotationTypeUnion & { type: T }

export default AnnotationOptions