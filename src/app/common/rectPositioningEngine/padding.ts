import { Rect } from '../types/geometry'
import { InputPadding, Padding } from './types'

export const getLeftPadding = (padding: InputPadding): number => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.left ?? 0)
  ) : 0
)

export const getRightPadding = (padding: InputPadding): number => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.right ?? 0)
  ) : 0
)

export const getTopPadding = (padding: InputPadding): number => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.top ?? 0)
  ) : 0
)

export const getBottomPadding = (padding: InputPadding): number => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.bottom ?? 0)
  ) : 0
)

export const getHorizontalPadding = (padding: InputPadding): number => (padding != null
  ? (typeof padding === 'number'
    ? 2 * padding
    : (padding.left ?? 0) + (padding.right ?? 0)
  ) : 0
)

export const getVerticalPadding = (padding: InputPadding): number => (padding != null
  ? (typeof padding === 'number'
    ? 2 * padding
    : (padding.top ?? 0) + (padding.bottom ?? 0)
  ) : 0
)

export const getNormalizedPadding = (inputPadding: InputPadding): Padding => ({
  top: getTopPadding(inputPadding),
  bottom: getBottomPadding(inputPadding),
  left: getLeftPadding(inputPadding),
  right: getRightPadding(inputPadding),
})

/**
 * Outwardly pads the given rect by the given padding
 */
export const outwardPadRect = (rect: Rect, padding: InputPadding): Rect => {
  const _padding = getNormalizedPadding(padding)
  return {
    x: rect.x - _padding.left,
    y: rect.y - _padding.top,
    height: rect.height + (_padding.top + _padding.bottom),
    width: rect.width + (_padding.left + _padding.right),
  }
}

export const inwardPadRect = (rect: Rect, padding: InputPadding) => {
  const _padding = getNormalizedPadding(padding)
  return {
    x: rect.x + _padding.left,
    y: rect.y + _padding.top,
    width: Math.max(0, rect.width - (_padding.left + _padding.right)),
    height: Math.max(0, rect.height - (_padding.top + _padding.bottom)),
  }
}
