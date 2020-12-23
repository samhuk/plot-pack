import Options from '../types/Options'
import { Point2D } from '../../../common/types/geometry'
import DatumScreenFocusPoint from '../types/DatumScreenFocusPoint'
import { Path, PathComponentType } from '../../../common/drawer/path/types'
import { CanvasDrawer } from '../../../common/drawer/types'
import { LineOptions } from '../../../common/types/canvas'
import AxesBound from '../types/AxesBound'
import { getRectOccludedLineBetweenTwoPointsUsingAxesBounds } from '../../../common/helpers/geometry'

const DEFAULT_CONNECTING_LINE_LINE_OPTIONS: LineOptions = {
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

const getConnectingLineLineWidth = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.connectingLineOptions?.lineWidth
    ?? props.connectingLineOptions?.lineWidth
    ?? DEFAULT_CONNECTING_LINE_LINE_OPTIONS.lineWidth
)

const getConnectingLineColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.connectingLineOptions?.color
    ?? props.connectingLineOptions?.color
    ?? DEFAULT_CONNECTING_LINE_LINE_OPTIONS.color
)

export const drawConnectingLine = (
  ctx: CanvasRenderingContext2D,
  fromPosition: Point2D,
  toPosition: Point2D,
  props: Options,
  seriesKey: string,
) => {
  const lineWidth = getConnectingLineLineWidth(props, seriesKey)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getConnectingLineColor(props, seriesKey)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  path.moveTo(fromPosition.x, fromPosition.y)
  path.lineTo(toPosition.x, toPosition.y)
  ctx.stroke(path)
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
  const lineWidth = getConnectingLineLineWidth(props, seriesKey)
  if (lineWidth != null && lineWidth < 0)
    return

  drawer.applyLineOptions({
    color: getConnectingLineColor(props, seriesKey),
    lineWidth,
  }, DEFAULT_CONNECTING_LINE_LINE_OPTIONS)

  const path = createDatumsConnectingLinePath(datumScreenFocusPoints, axesScreenBounds)
  drawer.path(path)
}

export default drawDatumsConnectingLine
