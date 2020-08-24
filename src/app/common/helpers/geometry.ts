import { Rect, BoundingRect, Point2D } from '../types/geometry'
import { isInRange } from './math'

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
