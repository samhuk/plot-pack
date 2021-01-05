import Options from '../types/Options'
import { Point2D } from '../../../common/types/geometry'
import DatumScreenFocusPoint from '../types/DatumScreenFocusPoint'
import { Path, PathComponentType } from '../../../common/drawer/path/types'
import { CanvasDrawer } from '../../../common/drawer/types'
import { LineOptions } from '../../../common/types/canvas'
import AxesBound from '../types/AxesBound'
import { getRectOccludedLineBetweenTwoPointsUsingAxesBounds } from '../../../common/helpers/geometry'

const DEFAULT_LINE_OPTIONS: LineOptions = {
  color: 'black',
  lineWidth: 2,
  dashPattern: [],
}

/**
 * Determines whether a connecting line should be shown for the given series.
 */
export const getShouldShowConnectingLine = (props: Options, seriesKey: string) => (
  // Series visibility options takes precedence
  props.seriesOptions?.[seriesKey]?.visibilityOptions?.showConnectingLine
    // ...then general visibility options
    ?? props.visibilityOptions?.showConnectingLine
    // ...else default to false
    ?? false
)

export const drawConnectingLine = (
  drawer: CanvasDrawer,
  fromPosition: Point2D,
  toPosition: Point2D,
  props: Options,
  seriesKey: string,
) => {
  drawer.line([fromPosition, toPosition], props.seriesOptions?.[seriesKey]?.connectingLineOptions, DEFAULT_LINE_OPTIONS)
}

export const createDatumsConnectingLinePath = (
  datumScreenFocusPoints: DatumScreenFocusPoint[],
  screenBounds: AxesBound,
): Path => {
  if (datumScreenFocusPoints.length < 2)
    return null

  const path: Path = []

  for (let i = 1; i < datumScreenFocusPoints.length; i += 1) {
    const prevDatum = datumScreenFocusPoints[i - 1]
    const { fpX, fpY } = datumScreenFocusPoints[i]

    const linePoints = getRectOccludedLineBetweenTwoPointsUsingAxesBounds(
      { x: prevDatum.fpX, y: prevDatum.fpY },
      { x: fpX, y: fpY },
      screenBounds,
    )

    if (linePoints != null) {
      path.push({ type: PathComponentType.MOVE_TO, x: linePoints[0].x, y: linePoints[0].y })
      path.push({ type: PathComponentType.LINE_TO, x: linePoints[1].x, y: linePoints[1].y })
    }
  }

  return path
}

export const drawDatumsConnectingLine = (
  drawer: CanvasDrawer,
  datumScreenFocusPoints: DatumScreenFocusPoint[],
  axesScreenBounds: AxesBound,
  props: Options,
  seriesKey: string,
) => {
  drawer.path(
    createDatumsConnectingLinePath(datumScreenFocusPoints, axesScreenBounds),
    { lineOptions: props.seriesOptions?.[seriesKey]?.connectingLineOptions },
    { lineOptions: DEFAULT_LINE_OPTIONS },
  )
}

export default drawDatumsConnectingLine
