import { isInRange } from '../../common/helpers/math'
import { Point2D, Arc, CircularSector } from '../../common/types/geometry'
import { colorClassMap } from '../../common/helpers/color'
import { Color } from '../../common/types/color'
import { fitText } from '../../common/helpers/textWrap'
import { TextSizeMeasurer } from '../../common/types/textWrap'
import { measureTextLineHeight } from '../../common/helpers/canvas'
import TextBoxRect from './types/TextBoxRect'

/**
 * Calculates the textual center point of a wedge with the given radius `r`,
 * arc `arc`, centered on the point ()
 */
const calculateTextCenterPoint = (circleCenter: Point2D, r: number, arc: Arc, distanceFromCenter: number) => {
  // Angle of the bisector
  const midAngle = arc.start + (arc.end - arc.start) / 2
  // Return the near-bisect (determined by the text center point from radii value) of the bisector
  return {
    x: circleCenter.x + (r * Math.cos(midAngle)) * distanceFromCenter,
    y: circleCenter.y + (r * Math.sin(midAngle)) * distanceFromCenter,
  }
}

/**
 * Calculates the intersection points (always forming a quadrilateral) of the text
 * box horizontal lines and the circle
 */
const calculateCircleTextBoxHorizontalsIntersectionXCoords = (
  circleCenter: Point2D,
  r: number,
  topY: number,
  bottomY: number,
): number[] => {
  const x0 = circleCenter.x
  const y0 = circleCenter.y
  // Top line x co-ords
  const topPointOnCircleXSqrtArg = Math.sqrt(r ** 2 - (topY - y0) ** 2)
  const topPointOnCircleXPlus = x0 + topPointOnCircleXSqrtArg
  const topPointOnCircleXMinus = x0 - topPointOnCircleXSqrtArg
  // Bottom line x-co-ords
  const bottomPointOnCircleXSqrtArg = Math.sqrt(r ** 2 - (bottomY - y0) ** 2)
  const bottomPointOnCircleXPlus = x0 + bottomPointOnCircleXSqrtArg
  const bottomPointOnCircleXMinus = x0 - bottomPointOnCircleXSqrtArg
  return [
    topPointOnCircleXMinus,
    topPointOnCircleXPlus,
    bottomPointOnCircleXPlus,
    bottomPointOnCircleXMinus,
  ]
}

/**
 * Calculates the intersection points of the straight lines of the wedge
 * with the text box horizontal lines. Because a wedge's straight line is not
 * infinite, the intersection points (found assuming they are infinite straight
 * lines) must be filtered for if they lie on the wedge's finite straight line.
 */
const calculateWedgeTextBoxHorizontalsIntersectionXCoords = (
  circleCenter: Point2D,
  r: number,
  topY: number,
  bottomY: number,
  arc: Arc,
): number[] => {
  const x0 = circleCenter.x
  const y0 = circleCenter.y
  // Calculate gradient of the start and end wedge straight lines
  const wedgeLineGradientStart = Math.tan(arc.start)
  const wedgeLineGradientEnd = Math.tan(arc.end)
  // Calculate intersection points
  const topStartIntersectionX = x0 + (topY - y0) / wedgeLineGradientStart
  const bottomStartIntersectionX = x0 + (bottomY - y0) / wedgeLineGradientStart
  const topEndIntersectionX = x0 + (topY - y0) / wedgeLineGradientEnd
  const bottomEndIntersectionX = x0 + (bottomY - y0) / wedgeLineGradientEnd
  // Aggregate and filter for points that lie on the wedge's straight line
  const wedgeStartLinePointOnCircleXCoord = x0 + r * Math.cos(arc.start)
  const wedgeEndLinePointOnCirlceXCoord = x0 + r * Math.cos(arc.end)
  return [
    isInRange(x0, wedgeStartLinePointOnCircleXCoord, topStartIntersectionX) ? topStartIntersectionX : null,
    isInRange(x0, wedgeStartLinePointOnCircleXCoord, bottomStartIntersectionX) ? bottomStartIntersectionX : null,
    isInRange(x0, wedgeEndLinePointOnCirlceXCoord, topEndIntersectionX) ? topEndIntersectionX : null,
    isInRange(x0, wedgeEndLinePointOnCirlceXCoord, bottomEndIntersectionX) ? bottomEndIntersectionX : null,
  ].filter(x => x != null && Math.abs(x) !== Infinity) // Text box horizontal can be parallel to one of the wedge straight line
}

/**
 * Calculates the bounding rect for the text box for the wedge with
 * the given `arc`.
 */
export const calculateTextBoxRect = (circularSector: CircularSector, distanceFromCenter: number, height: number): TextBoxRect => {
  // The point at which text should start writing from within the wedge
  const textCenterPoint = calculateTextCenterPoint(circularSector.position, circularSector.radius, circularSector.arc, distanceFromCenter)
  // The y co-ords of the top and bottom text box lines
  const topY = textCenterPoint.y + (height / 2)
  const bottomY = textCenterPoint.y - (height / 2)
  /* Determine all the intersection x coordinates of the text box
   * horizontal lines with the circle and wedge lines
   */
  const intersectionXCoords: number[] = calculateCircleTextBoxHorizontalsIntersectionXCoords(
    circularSector.position, circularSector.radius, topY, bottomY,
  ).concat(calculateWedgeTextBoxHorizontalsIntersectionXCoords(
    circularSector.position, circularSector.radius, topY, bottomY, circularSector.arc,
  ))
  // Find the closest intersection point in the negative-x direction to the text center point
  const firstXPointOnLeft = Math.max(...intersectionXCoords
    .filter(x => x <= textCenterPoint.x))
  // Find the closest intersection point in the positive-x direction to the text center point
  const firstXPointOnRight = Math.min(...intersectionXCoords
    .filter(x => x >= textCenterPoint.x))

  return {
    x: firstXPointOnLeft,
    /* We *would* expect a +h/2 here, but, remember that y-coordinates
     * are reversed in browsers compared to typical cartesian co-ordinates!
     */
    y: textCenterPoint.y - (height / 2),
    width: Math.abs(firstXPointOnLeft - firstXPointOnRight),
    height,
    textCenterPoint,
  }
}

/**
 * Draws the given text to the context within the bounds of the given text box rect.
 *
 * TODO: This currently only supports up to a maximum of two lines.
 */
export const drawTextToTextBoxRect = (ctx: CanvasRenderingContext2D, textBoxRect: TextBoxRect, text: string, textColor?: Color) => {
  const textMeasurer: TextSizeMeasurer = _text => {
    const textMetrics = ctx.measureText(_text)
    return {
      width: textMetrics.width,
      height: textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent,
    }
  }

  const fitTextResult = fitText(text, textBoxRect.width - 10, textBoxRect.height, textMeasurer)
  ctx.fillStyle = colorClassMap[textColor] ?? 'black'

  const getfillTextXCoord = (lineWidth: number) => (
    textBoxRect.textCenterPoint.x - Math.min(textBoxRect.textCenterPoint.x - lineWidth / 2 - textBoxRect.x - 3, 0)
  )

  ctx.save()
  if (fitTextResult.textLines.length === 1) {
    ctx.fillText(fitTextResult.textLines[0].text, getfillTextXCoord(fitTextResult.textLines[0].width), textBoxRect.textCenterPoint.y)
  }
  else {
    const lineHeightMid = measureTextLineHeight(ctx) / 2 + 2
    ctx.fillText(fitTextResult.textLines[0].text, getfillTextXCoord(fitTextResult.textLines[0].width), textBoxRect.textCenterPoint.y - lineHeightMid)
    ctx.fillText(fitTextResult.textLines[1].text, getfillTextXCoord(fitTextResult.textLines[1].width), textBoxRect.textCenterPoint.y + lineHeightMid)
  }
  ctx.restore()
}
