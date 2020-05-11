import { InputMargin, Margin } from './types'

export const getLeftMargin = (margin: InputMargin): number => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.left ?? 0)
  ) : 0
)

export const getRightMargin = (margin: InputMargin): number => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.right ?? 0)
  ) : 0
)

export const getTopMargin = (margin: InputMargin): number => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.top ?? 0)
  ) : 0
)

export const getBottomMargin = (margin: InputMargin): number => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.bottom ?? 0)
  ) : 0
)

export const getNormalizedMargin = (inputMargin: InputMargin): Margin => ({
  top: getTopMargin(inputMargin),
  bottom: getBottomMargin(inputMargin),
  left: getLeftMargin(inputMargin),
  right: getRightMargin(inputMargin),
})

export const getHorizontalMargin = (margin: InputMargin) => (margin != null
  ? (typeof margin === 'number'
    ? 2 * margin
    : (margin.left ?? 0) + (margin.right ?? 0)
  ) : 0
)

export const getVerticalMargin = (margin: InputMargin) => (margin != null
  ? (typeof margin === 'number'
    ? 2 * margin
    : (margin.top ?? 0) + (margin.bottom ?? 0)
  ) : 0
)
