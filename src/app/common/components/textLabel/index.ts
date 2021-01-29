import { CanvasDrawer } from '../../drawer/types'
import { addVectors } from '../../helpers/geometry'
import { getNormalizedPadding, outwardPadRect } from '../../rectPositioningEngine/padding'
import { Point2D, Rect } from '../../types/geometry'
import { BackgroundRectOptions, OffsetLineOptions, TextLabelOptions } from './types'

const determineLabelTextRect = (
  drawer: CanvasDrawer,
  options: TextLabelOptions,
  startPosition: Point2D,
  labelPosition: Point2D,
): Rect => {
  const startScreenPosition = startPosition
  const endScreenPosition = labelPosition
  const isEndPositionRightOfStartPosition = endScreenPosition.x >= startScreenPosition.x
  const isEndPositionBelowStartPosition = endScreenPosition.y >= startScreenPosition.y
  const textRectDimensions = drawer.measureTextRectDimensions(options.text, options)
  return {
    x: isEndPositionRightOfStartPosition ? endScreenPosition.x : endScreenPosition.x + textRectDimensions.width,
    y: isEndPositionBelowStartPosition ? endScreenPosition.y : endScreenPosition.y - textRectDimensions.height,
    height: textRectDimensions.height,
    width: textRectDimensions.width,
  }
}

const drawLabelBackgroundRect = (
  drawer: CanvasDrawer,
  backgroundRectOptions: BackgroundRectOptions,
  backgroundRect: Rect,
): Rect => {
  drawer.roundedRect(backgroundRect, backgroundRectOptions, null)
  return backgroundRect
}

const drawLabelOffsetLine = (
  drawer: CanvasDrawer,
  offsetLineOptions: OffsetLineOptions,
  startPosition: Point2D,
  backgroundRect: Rect,
) => {
  const endPosition: Point2D = { x: backgroundRect.x, y: backgroundRect.y + backgroundRect.height / 2 }
  drawer.line([startPosition, endPosition], offsetLineOptions)
}

/**
 * Draws a text label, comprising of 3 parts:
 * * Label text - The text of the label
 * * Label text background - The optional background rectangle behind the text
 * * Offset line - The optional line that joins the given `position` with the
 *   (optionally) offset label text
 */
export const drawTextLabel = (drawer: CanvasDrawer, position: Point2D, options: TextLabelOptions) => {
  if (options?.text == null)
    return

  const labelPosition = addVectors([position, options.offsetVector])

  const textRect = determineLabelTextRect(drawer, options, position, labelPosition)

  const backgroundRect = outwardPadRect(textRect, getNormalizedPadding(options.backgroundRectOptions?.padding))

  // Optionally draw label background rect
  if (options.backgroundRectOptions?.draw)
    drawLabelBackgroundRect(drawer, options.backgroundRectOptions, backgroundRect)

  // Draw label text
  drawer.text(options.text, textRect, null, options, null)

  // Only draw line if there is an offset to the label and .draw is true
  if (options.offsetVector != null && options.offsetLineOptions?.draw)
    drawLabelOffsetLine(drawer, options.offsetLineOptions, position, backgroundRect)
}
