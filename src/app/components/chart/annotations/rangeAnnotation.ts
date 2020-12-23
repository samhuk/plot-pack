import { CanvasDrawer } from '../../../common/drawer/types'
import { Rect } from '../../../common/types/geometry'
import AnnotationOptions from '../types/AnnotationOptions'
import AnnotationType from '../types/AnnotationType'
import Geometry from '../types/Geometry'

export const render = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  options: AnnotationOptions<AnnotationType.RANGE>,
) => {
  const plX = geometry.chartAxesGeometry.x.p(options.axesValueBound.x?.lower) ?? geometry.chartAxesGeometry.x.pl
  const puX = geometry.chartAxesGeometry.x.p(options.axesValueBound.x?.upper) ?? geometry.chartAxesGeometry.x.pu
  const plYFromOptions = geometry.chartAxesGeometry.y.p(options.axesValueBound.y?.lower) ?? geometry.chartAxesGeometry.y.pl
  const puYFromOptions = geometry.chartAxesGeometry.y.p(options.axesValueBound.y?.upper) ?? geometry.chartAxesGeometry.y.pu
  const plY = Math.min(plYFromOptions, puYFromOptions)
  const puY = Math.max(plYFromOptions, puYFromOptions)

  const rect: Rect = { x: plX, y: plY, height: puY - plY, width: puX - plX }

  drawer.rect(rect, {
    lineOptions: { color: options.borderColor, lineWidth: options.borderLineWidth, dashPattern: options.borderDashPattern },
    fillOptions: { color: options.backgroundColor },
    fill: options.backgroundColor != null,
    stroke: options.borderLineWidth != null && options.borderLineWidth !== 0,
  })
}

export default render