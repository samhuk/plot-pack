import { CanvasDrawer } from '../../../common/drawer/types'
import { Point2D, Rect } from '../../../common/types/geometry'
import AnnotationOptions, { RectVerticalAlign, RectHorizontalAlign } from '../types/AnnotationOptions'
import AnnotationType from '../types/AnnotationType'
import Geometry from '../types/Geometry'

const DEFAULT_OPTIONS: AnnotationOptions<AnnotationType.RANGE> = {
  axesValueBound: null,
  type: AnnotationType.RANGE,
  labelOptions: {
    text: null,
    horizontalAlign: RectHorizontalAlign.CENTER,
    verticalAlign: RectVerticalAlign.TOP_INSIDE,
    offsetX: 0,
    offsetY: 10,
    textOptions: {
      fontFamily: 'Helvetica',
      fontSize: 12,
      color: 'black',
      bold: true,
    },
  },
  rectOptions: {
    borderColor: 'grey',
    fill: true,
    stroke: true,
    fillOptions: {
      color: 'black',
      opacity: 0.1,
    },
    borderLineWidth: 1,
    borderRadii: 3,
    borderDashPattern: [],
  },
}

const determineLabelYPosition = (
  rangeRect: Rect,
  labelTextHeight: number,
  labelVerticalAlign: RectVerticalAlign,
) => {
  switch (labelVerticalAlign) {
    case RectVerticalAlign.TOP_OUTSIDE:
      return rangeRect.y - labelTextHeight
    case RectVerticalAlign.TOP_INSIDE:
      return rangeRect.y
    case RectVerticalAlign.CENTER:
      return rangeRect.y + (rangeRect.height / 2) - (labelTextHeight / 2)
    case RectVerticalAlign.BOTTOM_INSIDE:
      return rangeRect.y + rangeRect.height - labelTextHeight
    case RectVerticalAlign.BOTTOM_OUTSIDE:
      return rangeRect.y + rangeRect.height
    default:
      return rangeRect.y
  }
}

const determineLabelXPosition = (
  rangeRect: Rect,
  labelTextWidth: number,
  labelHorizontalAlign: RectHorizontalAlign,
) => {
  switch (labelHorizontalAlign) {
    case RectHorizontalAlign.LEFT_OUTSIDE:
      return rangeRect.x - labelTextWidth
    case RectHorizontalAlign.LEFT_INSIDE:
      return rangeRect.x
    case RectHorizontalAlign.CENTER:
      return rangeRect.x + (rangeRect.width / 2) - (labelTextWidth / 2)
    case RectHorizontalAlign.RIGHT_INSIDE:
      return rangeRect.x + rangeRect.width - labelTextWidth
    case RectHorizontalAlign.RIGHT_OUTSIDE:
      return rangeRect.x + rangeRect.width
    default:
      return rangeRect.x + (rangeRect.width / 2) - (labelTextWidth / 2)
  }
}

const determineLabelPosition = (
  rangeRect: Rect,
  labelTextWidth: number,
  labelTextHeight: number,
  labelVerticalAlign: RectVerticalAlign,
  labelHorizontalAlign: RectHorizontalAlign,
  offsetX: number,
  offsetY: number,
): Point2D => ({
  x: determineLabelXPosition(rangeRect, labelTextWidth, labelHorizontalAlign)
    + (offsetX ?? 0),
  y: determineLabelYPosition(rangeRect, labelTextHeight, labelVerticalAlign)
    + (offsetY ?? 0),
})

export const render = (
  drawer: CanvasDrawer,
  geometry: Geometry,
  options: AnnotationOptions<AnnotationType.RANGE>,
) => {
  const plX = options.axesValueBound.x?.lower != null
    ? geometry.chartAxesGeometry.x.p(options.axesValueBound.x?.lower)
    : geometry.chartAxesGeometry.x.pl
  const puX = options.axesValueBound.x?.upper != null
    ? geometry.chartAxesGeometry.x.p(options.axesValueBound.x?.upper)
    : geometry.chartAxesGeometry.x.pu
  const plYFromOptions = geometry.chartAxesGeometry.y.p(options.axesValueBound.y?.lower) ?? geometry.chartAxesGeometry.y.pl
  const puYFromOptions = geometry.chartAxesGeometry.y.p(options.axesValueBound.y?.upper) ?? geometry.chartAxesGeometry.y.pu
  const plY = Math.min(plYFromOptions, puYFromOptions)
  const puY = Math.max(plYFromOptions, puYFromOptions)

  const rangeRect: Rect = { x: plX, y: plY, height: puY - plY, width: puX - plX }

  drawer.roundedRect(rangeRect, options.rectOptions, DEFAULT_OPTIONS.rectOptions)

  if (options?.labelOptions?.text != null) {
    drawer.applyTextOptions(options.labelOptions.textOptions, DEFAULT_OPTIONS.labelOptions.textOptions)
    const labelTextWidth = drawer.measureTextWidth(options.labelOptions.text)
    const labelTextHeight = drawer.measureTextHeight(options.labelOptions.text)
    const vAlign = options.labelOptions.verticalAlign ?? DEFAULT_OPTIONS.labelOptions.verticalAlign
    const hAlign = options.labelOptions.horizontalAlign ?? DEFAULT_OPTIONS.labelOptions.horizontalAlign
    const offsetX = options.labelOptions.offsetX ?? DEFAULT_OPTIONS.labelOptions.offsetX
    const offsetY = options.labelOptions.offsetY ?? DEFAULT_OPTIONS.labelOptions.offsetY
    const labelPosition = determineLabelPosition(rangeRect, labelTextWidth, labelTextHeight, vAlign, hAlign, offsetX, offsetY)
    drawer.text(
      options.labelOptions.text,
      labelPosition,
      null,
      options.labelOptions.textOptions,
      DEFAULT_OPTIONS.labelOptions.textOptions,
    )
  }

  drawer.occlusionBorder({
    x: geometry.chartAxesGeometry.x.pl,
    y: geometry.chartAxesGeometry.y.pu,
    height: geometry.chartAxesGeometry.y.pl - geometry.chartAxesGeometry.y.pu,
    width: geometry.chartAxesGeometry.x.pu - geometry.chartAxesGeometry.x.pl,
  })
}

export default render
