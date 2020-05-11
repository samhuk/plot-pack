import PositionedDatum from './types/PositionedDatum'
import { Axis2D } from '../../common/types/geometry'
import Datum from './types/Datum'
import ErrorBarsMode from './types/ErrorBarsMode'
import Options from './types/Options'

const DEFAULT_CAP_SIZE = 8
const DEFAULT_LINE_WIDTH = 1.5
const DEFAULT_LINE_COLOR = 'black'

export const getShouldShowErrorBars = (props: Options, seriesKey: string, axis: Axis2D) => (
  props.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.mode
    ?? props?.errorBarsOptions?.[axis]?.mode
) != null

const getCapSize = (props: Options, seriesKey: string, axis: Axis2D) => (
  props?.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.capSize
    ?? props?.errorBarsOptions?.[axis]?.capSize
    ?? DEFAULT_CAP_SIZE
)

const getLineWidth = (props: Options, seriesKey: string, axis: Axis2D) => (
  props?.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.lineWidth
    ?? props?.errorBarsOptions?.[axis]?.lineWidth
    ?? DEFAULT_LINE_WIDTH
)

const getColor = (props: Options, seriesKey: string, axis: Axis2D) => (
  props?.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.color
    ?? props?.errorBarsOptions?.[axis]?.color
    ?? DEFAULT_LINE_COLOR
)

export const getErrorBarsMode = (props: Options, seriesKey: string, axis: Axis2D) => (
  props?.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.mode
    ?? props?.errorBarsOptions?.[axis]?.mode
)

const normalizeDatumErrorBarsValues = (
  values: number | number[],
  plusValueIndex: number,
  minusValueIndex: number,
  isAbsoluteDifference: boolean,
) => (
  typeof values === 'number'
    ? values
    : [
      values[0],
      values[plusValueIndex] != null && values[0] != null
        ? isAbsoluteDifference ? values[0] + values[plusValueIndex] : (1 + values[plusValueIndex]) * values[0]
        : null,
      values[minusValueIndex] != null && values[0] != null
        ? isAbsoluteDifference ? values[0] - values[minusValueIndex] : (1 - values[minusValueIndex]) * values[0]
        : null,
    ]
)

const normalizeDatumErrorBarsValuesX = (
  datum: Datum,
  plusValueIndex: number,
  minusValueIndex: number,
  isAbsoluteDifference: boolean,
) => ({
  x: normalizeDatumErrorBarsValues(datum.x, plusValueIndex, minusValueIndex, isAbsoluteDifference),
  y: datum.y,
})

const normalizeDatumErrorBarsValuesY = (
  datum: Datum,
  plusValueIndex: number,
  minusValueIndex: number,
  isAbsoluteDifference: boolean,
) => ({
  x: datum.x,
  y: normalizeDatumErrorBarsValues(datum.y, plusValueIndex, minusValueIndex, isAbsoluteDifference),
})

/**
 * Inlined and left verbose for speed. This is looping over each datum,
 * so needs to be as fast as possible.
 */
export const normalizeDatumsErrorBarsValuesX = (datums: Datum[], errorBarsMode: ErrorBarsMode): Datum[] => {
  switch (errorBarsMode) {
    case ErrorBarsMode.TWO_ABSOLUTE_VALUE:
      return datums
    case ErrorBarsMode.ONE_ABSOLUTE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesX(d, 1, 1, true))
    case ErrorBarsMode.TWO_ABSOLUTE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesX(d, 1, 2, true))
    case ErrorBarsMode.ONE_RELATIVE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesX(d, 1, 1, false))
    case ErrorBarsMode.TWO_RELATIVE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesX(d, 1, 2, false))
    default:
      return datums
  }
}

/**
 * Inlined and left verbose for speed. This is looping over each datum,
 * so needs to be as fast as possible.
 */
export const normalizeDatumsErrorBarsValuesY = (datums: Datum[], errorBarsMode: ErrorBarsMode): Datum[] => {
  switch (errorBarsMode) {
    case ErrorBarsMode.TWO_ABSOLUTE_VALUE:
      return datums
    case ErrorBarsMode.ONE_ABSOLUTE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesY(d, 1, 1, true))
    case ErrorBarsMode.TWO_ABSOLUTE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesY(d, 1, 2, true))
    case ErrorBarsMode.ONE_RELATIVE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesY(d, 1, 1, false))
    case ErrorBarsMode.TWO_RELATIVE_DIFFERENCE:
      return datums.map(d => normalizeDatumErrorBarsValuesY(d, 1, 2, false))
    default:
      return datums
  }
}

export const normalizeDatumsErrorBarsValues = (datums: Datum[], props: Options, seriesKey: string) => (
  normalizeDatumsErrorBarsValuesY(
    normalizeDatumsErrorBarsValuesX(datums, getErrorBarsMode(props, seriesKey, Axis2D.X)),
    getErrorBarsMode(props, seriesKey, Axis2D.Y),
  )
)

const createErrorBarsPathY = (x: number, y1: number, y2: number, capSize: number) => {
  const path = new Path2D()
  const halfCapSize = capSize / 2
  if (halfCapSize > 0) {
    path.moveTo(x - halfCapSize, y1)
    path.lineTo(x + halfCapSize, y1)
    path.moveTo(x - halfCapSize, y2)
    path.lineTo(x + halfCapSize, y2)
  }
  path.moveTo(x, y1)
  path.lineTo(x, y2)
  return path
}

const createErrorBarsPathX = (y: number, x1: number, x2: number, capSize: number) => {
  const path = new Path2D()
  const halfCapSize = capSize / 2
  if (halfCapSize > 0) {
    path.moveTo(x1, y - halfCapSize)
    path.lineTo(x1, y + halfCapSize)
    path.moveTo(x2, y - halfCapSize)
    path.lineTo(x2, y + halfCapSize)
  }
  path.moveTo(x1, y)
  path.lineTo(x2, y)
  return path
}

const createDatumErrorBarsPathY = (datum: PositionedDatum, capSize: number) => (
  (datum.pY as number[])[1] != null && (datum.pY as number[])[2] != null
    ? createErrorBarsPathY(datum.fpX, (datum.pY as number[])[1], (datum.pY as number[])[2], capSize)
    : null
)

const createDatumErrorBarsPathX = (datum: PositionedDatum, capSize: number) => (
  (datum.pX as number[])[1] != null && (datum.pX as number[])[2] != null
    ? createErrorBarsPathX(datum.fpY, (datum.pX as number[])[1], (datum.pX as number[])[2], capSize)
    : null
)

const createDatumErrorBarsPath = (
  datum: PositionedDatum,
  capSize: number,
  axis: Axis2D,
) => {
  switch (axis) {
    case Axis2D.X:
      return createDatumErrorBarsPathX(datum, capSize)
    case Axis2D.Y:
      return createDatumErrorBarsPathY(datum, capSize)
    default:
      return null
  }
}

/**
 * Draws error bars for the given datum. This will assume that the
 * datum's error bars bounding position values are the second and third
 * index of the datum's position-space value, i.e. pX[1] and pX[2], and
 * pY[1] and pY[2]
 */
export const drawDatumErrorBarsForDatums = (
  ctx: CanvasRenderingContext2D,
  datums: PositionedDatum[],
  props: Options,
  seriesKey: string,
  axis: Axis2D,
) => {
  const lineWidth = getLineWidth(props, seriesKey, axis)

  if (lineWidth <= 0)
    return

  ctx.lineWidth = lineWidth
  ctx.strokeStyle = getColor(props, seriesKey, axis)
  const capSize = getCapSize(props, seriesKey, axis)

  datums.forEach(d => {
    const path = createDatumErrorBarsPath(
      d,
      capSize,
      axis,
    )
    // The path can be null if the datum was malformed,
    // I.e. it did not contain sufficient info for error bars
    if (path != null)
      ctx.stroke(path)
  })
}

export default drawDatumErrorBarsForDatums
