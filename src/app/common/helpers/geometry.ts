import { Rect, BoundingRect, Point2D, Axis2D } from '../types/geometry'
import { isInRange } from './math'
import AxesBound from '../../components/chart/types/AxesBound'

export const getBoundingRectOfRects = (rects: Rect[]): BoundingRect => {
  if (rects.length === 0)
    return { left: 0, right: 0, top: 0, bottom: 0 }

  const firstRect = rects[0]

  let left = firstRect.x
  let right = firstRect.x + firstRect.width
  let top = firstRect.y - firstRect.height
  let bottom = firstRect.y

  rects.forEach(rect => {
    if (rect.x < left)
      left = rect.x
    if (rect.x + rect.width > right)
      right = rect.x + rect.width
    if (rect.y - rect.height < top)
      top = rect.y - rect.height
    if (rect.y > bottom)
      bottom = rect.y
  })

  return { left, right, top, bottom }
}

export const isPositionInRect = (position: Point2D, rect: Rect) => (
  isInRange(rect.x, rect.x + rect.width, position.x)
    && isInRange(rect.y, rect.y + rect.height, position.y)
)

export const isPositionInAxesBounds = (position: Point2D, axesBounds: AxesBound) => (
  isInRange(axesBounds[Axis2D.X].lower, axesBounds[Axis2D.X].upper, position.x)
    && isInRange(axesBounds[Axis2D.Y].lower, axesBounds[Axis2D.Y].upper, position.y)
)

export const getRectRestrictedLineOfTwoPoints = (point1: Point2D, point2: Point2D, rect: Rect): [Point2D, Point2D] => {
  // Get the bounds of each axis from given rect
  const x0 = rect.x
  const x1 = rect.x + rect.width
  const y0 = rect.y
  const y1 = rect.y + rect.height

  // Determine which point(s) are inside the rect
  const isPoint1InRect = isPositionInRect(point1, rect)
  const isPoint2InRect = isPositionInRect(point2, rect)

  // If both points are in rect, then the line between them is all inside the rect
  if (isPoint1InRect && isPoint2InRect)
    return [point1, point2]

  // If only one of the points is in rect, then only part of the line is inside the rect
  if ((isPoint1InRect && !isPoint2InRect) || (!isPoint1InRect && isPoint2InRect)) {
    // Determine the line equation from the given two points
    const m = (point2.y - point1.y) / (point2.x - point1.x)
    const py = (x: number) => (m * (x - point1.x)) + point1.y
    const px = (y: number) => ((1 / m) * (y - point1.y)) + point1.x
    // Determine intersection points of the four rect lines with the above line equation
    const intersectionX0 = { x: x0, y: py(x0) }
    const intersectionX1 = { x: x1, y: py(x1) }
    const intersectionY0 = { x: px(y0), y: y0 }
    const intersectionY1 = { x: px(y1), y: y1 }
    /* Filter out intersection points that lie outside the rect or do not lie inbetween
     * the two given points. This always leave us with exactly one point.
     */
    const intersectionPoint = [
      isInRange(y0, y1, intersectionX0.y) ? intersectionX0 : null,
      isInRange(y0, y1, intersectionX1.y) ? intersectionX1 : null,
      isInRange(x0, x1, intersectionY0.x) ? intersectionY0 : null,
      isInRange(x0, x1, intersectionY1.x) ? intersectionY1 : null,
    ].filter(p => p != null)
      .filter(p => isInRange(point1.x, point2.x, p.x))

    return [
      intersectionPoint[0],
      isPoint1InRect ? point1 : point2,
    ]
  }

  return null
}

export const getRectRestrictedLineOfTwoPointsUsingAxesBounds = (
  point1: Point2D,
  point2: Point2D,
  axesBounds: AxesBound,
): [Point2D, Point2D] => {
  const x0 = axesBounds[Axis2D.X].lower
  const x1 = axesBounds[Axis2D.X].upper
  const y0 = axesBounds[Axis2D.Y].lower
  const y1 = axesBounds[Axis2D.Y].upper

  const rect: Rect = { x: x0, y: y0, height: y1 - y0, width: x1 - x0 }

  return getRectRestrictedLineOfTwoPoints(point1, point2, rect)
}
