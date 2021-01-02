import { CanvasDrawer } from '../../../common/drawer/types'
import AnnotationOptions from '../types/AnnotationOptions'
import AnnotationsOptions from '../types/AnnotationsOptions'
import AnnotationType from '../types/AnnotationType'
import Geometry from '../types/Geometry'
import { render as renderRangeAnnotation } from './rangeAnnotation'

const renderAnnotation = (drawer: CanvasDrawer, geometry: Geometry, options: AnnotationOptions<AnnotationType>) => {
  switch (options.type) {
    case AnnotationType.RANGE:
    {
      renderRangeAnnotation(drawer, geometry, options)
      break
    }
    // TODO: Implement the rest of the annotation types
    default:
      break
  }
}

export const render = (drawer: CanvasDrawer, geometry: Geometry, options: AnnotationsOptions) => {
  if (options?.annotationOptionsList == null)
    return

  drawer.clearRenderingSpace()

  // Draw each annotation
  options.annotationOptionsList.forEach(annotationOptions => renderAnnotation(drawer, geometry, annotationOptions))

  // Draw occlusion border
  drawer.occlusionBorder({
    x: geometry.chartAxesGeometry.x.pl,
    y: geometry.chartAxesGeometry.y.pu,
    height: geometry.chartAxesGeometry.y.pl - geometry.chartAxesGeometry.y.pu,
    width: geometry.chartAxesGeometry.x.pu - geometry.chartAxesGeometry.x.pl,
  })
}
