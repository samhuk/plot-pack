import Options from './types/Options'
import PositionedDatum from './types/PositionedDatum'
import { Point2D } from '../../common/types/geometry'

const DEFAULT_LINE_WIDTH = 2
const DEFAULT_COLOR = 'black'

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
    ?? DEFAULT_LINE_WIDTH
)

const getConnectingLineColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.connectingLineOptions?.color
    ?? props.connectingLineOptions?.color
    ?? DEFAULT_COLOR
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

const createDatumsConnectingLinePath = (positionedDatums: PositionedDatum[]): Path2D => {
  if (positionedDatums.length < 2)
    return null

  const path = new Path2D()

  for (let i = 1; i < positionedDatums.length; i += 1) {
    const prevDatum = positionedDatums[i - 1]
    const { fpX, fpY } = positionedDatums[i]
    path.moveTo(prevDatum.fpX, prevDatum.fpY)
    path.lineTo(fpX, fpY)
  }

  return path
}

export const drawDatumsConnectingLine = (
  ctx: CanvasRenderingContext2D,
  positionedDatums: PositionedDatum[],
  props: Options,
  seriesKey: string,
) => {
  const lineWidth = getConnectingLineLineWidth(props, seriesKey)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getConnectingLineColor(props, seriesKey)
  ctx.lineWidth = lineWidth

  const path = createDatumsConnectingLinePath(positionedDatums)

  if (path !== null)
    ctx.stroke(path)
}

export default drawDatumsConnectingLine
