import UnfocusedPositionedDatum from './UnfocusedPositionedDatum'
import DatumFocusPoint from './DatumFocusPoint'

/**
 * A positioned datum. This contains the position of a datum in both
 * value space (i.e. a datum's "value") and in screen-position space
 * (i.e. the datum's position on the screen).
 * @param vX x value(s) in value-space
 * @param vY y value(s) in  value-space
 * @param pX x value in screen-space
 * @param pY y value in screen-space
 * @param fvX x focus value in value-space
 * @param fvY y focus value in value-space
 * @param fpX x focus value in screen-space
 * @param fpY y focus value in screen-space
 */
export type PositionedDatum = UnfocusedPositionedDatum & DatumFocusPoint

export default PositionedDatum
