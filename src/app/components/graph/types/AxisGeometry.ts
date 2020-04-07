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
 * @param pOrigin Position of the origin (i.e. `p(0)`) on the axis. This is constrained
 * to between pl and pu (the bounds of p values)
 * @param numGridLines Number of grid lines that fit on the axis for the
 * calculated dvGrid (i.e. this is `Math.abs((vl - vu) / dvGrid)`
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
  pOrigin: number
  numGridLines: number
}

export default AxisGeometry
