import { Rect, BoundingRect } from '../types/geometry'

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
