import Options from './types/Options'
import PositionedDatum from './types/PositionedDatum'

const DEFAULT_LINE_WIDTH = 2
const DEFAULT_COLOR = 'black'

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
  pX: number,
  pY: number,
  prevPx: number,
  prevPy: number,
  props: Options,
  seriesKey: string,
) => {
  const lineWidth = getConnectingLineLineWidth(props, seriesKey)
  if (lineWidth < 0)
    return

  ctx.strokeStyle = getConnectingLineColor(props, seriesKey)
  ctx.lineWidth = lineWidth

  const path = new Path2D()
  path.moveTo(prevPx, prevPy)
  path.lineTo(pX, pY)
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
