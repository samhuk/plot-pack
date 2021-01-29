import { drawTextLabel } from '../../../common/components/textLabel'
import { TextLabelOptions } from '../../../common/components/textLabel/types'
import { CanvasDrawer } from '../../../common/drawer/types'
import { deepMergeObjects } from '../../../common/helpers/object'
import { LineCap } from '../../../common/types/canvas'
import { Point2D } from '../../../common/types/geometry'
import { ValueTextAnnotationOptions } from '../types/AnnotationOptions'
import Geometry from '../types/Geometry'

const DEFAULT_TEXT_LABEL_OPTIONS: TextLabelOptions = {
  text: null,
  bold: false,
  color: 'black',
  fontFamily: 'Helvetica',
  fontSize: 14,
  italic: false,
  offsetVector: { x: 11, y: -5 },
  backgroundRectOptions: {
    borderColor: '#bbb',
    fill: true,
    stroke: true,
    fillOptions: {
      color: 'white',
      opacity: 0.6,
    },
    borderRadii: 3,
    padding: 4,
    borderDashPattern: [],
    borderLineWidth: 1,
    draw: false,
  },
  offsetLineOptions: {
    draw: true,
    color: 'black',
    lineWidth: 1.5,
    dashPattern: [],
    lineCap: LineCap.ROUND,
  },
}

export const renderValueTextAnnotationOptions = (drawer: CanvasDrawer, geometry: Geometry, options: ValueTextAnnotationOptions) => {
  // Convert value to screen position
  const valueScreenPosition: Point2D = {
    x: geometry.chartAxesGeometry.x.p(options.value.x ?? 0),
    y: geometry.chartAxesGeometry.y.p(options.value.y ?? 0),
  }

  const textLabelOptions = deepMergeObjects(options.textLabelOptions, DEFAULT_TEXT_LABEL_OPTIONS)
  // The deep merge doesn't handle union types well, as it will merge both unions, so we correct it here
  textLabelOptions.offsetVector = options.textLabelOptions?.offsetVector ?? DEFAULT_TEXT_LABEL_OPTIONS.offsetVector
  drawTextLabel(drawer, valueScreenPosition, textLabelOptions)
}
