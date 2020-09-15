import { Path, PathComponentType } from './types'
import { Rect } from '../../types/geometry'

export const createRoundedRectPath = (
  rect: Rect,
  cornerRadii: number | { topLeft?: number, topRight?: number, bottomLeft?: number, bottomRight?: number },
): Path => {
  const _cornerRadii = typeof cornerRadii === 'number'
    ? { topLeft: cornerRadii, topRight: cornerRadii, bottomLeft: cornerRadii, bottomRight: cornerRadii }
    : {
      topLeft: cornerRadii.topLeft ?? 0,
      topRight: cornerRadii.topRight ?? 0,
      bottomLeft: cornerRadii.bottomLeft ?? 0,
      bottomRight: cornerRadii?.bottomRight ?? 0,
    }
  const { x, y, height, width } = rect

  return [
    { type: PathComponentType.MOVE_TO, x: x + _cornerRadii.topLeft, y },
    { type: PathComponentType.LINE_TO, x: x + width - _cornerRadii.topRight, y },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x: x + width, y }, pos: { x: x + width, y: y + _cornerRadii.topRight } },
    { type: PathComponentType.LINE_TO, x: x + width, y: y + height - _cornerRadii.bottomRight },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x: x + width, y: y + height }, pos: { x: x + width - _cornerRadii.bottomRight, y: y + height } },
    { type: PathComponentType.LINE_TO, x: x + _cornerRadii.bottomLeft, y: y + height },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x, y: y + height }, pos: { x, y: y + height - _cornerRadii.bottomLeft } },
    { type: PathComponentType.LINE_TO, x, y: y + _cornerRadii.topLeft },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x, y }, pos: { x: x + _cornerRadii.topLeft, y } },
  ]
}
