/**
 * The possible ways that a datum focus point (along a given axis) is determined. A
 * focus point can be thought of as a point that can be considered as the "center"
 * of the datum. It is the point that is used when snapping to a datum (i.e. where the
 * datum highlight appears), where the connecting line routes through, and so on.
 */
export enum DatumFocusPointDeterminationMode {
  /**
   * Take the first value as the focus point.
   */
  FIRST = 'first',
  /**
   * Take the second value as the focus point.
   */
  SECOND = 'second',
  /**
   * Take the mean average value of the datum values as the focus point.
   */
  AVERAGE = 'average',
}

export default DatumFocusPointDeterminationMode
