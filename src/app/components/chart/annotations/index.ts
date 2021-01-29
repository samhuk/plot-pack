import { CanvasDrawer } from '../../../common/drawer/types'
import { createNotYetSupportedError } from '../../../common/errors'
import AnnotationOptions from '../types/AnnotationOptions'
import AnnotationsOptions from '../types/AnnotationsOptions'
import AnnotationType from '../types/AnnotationType'
import Geometry from '../types/Geometry'
import { render as renderRangeAnnotation } from './rangeAnnotation'
import { renderValueTextAnnotationOptions } from './textAnnotation'

const renderAnnotation = (drawer: CanvasDrawer, geometry: Geometry, options: AnnotationOptions<AnnotationType>) => {
  switch (options.type) {
    case AnnotationType.RANGE:
    {
      renderRangeAnnotation(drawer, geometry, options)
      break
    }
    case AnnotationType.VALUE_TEXT:
    {
      renderValueTextAnnotationOptions(drawer, geometry, options)
      break
    }
    case AnnotationType.VALUE_IMAGE:
    {
      throw createNotYetSupportedError('chart', `${AnnotationType.VALUE_IMAGE} annotation type`)
    }
    case AnnotationType.VALUE_HTML:
    {
      throw createNotYetSupportedError('chart', `${AnnotationType.VALUE_HTML} annotation type`)
    }
    case AnnotationType.MARKER_IMAGE:
    {
      throw createNotYetSupportedError('chart', `${AnnotationType.MARKER_IMAGE} annotation type`)
    }
    case AnnotationType.MARKER_HTML:
    {
      throw createNotYetSupportedError('chart', `${AnnotationType.MARKER_HTML} annotation type`)
    }
    case AnnotationType.MARKER_TEXT:
    {
      throw createNotYetSupportedError('chart', `${AnnotationType.MARKER_TEXT} annotation type`)
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
