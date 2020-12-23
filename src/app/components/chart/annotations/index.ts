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

  options.annotationOptionsList.forEach(annotationOptions => renderAnnotation(drawer, geometry, annotationOptions))
}
