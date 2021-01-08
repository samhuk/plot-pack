import DatumScreenFocusPoint from './DatumScreenFocusPoint'
import Datum from './Datum'
import DatumScreenPosition from './DatumScreenPosition'
import DatumValueFocusPoint from './DatumValueFocusPoint'

/**
 * A fully processed datum, complete with the original datum value(s), the datum
 * screen position(s) datum, and the value and screen focus points.
 * @param x x value(s) in value-space
 * @param y y value(s) in value-space
 * @param pX x value(s) in screen-space
 * @param pY y value(s) in screen-space
 * @param fvX x focus value in value-space
 * @param fvY y focus value in value-space
 * @param fpX x focus value in screen-space
 * @param fpY y focus value in screen-space
 */
export type ProcessedDatum = Datum & DatumScreenPosition & DatumValueFocusPoint & DatumScreenFocusPoint

export default ProcessedDatum
