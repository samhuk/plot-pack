import Options from './types/Options'

const DEFAULT_LINE_WIDTH = 2

const getConnectingLineLineWidth = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.lineOptions?.width
    ?? props.connectingLineOptions?.lineWidth
    ?? DEFAULT_LINE_WIDTH
)

const getConnectingLineColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.lineOptions?.color
    ?? props.connectingLineOptions?.color
    ?? 'black'
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
