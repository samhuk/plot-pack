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

  // TODO: Pass in correct options (background opacity, etc., when canvasDrawer drawOptions supports those parameters)
  drawer.rect(rect, {
    lineOptions: { color: options.borderColor, lineWidth: options.borderLineWidth, dashPattern: options.borderDashPattern },
    fillOptions: { color: options.backgroundColor },
    fill: options.backgroundColor != null,
    stroke: options.borderLineWidth != null && options.borderLineWidth !== 0,
  })

  const _unoccludedRect: Rect = {
    x: geometry.chartAxesGeometry.x.pl,
    y: geometry.chartAxesGeometry.y.pu,
    height: geometry.chartAxesGeometry.y.pl - geometry.chartAxesGeometry.y.pu,
    width: geometry.chartAxesGeometry.x.pu - geometry.chartAxesGeometry.x.pl,
  }
  drawer.occlusionBorder(_unoccludedRect)
}

export default render
