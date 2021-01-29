import { CanvasDrawer } from '../../../common/drawer/types'
import { getNormalizedPadding } from '../../../common/rectPositioningEngine/padding'
import { Point2D, Rect, RectHorizontalAlign, RectVerticalAlign } from '../../../common/types/geometry'
import AnnotationOptions, { RangeAnnotationLabelOptions } from '../types/AnnotationOptions'
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
    offsetY: 4,
    textOptions: {
      fontFamily: 'Helvetica',
      fontSize: 12,
      color: 'black',
      bold: true,
    },
    backgroundRectOptions: {
      draw: true,
      borderColor: 'grey',
      fill: true,
      stroke: { left: true, bottom: true, right: true },
      fillOptions: {
        color: 'white',
        opacity: 0.6,
      },
      borderRadii: { bottomLeft: 3, bottomRight: 3 },
      padding: 3,
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

const drawLabel = (
  drawer: CanvasDrawer,
  rangeRect: Rect,
  labelOptions: RangeAnnotationLabelOptions,
) => {
  // Apply text options now for accurate text dimension measurements
  drawer.applyTextOptions(labelOptions.textOptions, DEFAULT_OPTIONS.labelOptions.textOptions)
  const textWidth = drawer.measureTextWidth(labelOptions.text)
  const textHeight = drawer.measureTextHeight(labelOptions.text)
  const vAlign = labelOptions.verticalAlign ?? DEFAULT_OPTIONS.labelOptions.verticalAlign
  const hAlign = labelOptions.horizontalAlign ?? DEFAULT_OPTIONS.labelOptions.horizontalAlign
  const offsetX = labelOptions.offsetX ?? DEFAULT_OPTIONS.labelOptions.offsetX
  const offsetY = labelOptions.offsetY ?? DEFAULT_OPTIONS.labelOptions.offsetY
  const labelPosition = determineLabelPosition(rangeRect, textWidth, textHeight, vAlign, hAlign, offsetX, offsetY)

  // Optionally draw background
  if (labelOptions.backgroundRectOptions?.draw ?? DEFAULT_OPTIONS.labelOptions.backgroundRectOptions.draw) {
    const padding = labelOptions.backgroundRectOptions?.padding ?? DEFAULT_OPTIONS.labelOptions.backgroundRectOptions.padding
    const normalizedPadding = getNormalizedPadding(padding)
    const textRect = {
      x: labelPosition.x - normalizedPadding.left,
      y: labelPosition.y - normalizedPadding.top,
      width: textWidth + (normalizedPadding.left + normalizedPadding.right),
      height: textHeight + (normalizedPadding.top + normalizedPadding.bottom),
    }
    drawer.roundedRect(textRect, labelOptions.backgroundRectOptions, DEFAULT_OPTIONS.labelOptions.backgroundRectOptions)
  }

  // Draw label
  drawer.text(
    labelOptions.text,
    labelPosition,
    null,
    labelOptions.textOptions,
    DEFAULT_OPTIONS.labelOptions.textOptions,
  )
}

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
  const puY = options.axesValueBound.y?.lower != null
    ? geometry.chartAxesGeometry.y.p(options.axesValueBound.y?.lower)
    : geometry.chartAxesGeometry.y.pl
  const plY = options.axesValueBound.y?.upper != null
    ? geometry.chartAxesGeometry.y.p(options.axesValueBound.y?.upper)
    : geometry.chartAxesGeometry.y.pu

  const rangeRect: Rect = { x: plX, y: plY, height: puY - plY, width: puX - plX }

  // The actual range rect
  drawer.roundedRect(rangeRect, options.rectOptions, DEFAULT_OPTIONS.rectOptions)

  // Label and it's background
  if (options?.labelOptions?.text != null)
    drawLabel(drawer, rangeRect, options?.labelOptions)
}

export default render
