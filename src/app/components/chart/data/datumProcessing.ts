import Datum from '../types/Datum'
import DatumFocusPointDeterminationMode from '../types/DatumFocusPointDeterminationMode'
import DatumValueFocusPoint from '../types/DatumValueFocusPoint'
import { calculateMean } from '../../../common/helpers/stat'
import AxesBound from '../types/AxesBound'
import { Axis2D } from '../../../common/types/geometry'
import { isInRange } from '../../../common/helpers/math'
import ProcessedDatum from '../types/ProcessedDatum'
import PositionedDatumValueFocusPoint from '../types/PositionedDatumValueFocusPoint'

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
  typeof value === 'number'
    ? (value != null ? transformationFunction(value as number) : null)
    : (value as number[]).map(subValue => (subValue != null ? transformationFunction(subValue) : null))
)

/**
 * Maps a list of Datums to ProcessedDatums
 *
 * @param datums List of Datums
 * @param xAxisPFn Function that transforms an x value into a screen x-position
 * @param yAxisPFn Function that transforms a y value into a screen y-position
 * @param axesValueBound The value bounds of the x and y axes
 * @param datumValueFocusPointDeterminationMode The method which to determine the
 * focus point of the datums. Can be chosen to use the first point as the focus point, second,
 * custom function.
 */
export const calculateProcessedDatums = (
  datums: Datum[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
  axesValueBound: AxesBound,
  datumValueFocusPointDeterminationMode: DatumFocusPointDeterminationMode | ((datum: Datum) => DatumValueFocusPoint),
): ProcessedDatum[] => datums
  .filter(({ x, y }) => {
    const vlX = axesValueBound[Axis2D.X].lower
    const vuX = axesValueBound[Axis2D.X].upper
    const vlY = axesValueBound[Axis2D.Y].lower
    const vuY = axesValueBound[Axis2D.Y].upper
    return (
      typeof x === 'number' ? isInRange(vlX, vuX, x) : (isInRange(vlX, vuX, Math.min(...x)) || isInRange(vlX, vuX, Math.max(...x)))
    ) && (
      typeof y === 'number' ? isInRange(vlY, vuY, y) : (isInRange(vlY, vuY, Math.min(...y)) || isInRange(vlY, vuY, Math.max(...y)))
    )
  })
  .map(datum => {
    const datumValueFocusPoint = typeof datumValueFocusPointDeterminationMode === 'function'
      ? datumValueFocusPointDeterminationMode(datum)
      : determineDatumValueFocusPoint(datum, datumValueFocusPointDeterminationMode)
    return {
      x: datum.x,
      y: datum.y,
      pX: mapDatumValueCoordinateToScreenPositionValue(datum.x, xAxisPFn),
      pY: mapDatumValueCoordinateToScreenPositionValue(datum.y, yAxisPFn),
      fvX: datumValueFocusPoint.fvX,
      fvY: datumValueFocusPoint.fvY,
      fpX: xAxisPFn(datumValueFocusPoint.fvX),
      fpY: yAxisPFn(datumValueFocusPoint.fvY),
    }
  })
