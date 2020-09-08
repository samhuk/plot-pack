import Datum from '../types/Datum'
import DatumFocusPointDeterminationMode from '../types/DatumFocusPointDeterminationMode'
import DatumValueFocusPoint from '../types/DatumValueFocusPoint'
import { calculateMean } from '../../../common/helpers/stat'
import AxesBound from '../types/AxesBound'
import { Axis2D } from '../../../common/types/geometry'
import { isInRangeOptionalBounds } from '../../../common/helpers/math'
import ProcessedDatum from '../types/ProcessedDatum'
import PositionedDatumValueFocusPoint from '../types/PositionedDatumValueFocusPoint'
import FocusedDatum from '../types/FocusedDatum'

export const positionDatumValueFocusPoints = (
  datumValueFocusPoints: DatumValueFocusPoint[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
): PositionedDatumValueFocusPoint[] => datumValueFocusPoints.map(valueFocusPoint => ({
  fvX: valueFocusPoint.fvX,
  fvY: valueFocusPoint.fvY,
  fpX: xAxisPFn(valueFocusPoint.fvX),
  fpY: yAxisPFn(valueFocusPoint.fvY),
}))

const determineDatumValueFocusPoint = (
  datum: Datum,
  datumFocusPointDeterminationMode: DatumFocusPointDeterminationMode,
): DatumValueFocusPoint => {
  const { x, y } = datum
  const isXNumber = typeof x === 'number'
  const isYNumber = typeof y === 'number'

  switch (datumFocusPointDeterminationMode ?? DatumFocusPointDeterminationMode.FIRST) {
    case DatumFocusPointDeterminationMode.FIRST:
      return {
        fvX: isXNumber ? (x as number) : (x as number[])[0],
        fvY: isYNumber ? (y as number) : (y as number[])[0],
      }
    case DatumFocusPointDeterminationMode.SECOND:
      return {
        fvX: isXNumber ? (x as number) : (x as number[])[1],
        fvY: isYNumber ? (y as number) : (y as number[])[1],
      }
    case DatumFocusPointDeterminationMode.AVERAGE:
      return {
        fvX: isXNumber ? (x as number) : calculateMean(x as number[]),
        fvY: isYNumber ? (y as number) : calculateMean(y as number[]),
      }
    default:
      return null
  }
}

const mapDatumValueCoordinateToScreenPositionValue = (value: number | number[], transformationFunction: (value: number) => number) => (
  value == null
    ? null
    : (typeof value === 'number'
      ? transformationFunction(value)
      : value.map(subValue => (subValue != null ? transformationFunction(subValue) : null))
    )
)

export const filterFocusedDatumsOutsideOfAxesBounds = (
  focusedDatums: FocusedDatum[],
  axesValueBounds: AxesBound,
): Datum[] => focusedDatums.filter(d => (
  isInRangeOptionalBounds(d.fvX, axesValueBounds[Axis2D.X]?.lower, axesValueBounds[Axis2D.X]?.upper)
    && isInRangeOptionalBounds(d.fvY, axesValueBounds[Axis2D.Y]?.lower, axesValueBounds[Axis2D.Y]?.upper)
))

/**
 * Maps a list of datums to focused datums, via a focus point determinination mode
 * @param datums List of datums
 * @param datumValueFocusPointDeterminationMode The method which to determine the
 * focus point of the datums. Can be chosen to use the first point as the focus point, second,
 * custom function.
 */
export const calculateFocusedDatums = (
  datums: Datum[],
  datumValueFocusPointDeterminationMode: DatumFocusPointDeterminationMode | ((datum: Datum) => DatumValueFocusPoint),
): FocusedDatum[] => datums.map(datum => {
  const { fvX, fvY } = typeof datumValueFocusPointDeterminationMode === 'function'
    ? datumValueFocusPointDeterminationMode(datum)
    : determineDatumValueFocusPoint(datum, datumValueFocusPointDeterminationMode)
  return { x: datum.x, y: datum.y, fvX, fvY }
})

/**
 * Maps a list of Datums to ProcessedDatums
 *
 * @param datums List of Datums
 * @param xAxisPFn Function that transforms an x value into a screen x-position
 * @param yAxisPFn Function that transforms a y value into a screen y-position
 */
export const calculateProcessedDatums = (
  focusedDatums: FocusedDatum[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
): ProcessedDatum[] => focusedDatums.map(d => ({
  x: d.x,
  y: d.y,
  pX: mapDatumValueCoordinateToScreenPositionValue(d.x, xAxisPFn),
  pY: mapDatumValueCoordinateToScreenPositionValue(d.y, yAxisPFn),
  fvX: d.fvX,
  fvY: d.fvY,
  fpX: xAxisPFn(d.fvX),
  fpY: yAxisPFn(d.fvY),
}))
