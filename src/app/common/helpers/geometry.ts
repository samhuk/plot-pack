import { Rect, BoundingRect, Point2D, Axis2D, Directions2DOptional, Directions2D, Corners2D, Corners2DOptional } from '../types/geometry'
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

export const isMouseEventInRect = (cursorPositionFromEvent: { offsetX: number, offsetY: number }, rect: Rect) => (
  isPositionInRect({ x: cursorPositionFromEvent.offsetX, y: cursorPositionFromEvent.offsetY }, rect)
)

export const isPositionInAxesBounds = (position: Point2D, axesBounds: AxesBound) => (
  isInRange(axesBounds[Axis2D.X].lower, axesBounds[Axis2D.X].upper, position.x)
    && isInRange(axesBounds[Axis2D.Y].lower, axesBounds[Axis2D.Y].upper, position.y)
)

/**
 * Determines the two points that form the connecting line between `point1` and `point2`
 * that is only visible within the provided `rect`. One could say that this is a form
 * of "projection".
 */
export const getRectRestrictedLineBetweenTwoPoints = (point1: Point2D, point2: Point2D, rect: Rect): [Point2D, Point2D] => {
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
   * the two given points. This always leaves us with either 0, 1, or 2 points.
   */
  const intersectionPoints = [
    isInRange(y0, y1, intersectionX0.y) ? intersectionX0 : null,
    isInRange(y0, y1, intersectionX1.y) ? intersectionX1 : null,
    isInRange(x0, x1, intersectionY0.x) ? intersectionY0 : null,
    isInRange(x0, x1, intersectionY1.x) ? intersectionY1 : null,
  ].filter(p => p != null && isInRange(point1.x, point2.x, p.x))

  // If none of the line between the two points is inside the rect
  if (intersectionPoints.length === 0)
    return null

  return [
    // Since length != 0, will always be defined
    intersectionPoints[0],
    /* If only one point was inside the rect, then there will be only 1
     * intersection point, and so if undefined, will use the point inside the rect
     */
    intersectionPoints[1] != null
      ? intersectionPoints[1]
      : (isPoint1InRect ? point1 : point2),
  ]
}

/**
 * Determines the two points that form the connecting line between `point1` and `point2`
 * that is only visible within the rect that is defined by the given `axesBounds`.
 * One could say that this is a form of "projection".
 */
export const getRectRestrictedLineBetweenTwoPointsUsingAxesBounds = (
  point1: Point2D,
  point2: Point2D,
  axesBounds: AxesBound,
): [Point2D, Point2D] => {
  // Construct rect from given axes bounds
  const x0 = axesBounds[Axis2D.X].lower
  const x1 = axesBounds[Axis2D.X].upper
  const y0 = axesBounds[Axis2D.Y].lower
  const y1 = axesBounds[Axis2D.Y].upper
  const rect: Rect = { x: x0, y: y0, height: y1 - y0, width: x1 - x0 }
  // Call the base function with the constructed rect
  return getRectRestrictedLineBetweenTwoPoints(point1, point2, rect)
}

/**
 * Determines if the given object has a directional property, i.e.
 * has either .left, .right, .top, or .bottom defined.
 */
export const isObjDirectional = (obj: any) => {
  if (obj == null)
    return false

  const _obj = obj as Directions2DOptional<any>
  return _obj?.left != null
    || _obj?.right != null
    || _obj?.top != null
    || _obj?.bottom != null
}

/**
 * Determines if the given object has a corners property, i.e.
 * has either .topRight, .topLeft, .bottomRight, or .bottomLeft defined.
 */
const isObjCorners = (obj: any) => {
  if (obj == null)
    return false

  const _obj = obj as Corners2D<any>
  return _obj?.topLeft != null
    || _obj?.topRight != null
    || _obj?.bottomLeft != null
    || _obj?.bottomRight != null
}

/**
 * normalizes the given object, which could either be type T or a directional
 * object of type T to a directional object only.
 */
export const normalizeDirectionsObject = <T extends any>(
  potentialDirectionsObj: T | Directions2DOptional<T>,
  defaultForUndefined?: T,
): Directions2D<T> => {
  if (isObjDirectional(potentialDirectionsObj)) {
    const directionsObj = potentialDirectionsObj as Directions2D<T>
    return {
      top: directionsObj.top ?? defaultForUndefined,
      bottom: directionsObj.bottom ?? defaultForUndefined,
      left: directionsObj.left ?? defaultForUndefined,
      right: directionsObj.right ?? defaultForUndefined,
    }
  }

  const directionsValue = potentialDirectionsObj as T
  return {
    left: directionsValue ?? defaultForUndefined,
    right: directionsValue ?? defaultForUndefined,
    top: directionsValue ?? defaultForUndefined,
    bottom: directionsValue ?? defaultForUndefined,
  }
}

/**
 * normalizes the given object, which could either be type T or a corners
 * object of type T to a corners object only.
 */
export const normalizeCornersObject = <T extends any>(
  potentialCornersObj: T | Corners2DOptional<T>,
  defaultForUndefined?: T,
): Corners2D<T> => {
  if (isObjCorners(potentialCornersObj)) {
    const cornersObj = potentialCornersObj as Corners2DOptional<T>
    return {
      topLeft: cornersObj.topLeft ?? defaultForUndefined,
      topRight: cornersObj.topRight ?? defaultForUndefined,
      bottomLeft: cornersObj.bottomLeft ?? defaultForUndefined,
      bottomRight: cornersObj.bottomRight ?? defaultForUndefined,
    }
  }
  const cornersValue = potentialCornersObj as T
  return {
    topLeft: cornersValue ?? defaultForUndefined,
    topRight: cornersValue ?? defaultForUndefined,
    bottomLeft: cornersValue ?? defaultForUndefined,
    bottomRight: cornersValue ?? defaultForUndefined,
  }
}
