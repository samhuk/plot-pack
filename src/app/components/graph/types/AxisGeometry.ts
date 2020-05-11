/**
 * Geometric properties of an axis.
 *
 * @param vl Lower (minimum) value
 * @param vu Upper (maxiumum) value
 * @param pl Lower (minimum) pixel value
 * @param pu Upper (maximum) pixel value
 * @param dvGrid Grid spacing in the value units
 * @param dpGrid Grid spacing in pixel units
 * @param p Function to convert a value to a pixel position
 * @param v Function to convert a pixel position to a value
 * @param orthogonalScreenPosition Position of the axis in the orthogonal axis. For example,
 * for the X Axis, this would be it's vertical position (Y coordinate).
 * @param numGridLines Number of grid lines that fit on the axis for the
 * calculated dvGrid (i.e. this is something like (vl - vu) / dvGrid)
 */
export type AxisGeometry = {
  vl: number
  vu: number
  pl: number
  pu: number
  dvGrid: number
  dpGrid: number
  p: (v: number) => number
  v: (p: number) => number
  orthogonalScreenPosition: number
  numGridLines: number
}

export default AxisGeometry
