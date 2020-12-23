import ProcessedDatum from '../types/ProcessedDatum'
import { Axis2D } from '../../../common/types/geometry'
import Datum from '../types/Datum'
import ErrorBarsMode from '../types/ErrorBarsMode'
import Options from '../types/Options'
import { CanvasDrawer } from '../../../common/drawer/types'
import { LineOptions } from '../../../common/types/canvas'
import { Path, PathComponentType } from '../../../common/drawer/path/types'
import { isPositionInAxesBounds } from '../../../common/helpers/geometry'
import AxesBound from '../types/AxesBound'

const DEFAULT_LINE_OPTIONS: LineOptions = {
  lineWidth: 1.5,
  color: 'black',
  dashPattern: [],
}

const DEFAULT_CAP_SIZE = 8

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
)

const getColor = (props: Options, seriesKey: string, axis: Axis2D) => (
  props?.seriesOptions?.[seriesKey]?.errorBarsOptions?.[axis]?.color
    ?? props?.errorBarsOptions?.[axis]?.color
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

export const normalizeDatumsErrorBarsValues = (datums: Datum[], props: Options, seriesKey: string) => {
  const _datums = normalizeDatumsErrorBarsValuesX(datums, getErrorBarsMode(props, seriesKey, Axis2D.X))
  return normalizeDatumsErrorBarsValuesY(_datums, getErrorBarsMode(props, seriesKey, Axis2D.Y))
}

const createErrorBarsPathY = (x: number, y1: number, y2: number, capSize: number): Path => {
  const path: Path = []
  const halfCapSize = capSize / 2
  if (halfCapSize > 0) {
    path.push(
      { type: PathComponentType.MOVE_TO, x: x - halfCapSize, y: y1 },
      { type: PathComponentType.LINE_TO, x: x + halfCapSize, y: y1 },
      { type: PathComponentType.MOVE_TO, x: x - halfCapSize, y: y2 },
      { type: PathComponentType.LINE_TO, x: x + halfCapSize, y: y2 },
    )
  }
  path.push(
    { type: PathComponentType.MOVE_TO, x, y: y1 },
    { type: PathComponentType.LINE_TO, x, y: y2 },
  )
  return path
}

const createErrorBarsPathX = (y: number, x1: number, x2: number, capSize: number): Path => {
  const path: Path = []
  const halfCapSize = capSize / 2
  if (halfCapSize > 0) {
    path.push(
      { type: PathComponentType.MOVE_TO, x: x1, y: y - halfCapSize },
      { type: PathComponentType.LINE_TO, x: x1, y: y + halfCapSize },
      { type: PathComponentType.MOVE_TO, x: x2, y: y - halfCapSize },
      { type: PathComponentType.LINE_TO, x: x2, y: y + halfCapSize },
    )
  }
  path.push(
    { type: PathComponentType.MOVE_TO, x: x1, y },
    { type: PathComponentType.LINE_TO, x: x2, y },
  )
  return path
}

const createDatumErrorBarsPathY = (datum: ProcessedDatum, capSize: number) => (
  Array.isArray(datum.pY) && datum.pY[1] != null && datum.pY[2] != null
    ? createErrorBarsPathY(datum.fpX, (datum.pY as number[])[1], (datum.pY as number[])[2], capSize)
    : null
)

const createDatumErrorBarsPathX = (datum: ProcessedDatum, capSize: number) => (
  Array.isArray(datum.pX) && datum.pX[1] != null && datum.pX[2] != null
    ? createErrorBarsPathX(datum.fpY, (datum.pX as number[])[1], (datum.pX as number[])[2], capSize)
    : null
)

const createDatumErrorBarsPathCreator = (axis: Axis2D) => {
  switch (axis) {
    case Axis2D.X:
      return (datum: ProcessedDatum, capSize: number) => createDatumErrorBarsPathX(datum, capSize)
    case Axis2D.Y:
      return (datum: ProcessedDatum, capSize: number) => createDatumErrorBarsPathY(datum, capSize)
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
  drawer: CanvasDrawer,
  datums: ProcessedDatum[],
  props: Options,
  seriesKey: string,
  axesScreenBounds: AxesBound,
  axis: Axis2D,
) => {
  const lineWidth = getLineWidth(props, seriesKey, axis)

  if (lineWidth <= 0)
    return

  drawer.applyLineOptions({ color: getColor(props, seriesKey, axis), lineWidth }, DEFAULT_LINE_OPTIONS)

  const capSize = getCapSize(props, seriesKey, axis)

  const pathCreator = createDatumErrorBarsPathCreator(axis)

  datums
    // Filter out datums that are out of view
    .filter(d => isPositionInAxesBounds({ x: d.fpX, y: d.fpY }, axesScreenBounds))
    // draw each datum
    .forEach(d => drawer.path(pathCreator(d, capSize)))
}

export default drawDatumErrorBarsForDatums
